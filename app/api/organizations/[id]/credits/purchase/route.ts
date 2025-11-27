/**
 * Purchase Credits API
 * DEPRECATED: Use /api/stripe/credits/checkout instead
 * This endpoint now redirects to the proper Stripe checkout flow
 */

import { badRequestError, createAuthenticatedRoute } from '@/lib/api';
import { logger } from '@/lib/logging';

/**
 * POST /api/organizations/[id]/credits/purchase
 * DEPRECATED - Redirects to Stripe checkout
 * @deprecated Use POST /api/stripe/credits/checkout instead
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context) => {
  const { id } = await context.params
  const body = await request.json()

  logger.warn('Deprecated endpoint called: /api/organizations/[id]/credits/purchase', {
    organizationId: id,
    requestedCredits: body.credits,
  })

  // Return error directing to the correct endpoint
  throw badRequestError(
    'This endpoint is deprecated. Please use /api/stripe/credits/checkout for credit purchases. ' +
    'Credit purchases must go through Stripe for payment processing.'
  )
})
