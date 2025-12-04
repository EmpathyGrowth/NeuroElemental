/**
 * Organization Webhook By ID API
 * Get, update, or delete a specific webhook
 */

import {
  createAuthenticatedRoute,
  internalError,
  notFoundError,
  requireOrganizationAccess,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getUpdateTimestamp } from "@/lib/utils";
import { z } from "zod";

const updateWebhookSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string()).min(1).optional(),
  is_active: z.boolean().optional(),
});

/**
 * GET /api/organizations/[id]/webhooks/[webhookId]
 * Get a specific webhook
 */
export const GET = createAuthenticatedRoute<{ id: string; webhookId: string }>(
  async (_request, context, user) => {
    const params = await context.params;
    const { id, webhookId } = params;

    // Check if user has access to the organization
    await requireOrganizationAccess(user.id, id);

    const supabase = getSupabaseServer();

    const { data: webhook, error } = await (supabase as any)
      .from("webhooks")
      .select("*")
      .eq("id", webhookId)
      .eq("organization_id", id)
      .single() as { data: { id: string; secret: string; [key: string]: unknown } | null; error: { message: string } | null };

    if (error || !webhook) {
      throw notFoundError("Webhook");
    }

    // Get recent deliveries
    const { data: deliveries } = await (supabase as any)
      .from("webhook_deliveries")
      .select("*")
      .eq("webhook_id", webhookId)
      .order("created_at", { ascending: false })
      .limit(10) as { data: Array<Record<string, unknown>> | null };

    return successResponse({
      webhook: {
        ...(webhook || {}),
        // Don't expose the full secret, just indicate it exists
        secret: webhook.secret ? "••••••••" : null,
      },
      deliveries: deliveries || [],
    });
  }
);

/**
 * PUT /api/organizations/[id]/webhooks/[webhookId]
 * Update a webhook
 */
export const PUT = createAuthenticatedRoute<{ id: string; webhookId: string }>(
  async (request, context, user) => {
    const params = await context.params;
    const { id, webhookId } = params;

    // Check if user is an admin of the organization
    await requireOrganizationAccess(user.id, id, true);

    // Validate request body
    const validation = await validateRequest(request, updateWebhookSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const supabase = getSupabaseServer();

    // Verify webhook exists and belongs to this organization
    const { data: existingWebhook } = await supabase
      .from("webhooks")
      .select("id")
      .eq("id", webhookId)
      .eq("organization_id", id)
      .single();

    if (!existingWebhook) {
      throw notFoundError("Webhook");
    }

    // Update the webhook
    const { data: webhook, error } = await (supabase as any)
      .from("webhooks")
      .update({
        ...validation.data,
        ...getUpdateTimestamp(),
      })
      .eq("id", webhookId)
      .select()
      .single() as { data: { id: string; secret: string; [key: string]: unknown } | null; error: { message: string } | null };

    if (error) {
      throw internalError("Failed to update webhook");
    }

    return successResponse({
      success: true,
      webhook: {
        ...(webhook || {}),
        secret: webhook?.secret ? "••••••••" : null,
      },
      message: "Webhook updated successfully",
    });
  }
);

/**
 * DELETE /api/organizations/[id]/webhooks/[webhookId]
 * Delete a webhook
 */
export const DELETE = createAuthenticatedRoute<{
  id: string;
  webhookId: string;
}>(async (_request, context, user) => {
  const params = await context.params;
  const { id, webhookId } = params;

  // Check if user is an admin of the organization
  await requireOrganizationAccess(user.id, id, true);

  const supabase = getSupabaseServer();

  // Verify webhook exists and belongs to this organization
  const { data: existingWebhook } = await supabase
    .from("webhooks")
    .select("id")
    .eq("id", webhookId)
    .eq("organization_id", id)
    .single();

  if (!existingWebhook) {
    throw notFoundError("Webhook");
  }

  // Delete the webhook
  const { error } = await supabase
    .from("webhooks")
    .delete()
    .eq("id", webhookId);

  if (error) {
    throw internalError("Failed to delete webhook");
  }

  return successResponse({
    success: true,
    message: "Webhook deleted successfully",
  });
});
