import { badRequestError, createAdminRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import { z } from 'zod';

const reorderSchema = z.object({
  lessons: z.array(z.object({
    id: z.string(),
    order_index: z.number().int().min(0),
    module_id: z.string().optional(), // Allow moving lessons between modules
  })),
});

/**
 * PUT /api/lessons/reorder
 * Reorder lessons within a module or move between modules
 */
export const PUT = createAdminRoute(async (request) => {
  const supabase = await getSupabaseServer();

  const body = await request.json();
  const validation = reorderSchema.safeParse(body);

  if (!validation.success) {
    throw badRequestError('Invalid request body');
  }

  const { lessons } = validation.data;

  // Update each lesson's order_index and optionally module_id
  const updates = lessons.map(async ({ id, order_index, module_id }) => {
    const updateData: { order_index: number; module_id?: string } = { order_index };
    if (module_id) {
      updateData.module_id = module_id;
    }

    const { error } = await (supabase as any)
      .from('course_lessons')
      .update(updateData)
      .eq('id', id);

    if (error) {
      throw badRequestError(`Failed to update lesson ${id}: ${error.message}`);
    }
  });

  await Promise.all(updates);

  return successResponse({ success: true, updated: lessons.length });
});
