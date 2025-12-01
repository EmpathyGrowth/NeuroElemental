/**
 * Individual Learning Goal API
 * Operations on a single learning goal
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  internalError,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getUpdateTimestamp } from "@/lib/utils";
import { z } from "zod";

const goalUpdateSchema = z.object({
  target: z.number().min(1).optional(),
  current: z.number().min(0).optional(),
});

/**
 * GET /api/users/me/goals/[id]
 * Get a specific learning goal
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params;
    const supabase = getSupabaseServer();

    const { data: goal, error } = await (supabase as any)
      .from("learning_goals")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !goal) {
      throw notFoundError("Goal");
    }

    return successResponse({ goal });
  }
);

/**
 * PATCH /api/users/me/goals/[id]
 * Update a learning goal
 */
export const PATCH = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params;
    const body = await request.json();
    const validation = goalUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw badRequestError(validation.error.errors[0].message);
    }

    const supabase = getSupabaseServer();

    const { data: goal, error } = await (supabase as any)
      .from("learning_goals")
      .update({
        ...validation.data,
        ...getUpdateTimestamp(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !goal) {
      throw notFoundError("Goal");
    }

    return successResponse({ goal });
  }
);

/**
 * DELETE /api/users/me/goals/[id]
 * Delete a specific learning goal
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params;
    const supabase = getSupabaseServer();

    const { data: existing } = await (supabase as any)
      .from("learning_goals")
      .select("id")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      throw notFoundError("Goal");
    }

    const { error } = await (supabase as any)
      .from("learning_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      throw internalError("Failed to delete goal");
    }

    return successResponse({ success: true });
  }
);
