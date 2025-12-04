/**
 * Tool Analytics Log API
 * Logs tool interactions for analytics tracking
 *
 * Requirements: 8.1
 */

import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import {
  toolAnalyticsRepository,
  type ToolAction,
  type ToolName,
} from "@/lib/db/tool-analytics";
import { z } from "zod";

const VALID_TOOL_NAMES: ToolName[] = [
  "daily-checkin",
  "energy-budget",
  "state-tracker",
  "four-states",
  "regeneration-guide",
  "shadow-work",
  "quick-quiz",
];

const VALID_ACTIONS: ToolAction[] = ["view", "start", "complete", "interact"];

const logInteractionSchema = z.object({
  tool_name: z.enum(VALID_TOOL_NAMES as [ToolName, ...ToolName[]]),
  action: z.enum(VALID_ACTIONS as [ToolAction, ...ToolAction[]]),
  duration_seconds: z.number().int().min(0).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * POST /api/tools/analytics/log
 * Log a tool interaction
 * Requirements: 8.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, logInteractionSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { tool_name, action, duration_seconds, metadata } = validation.data;

  // Log the interaction using the repository
  await toolAnalyticsRepository.logInteraction({
    user_id: user.id,
    tool_name,
    action,
    duration_seconds,
    metadata,
  });

  return successResponse({
    message: "Interaction logged successfully",
    logged: true,
    tool_name,
    action,
  });
});
