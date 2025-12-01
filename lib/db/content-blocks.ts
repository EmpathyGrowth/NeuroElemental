/**
 * Content Blocks Repository
 * Manages reusable content blocks/widgets
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Block types */
export type BlockType =
  | "text"
  | "html"
  | "cta"
  | "feature"
  | "testimonial"
  | "stats"
  | "gallery"
  | "video"
  | "code"
  | "custom";

/** Content block */
export interface ContentBlock {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  block_type: BlockType;
  content: Record<string, unknown>;
  settings: Record<string, unknown>;
  is_global: boolean;
  is_active: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** Block placement */
export interface BlockPlacement {
  id: string;
  block_id: string;
  page_path: string;
  position: string;
  display_order: number;
  overrides: Record<string, unknown>;
  is_visible: boolean;
  created_at: string;
}

/** Placement with block data */
export interface BlockPlacementWithBlock extends BlockPlacement {
  block?: ContentBlock;
}

/** Block insert */
export interface ContentBlockInsert {
  name: string;
  slug: string;
  description?: string;
  block_type: BlockType;
  content: Record<string, unknown>;
  settings?: Record<string, unknown>;
  is_global?: boolean;
  is_active?: boolean;
  created_by?: string;
}

/** Block update */
export interface ContentBlockUpdate {
  name?: string;
  description?: string | null;
  content?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  is_global?: boolean;
  is_active?: boolean;
}

/** Placement insert */
export interface BlockPlacementInsert {
  block_id: string;
  page_path: string;
  position: string;
  display_order?: number;
  overrides?: Record<string, unknown>;
  is_visible?: boolean;
}

/**
 * Content Blocks Repository
 */
export class ContentBlocksRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get block by ID
   */
  async getById(id: string): Promise<ContentBlock | null> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContentBlock;
  }

  /**
   * Get block by slug
   */
  async getBySlug(slug: string): Promise<ContentBlock | null> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .eq("slug", slug)
      .eq("is_active", true)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContentBlock;
  }

  /**
   * Get all blocks
   */
  async getAll(): Promise<ContentBlock[]> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching blocks", error);
      return [];
    }

    return (data || []) as ContentBlock[];
  }

  /**
   * Get blocks by type
   */
  async getByType(blockType: BlockType): Promise<ContentBlock[]> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .eq("block_type", blockType)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching blocks by type", error);
      return [];
    }

    return (data || []) as ContentBlock[];
  }

  /**
   * Get global blocks
   */
  async getGlobalBlocks(): Promise<ContentBlock[]> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .eq("is_global", true)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching global blocks", error);
      return [];
    }

    return (data || []) as ContentBlock[];
  }

  /**
   * Get block by ID
   */
  async findById(id: string): Promise<ContentBlock> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching block", error);
      throw internalError("Block not found");
    }

    return data as ContentBlock;
  }

  /**
   * Create a block
   */
  async create(block: ContentBlockInsert): Promise<ContentBlock> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .insert(block)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating block", error);
      throw internalError("Failed to create block");
    }

    return data as ContentBlock;
  }

  /**
   * Update a block
   */
  async update(id: string, updates: ContentBlockUpdate): Promise<ContentBlock> {
    const { data, error } = await this.supabase
      .from("content_blocks")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating block", error);
      throw internalError("Failed to update block");
    }

    return data as ContentBlock;
  }

  /**
   * Delete a block
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("content_blocks")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting block", error);
      throw internalError("Failed to delete block");
    }
  }

  /**
   * Duplicate a block
   */
  async duplicate(
    id: string,
    newSlug: string,
    newName: string
  ): Promise<ContentBlock> {
    const block = await this.findById(id);

    return this.create({
      name: newName,
      slug: newSlug,
      description: block.description || undefined,
      block_type: block.block_type,
      content: block.content,
      settings: block.settings,
      is_global: false,
      is_active: true,
    });
  }

  // Placement methods

  /**
   * Get blocks for a page
   */
  async getBlocksForPage(pagePath: string): Promise<BlockPlacementWithBlock[]> {
    const { data, error } = await this.supabase
      .from("content_block_placements")
      .select(
        `
        *,
        block:content_blocks(*)
      `
      )
      .eq("page_path", pagePath)
      .eq("is_visible", true)
      .order("position", { ascending: true })
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching page blocks", error);
      return [];
    }

    return (data || []) as BlockPlacementWithBlock[];
  }

  /**
   * Get blocks for a specific position
   */
  async getBlocksForPosition(
    pagePath: string,
    position: string
  ): Promise<BlockPlacementWithBlock[]> {
    const { data, error } = await this.supabase
      .from("content_block_placements")
      .select(
        `
        *,
        block:content_blocks(*)
      `
      )
      .eq("page_path", pagePath)
      .eq("position", position)
      .eq("is_visible", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching position blocks", error);
      return [];
    }

    return (data || []) as BlockPlacementWithBlock[];
  }

  /**
   * Add block to page
   */
  async addToPage(placement: BlockPlacementInsert): Promise<BlockPlacement> {
    const { data, error } = await this.supabase
      .from("content_block_placements")
      .insert(placement)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error adding block to page", error);
      throw internalError("Failed to add block to page");
    }

    // Increment usage count
    await this.supabase
      .from("content_blocks")
      .update({ usage_count: this.supabase.rpc("increment", { x: 1 }) })
      .eq("id", placement.block_id);

    return data as BlockPlacement;
  }

  /**
   * Remove block from page
   */
  async removeFromPage(placementId: string): Promise<void> {
    // Get placement first for block_id
    const { data: placement } = await this.supabase
      .from("content_block_placements")
      .select("block_id")
      .eq("id", placementId)
      .single();

    const { error } = await this.supabase
      .from("content_block_placements")
      .delete()
      .eq("id", placementId);

    if (error) {
      logger.error("Error removing block from page", error);
      throw internalError("Failed to remove block");
    }

    // Decrement usage count
    if (placement) {
      await this.supabase
        .from("content_blocks")
        .update({ usage_count: this.supabase.rpc("decrement", { x: 1 }) })
        .eq("id", placement.block_id);
    }
  }

  /**
   * Update placement
   */
  async updatePlacement(
    placementId: string,
    updates: {
      display_order?: number;
      overrides?: Record<string, unknown>;
      is_visible?: boolean;
    }
  ): Promise<BlockPlacement> {
    const { data, error } = await this.supabase
      .from("content_block_placements")
      .update(updates)
      .eq("id", placementId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating placement", error);
      throw internalError("Failed to update placement");
    }

    return data as BlockPlacement;
  }

  /**
   * Reorder blocks on page
   */
  async reorderPlacements(placementIds: string[]): Promise<void> {
    for (let i = 0; i < placementIds.length; i++) {
      await this.supabase
        .from("content_block_placements")
        .update({ display_order: i + 1 })
        .eq("id", placementIds[i]);
    }
  }
}

/** Singleton instance */
export const contentBlocksRepository = new ContentBlocksRepository();
