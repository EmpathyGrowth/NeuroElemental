/**
 * Site Announcements API
 * GET - Get active announcements for the current page
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { siteAnnouncementsRepository } from "@/lib/db/site-announcements";

/**
 * GET /api/announcements
 * Get active announcements, optionally filtered by page
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const page = url.searchParams.get("page") || "all";

  const announcements =
    await siteAnnouncementsRepository.getActiveForPage(page);

  return successResponse({ announcements });
});
