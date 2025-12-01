/**
 * SEO Settings Repository
 * Manages per-page SEO metadata and settings
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Change frequency for sitemaps */
export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/** SEO settings */
export interface SeoSettings {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  keywords: string[] | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  og_type: string;
  twitter_card: string;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image_url: string | null;
  canonical_url: string | null;
  robots: string;
  structured_data: Record<string, unknown> | null;
  custom_head_tags: string | null;
  is_noindex: boolean;
  is_nofollow: boolean;
  priority: number;
  change_frequency: ChangeFrequency;
  updated_at: string;
  updated_by: string | null;
}

/** SEO settings for use in head */
export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
  };
  twitter?: {
    card?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  canonical?: string;
  robots?: string;
  structuredData?: Record<string, unknown>;
  customHeadTags?: string;
}

/** SEO settings insert */
export interface SeoSettingsInsert {
  page_path: string;
  title?: string;
  description?: string;
  keywords?: string[];
  og_title?: string;
  og_description?: string;
  og_image_url?: string;
  og_type?: string;
  twitter_card?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_url?: string;
  canonical_url?: string;
  robots?: string;
  structured_data?: Record<string, unknown>;
  custom_head_tags?: string;
  is_noindex?: boolean;
  is_nofollow?: boolean;
  priority?: number;
  change_frequency?: ChangeFrequency;
}

/** SEO settings update */
export interface SeoSettingsUpdate
  extends Partial<Omit<SeoSettingsInsert, "page_path">> {}

/**
 * SEO Settings Repository
 */
export class SeoSettingsRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Get SEO settings for a page
   */
  async getForPage(pagePath: string): Promise<PageSeo | null> {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .select("*")
      .eq("page_path", pagePath)
      .single();

    if (error || !data) {
      return null;
    }

    const settings = data as SeoSettings;
    return this.toPageSeo(settings);
  }

  /**
   * Get all SEO settings
   */
  async getAll(): Promise<SeoSettings[]> {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .select("*")
      .order("page_path", { ascending: true });

    if (error) {
      logger.error("Error fetching SEO settings", error);
      return [];
    }

    return (data || []) as SeoSettings[];
  }

  /**
   * Get settings by ID
   */
  async findById(id: string): Promise<SeoSettings> {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching SEO settings by ID", error);
      throw internalError("SEO settings not found");
    }

    return data as SeoSettings;
  }

  /**
   * Create or update SEO settings for a page
   */
  async upsert(
    settings: SeoSettingsInsert,
    updatedBy?: string
  ): Promise<SeoSettings> {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .upsert(
        {
          ...settings,
          updated_at: new Date().toISOString(),
          updated_by: updatedBy || null,
        },
        { onConflict: "page_path" }
      )
      .select()
      .single();

    if (error || !data) {
      logger.error("Error upserting SEO settings", error);
      throw internalError("Failed to save SEO settings");
    }

    return data as SeoSettings;
  }

  /**
   * Update SEO settings by ID
   */
  async update(
    id: string,
    updates: SeoSettingsUpdate,
    updatedBy?: string
  ): Promise<SeoSettings> {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: updatedBy || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating SEO settings", error);
      throw internalError("Failed to update SEO settings");
    }

    return data as SeoSettings;
  }

  /**
   * Delete SEO settings
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("seo_settings")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting SEO settings", error);
      throw internalError("Failed to delete SEO settings");
    }
  }

  /**
   * Get sitemap data
   */
  async getSitemapData(): Promise<
    Array<{
      path: string;
      priority: number;
      changeFrequency: ChangeFrequency;
      lastModified: string;
    }>
  > {
    const { data, error } = await this.supabase
      .from("seo_settings")
      .select("page_path, priority, change_frequency, updated_at")
      .eq("is_noindex", false);

    if (error) {
      logger.error("Error fetching sitemap data", error);
      return [];
    }

    return (data || []).map(
      (d: {
        page_path: string;
        priority: number;
        change_frequency: ChangeFrequency;
        updated_at: string;
      }) => ({
        path: d.page_path,
        priority: d.priority,
        changeFrequency: d.change_frequency,
        lastModified: d.updated_at,
      })
    );
  }

  /**
   * Convert settings to PageSeo format
   */
  private toPageSeo(settings: SeoSettings): PageSeo {
    const robots = this.buildRobots(settings);

    return {
      title: settings.title || undefined,
      description: settings.description || undefined,
      keywords: settings.keywords || undefined,
      openGraph: {
        title: settings.og_title || settings.title || undefined,
        description:
          settings.og_description || settings.description || undefined,
        image: settings.og_image_url || undefined,
        type: settings.og_type || "website",
      },
      twitter: {
        card: settings.twitter_card || "summary_large_image",
        title:
          settings.twitter_title ||
          settings.og_title ||
          settings.title ||
          undefined,
        description:
          settings.twitter_description ||
          settings.og_description ||
          settings.description ||
          undefined,
        image: settings.twitter_image_url || settings.og_image_url || undefined,
      },
      canonical: settings.canonical_url || undefined,
      robots,
      structuredData: settings.structured_data || undefined,
      customHeadTags: settings.custom_head_tags || undefined,
    };
  }

  /**
   * Build robots meta content
   */
  private buildRobots(settings: SeoSettings): string {
    if (settings.robots && settings.robots !== "index, follow") {
      return settings.robots;
    }

    const directives: string[] = [];
    directives.push(settings.is_noindex ? "noindex" : "index");
    directives.push(settings.is_nofollow ? "nofollow" : "follow");
    return directives.join(", ");
  }
}

/** Singleton instance */
export const seoSettingsRepository = new SeoSettingsRepository();
