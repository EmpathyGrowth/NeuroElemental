/**
 * Blog Post Duplication API
 * POST /api/blog/[id]/duplicate
 *
 * Creates a duplicate of the specified blog post with:
 * - "(Copy)" suffix appended to title
 * - Unique slug generated
 * - Status set to draft (is_published = false)
 *
 * Requirements: 16.1, 16.2, 16.3, 16.5
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { duplicateBlogPost } from "@/lib/content/duplication";

export const POST = createAdminRoute<{ id: string }>(
  async (_request, context, admin) => {
    const { id } = await context.params;

    const result = await duplicateBlogPost(id, admin.userId);

    if (!result.success) {
      throw new Error(result.error || "Failed to duplicate blog post");
    }

    return successResponse({
      message: "Blog post duplicated successfully",
      data: result.data,
    });
  }
);
