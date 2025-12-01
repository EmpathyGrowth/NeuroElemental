/**
 * Site Content Repository
 * Manages editable site content for pages and sections
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Site content record */
export interface SiteContent {
  id: string;
  page: string;
  section: string;
  content: Record<string, unknown>;
  is_published: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
}

/** Content insert data */
export interface SiteContentInsert {
  page: string;
  section: string;
  content: Record<string, unknown>;
  is_published?: boolean;
  updated_by?: string;
}

/** Content update data */
export interface SiteContentUpdate {
  content?: Record<string, unknown>;
  is_published?: boolean;
  updated_by?: string;
}

/**
 * Site Content Repository
 */
export class SiteContentRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get content for a specific page section
   */
  async getSection(
    page: string,
    section: string
  ): Promise<Record<string, unknown> | null> {
    const { data, error } = await this.supabase
      .from("site_content")
      .select("content")
      .eq("page", page)
      .eq("section", section)
      .eq("is_published", true)
      .single();

    if (error || !data) {
      // Return null if not found - caller can use defaults
      return null;
    }

    return data.content as Record<string, unknown>;
  }

  /**
   * Get all sections for a page
   */
  async getPageSections(
    page: string
  ): Promise<Record<string, Record<string, unknown>>> {
    const { data, error } = await this.supabase
      .from("site_content")
      .select("section, content")
      .eq("page", page)
      .eq("is_published", true);

    if (error) {
      logger.error("Error fetching page sections", error);
      return {};
    }

    const sections: Record<string, Record<string, unknown>> = {};
    for (const row of data || []) {
      sections[row.section] = row.content as Record<string, unknown>;
    }
    return sections;
  }

  /**
   * Get all content records (admin)
   */
  async getAll(): Promise<SiteContent[]> {
    const { data, error } = await this.supabase
      .from("site_content")
      .select("*")
      .order("page", { ascending: true })
      .order("section", { ascending: true });

    if (error) {
      logger.error("Error fetching all site content", error);
      return [];
    }

    return (data || []) as SiteContent[];
  }

  /**
   * Get content by ID
   */
  async findById(id: string): Promise<SiteContent> {
    const { data, error } = await this.supabase
      .from("site_content")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching site content by ID", error);
      throw internalError("Content not found");
    }

    return data as SiteContent;
  }

  /**
   * Create or update content for a page section
   */
  async upsertSection(
    page: string,
    section: string,
    content: Record<string, unknown>,
    updatedBy?: string
  ): Promise<SiteContent> {
    const { data, error } = await this.supabase
      .from("site_content")
      .upsert(
        {
          page,
          section,
          content,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy || null,
        },
        { onConflict: "page,section" }
      )
      .select()
      .single();

    if (error || !data) {
      logger.error("Error upserting site content", error);
      throw internalError("Failed to save content");
    }

    return data as SiteContent;
  }

  /**
   * Update content by ID
   */
  async update(id: string, updates: SiteContentUpdate): Promise<SiteContent> {
    // Increment version if content changed
    const incrementVersion = updates.content !== undefined;

    const { data, error } = await this.supabase
      .from("site_content")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        ...(incrementVersion && {
          version: this.supabase.rpc("increment", { row_id: id }),
        }),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating site content", error);
      throw internalError("Failed to update content");
    }

    return data as SiteContent;
  }

  /**
   * Delete content
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("site_content")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting site content", error);
      throw internalError("Failed to delete content");
    }
  }

  /**
   * Toggle content publish status
   */
  async togglePublished(
    id: string,
    isPublished: boolean
  ): Promise<SiteContent> {
    return this.update(id, { is_published: isPublished });
  }

  /**
   * Get all unique pages
   */
  async getPages(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("site_content")
      .select("page");

    if (error) {
      logger.error("Error fetching pages", error);
      return [];
    }

    const pages = [
      ...new Set((data || []).map((d: { page: string }) => d.page)),
    ] as string[];
    return pages;
  }
}

/** Singleton instance */
export const siteContentRepository = new SiteContentRepository();
