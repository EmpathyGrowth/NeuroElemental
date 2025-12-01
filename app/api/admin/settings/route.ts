/**
 * Admin Platform Settings API Routes
 * Manage global platform configuration (admin only)
 */

import {
  badRequestError,
  createAdminRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { platformSettingsRepository } from "@/lib/db/platform-settings";
import { z } from "zod";

/**
 * GET /api/admin/settings
 * Get all platform settings (admin only)
 */
export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const settings = await platformSettingsRepository.getAll();

  return successResponse({
    settings,
    defaults: platformSettingsRepository.defaults,
  });
});

const updateSettingsSchema = z.object({
  settings: z.record(z.string(), z.unknown()),
});

/**
 * PUT /api/admin/settings
 * Update platform settings (admin only)
 */
export const PUT = createAdminRoute(async (request, _context, admin) => {
  const validation = await validateRequest(request, updateSettingsSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { settings } = validation.data;

  const result = await platformSettingsRepository.updateMany(
    settings,
    admin.userId
  );

  if (!result.success) {
    throw badRequestError(result.error || "Failed to update settings");
  }

  // Fetch updated settings
  const updatedSettings = await platformSettingsRepository.getAll();

  return successResponse({
    message: "Settings updated successfully",
    settings: updatedSettings,
  });
});
