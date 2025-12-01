/**
 * Webhook Secret Regeneration API
 * Generate a new secret for a webhook
 */

import {
  createAuthenticatedRoute,
  internalError,
  notFoundError,
  requireOrganizationAccess,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getUpdateTimestamp } from "@/lib/utils";
import crypto from "crypto";

/**
 * POST /api/organizations/[id]/webhooks/[webhookId]/regenerate
 * Regenerate the webhook secret
 */
export const POST = createAuthenticatedRoute<{ id: string; webhookId: string }>(
  async (_request, context, user) => {
    const params = await context.params;
    const { id, webhookId } = params;

    // Check if user is an admin of the organization
    await requireOrganizationAccess(user.id, id, true);

    const supabase = getSupabaseServer();

    // Verify webhook exists and belongs to this organization
    const { data: existingWebhook } = await supabase
      .from("webhooks")
      .select("id, name")
      .eq("id", webhookId)
      .eq("organization_id", id)
      .single();

    if (!existingWebhook) {
      throw notFoundError("Webhook");
    }

    // Generate new secret
    const newSecret = `whsec_${crypto.randomBytes(32).toString("hex")}`;

    // Update the webhook with new secret
    const { data: webhook, error } = await supabase
      .from("webhooks")
      .update({
        secret: newSecret,
        ...getUpdateTimestamp(),
      })
      .eq("id", webhookId)
      .select("id, name, url, events, is_active, updated_at")
      .single();

    if (error) {
      throw internalError("Failed to regenerate webhook secret");
    }

    return successResponse({
      success: true,
      webhook: {
        ...webhook,
        // Return the new secret - this is the only time it will be shown in full
        secret: newSecret,
      },
      message:
        "Webhook secret regenerated successfully. Make sure to update your endpoint with the new secret.",
    });
  }
);
