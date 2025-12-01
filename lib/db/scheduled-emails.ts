/**
 * Scheduled Email Repository
 * Manages scheduled email queue and delivery tracking
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for email scheduling and management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type ScheduledEmail = Database["public"]["Tables"]["scheduled_emails"]["Row"];
type ScheduledEmailInsert =
  Database["public"]["Tables"]["scheduled_emails"]["Insert"];
type _ScheduledEmailUpdate =
  Database["public"]["Tables"]["scheduled_emails"]["Update"];

/**
 * Email status types
 */
export type EmailStatus = "pending" | "sent" | "failed" | "cancelled";

/**
 * Scheduled Email Repository
 * Extends BaseRepository with scheduled email-specific operations
 */
export class ScheduledEmailRepository extends BaseRepository<"scheduled_emails"> {
  constructor() {
    super("scheduled_emails");
  }

  /**
   * Schedule a new email
   *
   * @param data - Email data
   * @returns Created scheduled email
   */
  async scheduleEmail(data: ScheduledEmailInsert): Promise<ScheduledEmail> {
    const { data: email, error } = await this.supabase
      .from("scheduled_emails")
      .insert({
        ...data,
        status: data.status || "pending",
      })
      .select()
      .single();

    if (error || !email) {
      logger.error(
        "Error scheduling email",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to schedule email");
    }

    return email as ScheduledEmail;
  }

  /**
   * Get pending emails ready to send
   *
   * @param limit - Maximum number of emails to return (default: 100)
   * @returns Array of pending emails scheduled for now or earlier
   */
  async getPendingEmails(limit: number = 100): Promise<ScheduledEmail[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .order("scheduled_for", { ascending: true })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching pending emails",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as ScheduledEmail[];
  }

  /**
   * Mark email as sent
   *
   * @param emailId - Email ID
   * @returns Updated email
   */
  async markAsSent(emailId: string): Promise<ScheduledEmail> {
    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("id", emailId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error marking email as sent",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update email status");
    }

    return data as ScheduledEmail;
  }

  /**
   * Mark email as failed
   *
   * @param emailId - Email ID
   * @param errorMessage - Error message
   * @returns Updated email
   */
  async markAsFailed(
    emailId: string,
    errorMessage: string
  ): Promise<ScheduledEmail> {
    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .update({
        status: "failed",
        error: errorMessage,
      })
      .eq("id", emailId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error marking email as failed",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update email status");
    }

    return data as ScheduledEmail;
  }

  /**
   * Cancel scheduled email
   *
   * @param emailId - Email ID
   * @returns Updated email
   */
  async cancelEmail(emailId: string): Promise<ScheduledEmail> {
    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .update({ status: "cancelled" })
      .eq("id", emailId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error cancelling email",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to cancel email");
    }

    return data as ScheduledEmail;
  }

  /**
   * Get scheduled emails by recipient
   *
   * @param email - Recipient email address
   * @param status - Optional status filter
   * @returns Array of scheduled emails
   */
  async getByRecipient(
    email: string,
    status?: EmailStatus
  ): Promise<ScheduledEmail[]> {
    let query = this.supabase
      .from("scheduled_emails")
      .select("*")
      .eq("to", email)
      .order("scheduled_for", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching emails by recipient",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as ScheduledEmail[];
  }

  /**
   * Get scheduled emails by type
   *
   * @param type - Email type
   * @param status - Optional status filter
   * @param limit - Maximum number to return
   * @returns Array of scheduled emails
   */
  async getByType(
    type: string,
    status?: EmailStatus,
    limit?: number
  ): Promise<ScheduledEmail[]> {
    let query = this.supabase
      .from("scheduled_emails")
      .select("*")
      .eq("type", type)
      .order("scheduled_for", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(
        "Error fetching emails by type",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as ScheduledEmail[];
  }

  /**
   * Get email statistics
   *
   * @returns Email statistics
   */
  async getStats(): Promise<{
    pending: number;
    sent: number;
    failed: number;
    cancelled: number;
    total: number;
  }> {
    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .select("status");

    if (error) {
      logger.error(
        "Error fetching email stats",
        error instanceof Error ? error : new Error(String(error))
      );
      return { pending: 0, sent: 0, failed: 0, cancelled: 0, total: 0 };
    }

    const stats = {
      pending: 0,
      sent: 0,
      failed: 0,
      cancelled: 0,
      total: data.length,
    };

    data.forEach((email: { status: string | null }) => {
      const status = email.status || "pending";
      if (status in stats) {
        stats[status as keyof Omit<typeof stats, "total">]++;
      }
    });

    return stats;
  }

  /**
   * Delete old emails
   *
   * @param daysOld - Delete emails older than this many days
   * @param statuses - Status filters (default: ['sent', 'cancelled'])
   * @returns Number of deleted emails
   */
  async cleanupOldEmails(
    daysOld: number = 30,
    statuses: EmailStatus[] = ["sent", "cancelled"]
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const { data, error } = await this.supabase
      .from("scheduled_emails")
      .delete()
      .in("status", statuses)
      .lt("created_at", cutoffDate.toISOString())
      .select("id");

    if (error) {
      logger.error(
        "Error cleaning up old emails",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return data?.length || 0;
  }
}

/**
 * Singleton instance of ScheduledEmailRepository
 */
export const scheduledEmailRepository = new ScheduledEmailRepository();
