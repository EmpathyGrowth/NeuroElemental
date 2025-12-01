/**
 * Blog Post View Tracking API
 * POST - Increment view count for a post
 */

import { createPublicRoute, successResponse } from "@/lib/api";
import { blogRepository } from "@/lib/db";

/**
 * POST /api/blog/[id]/view
 * Increment view count for a blog post
 */
export const POST = createPublicRoute<{ id: string }>(
  async (_request, context) => {
    const { id: postId } = await context.params;

    await blogRepository.incrementViewCount(postId);

    return successResponse({ message: "View recorded" });
  }
);
