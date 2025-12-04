/**
 * Course Repository
 * Manages course data and course-related operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for course management.
 */

import { internalError } from '@/lib/api';
import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { BaseRepository, PaginatedResult, queryBuilder } from './base-repository';

type Course = Database['public']['Tables']['courses']['Row'];
type Enrollment = Database['public']['Tables']['course_enrollments']['Row'];
type EnrollmentInsert = Database['public']['Tables']['course_enrollments']['Insert'];
type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Enrollment with user profile information
 */
export interface EnrollmentWithUser extends Enrollment {
  user: Profile | null;
}

/**
 * Course with instructor information
 */
export interface CourseWithInstructor extends Course {
  instructor?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Course Repository
 * Extends BaseRepository with course-specific operations
 */
export class CourseRepository extends BaseRepository<'courses'> {
  constructor() {
    super('courses');
  }

  /**
   * Get a course by ID with instructor information
   *
   * @param id - The course ID
   * @returns The course with instructor details or null if not found
   */
  async getCourseWithInstructor(id: string): Promise<CourseWithInstructor | null> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*, instructor:profiles!courses_created_by_fkey(id, full_name, avatar_url)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching course with instructor', error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    return data as CourseWithInstructor | null;
  }

  /**
   * Get course by slug
   *
   * @param slug - The course slug
   * @returns The course with instructor details or null if not found
   */
  async getCourseBySlug(slug: string): Promise<CourseWithInstructor | null> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*, instructor:profiles!courses_created_by_fkey(id, full_name, avatar_url)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching course by slug', error instanceof Error ? error : new Error(String(error)));
      return null;
    }

    return data as CourseWithInstructor | null;
  }

  /**
   * Get all courses with optional filters
   *
   * @param filters - Optional filters for category and other fields
   * @returns Array of courses with instructor information
   */
  async getAllCoursesWithInstructor(filters?: {
    category?: string;
    is_published?: boolean;
    difficulty_level?: string;
  }): Promise<CourseWithInstructor[]> {
    let query = this.supabase
      .from('courses')
      .select('*, instructor:profiles!courses_created_by_fkey(id, full_name, avatar_url)');

    if (filters?.is_published !== undefined) {
      query = query.eq('is_published', filters.is_published);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching courses with instructor', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to fetch courses');
    }

    return (data || []) as unknown as CourseWithInstructor[];
  }

  /**
   * Get courses with advanced filtering and pagination
   *
   * @param options - Pagination and filtering options
   * @returns Paginated result with courses
   */
  async getCourses(options: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    level?: string;
    is_published?: boolean;
  }): Promise<PaginatedResult<CourseWithInstructor>> {
    const { page = 1, limit = 12, category, search, level, is_published = true } = options;

    const query = queryBuilder('courses', this.supabase)
      .select('*, creator:profiles!courses_created_by_fkey(id, full_name, avatar_url)')
      .whereEq('is_published', is_published)
      .orderBy('created_at', false)
      .paginate(page, limit)
      .withCount();

    if (category) {
      query.whereEq('category', category);
    }

    if (level) {
      query.whereEq('difficulty_level', level);
    }

    if (search) {
      query.search(['title', 'description'], search);
    }

    const { data, count } = await query.executeWithCount();

    return {
      data: (data as unknown as CourseWithInstructor[]) || [],
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Get published courses with optional filters
   *
   * @param filters - Optional filters for category, level, limit, and offset
   * @returns Array of published courses
   */
  async getPublishedCourses(filters?: {
    category?: string;
    difficulty_level?: string;
    limit?: number;
    offset?: number;
  }): Promise<CourseWithInstructor[]> {
    let query = this.supabase
      .from('courses')
      .select('*, instructor:profiles!courses_created_by_fkey(id, full_name, avatar_url)')
      .eq('is_published', true);

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.difficulty_level) {
      query = query.eq('difficulty_level', filters.difficulty_level);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }
    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching published courses', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to fetch published courses');
    }

    return (data as unknown as CourseWithInstructor[]) || [];
  }

  /**
   * Get course enrollments for a specific course
   *
   * @param courseId - The course ID
   * @returns Array of enrollments with user information
   */
  async getCourseEnrollments(courseId: string): Promise<EnrollmentWithUser[]> {
    const { data, error } = await this.supabase
      .from('course_enrollments')
      .select('*, user:profiles(*)')
      .eq('course_id', courseId);

    if (error) {
      logger.error('Error fetching course enrollments', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to fetch course enrollments');
    }

    return (data || []) as EnrollmentWithUser[];
  }

  /**
   * Get course enrollment count
   *
   * @param courseId - The course ID
   * @returns The number of enrollments for the course
   */
  async getCourseEnrollmentCount(courseId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    if (error) {
      logger.error('Error fetching course enrollment count', error instanceof Error ? error : new Error(String(error)));
      return 0;
    }

    return count || 0;
  }

  /**
   * Enroll a user in a course
   *
   * @param userId - The user ID
   * @param courseId - The course ID
   * @returns The created enrollment record
   */
  async enrollUserInCourse(userId: string, courseId: string): Promise<Enrollment> {
    const enrollmentData: EnrollmentInsert = {
      user_id: userId,
      course_id: courseId,
    };

    const { data, error } = await (this.supabase as any)
      .from('course_enrollments')
      .insert(enrollmentData)
      .select()
      .single() as { data: Enrollment | null; error: Error | null };

    if (error) {
      logger.error('Error enrolling user in course', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to enroll user in course');
    }

    return data as Enrollment;
  }

  /**
   * Check if a user is enrolled in a course
   *
   * @param userId - The user ID
   * @param courseId - The course ID
   * @returns True if the user is enrolled, false otherwise
   */
  async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .maybeSingle();

    return !!data;
  }

  /**
   * Get courses by category with pagination
   *
   * @param category - The category to filter by
   * @param page - Page number (1-indexed)
   * @param limit - Number of results per page
   * @returns Paginated result with courses
   */
  async getCoursesByCategory(
    category: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResult<Course>> {
    return this.paginate({
      page,
      limit,
      filters: { category, is_published: true },
      orderBy: { column: 'created_at', ascending: false }
    });
  }

  /**
   * Search courses by title or description
   *
   * @param query - The search query string
   * @param limit - Maximum number of results to return (default: 20)
   * @returns Array of matching courses
   */
  async searchCourses(query: string, limit: number = 20): Promise<Course[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select('*')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      logger.error('Error searching courses', error instanceof Error ? error : new Error(String(error)));
      throw internalError('Failed to search courses');
    }

    return data || [];
  }
}

// Export singleton instance
export const courseRepository = new CourseRepository();

