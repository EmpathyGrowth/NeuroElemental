/**
 * Lesson Completions Repository
 * Manages lesson completion tracking (simpler than lesson_progress)
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for lesson completion management.
 *
 * NOTE: This is different from lesson_progress which tracks time and enrollment.
 * lesson_completions is a simpler table tracking just user completion status.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";
import { getSupabaseServer } from "./index";

type LessonCompletion =
  Database["public"]["Tables"]["lesson_completions"]["Row"];
type _LessonCompletionInsert =
  Database["public"]["Tables"]["lesson_completions"]["Insert"];

/**
 * Course completion check result
 */
export interface CourseCompletionResult {
  isComplete: boolean;
  completedCount: number;
  totalLessons: number;
  progressPercentage: number;
}

/**
 * Lesson Completions Repository
 * Extends BaseRepository with lesson completion-specific operations
 */
export class LessonCompletionsRepository extends BaseRepository<"lesson_completions"> {
  constructor() {
    super("lesson_completions");
  }

  /**
   * Mark lesson as completed (upsert)
   *
   * @param userId - User ID
   * @param lessonId - Lesson ID
   * @returns Created or updated completion record
   */
  async markCompleted(
    userId: string,
    lessonId: string
  ): Promise<LessonCompletion> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_completions")
      .upsert(
        {
          user_id: userId,
          lesson_id: lessonId,
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,lesson_id",
        }
      )
      .select()
      .single() as { data: LessonCompletion | null; error: Error | null };

    if (error || !data) {
      logger.error(
        "Error marking lesson as completed",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to mark lesson as completed");
    }

    return data;
  }

  /**
   * Get completion status for a lesson
   *
   * @param userId - User ID
   * @param lessonId - Lesson ID
   * @returns Completion record or null
   */
  async getCompletion(
    userId: string,
    lessonId: string
  ): Promise<LessonCompletion | null> {
    const { data, error } = await this.supabase
      .from("lesson_completions")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching lesson completion",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as LessonCompletion | null;
  }

  /**
   * Check if lesson is completed
   *
   * @param userId - User ID
   * @param lessonId - Lesson ID
   * @returns True if completed
   */
  async isCompleted(userId: string, lessonId: string): Promise<boolean> {
    const completion = await this.getCompletion(userId, lessonId);
    return !!completion;
  }

  /**
   * Get all completions for a user
   *
   * @param userId - User ID
   * @returns Array of completions
   */
  async getUserCompletions(userId: string): Promise<LessonCompletion[]> {
    const { data, error } = await this.supabase
      .from("lesson_completions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching user completions",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as LessonCompletion[];
  }

  /**
   * Get completions for specific lessons
   *
   * @param userId - User ID
   * @param lessonIds - Array of lesson IDs
   * @returns Array of completions
   */
  async getCompletionsForLessons(
    userId: string,
    lessonIds: string[]
  ): Promise<LessonCompletion[]> {
    if (lessonIds.length === 0) {
      return [];
    }

    const { data, error } = await this.supabase
      .from("lesson_completions")
      .select("*")
      .eq("user_id", userId)
      .in("lesson_id", lessonIds);

    if (error) {
      logger.error(
        "Error fetching lesson completions",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as LessonCompletion[];
  }

  /**
   * Check course completion and get statistics
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns Course completion result with statistics
   */
  async checkCourseCompletion(
    userId: string,
    courseId: string
  ): Promise<CourseCompletionResult> {
    const supabase = getSupabaseServer();

    // Get all lessons for the course
    const { data: allLessons, error: lessonsError } = await (supabase as any)
      .from("course_lessons")
      .select("id")
      .eq("course_id", courseId) as { data: { id: string }[] | null; error: Error | null };

    if (lessonsError || !allLessons || allLessons.length === 0) {
      logger.error(
        "Error fetching course lessons",
        lessonsError instanceof Error
          ? lessonsError
          : new Error(String(lessonsError))
      );
      return {
        isComplete: false,
        completedCount: 0,
        totalLessons: 0,
        progressPercentage: 0,
      };
    }

    const lessonIds = allLessons.map((l) => l.id);
    const completions = await this.getCompletionsForLessons(userId, lessonIds);

    const totalLessons = lessonIds.length;
    const completedCount = completions.length;
    const progressPercentage = Math.round(
      (completedCount / totalLessons) * 100
    );
    const isComplete = completedCount === totalLessons;

    return {
      isComplete,
      completedCount,
      totalLessons,
      progressPercentage,
    };
  }

  /**
   * Get course ID for a lesson
   *
   * @param lessonId - Lesson ID
   * @returns Course ID or null
   */
  async getCourseIdForLesson(lessonId: string): Promise<string | null> {
    const supabase = getSupabaseServer();

    // Lessons don't have course_id directly - need to join through modules
    const { data, error } = await (supabase as any)
      .from("course_lessons")
      .select("module_id, course_modules!inner(course_id)")
      .eq("id", lessonId)
      .maybeSingle() as { data: { module_id: string | null; course_modules: { course_id: string } } | null; error: Error | null };

    if (error || !data) {
      logger.error(
        "Error fetching lesson course ID",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    // Extract course_id from the joined module data
    const module = data.course_modules as any;
    return module?.course_id || null;
  }
}

/**
 * Singleton instance of LessonCompletionsRepository
 */
export const lessonCompletionsRepository = new LessonCompletionsRepository();
