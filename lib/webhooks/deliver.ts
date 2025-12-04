/**
 * Webhook Delivery System
 * Handles sending HTTP requests to webhook endpoints with retry logic
 */

import { logger } from '@/lib/logging';
import { createAdminClient } from '@/lib/supabase/admin'
import { signWebhookPayload, type WebhookPayload, type WebhookEvent } from './manage'

export type { WebhookEvent }

const MAX_RETRY_ATTEMPTS = 3
const RETRY_DELAYS = [60, 300, 1800] // 1min, 5min, 30min in seconds

/** Webhook record from database */
interface WebhookRecord {
  id: string;
  url: string;
  secret: string;
  events: string[];
}

/** Delivery record from database */
interface DeliveryRecord {
  id: string;
  webhook: { id: string; url: string; secret: string } | null;
  payload: WebhookPayload;
  attempts: number;
}

/**
 * Trigger webhooks for an event
 * This is the main function to call when an event occurs
 */
export async function triggerWebhooks(params: {
  organizationId: string
  event: WebhookEvent
  data: Record<string, unknown>
}) {
  try {
    const supabase = createAdminClient()

    // Find all active webhooks subscribed to this event
    const { data: webhooks, error } = await supabase
      .from('webhooks')
      .select('id, url, secret, events')
      .eq('organization_id', params.organizationId)
      .eq('is_active', true)
      .contains('events', [params.event]) as { data: WebhookRecord[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error fetching webhooks:', new Error(error.message))
      return { success: false, error }
    }

    if (!webhooks || webhooks.length === 0) {
      // No webhooks to trigger, this is fine
      return { success: true, triggered: 0 }
    }

    // Create payload
    const payload: WebhookPayload = {
      id: crypto.randomUUID(),
      event: params.event,
      organization_id: params.organizationId,
      timestamp: new Date().toISOString(),
      data: params.data,
    }

    // Queue deliveries for each webhook
    const deliveryPromises = webhooks.map((webhook) =>
      queueWebhookDelivery({
        webhookId: webhook.id,
        url: webhook.url,
        secret: webhook.secret,
        payload,
      })
    )

    await Promise.all(deliveryPromises)

    // Update last_triggered_at for these webhooks
    await (supabase as any)
      .from('webhooks')
      .update({ last_triggered_at: new Date().toISOString() })
      .in('id', webhooks.map((w) => w.id))

    return { success: true, triggered: webhooks.length }
  } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error triggering webhooks:', err as Error)
    return { success: false, error }
  }
}

/**
 * Queue a webhook delivery
 */
async function queueWebhookDelivery(params: {
  webhookId: string
  url: string
  secret: string
  payload: WebhookPayload
}) {
  try {
    const supabase = createAdminClient()

    // Create delivery record
    const { data, error } = await (supabase as any)
      .from('webhook_deliveries')
      .insert({
        webhook_id: params.webhookId,
        event_type: params.payload.event,
        payload: params.payload as unknown as import('@/lib/types/supabase').Json,
        status: 'pending',
        attempts: 0,
        next_retry_at: new Date().toISOString(), // Deliver immediately
      })
      .select()
      .single() as { data: { id: string } | null; error: Error | null }

    if (error) {
      logger.error('Error queueing webhook delivery:', error as Error)
      return
    }

    // Attempt delivery immediately (in background)
    // In production, you'd use a queue system like BullMQ or AWS SQS
    if (data) {
      attemptWebhookDelivery(data.id, params.url, params.secret, params.payload)
        .catch((err) => logger.error('Background webhook delivery failed:', err as Error))
    }

    return { success: true, deliveryId: data?.id }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in queueWebhookDelivery:', err as Error)
    return { success: false, error }
  }
}

/**
 * Attempt to deliver a webhook
 */
async function attemptWebhookDelivery(
  deliveryId: string,
  url: string,
  secret: string,
  payload: WebhookPayload
): Promise<void> {
  const supabase = createAdminClient()

  try {
    // Get current attempts and increment
    const { data: current } = await supabase
      .from('webhook_deliveries')
      .select('attempts')
      .eq('id', deliveryId)
      .single() as { data: { attempts: number } | null; error: unknown }

    await (supabase as any)
      .from('webhook_deliveries')
      .update({ attempts: (current?.attempts || 0) + 1 })
      .eq('id', deliveryId)

    // Prepare payload
    const payloadString = JSON.stringify(payload)
    const signature = signWebhookPayload(payloadString, secret)

    // Send HTTP POST request
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': payload.id,
        'X-Webhook-Event': payload.event,
        'User-Agent': 'NeuroElemental-Webhooks/1.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    const responseText = await response.text()
    const responseHeaders = Object.fromEntries(response.headers.entries())

    if (response.ok) {
      // Success
      await (supabase as any)
        .from('webhook_deliveries')
        .update({
          status: 'success',
          response_status_code: response.status,
          response_body: responseText.substring(0, 5000), // Limit size
          response_headers: responseHeaders,
          delivered_at: new Date().toISOString(),
          next_retry_at: null,
        })
        .eq('id', deliveryId)
    } else {
      // HTTP error - schedule retry
      await handleDeliveryFailure(
        deliveryId,
        response.status,
        responseText,
        responseHeaders
      )
    }
  } catch (error) {
    // Network error or timeout - schedule retry
    await handleDeliveryFailure(
      deliveryId,
      null,
      error instanceof Error ? error.message : String(error) || 'Network error',
      {}
    )
  }
}

/**
 * Handle delivery failure and schedule retry if needed
 */
async function handleDeliveryFailure(
  deliveryId: string,
  statusCode: number | null,
  responseBody: string,
  responseHeaders: Record<string, string>
) {
  const supabase = createAdminClient()

  // Get current delivery
  const { data: delivery } = await (supabase as any)
    .from('webhook_deliveries')
    .select('attempts')
    .eq('id', deliveryId)
    .single() as { data: { attempts: number } | null; error: unknown }

  if (!delivery) return

  const attempts = delivery.attempts

  if (attempts < MAX_RETRY_ATTEMPTS) {
    // Schedule retry
    const retryDelay = RETRY_DELAYS[attempts - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1]
    const nextRetryAt = new Date(Date.now() + retryDelay * 1000)

    await (supabase as any)
      .from('webhook_deliveries')
      .update({
        status: 'pending',
        response_status_code: statusCode,
        response_body: responseBody.substring(0, 5000),
        response_headers: responseHeaders,
        next_retry_at: nextRetryAt.toISOString(),
      })
      .eq('id', deliveryId)
  } else {
    // Max attempts reached, mark as failed
    await (supabase as any)
      .from('webhook_deliveries')
      .update({
        status: 'failed',
        response_status_code: statusCode,
        response_body: responseBody.substring(0, 5000),
        response_headers: responseHeaders,
        next_retry_at: null,
      })
      .eq('id', deliveryId)
  }
}

/**
 * Retry pending webhook deliveries
 * This should be called by a cron job every minute
 */
export async function retryPendingDeliveries() {
  try {
    const supabase = createAdminClient()
    const now = new Date().toISOString()

    // Find deliveries that are pending and ready to retry
    const { data: deliveries, error } = await supabase
      .from('webhook_deliveries')
      .select(`
        id,
        webhook:webhooks(id, url, secret),
        payload,
        attempts
      `)
      .eq('status', 'pending')
      .lte('next_retry_at', now)
      .lt('attempts', MAX_RETRY_ATTEMPTS)
      .limit(100) as { data: DeliveryRecord[] | null; error: { message: string } | null }

    if (error) {
      logger.error('Error fetching pending deliveries:', new Error(error.message))
      return { success: false, error }
    }

    if (!deliveries || deliveries.length === 0) {
      return { success: true, retried: 0 }
    }

    // Attempt delivery for each
    const retryPromises = deliveries.map(delivery => {
      if (!delivery.webhook) return Promise.resolve()

      return attemptWebhookDelivery(
        delivery.id,
        delivery.webhook.url,
        delivery.webhook.secret,
        delivery.payload
      ).catch(err => {
        const error = err instanceof Error ? err : new Error(String(err))
        logger.error(`Error retrying delivery ${delivery.id}:`, error)
      })
    })

    await Promise.all(retryPromises)

    return { success: true, retried: deliveries.length }
  } catch (error) {
    logger.error('Error in retryPendingDeliveries:', error as Error)
    return { success: false, error }
  }
}

/**
 * Test a webhook endpoint
 * Sends a test payload to verify the endpoint is working
 */
export async function testWebhook(params: {
  url: string
  secret: string
  event: WebhookEvent
}) {
  try {
    const testPayload: WebhookPayload = {
      id: crypto.randomUUID(),
      event: params.event,
      organization_id: 'test-org-id',
      timestamp: new Date().toISOString(),
      data: {
        test: true,
        message: 'This is a test webhook delivery',
      },
    }

    const payloadString = JSON.stringify(testPayload)
    const signature = signWebhookPayload(payloadString, params.secret)

    const response = await fetch(params.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': signature,
        'X-Webhook-ID': testPayload.id,
        'X-Webhook-Event': testPayload.event,
        'User-Agent': 'NeuroElemental-Webhooks/1.0',
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000), // 10 second timeout for test
    })

    const responseText = await response.text()

    return {
      success: response.ok,
      status: response.status,
      body: responseText,
      headers: Object.fromEntries(response.headers.entries()),
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Network error',
    }
  }
}

