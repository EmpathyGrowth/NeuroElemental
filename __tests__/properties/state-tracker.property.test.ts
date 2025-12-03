/**
 * Property-Based Tests for State Tracker Functionality
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for state tracker operations
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  calculateModeDistribution,
  type StateLog,
  type ModeDistribution,
} from "@/app/api/tools/state/route";

/**
 * Arbitrary generators for state tracker data
 */
const elementArb = fc.constantFrom(
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic"
);

const operatingModeArb = fc.constantFrom(
  "biological",
  "societal",
  "passion",
  "protection"
);

// Use timestamp-based date generation to avoid invalid date issues
const timestampArb = fc
  .integer({
    min: new Date("2020-01-01").getTime(),
    max: new Date("2030-12-31").getTime(),
  })
  .map((ts) => new Date(ts).toISOString());

const stateLogArb: fc.Arbitrary<StateLog> = fc.record({
  id: fc.uuid(),
  created_at: timestampArb,
  element: elementArb,
  mode: operatingModeArb,
  guidance_viewed: fc.option(fc.array(fc.string(), { maxLength: 5 }), {
    nil: undefined,
  }),
});

describe("State Tracker Mode Distribution Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 4: Mode Distribution Calculation
   * Validates: Requirements 1.6, 5.3
   *
   * For any set of state logs with operating modes, the distribution percentages
   * should sum to approximately 100% (allowing for rounding) and each mode's
   * percentage should equal (count of that mode / total logs) * 100.
   */
  it("Property 4: Mode Distribution Calculation - percentages sum to approximately 100%", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(stateLogArb, { minLength: 1, maxLength: 100 }),
        async (stateLogs) => {
          const distribution = calculateModeDistribution(stateLogs);

          // Property 1: Sum of percentages should be approximately 100%
          // (may not be exactly 100 due to rounding)
          const sum =
            distribution.biological +
            distribution.societal +
            distribution.passion +
            distribution.protection;

          expect(sum).toBeGreaterThanOrEqual(96); // Allow for rounding errors
          expect(sum).toBeLessThanOrEqual(104);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 4b: Mode Distribution - each percentage is non-negative and <= 100", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(stateLogArb, { minLength: 1, maxLength: 100 }),
        async (stateLogs) => {
          const distribution = calculateModeDistribution(stateLogs);

          // Property: Each percentage should be non-negative and <= 100
          expect(distribution.biological).toBeGreaterThanOrEqual(0);
          expect(distribution.biological).toBeLessThanOrEqual(100);
          expect(distribution.societal).toBeGreaterThanOrEqual(0);
          expect(distribution.societal).toBeLessThanOrEqual(100);
          expect(distribution.passion).toBeGreaterThanOrEqual(0);
          expect(distribution.passion).toBeLessThanOrEqual(100);
          expect(distribution.protection).toBeGreaterThanOrEqual(0);
          expect(distribution.protection).toBeLessThanOrEqual(100);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 4c: Mode Distribution - percentages reflect actual counts", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(stateLogArb, { minLength: 1, maxLength: 100 }),
        async (stateLogs) => {
          const distribution = calculateModeDistribution(stateLogs);

          // Count actual occurrences
          const modeCounts: Record<string, number> = {
            biological: 0,
            societal: 0,
            passion: 0,
            protection: 0,
          };

          stateLogs.forEach((log) => {
            if (log.mode in modeCounts) {
              modeCounts[log.mode]++;
            }
          });

          // Property: Each mode's percentage should match its count ratio
          const totalLogs = stateLogs.length;

          const expectedBiological = Math.round(
            (modeCounts.biological / totalLogs) * 100
          );
          const expectedSocietal = Math.round(
            (modeCounts.societal / totalLogs) * 100
          );
          const expectedPassion = Math.round(
            (modeCounts.passion / totalLogs) * 100
          );
          const expectedProtection = Math.round(
            (modeCounts.protection / totalLogs) * 100
          );

          expect(distribution.biological).toBe(expectedBiological);
          expect(distribution.societal).toBe(expectedSocietal);
          expect(distribution.passion).toBe(expectedPassion);
          expect(distribution.protection).toBe(expectedProtection);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 4d: Mode Distribution - empty logs return zero distribution", async () => {
    const distribution = calculateModeDistribution([]);

    expect(distribution.biological).toBe(0);
    expect(distribution.societal).toBe(0);
    expect(distribution.passion).toBe(0);
    expect(distribution.protection).toBe(0);
  });

  it("Property 4e: Mode Distribution - single mode logs return 100% for that mode", async () => {
    await fc.assert(
      fc.asyncProperty(
        operatingModeArb,
        fc.integer({ min: 1, max: 50 }),
        async (mode, count) => {
          // Create logs all with the same mode
          const logs: StateLog[] = Array.from({ length: count }, (_, i) => ({
            id: `log-${i}`,
            created_at: new Date().toISOString(),
            element: "electric",
            mode: mode,
          }));

          const distribution = calculateModeDistribution(logs);

          // Property: The single mode should have 100%, others 0%
          const modes = ["biological", "societal", "passion", "protection"];
          modes.forEach((m) => {
            if (m === mode) {
              expect(distribution[m as keyof ModeDistribution]).toBe(100);
            } else {
              expect(distribution[m as keyof ModeDistribution]).toBe(0);
            }
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
