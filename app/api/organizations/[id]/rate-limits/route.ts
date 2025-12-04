/**
 * Organization Rate Limits API
 * Get and update rate limit configurations for an organization
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

const updateRateLimitsSchema = z.object({
  requests_per_minute: z.number().min(10).max(100000).optional(),
  requests_per_hour: z.number().min(100).max(1000000).optional(),
  requests_per_day: z.number().min(1000).max(10000000).optional(),
  burst_allowance: z.number().min(1).max(1000).optional(),
  max_concurrent_requests: z.number().min(1).max(1000).optional(),
  webhooks_per_minute: z.number().min(1).max(1000).optional(),
  webhooks_per_hour: z.number().min(10).max(10000).optional(),
  enforce_hard_limits: z.boolean().optional(),
});

/**
 * GET /api/organizations/[id]/rate-limits
 * Get rate limit configuration for the organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params;

    // Check if user has access to the organization
    await requireOrganizationAccess(user.id, id);

    const supabase = getSupabaseServer();

    // Get rate limit configs for this organization
    const { data: configs, error } = await (supabase as any)
      .from("rate_limit_configs")
      .select("*")
      .eq("organization_id", id)
      .order("created_at", { ascending: false }) as { data: any[] | null; error: Error | null };

    if (error) {
      throw notFoundError("Rate limit configuration");
    }

    // Get default config or create default values
    const defaultConfig = configs?.[0] || {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      requests_per_day: 10000,
      burst_allowance: 10,
      max_concurrent_requests: 10,
      webhooks_per_minute: 10,
      webhooks_per_hour: 100,
      enforce_hard_limits: false,
      tier: "free",
    };

    // Get recent rate limit violations
    const { data: violations } = await (supabase as any)
      .from("rate_limit_violations")
      .select("*")
      .eq("organization_id", id)
      .order("created_at", { ascending: false })
      .limit(10) as { data: any[] | null };

    // Get current counters
    const { data: counters } = await (supabase as any)
      .from("rate_limit_counters")
      .select("*")
      .eq("organization_id", id) as { data: { request_count?: number; webhook_count?: number }[] | null };

    return successResponse({
      config: {
        requests_per_minute: defaultConfig.requests_per_minute,
        requests_per_hour: defaultConfig.requests_per_hour,
        requests_per_day: defaultConfig.requests_per_day,
        burst_allowance: defaultConfig.burst_allowance,
        max_concurrent_requests: defaultConfig.max_concurrent_requests,
        webhooks_per_minute: defaultConfig.webhooks_per_minute,
        webhooks_per_hour: defaultConfig.webhooks_per_hour,
        enforce_hard_limits: defaultConfig.enforce_hard_limits,
        tier: defaultConfig.tier,
      },
      violations: violations || [],
      counters: counters || [],
      usage: {
        current_requests:
          counters?.reduce((sum, c) => sum + (c.request_count || 0), 0) || 0,
        current_webhooks:
          counters?.reduce((sum, c) => sum + (c.webhook_count || 0), 0) || 0,
        limit: defaultConfig.requests_per_hour,
      },
    });
  }
);

/**
 * PUT /api/organizations/[id]/rate-limits
 * Update rate limit configuration for the organization
 */
export const PUT = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params;

    // Check if user is an admin of the organization
    await requireOrganizationAccess(user.id, id, true);

    // Validate request body
    const validation = await validateRequest(request, updateRateLimitsSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const supabase = getSupabaseServer();

    // Check if config exists
    const { data: existingConfig } = await (supabase as any)
      .from("rate_limit_configs")
      .select("id")
      .eq("organization_id", id)
      .maybeSingle() as { data: { id: string } | null };

    let config: any;
    if (existingConfig) {
      // Update existing config
      const { data, error } = await (supabase as any)
        .from("rate_limit_configs")
        .update({
          ...validation.data,
          ...getUpdateTimestamp(),
        })
        .eq("id", existingConfig.id)
        .select()
        .single() as { data: any; error: Error | null };

      if (error) {
        throw internalError("Failed to update rate limit configuration");
      }
      config = data;
    } else {
      // Create new config
      const { data, error } = await (supabase as any)
        .from("rate_limit_configs")
        .insert({
          organization_id: id,
          ...validation.data,
        })
        .select()
        .single() as { data: any; error: Error | null };

      if (error) {
        throw internalError("Failed to create rate limit configuration");
      }
      config = data;
    }

    return successResponse({
      success: true,
      config: {
        requests_per_minute: config.requests_per_minute,
        requests_per_hour: config.requests_per_hour,
        requests_per_day: config.requests_per_day,
        burst_allowance: config.burst_allowance,
        max_concurrent_requests: config.max_concurrent_requests,
        webhooks_per_minute: config.webhooks_per_minute,
        webhooks_per_hour: config.webhooks_per_hour,
        enforce_hard_limits: config.enforce_hard_limits,
        tier: config.tier,
      },
      message: "Rate limits updated successfully",
    });
  }
);
