import { createAdminRoute, successResponse, badRequestError } from '@/lib/api';
import { testimonialRepository } from '@/lib/db/testimonials';
import { z } from 'zod';

const reorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    display_order: z.number().int().min(0),
  })),
});

/**
 * PATCH /api/admin/testimonials/reorder
 * Bulk update testimonial display orders
 */
export const PATCH = createAdminRoute(async (req) => {
  const body = await req.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequestError(parsed.error.errors[0]?.message || "Invalid request body");
  }

  // Update each testimonial's display order
  const updates = await Promise.all(
    parsed.data.items.map((item) =>
      testimonialRepository.updateDisplayOrder(item.id, item.display_order)
    )
  );

  return successResponse({
    success: true,
    updated: updates.length,
  });
});
