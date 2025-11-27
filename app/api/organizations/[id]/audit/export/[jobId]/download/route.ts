/**
 * Audit Export Job Download API
 * Download completed export files
 */

import { NextResponse } from 'next/server'
import { createAuthenticatedRoute, notFoundError, badRequestError, requireOrganizationAccess } from '@/lib/api'
import { getAuditExportJob, logExportAccess } from '@/lib/audit/export'

/**
 * GET /api/organizations/[id]/audit/export/[jobId]/download
 * Download export file
 */
export const GET = createAuthenticatedRoute<{ id: string; jobId: string }>(async (request, context, user) => {
  const { id, jobId } = await context.params

  // Check if user is admin
  await requireOrganizationAccess(user.id, id, true)

  // Get job details
  const job = await getAuditExportJob(jobId)

  if (!job) {
    throw notFoundError('Export job not found')
  }

  // Verify job belongs to organization
  if (job.organization_id !== id) {
    throw notFoundError('Export job not found')
  }

  // Check if job is completed
  if (job.status !== 'completed') {
    throw badRequestError(`Export job is not completed (status: ${job.status})`)
  }

  // Check if file exists
  if (!job.file_path) {
    throw notFoundError('Export file not found')
  }

  // Log access
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
  const userAgent = request.headers.get('user-agent') || undefined

  await logExportAccess(jobId, id, user.id, {
    ip_address: ipAddress,
    user_agent: userAgent,
  })

  // Parse file content from database (stored as JSON stringified content)
  let fileContent: string
  try {
    fileContent = JSON.parse(job.file_path)
  } catch {
    // If not JSON, treat as raw content
    fileContent = job.file_path
  }

  // Determine content type and filename based on format
  const timestamp = new Date(job.created_at).toISOString().split('T')[0]
  let contentType: string
  let filename: string

  switch (job.export_format) {
    case 'csv':
      contentType = 'text/csv'
      filename = `audit-log-${timestamp}.csv`
      break
    case 'json':
      contentType = 'application/json'
      filename = `audit-log-${timestamp}.json`
      break
    case 'xlsx':
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      filename = `audit-log-${timestamp}.xlsx`
      break
    default:
      contentType = 'text/plain'
      filename = `audit-log-${timestamp}.txt`
  }

  // Return file with appropriate headers
  return new NextResponse(fileContent, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(Buffer.byteLength(fileContent, 'utf-8')),
    },
  })
})
