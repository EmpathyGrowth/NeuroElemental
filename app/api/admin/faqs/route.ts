/**
 * Admin FAQs API
 * GET - Get all FAQs (including unpublished)
 * POST - Create a new FAQ
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { faqsRepository } from "@/lib/db/faqs";
import { z } from "zod";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(500),
  answer: z.string().min(1, "Answer is required").max(5000),
  category: z.string().max(50).optional().default("general"),
  display_order: z.number().optional(),
  is_published: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/faqs
 * Get all FAQs for admin management
 */
export const GET = createAdminRoute(async () => {
  const faqs = await faqsRepository.getAll();
  const count = await faqsRepository.count();

  return successResponse({ faqs, count });
});

/**
 * POST /api/admin/faqs
 * Create a new FAQ
 */
export const POST = createAdminRoute(async (request) => {
  const body = await request.json();

  const parsed = faqSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid FAQ data"
    );
  }

  const faq = await faqsRepository.create(parsed.data);

  return successResponse({ faq, message: "FAQ created" }, 201);
});
