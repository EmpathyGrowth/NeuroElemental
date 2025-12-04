/**
 * Billing & Subscription Management Functions
 * Comprehensive Stripe integration for NeuroElemental B2B platform
 */

import { stripe } from './stripe-client'
import { createAdminClient } from '@/lib/supabase/admin'
import { logActivity } from '@/lib/db'
import { logger } from '@/lib/logging'
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils'
import Stripe from 'stripe'

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface SubscriptionPlan {
  id: string
  stripe_product_id: string
  stripe_price_id: string
  name: string
  description: string
  tier: string
  price_cents: number
  currency: string
  billing_interval: string
  features: string[]
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  max_members: number | null
  max_api_keys: number | null
  max_webhooks: number | null
  storage_gb: number | null
  trial_days: number
  is_active: boolean
  is_featured: boolean
}

export interface OrganizationSubscription {
  id: string
  organization_id: string
  plan_id: string | null
  stripe_subscription_id: string | null
  stripe_customer_id: string
  status: string
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  canceled_at: string | null
  trial_end: string | null
  billing_email: string | null
  payment_method_last4: string | null
  payment_method_brand: string | null
}

export interface Invoice {
  id: string
  organization_id: string
  subscription_id: string | null
  stripe_invoice_id: string
  invoice_number: string | null
  amount_cents: number
  amount_paid_cents: number
  currency: string
  status: string
  paid: boolean
  invoice_date: string
  due_date: string | null
  paid_at: string | null
  invoice_pdf: string | null
  hosted_invoice_url: string | null
  description: string | null
}

export interface PaymentMethod {
  id: string
  organization_id: string
  stripe_payment_method_id: string
  type: string
  card_brand: string | null
  card_last4: string | null
  card_exp_month: number | null
  card_exp_year: number | null
  is_default: boolean
  billing_name: string | null
  billing_email: string | null
}

// ============================================================================
// 1. Get Organization Subscription
// ============================================================================

/**
 * Get the current subscription for an organization
 * @param organizationId - The organization UUID
 * @returns The subscription data or null if no active subscription
 */
export async function getOrganizationSubscription(
  organizationId: string
): Promise<{ success: boolean; subscription: OrganizationSubscription | null; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('organization_subscriptions')
      .select('*')
      .eq('organization_id', organizationId)
      .single() as { data: OrganizationSubscription | null; error: { code?: string; message: string } | null }

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        return { success: true, subscription: null }
      }
      logger.error('Error getting organization subscription', undefined, { errorMsg: error.message })
      return { success: false, subscription: null, error }
    }

    return { success: true, subscription: data }
  } catch (error) {
    logger.error('Error in getOrganizationSubscription', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, subscription: null, error }
  }
}

// ============================================================================
// 2. Create Stripe Customer
// ============================================================================

/**
 * Create a Stripe customer for an organization
 * @param organizationId - The organization UUID
 * @param email - Customer email
 * @param name - Customer name (organization name)
 * @returns The Stripe customer object
 */
export async function createStripeCustomer(
  organizationId: string,
  email: string,
  name: string
): Promise<{ success: boolean; customer?: Stripe.Customer; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Check if customer already exists
    const { data: existingSubscription } = await supabase
      .from('organization_subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .single() as { data: { stripe_customer_id: string | null } | null; error: unknown }

    if (existingSubscription?.stripe_customer_id) {
      // Retrieve existing customer
      const customer = await stripe.customers.retrieve(
        existingSubscription.stripe_customer_id
      )
      return { success: true, customer: customer as Stripe.Customer }
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        organization_id: organizationId,
      },
    })

    // Store customer ID in database
    const { error: upsertError } = await (supabase as any)
      .from('organization_subscriptions')
      .upsert({
        organization_id: organizationId,
        stripe_customer_id: customer.id,
        status: 'inactive',
      })

    if (upsertError) {
      logger.error('Error storing customer ID', undefined, { errorMsg: upsertError.message })
      return { success: false, error: upsertError }
    }

    return { success: true, customer }
  } catch (error) {
    logger.error('Error in createStripeCustomer', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 3. Create Checkout Session
// ============================================================================

/**
 * Create a Stripe Checkout session for a new subscription
 * @param params - Checkout session parameters
 * @returns Session ID and redirect URL
 */
export async function createCheckoutSession(params: {
  organizationId: string
  planId: string
  userId?: string
  successUrl?: string
  cancelUrl?: string
}): Promise<{ success: boolean; sessionId?: string; url?: string; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get plan details
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', params.planId)
      .single() as { data: SubscriptionPlan | null; error: { message: string } | null }

    if (planError || !plan) {
      return { success: false, error: planError || 'Plan not found' }
    }

    // Get or create customer
    const { data: orgSub } = await supabase
      .from('organization_subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', params.organizationId)
      .single() as { data: { stripe_customer_id: string | null } | null; error: unknown }

    let customerId = orgSub?.stripe_customer_id

    if (!customerId) {
      // Get organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('name, slug')
        .eq('id', params.organizationId)
        .single() as { data: { name: string; slug: string } | null; error: unknown }

      // Create customer
      const { success, customer, error: customerError } = await createStripeCustomer(
        params.organizationId,
        org?.slug ? `${org.slug}@neuroelemental.com` : 'billing@neuroelemental.com',
        org?.name || 'Organization'
      )

      if (!success || !customer) {
        return { success: false, error: customerError }
      }

      customerId = customer.id
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripe_price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: params.successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
      metadata: {
        organization_id: params.organizationId,
        plan_id: params.planId,
        user_id: params.userId || '',
      },
      subscription_data: {
        trial_period_days: plan.trial_days > 0 ? plan.trial_days : undefined,
        metadata: {
          organization_id: params.organizationId,
          plan_id: params.planId,
        },
      },
    })

    // Log activity
    if (params.userId) {
      await logActivity({
        organization_id: params.organizationId,
        user_id: params.userId,
        action_type: 'subscription.checkout_started',
        entity_type: 'subscription',
        entity_id: params.planId,
        description: `Started checkout for ${plan.name} plan`,
        metadata: {
          plan_name: plan.name,
          plan_tier: plan.tier,
          price_cents: plan.price_cents,
        },
      })
    }

    return {
      success: true,
      sessionId: session.id,
      url: session.url || undefined,
    }
  } catch (error) {
    logger.error('Error in createCheckoutSession', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 4. Create Billing Portal Session
// ============================================================================

/**
 * Create a Stripe Customer Portal session for managing subscription
 * @param organizationId - The organization UUID
 * @param returnUrl - URL to return to after managing subscription
 * @returns Portal URL for redirect
 */
export async function createBillingPortalSession(
  organizationId: string,
  returnUrl?: string
): Promise<{ success: boolean; url?: string; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get customer ID
    const { data: orgSub, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('stripe_customer_id')
      .eq('organization_id', organizationId)
      .single() as { data: { stripe_customer_id: string | null } | null; error: { message: string } | null }

    if (subError || !orgSub?.stripe_customer_id) {
      return { success: false, error: 'No Stripe customer found for organization' }
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: orgSub.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    })

    return { success: true, url: session.url }
  } catch (error) {
    logger.error('Error in createBillingPortalSession', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 5. Change Plan
// ============================================================================

/**
 * Upgrade or downgrade a subscription plan
 * @param organizationId - The organization UUID
 * @param newPlanId - The new plan UUID
 * @returns Updated subscription data
 */
/** Organization subscription with plan details */
interface OrgSubWithPlan extends OrganizationSubscription {
  plan: SubscriptionPlan | null
}

export async function changePlan(
  organizationId: string,
  newPlanId: string,
  userId?: string
): Promise<{ success: boolean; subscription?: Stripe.Subscription; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get current subscription
    const { data: orgSub, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('organization_id', organizationId)
      .single() as { data: OrgSubWithPlan | null; error: { message: string } | null }

    if (subError || !orgSub?.stripe_subscription_id) {
      return { success: false, error: 'No active subscription found' }
    }

    // Get new plan details
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', newPlanId)
      .single() as { data: SubscriptionPlan | null; error: { message: string } | null }

    if (planError || !newPlan) {
      return { success: false, error: 'New plan not found' }
    }

    // Retrieve Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      orgSub.stripe_subscription_id
    )

    // Ensure subscription has items
    const firstItem = stripeSubscription.items.data[0]
    if (!firstItem) {
      return { success: false, error: 'No subscription items found' }
    }

    // Update subscription in Stripe with new price
    const updatedSubscription = await stripe.subscriptions.update(
      orgSub.stripe_subscription_id,
      {
        items: [
          {
            id: firstItem.id,
            price: newPlan.stripe_price_id,
          },
        ],
        proration_behavior: 'always_invoice',
        metadata: {
          organization_id: organizationId,
          plan_id: newPlanId,
        },
      }
    )

    // Update database
    const { error: updateError } = await (supabase as any)
      .from('organization_subscriptions')
      .update({
        plan_id: newPlanId,
        ...getUpdateTimestamp(),
      })
      .eq('organization_id', organizationId) as { error: { message: string } | null }

    if (updateError) {
      logger.error('Error updating subscription in database', undefined, { errorMsg: updateError.message })
    }

    // Log activity
    if (userId) {
      await logActivity({
        organization_id: organizationId,
        user_id: userId,
        action_type: 'subscription.plan_changed',
        entity_type: 'subscription',
        entity_id: newPlanId,
        description: `Changed plan from ${orgSub.plan?.name || 'unknown'} to ${newPlan.name}`,
        metadata: {
          old_plan: orgSub.plan?.name,
          new_plan: newPlan.name,
          old_tier: orgSub.plan?.tier,
          new_tier: newPlan.tier,
        },
      })
    }

    return { success: true, subscription: updatedSubscription }
  } catch (error) {
    logger.error('Error in changePlan', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 6. Cancel Subscription
// ============================================================================

/**
 * Cancel a subscription (immediate or at period end)
 * @param organizationId - The organization UUID
 * @param cancelImmediately - Whether to cancel immediately or at period end
 * @returns Success status
 */
export async function cancelSubscription(
  organizationId: string,
  cancelImmediately: boolean = false,
  userId?: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get current subscription
    const { data: orgSub, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('organization_id', organizationId)
      .single() as { data: OrgSubWithPlan | null; error: { message: string } | null }

    if (subError || !orgSub?.stripe_subscription_id) {
      return { success: false, error: 'No active subscription found' }
    }

    // Cancel in Stripe
    if (cancelImmediately) {
      await stripe.subscriptions.cancel(orgSub.stripe_subscription_id)
    } else {
      await stripe.subscriptions.update(orgSub.stripe_subscription_id, {
        cancel_at_period_end: true,
      })
    }

    // Update database
    const { error: updateError } = await (supabase as any)
      .from('organization_subscriptions')
      .update({
        cancel_at_period_end: !cancelImmediately,
        canceled_at: cancelImmediately ? getCurrentTimestamp() : null,
        status: cancelImmediately ? 'canceled' : orgSub.status,
        ...getUpdateTimestamp(),
      })
      .eq('organization_id', organizationId) as { error: { message: string } | null }

    if (updateError) {
      logger.error('Error updating subscription in database', undefined, { errorMsg: updateError.message })
    }

    // Log activity
    if (userId) {
      await logActivity({
        organization_id: organizationId,
        user_id: userId,
        action_type: 'subscription.canceled',
        entity_type: 'subscription',
        entity_id: orgSub.id,
        description: cancelImmediately
          ? `Canceled subscription immediately`
          : `Scheduled subscription cancellation at period end`,
        metadata: {
          plan_name: orgSub.plan?.name,
          cancel_immediately: cancelImmediately,
          period_end: orgSub.current_period_end,
        },
      })
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in cancelSubscription', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 7. Reactivate Subscription
// ============================================================================

/**
 * Reactivate a canceled subscription (before period ends)
 * @param organizationId - The organization UUID
 * @returns Success status
 */
export async function reactivateSubscription(
  organizationId: string,
  userId?: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get current subscription
    const { data: orgSub, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('*, plan:subscription_plans(*)')
      .eq('organization_id', organizationId)
      .single() as { data: OrgSubWithPlan | null; error: { message: string } | null }

    if (subError || !orgSub?.stripe_subscription_id) {
      return { success: false, error: 'No subscription found' }
    }

    if (!orgSub.cancel_at_period_end) {
      return { success: false, error: 'Subscription is not scheduled for cancellation' }
    }

    // Reactivate in Stripe
    await stripe.subscriptions.update(orgSub.stripe_subscription_id, {
      cancel_at_period_end: false,
    })

    // Update database
    const { error: updateError } = await (supabase as any)
      .from('organization_subscriptions')
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
        status: 'active',
        ...getUpdateTimestamp(),
      })
      .eq('organization_id', organizationId) as { error: { message: string } | null }

    if (updateError) {
      logger.error('Error updating subscription in database', undefined, { errorMsg: updateError.message })
    }

    // Log activity
    if (userId) {
      await logActivity({
        organization_id: organizationId,
        user_id: userId,
        action_type: 'subscription.reactivated',
        entity_type: 'subscription',
        entity_id: orgSub.id,
        description: `Reactivated subscription`,
        metadata: {
          plan_name: orgSub.plan?.name,
        },
      })
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in reactivateSubscription', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 8. Get Subscription Plans
// ============================================================================

/**
 * Get all active subscription plans
 * @returns Array of subscription plans with pricing and features
 */
export async function getSubscriptionPlans(): Promise<{
  success: boolean
  plans: SubscriptionPlan[]
  error?: unknown
}> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_cents', { ascending: true }) as { data: SubscriptionPlan[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error getting subscription plans', undefined, { errorMsg: error.message })
      return { success: false, plans: [], error }
    }

    return { success: true, plans: data || [] }
  } catch (error) {
    logger.error('Error in getSubscriptionPlans', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, plans: [], error }
  }
}

// ============================================================================
// 9. Sync Subscription from Stripe
// ============================================================================

/**
 * Sync subscription data from Stripe to database
 * @param stripeSubscriptionId - The Stripe subscription ID
 * @returns Success status
 */
export async function syncSubscriptionFromStripe(
  stripeSubscriptionId: string
): Promise<{ success: boolean; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Retrieve subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(stripeSubscriptionId, {
      expand: ['default_payment_method', 'customer'],
    })

    // Type assertion for expanded subscription with period data
    const subData = stripeSubscription as unknown as {
      id: string
      metadata: { organization_id?: string; plan_id?: string }
      customer: string | { id: string; email?: string | null; deleted?: boolean }
      status: string
      current_period_start: number
      current_period_end: number
      cancel_at_period_end: boolean
      canceled_at: number | null
      trial_end: number | null
      default_payment_method: string | Stripe.PaymentMethod | null
    }

    const organizationId = subData.metadata.organization_id
    const planId = subData.metadata.plan_id

    if (!organizationId) {
      return { success: false, error: 'No organization_id in subscription metadata' }
    }

    // Get payment method details
    let paymentMethodLast4: string | null = null
    let paymentMethodBrand: string | null = null

    if (subData.default_payment_method) {
      const paymentMethod =
        typeof subData.default_payment_method === 'string'
          ? await stripe.paymentMethods.retrieve(subData.default_payment_method)
          : subData.default_payment_method

      paymentMethodLast4 = paymentMethod.card?.last4 || null
      paymentMethodBrand = paymentMethod.card?.brand || null
    }

    // Get billing email
    const customer =
      typeof subData.customer === 'string'
        ? await stripe.customers.retrieve(subData.customer)
        : subData.customer

    const billingEmail =
      typeof customer !== 'string' && !customer.deleted ? customer.email : null

    // Update or insert subscription
    const { error: upsertError } = await (supabase as any)
      .from('organization_subscriptions')
      .upsert({
        organization_id: organizationId,
        plan_id: planId || null,
        stripe_subscription_id: subData.id,
        stripe_customer_id:
          typeof subData.customer === 'string'
            ? subData.customer
            : subData.customer.id,
        status: subData.status,
        current_period_start: new Date(
          subData.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subData.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subData.cancel_at_period_end,
        canceled_at: subData.canceled_at
          ? new Date(subData.canceled_at * 1000).toISOString()
          : null,
        trial_end: subData.trial_end
          ? new Date(subData.trial_end * 1000).toISOString()
          : null,
        billing_email: billingEmail,
        payment_method_last4: paymentMethodLast4,
        payment_method_brand: paymentMethodBrand,
        ...getUpdateTimestamp(),
      }) as { error: { message: string } | null }

    if (upsertError) {
      logger.error('Error syncing subscription to database', undefined, { errorMsg: upsertError.message })
      return { success: false, error: upsertError }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in syncSubscriptionFromStripe', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

// ============================================================================
// 10. Get Invoices
// ============================================================================

/**
 * Get invoice history for an organization
 * @param organizationId - The organization UUID
 * @param options - Pagination options
 * @returns Invoice array and total count
 */
export async function getInvoices(
  organizationId: string,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<{ success: boolean; invoices: Invoice[]; total: number; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get total count
    const { count, error: countError } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId) as { count: number | null; error: { message: string } | null }

    if (countError) {
      logger.error('Error counting invoices', undefined, { errorMsg: countError.message })
      return { success: false, invoices: [], total: 0, error: countError }
    }

    // Get invoices with pagination
    let query = supabase
      .from('invoices')
      .select('*')
      .eq('organization_id', organizationId)
      .order('invoice_date', { ascending: false })

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      )
    }

    const { data, error } = await query as { data: Invoice[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error getting invoices', undefined, { errorMsg: error.message })
      return { success: false, invoices: [], total: 0, error }
    }

    return {
      success: true,
      invoices: data || [],
      total: count || 0,
    }
  } catch (error) {
    logger.error('Error in getInvoices', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, invoices: [], total: 0, error }
  }
}

// ============================================================================
// 11. Get Payment Methods
// ============================================================================

/**
 * Get saved payment methods for an organization
 * @param organizationId - The organization UUID
 * @returns Array of payment methods
 */
export async function getPaymentMethods(
  organizationId: string
): Promise<{ success: boolean; paymentMethods: PaymentMethod[]; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('organization_id', organizationId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false }) as { data: PaymentMethod[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error getting payment methods', undefined, { errorMsg: error.message })
      return { success: false, paymentMethods: [], error }
    }

    return { success: true, paymentMethods: data || [] }
  } catch (error) {
    logger.error('Error in getPaymentMethods', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, paymentMethods: [], error }
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if an organization has an active subscription
 * @param organizationId - The organization UUID
 * @returns Boolean indicating if subscription is active
 */
export async function hasActiveSubscription(
  organizationId: string
): Promise<boolean> {
  const { success, subscription } = await getOrganizationSubscription(organizationId)

  if (!success || !subscription) {
    return false
  }

  return ['active', 'trialing'].includes(subscription.status)
}

/**
 * Get subscription usage limits for an organization
 * @param organizationId - The organization UUID
 * @returns Usage limits based on current plan
 */
/** Subscription limits */
interface SubscriptionLimits {
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  max_members: number | null
  max_api_keys: number | null
  max_webhooks: number | null
  storage_gb: number | null
}

export async function getSubscriptionLimits(organizationId: string): Promise<{
  success: boolean
  limits?: SubscriptionLimits
  error?: unknown
}> {
  try {
    const supabase = createAdminClient()

    const { data: orgSub, error } = await supabase
      .from('organization_subscriptions')
      .select('plan:subscription_plans(*)')
      .eq('organization_id', organizationId)
      .single() as { data: { plan: SubscriptionPlan | null } | null; error: unknown }

    if (error || !orgSub?.plan) {
      // Return free tier limits
      const { data: freePlan } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('tier', 'free')
        .single() as { data: SubscriptionPlan | null; error: unknown }

      if (freePlan) {
        return {
          success: true,
          limits: {
            requests_per_minute: freePlan.requests_per_minute,
            requests_per_hour: freePlan.requests_per_hour,
            requests_per_day: freePlan.requests_per_day,
            max_members: freePlan.max_members,
            max_api_keys: freePlan.max_api_keys,
            max_webhooks: freePlan.max_webhooks,
            storage_gb: freePlan.storage_gb,
          },
        }
      }

      return { success: false, error }
    }

    const plan = orgSub.plan

    return {
      success: true,
      limits: {
        requests_per_minute: plan.requests_per_minute,
        requests_per_hour: plan.requests_per_hour,
        requests_per_day: plan.requests_per_day,
        max_members: plan.max_members,
        max_api_keys: plan.max_api_keys,
        max_webhooks: plan.max_webhooks,
        storage_gb: plan.storage_gb,
      },
    }
  } catch (error) {
    logger.error('Error in getSubscriptionLimits', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

/**
 * Format price for display
 * @param priceCents - Price in cents
 * @param currency - Currency code (default: 'usd')
 * @returns Formatted price string
 */
export function formatPrice(priceCents: number, currency: string = 'usd'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  })

  return formatter.format(priceCents / 100)
}

/**
 * Calculate proration amount for plan change
 * @param organizationId - The organization UUID
 * @param newPlanId - The new plan UUID
 * @returns Estimated proration amount
 */
export async function calculateProration(
  organizationId: string,
  newPlanId: string
): Promise<{ success: boolean; amount?: number; error?: unknown }> {
  try {
    const supabase = createAdminClient()

    // Get current subscription
    const { data: orgSub, error: subError } = await supabase
      .from('organization_subscriptions')
      .select('stripe_subscription_id')
      .eq('organization_id', organizationId)
      .single() as { data: { stripe_subscription_id: string | null } | null; error: { message: string } | null }

    if (subError || !orgSub?.stripe_subscription_id) {
      return { success: false, error: 'No active subscription found' }
    }

    // Get new plan
    const { data: newPlan, error: planError } = await supabase
      .from('subscription_plans')
      .select('stripe_price_id')
      .eq('id', newPlanId)
      .single() as { data: { stripe_price_id: string } | null; error: { message: string } | null }

    if (planError || !newPlan) {
      return { success: false, error: 'New plan not found' }
    }

    // Get subscription
    const subscription = await stripe.subscriptions.retrieve(
      orgSub.stripe_subscription_id
    )

    // Ensure subscription has items
    const firstItem = subscription.items.data[0]
    if (!firstItem) {
      return { success: false, error: 'No subscription items found' }
    }

    // Create upcoming invoice preview with new price
    const upcomingInvoice = await stripe.invoices.createPreview({
      customer: subscription.customer as string,
      subscription: subscription.id,
      subscription_details: {
        items: [
          {
            id: firstItem.id,
            price: newPlan.stripe_price_id,
          },
        ],
      },
    })

    return {
      success: true,
      amount: upcomingInvoice.amount_due,
    }
  } catch (error) {
    logger.error('Error in calculateProration', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

