/**
 * Admin Platform Settings by Category API
 * Get/update settings for a specific category
 */

import {
  badRequestError,
  createAdminRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { platformSettingsRepository } from "@/lib/db/platform-settings";
import { z } from "zod";

const validCategories = [
  "general",
  "email",
  "payment",
  "security",
  "branding",
  "features",
] as const;
type Category = (typeof validCategories)[number];

/**
 * GET /api/admin/settings/[category]
 * Get settings for a specific category
 */
export const GET = createAdminRoute<{ category: string }>(
  async (_request, context, _admin) => {
    const { category } = await context.params;

    if (!validCategories.includes(category as Category)) {
      throw badRequestError(`Invalid category: ${category}`);
    }

    const settings = await platformSettingsRepository.getByCategory(
      category as Category
    );

    return successResponse({ category, settings });
  }
);

const updateCategorySchema = z.object({
  settings: z.record(z.string(), z.unknown()),
});

/**
 * PUT /api/admin/settings/[category]
 * Update settings for a specific category
 */
export const PUT = createAdminRoute<{ category: string }>(
  async (request, context, admin) => {
    const { category } = await context.params;

    if (!validCategories.includes(category as Category)) {
      throw badRequestError(`Invalid category: ${category}`);
    }

    const validation = await validateRequest(request, updateCategorySchema);
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

    const updatedSettings = await platformSettingsRepository.getByCategory(
      category as Category
    );

    return successResponse({
      message: "Settings updated successfully",
      category,
      settings: updatedSettings,
    });
  }
);
