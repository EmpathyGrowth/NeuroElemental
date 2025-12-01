/**
 * Admin SEO Settings API
 * GET - Get all SEO settings
 * POST - Create/update SEO settings for a page
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { seoSettingsRepository } from "@/lib/db/seo-settings";
import { z } from "zod";

const seoSchema = z.object({
  page_path: z.string().min(1).startsWith("/"),
  title: z.string().max(70).optional(),
  description: z.string().max(160).optional(),
  keywords: z.array(z.string()).optional(),
  og_title: z.string().max(70).optional(),
  og_description: z.string().max(200).optional(),
  og_image_url: z.string().url().optional(),
  og_type: z.string().optional(),
  twitter_card: z
    .enum(["summary", "summary_large_image", "app", "player"])
    .optional(),
  twitter_title: z.string().max(70).optional(),
  twitter_description: z.string().max(200).optional(),
  twitter_image_url: z.string().url().optional(),
  canonical_url: z.string().url().optional(),
  robots: z.string().optional(),
  structured_data: z.record(z.unknown()).optional(),
  custom_head_tags: z.string().optional(),
  is_noindex: z.boolean().optional(),
  is_nofollow: z.boolean().optional(),
  priority: z.number().min(0).max(1).optional(),
  change_frequency: z
    .enum(["always", "hourly", "daily", "weekly", "monthly", "yearly", "never"])
    .optional(),
});

/**
 * GET /api/admin/seo
 * Get all SEO settings
 */
export const GET = createAdminRoute(async () => {
  const settings = await seoSettingsRepository.getAll();
  return successResponse({ settings });
});

/**
 * POST /api/admin/seo
 * Create or update SEO settings for a page
 */
export const POST = createAdminRoute(async (request, _context, { userId }) => {
  const body = await request.json();

  const parsed = seoSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid SEO data"
    );
  }

  const settings = await seoSettingsRepository.upsert(parsed.data, userId);
  return successResponse({ settings, message: "SEO settings saved" });
});
