import { createPublicRoute, successResponse } from '@/lib/api';
import { testimonialRepository } from '@/lib/db/testimonials';

/**
 * GET /api/testimonials
 * Get published testimonials ordered by display_order
 */
export const GET = createPublicRoute(async () => {
  const testimonials = await testimonialRepository.getPublished();

  return successResponse({
    testimonials,
    count: testimonials.length,
  });
});
