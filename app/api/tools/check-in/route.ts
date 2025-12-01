import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { logsRepository } from "@/lib/db/logs";
import { z } from "zod";

const checkInSchema = z.object({
  element: z.string().min(1),
  energy_level: z.number().int().min(1).max(5),
  current_state: z.enum(["biological", "societal", "passion", "protection"]),
  reflection: z.string().optional(),
  gratitude: z.string().optional(),
  intention: z.string().optional(),
});

/**
 * POST /api/tools/check-in
 * Save daily energy check-in
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, checkInSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Save check-in using repository
  await logsRepository.saveCheckIn(user.id, validation.data);

  return successResponse({
    message: "Check-in saved successfully",
    saved: true,
  });
});

/**
 * GET /api/tools/check-in
 * Get user's check-in history
 */
export const GET = createAuthenticatedRoute(async (_req, _context, user) => {
  const checkIns = await logsRepository.getUserCheckIns(user.id, 30);

  return successResponse({
    checkIns,
    count: checkIns.length,
  });
});
