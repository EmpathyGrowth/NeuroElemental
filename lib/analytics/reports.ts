/**
 * Reports Generation Functions
 * Generate and export usage reports
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { getOrganizationMetrics, getUserActivityMetrics } from './tracking'
import { getActivityLog } from '@/lib/db'
import { logger } from '@/lib/logging'
import { getCurrentTimestamp } from '@/lib/utils'
import type { Database, Json } from '@/lib/types/supabase'

type UsageReportInsert = Database['public']['Tables']['usage_reports']['Insert']

/** Activity log entry */
interface ActivityEntry {
  created_at: string;
  user_id: string;
  action_type: string;
  entity_type: string;
  description: string;
  user?: { email: string } | null;
}

/** Usage metric entry */
interface UsageMetricEntry {
  date: string;
  total_activities: number;
  api_calls: number;
  api_errors: number;
  credits_used: number;
  credits_added: number;
  webhooks_sent: number;
  webhooks_failed: number;
}

/** User activity metric entry */
interface UserActivityEntry {
  user_id: string;
  total_actions: number;
  last_active_at?: string;
  user?: { full_name: string | null; email: string } | null;
}

/** User aggregate data */
interface UserAggregate {
  user_id: string;
  total_actions: number;
  user: { full_name: string | null; email: string } | null;
  last_active: string;
}

// Report insert uses inline objects with 'any' cast for Supabase type flexibility

/** Report with generator profile - exported for type use */
export interface ReportWithGenerator {
  id: string;
  organization_id: string;
  report_type: string;
  start_date: string;
  end_date: string;
  data: unknown;
  format: string;
  created_at: string;
  generated_by_user?: { full_name: string | null; email: string } | null;
}

export type ReportType =
  | 'activity'
  | 'usage'
  | 'members'
  | 'credits'
  | 'api'
  | 'custom'

export interface ReportOptions {
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  format?: 'json' | 'csv' | 'pdf'
  includeRawData?: boolean
}

/**
 * Generate activity report
 */
export async function generateActivityReport(
  organizationId: string,
  userId: string,
  options: ReportOptions
) {
  try {
    const supabase = createAdminClient()

    // Get activity log for date range
    const activityResult = await getActivityLog(organizationId, {
      limit: 10000, // Large limit for reports
    })

    if (!activityResult.success) {
      return { success: false, error: activityResult.error }
    }

    // Filter by date range
    const activities = (activityResult.activities as ActivityEntry[]).filter((a) => {
      const activityDate = new Date(a.created_at).toISOString().split('T')[0]
      return activityDate >= options.startDate && activityDate <= options.endDate
    })

    // Generate summary
    const summary = {
      total_activities: activities.length,
      uniqueusers: new Set(activities.map((a) => a.user_id)).size,
      by_action_type: {} as Record<string, number>,
      by_entity_type: {} as Record<string, number>,
      by_date: {} as Record<string, number>,
    }

    activities.forEach((activity) => {
      // Count by action type
      summary.by_action_type[activity.action_type] =
        (summary.by_action_type[activity.action_type] || 0) + 1

      // Count by entity type
      summary.by_entity_type[activity.entity_type] =
        (summary.by_entity_type[activity.entity_type] || 0) + 1

      // Count by date
      const date = new Date(activity.created_at).toISOString().split('T')[0]
      summary.by_date[date] = (summary.by_date[date] || 0) + 1
    })

    // Create report data
    const reportData = {
      type: 'activity' as const,
      period: {
        start: options.startDate,
        end: options.endDate,
      },
      summary,
      activities: options.includeRawData ? activities : undefined,
      generated_at: getCurrentTimestamp(),
    }

    // Save report
    const { data: report, error } = await supabase
      .from('usage_reports')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        report_type: 'activity',
        start_date: options.startDate,
        end_date: options.endDate,
        data: reportData as unknown as Json,
        format: options.format || 'json',
      } satisfies UsageReportInsert)
      .select()
      .single()

    if (error) {
      logger.error('Error saving activity report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error }
    }

    return { success: true, report }
  } catch (error) {
    logger.error('Error generating activity report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

/**
 * Generate usage report
 */
export async function generateUsageReport(
  organizationId: string,
  userId: string,
  options: ReportOptions
) {
  try {
    const supabase = createAdminClient()

    // Get usage metrics for date range
    const metricsResult = await getOrganizationMetrics(organizationId, {
      startDate: options.startDate,
      endDate: options.endDate,
    })

    if (!metricsResult.success) {
      return { success: false, error: metricsResult.error }
    }

    const metrics = metricsResult.metrics as UsageMetricEntry[]

    // Generate summary
    const summary = {
      total_activities: 0,
      total_api_calls: 0,
      total_api_errors: 0,
      total_credits_used: 0,
      total_credits_added: 0,
      total_webhooks_sent: 0,
      total_webhooks_failed: 0,
      avg_daily_activities: 0,
      api_error_rate: 0,
      webhook_failure_rate: 0,
    }

    metrics.forEach((m) => {
      summary.total_activities += m.total_activities || 0
      summary.total_api_calls += m.api_calls || 0
      summary.total_api_errors += m.api_errors || 0
      summary.total_credits_used += m.credits_used || 0
      summary.total_credits_added += m.credits_added || 0
      summary.total_webhooks_sent += m.webhooks_sent || 0
      summary.total_webhooks_failed += m.webhooks_failed || 0
    })

    // Calculate rates
    const days =
      Math.ceil(
        (new Date(options.endDate).getTime() -
          new Date(options.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
      ) + 1

    summary.avg_daily_activities = summary.total_activities / days

    if (summary.total_api_calls > 0) {
      summary.api_error_rate =
        (summary.total_api_errors / summary.total_api_calls) * 100
    }

    if (summary.total_webhooks_sent > 0) {
      summary.webhook_failure_rate =
        (summary.total_webhooks_failed / summary.total_webhooks_sent) * 100
    }

    // Create report data
    const reportData = {
      type: 'usage' as const,
      period: {
        start: options.startDate,
        end: options.endDate,
        days,
      },
      summary,
      daily_metrics: options.includeRawData ? metrics : undefined,
      generated_at: getCurrentTimestamp(),
    }

    // Save report
    const { data: report, error } = await supabase
      .from('usage_reports')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        report_type: 'usage',
        start_date: options.startDate,
        end_date: options.endDate,
        data: reportData as unknown as Json,
        format: options.format || 'json',
      } satisfies UsageReportInsert)
      .select()
      .single()

    if (error) {
      logger.error('Error saving usage report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error }
    }

    return { success: true, report }
  } catch (error) {
    logger.error('Error generating usage report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

/**
 * Generate members report
 */
export async function generateMembersReport(
  organizationId: string,
  userId: string,
  options: ReportOptions
) {
  try {
    const supabase = createAdminClient()

    // Get user activity metrics
    const metricsResult = await getUserActivityMetrics(organizationId, {
      startDate: options.startDate,
      endDate: options.endDate,
    })

    if (!metricsResult.success) {
      return { success: false, error: metricsResult.error }
    }

    // Aggregate by user
    const userMap = new Map<string, UserAggregate>()

    const metricsData = metricsResult.metrics as UserActivityEntry[]
    metricsData.forEach((metric) => {
      const existing = userMap.get(metric.user_id)
      if (existing) {
        existing.total_actions += metric.total_actions || 0
        if (
          metric.last_active_at &&
          new Date(metric.last_active_at) > new Date(existing.last_active)
        ) {
          existing.last_active = metric.last_active_at
        }
      } else {
        userMap.set(metric.user_id, {
          user_id: metric.user_id,
          total_actions: metric.total_actions || 0,
          user: metric.user || null,
          last_active: metric.last_active_at || '',
        })
      }
    })

    const users = Array.from(userMap.values()).sort(
      (a, b) => b.total_actions - a.total_actions
    )

    // Generate summary
    const totalActions = users.reduce((sum, u) => sum + u.total_actions, 0)
    const summary = {
      total_members: users.length,
      active_members: users.filter((u) => u.total_actions > 0).length,
      total_actions: totalActions,
      avg_actions_per_member: users.length > 0 ? totalActions / users.length : 0,
      most_activeuser: users[0] || null,
    }

    // Create report data
    const reportData = {
      type: 'members' as const,
      period: {
        start: options.startDate,
        end: options.endDate,
      },
      summary,
      members: users,
      generated_at: getCurrentTimestamp(),
    }

    // Save report
    const { data: report, error } = await supabase
      .from('usage_reports')
      .insert({
        organization_id: organizationId,
        created_by: userId,
        report_type: 'members',
        start_date: options.startDate,
        end_date: options.endDate,
        data: reportData as unknown as Json,
        format: options.format || 'json',
      } satisfies UsageReportInsert)
      .select()
      .single()

    if (error) {
      logger.error('Error saving members report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error }
    }

    return { success: true, report }
  } catch (error) {
    logger.error('Error generating members report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

/**
 * Get all reports for an organization
 */
export async function getOrganizationReports(
  organizationId: string,
  options?: {
    reportType?: ReportType
    limit?: number
    offset?: number
  }
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('usage_reports')
      .select(`
        *,
        generated_by_user:profiles!usage_reports_generated_by_fkey(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (options?.reportType) {
      query = query.eq('report_type', options.reportType)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      )
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error getting organization reports', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error, reports: [] }
    }

    return { success: true, reports: data || [] }
  } catch (error) {
    logger.error('Error in getOrganizationReports', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error, reports: [] }
  }
}

/**
 * Get a specific report by ID
 */
export async function getReport(reportId: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('usage_reports')
      .select(`
        *,
        generated_by_user:profiles!usage_reports_generated_by_fkey(full_name, email)
      `)
      .eq('id', reportId)
      .single()

    if (error) {
      logger.error('Error getting report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error, report: null }
    }

    return { success: true, report: data }
  } catch (error) {
    logger.error('Error in getReport', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error, report: null }
  }
}

/**
 * Delete a report
 */
export async function deleteReport(reportId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('usage_reports')
      .delete()
      .eq('id', reportId)

    if (error) {
      logger.error('Error deleting report', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in deleteReport', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
    return { success: false, error }
  }
}

/** Report data for export */
interface ExportReportData {
  data: {
    type: 'activity' | 'usage' | 'members';
    activities?: ActivityEntry[];
    daily_metrics?: UsageMetricEntry[];
    members?: UserAggregate[];
  };
}

/**
 * Export report to CSV format
 */
export function exportReportToCSV(report: ExportReportData): string {
  const data = report.data

  if (data.type === 'activity') {
    // CSV for activity report
    let csv = 'Date,Action Type,Entity Type,Description,User\n'

    if (data.activities) {
      data.activities.forEach((activity) => {
        const date = new Date(activity.created_at).toISOString()
        const row = [
          date,
          activity.action_type,
          activity.entity_type,
          `"${activity.description.replace(/"/g, '""')}"`,
          activity.user?.email || 'N/A',
        ].join(',')
        csv += row + '\n'
      })
    }

    return csv
  } else if (data.type === 'usage') {
    // CSV for usage report
    let csv =
      'Date,Activities,API Calls,API Errors,Credits Used,Webhooks Sent,Webhooks Failed\n'

    if (data.daily_metrics) {
      data.daily_metrics.forEach((metric) => {
        const row = [
          metric.date,
          metric.total_activities || 0,
          metric.api_calls || 0,
          metric.api_errors || 0,
          metric.credits_used || 0,
          metric.webhooks_sent || 0,
          metric.webhooks_failed || 0,
        ].join(',')
        csv += row + '\n'
      })
    }

    return csv
  } else if (data.type === 'members') {
    // CSV for members report
    let csv = 'User,Email,Total Actions,Last Active\n'

    if (data.members) {
      data.members.forEach((member) => {
        const row = [
          `"${member.user?.full_name || 'N/A'}"`,
          member.user?.email || 'N/A',
          member.total_actions,
          member.last_active || 'N/A',
        ].join(',')
        csv += row + '\n'
      })
    }

    return csv
  }

  return 'No data available'
}

