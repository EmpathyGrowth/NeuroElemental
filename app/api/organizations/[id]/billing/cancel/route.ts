/**
 * Organization Billing Cancel API
 * POST: Cancel subscription (immediate or at period end)
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse } from '@/lib/api'
import { isUserOrgOwner } from '@/lib/db'
import { cancelSubscription } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/organizations/[id]/billing/cancel
 * Cancel subscription
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is org owner (only owners can cancel subscriptions)
  const isOwner = await isUserOrgOwner(user.id, id)
  if (!isOwner) throw forbiddenError('Organization owner access required')

  // Parse request body
  const body = await request.json().catch(() => ({}))
  const { immediate } = body

  // Cancel subscription
  const result = await cancelSubscription(id, immediate === true, user.id)

  if (!result.success) {
    throw internalError('Failed to cancel subscription: ' + result.error)
  }

  return successResponse({
    success: true,
    message: immediate
      ? 'Subscription canceled immediately'
      : 'Subscription will be canceled at the end of the billing period',
  })
})
