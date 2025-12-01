/**
 * Redirect Check API
 * GET - Check if a path has a redirect configured
 * Used by middleware to handle URL redirects
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { urlRedirectsRepository } from "@/lib/db/url-redirects";

/**
 * GET /api/redirects/check
 * Check if a path should be redirected
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const path = url.searchParams.get("path");

  if (!path) {
    return successResponse({ redirect: null });
  }

  const redirect = await urlRedirectsRepository.findRedirectForPath(path);

  return successResponse({ redirect });
});
