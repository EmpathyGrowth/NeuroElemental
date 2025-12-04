/**
 * Lesson Progress Repository
 * Manages lesson completion and time tracking
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for lesson progress management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type LessonProgress = Database["public"]["Tables"]["lesson_progress"]["Row"];
type _LessonProgressInsert =
  Database["public"]["Tables"]["lesson_progress"]["Insert"];
type _LessonProgressUpdate =
  Database["public"]["Tables"]["lesson_progress"]["Update"];

/**
 * Lesson Progress Repository
 * Extends BaseRepository with lesson progress-specific operations
 */
export class LessonProgressRepository extends BaseRepository<"lesson_progress"> {
  constructor() {
    super("lesson_progress");
  }

  /**
   * Get lesson progress for an enrollment
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @returns Lesson progress or null
   */
  async getProgress(
    enrollmentId: string,
    lessonId: string
  ): Promise<LessonProgress | null> {
    const { data, error } = await this.supabase
      .from("lesson_progress")
      .select("*")
      .eq("enrollment_id", enrollmentId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching lesson progress",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as LessonProgress | null;
  }

  /**
   * Get all lesson progress for an enrollment
   *
   * @param enrollmentId - Enrollment ID
   * @returns Array of lesson progress
   */
  async getAllProgressForEnrollment(
    enrollmentId: string
  ): Promise<LessonProgress[]> {
    const { data, error } = await this.supabase
      .from("lesson_progress")
      .select("*")
      .eq("enrollment_id", enrollmentId);

    if (error) {
      logger.error(
        "Error fetching enrollment progress",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as LessonProgress[];
  }

  /**
   * Update or create lesson progress (upsert)
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @param data - Progress data (time spent, completion status)
   * @returns Updated or created progress
   */
  async upsertProgress(
    enrollmentId: string,
    lessonId: string,
    data: { time_spent_seconds?: number; completed_at?: string | null }
  ): Promise<LessonProgress> {
    const { data: progress, error } = await (this.supabase as any)
      .from("lesson_progress")
      .upsert(
        {
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          ...data,
        },
        {
          onConflict: "enrollment_id,lesson_id",
        }
      )
      .select()
      .single() as { data: LessonProgress | null; error: Error | null };

    if (error || !progress) {
      logger.error(
        "Error upserting lesson progress",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update lesson progress");
    }

    return progress;
  }

  /**
   * Add time to lesson progress
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @param timeSeconds - Time to add in seconds
   * @returns Updated progress
   */
  async addTime(
    enrollmentId: string,
    lessonId: string,
    timeSeconds: number
  ): Promise<LessonProgress> {
    const existing = await this.getProgress(enrollmentId, lessonId);

    const currentTime = existing?.time_spent_seconds || 0;
    const newTime = currentTime + timeSeconds;

    return this.upsertProgress(enrollmentId, lessonId, {
      time_spent_seconds: newTime,
    });
  }

  /**
   * Mark lesson as completed
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @returns Updated progress
   */
  async markCompleted(
    enrollmentId: string,
    lessonId: string
  ): Promise<LessonProgress> {
    return this.upsertProgress(enrollmentId, lessonId, {
      completed_at: new Date().toISOString(),
    });
  }

  /**
   * Get total time spent on course
   *
   * @param enrollmentId - Enrollment ID
   * @returns Total time in seconds
   */
  async getTotalTimeSpent(enrollmentId: string): Promise<number> {
    const progress = await this.getAllProgressForEnrollment(enrollmentId);

    return progress.reduce(
      (total, p) => total + (p.time_spent_seconds || 0),
      0
    );
  }

  /**
   * Get completed lessons count for enrollment
   *
   * @param enrollmentId - Enrollment ID
   * @returns Number of completed lessons
   */
  async getCompletedCount(enrollmentId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("enrollment_id", enrollmentId)
      .not("completed_at", "is", null);

    if (error) {
      logger.error(
        "Error counting completed lessons",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return count || 0;
  }

  /**
   * Get progress statistics for enrollment
   *
   * @param enrollmentId - Enrollment ID
   * @returns Progress statistics
   */
  async getStats(enrollmentId: string): Promise<{
    totalLessons: number;
    completedLessons: number;
    totalTimeSeconds: number;
    completionRate: number;
  }> {
    const progress = await this.getAllProgressForEnrollment(enrollmentId);

    const totalLessons = progress.length;
    const completedLessons = progress.filter((p) => p.completed_at).length;
    const totalTimeSeconds = progress.reduce(
      (total, p) => total + (p.time_spent_seconds || 0),
      0
    );
    const completionRate =
      totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    return {
      totalLessons,
      completedLessons,
      totalTimeSeconds,
      completionRate: Math.round(completionRate),
    };
  }

  /**
   * Reset lesson progress (mark as incomplete)
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @returns Updated progress
   */
  async resetProgress(
    enrollmentId: string,
    lessonId: string
  ): Promise<LessonProgress> {
    return this.upsertProgress(enrollmentId, lessonId, {
      completed_at: null,
    });
  }

  /**
   * Get all progress for multiple enrollments
   *
   * @param enrollmentIds - Array of enrollment IDs
   * @returns Array of lesson progress records
   */
  async getAllProgressForEnrollments(
    enrollmentIds: string[]
  ): Promise<LessonProgress[]> {
    if (enrollmentIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("lesson_progress")
      .select("*")
      .in("enrollment_id", enrollmentIds);

    if (error) {
      logger.error(
        "Error fetching progress for enrollments",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as LessonProgress[];
  }

  /**
   * Get learning statistics for user across all enrollments
   *
   * @param userId - User ID
   * @returns Learning statistics
   */
  async getUserLearningStats(userId: string): Promise<{
    totalTimeSeconds: number;
    totalTimeHours: number;
    thisWeekSeconds: number;
    thisWeekHours: number;
    thisMonthSeconds: number;
    thisMonthHours: number;
    averageSessionMinutes: number;
    totalLessons: number;
  }> {
    // Get user's enrollments
    const { data: enrollments, error: enrollmentsError } = await (this.supabase as any)
      .from("course_enrollments")
      .select("id")
      .eq("user_id", userId) as { data: { id: string }[] | null; error: Error | null };

    if (enrollmentsError || !enrollments || enrollments.length === 0) {
      return {
        totalTimeSeconds: 0,
        totalTimeHours: 0,
        thisWeekSeconds: 0,
        thisWeekHours: 0,
        thisMonthSeconds: 0,
        thisMonthHours: 0,
        averageSessionMinutes: 0,
        totalLessons: 0,
      };
    }

    const enrollmentIds = enrollments.map((e) => e.id);

    // Get all lesson progress for user's enrollments
    const progress = await this.getAllProgressForEnrollments(enrollmentIds);

    if (progress.length === 0) {
      return {
        totalTimeSeconds: 0,
        totalTimeHours: 0,
        thisWeekSeconds: 0,
        thisWeekHours: 0,
        thisMonthSeconds: 0,
        thisMonthHours: 0,
        averageSessionMinutes: 0,
        totalLessons: 0,
      };
    }

    // Calculate statistics
    const totalTimeSeconds = progress.reduce(
      (sum, p) => sum + (p.time_spent_seconds || 0),
      0
    );

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeekSeconds = progress
      .filter((p) => p.completed_at && new Date(p.completed_at) >= oneWeekAgo)
      .reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);

    const thisMonthSeconds = progress
      .filter((p) => p.completed_at && new Date(p.completed_at) >= oneMonthAgo)
      .reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);

    const averageSessionMinutes =
      progress.length > 0
        ? Math.round(totalTimeSeconds / progress.length / 60)
        : 0;

    return {
      totalTimeSeconds,
      totalTimeHours: Math.round((totalTimeSeconds / 3600) * 10) / 10,
      thisWeekSeconds,
      thisWeekHours: Math.round((thisWeekSeconds / 3600) * 10) / 10,
      thisMonthSeconds,
      thisMonthHours: Math.round((thisMonthSeconds / 3600) * 10) / 10,
      averageSessionMinutes,
      totalLessons: progress.length,
    };
  }

  /**
   * Save video playback position
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @param positionSeconds - Current playback position in seconds
   * @param durationSeconds - Total video duration in seconds (optional)
   * @returns Updated progress
   */
  async saveVideoPosition(
    enrollmentId: string,
    lessonId: string,
    positionSeconds: number,
    durationSeconds?: number
  ): Promise<LessonProgress> {
    const updateData: Record<string, unknown> = {
      video_position_seconds: Math.max(0, Math.floor(positionSeconds)),
      last_watched_at: new Date().toISOString(),
    };

    if (durationSeconds !== undefined) {
      updateData.video_duration_seconds = Math.floor(durationSeconds);
    }

    const { data: progress, error } = await (this.supabase as any)
      .from("lesson_progress")
      .upsert(
        {
          enrollment_id: enrollmentId,
          lesson_id: lessonId,
          ...updateData,
        },
        {
          onConflict: "enrollment_id,lesson_id",
        }
      )
      .select()
      .single() as { data: LessonProgress | null; error: Error | null };

    if (error || !progress) {
      logger.error(
        "Error saving video position",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to save video position");
    }

    return progress;
  }

  /**
   * Get video playback position
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   * @returns Video position data or null
   */
  async getVideoPosition(
    enrollmentId: string,
    lessonId: string
  ): Promise<{
    positionSeconds: number;
    durationSeconds: number | null;
    lastWatchedAt: string | null;
    percentWatched: number;
  } | null> {
    const progress = await this.getProgress(enrollmentId, lessonId);

    if (!progress) {
      return null;
    }

    // Access the new columns (may need type assertion since types might not be updated)
    const positionSeconds =
      ((progress as Record<string, unknown>)
        .video_position_seconds as number) || 0;
    const durationSeconds = (progress as Record<string, unknown>)
      .video_duration_seconds as number | null;
    const lastWatchedAt = (progress as Record<string, unknown>)
      .last_watched_at as string | null;

    const percentWatched =
      durationSeconds && durationSeconds > 0
        ? Math.round((positionSeconds / durationSeconds) * 100)
        : 0;

    return {
      positionSeconds,
      durationSeconds,
      lastWatchedAt,
      percentWatched,
    };
  }

  /**
   * Clear video position (reset to beginning)
   *
   * @param enrollmentId - Enrollment ID
   * @param lessonId - Lesson ID
   */
  async clearVideoPosition(
    enrollmentId: string,
    lessonId: string
  ): Promise<void> {
    const { error } = await (this.supabase as any)
      .from("lesson_progress")
      .update({
        video_position_seconds: 0,
        last_watched_at: null,
      })
      .eq("enrollment_id", enrollmentId)
      .eq("lesson_id", lessonId);

    if (error) {
      logger.error(
        "Error clearing video position",
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }
}

/**
 * Singleton instance of LessonProgressRepository
 */
export const lessonProgressRepository = new LessonProgressRepository();
