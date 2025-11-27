/**
 * Events API - Refactored with Factory Pattern
 * Public event listing and admin event creation
 */

import { createAdminRoute, createPublicRoute, successResponse, validateRequest } from '@/lib/api';
import { cacheKeys, cacheManager } from '@/lib/cache/cache-manager';
import { eventRepository } from '@/lib/db';
import { eventCreateSchema } from '@/lib/validation/schemas';

// Cache events for 5 minutes (public content)
const EVENTS_CACHE_TTL = 300;

export const GET = createPublicRoute(async () => {
  // Try to get from cache first
  const events = await cacheManager.memoize(
    cacheKeys.eventList(),
    async () => await eventRepository.getAllEventsWithInstructor(),
    { ttl: EVENTS_CACHE_TTL, namespace: 'events' }
  );

  return successResponse(events);
});

export const POST = createAdminRoute(async (request, _context, { userId }) => {
  // Validate request body
  const validation = await validateRequest(request, eventCreateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const event = await eventRepository.create({
    ...validation.data,
    created_by: userId,
  });

  // Invalidate events cache
  await cacheManager.clear('events');

  return successResponse(event, 201);
});
