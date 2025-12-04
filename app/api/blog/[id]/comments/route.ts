/**
 * Blog Post Comments API
 * GET - Get comments for a post
 * POST - Create a comment on a post
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  createPublicRoute,
  successResponse,
} from "@/lib/api";
import { blogCommentsRepository } from "@/lib/db/blog-comments";
import { z } from "zod";

const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment is required")
    .max(5000, "Comment too long"),
  parent_id: z.string().uuid().optional(),
});

/**
 * GET /api/blog/[id]/comments
 * Get all comments for a blog post (threaded)
 */
export const GET = createPublicRoute<{ id: string }>(
  async (_request, context) => {
    const { id: postId } = await context.params;

    const comments =
      await blogCommentsRepository.getPostCommentsThreaded(postId);
    const count = await blogCommentsRepository.getPostCommentCount(postId);

    return successResponse({ comments, count });
  }
);

/**
 * POST /api/blog/[id]/comments
 * Create a new comment on a blog post
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: postId } = await context.params;
    const body = await request.json();

    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid comment"
      );
    }

    const comment = await blogCommentsRepository.createComment(
      postId,
      user.id,
      parsed.data.content,
      parsed.data.parent_id
    );

    return successResponse({ comment, message: "Comment posted" }, 201);
  }
);
