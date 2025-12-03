import {
  createAuthenticatedRoute,
  successResponse,
  validationError,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { z } from "zod";

/**
 * Reminder Settings API
 * Requirements: 12.2, 12.3, 12.4
 *
 * GET /api/tools/reminders - Get user's reminder settings
 * POST /api/tools/reminders - Update reminder settings
 * DELETE /api/tools/reminders - Disable all reminders
 */

const reminderSettingsSchema = z.object({
  enabled: z.boolean(),
  time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  method: z.enum(["push", "email", "both"]),
  days: z.array(z.number().min(0).max(6)), // 0 = Sunday, 6 = Saturday
  timezone: z.string().optional(),
});

interface ReminderSettings {
  enabled: boolean;
  time: string;
  method: "push" | "email" | "both";
  days: number[];
  timezone?: string;
}

/**
 * GET /api/tools/reminders
 * Get user's reminder settings
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", user.id)
    .single();

  const reminderSettings: ReminderSettings = (preferences?.preferences as Record<string, unknown>)?.reminder_settings as ReminderSettings || {
    enabled: false,
    time: "09:00",
    method: "push",
    days: [1, 2, 3, 4, 5], // Weekdays by default
  };

  return successResponse({ settings: reminderSettings });
});

/**
 * POST /api/tools/reminders
 * Update reminder settings
 * Requirements: 12.3
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();
  const body = await request.json();

  // Validate input
  const result = reminderSettingsSchema.safeParse(body);
  if (!result.success) {
    throw validationError("Invalid reminder settings", result.error.flatten());
  }

  const settings = result.data;

  // Get existing preferences
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", user.id)
    .single();

  const currentPrefs = (existing?.preferences as Record<string, unknown>) || {};

  // Update preferences with new reminder settings
  const updatedPrefs = {
    ...currentPrefs,
    reminder_settings: settings,
  };

  // Upsert preferences
  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      preferences: updatedPrefs,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error("Failed to save reminder settings");
  }

  return successResponse({
    success: true,
    settings,
    message: settings.enabled
      ? "Reminders enabled successfully"
      : "Reminders disabled",
  });
});

/**
 * DELETE /api/tools/reminders
 * Disable all reminders immediately
 * Requirements: 12.4
 */
export const DELETE = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer();

  // Get existing preferences
  const { data: existing } = await supabase
    .from("user_preferences")
    .select("preferences")
    .eq("user_id", user.id)
    .single();

  const currentPrefs = (existing?.preferences as Record<string, unknown>) || {};

  // Disable reminders
  const updatedPrefs = {
    ...currentPrefs,
    reminder_settings: {
      ...(currentPrefs.reminder_settings as Record<string, unknown> || {}),
      enabled: false,
    },
  };

  const { error } = await supabase
    .from("user_preferences")
    .upsert({
      user_id: user.id,
      preferences: updatedPrefs,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    throw new Error("Failed to disable reminders");
  }

  return successResponse({
    success: true,
    message: "All reminders have been disabled",
  });
});
