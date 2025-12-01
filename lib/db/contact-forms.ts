/**
 * Contact Forms Repository
 * Manages contact forms and form submissions
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Form field types */
export type FormFieldType =
  | "text"
  | "email"
  | "tel"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "number"
  | "date"
  | "hidden";

/** Form field definition */
export interface FormField {
  name: string;
  label: string;
  type: FormFieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  rows?: number;
  min?: number;
  max?: number;
  pattern?: string;
  helpText?: string;
}

/** Submission status */
export type SubmissionStatus = "new" | "read" | "replied" | "spam" | "archived";

/** Contact form */
export interface ContactForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  fields: FormField[];
  success_message: string;
  redirect_url: string | null;
  notification_email: string | null;
  is_active: boolean;
  requires_captcha: boolean;
  honeypot_field: string;
  submit_button_text: string;
  created_at: string;
  updated_at: string;
}

/** Form submission */
export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  ip_address: string | null;
  user_agent: string | null;
  referrer: string | null;
  status: SubmissionStatus;
  notes: string | null;
  submitted_at: string;
  read_at: string | null;
  replied_at: string | null;
}

/** Submission with form info */
export interface FormSubmissionWithForm extends FormSubmission {
  form?: {
    name: string;
    slug: string;
  };
}

/** Form insert */
export interface ContactFormInsert {
  name: string;
  slug: string;
  description?: string;
  fields: FormField[];
  success_message?: string;
  redirect_url?: string;
  notification_email?: string;
  is_active?: boolean;
  requires_captcha?: boolean;
  honeypot_field?: string;
  submit_button_text?: string;
}

/** Form update */
export interface ContactFormUpdate {
  name?: string;
  description?: string | null;
  fields?: FormField[];
  success_message?: string;
  redirect_url?: string | null;
  notification_email?: string | null;
  is_active?: boolean;
  requires_captcha?: boolean;
  honeypot_field?: string;
  submit_button_text?: string;
}

/**
 * Contact Forms Repository
 */
export class ContactFormsRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get form by slug (public)
   */
  async getBySlug(slug: string): Promise<ContactForm | null> {
    const { data, error } = await this.supabase
      .from("contact_forms")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContactForm;
  }

  /**
   * Get all forms (admin)
   */
  async getAll(): Promise<ContactForm[]> {
    const { data, error } = await this.supabase
      .from("contact_forms")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching forms", error);
      return [];
    }

    return (data || []) as ContactForm[];
  }

  /**
   * Get form by ID
   */
  async findById(id: string): Promise<ContactForm> {
    const { data, error } = await this.supabase
      .from("contact_forms")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching form", error);
      throw internalError("Form not found");
    }

    return data as ContactForm;
  }

  /**
   * Create a form
   */
  async create(form: ContactFormInsert): Promise<ContactForm> {
    const { data, error } = await this.supabase
      .from("contact_forms")
      .insert(form)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating form", error);
      throw internalError("Failed to create form");
    }

    return data as ContactForm;
  }

  /**
   * Update a form
   */
  async update(id: string, updates: ContactFormUpdate): Promise<ContactForm> {
    const { data, error } = await this.supabase
      .from("contact_forms")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating form", error);
      throw internalError("Failed to update form");
    }

    return data as ContactForm;
  }

  /**
   * Delete a form
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("contact_forms")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting form", error);
      throw internalError("Failed to delete form");
    }
  }

  /**
   * Submit a form
   */
  async submitForm(
    formId: string,
    data: Record<string, unknown>,
    metadata?: { ipAddress?: string; userAgent?: string; referrer?: string }
  ): Promise<FormSubmission> {
    const { data: submission, error } = await this.supabase
      .from("form_submissions")
      .insert({
        form_id: formId,
        data,
        ip_address: metadata?.ipAddress || null,
        user_agent: metadata?.userAgent || null,
        referrer: metadata?.referrer || null,
        status: "new",
      })
      .select()
      .single();

    if (error || !submission) {
      logger.error("Error creating submission", error);
      throw internalError("Failed to submit form");
    }

    return submission as FormSubmission;
  }

  /**
   * Get submissions for a form
   */
  async getSubmissions(
    formId: string,
    options?: { status?: SubmissionStatus; limit?: number; offset?: number }
  ): Promise<{ submissions: FormSubmission[]; total: number }> {
    let query = this.supabase
      .from("form_submissions")
      .select("*", { count: "exact" })
      .eq("form_id", formId)
      .order("submitted_at", { ascending: false });

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching submissions", error);
      return { submissions: [], total: 0 };
    }

    return { submissions: (data || []) as FormSubmission[], total: count || 0 };
  }

  /**
   * Get recent submissions across all forms
   */
  async getRecentSubmissions(
    limit: number = 20
  ): Promise<FormSubmissionWithForm[]> {
    const { data, error } = await this.supabase
      .from("form_submissions")
      .select(
        `
        *,
        form:contact_forms(name, slug)
      `
      )
      .order("submitted_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching recent submissions", error);
      return [];
    }

    return (data || []) as FormSubmissionWithForm[];
  }

  /**
   * Update submission status
   */
  async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus,
    notes?: string
  ): Promise<FormSubmission> {
    const updateData: Record<string, unknown> = { status };

    if (status === "read") {
      updateData.read_at = new Date().toISOString();
    } else if (status === "replied") {
      updateData.replied_at = new Date().toISOString();
    }

    if (notes !== undefined) {
      updateData.notes = notes;
    }

    const { data, error } = await this.supabase
      .from("form_submissions")
      .update(updateData)
      .eq("id", submissionId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating submission", error);
      throw internalError("Failed to update submission");
    }

    return data as FormSubmission;
  }

  /**
   * Delete a submission
   */
  async deleteSubmission(submissionId: string): Promise<void> {
    const { error } = await this.supabase
      .from("form_submissions")
      .delete()
      .eq("id", submissionId);

    if (error) {
      logger.error("Error deleting submission", error);
      throw internalError("Failed to delete submission");
    }
  }

  /**
   * Get submission counts by status
   */
  async getSubmissionStats(
    formId?: string
  ): Promise<Record<SubmissionStatus, number>> {
    let query = this.supabase.from("form_submissions").select("status");

    if (formId) {
      query = query.eq("form_id", formId);
    }

    const { data, error } = await query;

    if (error) {
      return { new: 0, read: 0, replied: 0, spam: 0, archived: 0 };
    }

    const stats: Record<SubmissionStatus, number> = {
      new: 0,
      read: 0,
      replied: 0,
      spam: 0,
      archived: 0,
    };
    for (const row of data || []) {
      const status = row.status as SubmissionStatus;
      stats[status] = (stats[status] || 0) + 1;
    }

    return stats;
  }

  /**
   * Mark submission as spam
   */
  async markAsSpam(submissionId: string): Promise<FormSubmission> {
    return this.updateSubmissionStatus(submissionId, "spam");
  }

  /**
   * Archive submission
   */
  async archiveSubmission(submissionId: string): Promise<FormSubmission> {
    return this.updateSubmissionStatus(submissionId, "archived");
  }
}

/** Singleton instance */
export const contactFormsRepository = new ContactFormsRepository();
