/**
 * Achievement Repository
 * Manages achievement data and user achievement tracking
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for achievement management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type Achievement = Database["public"]["Tables"]["achievements"]["Row"];
type _AchievementInsert =
  Database["public"]["Tables"]["achievements"]["Insert"];
type _AchievementUpdate =
  Database["public"]["Tables"]["achievements"]["Update"];
type UserAchievement = Database["public"]["Tables"]["user_achievements"]["Row"];
type _UserAchievementInsert =
  Database["public"]["Tables"]["user_achievements"]["Insert"];

/**
 * Achievement with unlock status for a specific user
 */
export interface AchievementWithStatus extends Achievement {
  unlocked: boolean;
  unlocked_at: string | null;
}

/**
 * User achievement statistics
 */
export interface AchievementStats {
  total: number;
  unlocked: number;
  totalPoints: number;
  earnedPoints: number;
}

/**
 * Achievement Repository
 * Extends BaseRepository with achievement-specific operations
 */
export class AchievementRepository extends BaseRepository<"achievements"> {
  constructor() {
    super("achievements");
  }

  /**
   * Get all active achievements
   *
   * @returns Array of active achievements ordered by category and points
   */
  async getActive(): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from("achievements")
      .select("*")
      .eq("is_active", true)
      .order("category", { ascending: true })
      .order("points", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching active achievements",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch achievements");
    }

    return data as Achievement[];
  }

  /**
   * Get user's achievements
   *
   * @param userId - User ID
   * @returns Array of user achievements
   */
  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await this.supabase
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      logger.error(
        "Error fetching user achievements",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch user achievements");
    }

    return data as UserAchievement[];
  }

  /**
   * Get all achievements with user unlock status
   *
   * @param userId - User ID
   * @returns Array of achievements with unlock status and stats
   */
  async getWithUserStatus(userId: string): Promise<{
    achievements: AchievementWithStatus[];
    stats: AchievementStats;
  }> {
    // Get all active achievements
    const achievements = await this.getActive();

    // Get user's unlocked achievements
    const userAchievements = await this.getUserAchievements(userId);

    const unlockedIds = new Set(
      userAchievements.map((ua) => ua.achievement_id)
    );
    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievement_id, ua.earned_at || null])
    );

    // Combine achievements with unlock status
    const achievementsWithStatus = achievements.map((achievement) => ({
      ...achievement,
      unlocked: unlockedIds.has(achievement.id),
      unlocked_at: unlockedMap.get(achievement.id) || null,
    }));

    // Calculate stats
    const totalPoints = achievements.reduce(
      (sum, a) => sum + (a.points || 0),
      0
    );
    const earnedPoints = achievements
      .filter((a) => unlockedIds.has(a.id))
      .reduce((sum, a) => sum + (a.points || 0), 0);

    return {
      achievements: achievementsWithStatus,
      stats: {
        total: achievements.length,
        unlocked: userAchievements.length,
        totalPoints,
        earnedPoints,
      },
    };
  }

  /**
   * Award achievement to user
   *
   * @param userId - User ID
   * @param achievementId - Achievement ID
   * @returns The user achievement record
   */
  async awardToUser(
    userId: string,
    achievementId: string
  ): Promise<UserAchievement> {
    const { data, error } = await this.supabase
      .from("user_achievements")
      .insert({
        user_id: userId,
        achievement_id: achievementId,
      })
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error awarding achievement",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to award achievement");
    }

    return data as UserAchievement;
  }

  /**
   * Check if user has unlocked achievement
   *
   * @param userId - User ID
   * @param achievementId - Achievement ID
   * @returns True if user has unlocked the achievement
   */
  async hasUnlocked(userId: string, achievementId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("user_achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_id", achievementId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error checking achievement unlock status",
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }

    return !!data;
  }

  /**
   * Get achievements by category
   *
   * @param category - Achievement category
   * @returns Array of achievements in the category
   */
  async getByCategory(category: string): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from("achievements")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("points", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching achievements by category",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch achievements");
    }

    return data as Achievement[];
  }
}

/**
 * Singleton instance of AchievementRepository
 */
export const achievementRepository = new AchievementRepository();
