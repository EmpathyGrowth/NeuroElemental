import { badRequestError, createAdminRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { z } from 'zod';

const reorderSchema = z.object({
  modules: z.array(z.object({
    id: z.string(),
    order_index: z.number().int().min(0),
  })),
});

/**
 * PUT /api/modules/reorder
 * Reorder modules within a course
 */
export const PUT = createAdminRoute(async (request) => {
  const supabase = await getSupabaseServer();

  const body = await request.json();
  const validation = reorderSchema.safeParse(body);

  if (!validation.success) {
    throw badRequestError('Invalid request body');
  }

  const { modules } = validation.data;

  // Update each module's order_index
  const updates = modules.map(async ({ id, order_index }) => {
    const { error } = await supabase
      .from('course_modules')
      .update({ order_index })
      .eq('id', id);

    if (error) {
      throw badRequestError(`Failed to update module ${id}: ${error.message}`);
    }
  });

  await Promise.all(updates);

  return successResponse({ success: true, updated: modules.length });
});
