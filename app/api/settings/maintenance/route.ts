/**
 * Maintenance Mode Check API
 * GET - Check if maintenance mode is enabled
 * Used by middleware to redirect to maintenance page
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { platformSettingsRepository } from "@/lib/db/platform-settings";

/**
 * GET /api/settings/maintenance
 * Check if maintenance mode is enabled
 */
export const GET = createPublicRoute(async () => {
  const maintenanceMode = await platformSettingsRepository.isMaintenanceMode();

  return successResponse({
    maintenance_mode: maintenanceMode,
  });
});
