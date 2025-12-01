/**
 * Blog Reactions Repository
 * Manages user reactions/likes on blog posts
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Reaction types */
export type ReactionType = "like" | "love" | "insightful" | "helpful";

/** Blog reaction record */
export interface BlogReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
  created_at: string;
}

/** Reaction counts by type */
export interface ReactionCounts {
  like: number;
  love: number;
  insightful: number;
  helpful: number;
  total: number;
}

/**
 * Blog Reactions Repository
 * Uses direct supabase calls since blog_reactions is a new table
 */
export class BlogReactionsRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Get user's reaction for a post
   */
  async getUserReaction(
    userId: string,
    postId: string
  ): Promise<BlogReaction | null> {
    const { data, error } = await this.supabase
      .from("blog_reactions")
      .select("*")
      .eq("user_id", userId)
      .eq("post_id", postId)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching user reaction", error);
      return null;
    }

    return data as BlogReaction | null;
  }

  /**
   * Check if user has reacted to a post
   */
  async hasUserReacted(userId: string, postId: string): Promise<boolean> {
    const reaction = await this.getUserReaction(userId, postId);
    return !!reaction;
  }

  /**
   * Add or update a reaction
   */
  async addReaction(
    userId: string,
    postId: string,
    reactionType: ReactionType = "like"
  ): Promise<BlogReaction> {
    // Upsert reaction
    const { data, error } = await this.supabase
      .from("blog_reactions")
      .upsert(
        {
          user_id: userId,
          post_id: postId,
          reaction_type: reactionType,
        },
        {
          onConflict: "post_id,user_id",
        }
      )
      .select()
      .single();

    if (error || !data) {
      logger.error("Error adding reaction", error);
      throw internalError("Failed to add reaction");
    }

    // Update reaction count on post
    await this.updatePostReactionCount(postId);

    return data as BlogReaction;
  }

  /**
   * Remove a reaction
   */
  async removeReaction(userId: string, postId: string): Promise<void> {
    const { error } = await this.supabase
      .from("blog_reactions")
      .delete()
      .eq("user_id", userId)
      .eq("post_id", postId);

    if (error) {
      logger.error("Error removing reaction", error);
      throw internalError("Failed to remove reaction");
    }

    // Update reaction count on post
    await this.updatePostReactionCount(postId);
  }

  /**
   * Toggle reaction (add if not exists, remove if exists with same type, change if different type)
   */
  async toggleReaction(
    userId: string,
    postId: string,
    reactionType: ReactionType = "like"
  ): Promise<{ reacted: boolean; reaction?: BlogReaction }> {
    const existing = await this.getUserReaction(userId, postId);

    if (existing) {
      if (existing.reaction_type === reactionType) {
        // Same type - remove reaction
        await this.removeReaction(userId, postId);
        return { reacted: false };
      } else {
        // Different type - update reaction
        const reaction = await this.addReaction(userId, postId, reactionType);
        return { reacted: true, reaction };
      }
    }

    // No existing reaction - add new
    const reaction = await this.addReaction(userId, postId, reactionType);
    return { reacted: true, reaction };
  }

  /**
   * Get reaction counts for a post
   */
  async getPostReactionCounts(postId: string): Promise<ReactionCounts> {
    const { data, error } = await this.supabase
      .from("blog_reactions")
      .select("reaction_type")
      .eq("post_id", postId);

    if (error) {
      logger.error("Error fetching reaction counts", error);
      return { like: 0, love: 0, insightful: 0, helpful: 0, total: 0 };
    }

    const counts: ReactionCounts = {
      like: 0,
      love: 0,
      insightful: 0,
      helpful: 0,
      total: 0,
    };

    (data || []).forEach((r: { reaction_type: string }) => {
      const type = r.reaction_type as ReactionType;
      if (counts[type] !== undefined) {
        counts[type]++;
        counts.total++;
      }
    });

    return counts;
  }

  /**
   * Get total reaction count for a post
   */
  async getPostReactionCount(postId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("blog_reactions")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId);

    if (error) {
      logger.error("Error counting reactions", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get users who reacted to a post
   */
  async getPostReactors(
    postId: string,
    limit: number = 10
  ): Promise<
    Array<{
      userId: string;
      reactionType: ReactionType;
      fullName: string | null;
      avatarUrl: string | null;
    }>
  > {
    const { data, error } = await this.supabase
      .from("blog_reactions")
      .select(
        `
        user_id,
        reaction_type,
        profiles(full_name, avatar_url)
      `
      )
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching reactors", error);
      return [];
    }

    return (data || []).map((r: Record<string, unknown>) => ({
      userId: r.user_id as string,
      reactionType: r.reaction_type as ReactionType,
      fullName: (r.profiles as Record<string, unknown>)?.full_name as
        | string
        | null,
      avatarUrl: (r.profiles as Record<string, unknown>)?.avatar_url as
        | string
        | null,
    }));
  }

  /**
   * Get user's reacted posts
   */
  async getUserReactedPosts(userId: string): Promise<BlogReaction[]> {
    const { data, error } = await this.supabase
      .from("blog_reactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user reacted posts", error);
      return [];
    }

    return (data || []) as BlogReaction[];
  }

  /**
   * Update reaction count on blog post
   */
  private async updatePostReactionCount(postId: string): Promise<void> {
    const count = await this.getPostReactionCount(postId);

    await (this.supabase as any)
      .from("blog_posts")
      .update({ reaction_count: count })
      .eq("id", postId);
  }
}

/** Singleton instance */
export const blogReactionsRepository = new BlogReactionsRepository();
