/**
 * Admin Revision Restore API
 * POST - Restore content from a revision
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { restoreRevision } from "@/lib/db/content-revisions";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/admin/revisions/restore/[id]
 * Restore content from a specific revision
 */
export const POST = createAdminRoute<RouteParams["params"]>(
  async (_request, context, { userId }) => {
    const { id } = await context.params;

    const result = await restoreRevision(id, userId);

    return successResponse({
      success: true,
      entityType: result.entityType,
      entityId: result.entityId,
      content: result.content,
      message: "Revision restored successfully",
    });
  }
);
