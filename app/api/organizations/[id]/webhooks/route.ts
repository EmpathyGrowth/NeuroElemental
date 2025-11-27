/**
 * Webhooks Management API
 * Create and list webhooks for an organization
 */

import { createAuthenticatedRoute, forbiddenError, internalError, successResponse, validateRequest } from '@/lib/api'
import { isUserOrgAdmin, logActivity, ActivityActions, EntityTypes } from '@/lib/db'
import { createWebhook, listWebhooks, type WebhookEvent } from '@/lib/webhooks/manage'
import { webhookCreateSchema } from '@/lib/validation/schemas'

/** Webhook data from createWebhook */
interface WebhookData {
  id: string;
  name: string;
  url: string;
  events: string[];
  is_active: boolean;
}

/** Success result from createWebhook */
interface CreateWebhookSuccess {
  success: true;
  webhook: WebhookData;
}

/**
 * GET /api/organizations/[id]/webhooks
 * List all webhooks for an organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only organization admins can view webhooks')

  const result = await listWebhooks(id)
  if (!result.success) throw internalError('Failed to list webhooks')

  return successResponse({ webhooks: result.webhooks })
})

/**
 * POST /api/organizations/[id]/webhooks
 * Create a new webhook for an organization
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only organization admins can create webhooks')

  // Validate request body
  const validation = await validateRequest(request, webhookCreateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { name, url, events } = validation.data

  // Create the webhook
  const result = await createWebhook({
    organizationId: id,
    name: name.trim(),
    url,
    events: events as WebhookEvent[],
    createdBy: user.id,
  })

  if (!result.success) {
    throw internalError('Failed to create webhook')
  }

  // Type narrow to success result
  const successResult = result as CreateWebhookSuccess;
  const { webhook } = successResult;

  // Log activity
  await logActivity({
    organization_id: id,
    user_id: user.id,
    action_type: ActivityActions.SETTINGS_UPDATED,
    entity_type: EntityTypes.SETTINGS,
    entity_id: webhook.id,
    description: 'Created webhook "' + name.trim() + '" with ' + events.length + ' event(s)',
    metadata: {
      webhook_id: webhook.id,
      events: events,
    },
  })

  return successResponse({
    success: true,
    webhook,
  })
})
