/**
 * Instructor Course API - Single course operations
 * Get, update, and delete a course (instructor must own the course)
 */

import { RouteContext } from '@/lib/types/api';
import { NextRequest } from 'next/server';
import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
  forbiddenError,
  notFoundError,
  internalError,
} from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { getUpdateTimestamp } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { z } from 'zod';

const courseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  instructor_name: z.string().optional(),
  duration_hours: z.number().optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  price_usd: z.number().min(0).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  thumbnail_url: z.string().nullable().optional(),
  preview_video_url: z.string().nullable().optional(),
  is_published: z.boolean().optional(),
});

/**
 * GET /api/instructor/courses/[id]
 * Get a single course for the instructor
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const role = await getUserRole();
    if (role !== 'instructor' && role !== 'admin') {
      throw forbiddenError('Instructor or admin access required');
    }

    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    const { data: course, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments(count),
        course_modules(count),
        course_lessons(count)
      `)
      .eq('id', id)
      .single();

    if (error || !course) {
      throw notFoundError('Course');
    }

    // Verify ownership (instructors can only access their own courses)
    if (role === 'instructor' && course.created_by !== user.id) {
      throw forbiddenError('You do not have access to this course');
    }

    return successResponse({ course });
  }
);

/**
 * PUT /api/instructor/courses/[id]
 * Update a course
 */
export const PUT = createAuthenticatedRoute<{ id: string }>(
  async (request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const role = await getUserRole();
    if (role !== 'instructor' && role !== 'admin') {
      throw forbiddenError('Instructor or admin access required');
    }

    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    // Check course ownership
    const { data: existingCourse, error: fetchError } = await supabase
      .from('courses')
      .select('id, created_by')
      .eq('id', id)
      .single();

    if (fetchError || !existingCourse) {
      throw notFoundError('Course');
    }

    if (role === 'instructor' && existingCourse.created_by !== user.id) {
      throw forbiddenError('You do not have access to this course');
    }

    const body = await request.json();
    const validation = courseUpdateSchema.safeParse(body);

    if (!validation.success) {
      throw badRequestError(validation.error.errors[0]?.message || 'Invalid request body');
    }

    const updateData = validation.data;

    // Check slug uniqueness if changing slug
    if (updateData.slug) {
      const { data: slugConflict } = await supabase
        .from('courses')
        .select('id')
        .eq('slug', updateData.slug)
        .neq('id', id)
        .single();

      if (slugConflict) {
        throw badRequestError('A course with this slug already exists');
      }
    }

    // Update the course
    const { data: course, error } = await supabase
      .from('courses')
      .update({
        ...updateData,
        status: updateData.is_published !== undefined
          ? (updateData.is_published ? 'published' : 'draft')
          : undefined,
        ...getUpdateTimestamp(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating course:', error as unknown as Error);
      throw internalError('Failed to update course');
    }

    return successResponse({ course });
  }
);

/**
 * DELETE /api/instructor/courses/[id]
 * Delete a course (only if no enrollments)
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (_request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const role = await getUserRole();
    if (role !== 'instructor' && role !== 'admin') {
      throw forbiddenError('Instructor or admin access required');
    }

    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    // Check course ownership and get enrollment count
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select(`
        id,
        created_by,
        course_enrollments(count)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      throw notFoundError('Course');
    }

    if (role === 'instructor' && course.created_by !== user.id) {
      throw forbiddenError('You do not have access to this course');
    }

    // Check for enrollments
    const enrollmentCount = ((course as { course_enrollments: { count: number }[] }).course_enrollments)?.[0]?.count || 0;
    if (enrollmentCount > 0) {
      throw badRequestError('Cannot delete a course with active enrollments');
    }

    // Delete the course
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting course:', error as unknown as Error);
      throw internalError('Failed to delete course');
    }

    return successResponse({ success: true });
  }
);
