import { createAdminRoute, createPublicRoute, successResponse, validateRequest, notFoundError } from '@/lib/api';
import { courseRepository } from '@/lib/db';
import { courseUpdateSchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute<{ id: string }>(async (_request, context) => {
  const { id } = await context.params;
  const course = await courseRepository.findById(id);

  if (!course) {
    throw notFoundError('Course');
  }

  return successResponse({ course });
});

export const PUT = createAdminRoute<{ id: string }>(async (request, context, _user) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, courseUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = await courseRepository.update(id, validation.data);

  return successResponse(data);
});

export const PATCH = createAdminRoute<{ id: string }>(async (request, context, _user) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, courseUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = await courseRepository.update(id, validation.data);

  return successResponse(data);
});

export const DELETE = createAdminRoute<{ id: string }>(async (_request, context, _user) => {
  const { id } = await context.params;
  await courseRepository.delete(id);

  return successResponse({ success: true, message: 'Course deleted successfully' });
});
