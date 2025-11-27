/**
 * Metrics API Endpoint
 * Provides access to performance and metrics data
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { metricsCollector, performanceMonitor } from '@/lib/monitoring'

export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const metricsSummary = metricsCollector.getSummary()
  const performanceSummary = performanceMonitor.getSummary()

  return successResponse({
    metrics: metricsSummary,
    performance: performanceSummary,
    timestamp: Date.now(),
  })
})

export const DELETE = createAdminRoute(async (_request, _context, _admin) => {
  metricsCollector.clear()
  performanceMonitor.clear()

  return successResponse({
    message: 'Metrics cleared successfully',
  })
})
