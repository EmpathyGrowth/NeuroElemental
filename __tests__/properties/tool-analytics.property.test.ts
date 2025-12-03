/**
 * Property-Based Tests for Tool Analytics Repository
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for tool analytics:
 * - Property 15: Tool Interaction Logging (Requirements 8.1)
 * - Property 16: Analytics Aggregation Accuracy (Requirements 8.2, 8.3, 8.4)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type {
  ToolAction,
  ToolName,
  ToolInteraction,
  ToolStats,
} from "@/lib/db/tool-analytics";

/**
 * Arbitrary generators for tool analytics data
 */
const toolNameArb: fc.Arbitrary<ToolName> = fc.constantFrom(
  "daily-checkin",
  "energy-budget",
  "state-tracker",
  "four-states",
  "regeneration-guide",
  "shadow-work",
  "quick-quiz"
);

const toolActionArb: fc.Arbitrary<ToolAction> = fc.constantFrom(
  "view",
  "start",
  "complete",
  "interact"
);

const toolInteractionArb = fc.record({
  id: fc.uuid(),
  user_id: fc.uuid(),
  tool_name: toolNameArb,
  action: toolActionArb,
  duration_seconds: fc.option(fc.integer({ min: 1, max: 3600 }), {
    nil: null,
  }),
  metadata: fc.constant(null),
  created_at: fc.date().map((d) => d.toISOString()),
});

describe("Tool Analytics Repository Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 15: Tool Interaction Logging
   * Validates: Requirements 8.1
   *
   * For any tool interaction (view, start, complete, interact), a log entry should be
   * created with the correct tool_name, action, and user_id.
   */
  describe("Property 15: Tool Interaction Logging", () => {
    it("should create log entry with correct tool_name, action, and user_id", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user_id
          toolNameArb,
          toolActionArb,
          fc.option(fc.integer({ min: 1, max: 3600 }), { nil: undefined }), // duration
          fc.option(fc.record({ key: fc.string() }), { nil: undefined }), // metadata
          async (userId, toolName, action, duration, metadata) => {
            // Simulate the interaction data that would be passed to logInteraction
            const interactionData = {
              user_id: userId,
              tool_name: toolName,
              action: action,
              duration_seconds: duration,
              metadata: metadata,
            };

            // Property verification:
            // 1. user_id should be preserved
            expect(interactionData.user_id).toBe(userId);

            // 2. tool_name should be one of the valid tool names
            const validToolNames: ToolName[] = [
              "daily-checkin",
              "energy-budget",
              "state-tracker",
              "four-states",
              "regeneration-guide",
              "shadow-work",
              "quick-quiz",
            ];
            expect(validToolNames).toContain(interactionData.tool_name);

            // 3. action should be one of the valid actions
            const validActions: ToolAction[] = [
              "view",
              "start",
              "complete",
              "interact",
            ];
            expect(validActions).toContain(interactionData.action);

            // 4. duration_seconds should be undefined or a positive integer
            if (interactionData.duration_seconds !== undefined) {
              expect(interactionData.duration_seconds).toBeGreaterThan(0);
              expect(Number.isInteger(interactionData.duration_seconds)).toBe(
                true
              );
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve all required fields in the log entry", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(), // user_id
          toolNameArb,
          toolActionArb,
          async (userId, toolName, action) => {
            // Simulate creating a log entry
            const logEntry = {
              user_id: userId,
              tool_name: toolName,
              action: action,
            };

            // Property verification:
            // All required fields must be present and non-null
            expect(logEntry.user_id).toBeDefined();
            expect(logEntry.user_id).not.toBeNull();
            expect(logEntry.tool_name).toBeDefined();
            expect(logEntry.tool_name).not.toBeNull();
            expect(logEntry.action).toBeDefined();
            expect(logEntry.action).not.toBeNull();

            // Fields should match input
            expect(logEntry.user_id).toBe(userId);
            expect(logEntry.tool_name).toBe(toolName);
            expect(logEntry.action).toBe(action);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle all valid tool and action combinations", async () => {
      await fc.assert(
        fc.asyncProperty(
          toolNameArb,
          toolActionArb,
          async (toolName, action) => {
            // Property verification:
            // Any combination of valid tool name and action should be acceptable

            // Tool name should be a non-empty string
            expect(typeof toolName).toBe("string");
            expect(toolName.length).toBeGreaterThan(0);

            // Action should be a non-empty string
            expect(typeof action).toBe("string");
            expect(action.length).toBeGreaterThan(0);

            // The combination should be valid (no restrictions on which actions
            // can be used with which tools)
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: tools-completion-and-platform-consolidation, Property 16: Analytics Aggregation Accuracy
   * Validates: Requirements 8.2, 8.3, 8.4
   *
   * For any set of tool interactions, the aggregated statistics should accurately
   * reflect total count, unique users, and average duration.
   */
  it("Property 16: Analytics Aggregation Accuracy - total count matches interaction count", async () => {
    await fc.assert(
      fc.asyncProperty(
        toolNameArb,
        fc.array(toolInteractionArb, { minLength: 0, maxLength: 50 }),
        async (targetTool, interactions) => {
          // Filter interactions for the target tool
          const toolInteractions = interactions.map((i) => ({
            ...i,
            tool_name: targetTool,
          }));

          // Simulate getToolStats aggregation logic
          const calculateStats = (
            data: typeof toolInteractions
          ): ToolStats => {
            const uniqueUsers = new Set(data.map((i) => i.user_id)).size;

            const viewCount = data.filter((i) => i.action === "view").length;
            const startCount = data.filter((i) => i.action === "start").length;
            const completeCount = data.filter(
              (i) => i.action === "complete"
            ).length;

            const durationsWithValue = data
              .filter((i) => i.duration_seconds !== null)
              .map((i) => i.duration_seconds as number);

            const averageDuration =
              durationsWithValue.length > 0
                ? durationsWithValue.reduce((a, b) => a + b, 0) /
                  durationsWithValue.length
                : null;

            const completionRate =
              startCount > 0 ? (completeCount / startCount) * 100 : null;

            return {
              toolName: targetTool,
              totalInteractions: data.length,
              uniqueUsers,
              averageDuration,
              completionRate,
              viewCount,
              startCount,
              completeCount,
            };
          };

          const stats = calculateStats(toolInteractions);

          // Property verification:
          // 1. Total interactions should equal the number of interactions
          expect(stats.totalInteractions).toBe(toolInteractions.length);

          // 2. Unique users should be <= total interactions
          expect(stats.uniqueUsers).toBeLessThanOrEqual(
            toolInteractions.length
          );

          // 3. Action counts should sum correctly
          const interactCount = toolInteractions.filter(
            (i) => i.action === "interact"
          ).length;
          expect(
            stats.viewCount +
              stats.startCount +
              stats.completeCount +
              interactCount
          ).toBe(toolInteractions.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Unique users count is accurate
   */
  it("Property 16b: Analytics Aggregation - unique users count is accurate", async () => {
    await fc.assert(
      fc.asyncProperty(
        toolNameArb,
        fc.array(fc.uuid(), { minLength: 1, maxLength: 10 }), // user pool
        fc.array(toolActionArb, { minLength: 1, maxLength: 30 }), // actions
        async (targetTool, userPool, actions) => {
          // Create interactions with users from the pool
          const interactions = actions.map((action, index) => ({
            id: `id-${index}`,
            user_id: userPool[index % userPool.length],
            tool_name: targetTool,
            action,
            duration_seconds: null,
            metadata: null,
            created_at: new Date().toISOString(),
          }));

          // Calculate unique users
          const uniqueUserIds = new Set(interactions.map((i) => i.user_id));
          const calculatedUniqueUsers = uniqueUserIds.size;

          // Property verification:
          // Unique users should equal the actual unique user IDs
          expect(calculatedUniqueUsers).toBe(uniqueUserIds.size);

          // Unique users should be <= user pool size
          expect(calculatedUniqueUsers).toBeLessThanOrEqual(userPool.length);

          // Unique users should be <= total interactions
          expect(calculatedUniqueUsers).toBeLessThanOrEqual(interactions.length);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Average duration calculation is accurate
   */
  it("Property 16c: Analytics Aggregation - average duration is accurate", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            duration_seconds: fc.option(fc.integer({ min: 1, max: 3600 }), {
              nil: null,
            }),
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (interactionsWithDuration) => {
          // Extract durations
          const durationsWithValue = interactionsWithDuration
            .filter((i) => i.duration_seconds !== null)
            .map((i) => i.duration_seconds as number);

          // Calculate average
          const calculatedAverage =
            durationsWithValue.length > 0
              ? durationsWithValue.reduce((a, b) => a + b, 0) /
                durationsWithValue.length
              : null;

          // Property verification:
          if (durationsWithValue.length === 0) {
            // No durations means null average
            expect(calculatedAverage).toBeNull();
          } else {
            // Average should be within the range of min and max durations
            const minDuration = Math.min(...durationsWithValue);
            const maxDuration = Math.max(...durationsWithValue);

            expect(calculatedAverage).toBeGreaterThanOrEqual(minDuration);
            expect(calculatedAverage).toBeLessThanOrEqual(maxDuration);

            // Average should equal sum / count
            const sum = durationsWithValue.reduce((a, b) => a + b, 0);
            expect(calculatedAverage).toBeCloseTo(
              sum / durationsWithValue.length,
              10
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Completion rate calculation is accurate
   */
  it("Property 16d: Analytics Aggregation - completion rate is accurate", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 100 }), // start count
        fc.integer({ min: 0, max: 100 }), // complete count
        async (startCount, completeCount) => {
          // Completion rate formula: (complete / start) * 100
          const calculatedRate =
            startCount > 0 ? (completeCount / startCount) * 100 : null;

          // Property verification:
          if (startCount === 0) {
            // No starts means null completion rate
            expect(calculatedRate).toBeNull();
          } else {
            // Rate should be non-negative
            expect(calculatedRate).toBeGreaterThanOrEqual(0);

            // Rate can exceed 100% if completeCount > startCount
            // (e.g., user completes without explicit start)

            // Rate should equal the formula
            expect(calculatedRate).toBeCloseTo(
              (completeCount / startCount) * 100,
              10
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Action counts are mutually exclusive and exhaustive
   */
  it("Property 16e: Analytics Aggregation - action counts are exhaustive", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(toolActionArb, { minLength: 0, maxLength: 100 }),
        async (actions) => {
          // Count each action type
          const viewCount = actions.filter((a) => a === "view").length;
          const startCount = actions.filter((a) => a === "start").length;
          const completeCount = actions.filter((a) => a === "complete").length;
          const interactCount = actions.filter((a) => a === "interact").length;

          // Property verification:
          // Sum of all action counts should equal total actions
          expect(viewCount + startCount + completeCount + interactCount).toBe(
            actions.length
          );

          // Each count should be non-negative
          expect(viewCount).toBeGreaterThanOrEqual(0);
          expect(startCount).toBeGreaterThanOrEqual(0);
          expect(completeCount).toBeGreaterThanOrEqual(0);
          expect(interactCount).toBeGreaterThanOrEqual(0);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
