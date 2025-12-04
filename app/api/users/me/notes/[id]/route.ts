/**
 * Individual Note API
 * GET - Get a specific note
 * PUT - Update a note
 * DELETE - Delete a note
 *
 * NOTE: Table 'lesson_notes' is defined in migration
 * 20250127_ui_ux_improvements.sql. Regenerate Supabase types to remove ts-expect-error comments.
 */

import { createAuthenticatedRoute, notFoundError, badRequestError, internalError, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { logger } from '@/lib/logging';
import { getUpdateTimestamp } from '@/lib/utils';

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

// GET - Get a specific note
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
   
  const supabase = await getSupabaseServer();


  const { data: note, error } = await supabase
    .from('lesson_notes')
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
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: NoteRecord | null; error: { message: string } | null };

  if (error || !note) {
    throw notFoundError('Note');
  }

  return successResponse({ note });
});

// PUT - Update a note
export const PUT = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;
   
  const supabase = await getSupabaseServer();
  const body = await request.json();

  const { content } = body;

  if (!content || content.trim().length === 0) {
    throw badRequestError('content is required');
  }

  // Verify note exists and belongs to user

  const { data: existing } = await supabase
    .from('lesson_notes')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single() as { data: { id: string } | null; error: { message: string } | null };

  if (!existing) {
    throw notFoundError('Note');
  }


  const { data: note, error } = await (supabase as any)
    .from('lesson_notes')
    .update({
      content: content.trim(),
      ...getUpdateTimestamp(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
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
    logger.error('Error updating note', undefined, { errorMsg: error.message });
    throw internalError('Failed to update note');
  }

  return successResponse({ note });
});

// DELETE - Delete a note
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params;
   
  const supabase = await getSupabaseServer();


  const { error } = await supabase
    .from('lesson_notes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) as { error: { message: string } | null };

  if (error) {
    logger.error('Error deleting note', undefined, { errorMsg: error.message });
    throw internalError('Failed to delete note');
  }

  return successResponse({ deleted: true });
});
