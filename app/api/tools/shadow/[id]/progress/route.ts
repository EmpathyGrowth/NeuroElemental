/**
 * Shadow Work API Routes - Update Progress
 * Update step and reflection for a shadow work session
 *
 * Requirements: 11.2
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
  notFoundError,
  forbiddenError,
} from "@/lib/api";
import { shadowSessionRepository } from "@/lib/db/shadow-sessions";
import { z } from "zod";

/**
 * Schema for updating session progress
 */
const updateProgressSchema = z.object({
  step: z.number().int().min(1).max(4),
  reflection: z.string().optional(),
});

/**
 * PATCH /api/tools/shadow/[id]/progress
 * Update step and reflection for a shadow work session
 * Requirements: 11.2
 */
export const PATCH = createAuthenticatedRoute<{ id: string }>(
  async (req, context, user) => {
    const { id } = await context.params;

    // First, verify the session exists
    const existingSession = await shadowSessionRepository.findByIdOrNull(id);

    if (!existingSession) {
      throw notFoundError("Shadow session");
    }

    // Verify ownership
    if (existingSession.user_id !== user.id) {
      throw forbiddenError("You can only update your own shadow sessions");
    }

    // Verify session is still in progress
    if (existingSession.status !== "in_progress") {
      throw forbiddenError("Cannot update a completed or abandoned session");
    }

    const validation = await validateRequest(req, updateProgressSchema);
    if (!validation.success) {
      throw validation.error;
    }

    const { step, reflection } = validation.data;

    // Update progress using repository
    const updatedSession = await shadowSessionRepository.updateProgress(
      id,
      step,
      reflection
    );

    return successResponse({
      message: "Session progress updated",
      session: {
        id: updatedSession.id,
        element: updatedSession.element,
        current_step: updatedSession.current_step,
        reflections: updatedSession.reflections,
        started_at: updatedSession.started_at,
        status: updatedSession.status,
      },
    });
  }
);
