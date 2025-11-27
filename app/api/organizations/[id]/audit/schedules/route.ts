/**
 * Audit Export Schedules API
 * Create and list export schedules
 */

import { createAuthenticatedRoute, successResponse, forbiddenError, badRequestError, internalError, requireOrganizationAccess } from '@/lib/api'
import { isUserOrgOwner } from '@/lib/db'
import { createExportSchedule, getExportSchedules } from '@/lib/audit/export'

/**
 * GET /api/organizations/[id]/audit/schedules
 * List export schedules for organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is admin
  await requireOrganizationAccess(user.id, id, true)

  // Get schedules
  const schedules = await getExportSchedules(id)

  return successResponse({ schedules })
})

/**
 * POST /api/organizations/[id]/audit/schedules
 * Create new export schedule
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is owner (only owners can create schedules)
  const isOwner = await isUserOrgOwner(user.id, id)
  if (!isOwner) {
    throw forbiddenError('Only organization owners can create export schedules')
  }

  // Parse request body
  const body = await request.json()
  const {
    name,
    description,
    frequency,
    day_of_week,
    day_of_month,
    time_of_day,
    export_format,
    lookback_days,
    event_types,
    user_ids,
    entity_types,
    notify_emails,
  } = body

  // Validate required fields
  if (!name || !frequency || !time_of_day || !export_format) {
    throw badRequestError('Missing required fields: name, frequency, time_of_day, export_format')
  }

  // Validate frequency
  if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
    throw badRequestError('Invalid frequency. Must be daily, weekly, or monthly')
  }

  // Validate frequency-specific fields
  if (frequency === 'weekly' && (day_of_week === undefined || day_of_week === null)) {
    throw badRequestError('day_of_week is required for weekly schedules (0-6)')
  }

  if (frequency === 'monthly' && (day_of_month === undefined || day_of_month === null)) {
    throw badRequestError('day_of_month is required for monthly schedules (1-31)')
  }

  // Validate day_of_week range
  if (day_of_week !== undefined && (day_of_week < 0 || day_of_week > 6)) {
    throw badRequestError('day_of_week must be between 0 (Sunday) and 6 (Saturday)')
  }

  // Validate day_of_month range
  if (day_of_month !== undefined && (day_of_month < 1 || day_of_month > 31)) {
    throw badRequestError('day_of_month must be between 1 and 31')
  }

  // Validate time format (HH:MM)
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(time_of_day)) {
    throw badRequestError('Invalid time_of_day format. Must be HH:MM (e.g., 09:00)')
  }

  // Validate export format
  if (!['csv', 'json', 'xlsx'].includes(export_format)) {
    throw badRequestError('Invalid export_format. Must be csv, json, or xlsx')
  }

  // Validate lookback_days
  const lookbackDaysValue = lookback_days || 30
  if (lookbackDaysValue < 1 || lookbackDaysValue > 365) {
    throw badRequestError('lookback_days must be between 1 and 365')
  }

  // Create schedule
  const { success, schedule, error } = await createExportSchedule(
    id,
    user.id,
    {
      name,
      description: description || undefined,
      frequency,
      day_of_week: day_of_week !== undefined ? day_of_week : undefined,
      day_of_month: day_of_month !== undefined ? day_of_month : undefined,
      time_of_day: time_of_day + ':00', // Add seconds
      export_format,
      lookback_days: lookbackDaysValue,
      event_types: event_types || undefined,
      user_ids: user_ids || undefined,
      entity_types: entity_types || undefined,
      notify_emails: notify_emails || undefined,
    }
  )

  if (!success || !schedule) {
    throw internalError(error || 'Failed to create export schedule')
  }

  return successResponse({ schedule }, 201)
})
