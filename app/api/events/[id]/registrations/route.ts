/**
 * Event Registrations API Routes
 * GET /api/events/[id]/registrations - Get all registrations for an event
 * PATCH /api/events/[id]/registrations - Update registration (mark attendance)
 */

import { RouteContext } from '@/lib/types/api';
import {
  createAdminRoute,
  successResponse,
  notFoundError,
  validateRequest,
} from '@/lib/api';
import { eventRepository } from '@/lib/db/events';
import { eventRegistrationRepository } from '@/lib/db/event-registrations';
import { z } from 'zod';

type EventParams = { id: string };

const updateAttendanceSchema = z.object({
  registration_id: z.string().min(1, 'Registration ID is required'),
  attended: z.boolean(),
});

/**
 * GET /api/events/[id]/registrations
 * Get all registrations for an event (admin only)
 */
export const GET = createAdminRoute<EventParams>(
  async (_request, context: RouteContext<EventParams>) => {
    const { id } = await context.params;

    // Verify event exists
    const event = await eventRepository.findById(id);

    if (!event) {
      throw notFoundError('Event');
    }

    // Get registrations with user profiles using repository
    const registrations = await eventRegistrationRepository.getByEventWithUsers(id);

    // Get registration statistics
    const stats = await eventRegistrationRepository.getStats(id, event.capacity);

    return successResponse({
      event: {
        id: event.id,
        title: event.title,
        capacity: event.capacity,
        start_datetime: event.start_datetime,
      },
      registrations,
      stats,
    });
  }
);

/**
 * PATCH /api/events/[id]/registrations
 * Update registrations (mark attendance) (admin only)
 */
export const PATCH = createAdminRoute<EventParams>(
  async (request, context: RouteContext<EventParams>) => {
    const { id } = await context.params;

    // Validate request body
    const validation = await validateRequest(request, updateAttendanceSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { registration_id, attended } = validation.data;

    // Update attendance status using repository
    await eventRegistrationRepository.updateAttendance(registration_id, id, attended);

    return successResponse({
      success: true,
      message: 'Registration updated',
    });
  }
);
