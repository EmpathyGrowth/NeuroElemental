/**
 * Webhook Retry Cron Job
 * Retries failed webhook deliveries
 * Should run every minute via cron
 * Requires x-cron-secret header with CRON_SECRET value
 */

import { retryPendingDeliveries } from '@/lib/webhooks/deliver'
import { logger } from '@/lib/logging'
import { createCronRoute, internalError, successResponse } from '@/lib/api'
import { getCurrentTimestamp } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * GET /api/cron/retry-webhooks
 * Retry pending webhook deliveries (requires x-cron-secret header)
 */
export const GET = createCronRoute(async (_request, _context) => {
  // Retry pending deliveries
  const result = await retryPendingDeliveries()

  if (!result.success) {
    logger.error('Error retrying webhooks', result.error instanceof Error ? result.error : new Error(String(result.error)), {
      endpoint: 'GET /api/cron/retry-webhooks'
    })
    throw internalError('Failed to retry deliveries')
  }

  return successResponse({
    success: true,
    retried: result.retried,
    timestamp: getCurrentTimestamp(),
  })
})
