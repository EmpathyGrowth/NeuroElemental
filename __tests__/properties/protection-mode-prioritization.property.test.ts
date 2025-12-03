/**
 * Property-Based Tests for Protection Mode Strategy Prioritization
 *
 * Feature: tools-completion-and-platform-consolidation
 * Property 10: Protection Mode Strategy Prioritization
 * Validates: Requirements 4.5, 5.4
 *
 * These tests verify that when a user is in Protection Mode,
 * emergency regeneration strategies are prioritized before
 * daily and weekly strategies.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  prioritizeStrategies,
  areEmergencyStrategiesFirst,
  getStrategyPriorityOrder,
  type OperatingMode,
  type PrioritizedStrategy,
} from "@/lib/utils/strategy-prioritization";
import type { RegenerationStrategy } from "@/lib/elements-data";

/**
 * Arbitrary generators for strategy data
 */
const operatingModeArb: fc.Arbitrary<OperatingMode> = fc.constantFrom(
  "biological",
  "societal",
  "passion",
  "protection"
);

const nonProtectionModeArb: fc.Arbitrary<OperatingMode> = fc.constantFrom(
  "biological",
  "societal",
  "passion"
);

const strategyListArb = fc.array(
  fc.string({ minLength: 5, maxLength: 100 }),
  { minLength: 1, maxLength: 5 }
);

const regenerationStrategyArb: fc.Arbitrary<RegenerationStrategy> = fc.record({
  daily: strategyListArb,
  weekly: strategyListArb,
  emergency: strategyListArb,
  active: strategyListArb,
  passive: strategyListArb,
  proactive: strategyListArb,
});

describe("Protection Mode Strategy Prioritization Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 10: Protection Mode Strategy Prioritization
   * Validates: Requirements 4.5, 5.4
   *
   * For any user whose most recent check-in has state "protection",
   * emergency regeneration strategies should appear before daily and weekly strategies.
   */
  it("Property 10: Protection Mode Strategy Prioritization - emergency strategies appear first in Protection Mode", async () => {
    await fc.assert(
      fc.asyncProperty(
        regenerationStrategyArb,
        async (strategies) => {
          // When in Protection Mode
          const prioritized = prioritizeStrategies(strategies, "protection");

          // Property: Emergency strategies should be first
          const emergencyFirst = areEmergencyStrategiesFirst(prioritized);
          expect(emergencyFirst).toBe(true);

          // Additional verification: emergency should have priority 1
          const emergencyCategory = prioritized.find(
            (s) => s.category === "emergency"
          );
          if (emergencyCategory) {
            expect(emergencyCategory.priority).toBe(1);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: In non-protection modes, daily strategies should come before emergency
   */
  it("Property 10b: Non-Protection Mode - daily strategies appear before emergency", async () => {
    await fc.assert(
      fc.asyncProperty(
        regenerationStrategyArb,
        nonProtectionModeArb,
        async (strategies, mode) => {
          const prioritized = prioritizeStrategies(strategies, mode);

          // Find indices
          const dailyIndex = prioritized.findIndex(
            (s) => s.category === "daily"
          );
          const emergencyIndex = prioritized.findIndex(
            (s) => s.category === "emergency"
          );

          // Property: Daily should come before emergency in non-protection modes
          if (dailyIndex !== -1 && emergencyIndex !== -1) {
            expect(dailyIndex).toBeLessThan(emergencyIndex);
          }

          // Daily should have priority 1 in non-protection modes
          const dailyCategory = prioritized.find((s) => s.category === "daily");
          if (dailyCategory) {
            expect(dailyCategory.priority).toBe(1);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Priority order is consistent for Protection Mode
   */
  it("Property 10c: Protection Mode priority order is consistent", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 1000 }), // run multiple times
        async () => {
          const priorityOrder = getStrategyPriorityOrder("protection");

          // Property: Emergency should always have lowest priority number (highest priority)
          expect(priorityOrder.emergency).toBe(1);
          expect(priorityOrder.daily).toBe(2);
          expect(priorityOrder.weekly).toBe(3);

          // Emergency should be less than all others
          expect(priorityOrder.emergency).toBeLessThan(priorityOrder.daily);
          expect(priorityOrder.emergency).toBeLessThan(priorityOrder.weekly);
          expect(priorityOrder.emergency).toBeLessThan(priorityOrder.active);
          expect(priorityOrder.emergency).toBeLessThan(priorityOrder.passive);
          expect(priorityOrder.emergency).toBeLessThan(priorityOrder.proactive);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Prioritized strategies maintain all original strategies
   */
  it("Property 10d: Prioritization preserves all strategies", async () => {
    await fc.assert(
      fc.asyncProperty(
        regenerationStrategyArb,
        operatingModeArb,
        async (strategies, mode) => {
          const prioritized = prioritizeStrategies(strategies, mode);

          // Count total strategies in input
          const inputCount =
            strategies.daily.length +
            strategies.weekly.length +
            strategies.emergency.length +
            strategies.active.length +
            strategies.passive.length +
            strategies.proactive.length;

          // Count total strategies in output
          const outputCount = prioritized.reduce(
            (sum, cat) => sum + cat.strategies.length,
            0
          );

          // Property: All strategies should be preserved
          expect(outputCount).toBe(inputCount);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Prioritized strategies are sorted by priority
   */
  it("Property 10e: Prioritized strategies are sorted by priority number", async () => {
    await fc.assert(
      fc.asyncProperty(
        regenerationStrategyArb,
        operatingModeArb,
        async (strategies, mode) => {
          const prioritized = prioritizeStrategies(strategies, mode);

          // Property: Each subsequent item should have >= priority number
          for (let i = 1; i < prioritized.length; i++) {
            expect(prioritized[i].priority).toBeGreaterThanOrEqual(
              prioritized[i - 1].priority
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Empty strategies are handled correctly
   */
  it("Property 10f: Empty strategy categories are excluded from output", async () => {
    await fc.assert(
      fc.asyncProperty(
        operatingModeArb,
        async (mode) => {
          // Create strategies with some empty categories
          const strategies: RegenerationStrategy = {
            daily: ["Daily strategy 1"],
            weekly: [],
            emergency: ["Emergency strategy 1"],
            active: [],
            passive: ["Passive strategy 1"],
            proactive: [],
          };

          const prioritized = prioritizeStrategies(strategies, mode);

          // Property: No empty categories in output
          for (const cat of prioritized) {
            expect(cat.strategies.length).toBeGreaterThan(0);
          }

          // Property: Only non-empty categories should be present
          const categories = prioritized.map((p) => p.category);
          expect(categories).not.toContain("weekly");
          expect(categories).not.toContain("active");
          expect(categories).not.toContain("proactive");

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
