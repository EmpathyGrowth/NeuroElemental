import { createAdminRoute, successResponse, validateRequest } from '@/lib/api';
import { blogRepository } from '@/lib/db';
import { blogPostPublishSchema } from '@/lib/validation/schemas';

export const PATCH = createAdminRoute<{ id: string }>(async (request, context) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, blogPostPublishSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = await blogRepository.toggleBlogPostPublish(id, validation.data.is_published);

  return successResponse(data);
});
