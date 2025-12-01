import { createAdminRoute, successResponse, validateRequest } from '@/lib/api';
import { lessonRepository } from '@/lib/db/lessons';
import { lessonUpdateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/lessons/[id]
 * Get a single lesson by ID
 */
export const GET = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;

  const lesson = await lessonRepository.findById(params.id);

  return successResponse({ lesson });
});

/**
 * PUT /api/lessons/[id]
 * Update a lesson
 */
export const PUT = createAdminRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;

  // Validate request body
  const validation = await validateRequest(request, lessonUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Map video_url to content_url if provided
  const updateData: Record<string, unknown> = { ...validation.data };
  if (validation.data.video_url) {
    updateData.content_url = validation.data.video_url;
    delete updateData.video_url;
  }

  const lesson = await lessonRepository.updateLesson(params.id, updateData);

  return successResponse({ lesson });
});

/**
 * DELETE /api/lessons/[id]
 * Delete a lesson
 */
export const DELETE = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;

  await lessonRepository.deleteLesson(params.id);

  return successResponse({ deleted: true });
});
