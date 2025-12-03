/**
 * Content Revisions Repository
 * Manages revision history for CMS content types
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

export interface ContentRevision {
  id: string;
  content_type: string;
  content_id: string;
  version: number;
  data: Record<string, unknown>;
  change_summary: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RevisionWithUser extends ContentRevision {
  user?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

// Alias for backward compatibility
export type EntityType = string;
export type EntityId = string;

// ============================================================================
// Revision Service Functions
// ============================================================================

const MAX_REVISIONS = 50;

/**
 * Create a new revision for an entity
 */
export async function createRevision(
  entityType: string,
  entityId: string,
  content: Record<string, unknown>,
  userId: string,
  changeSummary?: string
): Promise<ContentRevision> {
  const supabase = await createClient();

  // Get the next version number
  const { count } = await supabase
    .from("content_revisions")
    .select("*", { count: "exact", head: true })
    .eq("content_type", entityType)
    .eq("content_id", entityId);

  const nextVersion = (count || 0) + 1;

  const { data, error } = await supabase
    .from("content_revisions")
    .insert({
      content_type: entityType,
      content_id: entityId,
      version: nextVersion,
      data: content,
      change_summary: changeSummary || null,
      created_by: userId,
    })
    .select()
    .single();

  if (error || !data) {
    logger.error(
      "Error creating revision",
      error instanceof Error ? error : new Error(String(error))
    );
    // Don't throw - revision creation is non-critical
    // Return a placeholder revision
    return {
      id: "error",
      content_type: entityType,
      content_id: entityId,
      version: nextVersion,
      data: content,
      change_summary: changeSummary || null,
      created_by: userId,
      created_at: new Date().toISOString(),
    };
  }

  // Archive old revisions in the background
  archiveOldRevisions(entityType, entityId).catch((err) => {
    logger.warn("Failed to archive old revisions", err);
  });

  return data as ContentRevision;
}


/**
 * Get revisions for an entity
 */
export async function getRevisions(
  entityType: string,
  entityId: string,
  limit: number = MAX_REVISIONS
): Promise<RevisionWithUser[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_revisions")
    .select(`
      *,
      user:profiles!created_by(full_name, avatar_url)
    `)
    .eq("content_type", entityType)
    .eq("content_id", entityId)
    .order("version", { ascending: false })
    .limit(limit);

  if (error) {
    logger.error(
      "Error fetching revisions",
      error instanceof Error ? error : new Error(String(error))
    );
    throw internalError("Failed to fetch revisions");
  }

  return (data || []) as RevisionWithUser[];
}

/**
 * Get a single revision by ID
 */
export async function getRevisionById(
  revisionId: string
): Promise<RevisionWithUser | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("content_revisions")
    .select(`
      *,
      user:profiles!created_by(full_name, avatar_url)
    `)
    .eq("id", revisionId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    logger.error(
      "Error fetching revision",
      error instanceof Error ? error : new Error(String(error))
    );
    throw internalError("Failed to fetch revision");
  }

  return data as RevisionWithUser;
}

/**
 * Restore content from a revision
 * Returns the content snapshot to be applied by the caller
 */
export async function restoreRevision(
  revisionId: string,
  userId: string
): Promise<{ entityType: string; entityId: string; content: Record<string, unknown> }> {
  const revision = await getRevisionById(revisionId);

  if (!revision) {
    throw internalError("Revision not found");
  }

  // Create a new revision documenting the restore
  await createRevision(
    revision.content_type,
    revision.content_id,
    revision.data,
    userId,
    `Restored from version ${revision.version}`
  );

  return {
    entityType: revision.content_type,
    entityId: revision.content_id,
    content: revision.data,
  };
}

/**
 * Archive old revisions beyond the limit
 */
export async function archiveOldRevisions(
  entityType: string,
  entityId: string
): Promise<number> {
  const supabase = await createClient();

  // Get all revision IDs for this entity, ordered by version
  const { data: revisions, error: fetchError } = await supabase
    .from("content_revisions")
    .select("id")
    .eq("content_type", entityType)
    .eq("content_id", entityId)
    .order("version", { ascending: false });

  if (fetchError || !revisions) {
    logger.error(
      "Error fetching revisions for archival",
      fetchError instanceof Error ? fetchError : new Error(String(fetchError))
    );
    return 0;
  }

  // If we have more than MAX_REVISIONS, delete the oldest ones
  if (revisions.length <= MAX_REVISIONS) {
    return 0;
  }

  const idsToDelete = revisions.slice(MAX_REVISIONS).map((r) => r.id);

  const { error: deleteError } = await supabase
    .from("content_revisions")
    .delete()
    .in("id", idsToDelete);

  if (deleteError) {
    logger.error(
      "Error archiving old revisions",
      deleteError instanceof Error ? deleteError : new Error(String(deleteError))
    );
    return 0;
  }

  return idsToDelete.length;
}

/**
 * Compare two revisions and return changed fields
 */
export function compareRevisions(
  oldContent: Record<string, unknown>,
  newContent: Record<string, unknown>
): string[] {
  const changedFields: string[] = [];
  const allKeys = new Set([...Object.keys(oldContent), ...Object.keys(newContent)]);

  for (const key of allKeys) {
    const oldValue = JSON.stringify(oldContent[key]);
    const newValue = JSON.stringify(newContent[key]);
    if (oldValue !== newValue) {
      changedFields.push(key);
    }
  }

  return changedFields;
}

/**
 * Get revision count for an entity
 */
export async function getRevisionCount(
  entityType: string,
  entityId: string
): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("content_revisions")
    .select("*", { count: "exact", head: true })
    .eq("content_type", entityType)
    .eq("content_id", entityId);

  if (error) {
    logger.error(
      "Error counting revisions",
      error instanceof Error ? error : new Error(String(error))
    );
    return 0;
  }

  return count || 0;
}


// ============================================================================
// Legacy Exports for Compatibility
// ============================================================================

export type RevisionContentType = 
  | "site_content"
  | "email_template"
  | "faq"
  | "footer_content"
  | "blog_post"
  | "navigation";

export type ContentRevisionWithAuthor = RevisionWithUser;

/**
 * Content Revisions Repository Class
 * Provides a class-based interface for revision operations
 */
export class ContentRevisionsRepository {
  async createRevision(
    contentType: RevisionContentType,
    contentId: string,
    content: Record<string, unknown>,
    userId: string,
    changeSummary?: string
  ): Promise<ContentRevision> {
    return createRevision(contentType, contentId, content, userId, changeSummary);
  }

  async getRevisions(
    contentType: RevisionContentType,
    contentId: string,
    limit?: number
  ): Promise<RevisionWithUser[]> {
    return getRevisions(contentType, contentId, limit);
  }

  async getRevision(
    contentType: RevisionContentType,
    contentId: string,
    version: number
  ): Promise<RevisionWithUser | null> {
    const revisions = await getRevisions(contentType, contentId);
    return revisions[version - 1] || null;
  }

  async getRevisionCount(
    contentType: RevisionContentType,
    contentId: string
  ): Promise<number> {
    return getRevisionCount(contentType, contentId);
  }

  async getRecentRevisions(limit: number = 50): Promise<RevisionWithUser[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("content_revisions")
      .select(`
        *,
        user:profiles!created_by(full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error(
        "Error fetching recent revisions",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return (data || []) as RevisionWithUser[];
  }

  async restoreRevision(revisionId: string, userId: string) {
    return restoreRevision(revisionId, userId);
  }
}

export const contentRevisionsRepository = new ContentRevisionsRepository();
