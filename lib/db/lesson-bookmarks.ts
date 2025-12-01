/**
 * Lesson Bookmarks Repository
 * Manages student bookmarks for quick access to lessons
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type LessonBookmark = Database["public"]["Tables"]["lesson_bookmarks"]["Row"];
type LessonBookmarkInsert =
  Database["public"]["Tables"]["lesson_bookmarks"]["Insert"];

/** Bookmark with lesson info */
export interface LessonBookmarkWithLesson extends LessonBookmark {
  lesson: {
    id: string;
    title: string;
    content_type: string;
    duration_minutes: number | null;
    module_id: string | null;
  } | null;
}

/** Bookmark with full context */
export interface LessonBookmarkWithContext extends LessonBookmark {
  lesson: {
    id: string;
    title: string;
    content_type: string;
    duration_minutes: number | null;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
        slug: string;
        thumbnail_url: string | null;
      } | null;
    } | null;
  } | null;
}

/**
 * Lesson Bookmarks Repository
 */
export class LessonBookmarksRepository extends BaseRepository<"lesson_bookmarks"> {
  constructor() {
    super("lesson_bookmarks");
  }

  /**
   * Check if lesson is bookmarked
   */
  async isBookmarked(userId: string, lessonId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from("lesson_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    return !!data;
  }

  /**
   * Get bookmark by user and lesson
   */
  async findByUserAndLesson(
    userId: string,
    lessonId: string
  ): Promise<LessonBookmark | null> {
    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching bookmark", error);
      return null;
    }

    return data;
  }

  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(userId: string): Promise<LessonBookmarkWithLesson[]> {
    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .select(
        `
        *,
        lesson:course_lessons(id, title, content_type, duration_minutes, module_id)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user bookmarks", error);
      return [];
    }

    return (data || []) as LessonBookmarkWithLesson[];
  }

  /**
   * Get all bookmarks with full context
   */
  async getUserBookmarksWithContext(
    userId: string
  ): Promise<LessonBookmarkWithContext[]> {
    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .select(
        `
        *,
        lesson:course_lessons(
          id,
          title,
          content_type,
          duration_minutes,
          module:course_modules(
            id,
            title,
            course:courses(id, title, slug, thumbnail_url)
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching bookmarks with context", error);
      return [];
    }

    return (data || []) as unknown as LessonBookmarkWithContext[];
  }

  /**
   * Get bookmarks for a specific course
   */
  async getUserBookmarksForCourse(
    userId: string,
    courseId: string
  ): Promise<LessonBookmarkWithLesson[]> {
    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .select(
        `
        *,
        lesson:course_lessons!inner(
          id,
          title,
          content_type,
          duration_minutes,
          module_id,
          course_modules!inner(course_id)
        )
      `
      )
      .eq("user_id", userId)
      .eq("lesson.course_modules.course_id", courseId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching course bookmarks", error);
      return [];
    }

    return (data || []) as unknown as LessonBookmarkWithLesson[];
  }

  /**
   * Add a bookmark
   */
  async addBookmark(
    userId: string,
    lessonId: string,
    note?: string
  ): Promise<LessonBookmark> {
    // Check if already bookmarked
    const existing = await this.findByUserAndLesson(userId, lessonId);
    if (existing) {
      return existing;
    }

    const insertData: LessonBookmarkInsert = {
      user_id: userId,
      lesson_id: lessonId,
      note: note || null,
    };

    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating bookmark", error);
      throw internalError("Failed to create bookmark");
    }

    return data;
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, lessonId: string): Promise<void> {
    const { error } = await this.supabase
      .from("lesson_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId);

    if (error) {
      logger.error("Error removing bookmark", error);
      throw internalError("Failed to remove bookmark");
    }
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  async toggleBookmark(
    userId: string,
    lessonId: string,
    note?: string
  ): Promise<{ bookmarked: boolean; bookmark?: LessonBookmark }> {
    const existing = await this.findByUserAndLesson(userId, lessonId);

    if (existing) {
      await this.removeBookmark(userId, lessonId);
      return { bookmarked: false };
    }

    const bookmark = await this.addBookmark(userId, lessonId, note);
    return { bookmarked: true, bookmark };
  }

  /**
   * Update bookmark note
   */
  async updateNote(
    userId: string,
    lessonId: string,
    note: string | null
  ): Promise<LessonBookmark | null> {
    const { data, error } = await this.supabase
      .from("lesson_bookmarks")
      .update({ note })
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating bookmark note", error);
      return null;
    }

    return data;
  }

  /**
   * Get bookmark count for user
   */
  async getUserBookmarkCount(userId: string): Promise<number> {
    return this.count({ user_id: userId });
  }

  /**
   * Get bookmarked lesson IDs for a course (for UI state)
   */
  async getBookmarkedLessonIds(
    userId: string,
    courseId: string
  ): Promise<string[]> {
    const bookmarks = await this.getUserBookmarksForCourse(userId, courseId);
    return bookmarks.map((b) => b.lesson_id);
  }
}

/** Singleton instance */
export const lessonBookmarksRepository = new LessonBookmarksRepository();
