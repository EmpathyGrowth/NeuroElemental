/**
 * Reminder Skip Logic
 * Requirements: 12.2
 *
 * Utilities for determining when to skip reminders
 */

import { getSupabaseServer } from "@/lib/db";

interface ReminderSettings {
  enabled: boolean;
  time: string;
  method: "push" | "email" | "both";
  days: number[];
  timezone?: string;
}

/**
 * Check if user has already checked in today
 * Requirements: 12.2 - Skip reminder if already checked in
 */
export async function hasCheckedInToday(userId: string): Promise<boolean> {
  const supabase = getSupabaseServer();

  // Get today's date in user's timezone (or UTC)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: checkIns } = await supabase
    .from("logs")
    .select("id")
    .eq("user_id", userId)
    .eq("type", "check_in")
    .gte("created_at", today.toISOString())
    .lt("created_at", tomorrow.toISOString())
    .limit(1);

  return (checkIns?.length || 0) > 0;
}

/**
 * Determine if a reminder should be sent
 * Requirements: 12.2
 *
 * @param userId - The user ID
 * @param settings - The user's reminder settings
 * @returns true if reminder should be sent, false if it should be skipped
 */
export async function shouldSendReminder(
  userId: string,
  settings: ReminderSettings
): Promise<{ shouldSend: boolean; reason: string }> {
  // Check if reminders are enabled
  if (!settings.enabled) {
    return { shouldSend: false, reason: "Reminders are disabled" };
  }

  // Check if today is a reminder day
  const today = new Date().getDay(); // 0 = Sunday
  if (!settings.days.includes(today)) {
    return { shouldSend: false, reason: "Today is not a reminder day" };
  }

  // Check if user has already checked in today
  const alreadyCheckedIn = await hasCheckedInToday(userId);
  if (alreadyCheckedIn) {
    return { shouldSend: false, reason: "User has already checked in today" };
  }

  return { shouldSend: true, reason: "Reminder should be sent" };
}

/**
 * Check if current time matches reminder time
 * Used by cron job to determine which users to notify
 */
export function isReminderTime(
  reminderTime: string,
  currentTime: Date,
  toleranceMinutes: number = 5
): boolean {
  const [hours, minutes] = reminderTime.split(":").map(Number);
  const reminderDate = new Date(currentTime);
  reminderDate.setHours(hours, minutes, 0, 0);

  const diffMs = Math.abs(currentTime.getTime() - reminderDate.getTime());
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes <= toleranceMinutes;
}

/**
 * Get users who should receive reminders at the current time
 * Used by cron job
 */
export async function getUsersForReminder(): Promise<
  Array<{ userId: string; method: "push" | "email" | "both" }>
> {
  const supabase = getSupabaseServer();
  const now = new Date();
  const currentHour = now.getHours().toString().padStart(2, "0");
  const currentMinute = Math.floor(now.getMinutes() / 5) * 5; // Round to nearest 5 minutes
  const timeWindow = `${currentHour}:${currentMinute.toString().padStart(2, "0")}`;

  // Get all users with reminders enabled at this time
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("user_id, preferences");

  if (!preferences) return [];

  const usersToNotify: Array<{ userId: string; method: "push" | "email" | "both" }> = [];

  for (const pref of preferences) {
    const settings = (pref.preferences as Record<string, unknown>)?.reminder_settings as ReminderSettings;
    if (!settings?.enabled) continue;

    // Check if time matches (within 5 minute window)
    if (!isReminderTime(settings.time, now)) continue;

    // Check if today is a reminder day
    const today = now.getDay();
    if (!settings.days.includes(today)) continue;

    // Check if already checked in
    const alreadyCheckedIn = await hasCheckedInToday(pref.user_id);
    if (alreadyCheckedIn) continue;

    usersToNotify.push({
      userId: pref.user_id,
      method: settings.method,
    });
  }

  return usersToNotify;
}
