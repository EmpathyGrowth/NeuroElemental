/**
 * Organization Billing API
 * GET: Get current subscription status and plan details
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse } from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db'
import { getOrganizationSubscription, getPaymentMethods, stripe } from '@/lib/billing'
import { logger } from '@/lib/logging'

/** Subscription plan record */
interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  stripe_price_id: string | null;
}

export const dynamic = 'force-dynamic'

/**
 * GET /api/organizations/[id]/billing
 * Get billing information
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is org admin
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Organization admin access required')

  // Get subscription
  const { success, subscription, error } = await getOrganizationSubscription(id)
  if (!success) throw internalError('Failed to fetch subscription: ' + error)

  // If no subscription, return null
  if (!subscription) {
    return successResponse({
      subscription: null,
      plan: null,
      paymentMethod: null,
      upcomingInvoice: null,
    })
  }

  // Get plan details
  let plan: SubscriptionPlan | null = null
  if (subscription.plan_id) {
    const { getSupabaseServer } = await import('@/lib/db')
    const supabase = getSupabaseServer()
    const { data: planData } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', subscription.plan_id)
      .single() as { data: SubscriptionPlan | null }
    plan = planData
  }

  // Get payment methods
  const { paymentMethods } = await getPaymentMethods(id)
  const defaultPaymentMethod = paymentMethods.find((pm) => pm.is_default)

  // Get upcoming invoice if subscription exists
  let upcomingInvoice = null
  if (subscription.stripe_subscription_id) {
    try {
      upcomingInvoice = await (stripe.invoices as any).retrieveUpcoming({
        customer: subscription.stripe_customer_id,
        subscription: subscription.stripe_subscription_id,
      })
    } catch (err) {
      // No upcoming invoice or error fetching it
      logger.error('Error fetching upcoming invoice', undefined, { errorMsg: err instanceof Error ? err.message : String(err) })
    }
  }

  return successResponse({
    subscription,
    plan,
    paymentMethod: defaultPaymentMethod || null,
    upcomingInvoice: upcomingInvoice
      ? {
        amount_due: upcomingInvoice.amount_due,
        currency: upcomingInvoice.currency,
        period_start: upcomingInvoice.period_start,
        period_end: upcomingInvoice.period_end,
      }
      : null,
  })
})
