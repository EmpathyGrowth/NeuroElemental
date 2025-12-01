/**
 * Theme Settings API
 * GET - Get active theme or CSS variables
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { themeSettingsRepository } from "@/lib/db/theme-settings";

/**
 * GET /api/theme
 * Get active theme settings or CSS variables
 */
export const GET = createPublicRoute(async (request) => {
  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  if (format === "css") {
    const cssVars = await themeSettingsRepository.getThemeCssVariables();
    return successResponse({ cssVariables: cssVars });
  }

  const theme = await themeSettingsRepository.getActiveTheme();
  return successResponse({ theme });
});
