import { createAdminRoute, createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { blogRepository } from '@/lib/db';
import { blogPostUpdateSchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;

  const data = await blogRepository.getBlogPostWithAuthor(id);

  return successResponse(data);
});

export const PATCH = createAdminRoute<{ id: string }>(async (request, context, _user) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, blogPostUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = await blogRepository.update(id, validation.data);

  return successResponse(data);
});

export const DELETE = createAdminRoute<{ id: string }>(async (_request, context, _user) => {
  const { id } = await context.params;

  await blogRepository.delete(id);

  return successResponse({ success: true, message: 'Blog post deleted successfully' });
});
