import {
  createAuthenticatedRoute,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { logsRepository } from "@/lib/db/logs";
import { z } from "zod";

/**
 * State log data structure
 */
export interface StateLog {
  id: string;
  created_at: string;
  element: string;
  mode: string;
  guidance_viewed?: string[];
}

/**
 * Mode distribution interface
 */
export interface ModeDistribution {
  biological: number;
  societal: number;
  passion: number;
  protection: number;
}

const stateSchema = z.object({
  element: z.string().min(1),
  mode: z.enum(["biological", "societal", "passion", "protection"]),
  guidance_viewed: z.array(z.string()).optional(),
});

/**
 * Calculate mode distribution from state logs
 * Returns percentages for each mode that sum to ~100%
 */
export function calculateModeDistribution(logs: StateLog[]): ModeDistribution {
  const defaultDistribution: ModeDistribution = {
    biological: 0,
    societal: 0,
    passion: 0,
    protection: 0,
  };

  if (logs.length === 0) {
    return defaultDistribution;
  }

  const modeCounts: Record<string, number> = {
    biological: 0,
    societal: 0,
    passion: 0,
    protection: 0,
  };

  logs.forEach((log) => {
    const mode = log.mode;
    if (mode in modeCounts) {
      modeCounts[mode] = (modeCounts[mode] || 0) + 1;
    }
  });

  // Convert to percentages
  const distribution: ModeDistribution = {
    biological: Math.round((modeCounts.biological / logs.length) * 100),
    societal: Math.round((modeCounts.societal / logs.length) * 100),
    passion: Math.round((modeCounts.passion / logs.length) * 100),
    protection: Math.round((modeCounts.protection / logs.length) * 100),
  };

  return distribution;
}

/**
 * POST /api/tools/state
 * Log current state identification
 * Requirements: 5.1
 */
export const POST = createAuthenticatedRoute(async (req, _context, user) => {
  const validation = await validateRequest(req, stateSchema);
  if (!validation.success) {
    throw validation.error;
  }

  // Save state log using repository
  const log = await logsRepository.createLog(
    "info",
    "State identified",
    {
      activity_type: "state_tracker",
      element: validation.data.element,
      mode: validation.data.mode,
      guidance_viewed: validation.data.guidance_viewed || [],
    },
    user.id
  );

  return successResponse({
    message: "State logged successfully",
    success: true,
    log: {
      id: log.id,
      created_at: log.timestamp,
      element: validation.data.element,
      mode: validation.data.mode,
      guidance_viewed: validation.data.guidance_viewed,
    },
  });
});

/**
 * GET /api/tools/state
 * Get user's state history and mode distribution
 * Requirements: 5.2, 5.3
 */
export const GET = createAuthenticatedRoute(async (req, _context, user) => {
  // Parse query params for limit
  const url = new URL(req.url);
  const limitParam = url.searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  // Get state logs from repository
  const allLogs = await logsRepository.getByUser(user.id, "info", limit * 2);

  // Filter to state tracker logs only
  const stateLogs: StateLog[] = allLogs
    .filter((log) => {
      const context = log.context as Record<string, unknown> | null;
      return context?.activity_type === "state_tracker";
    })
    .slice(0, limit)
    .map((log) => {
      const context = log.context as Record<string, unknown>;
      return {
        id: log.id,
        created_at: log.timestamp || log.id,
        element: (context?.element as string) || "",
        mode: (context?.mode as string) || "",
        guidance_viewed: (context?.guidance_viewed as string[]) || [],
      };
    });

  // Calculate mode distribution (Requirements 5.3)
  const distribution = calculateModeDistribution(stateLogs);

  return successResponse({
    logs: stateLogs,
    count: stateLogs.length,
    distribution,
    hasEnoughData: stateLogs.length >= 5, // For showing distribution chart
  });
});
