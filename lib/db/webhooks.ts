/**
 * Webhook Repository
 * Manages webhook data and webhook deliveries
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for webhook management.
 */

// Direct import to avoid circular dependency with @/lib/api barrel
import { internalError, notFoundError } from '@/lib/api/error-handler';
import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './base-repository';

type Webhook = Database['public']['Tables']['webhooks']['Row'];
type WebhookInsert = Database['public']['Tables']['webhooks']['Insert'];
type WebhookUpdate = Database['public']['Tables']['webhooks']['Update'];
type WebhookDelivery = Database['public']['Tables']['webhook_deliveries']['Row'];
type WebhookDeliveryInsert = Database['public']['Tables']['webhook_deliveries']['Insert'];

/**
 * Webhook with recent deliveries
 */
export interface WebhookWithDeliveries extends Webhook {
  deliveries: WebhookDelivery[];
}

/**
 * Webhook Repository
 * Extends BaseRepository with webhook-specific operations
 */
export class WebhookRepository extends BaseRepository<'webhooks'> {
  constructor() {
    super('webhooks');
  }

  /**
   * Get webhooks by organization ID
   *
   * @param organizationId - Organization ID
   * @returns Array of webhooks for the organization
   */
  async getByOrganization(organizationId: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching organization webhooks', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to fetch webhooks');
    }

    return data as Webhook[];
  }

  /**
   * Get webhook by ID with organization verification
   *
   * @param webhookId - Webhook ID
   * @param organizationId - Organization ID
   * @returns Webhook or null if not found
   */
  async getByIdForOrganization(webhookId: string, organizationId: string): Promise<Webhook | null> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('id', webhookId)
      .eq('organization_id', organizationId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching webhook', error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    return data as Webhook | null;
  }

  /**
   * Get webhook with recent deliveries
   *
   * @param webhookId - Webhook ID
   * @param organizationId - Organization ID
   * @param limit - Maximum number of deliveries to return (default: 10)
   * @returns Webhook with deliveries or throws error
   */
  async getWithDeliveries(webhookId: string, organizationId: string, limit: number = 10): Promise<WebhookWithDeliveries> {
    const webhook = await this.getByIdForOrganization(webhookId, organizationId);

    if (!webhook) {
      throw notFoundError('Webhook');
    }

    // Get recent deliveries
    const { data: deliveries, error } = await this.supabase
      .from('webhook_deliveries')
      .select('*')
      .eq('webhook_id', webhookId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      logger.error('Error fetching webhook deliveries', error instanceof Error ? error : new Error(String(error)));
      // Don't fail the whole request if deliveries fail
      return { ...webhook, deliveries: [] };
    }

    return {
      ...webhook,
      deliveries: deliveries as WebhookDelivery[],
    };
  }

  /**
   * Create new webhook
   *
   * @param data - Webhook data
   * @returns Created webhook
   */
  async createWebhook(data: WebhookInsert): Promise<Webhook> {
    const { data: webhook, error } = await (this.supabase as any)
      .from('webhooks')
      .insert(data)
      .select()
      .single() as { data: Webhook | null; error: Error | null };

    if (error || !webhook) {
      logger.error('Error creating webhook', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to create webhook');
    }

    return webhook as Webhook;
  }

  /**
   * Update webhook
   *
   * @param webhookId - Webhook ID
   * @param organizationId - Organization ID
   * @param data - Webhook update data
   * @returns Updated webhook
   */
  async updateWebhook(webhookId: string, organizationId: string, data: WebhookUpdate): Promise<Webhook> {
    // Verify webhook exists and belongs to organization
    const existing = await this.getByIdForOrganization(webhookId, organizationId);
    if (!existing) {
      throw notFoundError('Webhook');
    }

    const { data: webhook, error } = await (this.supabase as any)
      .from('webhooks')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', webhookId)
      .select()
      .single() as { data: Webhook | null; error: Error | null };

    if (error || !webhook) {
      logger.error('Error updating webhook', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to update webhook');
    }

    return webhook as Webhook;
  }

  /**
   * Delete webhook
   *
   * @param webhookId - Webhook ID
   * @param organizationId - Organization ID
   */
  async deleteWebhook(webhookId: string, organizationId: string): Promise<void> {
    // Verify webhook exists and belongs to organization
    const existing = await this.getByIdForOrganization(webhookId, organizationId);
    if (!existing) {
      throw notFoundError('Webhook');
    }

    const { error } = await this.supabase
      .from('webhooks')
      .delete()
      .eq('id', webhookId);

    if (error) {
      logger.error('Error deleting webhook', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to delete webhook');
    }
  }

  /**
   * Regenerate webhook secret
   *
   * @param webhookId - Webhook ID
   * @param organizationId - Organization ID
   * @param newSecret - New secret
   * @returns Updated webhook
   */
  async regenerateSecret(webhookId: string, organizationId: string, newSecret: string): Promise<Webhook> {
    return this.updateWebhook(webhookId, organizationId, {
      secret: newSecret,
    });
  }

  /**
   * Get active webhooks for event type
   *
   * @param organizationId - Organization ID
   * @param eventType - Event type
   * @returns Array of active webhooks subscribed to the event type
   */
  async getActiveForEvent(organizationId: string, eventType: string): Promise<Webhook[]> {
    const { data, error } = await this.supabase
      .from('webhooks')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('is_active', true)
      .contains('events', [eventType]);

    if (error) {
      logger.error('Error fetching active webhooks for event', error instanceof Error ? error : new Error(String(error)));
      return [];
    }

    return data as Webhook[];
  }

  /**
   * Record webhook delivery
   *
   * @param data - Webhook delivery data
   * @returns Created delivery record
   */
  async recordDelivery(data: WebhookDeliveryInsert): Promise<WebhookDelivery> {
    const { data: delivery, error } = await (this.supabase as any)
      .from('webhook_deliveries')
      .insert(data)
      .select()
      .single() as { data: WebhookDelivery | null; error: Error | null };

    if (error || !delivery) {
      logger.error('Error recording webhook delivery', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to record webhook delivery');
    }

    return delivery as WebhookDelivery;
  }

  /**
   * Update webhook last triggered timestamp
   *
   * @param webhookId - Webhook ID
   */
  async updateLastTriggered(webhookId: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from('webhooks')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', webhookId);

    if (error) {
      logger.error('Error updating webhook last triggered', error instanceof Error ? error : new Error(String(error)));
      // Don't throw - this is not critical
    }
  }
}

/**
 * Singleton instance of WebhookRepository
 */
export const webhookRepository = new WebhookRepository();
