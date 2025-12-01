/**
 * Site Content API
 * GET - Get content for a page or section
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { siteContentRepository } from "@/lib/db/site-content";

/**
 * GET /api/content
 * Get site content for a page or specific section
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page");
  const section = url.searchParams.get("section");

  if (!page) {
    // Return all pages list
    const pages = await siteContentRepository.getPages();
    return successResponse({ pages });
  }

  if (section) {
    // Get specific section
    const content = await siteContentRepository.getSection(page, section);
    return successResponse({ content });
  }

  // Get all sections for page
  const sections = await siteContentRepository.getPageSections(page);
  return successResponse({ sections });
});
