/**
 * Admin Tool Analytics API
 * Returns aggregated tool usage statistics for admin dashboard
 *
 * Requirements: 8.2, 8.3, 8.4, 8.5
 */

import {
  createAdminRoute,
  successResponse,
  validateQuery,
} from "@/lib/api";
import {
  toolAnalyticsRepository,
  type DateRange,
  type ToolStats,
} from "@/lib/db/tool-analytics";
import { z } from "zod";

const querySchema = z.object({
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

/**
 * Calculate trend indicator comparing current period to previous period
 */
function calculateTrend(
  currentStats: ToolStats[],
  previousStats: ToolStats[]
): Record<string, { change: number; direction: "up" | "down" | "stable" }> {
  const trends: Record<string, { change: number; direction: "up" | "down" | "stable" }> = {};

  for (const current of currentStats) {
    const previous = previousStats.find((p) => p.toolName === current.toolName);
    const previousTotal = previous?.totalInteractions || 0;
    const currentTotal = current.totalInteractions;

    let change = 0;
    let direction: "up" | "down" | "stable" = "stable";

    if (previousTotal > 0) {
      change = Math.round(((currentTotal - previousTotal) / previousTotal) * 100);
      direction = change > 0 ? "up" : change < 0 ? "down" : "stable";
    } else if (currentTotal > 0) {
      change = 100;
      direction = "up";
    }

    trends[current.toolName] = { change: Math.abs(change), direction };
  }

  return trends;
}

/**
 * GET /api/admin/analytics/tools
 * Get aggregated tool statistics (admin only)
 * Requirements: 8.2, 8.3, 8.4, 8.5
 */
export const GET = createAdminRoute(async (req, _context, _admin) => {
  const validation = await validateQuery(req, querySchema);
  if (!validation.success) {
    throw validation.error;
  }

  const { start_date, end_date } = validation.data;

  // Build date range if provided
  let dateRange: DateRange | undefined;
  let previousDateRange: DateRange | undefined;

  if (start_date && end_date) {
    dateRange = {
      start: start_date,
      end: end_date,
    };

    // Calculate previous period for comparison (Requirements 8.5)
    const startMs = new Date(start_date).getTime();
    const endMs = new Date(end_date).getTime();
    const periodLength = endMs - startMs;

    previousDateRange = {
      start: new Date(startMs - periodLength).toISOString(),
      end: new Date(startMs).toISOString(),
    };
  }

  // Get all tool statistics (Requirements 8.2)
  const toolStats = await toolAnalyticsRepository.getAllToolStats(dateRange);

  // Get active users per period for each tool (Requirements 8.4)
  const activeUsersPromises = toolStats.map(async (stat) => ({
    toolName: stat.toolName,
    daily: await toolAnalyticsRepository.getActiveUsers(stat.toolName, "day"),
    weekly: await toolAnalyticsRepository.getActiveUsers(stat.toolName, "week"),
    monthly: await toolAnalyticsRepository.getActiveUsers(stat.toolName, "month"),
  }));

  const activeUsers = await Promise.all(activeUsersPromises);

  // Calculate trends if date range provided (Requirements 8.5)
  let trends: Record<string, { change: number; direction: "up" | "down" | "stable" }> = {};
  if (previousDateRange) {
    const previousStats = await toolAnalyticsRepository.getAllToolStats(previousDateRange);
    trends = calculateTrend(toolStats, previousStats);
  }

  // Calculate aggregate statistics
  const totalInteractions = toolStats.reduce((sum, s) => sum + s.totalInteractions, 0);
  const totalUniqueUsers = new Set(
    toolStats.flatMap((s) => Array(s.uniqueUsers).fill(s.toolName))
  ).size;

  // Get completion rates for multi-step tools (Requirements 8.3)
  const multiStepTools = ["daily-checkin", "shadow-work"];
  const completionRates: Record<string, number> = {};
  for (const tool of multiStepTools) {
    const stat = toolStats.find((s) => s.toolName === tool);
    completionRates[tool] = stat?.completionRate || 0;
  }

  return successResponse({
    summary: {
      totalInteractions,
      totalUniqueUsers,
      dateRange: dateRange || { start: "all-time", end: "all-time" },
    },
    tools: toolStats.map((stat) => {
      const userStats = activeUsers.find((u) => u.toolName === stat.toolName);
      return {
        ...stat,
        activeUsers: {
          daily: userStats?.daily || 0,
          weekly: userStats?.weekly || 0,
          monthly: userStats?.monthly || 0,
        },
        trend: trends[stat.toolName] || { change: 0, direction: "stable" },
      };
    }),
    completionRates,
  });
});
