/**
 * Blog Comments Repository
 * Manages blog post comments with threading support
 */

import { forbiddenError, internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getUpdateTimestamp } from "@/lib/utils";
import { getSupabaseServer } from "./supabase-server";

/** Blog comment with author info */
export interface BlogComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  is_approved: boolean;
  is_edited: boolean;
  edited_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Comment with author profile */
export interface BlogCommentWithAuthor extends BlogComment {
  author: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/** Comment with replies (nested) */
export interface BlogCommentWithReplies extends BlogCommentWithAuthor {
  replies: BlogCommentWithAuthor[];
}

/**
 * Blog Comments Repository
 * Uses direct supabase calls since blog_comments is a new table
 */
export class BlogCommentsRepository {
  private get supabase() {
    return getSupabaseServer() as any;
  }

  /**
   * Find comment by ID
   */
  async findById(id: string): Promise<BlogComment> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching comment by ID", error);
      throw internalError("Comment not found");
    }

    return data as BlogComment;
  }

  /**
   * Get comments for a blog post (with author info)
   */
  async getPostComments(postId: string): Promise<BlogCommentWithAuthor[]> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url)
      `
      )
      .eq("post_id", postId)
      .eq("is_approved", true)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching post comments", error);
      return [];
    }

    return (data || []) as unknown as BlogCommentWithAuthor[];
  }

  /**
   * Get comments with nested replies (threaded view)
   */
  async getPostCommentsThreaded(
    postId: string
  ): Promise<BlogCommentWithReplies[]> {
    const allComments = await this.getPostComments(postId);

    // Separate root comments and replies
    const rootComments = allComments.filter((c) => !c.parent_id);
    const replies = allComments.filter((c) => c.parent_id);

    // Build threaded structure
    return rootComments.map((comment) => ({
      ...comment,
      replies: replies.filter((r) => r.parent_id === comment.id),
    }));
  }

  /**
   * Get comment count for a post
   */
  async getPostCommentCount(postId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("blog_comments")
      .select("*", { count: "exact", head: true })
      .eq("post_id", postId)
      .eq("is_approved", true);

    if (error) {
      logger.error("Error counting comments", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Create a comment
   */
  async createComment(
    postId: string,
    userId: string,
    content: string,
    parentId?: string
  ): Promise<BlogComment> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content,
        parent_id: parentId || null,
        is_approved: true, // Auto-approve for now, can add moderation later
      })
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating comment", error);
      throw internalError("Failed to create comment");
    }

    // Update comment count on post
    await this.updatePostCommentCount(postId);

    return data as BlogComment;
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<BlogComment> {
    // Verify ownership
    const existing = await this.findById(commentId);
    if ((existing as BlogComment).user_id !== userId) {
      throw forbiddenError("Not authorized to edit this comment");
    }

    const { data, error } = await this.supabase
      .from("blog_comments")
      .update({
        content,
        is_edited: true,
        edited_at: new Date().toISOString(),
        ...getUpdateTimestamp(),
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating comment", error);
      throw internalError("Failed to update comment");
    }

    return data as BlogComment;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string, userId: string): Promise<void> {
    // Verify ownership
    const existing = (await this.findById(commentId)) as BlogComment;
    if (existing.user_id !== userId) {
      throw forbiddenError("Not authorized to delete this comment");
    }

    const postId = existing.post_id;

    const { error } = await this.supabase
      .from("blog_comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      logger.error("Error deleting comment", error);
      throw internalError("Failed to delete comment");
    }

    // Update comment count on post
    await this.updatePostCommentCount(postId);
  }

  /**
   * Get user's comments
   */
  async getUserComments(userId: string): Promise<BlogCommentWithAuthor[]> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url)
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching user comments", error);
      return [];
    }

    return (data || []) as unknown as BlogCommentWithAuthor[];
  }

  /**
   * Moderate a comment (admin only)
   */
  async moderateComment(
    commentId: string,
    approved: boolean
  ): Promise<BlogComment> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .update({ is_approved: approved })
      .eq("id", commentId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error moderating comment", error);
      throw internalError("Failed to moderate comment");
    }

    // Update comment count on post
    await this.updatePostCommentCount((data as BlogComment).post_id);

    return data as BlogComment;
  }

  /**
   * Get pending comments for moderation (admin)
   */
  async getPendingComments(): Promise<BlogCommentWithAuthor[]> {
    const { data, error } = await this.supabase
      .from("blog_comments")
      .select(
        `
        *,
        author:profiles(id, full_name, avatar_url)
      `
      )
      .eq("is_approved", false)
      .order("created_at", { ascending: true });

    if (error) {
      logger.error("Error fetching pending comments", error);
      return [];
    }

    return (data || []) as unknown as BlogCommentWithAuthor[];
  }

  /**
   * Update comment count on blog post
   */
  private async updatePostCommentCount(postId: string): Promise<void> {
    const count = await this.getPostCommentCount(postId);

    await (this.supabase as any)
      .from("blog_posts")
      .update({ comment_count: count })
      .eq("id", postId);
  }
}

/** Singleton instance */
export const blogCommentsRepository = new BlogCommentsRepository();
