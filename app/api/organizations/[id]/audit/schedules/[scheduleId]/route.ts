/**
 * Audit Export Schedule Details API
 * Update and delete specific export schedules
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  badRequestError,
  internalError,
  requireOrganizationOwner,
} from '@/lib/api'
import {
  updateExportSchedule,
  deleteExportSchedule,
} from '@/lib/audit/export'
import { getSupabaseServer } from '@/lib/db/supabase-server'

/**
 * Verify schedule exists and belongs to organization
 */
async function getScheduleOrThrow(scheduleId: string, orgId: string) {
  const supabase = getSupabaseServer()
  const { data: schedule, error } = await supabase
    .from('audit_export_schedules')
    .select('*')
    .eq('id', scheduleId)
    .eq('organization_id', orgId)
    .single()

  if (error || !schedule) {
    throw notFoundError('Export schedule')
  }

  return schedule
}

/**
 * PATCH /api/organizations/[id]/audit/schedules/[scheduleId]
 * Update export schedule
 */
export const PATCH = createAuthenticatedRoute<{ id: string; scheduleId: string }>(
  async (request, context, user) => {
    const { id, scheduleId } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Verify schedule exists and belongs to organization
    await getScheduleOrThrow(scheduleId, id)

    // Parse request body
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    // Allow updating these fields
    const allowedFields = [
      'name',
      'description',
      'frequency',
      'day_of_week',
      'day_of_month',
      'time_of_day',
      'export_format',
      'lookback_days',
      'event_types',
      'user_ids',
      'entity_types',
      'notify_emails',
      'is_active',
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    // Validate frequency
    if (updates.frequency && !['daily', 'weekly', 'monthly'].includes(updates.frequency as string)) {
      throw badRequestError('Invalid frequency. Must be daily, weekly, or monthly')
    }

    // Validate export_format
    if (updates.export_format && !['csv', 'json', 'xlsx'].includes(updates.export_format as string)) {
      throw badRequestError('Invalid export_format. Must be csv, json, or xlsx')
    }

    // Validate time format
    if (updates.time_of_day) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/
      if (!timeRegex.test(updates.time_of_day as string)) {
        throw badRequestError('Invalid time_of_day format. Must be HH:MM or HH:MM:SS')
      }
      // Ensure seconds are included
      if (!(updates.time_of_day as string).includes(':00', 5)) {
        updates.time_of_day = updates.time_of_day + ':00'
      }
    }

    // Validate lookback_days
    if (updates.lookback_days !== undefined) {
      const days = updates.lookback_days as number
      if (days < 1 || days > 365) {
        throw badRequestError('lookback_days must be between 1 and 365')
      }
    }

    // Update schedule
    const { success, error } = await updateExportSchedule(scheduleId, updates)

    if (!success) {
      throw internalError(error || 'Failed to update export schedule')
    }

    return successResponse({ success: true })
  }
)

/**
 * DELETE /api/organizations/[id]/audit/schedules/[scheduleId]
 * Delete export schedule
 */
export const DELETE = createAuthenticatedRoute<{ id: string; scheduleId: string }>(
  async (_request, context, user) => {
    const { id, scheduleId } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Verify schedule exists and belongs to organization
    await getScheduleOrThrow(scheduleId, id)

    // Delete schedule
    const { success, error } = await deleteExportSchedule(scheduleId)

    if (!success) {
      throw internalError(error || 'Failed to delete export schedule')
    }

    return successResponse({ success: true })
  }
)
