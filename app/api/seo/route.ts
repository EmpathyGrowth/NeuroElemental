/**
 * SEO Settings API
 * GET - Get SEO settings for a page
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { seoSettingsRepository } from "@/lib/db/seo-settings";

/**
 * GET /api/seo
 * Get SEO settings for a page path
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const pagePath = url.searchParams.get("path");

  if (!pagePath) {
    // Return sitemap data
    const sitemap = await seoSettingsRepository.getSitemapData();
    return successResponse({ sitemap });
  }

  const seo = await seoSettingsRepository.getForPage(pagePath);
  return successResponse({ seo });
});
