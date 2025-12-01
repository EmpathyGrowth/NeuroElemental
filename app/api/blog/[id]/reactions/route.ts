/**
 * Blog Post Reactions API
 * GET - Get reaction counts and user's reaction
 * POST - Toggle reaction on a post
 */

import {
  createAuthenticatedRoute,
  createPublicRoute,
  successResponse,
} from "@/lib/api";
import { blogReactionsRepository, ReactionType } from "@/lib/db/blog-reactions";
import { z } from "zod";

const reactionSchema = z.object({
  reaction_type: z
    .enum(["like", "love", "insightful", "helpful"])
    .default("like"),
});

/**
 * GET /api/blog/[id]/reactions
 * Get reaction counts for a blog post
 */
export const GET = createPublicRoute<{ id: string }>(
  async (request, context) => {
    const { id: postId } = await context.params;
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");

    const counts = await blogReactionsRepository.getPostReactionCounts(postId);

    let userReaction = null;
    if (userId) {
      userReaction = await blogReactionsRepository.getUserReaction(
        userId,
        postId
      );
    }

    return successResponse({ counts, userReaction });
  }
);

/**
 * POST /api/blog/[id]/reactions
 * Toggle reaction on a blog post
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id: postId } = await context.params;

    let reactionType: ReactionType = "like";
    try {
      const body = await request.json();
      const parsed = reactionSchema.safeParse(body);
      if (parsed.success) {
        reactionType = parsed.data.reaction_type;
      }
    } catch {
      // Default to like if no body
    }

    const result = await blogReactionsRepository.toggleReaction(
      user.id,
      postId,
      reactionType
    );

    return successResponse({
      ...result,
      message: result.reacted ? "Reaction added" : "Reaction removed",
    });
  }
);
