import { createPublicRoute, notFoundError, successResponse } from '@/lib/api';
import { blogRepository } from '@/lib/db';

/**
 * GET /api/blog/slug/[slug]
 * Returns a published blog post by slug with author information
 */
export const GET = createPublicRoute<{ slug: string }>(async (request, context) => {
  const { slug } = await context.params;

  const post = await blogRepository.getPublishedBlogPostBySlug(slug);

  if (!post) {
    throw notFoundError('Blog post');
  }

  // Get related posts from the same category
  const relatedPosts = await blogRepository.getRelatedPosts(slug, post.category || '', 3);

  return successResponse({ post, relatedPosts });
});
