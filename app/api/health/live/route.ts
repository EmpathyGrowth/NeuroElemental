/**
 * Liveness Check Endpoint
 * GET /api/health/live - Simple liveness check for Kubernetes/load balancers
 *
 * This endpoint returns immediately without checking dependencies.
 * Use /api/health for full health status including database.
 */

import { createPublicRoute, successResponse } from '@/lib/api'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/health/live
 * Simple liveness probe - just confirms the server is running
 */
export const GET = createPublicRoute(async () => {
  return successResponse({
    status: 'alive',
    timestamp: new Date().toISOString(),
  })
})
