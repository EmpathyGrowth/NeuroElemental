/**
 * Shadow Work API Routes - Complete Session
 * Mark a shadow work session as complete
 *
 * Requirements: 11.4
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  forbiddenError,
} from "@/lib/api";
import { shadowSessionRepository } from "@/lib/db/shadow-sessions";

/**
 * POST /api/tools/shadow/[id]/complete
 * Mark a shadow work session as complete
 * Requirements: 11.4
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (_req, context, user) => {
    const { id } = await context.params;

    // First, verify the session exists
    const existingSession = await shadowSessionRepository.findByIdOrNull(id);

    if (!existingSession) {
      throw notFoundError("Shadow session");
    }

    // Verify ownership
    if (existingSession.user_id !== user.id) {
      throw forbiddenError("You can only complete your own shadow sessions");
    }

    // Verify session is still in progress
    if (existingSession.status !== "in_progress") {
      throw forbiddenError("Session is already completed or abandoned");
    }

    // Complete the session using repository
    const completedSession = await shadowSessionRepository.completeSession(id);

    // Get completed session count by element for badge tracking (Requirement 11.5)
    const completedByElement = await shadowSessionRepository.getCompletedByElement(user.id);

    return successResponse({
      message: "Shadow work session completed",
      session: {
        id: completedSession.id,
        element: completedSession.element,
        current_step: completedSession.current_step,
        reflections: completedSession.reflections,
        started_at: completedSession.started_at,
        completed_at: completedSession.completed_at,
        status: completedSession.status,
      },
      completedByElement,
    });
  }
);
