/**
 * Webhook Management
 * Functions for creating, managing, and delivering webhooks
 */

import { logger } from '@/lib/logging';
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Available webhook events
 * Based on ActivityActions from activity-log.ts
 */
export const WEBHOOK_EVENTS = {
  // Organization events
  ORG_CREATED: 'organization.created',
  ORG_UPDATED: 'organization.updated',
  ORG_DELETED: 'organization.deleted',

  // Member events
  MEMBER_INVITED: 'member.invited',
  MEMBER_JOINED: 'member.joined',
  MEMBER_REMOVED: 'member.removed',
  MEMBER_ROLE_CHANGED: 'member.role_changed',
  MEMBER_LEFT: 'member.left',

  // Credit events
  CREDITS_ADDED: 'credits.added',
  CREDITS_PURCHASED: 'credits.purchased',
  CREDITS_USED: 'credits.used',
  CREDITS_EXPIRED: 'credits.expired',
  CREDITS_REFUNDED: 'credits.refunded',

  // Invitation events
  INVITATION_SENT: 'invitation.sent',
  INVITATION_ACCEPTED: 'invitation.accepted',
  INVITATION_DECLINED: 'invitation.declined',
  INVITATION_EXPIRED: 'invitation.expired',
  INVITATION_BULK_SENT: 'invitation.bulk_sent',

  // API key events
  API_KEY_CREATED: 'api_key.created',
  API_KEY_REVOKED: 'api_key.revoked',
  API_KEY_DELETED: 'api_key.deleted',

  // Course events (can be added based on your needs)
  COURSE_ENROLLED: 'course.enrolled',
  COURSE_COMPLETED: 'course.completed',
  COURSE_PROGRESS: 'course.progress',
} as const

export type WebhookEvent = typeof WEBHOOK_EVENTS[keyof typeof WEBHOOK_EVENTS]

export interface WebhookPayload {
  id: string
  event: WebhookEvent
  organization_id: string
  timestamp: string
  data: Record<string, unknown>
}

/**
 * Generate a secure webhook secret
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Sign a webhook payload with HMAC-SHA256
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
}

/**
 * Verify a webhook signature
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = signWebhookPayload(payload, secret)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Create a new webhook
 */
export async function createWebhook(params: {
  organizationId: string
  name: string
  url: string
  events: WebhookEvent[]
  createdBy: string
}) {
  try {
    const supabase = createAdminClient()

    // Validate URL
    try {
      new URL(params.url)
    } catch {
      return { success: false, error: 'Invalid URL format' }
    }

    // Validate events
    const validEvents = Object.values(WEBHOOK_EVENTS)
    const invalidEvents = params.events.filter(e => !validEvents.includes(e))
    if (invalidEvents.length > 0) {
      return {
        success: false,
        error: `Invalid events: ${invalidEvents.join(', ')}`,
      }
    }

    // Generate secret
    const secret = generateWebhookSecret()

    // Create webhook
    const { data, error } = await supabase
      .from('webhooks')
      .insert({
        organization_id: params.organizationId,
        name: params.name,
        url: params.url,
        events: params.events,
        secret,
        created_by: params.createdBy,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating webhook:', error as Error)
      return { success: false, error }
    }

    return {
      success: true,
      webhook: data,
      secret, // Return secret only once during creation
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in createWebhook:', err as Error)
    return { success: false, error }
  }
}

/**
 * List webhooks for an organization
 */
export async function listWebhooks(organizationId: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('webhooks')
      .select(`
        id,
        name,
        url,
        events,
        is_active,
        last_triggered_at,
        created_at,
        created_by:profiles(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error listing webhooks:', error as Error)
      return { success: false, error, webhooks: [] }
    }

    return { success: true, webhooks: data || [] }
  } catch (error) {
    logger.error('Error in listWebhooks:', error as Error)
    return { success: false, error, webhooks: [] }
  }
}

/**
 * Update a webhook
 */
export async function updateWebhook(
  webhookId: string,
  organizationId: string,
  updates: {
    name?: string
    url?: string
    events?: WebhookEvent[]
    is_active?: boolean
  }
) {
  try {
    const supabase = createAdminClient()

    // Validate URL if provided
    if (updates.url) {
      try {
        new URL(updates.url)
      } catch {
        return { success: false, error: 'Invalid URL format' }
      }
    }

    // Validate events if provided
    if (updates.events) {
      const validEvents = Object.values(WEBHOOK_EVENTS)
      const invalidEvents = updates.events.filter(e => !validEvents.includes(e))
      if (invalidEvents.length > 0) {
        return {
          success: false,
          error: `Invalid events: ${invalidEvents.join(', ')}`,
        }
      }
    }

    const { error } = await supabase
      .from('webhooks')
      .update(updates)
      .eq('id', webhookId)
      .eq('organization_id', organizationId)

    if (error) {
      logger.error('Error updating webhook:', error as Error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in updateWebhook:', error as Error)
    return { success: false, error }
  }
}

/**
 * Delete a webhook
 */
export async function deleteWebhook(webhookId: string, organizationId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId)
      .eq('organization_id', organizationId)

    if (error) {
      logger.error('Error deleting webhook:', error as Error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in deleteWebhook:', error as Error)
    return { success: false, error }
  }
}

/**
 * Regenerate webhook secret
 */
export async function regenerateWebhookSecret(
  webhookId: string,
  organizationId: string
) {
  try {
    const supabase = createAdminClient()

    const newSecret = generateWebhookSecret()

    const { error } = await supabase
      .from('webhooks')
      .update({ secret: newSecret })
      .eq('id', webhookId)
      .eq('organization_id', organizationId)

    if (error) {
      logger.error('Error regenerating webhook secret:', error as Error)
      return { success: false, error }
    }

    return {
      success: true,
      secret: newSecret, // Return new secret only once
    }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in regenerateWebhookSecret:', err as Error)
    return { success: false, error }
  }
}

/**
 * Get webhook deliveries for a webhook
 */
export async function getWebhookDeliveries(
  webhookId: string,
  options?: {
    limit?: number
    offset?: number
    status?: 'pending' | 'success' | 'failed'
  }
) {
  try {
    const supabase = createAdminClient()

    let query = supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })

    if (options?.status) {
      query = query.eq('status', options.status)
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
      logger.error('Error getting webhook deliveries:', error as Error)
      return { success: false, error, deliveries: [] }
    }

    return { success: true, deliveries: data || [] }
  } catch (error) {
    logger.error('Error in getWebhookDeliveries:', error as Error)
    return { success: false, error, deliveries: [] }
  }
}

/**
 * Get event descriptions for UI
 */
export function getEventDescription(event: WebhookEvent): string {
  const descriptions: Record<WebhookEvent, string> = {
    [WEBHOOK_EVENTS.ORG_CREATED]: 'Organization created',
    [WEBHOOK_EVENTS.ORG_UPDATED]: 'Organization updated',
    [WEBHOOK_EVENTS.ORG_DELETED]: 'Organization deleted',
    [WEBHOOK_EVENTS.MEMBER_INVITED]: 'Member invited to organization',
    [WEBHOOK_EVENTS.MEMBER_JOINED]: 'Member joined organization',
    [WEBHOOK_EVENTS.MEMBER_REMOVED]: 'Member removed from organization',
    [WEBHOOK_EVENTS.MEMBER_ROLE_CHANGED]: 'Member role changed',
    [WEBHOOK_EVENTS.MEMBER_LEFT]: 'Member left organization',
    [WEBHOOK_EVENTS.CREDITS_ADDED]: 'Credits added to organization',
    [WEBHOOK_EVENTS.CREDITS_PURCHASED]: 'Credits purchased',
    [WEBHOOK_EVENTS.CREDITS_USED]: 'Credits used',
    [WEBHOOK_EVENTS.CREDITS_EXPIRED]: 'Credits expired',
    [WEBHOOK_EVENTS.CREDITS_REFUNDED]: 'Credits refunded',
    [WEBHOOK_EVENTS.INVITATION_SENT]: 'Invitation sent',
    [WEBHOOK_EVENTS.INVITATION_ACCEPTED]: 'Invitation accepted',
    [WEBHOOK_EVENTS.INVITATION_DECLINED]: 'Invitation declined',
    [WEBHOOK_EVENTS.INVITATION_EXPIRED]: 'Invitation expired',
    [WEBHOOK_EVENTS.INVITATION_BULK_SENT]: 'Bulk invitations sent',
    [WEBHOOK_EVENTS.API_KEY_CREATED]: 'API key created',
    [WEBHOOK_EVENTS.API_KEY_REVOKED]: 'API key revoked',
    [WEBHOOK_EVENTS.API_KEY_DELETED]: 'API key deleted',
    [WEBHOOK_EVENTS.COURSE_ENROLLED]: 'User enrolled in course',
    [WEBHOOK_EVENTS.COURSE_COMPLETED]: 'Course completed',
    [WEBHOOK_EVENTS.COURSE_PROGRESS]: 'Course progress updated',
  }

  return descriptions[event] || event
}

/**
 * Group events by category for UI
 */
export function getEventsByCategory() {
  return {
    'Organization': [
      { event: WEBHOOK_EVENTS.ORG_CREATED, description: getEventDescription(WEBHOOK_EVENTS.ORG_CREATED) },
      { event: WEBHOOK_EVENTS.ORG_UPDATED, description: getEventDescription(WEBHOOK_EVENTS.ORG_UPDATED) },
      { event: WEBHOOK_EVENTS.ORG_DELETED, description: getEventDescription(WEBHOOK_EVENTS.ORG_DELETED) },
    ],
    'Members': [
      { event: WEBHOOK_EVENTS.MEMBER_INVITED, description: getEventDescription(WEBHOOK_EVENTS.MEMBER_INVITED) },
      { event: WEBHOOK_EVENTS.MEMBER_JOINED, description: getEventDescription(WEBHOOK_EVENTS.MEMBER_JOINED) },
      { event: WEBHOOK_EVENTS.MEMBER_REMOVED, description: getEventDescription(WEBHOOK_EVENTS.MEMBER_REMOVED) },
      { event: WEBHOOK_EVENTS.MEMBER_ROLE_CHANGED, description: getEventDescription(WEBHOOK_EVENTS.MEMBER_ROLE_CHANGED) },
      { event: WEBHOOK_EVENTS.MEMBER_LEFT, description: getEventDescription(WEBHOOK_EVENTS.MEMBER_LEFT) },
    ],
    'Credits': [
      { event: WEBHOOK_EVENTS.CREDITS_ADDED, description: getEventDescription(WEBHOOK_EVENTS.CREDITS_ADDED) },
      { event: WEBHOOK_EVENTS.CREDITS_PURCHASED, description: getEventDescription(WEBHOOK_EVENTS.CREDITS_PURCHASED) },
      { event: WEBHOOK_EVENTS.CREDITS_USED, description: getEventDescription(WEBHOOK_EVENTS.CREDITS_USED) },
      { event: WEBHOOK_EVENTS.CREDITS_EXPIRED, description: getEventDescription(WEBHOOK_EVENTS.CREDITS_EXPIRED) },
      { event: WEBHOOK_EVENTS.CREDITS_REFUNDED, description: getEventDescription(WEBHOOK_EVENTS.CREDITS_REFUNDED) },
    ],
    'Invitations': [
      { event: WEBHOOK_EVENTS.INVITATION_SENT, description: getEventDescription(WEBHOOK_EVENTS.INVITATION_SENT) },
      { event: WEBHOOK_EVENTS.INVITATION_ACCEPTED, description: getEventDescription(WEBHOOK_EVENTS.INVITATION_ACCEPTED) },
      { event: WEBHOOK_EVENTS.INVITATION_DECLINED, description: getEventDescription(WEBHOOK_EVENTS.INVITATION_DECLINED) },
      { event: WEBHOOK_EVENTS.INVITATION_EXPIRED, description: getEventDescription(WEBHOOK_EVENTS.INVITATION_EXPIRED) },
      { event: WEBHOOK_EVENTS.INVITATION_BULK_SENT, description: getEventDescription(WEBHOOK_EVENTS.INVITATION_BULK_SENT) },
    ],
    'API Keys': [
      { event: WEBHOOK_EVENTS.API_KEY_CREATED, description: getEventDescription(WEBHOOK_EVENTS.API_KEY_CREATED) },
      { event: WEBHOOK_EVENTS.API_KEY_REVOKED, description: getEventDescription(WEBHOOK_EVENTS.API_KEY_REVOKED) },
      { event: WEBHOOK_EVENTS.API_KEY_DELETED, description: getEventDescription(WEBHOOK_EVENTS.API_KEY_DELETED) },
    ],
    'Courses': [
      { event: WEBHOOK_EVENTS.COURSE_ENROLLED, description: getEventDescription(WEBHOOK_EVENTS.COURSE_ENROLLED) },
      { event: WEBHOOK_EVENTS.COURSE_COMPLETED, description: getEventDescription(WEBHOOK_EVENTS.COURSE_COMPLETED) },
      { event: WEBHOOK_EVENTS.COURSE_PROGRESS, description: getEventDescription(WEBHOOK_EVENTS.COURSE_PROGRESS) },
    ],
  }
}

