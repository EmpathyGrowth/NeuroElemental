/**
 * User Learning Streak API
 * GET - Get current user's streak statistics
 * POST - Record learning activity (updates streak)
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { learningStreaksRepository } from "@/lib/db/learning-streaks";
import { z } from "zod";

const activitySchema = z.object({
  activity: z.enum([
    "lesson_complete",
    "quiz_pass",
    "course_complete",
    "login",
  ]),
  details: z.string().max(200).optional(),
});

/**
 * GET /api/user/streak
 * Get current user's streak statistics
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const stats = await learningStreaksRepository.getStreakStats(user.id);
    const recentActivity = await learningStreaksRepository.getRecentActivity(
      user.id,
      30
    );

    return successResponse({
      ...stats,
      recentActivity,
    });
  }
);

/**
 * POST /api/user/streak
 * Record learning activity and update streak
 */
export const POST = createAuthenticatedRoute(
  async (request, _context, user) => {
    const body = await request.json();

    const parsed = activitySchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid activity"
      );
    }

    const streak = await learningStreaksRepository.recordActivity(
      user.id,
      parsed.data.activity,
      parsed.data.details
    );

    const stats = await learningStreaksRepository.getStreakStats(user.id);

    return successResponse({
      streak,
      stats,
      message: "Activity recorded",
    });
  }
);
