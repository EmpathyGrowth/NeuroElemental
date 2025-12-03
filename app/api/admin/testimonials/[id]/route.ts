import { createAdminRoute, successResponse, badRequestError, notFoundError } from '@/lib/api';
import { testimonialRepository } from '@/lib/db/testimonials';
import { z } from 'zod';

const testimonialUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  role: z.string().nullable().optional(),
  quote: z.string().min(1, "Quote is required").optional(),
  element: z.enum(["Electric", "Fire", "Water", "Earth", "Air", "Metal"]).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  is_published: z.boolean().optional(),
  is_verified: z.boolean().optional(),
  display_order: z.number().int().min(0).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/testimonials/[id]
 * Get a single testimonial by ID
 */
export const GET = createAdminRoute(async (_req, context: RouteParams) => {
  const { id } = await context.params;

  const testimonial = await testimonialRepository.findById(id);

  if (!testimonial) {
    throw notFoundError("Testimonial not found");
  }

  return successResponse({ testimonial });
});

/**
 * PATCH /api/admin/testimonials/[id]
 * Update a testimonial
 */
export const PATCH = createAdminRoute(async (req, context: RouteParams) => {
  const { id } = await context.params;
  const body = await req.json();

  const parsed = testimonialUpdateSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(parsed.error.errors[0]?.message || "Invalid request body");
  }

  const existing = await testimonialRepository.findById(id);
  if (!existing) {
    throw notFoundError("Testimonial not found");
  }

  const testimonial = await testimonialRepository.update(id, parsed.data);

  return successResponse({ testimonial });
});

/**
 * DELETE /api/admin/testimonials/[id]
 * Delete a testimonial
 */
export const DELETE = createAdminRoute(async (_req, context: RouteParams) => {
  const { id } = await context.params;

  const existing = await testimonialRepository.findById(id);
  if (!existing) {
    throw notFoundError("Testimonial not found");
  }

  await testimonialRepository.delete(id);

  return successResponse({ success: true });
});
