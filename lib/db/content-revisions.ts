/**
 * Content Revisions Repository
 * Manages version history and rollback for CMS content
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Content types that support revisions */
export type RevisionContentType =
  | "site_content"
  | "email_template"
  | "faq"
  | "footer_content"
  | "blog_post"
  | "navigation";

/** Content revision */
export interface ContentRevision {
  id: string;
  content_type: RevisionContentType;
  content_id: string;
  version: number;
  data: Record<string, unknown>;
  change_summary: string | null;
  created_at: string;
  created_by: string | null;
}

/** Revision with author info */
export interface ContentRevisionWithAuthor extends ContentRevision {
  author?: {
    id: string;
    full_name: string | null;
    email: string | null;
  };
}

/**
 * Content Revisions Repository
 */
export class ContentRevisionsRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Create a revision snapshot
   */
  async createRevision(
    contentType: RevisionContentType,
    contentId: string,
    data: Record<string, unknown>,
    changeSummary?: string,
    createdBy?: string
  ): Promise<ContentRevision> {
    // Get current max version
    const { data: maxVersion } = await this.supabase
      .from("content_revisions")
      .select("version")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (maxVersion?.version || 0) + 1;

    const { data: revision, error } = await this.supabase
      .from("content_revisions")
      .insert({
        content_type: contentType,
        content_id: contentId,
        version: nextVersion,
        data,
        change_summary: changeSummary || null,
        created_by: createdBy || null,
      })
      .select()
      .single();

    if (error || !revision) {
      logger.error("Error creating revision", error);
      throw internalError("Failed to create revision");
    }

    return revision as ContentRevision;
  }

  /**
   * Get all revisions for content
   */
  async getRevisions(
    contentType: RevisionContentType,
    contentId: string,
    limit: number = 50
  ): Promise<ContentRevisionWithAuthor[]> {
    const { data, error } = await this.supabase
      .from("content_revisions")
      .select(
        `
        *,
        author:profiles(id, full_name, email)
      `
      )
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching revisions", error);
      return [];
    }

    return (data || []) as ContentRevisionWithAuthor[];
  }

  /**
   * Get a specific revision
   */
  async getRevision(
    contentType: RevisionContentType,
    contentId: string,
    version: number
  ): Promise<ContentRevision | null> {
    const { data, error } = await this.supabase
      .from("content_revisions")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .eq("version", version)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContentRevision;
  }

  /**
   * Get latest revision
   */
  async getLatestRevision(
    contentType: RevisionContentType,
    contentId: string
  ): Promise<ContentRevision | null> {
    const { data, error } = await this.supabase
      .from("content_revisions")
      .select("*")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version", { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data as ContentRevision;
  }

  /**
   * Compare two revisions
   */
  async compareRevisions(
    contentType: RevisionContentType,
    contentId: string,
    version1: number,
    version2: number
  ): Promise<{
    before: ContentRevision | null;
    after: ContentRevision | null;
  }> {
    const [before, after] = await Promise.all([
      this.getRevision(contentType, contentId, version1),
      this.getRevision(contentType, contentId, version2),
    ]);

    return { before, after };
  }

  /**
   * Get revision count
   */
  async getRevisionCount(
    contentType: RevisionContentType,
    contentId: string
  ): Promise<number> {
    const { count, error } = await this.supabase
      .from("content_revisions")
      .select("*", { count: "exact", head: true })
      .eq("content_type", contentType)
      .eq("content_id", contentId);

    if (error) {
      return 0;
    }

    return count || 0;
  }

  /**
   * Delete old revisions (keep N most recent)
   */
  async pruneRevisions(
    contentType: RevisionContentType,
    contentId: string,
    keepCount: number = 10
  ): Promise<number> {
    // Get versions to keep
    const { data: toKeep } = await this.supabase
      .from("content_revisions")
      .select("version")
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .order("version", { ascending: false })
      .limit(keepCount);

    if (!toKeep || toKeep.length < keepCount) {
      return 0; // Not enough revisions to prune
    }

    const minVersionToKeep = toKeep[toKeep.length - 1].version;

    const { error, count } = await this.supabase
      .from("content_revisions")
      .delete({ count: "exact" })
      .eq("content_type", contentType)
      .eq("content_id", contentId)
      .lt("version", minVersionToKeep);

    if (error) {
      logger.error("Error pruning revisions", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Get recent revisions across all content (admin dashboard)
   */
  async getRecentRevisions(
    limit: number = 20
  ): Promise<ContentRevisionWithAuthor[]> {
    const { data, error } = await this.supabase
      .from("content_revisions")
      .select(
        `
        *,
        author:profiles(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching recent revisions", error);
      return [];
    }

    return (data || []) as ContentRevisionWithAuthor[];
  }
}

/** Singleton instance */
export const contentRevisionsRepository = new ContentRevisionsRepository();
