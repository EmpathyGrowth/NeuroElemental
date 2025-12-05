/**
 * Activity Log Repository
 * Manages organization activity logging
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for activity logging.
 */

// Direct import to avoid circular dependency with @/lib/api barrel
import { internalError } from '@/lib/api/error-handler'
import { logger } from '@/lib/logging'
import type { Database } from '@/lib/types/supabase'
import { getCurrentTimestamp } from '@/lib/utils'
import { triggerWebhooks, type WebhookEvent } from '@/lib/webhooks/deliver'
import type { SupabaseClient } from '@supabase/supabase-js'
import { BaseRepository } from './base-repository'

type ActivityLog = Database['public']['Tables']['activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['activity_logs']['Insert']

/** JSON-serializable metadata values for activity logs */
type MetadataValue = string | number | boolean | null | undefined | MetadataValue[] | { [key: string]: MetadataValue }

export interface ActivityLogEntry {
  organization_id: string
  user_id?: string | null
  action_type: string
  entity_type: string
  entity_id?: string | null
  description: string
  metadata?: Record<string, MetadataValue> | null
  ip_address?: string | null
  user_agent?: string | null
}

/**
 * Activity Log Repository
 */
export class ActivityLogRepository extends BaseRepository<'activity_logs'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('activity_logs', supabase)
  }

  /**
   * Log an organization activity
   */
  async logActivity(entry: ActivityLogEntry): Promise<ActivityLog> {
    try {
      const activityData: ActivityLogInsert = {
        organization_id: entry.organization_id,
        user_id: entry.user_id,
        action: entry.action_type,
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        metadata: {
          description: entry.description,
          ...entry.metadata,
        },
        ip_address: entry.ip_address,
        user_agent: entry.user_agent,
      }

      const activity = await this.create(activityData)

      // Trigger webhooks for this event (non-blocking)
      // Action types align with webhook events
      const webhookData: Record<string, unknown> = {
        entity_type: entry.entity_type,
        entity_id: entry.entity_id,
        description: entry.description,
        user_id: entry.user_id,
        metadata: entry.metadata,
        timestamp: getCurrentTimestamp(),
      };
      triggerWebhooks({
        organizationId: entry.organization_id,
        event: entry.action_type as WebhookEvent,
        data: webhookData,
      }).catch((error) => {
        // Don't fail the activity log if webhook delivery fails
        logger.error('Error triggering webhooks', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })
      })

      return activity
    } catch (error) {
      logger.error('Error in logActivity', error as Error)
      throw error
    }
  }

  /**
   * Get activity log for an organization with filters
   */
  async getActivityLog(
    organizationId: string,
    options?: {
      limit?: number
      offset?: number
      actionType?: string
      entityType?: string
      userId?: string
    }
  ): Promise<Database['public']['Views']['organization_activity_log']['Row'][]> {
    try {
      let query = this.supabase
        .from('organization_activity_log')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      // Apply filters
      if (options?.actionType) {
        query = query.eq('action', options.actionType)
      }

      if (options?.entityType) {
        query = query.eq('entity_type', options.entityType)
      }

      if (options?.userId) {
        query = query.eq('user_id', options.userId)
      }

      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit)
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 50) - 1)
      }

      const { data, error } = await query

      if (error) {
        logger.error('Error getting activity log', error as Error)
        throw internalError('Failed to fetch activity log')
      }

      return data || []
    } catch (error) {
      logger.error('Error in getActivityLog', error as Error)
      throw error
    }
  }

  /**
   * Helper to format activity description
   * @param action - Activity action type
   * @param actorName - Name of the actor performing the action
   * @param details - Optional additional details
   * @returns Formatted activity description string
   */
  static formatDescription(
    action: string,
    actorName: string,
    details?: string
  ): string {
    const descriptions: Record<string, string> = {
      [ActivityActions.ORG_CREATED]: `${actorName} created the organization`,
      [ActivityActions.ORG_UPDATED]: `${actorName} updated organization settings`,
      [ActivityActions.ORG_DELETED]: `${actorName} deleted the organization`,
      [ActivityActions.MEMBER_INVITED]: `${actorName} invited a new member${details ? `: ${details}` : ''}`,
      [ActivityActions.MEMBER_JOINED]: `${actorName} joined the organization`,
      [ActivityActions.MEMBER_REMOVED]: `${actorName} removed a member${details ? `: ${details}` : ''}`,
      [ActivityActions.MEMBER_ROLE_CHANGED]: `${actorName} changed a member's role${details ? `: ${details}` : ''}`,
      [ActivityActions.MEMBER_LEFT]: `${actorName} left the organization`,
      [ActivityActions.CREDITS_ADDED]: `${actorName} added credits${details ? `: ${details}` : ''}`,
      [ActivityActions.CREDITS_PURCHASED]: `${actorName} purchased credits${details ? `: ${details}` : ''}`,
      [ActivityActions.CREDITS_USED]: `${actorName} used credits${details ? `: ${details}` : ''}`,
      [ActivityActions.INVITATION_SENT]: `${actorName} sent an invitation${details ? ` to ${details}` : ''}`,
      [ActivityActions.INVITATION_BULK_SENT]: `${actorName} sent bulk invitations${details ? `: ${details}` : ''}`,
      [ActivityActions.INVITATION_ACCEPTED]: `${actorName} accepted an invitation`,
      [ActivityActions.INVITATION_DECLINED]: `${actorName} declined an invitation`,
      [ActivityActions.SETTINGS_UPDATED]: `${actorName} updated settings${details ? `: ${details}` : ''}`,
    }

    return descriptions[action] || `${actorName} performed an action`
  }
}

// Export singleton instance
export const activityLogRepository = new ActivityLogRepository()

// Backward compatibility exports
/**
 * Log an activity entry (backward compatibility wrapper)
 * @deprecated Use activityLogRepository.logActivity() instead
 * @param entry - Activity log entry data
 * @returns Object with success and data/error properties
 * @example
 * const result = await logActivity({ organization_id: 'org-123', action: 'member.invited', actor_id: 'user-456' });
 */
export async function logActivity(entry: ActivityLogEntry) {
  try {
    const data = await activityLogRepository.logActivity(entry)
    return { success: true, data }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Get activity log for an organization (backward compatibility wrapper)
 * @deprecated Use activityLogRepository.getActivityLog() instead
 * @param organizationId - Organization ID
 * @param options - Optional filters for limit, offset, actionType, entityType, and userId
 * @returns Object with success and activities/error properties
 * @example
 * const result = await getActivityLog('org-123', { limit: 50, actionType: 'member.invited' });
 */
export async function getActivityLog(
  organizationId: string,
  options?: {
    limit?: number
    offset?: number
    actionType?: string
    entityType?: string
    userId?: string
  }
) {
  try {
    const activities = await activityLogRepository.getActivityLog(organizationId, options)
    return { success: true, activities }
  } catch (error) {
    return { success: false, error, activities: [] }
  }
}

/**
 * Activity log action types for consistency
 */
export const ActivityActions = {
  // Organization actions
  ORG_CREATED: 'organization.created',
  ORG_UPDATED: 'organization.updated',
  ORG_DELETED: 'organization.deleted',

  // Member actions
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  MEMBER_LEFT: 'member.left',

  // Credit actions
  CREDITS_ADDED: 'credits.added',
  CREDITS_PURCHASED: 'credits.purchased',
  CREDITS_USED: 'credits.used',
  CREDITS_EXPIRED: 'credits.expired',
  CREDITS_REFUNDED: 'credits.refunded',

  // Invitation actions
  INVITATION_SENT: 'invitation.sent',
  INVITATION_ACCEPTED: 'invitation.accepted',
  INVITATION_DECLINED: 'invitation.declined',
  INVITATION_EXPIRED: 'invitation.expired',
  INVITATION_BULK_SENT: 'invitation.bulk_sent',

  // Settings actions
  SETTINGS_UPDATED: 'settings.updated',
  SLUG_CHANGED: 'slug.changed',

  // Security actions
  API_KEY_CREATED: 'api_key.created',
  API_KEY_REVOKED: 'api_key.revoked',
  API_KEY_DELETED: 'api_key.deleted',

  // Course actions
  COURSE_ENROLLED: 'course.enrolled',
  COURSE_COMPLETED: 'course.completed',
  COURSE_PROGRESS: 'course.progress',
} as const

/**
 * Entity types for consistency
 */
export const EntityTypes = {
  ORGANIZATION: 'organization',
  MEMBER: 'member',
  CREDIT: 'credit',
  INVITATION: 'invitation',
  SETTINGS: 'settings',
  API_KEY: 'api_key',
  COURSE: 'course',
  ENROLLMENT: 'enrollment',
} as const

/**
 * Helper to format activity description
 * @deprecated Use ActivityLogRepository.formatDescription() instead
 * @param action - Activity action type
 * @param actorName - Name of the actor performing the action
 * @param details - Optional additional details
 * @returns Formatted activity description string
 * @example
 * const description = formatActivityDescription('member.invited', 'John Doe', 'jane@example.com');
 */
export function formatActivityDescription(
  action: string,
  actorName: string,
  details?: string
): string {
  return ActivityLogRepository.formatDescription(action, actorName, details)
}
