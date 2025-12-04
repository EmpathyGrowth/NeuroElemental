import { createAdminRoute, successResponse, badRequestError } from '@/lib/api';
import { testimonialRepository } from '@/lib/db/testimonials';
import { z } from 'zod';

const testimonialSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().nullable().optional(),
  quote: z.string().min(1, "Quote is required"),
  element: z.enum(["Electric", "Fire", "Water", "Earth", "Air", "Metal"]).nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  is_published: z.boolean().optional().default(false),
  is_verified: z.boolean().optional().default(false),
  display_order: z.number().int().min(0).optional().default(0),
});

// Transform schema data to repository format (quote -> content)
function toRepositoryFormat(data: z.infer<typeof testimonialSchema>) {
  const { quote, is_verified, ...rest } = data;
  return { ...rest, content: quote };
}

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

/**
 * POST /api/admin/testimonials
 * Create a new testimonial
 */
export const POST = createAdminRoute(async (req) => {
  const body = await req.json();
  const parsed = testimonialSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequestError(parsed.error.issues[0]?.message || "Invalid request body");
  }

  const testimonial = await testimonialRepository.create(toRepositoryFormat(parsed.data));

  return successResponse({ testimonial }, 201);
});
