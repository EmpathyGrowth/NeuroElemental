/**
 * Cron Job: Process Data Exports
 * Periodically process pending data export requests
 *
 * This endpoint should be called by Vercel Cron
 * Runs every 30 minutes to process pending export requests
 * Requires x-cron-secret header with CRON_SECRET value
 */

import { logger } from '@/lib/logging';
import { getSupabaseServer } from '@/lib/db'
import { createCronRoute, internalError, successResponse } from '@/lib/api'
import { getCurrentTimestamp, getAppUrl, getRequiredEnv } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/** Pending export job record */
interface PendingExportJob {
  id: string;
  requested_by: string;
  created_at: string;
}

/** Result of processing an export request */
interface ProcessResult {
  request_id: string;
  success: boolean;
  [key: string]: unknown;
}

/** Supabase error type */
interface SupabaseError {
  message: string;
  code?: string;
}

/**
 * GET /api/cron/process-data-exports
 * Process pending data export requests (requires x-cron-secret header)
 */
export const GET = createCronRoute(async (_request, _context) => {
  const supabase = getSupabaseServer()

  // Find pending export jobs (process up to 10 requests at a time)
  const { data: pendingRequests, error } = (await supabase
    .from('audit_export_jobs')
    .select('id, requested_by, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10)) as { data: PendingExportJob[] | null; error: SupabaseError | null }

  if (error) {
    logger.error('Error fetching pending export requests:', error as Error)
    throw internalError('Failed to fetch pending requests')
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return successResponse({
      success: true,
      message: 'No pending export requests to process',
      processed_count: 0,
      timestamp: getCurrentTimestamp(),
    })
  }

  // Get required environment variables
  const appUrl = getAppUrl()
  const cronSecret = getRequiredEnv('CRON_SECRET', 'Required for cron job authentication')

  // Process each request
  const results = await Promise.allSettled(
    pendingRequests.map(async (req) => {
      // Call the process endpoint for this request
      const processUrl = `${appUrl}/api/user/data-export/${req.id}/process`

      const response = await fetch(processUrl, {
        method: 'POST',
        headers: {
          'x-cron-secret': cronSecret,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw internalError(errorData.error || 'Failed to process export')
      }

      const data = await response.json()
      return {
        request_id: req.id,
        success: true,
        ...data,
      }
    })
  )

  // Count successes and failures using proper types
  const processed = results.filter(
    (r): r is PromiseFulfilledResult<ProcessResult> => r.status === 'fulfilled' && r.value.success
  )
  const failed = results.filter(
    (r): r is PromiseRejectedResult | PromiseFulfilledResult<ProcessResult> =>
      r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
  )

  return successResponse({
    success: true,
    message: 'Export processing completed',
    total_requests: pendingRequests.length,
    processed_count: processed.length,
    failed_count: failed.length,
    results: results.map((r) =>
      r.status === 'fulfilled' ? r.value : { success: false, error: 'Unknown error' }
    ),
    timestamp: getCurrentTimestamp(),
  })
})

