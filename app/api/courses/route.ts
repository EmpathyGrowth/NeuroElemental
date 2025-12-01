/**
 * Courses API - Refactored with Factory Pattern
 * Public course listing and admin course creation
 */

import { createAdminRoute, createPublicRoute, formatPaginationMeta, getPaginationParams, getQueryParam, internalError, successResponse, validateRequest } from '@/lib/api';
import { courseRepository, getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getTimestampFields } from '@/lib/utils';
import { courseCreateSchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute(async (request, _context) => {
  const { limit, offset } = getPaginationParams(request, { limit: 12 });
  const page = Math.floor(offset / limit) + 1;

  const category = getQueryParam(request, 'category');
  const search = getQueryParam(request, 'search');
  const level = getQueryParam(request, 'level');

  const result = await courseRepository.getCourses({
    page,
    limit,
    category: category || undefined,
    search: search || undefined,
    level: level || undefined,
    is_published: true
  });

  return successResponse({
    courses: result.data,
    pagination: formatPaginationMeta(result.total, limit, offset)
  });
});

/**
 * POST /api/courses
 * Create a new course (admin only)
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  // Validate request body
  const validation = await validateRequest(request, courseCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const courseData = validation.data;
  const supabase = getSupabaseServer();

  // Check if slug is unique
  const { data: existingCourse } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseData.slug)
    .single();

  if (existingCourse) {
    throw internalError('A course with this slug already exists');
  }

  // Create the course
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      ...courseData,
      created_by: userId,
      is_published: courseData.is_published ?? false,
      ...getTimestampFields(),
    })
    .select()
    .single();

  if (error) {
    logger.error('Error creating course:', error as unknown as Error);
    throw internalError('Failed to create course');
  }

  return successResponse({ course }, 201);
});

