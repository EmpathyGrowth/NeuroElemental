/**
 * Stripe Webhook Handler
 * POST: Handle Stripe webhook events for subscription and payment updates
 *
 * IMPORTANT: This endpoint must be configured in your Stripe Dashboard
 * Configure webhook URL: https://your-domain.com/api/billing/webhook
 */

import { createPublicRoute, badRequestError, successResponse } from '@/lib/api'
import { validateStripeWebhook, syncSubscriptionFromStripe } from '@/lib/billing'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils'
import Stripe from 'stripe'

/** Organization subscription lookup result */
interface OrgSubscriptionLookup {
  organization_id: string;
}

/** Subscription update data */
interface SubscriptionUpdateData {
  status: string;
  canceled_at: string;
  updated_at: string;
}

/** Extended invoice type with subscription property (for API version compatibility) */
interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | { id: string } | null;
  paid?: boolean;
}

// Force dynamic rendering for webhooks
export const dynamic = 'force-dynamic'

/**
 * Handle Stripe webhook events
 * Validates signature and processes subscription/payment events
 */
export const POST = createPublicRoute(async (request, _context) => {
  // Get raw body for signature validation
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    logger.error('Missing stripe-signature header')
    throw badRequestError('Missing stripe-signature header')
  }

  // Validate webhook signature
  const event = validateStripeWebhook(body, signature)

  if (!event) {
    logger.error('Invalid webhook signature')
    throw badRequestError('Invalid webhook signature')
  }

  logger.info(`[Webhook] Received event: ${event.type}`, {
    data: {
      eventId: event.id,
      created: new Date(event.created * 1000).toISOString(),
    }
  })

  // Log webhook event to database
  await logWebhookEvent(event)

  // Handle different event types
  // Handlers throw on failure, which causes Stripe to retry
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event)
        break

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event)
        break

      case 'payment_method.detached':
        await handlePaymentMethodDetached(event)
        break

      default:
        logger.info(`[Webhook] Unhandled event type: ${event.type}`)
    }
  } catch (handlerError) {
    // Log the error for debugging but re-throw so Stripe knows to retry
    const err = handlerError instanceof Error ? handlerError : new Error(String(handlerError))
    logger.error(`[Webhook] Failed to process ${event.type}`, err, {
      data: { eventId: event.id }
    })
    throw err
  }

  // Return 200 to acknowledge receipt
  return successResponse({ received: true })
})

/**
 * Log webhook event to database for audit trail
 * Uses activity_logs table for billing event tracking
 * Note: This is non-critical logging - failures don't block webhook processing
 */
async function logWebhookEvent(event: Stripe.Event): Promise<void> {
  try {
    // Extract only safe, non-PII fields for logging
    // Cast to unknown first to safely access properties
    const eventObject = event.data.object as unknown as Record<string, unknown>

    // Get organization ID from subscription metadata if available
    const subscriptionMetadata = eventObject.metadata as Record<string, string> | undefined
    const organizationId = subscriptionMetadata?.organization_id

    // Only log if we have an organization context
    if (organizationId) {
      const { logActivity } = await import('@/lib/db')
      await logActivity({
        organization_id: organizationId,
        action_type: `billing.${event.type}`,
        entity_type: 'billing_event',
        entity_id: event.id,
        description: `Billing event: ${event.type}`,
        metadata: {
          // Only log safe identifiers, not full event data (may contain PII)
          object_id: String(eventObject.id ?? ''),
          object_type: String(eventObject.object ?? ''),
          customer_id: typeof eventObject.customer === 'string' ? eventObject.customer : null,
          subscription_id: typeof eventObject.subscription === 'string' ? eventObject.subscription : null,
          status: String(eventObject.status ?? ''),
        },
      })
    } else {
      // Log without organization context for events without metadata
      logger.info(`[Webhook] Billing event ${event.type} (no org context)`, {
        data: {
          eventId: event.id,
          objectId: String(eventObject.id ?? ''),
        }
      })
    }
  } catch (error) {
    // Non-critical: Log failure but don't block webhook processing
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('[Webhook] Error logging event to audit trail (non-critical)', err)
  }
}

/**
 * Handle subscription created or updated
 * Throws on failure to trigger Stripe retry
 */
async function handleSubscriptionChange(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription

  logger.info('[Webhook] Processing subscription change', {
    data: {
      subscriptionId: subscription.id,
      status: subscription.status,
      customerId: subscription.customer,
    }
  })

  // Sync subscription to database
  const result = await syncSubscriptionFromStripe(subscription.id)

  if (!result.success) {
    const errorMsg = result.error instanceof Error ? result.error.message : String(result.error)
    throw new Error(`Failed to sync subscription: ${errorMsg}`)
  }

  // Get organization from metadata
  const organizationId = subscription.metadata.organization_id

  if (organizationId) {
    // Log activity (non-critical, wrapped in try-catch)
    try {
      const { logActivity } = await import('@/lib/db')
      await logActivity({
        organization_id: organizationId,
        action_type: 'subscription.updated',
        entity_type: 'subscription',
        entity_id: subscription.id,
        description: `Subscription ${subscription.status}`,
        metadata: {
          status: subscription.status,
          plan_id: subscription.metadata.plan_id,
          trial_end: subscription.trial_end,
        },
      })
    } catch (activityError) {
      // Activity logging is non-critical
      logger.error('[Webhook] Failed to log subscription activity (non-critical)',
        activityError instanceof Error ? activityError : new Error(String(activityError)))
    }
  }

  logger.info('[Webhook] Subscription change processed successfully')
}

/**
 * Handle subscription deleted
 * Throws on failure to trigger Stripe retry
 */
async function handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription
  const organizationId = subscription.metadata.organization_id

  if (!organizationId) {
    // Log but don't throw - we can't process without org ID anyway
    logger.warn('[Webhook] No organization_id in subscription metadata, skipping')
    return
  }

  logger.info('[Webhook] Processing subscription deletion', {
    data: {
      subscriptionId: subscription.id,
      organizationId,
    }
  })

  const supabase = getSupabaseServer()

  // Update subscription status in database
  const subscriptionUpdate: SubscriptionUpdateData = {
    status: 'canceled',
    canceled_at: getCurrentTimestamp(),
    ...getUpdateTimestamp(),
  };

  const { error: updateError } = await supabase
    .from('organization_subscriptions')
    .update(subscriptionUpdate)
    .eq('stripe_subscription_id', subscription.id)

  if (updateError) {
    throw new Error(`Failed to update subscription status: ${updateError.message}`)
  }

  // Log activity (non-critical)
  try {
    const { logActivity } = await import('@/lib/db')
    await logActivity({
      organization_id: organizationId,
      action_type: 'subscription.canceled',
      entity_type: 'subscription',
      entity_id: subscription.id,
      description: 'Subscription canceled',
      metadata: {
        canceled_at: getCurrentTimestamp(),
      },
    })
  } catch (activityError) {
    logger.error('[Webhook] Failed to log subscription cancellation activity (non-critical)',
      activityError instanceof Error ? activityError : new Error(String(activityError)))
  }

  logger.info('[Webhook] Subscription deletion processed successfully')
}

/**
 * Handle invoice paid
 * Throws on failure to trigger Stripe retry
 */
async function handleInvoicePaid(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as InvoiceWithSubscription
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id || null

  logger.info('[Webhook] Processing invoice paid', {
    data: {
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      customerId: invoice.customer,
    }
  })

  const supabase = getSupabaseServer()

  // Get organization from subscription
  let organizationId: string | null = null

  if (subscriptionId) {
    const { data: orgSub } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single() as { data: OrgSubscriptionLookup | null; error: unknown }

    organizationId = orgSub?.organization_id || null
  }

  // If no org found via subscription, try to find via customer
  if (!organizationId && invoice.customer) {
    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer.id

    const { data: orgSub } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_customer_id', customerId)
      .single() as { data: OrgSubscriptionLookup | null; error: unknown }

    organizationId = orgSub?.organization_id || null
  }

  if (!organizationId) {
    // Log but don't throw - we can't store invoice without org ID
    logger.warn('[Webhook] Could not determine organization for invoice, skipping')
    return
  }

  // Store invoice in database
  const { error: upsertError } = await supabase.from('invoices').upsert({
    organization_id: organizationId,
    subscription_id: subscriptionId,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number,
    amount_cents: invoice.amount_due,
    amount_paid_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: invoice.status || 'unknown',
    paid: invoice.paid ?? false,
    invoice_date: new Date(invoice.created * 1000).toISOString(),
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
    paid_at: invoice.status_transitions.paid_at
      ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
      : null,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    description: invoice.description,
  })

  if (upsertError) {
    throw new Error(`Failed to store invoice: ${upsertError.message}`)
  }

  // Log activity (non-critical)
  try {
    const { logActivity } = await import('@/lib/db')
    await logActivity({
      organization_id: organizationId,
      action_type: 'invoice.paid',
      entity_type: 'invoice',
      entity_id: invoice.id,
      description: `Invoice paid: ${invoice.number || invoice.id}`,
      metadata: {
        amount_paid: invoice.amount_paid,
        currency: invoice.currency,
        invoice_number: invoice.number,
      },
    })
  } catch (activityError) {
    logger.error('[Webhook] Failed to log invoice paid activity (non-critical)',
      activityError instanceof Error ? activityError : new Error(String(activityError)))
  }

  logger.info('[Webhook] Invoice paid processed successfully')
}

/**
 * Handle invoice payment failed
 * Throws on failure to trigger Stripe retry
 */
async function handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
  const invoice = event.data.object as InvoiceWithSubscription
  const subscriptionId = typeof invoice.subscription === 'string'
    ? invoice.subscription
    : invoice.subscription?.id || null

  logger.info('[Webhook] Processing invoice payment failed', {
    data: {
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      customerId: invoice.customer,
    }
  })

  const supabase = getSupabaseServer()

  // Get organization from subscription
  let organizationId: string | null = null

  if (subscriptionId) {
    const { data: orgSub } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_subscription_id', subscriptionId)
      .single() as { data: OrgSubscriptionLookup | null; error: unknown }

    organizationId = orgSub?.organization_id || null
  }

  // If no org found via subscription, try to find via customer
  if (!organizationId && invoice.customer) {
    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer.id

    const { data: orgSub } = await supabase
      .from('organization_subscriptions')
      .select('organization_id')
      .eq('stripe_customer_id', customerId)
      .single() as { data: OrgSubscriptionLookup | null; error: unknown }

    organizationId = orgSub?.organization_id || null
  }

  if (!organizationId) {
    // Log but don't throw - we can't store invoice without org ID
    logger.warn('[Webhook] Could not determine organization for failed invoice, skipping')
    return
  }

  // Update invoice in database
  const { error: upsertError } = await supabase.from('invoices').upsert({
    organization_id: organizationId,
    subscription_id: subscriptionId,
    stripe_invoice_id: invoice.id,
    invoice_number: invoice.number,
    amount_cents: invoice.amount_due,
    amount_paid_cents: invoice.amount_paid,
    currency: invoice.currency,
    status: 'payment_failed',
    paid: false,
    invoice_date: new Date(invoice.created * 1000).toISOString(),
    due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
    invoice_pdf: invoice.invoice_pdf,
    hosted_invoice_url: invoice.hosted_invoice_url,
    description: invoice.description,
  })

  if (upsertError) {
    throw new Error(`Failed to update failed invoice: ${upsertError.message}`)
  }

  // Log activity (non-critical)
  try {
    const { logActivity } = await import('@/lib/db')
    await logActivity({
      organization_id: organizationId,
      action_type: 'invoice.payment_failed',
      entity_type: 'invoice',
      entity_id: invoice.id,
      description: `Invoice payment failed: ${invoice.number || invoice.id}`,
      metadata: {
        amount_due: invoice.amount_due,
        currency: invoice.currency,
        invoice_number: invoice.number,
        attempt_count: invoice.attempt_count,
      },
    })
  } catch (activityError) {
    logger.error('[Webhook] Failed to log invoice payment failed activity (non-critical)',
      activityError instanceof Error ? activityError : new Error(String(activityError)))
  }

  logger.info('[Webhook] Invoice payment failed processed successfully')
}

/**
 * Handle payment method attached
 * Throws on failure to trigger Stripe retry
 */
async function handlePaymentMethodAttached(event: Stripe.Event): Promise<void> {
  const paymentMethod = event.data.object as Stripe.PaymentMethod

  logger.info('[Webhook] Processing payment method attached', {
    data: {
      paymentMethodId: paymentMethod.id,
      customerId: paymentMethod.customer,
      type: paymentMethod.type,
    }
  })

  if (!paymentMethod.customer) {
    logger.info('[Webhook] No customer associated with payment method, skipping')
    return
  }

  const supabase = getSupabaseServer()

  // Find organization by customer ID
  const customerId = typeof paymentMethod.customer === 'string'
    ? paymentMethod.customer
    : paymentMethod.customer.id

  const { data: orgSub } = await supabase
    .from('organization_subscriptions')
    .select('organization_id')
    .eq('stripe_customer_id', customerId)
    .single() as { data: OrgSubscriptionLookup | null; error: unknown }

  if (!orgSub?.organization_id) {
    logger.info('[Webhook] No organization found for customer, skipping')
    return
  }

  // Store payment method
  const { error: upsertError } = await supabase.from('payment_methods').upsert({
    organization_id: orgSub.organization_id,
    stripe_payment_method_id: paymentMethod.id,
    type: paymentMethod.type,
    card_brand: paymentMethod.card?.brand || null,
    card_last4: paymentMethod.card?.last4 || null,
    card_exp_month: paymentMethod.card?.exp_month || null,
    card_exp_year: paymentMethod.card?.exp_year || null,
    is_default: false, // Will be updated by subscription sync
    billing_name: paymentMethod.billing_details.name,
    billing_email: paymentMethod.billing_details.email,
  })

  if (upsertError) {
    throw new Error(`Failed to store payment method: ${upsertError.message}`)
  }

  logger.info('[Webhook] Payment method attached processed successfully')
}

/**
 * Handle payment method detached
 * Throws on failure to trigger Stripe retry
 */
async function handlePaymentMethodDetached(event: Stripe.Event): Promise<void> {
  const paymentMethod = event.data.object as Stripe.PaymentMethod

  logger.info('[Webhook] Processing payment method detached', {
    data: {
      paymentMethodId: paymentMethod.id,
      type: paymentMethod.type,
    }
  })

  const supabase = getSupabaseServer()

  // Remove payment method from database
  const { error: deleteError } = await supabase
    .from('payment_methods')
    .delete()
    .eq('stripe_payment_method_id', paymentMethod.id)

  if (deleteError) {
    throw new Error(`Failed to delete payment method: ${deleteError.message}`)
  }

  logger.info('[Webhook] Payment method detached processed successfully')
}

