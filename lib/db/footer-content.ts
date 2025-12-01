/**
 * Footer Content Repository
 * Manages footer sections and content
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Footer sections */
export type FooterSection =
  | "about"
  | "links"
  | "social"
  | "legal"
  | "newsletter"
  | "contact";

/** Footer content record */
export interface FooterContent {
  id: string;
  section: FooterSection;
  content: Record<string, unknown>;
  is_visible: boolean;
  display_order: number;
  updated_at: string;
  updated_by: string | null;
}

/** Footer link */
export interface FooterLink {
  label: string;
  url: string;
}

/** Footer link column */
export interface FooterLinkColumn {
  title: string;
  links: FooterLink[];
}

/** Social link */
export interface FooterSocialLink {
  platform: string;
  url: string;
  label: string;
}

/** About section content */
export interface FooterAboutContent {
  title: string;
  description: string;
  logo_url?: string;
}

/** Links section content */
export interface FooterLinksContent {
  columns: FooterLinkColumn[];
}

/** Social section content */
export interface FooterSocialContent {
  title: string;
  links: FooterSocialLink[];
}

/** Newsletter section content */
export interface FooterNewsletterContent {
  title: string;
  description: string;
  placeholder: string;
  button_text: string;
  is_enabled: boolean;
}

/** Legal section content */
export interface FooterLegalContent {
  links: FooterLink[];
  copyright: string;
}

/** Contact section content */
export interface FooterContactContent {
  email: string;
  phone?: string | null;
  address?: string | null;
}

/** Complete footer data */
export interface FooterData {
  about?: FooterAboutContent;
  links?: FooterLinksContent;
  social?: FooterSocialContent;
  newsletter?: FooterNewsletterContent;
  legal?: FooterLegalContent;
  contact?: FooterContactContent;
}

/**
 * Footer Content Repository
 */
export class FooterContentRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get all visible footer content
   */
  async getFooterData(): Promise<FooterData> {
    const { data, error } = await this.supabase
      .from("footer_content")
      .select("section, content")
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching footer content", error);
      return {};
    }

    const footerData: FooterData = {};
    for (const row of data || []) {
      (footerData as any)[row.section] = row.content;
    }
    return footerData;
  }

  /**
   * Get a specific section
   */
  async getSection(
    section: FooterSection
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.supabase
      .from("footer_content")
      .select("content")
      .eq("section", section)
      .eq("is_visible", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data.content as Record<string, unknown>;
  }

  /**
   * Get all sections (admin)
   */
  async getAllSections(): Promise<FooterContent[]> {
    const { data, error } = await this.supabase
      .from("footer_content")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching all footer sections", error);
      return [];
    }

    return (data || []) as FooterContent[];
  }

  /**
   * Update a section's content
   */
  async updateSection(
    section: FooterSection,
    content: Record<string, unknown>,
    updatedBy?: string
  ): Promise<FooterContent> {
    const { data, error } = await this.supabase
      .from("footer_content")
      .update({
        content,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null,
      })
      .eq("section", section)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating footer section", error);
      throw internalError("Failed to update footer section");
    }

    return data as FooterContent;
  }

  /**
   * Toggle section visibility
   */
  async toggleVisibility(
    section: FooterSection,
    isVisible: boolean
  ): Promise<FooterContent> {
    const { data, error } = await this.supabase
      .from("footer_content")
      .update({
        is_visible: isVisible,
        updated_at: new Date().toISOString(),
      })
      .eq("section", section)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error toggling footer visibility", error);
      throw internalError("Failed to update footer visibility");
    }

    return data as FooterContent;
  }

  /**
   * Reorder sections
   */
  async reorderSections(orderedSections: FooterSection[]): Promise<void> {
    for (let i = 0; i < orderedSections.length; i++) {
      await this.supabase
        .from("footer_content")
        .update({ display_order: i + 1 })
        .eq("section", orderedSections[i]);
    }
  }
}

/** Singleton instance */
export const footerContentRepository = new FooterContentRepository();
