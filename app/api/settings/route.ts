/**
 * Public Settings API
 * GET - Get public platform settings (non-sensitive)
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { platformSettingsRepository } from "@/lib/db/platform-settings";

// Keys that are safe to expose publicly
const PUBLIC_SETTINGS = [
  "site_name",
  "site_description",
  "contact_email",
  "support_url",
  "logo_url",
  "favicon_url",
  "primary_color",
  "secondary_color",
  "enable_courses",
  "enable_events",
  "enable_assessments",
  "enable_certificates",
  "enable_gamification",
  "enable_organizations",
];

/**
 * GET /api/settings
 * Get public platform settings
 */
export const GET = createPublicRoute(async () => {
  const allSettings = await platformSettingsRepository.getAll();

  // Filter to only public settings
  const publicSettings: Record<string, unknown> = {};
  for (const key of PUBLIC_SETTINGS) {
    if (key in allSettings) {
      publicSettings[key] = allSettings[key];
    }
  }

  return successResponse({ settings: publicSettings });
});
