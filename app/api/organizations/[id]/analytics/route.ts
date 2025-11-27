/**
 * Organization Analytics API
 * Get usage statistics and metrics
 */

import { getMostActiveUsers, getOrganizationMetrics, getOrganizationStats } from '@/lib/analytics'
import { createAuthenticatedRoute, internalError, requireOrganizationAccess, successResponse } from '@/lib/api'

/**
 * GET /api/organizations/[id]/analytics
 * Get analytics overview for an organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const days = parseInt(searchParams.get('days') || '30')
  const view = searchParams.get('view') || 'overview' // overview, detailed

  if (view === 'detailed') {
    // Return detailed metrics
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const metricsResult = await getOrganizationMetrics(id, {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    })

    if (!metricsResult.success) {
      throw internalError('Failed to get metrics')
    }

    return successResponse({
      metrics: metricsResult.metrics,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
        days,
      },
    })
  } else {
    // Return overview stats
    const [statsResult, activeUsersResult] = await Promise.all([
      getOrganizationStats(id, days),
      getMostActiveUsers(id, days, 10),
    ])

    if (!statsResult.success) {
      throw internalError('Failed to get statistics')
    }

    return successResponse({
      stats: statsResult.stats,
      activeUsers: activeUsersResult.success ? activeUsersResult.users : [],
    })
  }
})
