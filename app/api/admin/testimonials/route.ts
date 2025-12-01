import { createAdminRoute, successResponse } from '@/lib/api';
import { testimonialRepository } from '@/lib/db/testimonials';

/**
 * GET /api/admin/testimonials
 * Get all testimonials (admin only)
 */
export const GET = createAdminRoute(async () => {
  const testimonials = await testimonialRepository.getAllOrdered();

  return successResponse({
    testimonials,
    count: testimonials.length,
  });
});
