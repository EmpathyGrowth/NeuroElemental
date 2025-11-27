import { badRequestError, createAdminRoute, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { lessonUpdateSchema } from '@/lib/validation/schemas';

interface LessonRow {
  id: string;
  module_id: string | null;
  title: string;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
  created_at: string | null;
}

/**
 * GET /api/lessons/[id]
 * Get a single lesson by ID
 */
export const GET = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .select('*')
    .eq('id', params.id)
    .single() as { data: LessonRow | null; error: { message: string } | null };

  if (error || !lesson) {
    throw notFoundError('Lesson');
  }

  return successResponse({ lesson });
});

/**
 * PUT /api/lessons/[id]
 * Update a lesson
 */
export const PUT = createAdminRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, lessonUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Map video_url to content_url if provided
  const updateData: Record<string, unknown> = { ...validation.data };
  if (validation.data.video_url) {
    updateData.content_url = validation.data.video_url;
    delete updateData.video_url;
  }

  const { data: lesson, error } = await supabase
    .from('course_lessons')
    .update(updateData)
    .eq('id', params.id)
    .select()
    .single() as { data: LessonRow | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  if (!lesson) {
    throw notFoundError('Lesson');
  }

  return successResponse({ lesson });
});

/**
 * DELETE /api/lessons/[id]
 * Delete a lesson
 */
export const DELETE = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  const { error } = await supabase
    .from('course_lessons')
    .delete()
    .eq('id', params.id);

  if (error) {
    throw badRequestError(error.message);
  }

  return successResponse({ deleted: true });
});
