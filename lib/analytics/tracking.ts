/**
 * Analytics Tracking Functions
 * Track usage metrics and API calls
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { logger } from '@/lib/logging'

/**
 * Track API usage
 */
export async function trackApiUsage(params: {
  organizationId: string
  apiKeyId?: string | null
  userId?: string | null
  endpoint: string
  method: string
  statusCode: number
  responseTimeMs: number
  errorMessage?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}) {
  try {
    const supabase = createAdminClient()

    const { error } = await (supabase as any).from('api_usage_log').insert({
      organization_id: params.organizationId,
      api_key_id: params.apiKeyId,
      user_id: params.userId,
      endpoint: params.endpoint,
      method: params.method,
      status_code: params.statusCode,
      response_time_ms: params.responseTimeMs,
      error_message: params.errorMessage,
      ip_address: params.ipAddress,
      user_agent: params.userAgent,
    })

    if (error) {
      logger.error('Error tracking API usage', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in trackApiUsage', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error }
  }
}

/**
 * Increment organization usage metric for today
 */
export async function incrementOrganizationMetric(
  organizationId: string,
  metric:
    | 'api_calls'
    | 'api_errors'
    | 'webhooks_sent'
    | 'webhooks_failed'
    | 'courses_enrolled'
    | 'courses_completed'
) {
  try {
    const supabase = createAdminClient()
    const today = new Date().toISOString().split('T')[0]

    // Upsert metric (insert or increment)
    const { error } = await (supabase as any).rpc('increment_usage_metric', {
      p_organization_id: organizationId,
      p_metric_name: metric,
      p_increment: 1,
    })

    if (error) {
      // If RPC doesn't exist, fallback to manual upsert
      // Note: organization_usage_metrics uses metric_name/metric_value pattern
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const periodEnd = tomorrow.toISOString().split('T')[0]

      const { error: upsertError } = await (supabase as any)
        .from('organization_usage_metrics')
        .upsert({
          organization_id: organizationId,
          metric_name: metric,
          metric_value: 1,
          period_start: today,
          period_end: periodEnd,
        }, {
          onConflict: 'organization_id,metric_name,period_start',
        })

      if (upsertError) {
        logger.error('Error incrementing metric', undefined, { errorMsg: upsertError.message })
        return { success: false, error: upsertError }
      }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in incrementOrganizationMetric', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error }
  }
}

/**
 * Get organization usage metrics for a date range
 */
export async function getOrganizationMetrics(
  organizationId: string,
  options?: {
    startDate?: string // YYYY-MM-DD
    endDate?: string // YYYY-MM-DD
    limit?: number
  }
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('organization_usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .order('period_start', { ascending: false })

    if (options?.startDate) {
      query = query.gte('period_start', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('period_end', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error getting organization metrics', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      return { success: false, error, metrics: [] }
    }

    return { success: true, metrics: data || [] }
  } catch (error) {
    logger.error('Error in getOrganizationMetrics', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error, metrics: [] }
  }
}

/**
 * Get user activity metrics for a date range
 */
export async function getUserActivityMetrics(
  organizationId: string,
  options?: {
    userId?: string
    startDate?: string
    endDate?: string
    limit?: number
  }
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('user_activity_metrics')
      .select(`
        *,
        user:profiles(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('period_start', { ascending: false })

    if (options?.userId) {
      query = query.eq('user_id', options.userId)
    }

    if (options?.startDate) {
      query = query.gte('period_start', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('period_end', options.endDate)
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error getting user activity metrics', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      return { success: false, error, metrics: [] }
    }

    return { success: true, metrics: data || [] }
  } catch (error) {
    logger.error('Error in getUserActivityMetrics', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error, metrics: [] }
  }
}

/**
 * Get API usage logs for a date range
 */
export async function getApiUsageLogs(
  organizationId: string,
  options?: {
    startDate?: string
    endDate?: string
    endpoint?: string
    statusCode?: number
    limit?: number
    offset?: number
  }
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('api_usage_log')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (options?.startDate) {
      query = query.gte('created_at', options.startDate)
    }

    if (options?.endDate) {
      query = query.lte('created_at', options.endDate)
    }

    if (options?.endpoint) {
      query = query.eq('endpoint', options.endpoint)
    }

    if (options?.statusCode) {
      query = query.eq('status_code', options.statusCode)
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
      logger.error('Error getting API usage logs', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      return { success: false, error, logs: [] }
    }

    return { success: true, logs: data || [] }
  } catch (error) {
    logger.error('Error in getApiUsageLogs', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error, logs: [] }
  }
}

/**
 * Get aggregated statistics for an organization
 */
export async function getOrganizationStats(
  organizationId: string,
  days: number = 30
) {
  try {
    const supabase = createAdminClient()

    // Calculate date range
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    /** Usage metric record */
    interface UsageMetric {
      total_activities: number;
      api_calls: number;
      api_errors: number;
      credits_used: number;
      credits_added: number;
      webhooks_sent: number;
      webhooks_failed: number;
      courses_enrolled: number;
      courses_completed: number;
      members_added: number;
      members_removed: number;
    }

    // Get metrics for date range
    const { data: metrics, error } = await supabase
      .from('organization_usage_metrics')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('period_start', startDateStr)
      .lte('period_end', endDateStr)
      .order('period_start', { ascending: true }) as { data: UsageMetric[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error getting organization stats', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
      return { success: false, error, stats: null }
    }

    // Aggregate totals
    const stats = {
      period: {
        start: startDateStr,
        end: endDateStr,
        days,
      },
      totals: {
        activities: 0,
        api_calls: 0,
        api_errors: 0,
        credits_used: 0,
        credits_added: 0,
        webhooks_sent: 0,
        webhooks_failed: 0,
        courses_enrolled: 0,
        courses_completed: 0,
        members_added: 0,
        members_removed: 0,
      },
      daily: metrics || [],
      trends: {
        api_error_rate: 0,
        webhook_failure_rate: 0,
        course_completion_rate: 0,
        avg_daily_activities: 0,
      },
    }

    // Calculate totals and trends
    if (metrics && metrics.length > 0) {
      metrics.forEach((m) => {
        stats.totals.activities += m.total_activities || 0
        stats.totals.api_calls += m.api_calls || 0
        stats.totals.api_errors += m.api_errors || 0
        stats.totals.credits_used += m.credits_used || 0
        stats.totals.credits_added += m.credits_added || 0
        stats.totals.webhooks_sent += m.webhooks_sent || 0
        stats.totals.webhooks_failed += m.webhooks_failed || 0
        stats.totals.courses_enrolled += m.courses_enrolled || 0
        stats.totals.courses_completed += m.courses_completed || 0
        stats.totals.members_added += m.members_added || 0
        stats.totals.members_removed += m.members_removed || 0
      })

      // Calculate rates and averages
      if (stats.totals.api_calls > 0) {
        stats.trends.api_error_rate =
          (stats.totals.api_errors / stats.totals.api_calls) * 100
      }

      if (stats.totals.webhooks_sent > 0) {
        stats.trends.webhook_failure_rate =
          (stats.totals.webhooks_failed / stats.totals.webhooks_sent) * 100
      }

      if (stats.totals.courses_enrolled > 0) {
        stats.trends.course_completion_rate =
          (stats.totals.courses_completed / stats.totals.courses_enrolled) * 100
      }

      stats.trends.avg_daily_activities = stats.totals.activities / days
    }

    return { success: true, stats }
  } catch (error) {
    logger.error('Error in getOrganizationStats', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error, stats: null }
  }
}

/**
 * Get most active users
 */
export async function getMostActiveUsers(
  organizationId: string,
  days: number = 30,
  limit: number = 10
) {
  try {
    const supabase = createAdminClient()

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    const startDateStr = startDate.toISOString().split('T')[0]

    /** User activity metric */
    interface UserActivityMetric {
      user_id: string;
      total_actions: number;
      user: { full_name: string | null; email: string } | null;
    }

    const { data, error } = await supabase
      .from('user_activity_metrics')
      .select(`
        user_id,
        total_actions,
        user:profiles(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .gte('period_start', startDateStr) as { data: UserActivityMetric[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error getting most active users', undefined, { errorMsg: error.message })
      return { success: false, error, users: [] }
    }

    // Aggregate by user
    const userMap = new Map<
      string,
      { user_id: string; total_actions: number; user: UserActivityMetric['user'] }
    >()

    data?.forEach((metric) => {
      const existing = userMap.get(metric.user_id)
      if (existing) {
        existing.total_actions += metric.total_actions
      } else {
        userMap.set(metric.user_id, {
          user_id: metric.user_id,
          total_actions: metric.total_actions,
          user: metric.user,
        })
      }
    })

    // Sort and limit
    const users = Array.from(userMap.values())
      .sort((a, b) => b.total_actions - a.total_actions)
      .slice(0, limit)

    return { success: true, users }
  } catch (error) {
    logger.error('Error in getMostActiveUsers', undefined, { errorMsg: error instanceof Error ? error.message : String(error)   })
    return { success: false, error, users: [] }
  }
}

