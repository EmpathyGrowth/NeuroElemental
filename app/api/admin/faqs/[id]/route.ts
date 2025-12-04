/**
 * Admin FAQ Item API
 * GET - Get FAQ by ID
 * PATCH - Update FAQ
 * DELETE - Delete FAQ
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { faqsRepository } from "@/lib/db/faqs";
import { z } from "zod";

const faqUpdateSchema = z.object({
  question: z.string().min(1).max(500).optional(),
  answer: z.string().min(1).max(5000).optional(),
  category: z.string().max(50).optional(),
  display_order: z.number().optional(),
  is_published: z.boolean().optional(),
});

/**
 * GET /api/admin/faqs/[id]
 * Get FAQ by ID
 */
export const GET = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const faq = await faqsRepository.findById(id);

    return successResponse({ faq });
  }
);

/**
 * PATCH /api/admin/faqs/[id]
 * Update FAQ
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = faqUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid FAQ data"
      );
    }

    const faq = await faqsRepository.update(id, parsed.data);

    return successResponse({ faq, message: "FAQ updated" });
  }
);

/**
 * DELETE /api/admin/faqs/[id]
 * Delete FAQ
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    await faqsRepository.delete(id);

    return successResponse({ message: "FAQ deleted" });
  }
);
