/**
 * Organization Billing Portal API
 * POST: Create Stripe Customer Portal session for managing subscription
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse } from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db'
import { createBillingPortalSession } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * POST /api/organizations/[id]/billing/portal
 * Create billing portal session
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is org admin
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Organization admin access required')

  // Parse request body
  const body = await request.json().catch(() => ({}))
  const { returnUrl } = body

  // Create portal session
  const result = await createBillingPortalSession(
    id,
    returnUrl || (process.env.NEXT_PUBLIC_APP_URL + '/organizations/' + id + '/billing')
  )

  if (!result.success) {
    throw internalError('Failed to create portal session: ' + result.error)
  }

  return successResponse({
    url: result.url,
  })
})
