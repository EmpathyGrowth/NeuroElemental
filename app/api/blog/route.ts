import { createAdminRoute, createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { blogRepository } from '@/lib/db';
import { blogPostCreateSchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute(async () => {
  const { posts } = await blogRepository.getAllBlogPosts();
  return successResponse(posts);
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
