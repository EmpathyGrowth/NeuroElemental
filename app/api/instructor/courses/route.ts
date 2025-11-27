/**
 * Instructor Courses API
 * Create and list courses for the authenticated instructor
 */

import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
  forbiddenError,
  internalError,
} from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { getUserRole } from '@/lib/middleware';
import { getTimestampFields } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { z } from 'zod';

const courseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
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
 * GET /api/instructor/courses
 * List all courses for the authenticated instructor
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const role = await getUserRole();
  if (role !== 'instructor' && role !== 'admin') {
    throw forbiddenError('Instructor or admin access required');
  }

  const supabase = await getSupabaseServer();

  const { data: courses, error } = await supabase
    .from('courses')
    .select(`
      id,
      title,
      slug,
      description,
      status,
      price_usd,
      thumbnail_url,
      created_at,
      updated_at,
      course_enrollments(count),
      course_modules(count),
      course_lessons(count)
    `)
    .eq('instructor_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    logger.error('Error fetching instructor courses:', error as unknown as Error);
    throw internalError('Failed to fetch courses');
  }

  return successResponse({
    courses: courses || [],
  });
});

/**
 * POST /api/instructor/courses
 * Create a new course for the instructor
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const role = await getUserRole();
  if (role !== 'instructor' && role !== 'admin') {
    throw forbiddenError('Instructor or admin access required');
  }

  const body = await request.json();
  const validation = courseCreateSchema.safeParse(body);

  if (!validation.success) {
    throw badRequestError(validation.error.errors[0]?.message || 'Invalid request body');
  }

  const courseData = validation.data;
  const supabase = await getSupabaseServer();

  // Check if slug is unique
  const { data: existingCourse } = await supabase
    .from('courses')
    .select('id')
    .eq('slug', courseData.slug)
    .single();

  if (existingCourse) {
    throw badRequestError('A course with this slug already exists');
  }

  // Create the course
  const { data: course, error } = await supabase
    .from('courses')
    .insert({
      title: courseData.title,
      slug: courseData.slug,
      subtitle: courseData.subtitle,
      description: courseData.description,
      long_description: courseData.long_description,
      instructor_name: courseData.instructor_name,
      duration_hours: courseData.duration_hours,
      difficulty_level: courseData.difficulty_level,
      price_usd: courseData.price_usd,
      category: courseData.category,
      tags: courseData.tags,
      thumbnail_url: courseData.thumbnail_url,
      preview_video_url: courseData.preview_video_url,
      instructor_id: user.id,
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
