/**
 * Admin Site Content API
 * GET - Get all site content
 * POST - Create/update site content
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { siteContentRepository } from "@/lib/db/site-content";
import { z } from "zod";

const contentSchema = z.object({
  page: z.string().min(1, "Page is required").max(100),
  section: z.string().min(1, "Section is required").max(100),
  content: z.record(z.string(), z.unknown()),
  is_published: z.boolean().optional().default(true),
});

/**
 * GET /api/admin/content
 * Get all site content for admin management
 */
export const GET = createAdminRoute(async () => {
  const content = await siteContentRepository.getAll();
  const pages = await siteContentRepository.getPages();

  return successResponse({ content, pages });
});

/**
 * POST /api/admin/content
 * Create or update site content
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();

  const parsed = contentSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid content data"
    );
  }

  const content = await siteContentRepository.upsertSection(
    parsed.data.page,
    parsed.data.section,
    parsed.data.content as Record<string, unknown>,
    userId
  );

  return successResponse({ content, message: "Content saved" });
});
