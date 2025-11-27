/**
 * Organization Billing Reactivate API
 * POST: Reactivate a canceled subscription (before period ends)
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse } from '@/lib/api'
import { isUserOrgOwner } from '@/lib/db'
import { reactivateSubscription } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/organizations/[id]/billing/reactivate
 * Reactivate subscription
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is org owner (only owners can reactivate subscriptions)
  const isOwner = await isUserOrgOwner(user.id, id)
  if (!isOwner) throw forbiddenError('Organization owner access required')

  // Reactivate subscription
  const result = await reactivateSubscription(id, user.id)

  if (!result.success) {
    throw internalError('Failed to reactivate subscription: ' + result.error)
  }

  return successResponse({
    success: true,
    message: 'Subscription reactivated successfully',
  })
})
