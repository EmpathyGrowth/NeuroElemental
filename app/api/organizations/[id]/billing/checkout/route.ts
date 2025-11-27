/**
 * Organization Billing Checkout API
 * POST: Create Stripe Checkout session to subscribe to a plan
 */

import { createAuthenticatedRoute, forbiddenError, badRequestError, internalError, successResponse } from '@/lib/api'
import { isUserOrgOwner } from '@/lib/db'
import { createCheckoutSession } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/organizations/[id]/billing/checkout
 * Create checkout session
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is org owner (only owners can create subscriptions)
  const isOwner = await isUserOrgOwner(user.id, id)
  if (!isOwner) throw forbiddenError('Organization owner access required')

  // Parse request body
  const body = await request.json()
  const { planId } = body

  if (!planId) throw badRequestError('planId is required')

  // Create checkout session
  const result = await createCheckoutSession({
    organizationId: id,
    planId,
    userId: user.id,
    successUrl: process.env.NEXT_PUBLIC_APP_URL + '/organizations/' + id + '/billing/success?session_id={CHECKOUT_SESSION_ID}',
    cancelUrl: process.env.NEXT_PUBLIC_APP_URL + '/organizations/' + id + '/billing',
  })

  if (!result.success) {
    throw internalError('Failed to create checkout session: ' + result.error)
  }

  return successResponse({
    sessionId: result.sessionId,
    url: result.url,
  })
})
