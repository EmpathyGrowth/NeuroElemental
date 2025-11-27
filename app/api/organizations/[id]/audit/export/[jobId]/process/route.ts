/**
 * Audit Export Job Processing API
 * Internal endpoint to process export jobs (requires CRON_SECRET)
 */

import { logger } from '@/lib/logging';
import { createPublicRoute, successResponse, unauthorizedError, notFoundError, badRequestError, internalError } from '@/lib/api'
import { getAuditExportJob, updateAuditExportJobStatus, getAuditLogRecords, generateAuditCSV, generateAuditJSON } from '@/lib/audit/export'

/**
 * POST /api/organizations/[id]/audit/export/[jobId]/process
 * Process export job (internal - requires CRON_SECRET)
 */
export const POST = createPublicRoute<{ id: string; jobId: string }>(async (request, context) => {
  // Verify CRON_SECRET
  const cronSecret = request.headers.get('x-cron-secret')
  if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
    throw unauthorizedError('Invalid CRON_SECRET')
  }

  const { id, jobId } = await context.params

  // Get job details
  const job = await getAuditExportJob(jobId)

  if (!job) {
    throw notFoundError('Export job not found')
  }

  // Verify job belongs to organization
  if (job.organization_id !== id) {
    throw notFoundError('Export job not found')
  }

  // Verify job is pending
  if (job.status !== 'pending') {
    throw badRequestError(`Job is not pending (status: ${job.status})`)
  }

  // Update status to processing
  await updateAuditExportJobStatus(jobId, 'processing')

  try {
    // Fetch audit log records
    const records = await getAuditLogRecords(id, {
      date_from: job.date_from,
      date_to: job.date_to,
      event_types: job.event_types || undefined,
      user_ids: job.user_ids || undefined,
      entity_types: job.entity_types || undefined,
    })

    // Generate file content based on format
    let fileContent: string

    switch (job.export_format) {
      case 'csv':
        fileContent = generateAuditCSV(records)
        break
      case 'json':
        fileContent = generateAuditJSON(records)
        break
      case 'xlsx':
        // For now, XLSX exports as CSV (can be enhanced later)
        fileContent = generateAuditCSV(records)
        break
      default:
        throw internalError(`Unsupported export format: ${job.export_format}`)
    }

    // Calculate file size
    const fileSizeBytes = Buffer.byteLength(fileContent, 'utf-8')

    // Store file content in database (JSON stringified)
    // In production, this would upload to S3/storage and store URL
    const filePath = JSON.stringify(fileContent)

    // Set expiration (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Update job as completed
    await updateAuditExportJobStatus(jobId, 'completed', {
      total_records: records.length,
      file_size_bytes: fileSizeBytes,
      file_path: filePath,
      expires_at: expiresAt.toISOString(),
    })

    return successResponse({
      success: true,
      records: records.length,
      file_size_bytes: fileSizeBytes,
    })
  } catch (processingError: any) {
    logger.error('Error processing export job:', processingError as Error)

    // Update job as failed
    await updateAuditExportJobStatus(jobId, 'failed', {
      error_message: processingError.message || 'Unknown error during processing',
    })

    throw internalError('Failed to process export job')
  }
})
