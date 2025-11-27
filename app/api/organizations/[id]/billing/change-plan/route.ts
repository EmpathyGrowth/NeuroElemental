/**
 * Organization Billing Change Plan API
 * POST: Change subscription plan (upgrade/downgrade)
 */

import { createAuthenticatedRoute, forbiddenError, badRequestError, internalError, successResponse } from '@/lib/api'
import { isUserOrgOwner } from '@/lib/db'
import { changePlan } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/organizations/[id]/billing/change-plan
 * Change subscription plan
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is org owner (only owners can change plans)
  const isOwner = await isUserOrgOwner(user.id, id)
  if (!isOwner) throw forbiddenError('Organization owner access required')

  // Parse request body
  const body = await request.json()
  const { planId } = body

  if (!planId) throw badRequestError('planId is required')

  // Change plan
  const result = await changePlan(id, planId, user.id)

  if (!result.success) {
    throw internalError('Failed to change plan: ' + result.error)
  }

  // Stripe.Subscription has current_period_end as a number (Unix timestamp)
  const subscription = result.subscription
  return successResponse({
    success: true,
    subscription: subscription ? {
      id: subscription.id,
      status: subscription.status,
      current_period_end: 'current_period_end' in subscription ? subscription.current_period_end : undefined,
    } : undefined,
  })
})
