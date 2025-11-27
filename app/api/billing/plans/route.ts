/**
 * Billing Plans API
 * GET: Get all available subscription plans (public endpoint)
 */

import { createPublicRoute, internalError, successResponse } from '@/lib/api'
import { getSubscriptionPlans } from '@/lib/billing'

export const dynamic = 'force-dynamic'

export const GET = createPublicRoute(async (_request, _context) => {
  // Get all active subscription plans
  const result = await getSubscriptionPlans()

  if (!result.success) {
    throw internalError(result.error instanceof Error ? result.error.message : String(result.error || 'Failed to fetch plans'))
  }

  return successResponse({
    plans: result.plans,
  })
})
