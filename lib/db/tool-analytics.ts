/**
 * Tool Analytics Repository
 * Manages tool usage analytics for admin dashboards
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for tool analytics management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database, Json } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type ToolAnalyticsRow = Database["public"]["Tables"]["tool_analytics"]["Row"];
type ToolAnalyticsInsert = Database["public"]["Tables"]["tool_analytics"]["Insert"];

/**
 * Tool action types
 */
export type ToolAction = "view" | "start" | "complete" | "interact";

/**
 * Tool names in the system
 */
export type ToolName =
  | "daily-checkin"
  | "energy-budget"
  | "state-tracker"
  | "four-states"
  | "regeneration-guide"
  | "shadow-work"
  | "quick-quiz";

/**
 * Date range for analytics queries
 */
export interface DateRange {
  start: string; // ISO date string
  end: string; // ISO date string
}

/**
 * Tool statistics
 */
export interface ToolStats {
  toolName: string;
  totalInteractions: number;
  uniqueUsers: number;
  averageDuration: number | null;
  completionRate: number | null;
  viewCount: number;
  startCount: number;
  completeCount: number;
}

/**
 * Tool interaction with typed fields
 */
export interface ToolInteraction {
  id: string;
  user_id: string | null;
  tool_name: string;
  action: ToolAction;
  duration_seconds: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

/**
 * Tool Analytics Repository
 * Extends BaseRepository with tool analytics-specific operations
 */
export class ToolAnalyticsRepository extends BaseRepository<"tool_analytics"> {
  constructor() {
    super("tool_analytics");
  }

  /**
   * Convert database row to typed ToolInteraction
   */
  private toToolInteraction(row: ToolAnalyticsRow): ToolInteraction {
    return {
      id: row.id,
      user_id: row.user_id,
      tool_name: row.tool_name,
      action: row.action as ToolAction,
      duration_seconds: row.duration_seconds,
      metadata: row.metadata as Record<string, unknown> | null,
      created_at: row.created_at,
    };
  }

  /**
   * Log a tool interaction
   *
   * @param data - Interaction data
   */
  async logInteraction(data: {
    user_id: string;
    tool_name: ToolName;
    action: ToolAction;
    duration_seconds?: number;
    metadata?: Record<string, unknown>;
  }): Promise<void> {
    const insertData: ToolAnalyticsInsert = {
      user_id: data.user_id,
      tool_name: data.tool_name,
      action: data.action,
      duration_seconds: data.duration_seconds || null,
      metadata: (data.metadata as Json) || null,
    };

    const { error } = await this.supabase
      .from("tool_analytics")
      .insert(insertData);

    if (error) {
      logger.error(
        "Error logging tool interaction",
        error instanceof Error ? error : new Error(String(error))
      );
      // Don't throw - analytics logging should not break the app
    }
  }

  /**
   * Get statistics for a specific tool
   *
   * @param toolName - Tool name
   * @param dateRange - Optional date range filter
   * @returns Tool statistics
   */
  async getToolStats(
    toolName: string,
    dateRange?: DateRange
  ): Promise<ToolStats> {
    let query = this.supabase
      .from("tool_analytics")
      .select("*")
      .eq("tool_name", toolName);

    if (dateRange) {
      query = query
        .gte("created_at", dateRange.start)
        .lte("created_at", dateRange.end);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching tool stats",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch tool statistics");
    }

    const interactions = data || [];
    const uniqueUsers = new Set(interactions.map((i) => i.user_id)).size;

    // Calculate action counts
    const viewCount = interactions.filter((i) => i.action === "view").length;
    const startCount = interactions.filter((i) => i.action === "start").length;
    const completeCount = interactions.filter(
      (i) => i.action === "complete"
    ).length;

    // Calculate average duration (only for interactions with duration)
    const durationsWithValue = interactions
      .filter((i) => i.duration_seconds !== null)
      .map((i) => i.duration_seconds as number);

    const averageDuration =
      durationsWithValue.length > 0
        ? durationsWithValue.reduce((a, b) => a + b, 0) / durationsWithValue.length
        : null;

    // Calculate completion rate (complete / start)
    const completionRate =
      startCount > 0 ? (completeCount / startCount) * 100 : null;

    return {
      toolName,
      totalInteractions: interactions.length,
      uniqueUsers,
      averageDuration,
      completionRate,
      viewCount,
      startCount,
      completeCount,
    };
  }

  /**
   * Get active users count for a tool in a specific period
   *
   * @param toolName - Tool name
   * @param period - Time period (day, week, month)
   * @returns Number of unique active users
   */
  async getActiveUsers(
    toolName: string,
    period: "day" | "week" | "month"
  ): Promise<number> {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "day":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const { data, error } = await this.supabase
      .from("tool_analytics")
      .select("user_id")
      .eq("tool_name", toolName)
      .gte("created_at", startDate.toISOString());

    if (error) {
      logger.error(
        "Error fetching active users",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    const uniqueUsers = new Set(data?.map((d) => d.user_id) || []);
    return uniqueUsers.size;
  }

  /**
   * Get completion rate for a tool
   *
   * @param toolName - Tool name
   * @returns Completion rate as percentage (0-100)
   */
  async getCompletionRate(toolName: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("tool_analytics")
      .select("action")
      .eq("tool_name", toolName)
      .in("action", ["start", "complete"]);

    if (error) {
      logger.error(
        "Error fetching completion rate",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    const startCount = data?.filter((d) => d.action === "start").length || 0;
    const completeCount =
      data?.filter((d) => d.action === "complete").length || 0;

    return startCount > 0 ? (completeCount / startCount) * 100 : 0;
  }

  /**
   * Get all tool statistics for admin dashboard
   *
   * @param dateRange - Optional date range filter
   * @returns Array of tool statistics
   */
  async getAllToolStats(dateRange?: DateRange): Promise<ToolStats[]> {
    const toolNames: ToolName[] = [
      "daily-checkin",
      "energy-budget",
      "state-tracker",
      "four-states",
      "regeneration-guide",
      "shadow-work",
      "quick-quiz",
    ];

    const stats = await Promise.all(
      toolNames.map((name) => this.getToolStats(name, dateRange))
    );

    return stats;
  }

  /**
   * Get user's tool usage history
   *
   * @param userId - User ID
   * @param limit - Maximum number of interactions to return
   * @returns Array of tool interactions
   */
  async getUserHistory(
    userId: string,
    limit: number = 50
  ): Promise<ToolInteraction[]> {
    const { data, error } = await this.supabase
      .from("tool_analytics")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching user tool history",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch tool history");
    }

    return (data || []).map((row) => this.toToolInteraction(row));
  }
}

/**
 * Singleton instance of ToolAnalyticsRepository
 */
export const toolAnalyticsRepository = new ToolAnalyticsRepository();
