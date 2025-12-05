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
  console.log('[API/Theme] Request received');
  try {
    const url = new URL(request.url);
    const format = url.searchParams.get("format");

    if (format === "css") {
      console.log('[API/Theme] Fetching CSS variables');
      const cssVars = await themeSettingsRepository.getThemeCssVariables();
      console.log('[API/Theme] CSS variables fetched:', !!cssVars);
      return successResponse({ cssVariables: cssVars });
    }

    console.log('[API/Theme] Fetching active theme');
    const theme = await themeSettingsRepository.getActiveTheme();
    console.log('[API/Theme] Active theme fetched:', !!theme);
    return successResponse({ theme });
  } catch (error) {
    console.error('[API/Theme] CRITICAL ERROR:', error);
    throw error;
  }
});
