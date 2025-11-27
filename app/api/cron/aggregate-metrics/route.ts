/**
 * Metrics Aggregation Cron Job
 * Aggregates daily metrics from activity log into organization_usage_metrics
 * Should run daily at midnight via cron
 * Requires x-cron-secret header with CRON_SECRET value
 */

import { logger } from '@/lib/logging';
import { getSupabaseServer } from '@/lib/db'
import { createCronRoute, successResponse } from '@/lib/api'
import { getCurrentTimestamp } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface AggregationResult {
  organizationId: string;
  metrics: {
    api_calls: number;
    active_users: number;
    assessments_completed: number;
    courses_accessed: number;
    events_attended: number;
  };
}

/**
 * GET /api/cron/aggregate-metrics
 * Aggregate daily metrics from activity log (requires x-cron-secret header)
 */
export const GET = createCronRoute(async (request, _context) => {
  const supabase = getSupabaseServer()

  // Get target date from query param or use yesterday (since cron runs after midnight)
  const { searchParams } = new URL(request.url)
  const targetDateParam = searchParams.get('date')

  let targetDate: string
  if (targetDateParam) {
    targetDate = targetDateParam
  } else {
    // Default to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    targetDate = yesterday.toISOString().split('T')[0]
  }

  logger.info('Metrics aggregation started', { date: targetDate })

  const startOfDay = `${targetDate}T00:00:00.000Z`
  const endOfDay = `${targetDate}T23:59:59.999Z`

  // Get all organizations
  const { data: organizations, error: orgsError } = await supabase
    .from('organizations')
    .select('id')

  if (orgsError) {
    logger.error('Failed to fetch organizations for metrics aggregation', new Error(orgsError.message))
    throw new Error(`Failed to fetch organizations: ${orgsError.message}`)
  }

  const results: AggregationResult[] = []
  let successCount = 0
  let errorCount = 0

  for (const org of organizations || []) {
    try {
      // Aggregate API usage
      const { count: apiCalls } = await supabase
        .from('api_usage_log')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      // Aggregate active users (unique users with activity)
      const { data: activeUsersData } = await supabase
        .from('activity_logs')
        .select('user_id')
        .eq('organization_id', org.id)
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)
        .not('user_id', 'is', null)

      const uniqueUsers = new Set(activeUsersData?.map(a => a.user_id) || [])
      const activeUsers = uniqueUsers.size

      // Aggregate assessments completed
      const { count: assessmentsCompleted } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .eq('action', 'assessment.completed')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      // Aggregate course access
      const { count: coursesAccessed } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .like('action', 'course.%')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      // Aggregate events attended
      const { count: eventsAttended } = await supabase
        .from('activity_logs')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', org.id)
        .eq('action', 'event.attended')
        .gte('created_at', startOfDay)
        .lte('created_at', endOfDay)

      const metrics = {
        api_calls: apiCalls || 0,
        active_users: activeUsers,
        assessments_completed: assessmentsCompleted || 0,
        courses_accessed: coursesAccessed || 0,
        events_attended: eventsAttended || 0,
      }

      // Upsert each metric type to organization_usage_metrics table
      // The table uses metric_name + period_start/end pattern
      const metricsToInsert = [
        { metric_name: 'api_calls', metric_value: metrics.api_calls },
        { metric_name: 'active_users', metric_value: metrics.active_users },
        { metric_name: 'assessments_completed', metric_value: metrics.assessments_completed },
        { metric_name: 'courses_accessed', metric_value: metrics.courses_accessed },
        { metric_name: 'events_attended', metric_value: metrics.events_attended },
      ]

      let orgSuccess = true
      for (const metric of metricsToInsert) {
        const { error: upsertError } = await supabase
          .from('organization_usage_metrics')
          .upsert({
            organization_id: org.id,
            metric_name: metric.metric_name,
            metric_value: metric.metric_value,
            period_start: startOfDay,
            period_end: endOfDay,
            updated_at: getCurrentTimestamp(),
          }, {
            onConflict: 'organization_id,metric_name,period_start'
          })

        if (upsertError) {
          logger.error(`Failed to upsert ${metric.metric_name} for org ${org.id}`, new Error(upsertError.message))
          orgSuccess = false
        }
      }

      if (orgSuccess) {
        successCount++
        results.push({ organizationId: org.id, metrics })
      } else {
        errorCount++
      }
    } catch (err) {
      logger.error(`Error aggregating metrics for org ${org.id}`, err instanceof Error ? err : new Error(String(err)))
      errorCount++
    }
  }

  logger.info('Metrics aggregation completed', {
    date: targetDate,
    totalOrgs: organizations?.length || 0,
    successCount,
    errorCount,
  })

  return successResponse({
    success: errorCount === 0,
    date: targetDate,
    timestamp: getCurrentTimestamp(),
    summary: {
      totalOrganizations: organizations?.length || 0,
      successfulAggregations: successCount,
      failedAggregations: errorCount,
    },
  })
})

