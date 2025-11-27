/**
 * Audit Log Export Management
 * Export activity logs for compliance and data portability
 */

import { getSupabaseServer } from '@/lib/db/supabase-server'
import { logger } from '@/lib/logging'

export interface AuditExportJob {
  id: string
  organization_id: string
  export_format: 'csv' | 'json' | 'xlsx'
  date_from: string
  date_to: string
  event_types?: string[]
  user_ids?: string[]
  entity_types?: string[]
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_records: number
  file_size_bytes?: number
  file_url?: string
  file_path?: string
  expires_at?: string
  created_by: string
  started_at?: string
  completed_at?: string
  error_message?: string
  created_at: string
  updated_at: string
}

export interface AuditExportSchedule {
  id: string
  organization_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week?: number
  day_of_month?: number
  time_of_day: string
  export_format: 'csv' | 'json' | 'xlsx'
  lookback_days: number
  event_types?: string[]
  user_ids?: string[]
  entity_types?: string[]
  notify_emails?: string[]
  is_active: boolean
  last_run_at?: string
  next_run_at?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface AuditLogRecord {
  id: string
  organization_id: string
  user_id?: string
  user_email?: string
  user_name?: string
  action_type: string
  entity_type: string
  entity_id?: string
  description: string
  metadata?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}

/**
 * Create audit export job
 */
export async function createAuditExportJob(
  organizationId: string,
  userId: string,
  config: {
    export_format: 'csv' | 'json' | 'xlsx'
    date_from: string
    date_to: string
    event_types?: string[]
    user_ids?: string[]
    entity_types?: string[]
  }
): Promise<{ success: boolean; job?: AuditExportJob; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('audit_export_jobs')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...config,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating audit export job', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true, job: data as AuditExportJob }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in createAuditExportJob', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Get audit export jobs for organization
 */
export async function getAuditExportJobs(
  organizationId: string,
  options?: {
    limit?: number
    offset?: number
    status?: 'pending' | 'processing' | 'completed' | 'failed'
  }
): Promise<{
  jobs: AuditExportJob[]
  total: number
}> {
  try {
    const supabase = getSupabaseServer()
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0

    let query = supabase
      .from('audit_export_jobs')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error, count } = await query

    if (error) {
      logger.error('Error fetching audit export jobs', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { jobs: [], total: 0 }
    }

    return {
      jobs: (data as AuditExportJob[]) || [],
      total: count || 0,
    }
  } catch (error) {
    logger.error('Error in getAuditExportJobs', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { jobs: [], total: 0 }
  }
}

/**
 * Get audit export job by ID
 */
export async function getAuditExportJob(
  jobId: string
): Promise<AuditExportJob | null> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('audit_export_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error || !data) {
      return null
    }

    return data as AuditExportJob
  } catch (error) {
    logger.error('Error in getAuditExportJob', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return null
  }
}

/**
 * Update audit export job status
 */
export async function updateAuditExportJobStatus(
  jobId: string,
  status: 'processing' | 'completed' | 'failed',
  updates?: {
    total_records?: number
    file_size_bytes?: number
    file_url?: string
    file_path?: string
    expires_at?: string
    error_message?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const updateData: {
      status: 'processing' | 'completed' | 'failed';
      started_at?: string;
      completed_at?: string;
      total_records?: number;
      file_size_bytes?: number;
      file_url?: string;
      file_path?: string;
      expires_at?: string;
      error_message?: string;
    } = {
      status,
      ...updates,
    }

    if (status === 'processing') {
      updateData.started_at = new Date().toISOString()
    } else if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('audit_export_jobs')
      .update(updateData)
      .eq('id', jobId)

    if (error) {
      logger.error('Error updating audit export job', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in updateAuditExportJobStatus', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Get audit log records for export
 */
export async function getAuditLogRecords(
  organizationId: string,
  filters: {
    date_from: string
    date_to: string
    event_types?: string[]
    user_ids?: string[]
    entity_types?: string[]
    limit?: number
    offset?: number
  }
): Promise<AuditLogRecord[]> {
  try {
    const supabase = getSupabaseServer()

    // Note: get_audit_log_for_export RPC may not be in generated types
    const { data, error } = await supabase.rpc('get_audit_log_for_export' as never, {
      p_organization_id: organizationId,
      p_date_from: filters.date_from,
      p_date_to: filters.date_to,
      p_event_types: filters.event_types || null,
      p_user_ids: filters.user_ids || null,
      p_entity_types: filters.entity_types || null,
      p_limit: filters.limit || null,
      p_offset: filters.offset || 0,
    } as never)

    if (error) {
      logger.error('Error fetching audit log records', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return []
    }

    return (data as unknown as AuditLogRecord[]) || []
  } catch (error) {
    logger.error('Error in getAuditLogRecords', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return []
  }
}

/**
 * Generate CSV from audit log records
 */
export function generateAuditCSV(records: AuditLogRecord[]): string {
  const headers = [
    'Timestamp',
    'User Email',
    'User Name',
    'Action Type',
    'Entity Type',
    'Entity ID',
    'Description',
    'IP Address',
    'Metadata',
  ]

  const rows = records.map((record) => [
    record.created_at,
    record.user_email || 'N/A',
    record.user_name || 'N/A',
    record.action_type,
    record.entity_type,
    record.entity_id || 'N/A',
    `"${record.description.replace(/"/g, '""')}"`, // Escape quotes
    record.ip_address || 'N/A',
    record.metadata ? `"${JSON.stringify(record.metadata).replace(/"/g, '""')}"` : 'N/A',
  ])

  const csvLines = [headers.join(','), ...rows.map((row) => row.join(','))]

  return csvLines.join('\n')
}

/**
 * Generate JSON from audit log records
 */
export function generateAuditJSON(records: AuditLogRecord[]): string {
  return JSON.stringify(records, null, 2)
}

/**
 * Log export access
 */
export async function logExportAccess(
  exportJobId: string,
  organizationId: string,
  userId: string,
  metadata?: {
    ip_address?: string
    user_agent?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase
      .from('audit_export_access_log')
      .insert({
        export_job_id: exportJobId,
        organization_id: organizationId,
        accessed_by: userId,
        ip_address: metadata?.ip_address,
        user_agent: metadata?.user_agent,
      })

    if (error) {
      logger.error('Error logging export access', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in logExportAccess', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Get export access logs
 */
export async function getExportAccessLogs(
  exportJobId: string,
  options?: {
    limit?: number
    offset?: number
  }
): Promise<Array<{
  id: string;
  export_job_id: string;
  organization_id: string;
  accessed_by: string;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
}>> {
  try {
    const supabase = getSupabaseServer()
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0

    const { data, error } = await supabase
      .from('audit_export_access_log')
      .select('*')
      .eq('export_job_id', exportJobId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      logger.error('Error fetching export access logs', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error in getExportAccessLogs', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return []
  }
}

/**
 * Create scheduled export
 */
export async function createExportSchedule(
  organizationId: string,
  userId: string,
  config: {
    name: string
    description?: string
    frequency: 'daily' | 'weekly' | 'monthly'
    day_of_week?: number
    day_of_month?: number
    time_of_day: string
    export_format: 'csv' | 'json' | 'xlsx'
    lookback_days: number
    event_types?: string[]
    user_ids?: string[]
    entity_types?: string[]
    notify_emails?: string[]
  }
): Promise<{ success: boolean; schedule?: AuditExportSchedule; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('audit_export_schedules')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        ...config,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating export schedule', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true, schedule: data as AuditExportSchedule }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in createExportSchedule', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Get export schedules for organization
 */
export async function getExportSchedules(
  organizationId: string
): Promise<AuditExportSchedule[]> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('audit_export_schedules')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error fetching export schedules', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return []
    }

    return (data as AuditExportSchedule[]) || []
  } catch (error) {
    logger.error('Error in getExportSchedules', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return []
  }
}

/**
 * Update export schedule
 */
export async function updateExportSchedule(
  scheduleId: string,
  updates: Partial<Omit<AuditExportSchedule, 'id' | 'organization_id' | 'created_by' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase
      .from('audit_export_schedules')
      .update(updates)
      .eq('id', scheduleId)

    if (error) {
      logger.error('Error updating export schedule', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in updateExportSchedule', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Delete export schedule
 */
export async function deleteExportSchedule(
  scheduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase
      .from('audit_export_schedules')
      .delete()
      .eq('id', scheduleId)

    if (error) {
      logger.error('Error deleting export schedule', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in deleteExportSchedule', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}

/**
 * Get schedules due for execution
 */
export async function getDueExportSchedules(): Promise<AuditExportSchedule[]> {
  try {
    const supabase = getSupabaseServer()

    const { data, error } = await supabase
      .from('audit_export_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('next_run_at', new Date().toISOString())

    if (error) {
      logger.error('Error fetching due export schedules', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return []
    }

    return (data as AuditExportSchedule[]) || []
  } catch (error) {
    logger.error('Error in getDueExportSchedules', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return []
  }
}

/**
 * Mark schedule as executed
 */
export async function markScheduleExecuted(
  scheduleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase
      .from('audit_export_schedules')
      .update({
        last_run_at: new Date().toISOString(),
      })
      .eq('id', scheduleId)

    if (error) {
      logger.error('Error marking schedule as executed', error instanceof Error ? error : undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error))
    logger.error('Error in markScheduleExecuted', err, { errorMsg: err.message })
    return { success: false, error: err.message }
  }
}
