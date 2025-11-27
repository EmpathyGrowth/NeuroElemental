import { badRequestError, createAdminRoute, notFoundError, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { moduleUpdateSchema } from '@/lib/validation/schemas';

interface ModuleRow {
  id: string;
  course_id: string | null;
  title: string;
  description: string | null;
  order_index: number;
  created_at: string | null;
}

/**
 * GET /api/modules/[id]
 * Get a single module by ID
 */
export const GET = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  const { data: module, error } = await supabase
    .from('course_modules')
    .select('*')
    .eq('id', params.id)
    .single() as { data: ModuleRow | null; error: { message: string } | null };

  if (error || !module) {
    throw notFoundError('Module');
  }

  return successResponse({ module });
});

/**
 * PUT /api/modules/[id]
 * Update a module
 */
export const PUT = createAdminRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // Validate request body
  const validation = await validateRequest(request, moduleUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { data: module, error } = await supabase
    .from('course_modules')
    .update(validation.data)
    .eq('id', params.id)
    .select()
    .single() as { data: ModuleRow | null; error: { message: string } | null };

  if (error) {
    throw badRequestError(error.message);
  }

  if (!module) {
    throw notFoundError('Module');
  }

  return successResponse({ module });
});

/**
 * DELETE /api/modules/[id]
 * Delete a module and all its lessons
 */
export const DELETE = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;
  const supabase = await getSupabaseServer();

  // First delete all lessons in this module
  const { error: lessonsError } = await supabase
    .from('course_lessons')
    .delete()
    .eq('module_id', params.id);

  if (lessonsError) {
    throw badRequestError(lessonsError.message);
  }

  // Then delete the module
  const { error } = await supabase
    .from('course_modules')
    .delete()
    .eq('id', params.id);

  if (error) {
    throw badRequestError(error.message);
  }

  return successResponse({ deleted: true });
});
