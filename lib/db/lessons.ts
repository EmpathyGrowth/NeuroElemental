/**
 * Lesson Repository
 * Manages course lesson data and operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for lesson management.
 */

import { internalError } from '@/lib/api';
import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { BaseRepository } from './base-repository';

type Lesson = Database['public']['Tables']['course_lessons']['Row'];
type LessonInsert = Database['public']['Tables']['course_lessons']['Insert'];
type LessonUpdate = Database['public']['Tables']['course_lessons']['Update'];

/**
 * Lesson Repository
 * Extends BaseRepository with lesson-specific operations
 */
export class LessonRepository extends BaseRepository<'course_lessons'> {
  constructor() {
    super('course_lessons');
  }

  /**
   * Get lessons by module ID
   *
   * @param moduleId - Module ID
   * @returns Array of lessons ordered by order_index
   */
  async getByModule(moduleId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase
      .from('course_lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true });

    if (error) {
      logger.error('Error fetching module lessons', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to fetch lessons');
    }

    return data as Lesson[];
  }

  /**
   * Create new lesson
   *
   * @param data - Lesson data
   * @returns Created lesson
   */
  async createLesson(data: LessonInsert): Promise<Lesson> {
    const { data: lesson, error } = await this.supabase
      .from('course_lessons')
      .insert(data)
      .select()
      .single();

    if (error || !lesson) {
      logger.error('Error creating lesson', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to create lesson');
    }

    return lesson as Lesson;
  }

  /**
   * Update lesson
   *
   * @param lessonId - Lesson ID
   * @param data - Lesson update data
   * @returns Updated lesson
   */
  async updateLesson(lessonId: string, data: LessonUpdate): Promise<Lesson> {
    const { data: lesson, error } = await this.supabase
      .from('course_lessons')
      .update(data)
      .eq('id', lessonId)
      .select()
      .single();

    if (error || !lesson) {
      logger.error('Error updating lesson', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to update lesson');
    }

    return lesson as Lesson;
  }

  /**
   * Delete lesson
   *
   * @param lessonId - Lesson ID
   */
  async deleteLesson(lessonId: string): Promise<void> {
    const { error } = await this.supabase
      .from('course_lessons')
      .delete()
      .eq('id', lessonId);

    if (error) {
      logger.error('Error deleting lesson', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to delete lesson');
    }
  }

  /**
   * Get preview lessons for a course (across all modules)
   *
   * @param courseId - Course ID
   * @returns Array of preview lessons
   */
  async getPreviewLessons(courseId: string): Promise<Lesson[]> {
    const { data, error } = await this.supabase
      .from('course_lessons')
      .select('*, course_modules!inner(course_id)')
      .eq('is_preview', true)
      .eq('course_modules.course_id', courseId)
      .order('order_index', { ascending: true });

    if (error) {
      logger.error('Error fetching preview lessons', error instanceof Error ? error : new Error(String(error)));
      return [];
    }

    return data as Lesson[];
  }

  /**
   * Reorder lessons within a module
   *
   * @param lessonOrders - Array of {id, order_index} objects
   * @returns Updated lessons
   */
  async reorderLessons(lessonOrders: Array<{ id: string; order_index: number }>): Promise<Lesson[]> {
    const updates = lessonOrders.map(({ id, order_index }) =>
      this.updateLesson(id, { order_index })
    );

    const lessons = await Promise.all(updates);
    return lessons;
  }

  /**
   * Get lesson count for module
   *
   * @param moduleId - Module ID
   * @returns Number of lessons
   */
  async getCountByModule(moduleId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('course_lessons')
      .select('*', { count: 'exact', head: true })
      .eq('module_id', moduleId);

    if (error) {
      logger.error('Error counting module lessons', error instanceof Error ? error : new Error(String(error)));
      return 0;
    }

    return count || 0;
  }

  /**
   * Get total duration for module
   *
   * @param moduleId - Module ID
   * @returns Total duration in minutes
   */
  async getTotalDuration(moduleId: string): Promise<number> {
    const lessons = await this.getByModule(moduleId);
    return lessons.reduce((total, lesson) => total + (lesson.duration_minutes || 0), 0);
  }

  /**
   * Toggle lesson preview status
   *
   * @param lessonId - Lesson ID
   * @param isPreview - Preview status
   * @returns Updated lesson
   */
  async togglePreview(lessonId: string, isPreview: boolean): Promise<Lesson> {
    return this.updateLesson(lessonId, { is_preview: isPreview });
  }
}

/**
 * Singleton instance of LessonRepository
 */
export const lessonRepository = new LessonRepository();
