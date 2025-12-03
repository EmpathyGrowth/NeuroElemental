/**
 * Shadow Work API Routes - Start Session
 * Create a new shadow work session
 *
 * Requirements: 11.1
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { shadowSessionRepository, type ElementType } from "@/lib/db/shadow-sessions";
import { z } from "zod";

/**
 * Schema for starting a shadow work session
 */
const startSessionSchema = z.object({
  element: z.enum(["electric", "fiery", "aquatic", "earthly", "airy", "metallic"]),
});

/**
 * POST /api/tools/shadow/start
 * Create a new shadow work session
 * Requirements: 11.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, startSessionSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { element } = validation.data;

  // Create new session using repository
  const session = await shadowSessionRepository.createSession(
    user.id,
    element as ElementType
  );

  return successResponse({
    message: "Shadow work session started",
    session: {
      id: session.id,
      element: session.element,
      current_step: session.current_step,
      reflections: session.reflections,
      started_at: session.started_at,
      status: session.status,
    },
  });
});
