import { createAdminRoute, createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { blogRepository } from '@/lib/db';
import { blogPostCreateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/blog
 * Returns published blog posts with filtering options
 * Query params: category, search, limit, offset, featured
 */
export const GET = createPublicRoute(async (request) => {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
  const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;
  const featured = searchParams.get('featured');

  // If requesting featured post
  if (featured === 'true') {
    const featuredPost = await blogRepository.getFeaturedPost();
    return successResponse({ post: featuredPost });
  }

  // Get published posts with filters
  const { posts, count } = await blogRepository.getPublishedPosts({
    category: category || undefined,
    search: search || undefined,
    limit,
    offset,
  });

  // Get all categories for the filter UI
  const categories = await blogRepository.getCategories();

  return successResponse({ posts, count, categories });
});

export const POST = createAdminRoute(async (request, _context, { userId }) => {
  // Validate request body
  const validation = await validateRequest(request, blogPostCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = await blogRepository.create({
    ...validation.data,
    author_id: userId,
  });

  return successResponse(data, 201);
});
