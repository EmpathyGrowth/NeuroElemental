/**
 * Media Library Repository
 * Manages uploaded files and media assets
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Media item */
export interface MediaItem {
  id: string;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  caption: string | null;
  folder: string;
  tags: string[];
  metadata: Record<string, unknown>;
  width: number | null;
  height: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

/** Media insert data */
export interface MediaItemInsert {
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  public_url: string;
  alt_text?: string;
  caption?: string;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  width?: number;
  height?: number;
  uploaded_by?: string;
}

/** Media update data */
export interface MediaItemUpdate {
  alt_text?: string | null;
  caption?: string | null;
  folder?: string;
  tags?: string[];
}

/** Media filter options */
export interface MediaFilterOptions {
  folder?: string;
  mimeType?: string;
  tags?: string[];
  uploadedBy?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

/**
 * Media Library Repository
 */
export class MediaLibraryRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Get media items with filters
   */
  async getMedia(
    options: MediaFilterOptions = {}
  ): Promise<{ items: MediaItem[]; total: number }> {
    let query = this.supabase
      .from("media_library")
      .select("*", { count: "exact" });

    if (options.folder) {
      query = query.eq("folder", options.folder);
    }

    if (options.mimeType) {
      query = query.ilike("mime_type", `${options.mimeType}%`);
    }

    if (options.tags && options.tags.length > 0) {
      query = query.contains("tags", options.tags);
    }

    if (options.uploadedBy) {
      query = query.eq("uploaded_by", options.uploadedBy);
    }

    if (options.search) {
      query = query.or(
        `filename.ilike.%${options.search}%,original_filename.ilike.%${options.search}%,alt_text.ilike.%${options.search}%`
      );
    }

    query = query.order("created_at", { ascending: false });

    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 50) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching media", error);
      return { items: [], total: 0 };
    }

    return { items: (data || []) as MediaItem[], total: count || 0 };
  }

  /**
   * Get media by ID
   */
  async findById(id: string): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from("media_library")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching media by ID", error);
      throw internalError("Media not found");
    }

    return data as MediaItem;
  }

  /**
   * Create media record
   */
  async create(item: MediaItemInsert): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from("media_library")
      .insert(item)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating media record", error);
      throw internalError("Failed to create media record");
    }

    return data as MediaItem;
  }

  /**
   * Update media metadata
   */
  async update(id: string, updates: MediaItemUpdate): Promise<MediaItem> {
    const { data, error } = await this.supabase
      .from("media_library")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating media", error);
      throw internalError("Failed to update media");
    }

    return data as MediaItem;
  }

  /**
   * Delete media record (does NOT delete file from storage)
   */
  async delete(id: string): Promise<MediaItem> {
    // Get the record first for return
    const item = await this.findById(id);

    const { error } = await this.supabase
      .from("media_library")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting media record", error);
      throw internalError("Failed to delete media");
    }

    return item;
  }

  /**
   * Get all folders
   */
  async getFolders(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("media_library")
      .select("folder");

    if (error) {
      logger.error("Error fetching folders", error);
      return ["uploads"];
    }

    const folders = [
      ...new Set((data || []).map((d: { folder: string }) => d.folder)),
    ] as string[];
    return folders.length > 0 ? folders : ["uploads"];
  }

  /**
   * Get all tags
   */
  async getTags(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("media_library")
      .select("tags");

    if (error) {
      logger.error("Error fetching tags", error);
      return [];
    }

    const allTags = (data || []).flatMap(
      (d: { tags: string[] }) => d.tags || []
    );
    return [...new Set(allTags)] as string[];
  }

  /**
   * Get media stats
   */
  async getStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    byType: Record<string, number>;
  }> {
    const { data, error } = await this.supabase
      .from("media_library")
      .select("file_size, mime_type");

    if (error) {
      logger.error("Error fetching media stats", error);
      return { totalFiles: 0, totalSize: 0, byType: {} };
    }

    const items = data || [];
    const byType: Record<string, number> = {};

    for (const item of items) {
      const type = (item.mime_type as string).split("/")[0] || "other";
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      totalFiles: items.length,
      totalSize: items.reduce(
        (sum: number, i: { file_size: number }) => sum + i.file_size,
        0
      ),
      byType,
    };
  }

  /**
   * Move to folder
   */
  async moveToFolder(id: string, folder: string): Promise<MediaItem> {
    return this.update(id, { folder });
  }

  /**
   * Add tags
   */
  async addTags(id: string, newTags: string[]): Promise<MediaItem> {
    const item = await this.findById(id);
    const tags = [...new Set([...item.tags, ...newTags])];
    return this.update(id, { tags });
  }

  /**
   * Remove tags
   */
  async removeTags(id: string, tagsToRemove: string[]): Promise<MediaItem> {
    const item = await this.findById(id);
    const tags = item.tags.filter((t) => !tagsToRemove.includes(t));
    return this.update(id, { tags });
  }
}

/** Singleton instance */
export const mediaLibraryRepository = new MediaLibraryRepository();
