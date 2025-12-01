/**
 * Site Announcements Repository
 * Manages site-wide banners and announcements
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Announcement types */
export type AnnouncementType =
  | "info"
  | "warning"
  | "success"
  | "error"
  | "promo";

/** Site announcement record */
export interface SiteAnnouncement {
  id: string;
  title: string;
  content: string;
  type: AnnouncementType;
  link_url: string | null;
  link_text: string | null;
  background_color: string | null;
  text_color: string | null;
  is_dismissible: boolean;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  display_order: number;
  target_pages: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** Announcement insert data */
export interface SiteAnnouncementInsert {
  title: string;
  content: string;
  type?: AnnouncementType;
  link_url?: string | null;
  link_text?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  is_dismissible?: boolean;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  display_order?: number;
  target_pages?: string[];
  created_by?: string;
}

/** Announcement update data */
export interface SiteAnnouncementUpdate {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  link_url?: string | null;
  link_text?: string | null;
  background_color?: string | null;
  text_color?: string | null;
  is_dismissible?: boolean;
  is_active?: boolean;
  starts_at?: string | null;
  ends_at?: string | null;
  display_order?: number;
  target_pages?: string[];
}

/**
 * Site Announcements Repository
 */
export class SiteAnnouncementsRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get active announcements for a specific page
   */
  async getActiveForPage(
    pagePath: string = "all"
  ): Promise<SiteAnnouncement[]> {
    const now = new Date().toISOString();

    const { data, error } = await this.supabase
      .from("site_announcements")
      .select("*")
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching active announcements", error);
      return [];
    }

    // Filter by target pages
    const announcements = (data || []) as SiteAnnouncement[];
    return announcements.filter(
      (a) => a.target_pages.includes("all") || a.target_pages.includes(pagePath)
    );
  }

  /**
   * Get all announcements (admin)
   */
  async getAll(): Promise<SiteAnnouncement[]> {
    const { data, error } = await this.supabase
      .from("site_announcements")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching all announcements", error);
      return [];
    }

    return (data || []) as SiteAnnouncement[];
  }

  /**
   * Get announcement by ID
   */
  async findById(id: string): Promise<SiteAnnouncement> {
    const { data, error } = await this.supabase
      .from("site_announcements")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching announcement by ID", error);
      throw internalError("Announcement not found");
    }

    return data as SiteAnnouncement;
  }

  /**
   * Create a new announcement
   */
  async create(
    announcement: SiteAnnouncementInsert
  ): Promise<SiteAnnouncement> {
    const { data, error } = await this.supabase
      .from("site_announcements")
      .insert(announcement)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating announcement", error);
      throw internalError("Failed to create announcement");
    }

    return data as SiteAnnouncement;
  }

  /**
   * Update an announcement
   */
  async update(
    id: string,
    updates: SiteAnnouncementUpdate
  ): Promise<SiteAnnouncement> {
    const { data, error } = await this.supabase
      .from("site_announcements")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating announcement", error);
      throw internalError("Failed to update announcement");
    }

    return data as SiteAnnouncement;
  }

  /**
   * Delete an announcement
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("site_announcements")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting announcement", error);
      throw internalError("Failed to delete announcement");
    }
  }

  /**
   * Toggle announcement active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<SiteAnnouncement> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Get active announcement count
   */
  async countActive(): Promise<number> {
    const now = new Date().toISOString();

    const { count, error } = await this.supabase
      .from("site_announcements")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true)
      .or(`starts_at.is.null,starts_at.lte.${now}`)
      .or(`ends_at.is.null,ends_at.gt.${now}`);

    if (error) {
      logger.error("Error counting active announcements", error);
      return 0;
    }

    return count || 0;
  }
}

/** Singleton instance */
export const siteAnnouncementsRepository = new SiteAnnouncementsRepository();
