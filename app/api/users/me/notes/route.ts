/**
 * User Notes API
 * GET - List user's notes
 * POST - Create a new note
 *
 * NOTE: Table 'lesson_notes' is defined in migration
 * 20250127_ui_ux_improvements.sql. Regenerate Supabase types to remove ts-expect-error comments.
 */

import { createAuthenticatedRoute, badRequestError, internalError, successResponse, formatPaginationMeta, getPaginationParams, getQueryParam } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getTimestampFields } from '@/lib/utils';

interface NoteRecord {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  lesson?: {
    id: string;
    title: string;
    slug: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
        slug: string;
      };
    };
  };
}

// GET - Get user's notes
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
   
  const supabase = await getSupabaseServer();
  const { limit, offset } = getPaginationParams(request, { limit: 20 });
  const lessonId = getQueryParam(request, 'lesson_id');

  // Build the base query string
  const selectQuery = `
    *,
    lesson:lessons(
      id,
      title,
      slug,
      module:modules(
        id,
        title,
        course:courses(
          id,
          title,
          slug
        )
      )
    )
  `;


  let query = supabase
    .from('lesson_notes')
    .select(selectQuery, { count: 'exact' })
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (lessonId) {
    query = query.eq('lesson_id', lessonId);
  }

  const { data: notes, error, count } = await query
    .range(offset, offset + limit - 1) as { data: NoteRecord[] | null; error: { message: string } | null; count: number | null };

  if (error) {
    logger.error('Error fetching notes', undefined, { errorMsg: error.message });
    throw internalError('Failed to fetch notes');
  }

  return successResponse({
    notes: notes || [],
    pagination: formatPaginationMeta(count || 0, limit, offset),
  });
});

// POST - Create a new note
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
   
  const supabase = await getSupabaseServer();
  const body = await request.json();

  const { lesson_id, content } = body;

  if (!lesson_id) {
    throw badRequestError('lesson_id is required');
  }

  if (!content || content.trim().length === 0) {
    throw badRequestError('content is required');
  }

  // Verify lesson exists

  const { data: lesson, error: lessonError } = await supabase
    .from('course_lessons')
    .select('id')
    .eq('id', lesson_id)
    .single();

  if (lessonError || !lesson) {
    throw badRequestError('Lesson not found');
  }


  const { data: note, error } = await supabase
    .from('lesson_notes')
    .insert({
      user_id: user.id,
      lesson_id,
      content: content.trim(),
      ...getTimestampFields(),
    })
    .select(`
      *,
      lesson:lessons(
        id,
        title,
        slug,
        module:modules(
          id,
          title,
          course:courses(
            id,
            title,
            slug
          )
        )
      )
    `)
    .single() as { data: NoteRecord | null; error: { message: string } | null };

  if (error) {
    logger.error('Error creating note', undefined, { errorMsg: error.message });
    throw internalError('Failed to create note');
  }

  return successResponse({ note }, 201);
});
