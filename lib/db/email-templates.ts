/**
 * Email Templates Repository
 * Manages customizable email templates
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Template categories */
export type EmailTemplateCategory =
  | "transactional"
  | "marketing"
  | "notification"
  | "system";

/** Template variable definition */
export interface TemplateVariable {
  name: string;
  description: string;
}

/** Email template */
export interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  subject: string;
  preview_text: string | null;
  html_content: string;
  text_content: string | null;
  variables: TemplateVariable[];
  category: EmailTemplateCategory;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

/** Template insert data */
export interface EmailTemplateInsert {
  slug: string;
  name: string;
  description?: string;
  subject: string;
  preview_text?: string;
  html_content: string;
  text_content?: string;
  variables?: TemplateVariable[];
  category?: EmailTemplateCategory;
  is_active?: boolean;
}

/** Template update data */
export interface EmailTemplateUpdate {
  name?: string;
  description?: string | null;
  subject?: string;
  preview_text?: string | null;
  html_content?: string;
  text_content?: string | null;
  variables?: TemplateVariable[];
  category?: EmailTemplateCategory;
  is_active?: boolean;
}

/** Rendered template */
export interface RenderedEmail {
  subject: string;
  html: string;
  text: string | null;
}

/**
 * Email Templates Repository
 */
export class EmailTemplatesRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Get template by slug
   */
  async getBySlug(slug: string): Promise<EmailTemplate | null> {
    const { data, error } = await this.supabase
      .from("email_templates")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as EmailTemplate;
  }

  /**
   * Get all templates
   */
  async getAll(): Promise<EmailTemplate[]> {
    const { data, error } = await this.supabase
      .from("email_templates")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching email templates", error);
      return [];
    }

    return (data || []) as EmailTemplate[];
  }

  /**
   * Get templates by category
   */
  async getByCategory(
    category: EmailTemplateCategory
  ): Promise<EmailTemplate[]> {
    const { data, error } = await this.supabase
      .from("email_templates")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching templates by category", error);
      return [];
    }

    return (data || []) as EmailTemplate[];
  }

  /**
   * Get template by ID
   */
  async findById(id: string): Promise<EmailTemplate> {
    const { data, error } = await this.supabase
      .from("email_templates")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching template by ID", error);
      throw internalError("Template not found");
    }

    return data as EmailTemplate;
  }

  /**
   * Create a template
   */
  async create(template: EmailTemplateInsert): Promise<EmailTemplate> {
    const { data, error } = await this.supabase
      .from("email_templates")
      .insert(template)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating email template", error);
      throw internalError("Failed to create template");
    }

    return data as EmailTemplate;
  }

  /**
   * Update a template
   */
  async update(
    id: string,
    updates: EmailTemplateUpdate,
    updatedBy?: string
  ): Promise<EmailTemplate> {
    // Get current version
    const current = await this.findById(id);

    const { data, error } = await this.supabase
      .from("email_templates")
      .update({
        ...updates,
        version: current.version + 1,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating email template", error);
      throw internalError("Failed to update template");
    }

    return data as EmailTemplate;
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("email_templates")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting email template", error);
      throw internalError("Failed to delete template");
    }
  }

  /**
   * Toggle template active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<EmailTemplate> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Render a template with variables
   */
  async render(
    slug: string,
    variables: Record<string, string>
  ): Promise<RenderedEmail | null> {
    const template = await this.getBySlug(slug);
    if (!template) {
      return null;
    }

    // Replace variables in subject, html, and text
    let subject = template.subject;
    let html = template.html_content;
    let text = template.text_content || null;

    for (const [key, value] of Object.entries(variables)) {
      const pattern = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(pattern, value);
      html = html.replace(pattern, value);
      if (text) {
        text = text.replace(pattern, value);
      }
    }

    return { subject, html, text };
  }

  /**
   * Preview a template with sample data
   */
  async preview(
    id: string,
    sampleData: Record<string, string>
  ): Promise<RenderedEmail> {
    const template = await this.findById(id);

    let subject = template.subject;
    let html = template.html_content;
    let text = template.text_content || null;

    for (const [key, value] of Object.entries(sampleData)) {
      const pattern = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(pattern, value);
      html = html.replace(pattern, value);
      if (text) {
        text = text.replace(pattern, value);
      }
    }

    return { subject, html, text };
  }

  /**
   * Duplicate a template
   */
  async duplicate(
    id: string,
    newSlug: string,
    newName: string
  ): Promise<EmailTemplate> {
    const template = await this.findById(id);

    return this.create({
      slug: newSlug,
      name: newName,
      description: template.description || undefined,
      subject: template.subject,
      preview_text: template.preview_text || undefined,
      html_content: template.html_content,
      text_content: template.text_content || undefined,
      variables: template.variables,
      category: template.category,
      is_active: false, // Start as inactive
    });
  }
}

/** Singleton instance */
export const emailTemplatesRepository = new EmailTemplatesRepository();
