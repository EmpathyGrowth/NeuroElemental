/**
 * Courses API - Refactored with Factory Pattern
 * Public course listing and admin course creation
 */

import { createPublicRoute, createAdminRoute, formatPaginationMeta, getPaginationParams, getQueryParam, successResponse, validateRequest, internalError } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { courseCreateSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logging';
import { getTimestampFields } from '@/lib/utils';

export const GET = createPublicRoute(async (request, _context) => {
  const supabase = getSupabaseServer();

  const { limit, offset } = getPaginationParams(request, { limit: 12 });
  const category = getQueryParam(request, 'category');
  const search = getQueryParam(request, 'search');
  const level = getQueryParam(request, 'level');

  let query = supabase
    .from('courses')
    .select(`
      *,
      instructor:profiles!courses_instructor_id_fkey(
        id,
        full_name,
        avatar_url
      ),
      enrollments(count)
    `, { count: 'exact' })
    .eq('status', 'published');

  // Apply filters
  if (category) {
    query = query.eq('category', category);
  }

  if (level) {
    query = query.eq('level', level);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  query = query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: courses, error, count } = await query;

  if (error) {
    throw error;
  }

  return successResponse({
    courses: courses || [],
    pagination: formatPaginationMeta(count || 0, limit, offset)
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
      instructor_id: userId,
      status: courseData.is_published ? 'published' : 'draft',
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

