/**
 * Process Audit Exports Cron Job
 * Finds and processes pending export jobs
 */

import { createCronRoute, successResponse, internalError } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db/supabase-server'
import { logger } from '@/lib/logging/logger'

/**
 * GET /api/cron/process-audit-exports
 * Process pending export jobs (requires CRON_SECRET)
 */
export const GET = createCronRoute(async (request) => {
  const supabase = getSupabaseServer()
  const cronSecret = request.headers.get('x-cron-secret')!

  // Find all pending jobs
  const { data: pendingJobs, error: fetchError } = await supabase
    .from('audit_export_jobs')
    .select('id, organization_id')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(10) // Process max 10 jobs per run

  if (fetchError) {
    logger.error('Error fetching pending jobs', fetchError)
    throw internalError('Failed to fetch pending jobs')
  }

  if (!pendingJobs || pendingJobs.length === 0) {
    return successResponse({
      message: 'No pending jobs to process',
      processed: 0,
    })
  }

  // Process each job
  const results = []
  for (const job of pendingJobs) {
    try {
      // Call the process endpoint for this job
      const processUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/organizations/${job.organization_id}/audit/export/${job.id}/process`

      const response = await fetch(processUrl, {
        method: 'POST',
        headers: {
          'x-cron-secret': cronSecret,
        },
      })

      if (response.ok) {
        const data = await response.json()
        results.push({
          jobId: job.id,
          success: true,
          records: data.records,
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        results.push({
          jobId: job.id,
          success: false,
          error: errorData.error || 'Unknown error',
        })
      }
    } catch (error) {
      logger.error(`Error processing job ${job.id}`, error instanceof Error ? error : new Error(String(error)))
      results.push({
        jobId: job.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const successCount = results.filter((r) => r.success).length
  const failureCount = results.filter((r) => !r.success).length

  return successResponse({
    message: 'Processing completed',
    processed: results.length,
    successful: successCount,
    failed: failureCount,
    results,
  })
})
