/**
 * Lesson Bookmarks Repository
 * Manages student bookmarks for quick access to lessons
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/admin";

/** Lesson bookmark record */
interface LessonBookmark {
  id: string;
  user_id: string;
  lesson_id: string;
  note: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** Lesson bookmark insert */
interface LessonBookmarkInsert {
  user_id: string;
  lesson_id: string;
  note?: string | null;
}

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
export class LessonBookmarksRepository {
  protected supabase = createAdminClient();

  /**
   * Check if lesson is bookmarked
   */
  async isBookmarked(userId: string, lessonId: string): Promise<boolean> {
    const { data } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .select("id")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle() as { data: { id: string } | null };

    return !!data;
  }

  /**
   * Get bookmark by user and lesson
   */
  async findByUserAndLesson(
    userId: string,
    lessonId: string
  ): Promise<LessonBookmark | null> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle() as { data: LessonBookmark | null; error: Error | null };

    if (error) {
      logger.error("Error fetching bookmark", error ?? undefined);
      return null;
    }

    return data;
  }

  /**
   * Get all bookmarks for a user
   */
  async getUserBookmarks(userId: string): Promise<LessonBookmarkWithLesson[]> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .select(
        `
        *,
        lesson:course_lessons(id, title, content_type, duration_minutes, module_id)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false }) as { data: LessonBookmarkWithLesson[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching user bookmarks", error ?? undefined);
      return [];
    }

    return data || [];
  }

  /**
   * Get all bookmarks with full context
   */
  async getUserBookmarksWithContext(
    userId: string
  ): Promise<LessonBookmarkWithContext[]> {
    const { data, error } = await (this.supabase as any)
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
      .order("created_at", { ascending: false }) as { data: LessonBookmarkWithContext[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching bookmarks with context", error ?? undefined);
      return [];
    }

    return data || [];
  }

  /**
   * Get bookmarks for a specific course
   */
  async getUserBookmarksForCourse(
    userId: string,
    courseId: string
  ): Promise<LessonBookmarkWithLesson[]> {
    const { data, error } = await (this.supabase as any)
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
      .order("created_at", { ascending: false }) as { data: LessonBookmarkWithLesson[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching course bookmarks", error ?? undefined);
      return [];
    }

    return data || [];
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

    const { data, error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .insert(insertData)
      .select()
      .single() as { data: LessonBookmark | null; error: Error | null };

    if (error || !data) {
      logger.error("Error creating bookmark", error ?? undefined);
      throw internalError("Failed to create bookmark");
    }

    return data;
  }

  /**
   * Remove a bookmark
   */
  async removeBookmark(userId: string, lessonId: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("lesson_id", lessonId) as { error: Error | null };

    if (error) {
      logger.error("Error removing bookmark", error ?? undefined);
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
    const { data, error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .update({ note })
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .select()
      .single() as { data: LessonBookmark | null; error: Error | null };

    if (error) {
      logger.error("Error updating bookmark note", error ?? undefined);
      return null;
    }

    return data;
  }

  /**
   * Get bookmark count for user
   */
  async getUserBookmarkCount(userId: string): Promise<number> {
    const { count, error } = await (this.supabase as any)
      .from("lesson_bookmarks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId) as { count: number | null; error: Error | null };

    if (error) {
      logger.error("Error counting bookmarks", error ?? undefined);
      return 0;
    }

    return count || 0;
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
