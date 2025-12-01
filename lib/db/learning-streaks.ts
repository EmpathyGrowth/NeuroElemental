/**
 * Learning Streaks Repository
 * Tracks consecutive learning days for gamification
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { getUpdateTimestamp } from "@/lib/utils";
import { BaseRepository } from "./base-repository";

type LearningStreak = Database["public"]["Tables"]["learning_streaks"]["Row"];
type LearningStreakInsert =
  Database["public"]["Tables"]["learning_streaks"]["Insert"];

/** Streak history entry */
export interface StreakHistoryEntry {
  date: string;
  activity: "lesson_complete" | "quiz_pass" | "course_complete" | "login";
  details?: string;
}

/** Streak statistics */
export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  isActiveToday: boolean;
  daysUntilStreakBreak: number;
  totalActiveDays: number;
}

/**
 * Learning Streaks Repository
 */
export class LearningStreaksRepository extends BaseRepository<"learning_streaks"> {
  constructor() {
    super("learning_streaks");
  }

  /**
   * Get user's streak record
   */
  async getUserStreak(userId: string): Promise<LearningStreak | null> {
    const { data, error } = await this.supabase
      .from("learning_streaks")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching learning streak", error);
      return null;
    }

    return data;
  }

  /**
   * Get streak statistics for user
   */
  async getStreakStats(userId: string): Promise<StreakStats> {
    const streak = await this.getUserStreak(userId);

    if (!streak) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: null,
        isActiveToday: false,
        daysUntilStreakBreak: 0,
        totalActiveDays: 0,
      };
    }

    const today = this.getDateString(new Date());
    const lastActivity = streak.last_activity_date;
    const isActiveToday = lastActivity === today;

    // Calculate days until streak breaks (0 if today, 1 if yesterday, -1 if already broken)
    let daysUntilStreakBreak = 0;
    if (lastActivity) {
      const lastDate = new Date(lastActivity);
      const todayDate = new Date(today);
      const diffDays = Math.floor(
        (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === 0) {
        daysUntilStreakBreak = 1; // Active today, breaks tomorrow if no activity
      } else if (diffDays === 1) {
        daysUntilStreakBreak = 0; // Need activity today to maintain
      } else {
        daysUntilStreakBreak = -1; // Already broken
      }
    }

    // Count total active days from history
    const history =
      (streak.streak_history as unknown as StreakHistoryEntry[]) || [];
    const uniqueDays = new Set(history.map((h) => h.date));

    return {
      currentStreak: streak.current_streak || 0,
      longestStreak: streak.longest_streak || 0,
      lastActivityDate: lastActivity,
      isActiveToday,
      daysUntilStreakBreak,
      totalActiveDays: uniqueDays.size,
    };
  }

  /**
   * Record learning activity and update streak
   */
  async recordActivity(
    userId: string,
    activity: StreakHistoryEntry["activity"],
    details?: string
  ): Promise<LearningStreak> {
    const today = this.getDateString(new Date());
    const streak = await this.getUserStreak(userId);

    if (!streak) {
      // Create new streak record
      return this.createStreak(userId, today, activity, details);
    }

    // Check if already recorded activity today
    if (streak.last_activity_date === today) {
      // Just add to history if not already today
      return this.addToHistory(streak, today, activity, details);
    }

    // Calculate new streak
    const yesterday = this.getDateString(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    let newCurrentStreak: number;

    if (streak.last_activity_date === yesterday) {
      // Continue streak
      newCurrentStreak = (streak.current_streak || 0) + 1;
    } else {
      // Streak broken, start fresh
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(
      newCurrentStreak,
      streak.longest_streak || 0
    );

    // Update history
    const history =
      (streak.streak_history as unknown as StreakHistoryEntry[]) || [];
    const newHistory: StreakHistoryEntry[] = [
      ...history.slice(-99), // Keep last 100 entries
      { date: today, activity, details },
    ];

    const { data, error } = await this.supabase
      .from("learning_streaks")
      .update({
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
        streak_history:
          newHistory as unknown as Database["public"]["Tables"]["learning_streaks"]["Update"]["streak_history"],
        ...getUpdateTimestamp(),
      })
      .eq("user_id", userId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating streak", error);
      throw internalError("Failed to update streak");
    }

    return data;
  }

  /**
   * Create new streak record
   */
  private async createStreak(
    userId: string,
    date: string,
    activity: StreakHistoryEntry["activity"],
    details?: string
  ): Promise<LearningStreak> {
    const history: StreakHistoryEntry[] = [{ date, activity, details }];

    const insertData: LearningStreakInsert = {
      user_id: userId,
      current_streak: 1,
      longest_streak: 1,
      last_activity_date: date,
      streak_history:
        history as unknown as Database["public"]["Tables"]["learning_streaks"]["Insert"]["streak_history"],
    };

    const { data, error } = await this.supabase
      .from("learning_streaks")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating streak", error);
      throw internalError("Failed to create streak");
    }

    return data;
  }

  /**
   * Add activity to history without updating streak (same day)
   */
  private async addToHistory(
    streak: LearningStreak,
    date: string,
    activity: StreakHistoryEntry["activity"],
    details?: string
  ): Promise<LearningStreak> {
    const history =
      (streak.streak_history as unknown as StreakHistoryEntry[]) || [];

    // Check if this exact activity already recorded today
    const alreadyRecorded = history.some(
      (h) => h.date === date && h.activity === activity && h.details === details
    );

    if (alreadyRecorded) {
      return streak;
    }

    const newHistory: StreakHistoryEntry[] = [
      ...history.slice(-99),
      { date, activity, details },
    ];

    const { data, error } = await this.supabase
      .from("learning_streaks")
      .update({
        streak_history:
          newHistory as unknown as Database["public"]["Tables"]["learning_streaks"]["Update"]["streak_history"],
        ...getUpdateTimestamp(),
      })
      .eq("user_id", streak.user_id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating streak history", error);
      return streak; // Return existing on error
    }

    return data;
  }

  /**
   * Get recent activity history
   */
  async getRecentActivity(
    userId: string,
    days: number = 30
  ): Promise<StreakHistoryEntry[]> {
    const streak = await this.getUserStreak(userId);
    if (!streak) return [];

    const history =
      (streak.streak_history as unknown as StreakHistoryEntry[]) || [];
    const cutoff = this.getDateString(
      new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    );

    return history.filter((h) => h.date >= cutoff);
  }

  /**
   * Get leaderboard of top streaks
   */
  async getLeaderboard(limit: number = 10): Promise<
    Array<{
      userId: string;
      currentStreak: number;
      longestStreak: number;
    }>
  > {
    const { data, error } = await this.supabase
      .from("learning_streaks")
      .select("user_id, current_streak, longest_streak")
      .order("current_streak", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching streak leaderboard", error);
      return [];
    }

    return (data || []).map((d) => ({
      userId: d.user_id,
      currentStreak: d.current_streak || 0,
      longestStreak: d.longest_streak || 0,
    }));
  }

  /**
   * Check and fix broken streaks (for cron job)
   */
  async checkBrokenStreaks(): Promise<number> {
    const yesterday = this.getDateString(
      new Date(Date.now() - 24 * 60 * 60 * 1000)
    );

    // Reset streaks that haven't been active since before yesterday
    const { data, error } = await this.supabase
      .from("learning_streaks")
      .update({ current_streak: 0 })
      .lt("last_activity_date", yesterday)
      .gt("current_streak", 0)
      .select("id");

    if (error) {
      logger.error("Error resetting broken streaks", error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Get date string in YYYY-MM-DD format
   */
  private getDateString(date: Date): string {
    return date.toISOString().split("T")[0];
  }
}

/** Singleton instance */
export const learningStreaksRepository = new LearningStreaksRepository();
