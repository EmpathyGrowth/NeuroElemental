/**
 * Admin SEO Settings API - By ID
 * GET - Get SEO settings by ID
 * PATCH - Update SEO settings
 * DELETE - Delete SEO settings
 */

import {
  badRequestError,
  createAdminRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { seoSettingsRepository } from "@/lib/db/seo-settings";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  keywords: z.array(z.string()).optional(),
  og_title: z.string().max(200).optional(),
  og_description: z.string().max(500).optional(),
  og_image: z.string().optional(),
  twitter_card: z.string().max(50).optional(),
  canonical_url: z.string().optional(),
  robots: z.string().max(100).optional(),
  structured_data: z.record(z.unknown()).optional(),
  is_noindex: z.boolean().optional(),
});

/**
 * GET /api/admin/seo/[id]
 * Get SEO settings by ID
 */
export const GET = createAdminRoute(async (_request, context: RouteContext) => {
  const { id } = await context.params;

  const settings = await seoSettingsRepository.findById(id);
  if (!settings) {
    throw notFoundError("SEO settings");
  }

  return successResponse({ settings });
});

/**
 * PATCH /api/admin/seo/[id]
 * Update SEO settings
 */
export const PATCH = createAdminRoute(
  async (request, context: RouteContext) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid SEO data"
      );
    }

    const existing = await seoSettingsRepository.findById(id);
    if (!existing) {
      throw notFoundError("SEO settings");
    }

    const settings = await seoSettingsRepository.update(id, parsed.data);

    return successResponse({ settings, message: "SEO settings updated" });
  }
);

/**
 * DELETE /api/admin/seo/[id]
 * Delete SEO settings
 */
export const DELETE = createAdminRoute(
  async (_request, context: RouteContext) => {
    const { id } = await context.params;

    const existing = await seoSettingsRepository.findById(id);
    if (!existing) {
      throw notFoundError("SEO settings");
    }

    await seoSettingsRepository.delete(id);

    return successResponse({ message: "SEO settings deleted" });
  }
);
