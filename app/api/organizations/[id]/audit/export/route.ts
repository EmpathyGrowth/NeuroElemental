/**
 * Audit Export Jobs API
 * Create and list audit export jobs
 */

import { createAuthenticatedRoute, successResponse, badRequestError, internalError, requireOrganizationAccess } from '@/lib/api'
import { createAuditExportJob, getAuditExportJobs } from '@/lib/audit/export'

/**
 * GET /api/organizations/[id]/audit/export
 * List export jobs for organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params
  const { searchParams } = new URL(request.url)

  // Check if user is admin
  await requireOrganizationAccess(user.id, id, true)

  // Parse query parameters
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  const status = searchParams.get('status') as
    | 'pending'
    | 'processing'
    | 'completed'
    | 'failed'
    | null

  // Get export jobs
  const { jobs, total } = await getAuditExportJobs(id, {
    limit,
    offset,
    status: status || undefined,
  })

  return successResponse({
    jobs,
    total,
    pagination: {
      limit,
      offset,
    },
  })
})

/**
 * POST /api/organizations/[id]/audit/export
 * Create new export job
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is admin
  await requireOrganizationAccess(user.id, id, true)

  // Parse request body
  const body = await request.json()
  const {
    export_format,
    date_from,
    date_to,
    event_types,
    user_ids,
    entity_types,
  } = body

  // Validate required fields
  if (!export_format || !date_from || !date_to) {
    throw badRequestError('Missing required fields: export_format, date_from, date_to')
  }

  // Validate export format
  if (!['csv', 'json', 'xlsx'].includes(export_format)) {
    throw badRequestError('Invalid export_format. Must be csv, json, or xlsx')
  }

  // Validate date range (max 1 year)
  const dateFrom = new Date(date_from)
  const dateTo = new Date(date_to)

  if (isNaN(dateFrom.getTime()) || isNaN(dateTo.getTime())) {
    throw badRequestError('Invalid date format')
  }

  if (dateTo < dateFrom) {
    throw badRequestError('date_to must be after date_from')
  }

  const daysDiff = (dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)
  if (daysDiff > 365) {
    throw badRequestError('Date range cannot exceed 1 year (365 days)')
  }

  // Create export job
  const { success, job, error } = await createAuditExportJob(
    id,
    user.id,
    {
      export_format,
      date_from,
      date_to,
      event_types: event_types || undefined,
      user_ids: user_ids || undefined,
      entity_types: entity_types || undefined,
    }
  )

  if (!success || !job) {
    throw internalError(error || 'Failed to create export job')
  }

  return successResponse({ job }, 201)
})
