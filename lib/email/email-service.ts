import { logger } from "@/lib/logging";
import type { Database, Json } from "@/lib/types/supabase";
import type { JSXElementConstructor, ReactElement } from "react";
import { Resend } from "resend";
import type {
  CourseCompletionProps,
  PasswordResetProps,
  PaymentConfirmationProps,
  SessionReminderProps,
  WelcomeEmailProps,
} from "./templates";
import {
  CourseCompletionEmail,
  PasswordResetEmail,
  PaymentConfirmationEmail,
  SessionReminderEmail,
  WelcomeEmail,
} from "./templates";

type EmailComponent = ReactElement<
  unknown,
  string | JSXElementConstructor<unknown>
>;

// Lazy-initialized Resend client to avoid build-time errors
let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not defined in environment variables");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

type ScheduledEmail = Database["public"]["Tables"]["scheduled_emails"]["Row"];

interface EmailResult {
  success: boolean;
  data?: { id: string } | ScheduledEmail | null;
  error?: { message: string } | string | null;
}

class EmailService {
  private from =
    process.env.EMAIL_FROM || "NeuroElemental <noreply@neuroelemental.com>";
  private replyTo = process.env.EMAIL_REPLY_TO || "support@neuroelemental.com";

  private async sendEmail(
    to: string | string[],
    subject: string,
    component: EmailComponent
  ): Promise<EmailResult> {
    try {
      // Resend handles React components directly
      const { data, error } = await getResend().emails.send({
        from: this.from,
        to,
        subject,
        react: component,
        replyTo: this.replyTo,
      });

      if (error) {
        logger.error("Email send error:", error as Error);
        return { success: false, error };
      }

      logger.info(
        "Email sent successfully:",
        data as unknown as Record<string, unknown>
      );
      return { success: true, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Email service error:", err);
      return { success: false, error: err.message };
    }
  }

  async sendWelcomeEmail(
    email: string,
    props: Omit<WelcomeEmailProps, "email">
  ): Promise<EmailResult> {
    return this.sendEmail(
      email,
      `Welcome to NeuroElemental, ${props.name}!`,
      WelcomeEmail({ ...props, email }) as EmailComponent
    );
  }

  async sendPaymentConfirmation(
    email: string,
    props: PaymentConfirmationProps
  ): Promise<EmailResult> {
    return this.sendEmail(
      email,
      `Payment Confirmation - ${props.itemName}`,
      PaymentConfirmationEmail(props) as EmailComponent
    );
  }

  async sendSessionReminder(
    email: string,
    props: SessionReminderProps
  ): Promise<EmailResult> {
    const timeStr = props.scheduledAt.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return this.sendEmail(
      email,
      `Reminder: Your session is tomorrow at ${timeStr}`,
      SessionReminderEmail(props) as EmailComponent
    );
  }

  async sendPasswordReset(
    email: string,
    props: PasswordResetProps
  ): Promise<EmailResult> {
    return this.sendEmail(
      email,
      "Reset Your NeuroElemental Password",
      PasswordResetEmail(props) as EmailComponent
    );
  }

  async sendCourseCompletion(
    email: string,
    props: CourseCompletionProps
  ): Promise<EmailResult> {
    return this.sendEmail(
      email,
      `Congratulations! You've completed ${props.courseName}`,
      CourseCompletionEmail(props) as EmailComponent
    );
  }

  async sendPaymentFailedNotification(
    email: string,
    props: {
      invoiceId: string;
      amount: number;
      currency: string;
      attemptCount: number;
      nextRetryDate?: Date;
    }
  ): Promise<EmailResult> {
    const subject = "Payment Failed - Action Required";

    // Create a simple HTML email for payment failure
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Payment Failed</h2>
        <p>We were unable to process your payment of <strong>${props.currency} ${props.amount.toFixed(2)}</strong>.</p>

        <p>Invoice ID: ${props.invoiceId}</p>
        <p>Attempt: ${props.attemptCount}</p>

        ${
          props.nextRetryDate
            ? `
          <p>We will automatically retry on: <strong>${props.nextRetryDate.toLocaleDateString()}</strong></p>
        `
            : ""
        }

        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing"
             style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
            Update Payment Method
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          If you have any questions, please contact our support team.
        </p>
      </div>
    `;

    try {
      const { data, error } = await getResend().emails.send({
        from: this.from,
        to: email,
        subject,
        html,
        replyTo: this.replyTo,
      });

      if (error) {
        logger.error("Payment failed email error:", error as Error);
        return { success: false, error };
      }

      return { success: true, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Email service error:", err);
      return { success: false, error: err.message };
    }
  }

  // Batch email sending for notifications
  async sendBatchEmails(
    emails: Array<{
      to: string;
      type: "welcome" | "payment" | "session" | "reset" | "completion";
      props:
        | WelcomeEmailProps
        | PaymentConfirmationProps
        | SessionReminderProps
        | PasswordResetProps
        | CourseCompletionProps;
    }>
  ): Promise<Array<EmailResult>> {
    const results = await Promise.allSettled(
      emails.map(({ to, type, props }) => {
        switch (type) {
          case "welcome":
            return this.sendWelcomeEmail(to, props as WelcomeEmailProps);
          case "payment":
            return this.sendPaymentConfirmation(
              to,
              props as PaymentConfirmationProps
            );
          case "session":
            return this.sendSessionReminder(to, props as SessionReminderProps);
          case "reset":
            return this.sendPasswordReset(to, props as PasswordResetProps);
          case "completion":
            return this.sendCourseCompletion(
              to,
              props as CourseCompletionProps
            );
          default:
            return Promise.reject(new Error(`Unknown email type: ${type}`));
        }
      })
    );

    return results.map((result) => {
      if (result.status === "fulfilled") {
        return result.value;
      } else {
        return { success: false, error: result.reason };
      }
    });
  }

  // Schedule email for later sending (using a queue)
  async scheduleEmail(
    to: string,
    type: string,
    props: Json,
    scheduledFor: Date
  ): Promise<EmailResult> {
    try {
      // In production, this would integrate with a queue service
      // For now, we'll store in database and process with a cron job
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      type ScheduledEmailInsert =
        Database["public"]["Tables"]["scheduled_emails"]["Insert"];
      const insertData: ScheduledEmailInsert = {
        to,
        type,
        props,
        scheduled_for: scheduledFor.toISOString(),
        status: "pending",
      };

      const { data, error } = await (supabase as any)
        .from("scheduled_emails")
        .insert(insertData)
        .select()
        .single() as { data: ScheduledEmail | null; error: Error | null };

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: err.message };
    }
  }

  // Process scheduled emails (called by cron job)
  async processScheduledEmails(): Promise<void> {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      // Get pending emails scheduled for now or past
      const { data: emails, error } = await (supabase as any)
        .from("scheduled_emails")
        .select("*")
        .eq("status", "pending")
        .lte("scheduled_for", new Date().toISOString())
        .limit(50) as { data: ScheduledEmail[] | null; error: Error | null };

      if (error) {
        logger.error(
          "Error fetching scheduled emails:",
          new Error(error.message)
        );
        return;
      }

      if (!emails || emails.length === 0) {
        return;
      }

      type ScheduledEmailRow =
        Database["public"]["Tables"]["scheduled_emails"]["Row"];
      type ScheduledEmailUpdate =
        Database["public"]["Tables"]["scheduled_emails"]["Update"];

      // Process each email
      for (const email of emails as ScheduledEmailRow[]) {
        try {
          let result: EmailResult;
          const props = email.props as Record<string, unknown>;

          switch (email.type) {
            case "welcome":
              result = await this.sendWelcomeEmail(
                email.to,
                props as unknown as Omit<WelcomeEmailProps, "email">
              );
              break;
            case "payment":
              result = await this.sendPaymentConfirmation(
                email.to,
                props as unknown as PaymentConfirmationProps
              );
              break;
            case "session":
              result = await this.sendSessionReminder(
                email.to,
                props as unknown as SessionReminderProps
              );
              break;
            case "reset":
              result = await this.sendPasswordReset(
                email.to,
                props as unknown as PasswordResetProps
              );
              break;
            case "completion":
              result = await this.sendCourseCompletion(
                email.to,
                props as unknown as CourseCompletionProps
              );
              break;
            default:
              result = {
                success: false,
                error: `Unknown email type: ${email.type}`,
              };
          }

          // Update email status
          const updateData: ScheduledEmailUpdate = {
            status: result.success ? "sent" : "failed",
            sent_at: result.success ? new Date().toISOString() : null,
            error:
              typeof result.error === "string"
                ? result.error
                : result.error?.message || null,
          };
          await (supabase as any)
            .from("scheduled_emails")
            .update(updateData)
            .eq("id", email.id);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error(`Error processing email ${email.id}:`, err);

          const failedUpdate: ScheduledEmailUpdate = {
            status: "failed",
            error: err.message,
          };
          await (supabase as any)
            .from("scheduled_emails")
            .update(failedUpdate)
            .eq("id", email.id);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error in processScheduledEmails:", err);
    }
  }

  // Email preferences management
  async updateEmailPreferences(
    userId: string,
    preferences: {
      marketing?: boolean;
      course_updates?: boolean;
      session_reminders?: boolean;
      payment_receipts?: boolean;
    }
  ): Promise<EmailResult> {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      type EmailPrefsInsert =
        Database["public"]["Tables"]["email_preferences"]["Insert"];
      const insertData: EmailPrefsInsert = {
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase as any)
        .from("email_preferences")
        .upsert(insertData)
        .select()
        .single() as { data: unknown; error: Error | null };

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data as unknown as ScheduledEmail };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return { success: false, error: err.message };
    }
  }

  async checkEmailPreferences(
    userId: string,
    emailType:
      | "marketing"
      | "course_updates"
      | "session_reminders"
      | "payment_receipts"
  ): Promise<boolean> {
    try {
      const { createAdminClient } = await import("@/lib/supabase/admin");
      const supabase = createAdminClient();

      type EmailPrefsRow =
        Database["public"]["Tables"]["email_preferences"]["Row"];
      const { data } = await supabase
        .from("email_preferences")
        .select(emailType)
        .eq("user_id", userId)
        .maybeSingle();

      const row = data as EmailPrefsRow | null;
      return row?.[emailType] !== false; // Default to true if not found
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Error checking email preferences:", err);
      return true; // Default to sending if error
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types
export type {
  CourseCompletionProps,
  EmailResult,
  PasswordResetProps,
  PaymentConfirmationProps,
  SessionReminderProps,
  WelcomeEmailProps,
};
