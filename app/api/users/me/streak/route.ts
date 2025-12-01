/**
 * Learning Streak API
 * GET - Get user's streak info
 * POST - Record daily activity (check-in)
 */

import {
  createAuthenticatedRoute,
  internalError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { getUpdateTimestamp } from "@/lib/utils";

// GET - Get user's streak info
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = await getSupabaseServer();

    const { data: streak, error } = await supabase
      .from("learning_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching streak",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch streak");
    }

    // If no streak record exists, return default values
    if (!streak) {
      return successResponse({
        streak: {
          current_streak: 0,
          longest_streak: 0,
          last_activity_date: null,
          streak_history: [],
        },
        checkedInToday: false,
      });
    }

    // Check if user has already checked in today
    const today = new Date().toISOString().split("T")[0];
    const checkedInToday = streak.last_activity_date === today;

    return successResponse({
      streak,
      checkedInToday,
    });
  }
);

// POST - Record daily activity (check-in)
export const POST = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = await getSupabaseServer();

    const today = new Date().toISOString().split("T")[0];

    // Get current streak
    const { data: existingStreak } = await supabase
      .from("learning_streaks")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // If no streak exists, create one
    if (!existingStreak) {
      const { data: newStreak, error } = await supabase
        .from("learning_streaks")
        .insert({
          user_id: user.id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
          streak_history: [{ date: today, streak: 1 }],
        })
        .select()
        .single();

      if (error) {
        logger.error(
          "Error creating streak",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to create streak");
      }

      return successResponse({
        streak: newStreak,
        message: "Streak started!",
        isNewStreak: true,
      });
    }

    // Check if already checked in today
    if (existingStreak.last_activity_date === today) {
      return successResponse({
        streak: existingStreak,
        message: "Already checked in today",
        alreadyCheckedIn: true,
      });
    }

    // Check if this continues the streak (yesterday) or breaks it
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const isConsecutive = existingStreak.last_activity_date === yesterdayStr;

    const currentStreakValue = existingStreak.current_streak ?? 0;
    const longestStreakValue = existingStreak.longest_streak ?? 0;
    const newCurrentStreak = isConsecutive ? currentStreakValue + 1 : 1;
    const newLongestStreak = Math.max(longestStreakValue, newCurrentStreak);

    // Update streak history (keep last 30 days)
    const history = Array.isArray(existingStreak.streak_history)
      ? existingStreak.streak_history
      : [];
    const newHistory = [
      ...history.slice(-29),
      { date: today, streak: newCurrentStreak },
    ];

    const { data: updatedStreak, error } = await supabase
      .from("learning_streaks")
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        streak_history: newHistory,
        ...getUpdateTimestamp(), // Use the getUpdateTimestamp utility
      })
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      logger.error(
        "Error updating streak",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update streak");
    }

    return successResponse({
      streak: updatedStreak,
      message: isConsecutive
        ? `Streak extended to ${newCurrentStreak} days!`
        : "New streak started!",
      streakExtended: isConsecutive,
    });
  }
);
