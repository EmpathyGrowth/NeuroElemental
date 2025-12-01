/**
 * Enhanced Notification Preferences API
 * Manages granular notification settings for users
 * Uses user_preferences table instead of auth.admin API
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getUpdateTimestamp } from "@/lib/utils";
import { z } from "zod";

export interface NotificationPreferences {
  // Email notifications
  email: {
    marketing: boolean;
    product_updates: boolean;
    course_updates: boolean;
    enrollment_confirmations: boolean;
    certificate_issued: boolean;
    event_reminders: boolean;
    weekly_digest: boolean;
    achievement_unlocked: boolean;
  };
  // Push notifications
  push: {
    enabled: boolean;
    course_updates: boolean;
    new_content: boolean;
    discussion_replies: boolean;
    direct_messages: boolean;
    event_reminders: boolean;
  };
  // In-app notifications
  in_app: {
    enabled: boolean;
    system_announcements: boolean;
    course_updates: boolean;
    discussion_activity: boolean;
    achievement_unlocked: boolean;
  };
  // Digest settings
  digest: {
    frequency: "daily" | "weekly" | "monthly" | "never";
    day_of_week: number; // 0-6, Sunday-Saturday
    time_of_day: string; // HH:mm format
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  email: {
    marketing: false,
    product_updates: true,
    course_updates: true,
    enrollment_confirmations: true,
    certificate_issued: true,
    event_reminders: true,
    weekly_digest: true,
    achievement_unlocked: true,
  },
  push: {
    enabled: true,
    course_updates: true,
    new_content: true,
    discussion_replies: true,
    direct_messages: true,
    event_reminders: true,
  },
  in_app: {
    enabled: true,
    system_announcements: true,
    course_updates: true,
    discussion_activity: true,
    achievement_unlocked: true,
  },
  digest: {
    frequency: "weekly",
    day_of_week: 1, // Monday
    time_of_day: "09:00",
  },
};

const preferencesSchema = z.object({
  email: z
    .object({
      marketing: z.boolean().optional(),
      product_updates: z.boolean().optional(),
      course_updates: z.boolean().optional(),
      enrollment_confirmations: z.boolean().optional(),
      certificate_issued: z.boolean().optional(),
      event_reminders: z.boolean().optional(),
      weekly_digest: z.boolean().optional(),
      achievement_unlocked: z.boolean().optional(),
    })
    .optional(),
  push: z
    .object({
      enabled: z.boolean().optional(),
      course_updates: z.boolean().optional(),
      new_content: z.boolean().optional(),
      discussion_replies: z.boolean().optional(),
      direct_messages: z.boolean().optional(),
      event_reminders: z.boolean().optional(),
    })
    .optional(),
  in_app: z
    .object({
      enabled: z.boolean().optional(),
      system_announcements: z.boolean().optional(),
      course_updates: z.boolean().optional(),
      discussion_activity: z.boolean().optional(),
      achievement_unlocked: z.boolean().optional(),
    })
    .optional(),
  digest: z
    .object({
      frequency: z.enum(["daily", "weekly", "monthly", "never"]).optional(),
      day_of_week: z.number().min(0).max(6).optional(),
      time_of_day: z
        .string()
        .regex(/^\d{2}:\d{2}$/)
        .optional(),
    })
    .optional(),
});

// Type for stored preferences (table may not be in generated types yet)
interface StoredUserPrefs {
  email_notifications?: {
    marketing?: boolean;
    updates?: boolean;
    reminders?: boolean;
  };
  metadata?: { notification_preferences?: Partial<NotificationPreferences> };
}

/**
 * GET /api/user/notification-preferences
 * Get user's notification preferences from user_preferences table
 */
export const GET = createAuthenticatedRoute(
  async (_request, _context, user) => {
    const supabase = getSupabaseServer();

    // Get from user_preferences table (table exists but may not be in types)

    const { data: userPrefs } = (await (supabase as any)
      .from("user_preferences")
      .select("email_notifications, metadata")
      .eq("user_id", user.id)
      .single()) as { data: StoredUserPrefs | null };

    // Get stored preferences or use defaults
    const storedNotificationPrefs =
      userPrefs?.metadata?.notification_preferences || {};
    const storedEmailPrefs = userPrefs?.email_notifications || {};

    const preferences: NotificationPreferences = {
      email: {
        ...DEFAULT_PREFERENCES.email,
        // Map existing email_notifications fields
        marketing:
          storedEmailPrefs.marketing ?? DEFAULT_PREFERENCES.email.marketing,
        course_updates:
          storedEmailPrefs.updates ?? DEFAULT_PREFERENCES.email.course_updates,
        event_reminders:
          storedEmailPrefs.reminders ??
          DEFAULT_PREFERENCES.email.event_reminders,
        ...storedNotificationPrefs.email,
      },
      push: {
        ...DEFAULT_PREFERENCES.push,
        ...storedNotificationPrefs.push,
      },
      in_app: {
        ...DEFAULT_PREFERENCES.in_app,
        ...storedNotificationPrefs.in_app,
      },
      digest: {
        ...DEFAULT_PREFERENCES.digest,
        ...storedNotificationPrefs.digest,
      },
    };

    return successResponse({ preferences });
  }
);

/**
 * PUT /api/user/notification-preferences
 * Update user's notification preferences in user_preferences table
 */
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();
  const body = await request.json();

  const parsed = preferencesSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError("Invalid preferences");
  }

  // Get current preferences (table exists but may not be in types)

  const { data: existing } = (await (supabase as any)
    .from("user_preferences")
    .select("email_notifications, metadata")
    .eq("user_id", user.id)
    .single()) as { data: StoredUserPrefs | null };

  const currentMetadata = existing?.metadata || {};
  const currentNotificationPrefs =
    currentMetadata.notification_preferences || {};

  // Deep merge preferences
  const updatedPreferences: NotificationPreferences = {
    email: {
      ...DEFAULT_PREFERENCES.email,
      ...currentNotificationPrefs.email,
      ...parsed.data.email,
    },
    push: {
      ...DEFAULT_PREFERENCES.push,
      ...currentNotificationPrefs.push,
      ...parsed.data.push,
    },
    in_app: {
      ...DEFAULT_PREFERENCES.in_app,
      ...currentNotificationPrefs.in_app,
      ...parsed.data.in_app,
    },
    digest: {
      ...DEFAULT_PREFERENCES.digest,
      ...currentNotificationPrefs.digest,
      ...parsed.data.digest,
    },
  };

  // Also update legacy email_notifications for compatibility
  const legacyEmailPrefs = {
    marketing: updatedPreferences.email.marketing,
    updates: updatedPreferences.email.course_updates,
    reminders: updatedPreferences.email.event_reminders,
  };

  // Upsert user_preferences

  const { error } = await (supabase as any).from("user_preferences").upsert(
    {
      user_id: user.id,
      email_notifications: legacyEmailPrefs,
      metadata: {
        ...currentMetadata,
        notification_preferences: updatedPreferences,
      },
      ...getUpdateTimestamp(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    throw badRequestError("Failed to update preferences");
  }

  return successResponse({
    message: "Preferences updated",
    preferences: updatedPreferences,
  });
});
