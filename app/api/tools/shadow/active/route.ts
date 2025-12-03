/**
 * Shadow Work API Routes - Get Active Session
 * Return active session for resume prompt
 *
 * Requirements: 11.3
 */

import {
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { shadowSessionRepository } from "@/lib/db/shadow-sessions";

/**
 * POST /api/tools/shadow/active
 * Get active (in_progress) session for resume prompt
 * Only returns sessions started within the last 7 days
 * Requirements: 11.3
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  // Get active session using repository
  // Repository already filters for sessions < 7 days old
  const activeSession = await shadowSessionRepository.getActiveSession(user.id);

  if (!activeSession) {
    return successResponse({
      hasActiveSession: false,
      session: null,
    });
  }

  return successResponse({
    hasActiveSession: true,
    session: {
      id: activeSession.id,
      element: activeSession.element,
      current_step: activeSession.current_step,
      reflections: activeSession.reflections,
      started_at: activeSession.started_at,
      status: activeSession.status,
    },
  });
});
