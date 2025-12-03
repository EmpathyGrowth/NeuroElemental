/**
 * Shadow Session Repository
 * Manages shadow work session data for the Shadow Work tool
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for shadow session management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database, Json } from "@/lib/types/supabase";
import { getUpdateTimestamp } from "@/lib/utils";
import { BaseRepository } from "./base-repository";

type ShadowSessionRow = Database["public"]["Tables"]["shadow_sessions"]["Row"];
type ShadowSessionInsert = Database["public"]["Tables"]["shadow_sessions"]["Insert"];
type ShadowSessionUpdate = Database["public"]["Tables"]["shadow_sessions"]["Update"];

/**
 * Element types for shadow work
 */
export type ElementType =
  | "electric"
  | "fiery"
  | "aquatic"
  | "earthly"
  | "airy"
  | "metallic";

/**
 * Session status types
 */
export type SessionStatus = "in_progress" | "completed" | "abandoned";

/**
 * Shadow session with typed fields
 */
export interface ShadowSession {
  id: string;
  user_id: string | null;
  element: ElementType;
  current_step: number; // 1-4
  reflections: Record<number, string>; // step -> reflection text
  started_at: string | null;
  completed_at: string | null;
  status: SessionStatus;
}

/**
 * Shadow Session Repository
 * Extends BaseRepository with shadow session-specific operations
 */
export class ShadowSessionRepository extends BaseRepository<"shadow_sessions"> {
  constructor() {
    super("shadow_sessions");
  }

  /**
   * Convert database row to typed ShadowSession
   */
  private toShadowSession(row: ShadowSessionRow): ShadowSession {
    return {
      id: row.id,
      user_id: row.user_id,
      element: row.element as ElementType,
      current_step: row.current_step,
      reflections: (row.reflections as Record<number, string>) || {},
      started_at: row.started_at,
      completed_at: row.completed_at,
      status: row.status as SessionStatus,
    };
  }

  /**
   * Get active (in_progress) session for a user
   * Only returns sessions started within the last 7 days
   *
   * @param userId - User ID
   * @returns Active session or null if none exists
   */
  async getActiveSession(userId: string): Promise<ShadowSession | null> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .gte("started_at", sevenDaysAgo.toISOString())
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching active shadow session",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data ? this.toShadowSession(data) : null;
  }

  /**
   * Create a new shadow work session
   *
   * @param userId - User ID
   * @param element - Element type for the session
   * @returns Created session
   */
  async createSession(
    userId: string,
    element: ElementType
  ): Promise<ShadowSession> {
    const insertData: ShadowSessionInsert = {
      user_id: userId,
      element,
      current_step: 1,
      reflections: {} as unknown as Json,
      started_at: new Date().toISOString(),
      status: "in_progress",
    };

    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error creating shadow session",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create shadow session");
    }

    return this.toShadowSession(data);
  }

  /**
   * Update session progress
   *
   * @param sessionId - Session ID
   * @param step - Current step number (1-4)
   * @param reflection - Optional reflection text for the step
   * @returns Updated session
   */
  async updateProgress(
    sessionId: string,
    step: number,
    reflection?: string
  ): Promise<ShadowSession> {
    // First get the current session to merge reflections
    const { data: current, error: fetchError } = await this.supabase
      .from("shadow_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (fetchError || !current) {
      logger.error(
        "Error fetching shadow session for update",
        fetchError instanceof Error ? fetchError : new Error(String(fetchError))
      );
      throw internalError("Failed to fetch shadow session");
    }

    const currentReflections = (current.reflections as Record<number, string>) || {};
    const updatedReflections = reflection
      ? { ...currentReflections, [step]: reflection }
      : currentReflections;

    const updateData: ShadowSessionUpdate = {
      current_step: step,
      reflections: updatedReflections as unknown as Json,
      ...getUpdateTimestamp(),
    };

    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error updating shadow session progress",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update shadow session");
    }

    return this.toShadowSession(data);
  }

  /**
   * Mark session as completed
   *
   * @param sessionId - Session ID
   * @returns Completed session
   */
  async completeSession(sessionId: string): Promise<ShadowSession> {
    const updateData: ShadowSessionUpdate = {
      status: "completed",
      completed_at: new Date().toISOString(),
      current_step: 4, // Ensure step is set to final
      ...getUpdateTimestamp(),
    };

    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error completing shadow session",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to complete shadow session");
    }

    return this.toShadowSession(data);
  }

  /**
   * Get count of completed sessions by element for a user
   *
   * @param userId - User ID
   * @returns Record of element -> completed session count
   */
  async getCompletedByElement(
    userId: string
  ): Promise<Record<ElementType, number>> {
    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .select("element")
      .eq("user_id", userId)
      .eq("status", "completed");

    if (error) {
      logger.error(
        "Error fetching completed sessions by element",
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        electric: 0,
        fiery: 0,
        aquatic: 0,
        earthly: 0,
        airy: 0,
        metallic: 0,
      };
    }

    const counts: Record<ElementType, number> = {
      electric: 0,
      fiery: 0,
      aquatic: 0,
      earthly: 0,
      airy: 0,
      metallic: 0,
    };

    (data || []).forEach((row) => {
      const element = row.element as ElementType;
      if (element in counts) {
        counts[element]++;
      }
    });

    return counts;
  }

  /**
   * Get session history for a user
   *
   * @param userId - User ID
   * @param limit - Maximum number of sessions to return
   * @returns Array of sessions ordered by started_at descending
   */
  async getHistory(userId: string, limit: number = 20): Promise<ShadowSession[]> {
    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching shadow session history",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch shadow session history");
    }

    return (data || []).map((row) => this.toShadowSession(row));
  }

  /**
   * Abandon old in-progress sessions
   * Marks sessions older than 7 days as abandoned
   *
   * @param userId - User ID
   * @returns Number of sessions abandoned
   */
  async abandonOldSessions(userId: string): Promise<number> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await this.supabase
      .from("shadow_sessions")
      .update({ status: "abandoned" })
      .eq("user_id", userId)
      .eq("status", "in_progress")
      .lt("started_at", sevenDaysAgo.toISOString())
      .select("id");

    if (error) {
      logger.error(
        "Error abandoning old shadow sessions",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return data?.length || 0;
  }
}

/**
 * Singleton instance of ShadowSessionRepository
 */
export const shadowSessionRepository = new ShadowSessionRepository();
