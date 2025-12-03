/**
 * Property-Based Tests for Reminder Skip Logic
 *
 * Feature: tools-completion-and-platform-consolidation
 * Property 21: Reminder Skip Logic
 * Validates: Requirements 12.2
 *
 * These tests verify that reminders are correctly skipped
 * when users have already completed their daily check-in.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Types for testing
interface ReminderSettings {
  enabled: boolean;
  time: string;
  method: "push" | "email" | "both";
  days: number[];
}

interface CheckInRecord {
  userId: string;
  date: Date;
}

/**
 * Simulates checking if user has checked in today
 */
function hasCheckedInToday(
  userId: string,
  checkIns: CheckInRecord[],
  today: Date
): boolean {
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  return checkIns.some(
    (c) =>
      c.userId === userId &&
      c.date >= todayStart &&
      c.date < todayEnd
  );
}

/**
 * Simulates the shouldSendReminder logic
 */
function shouldSendReminder(
  userId: string,
  settings: ReminderSettings,
  checkIns: CheckInRecord[],
  currentDate: Date
): { shouldSend: boolean; reason: string } {
  // Check if reminders are enabled
  if (!settings.enabled) {
    return { shouldSend: false, reason: "Reminders are disabled" };
  }

  // Check if today is a reminder day
  const today = currentDate.getDay();
  if (!settings.days.includes(today)) {
    return { shouldSend: false, reason: "Today is not a reminder day" };
  }

  // Check if user has already checked in today
  const alreadyCheckedIn = hasCheckedInToday(userId, checkIns, currentDate);
  if (alreadyCheckedIn) {
    return { shouldSend: false, reason: "User has already checked in today" };
  }

  return { shouldSend: true, reason: "Reminder should be sent" };
}

/**
 * Generates valid reminder settings
 */
const reminderSettingsArbitrary = fc.record({
  enabled: fc.boolean(),
  time: fc.tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 })
  ).map(([h, m]) => `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`),
  method: fc.constantFrom("push" as const, "email" as const, "both" as const),
  days: fc.array(fc.integer({ min: 0, max: 6 }), { minLength: 0, maxLength: 7 })
    .map((days) => [...new Set(days)]), // Remove duplicates
});

/**
 * Generates a check-in record
 */
const checkInArbitrary = (userId: string, date: Date) =>
  fc.record({
    userId: fc.constant(userId),
    date: fc.constant(date),
  });

describe("Reminder Skip Logic Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 21: Reminder Skip Logic
   * Validates: Requirements 12.2
   *
   * For any user with reminders enabled who has already completed today's check-in,
   * no reminder should be sent for that day.
   */
  it("Property 21: Reminder skipped when user has already checked in today", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(), // userId
        reminderSettingsArbitrary,
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (userId, settings, currentDate) => {
          // Create a check-in for today
          const todayCheckIn: CheckInRecord = {
            userId,
            date: new Date(currentDate),
          };

          // Ensure settings would normally send (enabled + correct day)
          const settingsWithTodayEnabled = {
            ...settings,
            enabled: true,
            days: [currentDate.getDay()],
          };

          const result = shouldSendReminder(
            userId,
            settingsWithTodayEnabled,
            [todayCheckIn],
            currentDate
          );

          // Property: Should NOT send reminder when already checked in
          expect(result.shouldSend).toBe(false);
          expect(result.reason).toBe("User has already checked in today");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 21a: Reminder sent when user has NOT checked in today", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(),
        reminderSettingsArbitrary,
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (userId, settings, currentDate) => {
          // Ensure settings would normally send (enabled + correct day)
          const settingsWithTodayEnabled = {
            ...settings,
            enabled: true,
            days: [currentDate.getDay()],
          };

          // No check-ins
          const result = shouldSendReminder(
            userId,
            settingsWithTodayEnabled,
            [],
            currentDate
          );

          // Property: Should send reminder when not checked in
          expect(result.shouldSend).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 21b: Reminder skipped when reminders are disabled", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(),
        reminderSettingsArbitrary,
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (userId, settings, currentDate) => {
          const disabledSettings = {
            ...settings,
            enabled: false,
          };

          const result = shouldSendReminder(
            userId,
            disabledSettings,
            [],
            currentDate
          );

          // Property: Should NOT send when disabled
          expect(result.shouldSend).toBe(false);
          expect(result.reason).toBe("Reminders are disabled");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 21c: Reminder skipped on non-reminder days", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (userId, currentDate) => {
          const today = currentDate.getDay();
          // Create settings that exclude today
          const excludedDays = [0, 1, 2, 3, 4, 5, 6].filter((d) => d !== today);

          const settings: ReminderSettings = {
            enabled: true,
            time: "09:00",
            method: "push",
            days: excludedDays,
          };

          const result = shouldSendReminder(userId, settings, [], currentDate);

          // Property: Should NOT send on non-reminder days
          expect(result.shouldSend).toBe(false);
          expect(result.reason).toBe("Today is not a reminder day");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 21d: Yesterday's check-in does not skip today's reminder", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(),
        fc.date({ min: new Date("2020-01-02"), max: new Date("2030-12-31") }),
        (userId, currentDate) => {
          // Create a check-in for yesterday
          const yesterday = new Date(currentDate);
          yesterday.setDate(yesterday.getDate() - 1);

          const yesterdayCheckIn: CheckInRecord = {
            userId,
            date: yesterday,
          };

          const settings: ReminderSettings = {
            enabled: true,
            time: "09:00",
            method: "push",
            days: [currentDate.getDay()],
          };

          const result = shouldSendReminder(
            userId,
            settings,
            [yesterdayCheckIn],
            currentDate
          );

          // Property: Yesterday's check-in should NOT skip today's reminder
          expect(result.shouldSend).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 21e: Other user's check-in does not affect reminder", async () => {
    await fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.date({ min: new Date("2020-01-01"), max: new Date("2030-12-31") }),
        (userId, otherUserId, currentDate) => {
          // Skip if UUIDs happen to be the same
          if (userId === otherUserId) return true;

          // Create a check-in for another user today
          const otherUserCheckIn: CheckInRecord = {
            userId: otherUserId,
            date: new Date(currentDate),
          };

          const settings: ReminderSettings = {
            enabled: true,
            time: "09:00",
            method: "push",
            days: [currentDate.getDay()],
          };

          const result = shouldSendReminder(
            userId,
            settings,
            [otherUserCheckIn],
            currentDate
          );

          // Property: Other user's check-in should NOT affect this user's reminder
          expect(result.shouldSend).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Reminder Time Matching Properties", () => {
  /**
   * Tests for time matching logic
   */
  function isReminderTime(
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

  it("Property: Exact time match returns true", () => {
    const reminderTime = "09:00";
    const currentTime = new Date("2024-01-15T09:00:00");

    expect(isReminderTime(reminderTime, currentTime)).toBe(true);
  });

  it("Property: Time within tolerance returns true", () => {
    const reminderTime = "09:00";
    const currentTime = new Date("2024-01-15T09:03:00");

    expect(isReminderTime(reminderTime, currentTime, 5)).toBe(true);
  });

  it("Property: Time outside tolerance returns false", () => {
    const reminderTime = "09:00";
    const currentTime = new Date("2024-01-15T09:10:00");

    expect(isReminderTime(reminderTime, currentTime, 5)).toBe(false);
  });
});
