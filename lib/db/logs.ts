/**
 * Logs Repository
 * Manages application logs and user activity logs
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for log management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database, Json } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type Log = Database["public"]["Tables"]["logs"]["Row"];
type _LogInsert = Database["public"]["Tables"]["logs"]["Insert"];
type _LogUpdate = Database["public"]["Tables"]["logs"]["Update"];

/**
 * Log level types
 */
export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Check-in data structure (stored in log context)
 */
export interface CheckInData {
  activity_type: "daily_check_in";
  element: string;
  energy_level: number;
  current_state: "biological" | "societal" | "passion" | "protection";
  reflection?: string;
  gratitude?: string;
  intention?: string;
}

/**
 * Check-in log entry
 */
export interface CheckInLog {
  id: string;
  created_at: string;
  element: string;
  energy_level: number;
  current_state: string;
  reflection?: string;
  gratitude?: string;
  intention?: string;
}

/**
 * Logs Repository
 * Extends BaseRepository with log-specific operations
 */
export class LogsRepository extends BaseRepository<"logs"> {
  constructor() {
    super("logs");
  }

  /**
   * Create a log entry
   *
   * @param level - Log level
   * @param message - Log message
   * @param context - Additional context data
   * @param userId - Optional user ID
   * @returns Created log entry
   */
  async createLog(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    userId?: string
  ): Promise<Log> {
    const { data, error } = await this.supabase
      .from("logs")
      .insert({
        level,
        message,
        user_id: userId || null,
        context: (context as Json) || null,
        timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error creating log entry",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create log");
    }

    return data as Log;
  }

  /**
   * Save daily check-in
   *
   * @param userId - User ID
   * @param checkInData - Check-in data
   * @returns Created log entry
   */
  async saveCheckIn(
    userId: string,
    checkInData: Omit<CheckInData, "activity_type">
  ): Promise<Log> {
    return this.createLog(
      "info",
      "Daily check-in completed",
      {
        activity_type: "daily_check_in",
        ...checkInData,
      },
      userId
    );
  }

  /**
   * Get user's check-in history
   *
   * @param userId - User ID
   * @param limit - Maximum number of check-ins (default: 30)
   * @returns Array of check-in logs
   */
  async getUserCheckIns(
    userId: string,
    limit: number = 30
  ): Promise<CheckInLog[]> {
    const { data, error } = await this.supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .eq("level", "info")
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching user check-ins",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch check-ins");
    }

    // Filter and transform to check-in format
    const checkIns = (data || [])
      .filter((log) => {
        const context = log.context as any;
        return context?.activity_type === "daily_check_in";
      })
      .map((log) => {
        const context = log.context as any;
        return {
          id: log.id,
          created_at: log.timestamp || log.id, // Fallback to ID if timestamp missing
          element: context?.element || "",
          energy_level: context?.energy_level || 0,
          current_state: context?.current_state || "",
          reflection: context?.reflection,
          gratitude: context?.gratitude,
          intention: context?.intention,
        };
      });

    return checkIns as CheckInLog[];
  }

  /**
   * Get logs by user
   *
   * @param userId - User ID
   * @param level - Optional log level filter
   * @param limit - Maximum number of logs
   * @returns Array of logs
   */
  async getByUser(
    userId: string,
    level?: LogLevel,
    limit: number = 100
  ): Promise<Log[]> {
    let query = this.supabase
      .from("logs")
      .select("*")
      .eq("user_id", userId)
      .order("timestamp", { ascending: false });

    if (level) {
      query = query.eq("level", level);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching user logs",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as Log[];
  }

  /**
   * Get error logs
   *
   * @param userId - Optional user ID filter
   * @param limit - Maximum number of logs
   * @returns Array of error logs
   */
  async getErrors(userId?: string, limit: number = 50): Promise<Log[]> {
    let query = this.supabase
      .from("logs")
      .select("*")
      .eq("level", "error")
      .order("timestamp", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching error logs",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as Log[];
  }

  /**
   * Get logs by time range
   *
   * @param startDate - Start date
   * @param endDate - End date
   * @param level - Optional log level filter
   * @returns Array of logs
   */
  async getByTimeRange(
    startDate: string,
    endDate: string,
    level?: LogLevel
  ): Promise<Log[]> {
    let query = this.supabase
      .from("logs")
      .select("*")
      .gte("timestamp", startDate)
      .lte("timestamp", endDate)
      .order("timestamp", { ascending: false });

    if (level) {
      query = query.eq("level", level);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching logs by time range",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as Log[];
  }

  /**
   * Delete old logs
   *
   * @param daysOld - Delete logs older than this many days
   * @param levels - Optional level filter (default: ['debug', 'info'])
   * @returns Number of deleted logs
   */
  async cleanupOldLogs(
    daysOld: number = 30,
    levels: LogLevel[] = ["debug", "info"]
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await this.supabase
      .from("logs")
      .delete()
      .in("level", levels)
      .lt("timestamp", cutoffDate.toISOString())
      .select("id");

    if (error) {
      logger.error(
        "Error cleaning up old logs",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Get log statistics
   *
   * @param userId - Optional user ID filter
   * @returns Log statistics
   */
  async getStats(userId?: string): Promise<{
    total: number;
    byLevel: Record<string, number>;
    last24Hours: number;
  }> {
    let query = this.supabase.from("logs").select("level, timestamp");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error || !data) {
      return {
        total: 0,
        byLevel: {},
        last24Hours: 0,
      };
    }

    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const byLevel: Record<string, number> = {};
    let last24Hours = 0;

    data.forEach((log: { level: string; timestamp: string | null }) => {
      byLevel[log.level] = (byLevel[log.level] || 0) + 1;

      if (log.timestamp && new Date(log.timestamp) >= yesterday) {
        last24Hours++;
      }
    });

    return {
      total: data.length,
      byLevel,
      last24Hours,
    };
  }
}

/**
 * Singleton instance of LogsRepository
 */
export const logsRepository = new LogsRepository();
