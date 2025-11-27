/**
 * Events API - Individual Event Operations
 * Admin-only routes for updating and deleting events
 */

import { createAdminRoute, successResponse, validateRequest, notFoundError } from '@/lib/api';
import { cacheManager } from '@/lib/cache/cache-manager';
import { eventRepository } from '@/lib/db';
import { eventUpdateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/events/[id]
 * Get a single event by ID (admin only)
 */
export const GET = createAdminRoute<{ id: string }>(async (_request, context, _user) => {
  const { id } = await context.params;

  const event = await eventRepository.findById(id);
  if (!event) {
    throw notFoundError('Event');
  }

  return successResponse(event);
});

export const PATCH = createAdminRoute<{ id: string }>(async (request, context, _user) => {
  const { id } = await context.params;

  // Validate request body
  const validation = await validateRequest(request, eventUpdateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const event = await eventRepository.update(id, validation.data);

  // Invalidate events cache
  await cacheManager.clear('events');

  return successResponse(event);
});

export const DELETE = createAdminRoute<{ id: string }>(async (_request, context, _user) => {
  const { id } = await context.params;
  await eventRepository.delete(id);

  // Invalidate events cache
  await cacheManager.clear('events');

  return successResponse({ success: true, message: 'Event deleted successfully' });
});
