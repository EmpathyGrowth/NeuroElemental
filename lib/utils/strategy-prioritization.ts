/**
 * Strategy Prioritization Utilities
 *
 * Provides functions for prioritizing regeneration strategies based on
 * user's current operating mode.
 *
 * Requirements: 4.5, 5.4
 */

import type { RegenerationStrategy } from "@/lib/elements-data";

/**
 * Operating mode type
 */
export type OperatingMode = "biological" | "societal" | "passion" | "protection";

/**
 * Strategy category with priority
 */
export interface PrioritizedStrategy {
  category: "emergency" | "daily" | "weekly" | "active" | "passive" | "proactive";
  strategies: string[];
  priority: number;
}

/**
 * Get the priority order for strategy categories based on operating mode
 *
 * When in Protection Mode, emergency strategies should come first.
 * For other modes, daily strategies are prioritized.
 *
 * Requirements: 4.5, 5.4
 *
 * @param mode - Current operating mode
 * @returns Priority order (lower number = higher priority)
 */
export function getStrategyPriorityOrder(mode: OperatingMode): Record<string, number> {
  if (mode === "protection") {
    // Emergency strategies first when in Protection Mode
    return {
      emergency: 1,
      daily: 2,
      weekly: 3,
      active: 4,
      passive: 5,
      proactive: 6,
    };
  }

  // Default priority for other modes
  return {
    daily: 1,
    weekly: 2,
    emergency: 3,
    active: 4,
    passive: 5,
    proactive: 6,
  };
}

/**
 * Prioritize regeneration strategies based on current operating mode
 *
 * When user is in Protection Mode, emergency strategies are prioritized
 * at the top of the list. For other modes, daily strategies come first.
 *
 * Requirements: 4.5, 5.4
 *
 * @param strategies - Regeneration strategies object
 * @param mode - Current operating mode
 * @returns Array of prioritized strategy categories
 */
export function prioritizeStrategies(
  strategies: RegenerationStrategy,
  mode: OperatingMode
): PrioritizedStrategy[] {
  const priorityOrder = getStrategyPriorityOrder(mode);

  const categories: Array<{
    key: keyof RegenerationStrategy;
    category: PrioritizedStrategy["category"];
  }> = [
    { key: "emergency", category: "emergency" },
    { key: "daily", category: "daily" },
    { key: "weekly", category: "weekly" },
    { key: "active", category: "active" },
    { key: "passive", category: "passive" },
    { key: "proactive", category: "proactive" },
  ];

  const result: PrioritizedStrategy[] = categories
    .filter((cat) => strategies[cat.key] && strategies[cat.key].length > 0)
    .map((cat) => ({
      category: cat.category,
      strategies: strategies[cat.key],
      priority: priorityOrder[cat.category],
    }))
    .sort((a, b) => a.priority - b.priority);

  return result;
}

/**
 * Check if emergency strategies are prioritized first
 *
 * Returns true if emergency strategies appear before daily and weekly strategies.
 *
 * @param prioritizedStrategies - Array of prioritized strategies
 * @returns True if emergency strategies are first
 */
export function areEmergencyStrategiesFirst(
  prioritizedStrategies: PrioritizedStrategy[]
): boolean {
  const emergencyIndex = prioritizedStrategies.findIndex(
    (s) => s.category === "emergency"
  );
  const dailyIndex = prioritizedStrategies.findIndex(
    (s) => s.category === "daily"
  );
  const weeklyIndex = prioritizedStrategies.findIndex(
    (s) => s.category === "weekly"
  );

  // If no emergency strategies, return false
  if (emergencyIndex === -1) {
    return false;
  }

  // Emergency should come before daily and weekly
  const beforeDaily = dailyIndex === -1 || emergencyIndex < dailyIndex;
  const beforeWeekly = weeklyIndex === -1 || emergencyIndex < weeklyIndex;

  return beforeDaily && beforeWeekly;
}
