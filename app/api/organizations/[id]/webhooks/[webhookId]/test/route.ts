/**
 * Webhook Test API
 * Send a test payload to a webhook endpoint
 */

import { createAuthenticatedRoute, notFoundError, requireOrganizationAccess, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import crypto from 'crypto';

/**
 * POST /api/organizations/[id]/webhooks/[webhookId]/test
 * Send a test payload to the webhook URL
 */
export const POST = createAuthenticatedRoute<{ id: string; webhookId: string }>(async (_request, context, user) => {
  const params = await context.params;
  const { id, webhookId } = params;

  // Check if user is an admin of the organization
  await requireOrganizationAccess(user.id, id, true);

  const supabase = getSupabaseServer();

  // Get the webhook
  const { data: webhook, error } = await (supabase as any)
    .from('webhooks')
    .select('*')
    .eq('id', webhookId)
    .eq('organization_id', id)
    .single() as { data: { id: string; url: string; secret: string; [key: string]: unknown } | null; error: { message: string } | null };

  if (error || !webhook) {
    throw notFoundError('Webhook');
  }

  // Create test payload
  const testPayload = {
    event: 'test.ping',
    data: {
      message: 'This is a test webhook delivery from NeuroElemental',
      timestamp: new Date().toISOString(),
      webhook_id: webhookId,
      organization_id: id,
    },
    metadata: {
      test: true,
      triggered_by: user.id,
    },
  };

  // Generate signature
  const timestamp = Math.floor(Date.now() / 1000);
  const signaturePayload = `${timestamp}.${JSON.stringify(testPayload)}`;
  const signature = crypto
    .createHmac('sha256', webhook.secret)
    .update(signaturePayload)
    .digest('hex');

  // Send the test request
  let responseStatus: number | null = null;
  let responseBody: string | null = null;
  let responseHeaders: Record<string, string> | null = null;
  let deliveryError: string | null = null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
        'X-Webhook-Id': webhookId,
        'X-Webhook-Event': 'test.ping',
        'User-Agent': 'NeuroElemental-Webhooks/1.0',
      },
      body: JSON.stringify(testPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    responseStatus = response.status;
    responseBody = await response.text();
    responseHeaders = Object.fromEntries(response.headers.entries());
  } catch (err) {
    logger.error('Webhook test delivery failed:', err as Error);
    deliveryError = err instanceof Error ? err.message : 'Unknown error';
  }

  // Record the test delivery
  const { data: delivery } = await (supabase as any)
    .from('webhook_deliveries')
    .insert({
      webhook_id: webhookId,
      event_type: 'test.ping',
      payload: testPayload,
      status: responseStatus && responseStatus >= 200 && responseStatus < 300 ? 'success' : 'failed',
      response_status: responseStatus,
      response_body: responseBody?.substring(0, 1000), // Limit body size
      response_headers: responseHeaders,
      attempts: 1,
      delivered_at: responseStatus && responseStatus >= 200 && responseStatus < 300 ? new Date().toISOString() : null,
      completed_at: new Date().toISOString(),
    })
    .select()
    .single() as { data: { id: string; created_at: string } | null };

  const success = responseStatus !== null && responseStatus >= 200 && responseStatus < 300;

  return successResponse({
    success,
    test_result: {
      delivery_id: delivery?.id,
      url: webhook.url,
      status_code: responseStatus,
      response_time_ms: delivery?.created_at ? Date.now() - new Date(delivery.created_at).getTime() : null,
      error: deliveryError,
    },
    message: success
      ? 'Test webhook delivered successfully'
      : `Test webhook failed: ${deliveryError || `HTTP ${responseStatus}`}`,
  });
});
