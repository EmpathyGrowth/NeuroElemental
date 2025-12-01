/**
 * User Learning Preferences API
 * Get and update user learning style and content preferences
 *
 * Note: Learning preferences are stored in the user's profile metadata field
 * as JSON to avoid requiring a new database table.
 */

import { createAuthenticatedRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { getUpdateTimestamp } from "@/lib/utils";
import { z } from "zod";

const learningPreferencesSchema = z.object({
  preferredLearningStyle: z
    .enum(["visual", "auditory", "kinesthetic", "reading"])
    .optional(),
  contentPacing: z.enum(["slow", "normal", "fast"]).optional(),
  autoPlayVideos: z.boolean().optional(),
  defaultVideoSpeed: z.number().min(0.5).max(2).optional(),
  showCaptions: z.boolean().optional(),
  audioDescriptions: z.boolean().optional(),
  sessionDuration: z.number().min(5).max(240).optional(),
  breakReminders: z.boolean().optional(),
  breakInterval: z.number().min(5).max(120).optional(),
  dailyGoal: z.number().min(5).max(480).optional(),
  focusModeEnabled: z.boolean().optional(),
  hideDistractions: z.boolean().optional(),
  progressReminders: z.boolean().optional(),
  achievementNotifications: z.boolean().optional(),
  streakReminders: z.boolean().optional(),
});

const defaultPreferences = {
  preferredLearningStyle: "visual",
  contentPacing: "normal",
  autoPlayVideos: true,
  defaultVideoSpeed: 1,
  showCaptions: false,
  audioDescriptions: false,
  sessionDuration: 30,
  breakReminders: true,
  breakInterval: 25,
  dailyGoal: 30,
  focusModeEnabled: false,
  hideDistractions: false,
  progressReminders: true,
  achievementNotifications: true,
  streakReminders: true,
};

/**
 * GET /api/user/learning-preferences
 * Get current user's learning preferences from auth metadata
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = getSupabaseServer();

    // Get user metadata from auth.users
    const { data: userData, error } = await supabase.auth.admin.getUserById(
      user.id
    );

    if (error || !userData.user) {
      logger.error("Error fetching user metadata:", error as Error);
      return successResponse({ preferences: defaultPreferences });
    }

    const metadata = userData.user.user_metadata || {};
    const savedPreferences = metadata.learning_preferences || {};

    // Merge saved preferences with defaults
    return successResponse({
      preferences: {
        ...defaultPreferences,
        ...savedPreferences,
      },
    });
  }
);

/**
 * PUT /api/user/learning-preferences
 * Update current user's learning preferences in auth metadata
 */
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();
  const body = await request.json();

  // Validate request body
  const parseResult = learningPreferencesSchema.safeParse(body);
  if (!parseResult.success) {
    return successResponse({ error: "Invalid preferences data" }, 400);
  }

  const prefs = parseResult.data;

  try {
    // Get current metadata
    const { data: userData, error: fetchError } =
      await supabase.auth.admin.getUserById(user.id);

    if (fetchError || !userData.user) {
      logger.error("Error fetching user for update:", fetchError as Error);
      return successResponse({ error: "Failed to fetch user data" }, 500);
    }

    const currentMetadata = userData.user.user_metadata || {};

    // Update user metadata with new preferences
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...currentMetadata,
          learning_preferences: {
            ...defaultPreferences,
            ...currentMetadata.learning_preferences,
            ...prefs,
            ...getUpdateTimestamp(),
          },
        },
      }
    );

    if (updateError) {
      logger.error(
        "Error updating learning preferences:",
        updateError as Error
      );
      return successResponse({ error: "Failed to update preferences" }, 500);
    }

    // Also update the profile's updated_at for tracking
    await supabase
      .from("profiles")
      .update({ ...getUpdateTimestamp() })
      .eq("id", user.id);

    return successResponse({
      success: true,
      message: "Learning preferences updated successfully",
    });
  } catch (error) {
    logger.error("Error in learning preferences API:", error as Error);
    return successResponse({ error: "Failed to save preferences" }, 500);
  }
});
