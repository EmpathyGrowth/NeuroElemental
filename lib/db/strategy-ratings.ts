/**
 * Strategy Rating Repository
 * Manages regeneration strategy ratings for the Regeneration Guide tool
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for strategy rating management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type StrategyRatingRow = Database["public"]["Tables"]["strategy_ratings"]["Row"];
type StrategyRatingInsert = Database["public"]["Tables"]["strategy_ratings"]["Insert"];

/**
 * Element types for strategy ratings
 */
export type ElementType =
  | "electric"
  | "fiery"
  | "aquatic"
  | "earthly"
  | "airy"
  | "metallic";

/**
 * Strategy rating with typed fields
 */
export interface StrategyRating {
  id: string;
  user_id: string | null;
  element: ElementType;
  strategy_id: string;
  strategy_name: string;
  rating: number; // 1-5
  note: string | null;
  created_at: string | null;
}

/**
 * Strategy Rating Repository
 * Extends BaseRepository with strategy rating-specific operations
 */
export class StrategyRatingRepository extends BaseRepository<"strategy_ratings"> {
  constructor() {
    super("strategy_ratings");
  }

  /**
   * Convert database row to typed StrategyRating
   */
  private toStrategyRating(row: StrategyRatingRow): StrategyRating {
    return {
      id: row.id,
      user_id: row.user_id,
      element: row.element as ElementType,
      strategy_id: row.strategy_id,
      strategy_name: row.strategy_name,
      rating: row.rating,
      note: row.note,
      created_at: row.created_at,
    };
  }

  /**
   * Rate a strategy (create or update)
   * Uses upsert behavior - if rating exists for user+strategy, updates it
   *
   * @param userId - User ID
   * @param data - Rating data
   * @returns Created or updated rating
   */
  async rateStrategy(
    userId: string,
    data: {
      element: ElementType;
      strategy_id: string;
      strategy_name: string;
      rating: number;
      note?: string;
    }
  ): Promise<StrategyRating> {
    // Validate rating is 1-5
    if (data.rating < 1 || data.rating > 5) {
      throw internalError("Rating must be between 1 and 5");
    }

    // Check if rating already exists for this user and strategy
    const { data: existing } = await (this.supabase as any)
      .from("strategy_ratings")
      .select("*")
      .eq("user_id", userId)
      .eq("strategy_id", data.strategy_id)
      .maybeSingle() as { data: StrategyRatingRow | null };

    if (existing) {
      // Update existing rating
      const { data: updated, error } = await (this.supabase as any)
        .from("strategy_ratings")
        .update({
          rating: data.rating,
          note: data.note || null,
        })
        .eq("id", existing.id)
        .select()
        .single() as { data: StrategyRatingRow | null; error: Error | null };

      if (error || !updated) {
        logger.error(
          "Error updating strategy rating",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to update strategy rating");
      }

      return this.toStrategyRating(updated);
    } else {
      // Create new rating
      const insertData: StrategyRatingInsert = {
        user_id: userId,
        element: data.element,
        strategy_id: data.strategy_id,
        strategy_name: data.strategy_name,
        rating: data.rating,
        note: data.note || null,
      };

      const { data: created, error } = await (this.supabase as any)
        .from("strategy_ratings")
        .insert(insertData)
        .select()
        .single() as { data: StrategyRatingRow | null; error: Error | null };

      if (error || !created) {
        logger.error(
          "Error creating strategy rating",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to create strategy rating");
      }

      return this.toStrategyRating(created);
    }
  }

  /**
   * Get all ratings for a user, optionally filtered by element
   *
   * @param userId - User ID
   * @param element - Optional element filter
   * @returns Array of strategy ratings
   */
  async getUserRatings(
    userId: string,
    element?: ElementType
  ): Promise<StrategyRating[]> {
    let query = this.supabase
      .from("strategy_ratings")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (element) {
      query = query.eq("element", element);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching user strategy ratings",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch strategy ratings");
    }

    return (data || []).map((row) => this.toStrategyRating(row));
  }

  /**
   * Get top-rated strategies for a user (rating >= minRating)
   *
   * @param userId - User ID
   * @param minRating - Minimum rating to include (default: 4)
   * @returns Array of top-rated strategies sorted by rating descending
   */
  async getTopStrategies(
    userId: string,
    minRating: number = 4
  ): Promise<StrategyRating[]> {
    const { data, error } = await this.supabase
      .from("strategy_ratings")
      .select("*")
      .eq("user_id", userId)
      .gte("rating", minRating)
      .order("rating", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching top strategies",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch top strategies");
    }

    return (data || []).map((row) => this.toStrategyRating(row));
  }

  /**
   * Get rating for a specific strategy
   *
   * @param userId - User ID
   * @param strategyId - Strategy ID
   * @returns Strategy rating or null if not rated
   */
  async getRating(
    userId: string,
    strategyId: string
  ): Promise<StrategyRating | null> {
    const { data, error } = await this.supabase
      .from("strategy_ratings")
      .select("*")
      .eq("user_id", userId)
      .eq("strategy_id", strategyId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching strategy rating",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data ? this.toStrategyRating(data) : null;
  }

  /**
   * Get rating statistics for a user
   *
   * @param userId - User ID
   * @returns Rating statistics
   */
  async getStats(userId: string): Promise<{
    totalRated: number;
    averageRating: number;
    topRatedCount: number;
    byElement: Record<ElementType, number>;
  }> {
    const { data, error } = await (this.supabase as any)
      .from("strategy_ratings")
      .select("element, rating")
      .eq("user_id", userId) as { data: { element: string; rating: number }[] | null; error: Error | null };

    if (error || !data) {
      return {
        totalRated: 0,
        averageRating: 0,
        topRatedCount: 0,
        byElement: {
          electric: 0,
          fiery: 0,
          aquatic: 0,
          earthly: 0,
          airy: 0,
          metallic: 0,
        },
      };
    }

    const byElement: Record<ElementType, number> = {
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    };

    let totalRating = 0;
    let topRatedCount = 0;

    data.forEach((row: { element: string; rating: number }) => {
      const element = row.element as ElementType;
      if (element in byElement) {
        byElement[element]++;
      }
      totalRating += row.rating;
      if (row.rating >= 4) {
        topRatedCount++;
      }
    });

    return {
      totalRated: data.length,
      averageRating: data.length > 0 ? totalRating / data.length : 0,
      topRatedCount,
      byElement,
    };
  }
}

/**
 * Singleton instance of StrategyRatingRepository
 */
export const strategyRatingRepository = new StrategyRatingRepository();
