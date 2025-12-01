/**
 * Navigation API
 * GET - Get navigation menu by location
 */

import { badRequestError, createPublicRoute, successResponse } from "@/lib/api";
import { MenuLocation, navigationRepository } from "@/lib/db/navigation";

const VALID_LOCATIONS = ["header", "footer", "sidebar", "mobile"];

/**
 * GET /api/navigation
 * Get navigation menu by location
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const location = url.searchParams.get("location") as MenuLocation;
  const userRole = url.searchParams.get("role") || undefined;

  if (!location || !VALID_LOCATIONS.includes(location)) {
    throw badRequestError(
      "Valid location required: header, footer, sidebar, mobile"
    );
  }

  const menu = await navigationRepository.getMenuByLocation(location, userRole);

  return successResponse({ menu });
});
