/**
 * Stripe Webhook Handler for User Purchases
 * POST: Handle checkout sessions, user subscriptions, and invoice events
 *
 * This handles individual user purchases (courses, certifications)
 * For organization/B2B billing, see /api/billing/webhook
 */

import { getSupabaseServer } from '@/lib/db';
import { emailService } from '@/lib/email';
import { stripe } from '@/lib/stripe/config';
import { successResponse, createPublicRoute, badRequestError } from '@/lib/api';
import Stripe from 'stripe';
import { getCurrentTimestamp } from '@/lib/utils';
import { logger } from '@/lib/logging';

// Force dynamic rendering for webhooks
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** User profile for lookup */
interface UserProfile {
  id: string;
}

/** Stripe subscription with required billing properties */
interface StripeSubscriptionData {
  id: string;
  customer: string;
  status: string;
  current_period_start?: number;
  current_period_end?: number;
  cancel_at_period_end: boolean;
}

/** Stripe invoice data */
interface StripeInvoice {
  id: string;
  customer: string;
  subscription?: string;
  amount_due: number;
  amount_paid: number;
  currency: string;
  attempt_count?: number;
  next_payment_attempt?: number;
}

export const POST = createPublicRoute(async (request, _context) => {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  // Validate signature exists
  if (!signature) {
    logger.error('Missing stripe-signature header');
    throw badRequestError('Missing stripe-signature header');
  }

  // Validate webhook secret is configured
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured');
    throw badRequestError('Webhook not configured');
  }

  // Verify webhook signature
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    logger.error('Webhook signature verification failed', err instanceof Error ? err : new Error(message));
    throw badRequestError('Invalid webhook signature');
  }

  logger.info(`[Stripe Webhook] Received event: ${event.type}`, {
    data: { eventId: event.id }
  });

  const supabase = getSupabaseServer();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const metadata = session.metadata;

      if (!userId) break;

      // Handle different purchase types
      if (metadata?.type === 'course') {
        // Create course enrollment
        await supabase
          .from('course_enrollments')
          .insert({
            user_id: userId,
            course_id: metadata.courseId,
            payment_status: 'completed',
            stripe_session_id: session.id,
            amount_paid: session.amount_total,
          });
      } else if (metadata?.type === 'certification') {
        // Update instructor status
        await supabase
          .from('profiles')
          .update({
            instructor_status: 'approved',
            instructor_certified_at: getCurrentTimestamp(),
          })
          .eq('id', userId);
      }

      // Transaction logging can be done via activity_logs if needed
      // The payment is already tracked via course_enrollments or other relevant tables

      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as StripeSubscriptionData;
      const customerId = subscription.customer;

      // Get user by stripe customer ID
      const customer = await stripe.customers.retrieve(customerId);
      if (!customer || customer.deleted) break;

      const email = (customer as Stripe.Customer).email;
      if (!email) break;

      // Update user's subscription status
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single() as { data: UserProfile | null; error: unknown };

      if (profile) {
        await supabase
          .from('subscriptions')
          .upsert({
            user_id: profile.id,
            plan_id: 'default', // Set from Stripe subscription metadata if available
            stripe_subscription_id: subscription.id,
            stripe_customer_id: customerId,
            status: subscription.status,
            current_period_start: subscription.current_period_start
              ? new Date(subscription.current_period_start * 1000).toISOString()
              : null,
            current_period_end: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000).toISOString()
              : null,
            cancel_at_period_end: subscription.cancel_at_period_end,
          }, { onConflict: 'stripe_subscription_id' });
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as StripeSubscriptionData;

      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);

      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as StripeInvoice;

      // Record successful payment
      if (invoice.subscription) {
        await supabase
          .from('invoices')
          .insert({
            stripe_invoice_id: invoice.id,
            stripe_subscription_id: invoice.subscription,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            paid_at: getCurrentTimestamp(),
          });
      }

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as StripeInvoice;

      // Handle failed payment
      logger.error('Payment failed for invoice', undefined, { invoiceId: invoice.id });

      // Get customer email
      const customer = await stripe.customers.retrieve(invoice.customer);
      if (customer && !customer.deleted && (customer as Stripe.Customer).email) {
        const email = (customer as Stripe.Customer).email!;

        // Send payment failed notification
        await emailService.sendPaymentFailedNotification(email, {
          invoiceId: invoice.id,
          amount: invoice.amount_due / 100,
          currency: invoice.currency.toUpperCase(),
          attemptCount: invoice.attempt_count || 1,
          nextRetryDate: invoice.next_payment_attempt
            ? new Date(invoice.next_payment_attempt * 1000)
            : undefined,
        });

        // Also create an in-app notification if user exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email)
          .single() as { data: UserProfile | null; error: unknown };

        if (profile) {
          await supabase
            .from('notifications')
            .insert({
              user_id: profile.id,
              title: 'Payment Failed',
              message: `Your payment of ${invoice.currency.toUpperCase()} ${(invoice.amount_due / 100).toFixed(2)} failed. Please update your payment method.`,
              type: 'error',
              action_url: '/dashboard/billing',
            });
        }
      }

      break;
    }
  }

  return successResponse({ received: true });
});

