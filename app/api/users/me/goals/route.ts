/**
 * User Learning Goals API
 * Manages personal learning goals for progress tracking
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  internalError,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getCurrentTimestamp } from "@/lib/utils";
import { z } from "zod";

const goalCreateSchema = z.object({
  type: z.enum([
    "weekly_hours",
    "monthly_courses",
    "streak_days",
    "lessons_per_week",
  ]),
  target: z.number().min(1),
  period: z.enum(["weekly", "monthly"]).default("weekly"),
});

/**
 * GET /api/users/me/goals
 * Get all learning goals for the current user
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = getSupabaseServer();

    const { data: goals, error } = await (supabase as any)
      .from("learning_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      throw internalError("Failed to fetch goals");
    }

    return successResponse({ goals: goals || [] });
  }
);

/**
 * POST /api/users/me/goals
 * Create a new learning goal
 */
export const POST = createAuthenticatedRoute(
  async (request, _context, user) => {
    const body = await request.json();
    const validation = goalCreateSchema.safeParse(body);

    if (!validation.success) {
      throw badRequestError(validation.error.errors[0].message);
    }

    const supabase = getSupabaseServer();
    const { type, target, period } = validation.data;

    const { data: goal, error } = await (supabase as any)
      .from("learning_goals")
      .insert({
        user_id: user.id,
        type,
        target,
        current: 0,
        period,
        created_at: getCurrentTimestamp(),
        updated_at: getCurrentTimestamp(),
      })
      .select()
      .single();

    if (error) {
      throw internalError("Failed to create goal");
    }

    return successResponse({ goal });
  }
);

/**
 * DELETE /api/users/me/goals
 * Delete a learning goal by ID (passed as query param)
 */
export const DELETE = createAuthenticatedRoute(
  async (request, _context, user) => {
    const url = new URL(request.url);
    const goalId = url.searchParams.get("id");

    if (!goalId) {
      throw badRequestError("Goal ID required");
    }

    const supabase = getSupabaseServer();

    const { data: existing } = await (supabase as any)
      .from("learning_goals")
      .select("id")
      .eq("id", goalId)
      .eq("user_id", user.id)
      .single();

    if (!existing) {
      throw notFoundError("Goal");
    }

    const { error } = await (supabase as any)
      .from("learning_goals")
      .delete()
      .eq("id", goalId)
      .eq("user_id", user.id);

    if (error) {
      throw internalError("Failed to delete goal");
    }

    return successResponse({ success: true });
  }
);
