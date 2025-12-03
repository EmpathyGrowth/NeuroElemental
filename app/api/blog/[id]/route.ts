import { createAdminRoute, createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { blogRepository } from '@/lib/db';
import { createRevision, compareRevisions } from '@/lib/db/content-revisions';
import { blogPostUpdateSchema } from '@/lib/validation/schemas';
import { logger } from '@/lib/logging';

export const GET = createPublicRoute<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;

  const data = await blogRepository.getBlogPostWithAuthor(id);

  return successResponse(data);
});

export const PATCH = createAdminRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, blogPostUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Get current content before update for revision tracking
  const currentPost = await blogRepository.findById(id);
  
  // Update the blog post
  const data = await blogRepository.update(id, validation.data);

  // Create revision after successful update (non-blocking)
  if (currentPost && user?.id) {
    const oldContent = currentPost as Record<string, unknown>;
    const newContent = data as Record<string, unknown>;
    const changedFields = compareRevisions(oldContent, newContent);
    
    // Only create revision if there are actual changes
    if (changedFields.length > 0) {
      createRevision('blog_post', id, newContent, user.id, changedFields).catch((err) => {
        logger.warn('Failed to create blog post revision', err);
      });
    }
  }

  return successResponse(data);
});

export const DELETE = createAdminRoute<{ id: string }>(async (_request, context, _user) => {
  const { id } = await context.params;

  await blogRepository.delete(id);

  return successResponse({ success: true, message: 'Blog post deleted successfully' });
});
