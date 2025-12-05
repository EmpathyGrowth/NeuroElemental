/**
 * Lesson Notes Repository
 * Manages student notes on lessons for study and review
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUpdateTimestamp } from "@/lib/utils";

/** Lesson note record */
interface LessonNote {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string | null;
  updated_at: string | null;
}

/** Lesson note insert */
interface LessonNoteInsert {
  user_id: string;
  lesson_id: string;
  content: string;
}

/** Lesson note update */
interface LessonNoteUpdate {
  content?: string;
  updated_at?: string;
}

/** Note with lesson info */
export interface LessonNoteWithLesson extends LessonNote {
  lesson: {
    id: string;
    title: string;
    module_id: string | null;
  } | null;
}

/** Note with full context (lesson + module + course) */
export interface LessonNoteWithContext extends LessonNote {
  lesson: {
    id: string;
    title: string;
    module: {
      id: string;
      title: string;
      course: {
        id: string;
        title: string;
        slug: string;
      } | null;
    } | null;
  } | null;
}

/**
 * Lesson Notes Repository
 */
export class LessonNotesRepository {
  private get supabase() {
    return createAdminClient();
  }

  /**
   * Get a note by user and lesson
   */
  async findByUserAndLesson(
    userId: string,
    lessonId: string
  ): Promise<LessonNote | null> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select("*")
      .eq("user_id", userId)
      .eq("lesson_id", lessonId)
      .maybeSingle() as { data: LessonNote | null; error: Error | null };

    if (error) {
      logger.error("Error fetching lesson note", error ?? undefined);
      return null;
    }

    return data;
  }

  /**
   * Get all notes for a user
   */
  async getUserNotes(userId: string): Promise<LessonNoteWithLesson[]> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select(
        `
        *,
        lesson:course_lessons(id, title, module_id)
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }) as { data: LessonNoteWithLesson[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching user notes", error ?? undefined);
      return [];
    }

    return data || [];
  }

  /**
   * Get all notes for a user with full context
   */
  async getUserNotesWithContext(
    userId: string
  ): Promise<LessonNoteWithContext[]> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select(
        `
        *,
        lesson:course_lessons(
          id,
          title,
          module:course_modules(
            id,
            title,
            course:courses(id, title, slug)
          )
        )
      `
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false }) as { data: LessonNoteWithContext[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching user notes with context", error ?? undefined);
      return [];
    }

    return data || [];
  }

  /**
   * Get notes for a specific course
   */
  async getUserNotesForCourse(
    userId: string,
    courseId: string
  ): Promise<LessonNoteWithLesson[]> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select(
        `
        *,
        lesson:course_lessons!inner(
          id,
          title,
          module_id,
          course_modules!inner(course_id)
        )
      `
      )
      .eq("user_id", userId)
      .eq("lesson.course_modules.course_id", courseId)
      .order("updated_at", { ascending: false }) as { data: LessonNoteWithLesson[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching course notes", error ?? undefined);
      return [];
    }

    return data || [];
  }

  /**
   * Create or update a note (upsert)
   */
  async upsertNote(
    userId: string,
    lessonId: string,
    content: string
  ): Promise<LessonNote> {
    const existing = await this.findByUserAndLesson(userId, lessonId);

    if (existing) {
      return this.updateNote(existing.id, content);
    }

    const insertData: LessonNoteInsert = {
      user_id: userId,
      lesson_id: lessonId,
      content,
    };

    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .insert(insertData)
      .select()
      .single() as { data: LessonNote | null; error: Error | null };

    if (error || !data) {
      logger.error("Error creating lesson note", error ?? undefined);
      throw internalError("Failed to create note");
    }

    return data;
  }

  /**
   * Update a note
   */
  async updateNote(noteId: string, content: string): Promise<LessonNote> {
    const updateData: LessonNoteUpdate = {
      content,
      ...getUpdateTimestamp(),
    };

    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .update(updateData)
      .eq("id", noteId)
      .select()
      .single() as { data: LessonNote | null; error: Error | null };

    if (error || !data) {
      logger.error("Error updating lesson note", error ?? undefined);
      throw internalError("Failed to update note");
    }

    return data;
  }

  /**
   * Delete a note
   */
  async deleteNote(noteId: string, userId: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from("lesson_notes")
      .delete()
      .eq("id", noteId)
      .eq("user_id", userId) as { error: Error | null };

    if (error) {
      logger.error("Error deleting lesson note", error ?? undefined);
      throw internalError("Failed to delete note");
    }
  }

  /**
   * Get note count for user
   */
  async getUserNoteCount(userId: string): Promise<number> {
    const { count, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId) as { count: number | null; error: Error | null };

    if (error) {
      logger.error("Error counting notes", error ?? undefined);
      return 0;
    }

    return count || 0;
  }

  /**
   * Search notes by content
   */
  async searchUserNotes(
    userId: string,
    query: string
  ): Promise<LessonNoteWithLesson[]> {
    const { data, error } = await (this.supabase as any)
      .from("lesson_notes")
      .select(
        `
        *,
        lesson:course_lessons(id, title, module_id)
      `
      )
      .eq("user_id", userId)
      .ilike("content", `%${query}%`)
      .order("updated_at", { ascending: false }) as { data: LessonNoteWithLesson[] | null; error: Error | null };

    if (error) {
      logger.error("Error searching notes", error ?? undefined);
      return [];
    }

    return data || [];
  }
}

/** Singleton instance */
export const lessonNotesRepository = new LessonNotesRepository();
