import { createAdminRoute, successResponse, validateRequest } from '@/lib/api';
import { moduleRepository } from '@/lib/db/modules';
import { moduleUpdateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/modules/[id]
 * Get a single module by ID
 */
export const GET = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;

  const module = await moduleRepository.findById(params.id);

  return successResponse({ module });
});

/**
 * PUT /api/modules/[id]
 * Update a module
 */
export const PUT = createAdminRoute<{ id: string }>(async (request, context) => {
  const params = await context.params;

  // Validate request body
  const validation = await validateRequest(request, moduleUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const module = await moduleRepository.updateModule(params.id, validation.data);

  return successResponse({ module });
});

/**
 * DELETE /api/modules/[id]
 * Delete a module and all its lessons
 */
export const DELETE = createAdminRoute<{ id: string }>(async (_request, context) => {
  const params = await context.params;

  // Delete module using repository (will cascade to lessons via FK)
  await moduleRepository.deleteModule(params.id);

  return successResponse({ deleted: true });
});
