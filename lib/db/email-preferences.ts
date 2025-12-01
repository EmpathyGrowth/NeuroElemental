/**
 * Email Preferences Repository
 * Manages user email notification preferences
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for preference management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { getTimestampFields, getUpdateTimestamp } from "@/lib/utils";
import { BaseRepository } from "./base-repository";

type EmailPreferences =
  Database["public"]["Tables"]["email_preferences"]["Row"];
type _EmailPreferencesInsert =
  Database["public"]["Tables"]["email_preferences"]["Insert"];
type EmailPreferencesUpdate =
  Database["public"]["Tables"]["email_preferences"]["Update"];

/**
 * Default email preferences
 */
export const DEFAULT_EMAIL_PREFERENCES = {
  course_updates: true,
  session_reminders: true,
  marketing: false,
  payment_receipts: true,
};

/**
 * Email Preferences Repository
 * Extends BaseRepository with email preference-specific operations
 */
export class EmailPreferencesRepository extends BaseRepository<"email_preferences"> {
  constructor() {
    super("email_preferences");
  }

  /**
   * Get user's email preferences or return defaults
   *
   * @param userId - User ID
   * @returns Email preferences
   */
  async getByUser(userId: string): Promise<Partial<EmailPreferences>> {
    const { data, error } = await this.supabase
      .from("email_preferences")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) {
      // Return defaults if no preferences exist
      return DEFAULT_EMAIL_PREFERENCES;
    }

    return {
      course_updates:
        data.course_updates ?? DEFAULT_EMAIL_PREFERENCES.course_updates,
      session_reminders:
        data.session_reminders ?? DEFAULT_EMAIL_PREFERENCES.session_reminders,
      marketing: data.marketing ?? DEFAULT_EMAIL_PREFERENCES.marketing,
      payment_receipts:
        data.payment_receipts ?? DEFAULT_EMAIL_PREFERENCES.payment_receipts,
    };
  }

  /**
   * Update or create user's email preferences (upsert)
   *
   * @param userId - User ID
   * @param preferences - Preference updates
   * @returns Updated preferences
   */
  async upsertPreferences(
    userId: string,
    preferences: Partial<Omit<EmailPreferencesUpdate, "user_id">>
  ): Promise<EmailPreferences> {
    // Check if preferences exist
    const existing = await this.findOne({ user_id: userId });

    if (existing) {
      // Update existing
      const { data, error } = await this.supabase
        .from("email_preferences")
        .update({
          ...preferences,
          ...getUpdateTimestamp(),
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error || !data) {
        logger.error(
          "Error updating email preferences",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to update preferences");
      }

      return data as EmailPreferences;
    } else {
      // Create new
      const { data, error } = await this.supabase
        .from("email_preferences")
        .insert({
          user_id: userId,
          course_updates:
            preferences.course_updates ??
            DEFAULT_EMAIL_PREFERENCES.course_updates,
          session_reminders:
            preferences.session_reminders ??
            DEFAULT_EMAIL_PREFERENCES.session_reminders,
          marketing:
            preferences.marketing ?? DEFAULT_EMAIL_PREFERENCES.marketing,
          payment_receipts:
            preferences.payment_receipts ??
            DEFAULT_EMAIL_PREFERENCES.payment_receipts,
          ...getTimestampFields(),
        })
        .select()
        .single();

      if (error || !data) {
        logger.error(
          "Error creating email preferences",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to create preferences");
      }

      return data as EmailPreferences;
    }
  }

  /**
   * Check if user has opted in to a specific email type
   *
   * @param userId - User ID
   * @param emailType - Type of email
   * @returns True if opted in
   */
  async hasOptedIn(
    userId: string,
    emailType: keyof typeof DEFAULT_EMAIL_PREFERENCES
  ): Promise<boolean> {
    const preferences = await this.getByUser(userId);
    return preferences[emailType] ?? DEFAULT_EMAIL_PREFERENCES[emailType];
  }

  /**
   * Opt out of all marketing emails
   *
   * @param userId - User ID
   * @returns Updated preferences
   */
  async optOutMarketing(userId: string): Promise<EmailPreferences> {
    return this.upsertPreferences(userId, { marketing: false });
  }

  /**
   * Opt in to all notifications
   *
   * @param userId - User ID
   * @returns Updated preferences
   */
  async optInAll(userId: string): Promise<EmailPreferences> {
    return this.upsertPreferences(userId, {
      course_updates: true,
      session_reminders: true,
      marketing: true,
      payment_receipts: true,
    });
  }

  /**
   * Opt out of all notifications (except payment receipts)
   *
   * @param userId - User ID
   * @returns Updated preferences
   */
  async optOutAll(userId: string): Promise<EmailPreferences> {
    return this.upsertPreferences(userId, {
      course_updates: false,
      session_reminders: false,
      marketing: false,
      // Keep payment_receipts as true (legal requirement)
    });
  }
}

/**
 * Singleton instance of EmailPreferencesRepository
 */
export const emailPreferencesRepository = new EmailPreferencesRepository();
