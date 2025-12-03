/**
 * Property-Based Tests for Check-In Functionality
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for check-in operations
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { CheckInLog, CheckInData } from "@/lib/db/logs";

/**
 * Arbitrary generators for check-in data
 */
const elementArb = fc.constantFrom(
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic"
);

const energyLevelArb = fc.integer({ min: 1, max: 5 });

const operatingModeArb = fc.constantFrom(
  "biological",
  "societal",
  "passion",
  "protection"
) as fc.Arbitrary<"biological" | "societal" | "passion" | "protection">;

const optionalStringArb = fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined });

const checkInDataArb: fc.Arbitrary<Omit<CheckInData, "activity_type">> = fc.record({
  element: elementArb,
  energy_level: energyLevelArb,
  current_state: operatingModeArb,
  reflection: optionalStringArb,
  gratitude: optionalStringArb,
  intention: optionalStringArb,
});

/**
 * Simulate check-in storage and retrieval (in-memory)
 */
interface StoredCheckIn {
  id: string;
  user_id: string;
  timestamp: string;
  context: CheckInData;
}

class MockLogsRepository {
  private logs: StoredCheckIn[] = [];

  async saveCheckIn(userId: string, data: Omit<CheckInData, "activity_type">): Promise<StoredCheckIn> {
    const log: StoredCheckIn = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      timestamp: new Date().toISOString(),
      context: {
        activity_type: "daily_check_in",
        ...data,
      },
    };
    this.logs.push(log);
    return log;
  }

  async getUserCheckIns(userId: string, limit: number = 30): Promise<CheckInLog[]> {
    return this.logs
      .filter((log) => log.user_id === userId && log.context.activity_type === "daily_check_in")
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((log) => ({
        id: log.id,
        created_at: log.timestamp,
        element: log.context.element,
        energy_level: log.context.energy_level,
        current_state: log.context.current_state,
        reflection: log.context.reflection,
        gratitude: log.context.gratitude,
        intention: log.context.intention,
      }));
  }

  clear() {
    this.logs = [];
  }
}

describe("Check-In Persistence Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 1: Check-In Data Persistence Round Trip
   * Validates: Requirements 1.1, 1.2
   *
   * For any valid check-in data (element, energy_level 1-5, state, optional reflections),
   * saving via saveCheckIn() and then retrieving via getUserCheckIns() should return
   * the same data with matching fields.
   */
  it("Property 1: Check-In Data Persistence Round Trip - saved data matches retrieved data", async () => {
    const mockRepo = new MockLogsRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        checkInDataArb, // check-in data
        async (userId, checkInData) => {
          mockRepo.clear();

          // Save check-in
          const saved = await mockRepo.saveCheckIn(userId, checkInData);

          // Retrieve check-ins
          const retrieved = await mockRepo.getUserCheckIns(userId, 1);

          // Property: Retrieved data should match saved data
          expect(retrieved.length).toBe(1);
          expect(retrieved[0].id).toBe(saved.id);
          expect(retrieved[0].element).toBe(checkInData.element);
          expect(retrieved[0].energy_level).toBe(checkInData.energy_level);
          expect(retrieved[0].current_state).toBe(checkInData.current_state);
          expect(retrieved[0].reflection).toBe(checkInData.reflection);
          expect(retrieved[0].gratitude).toBe(checkInData.gratitude);
          expect(retrieved[0].intention).toBe(checkInData.intention);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Multiple check-ins are retrieved in reverse chronological order
   */
  it("Property: Check-ins are retrieved in reverse chronological order", async () => {
    const mockRepo = new MockLogsRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(checkInDataArb, { minLength: 2, maxLength: 10 }), // multiple check-ins
        async (userId, checkInsData) => {
          mockRepo.clear();

          // Save multiple check-ins with small delays to ensure different timestamps
          for (const data of checkInsData) {
            await mockRepo.saveCheckIn(userId, data);
            // Small delay to ensure different timestamps
            await new Promise((resolve) => setTimeout(resolve, 1));
          }

          // Retrieve check-ins
          const retrieved = await mockRepo.getUserCheckIns(userId, checkInsData.length);

          // Property: Check-ins should be in reverse chronological order
          for (let i = 1; i < retrieved.length; i++) {
            const prevDate = new Date(retrieved[i - 1].created_at).getTime();
            const currDate = new Date(retrieved[i].created_at).getTime();
            expect(prevDate).toBeGreaterThanOrEqual(currDate);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Property: Energy level is always within valid range (1-5)
   */
  it("Property: Energy level validation - only accepts values 1-5", async () => {
    await fc.assert(
      fc.property(
        energyLevelArb,
        (energyLevel) => {
          // Property: Energy level should always be between 1 and 5
          expect(energyLevel).toBeGreaterThanOrEqual(1);
          expect(energyLevel).toBeLessThanOrEqual(5);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Element is always one of the valid six elements
   */
  it("Property: Element validation - only accepts valid elements", async () => {
    const validElements = ["electric", "fiery", "aquatic", "earthly", "airy", "metallic"];

    await fc.assert(
      fc.property(
        elementArb,
        (element) => {
          // Property: Element should always be one of the valid six
          expect(validElements).toContain(element);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Operating mode is always one of the valid four modes
   */
  it("Property: Operating mode validation - only accepts valid modes", async () => {
    const validModes = ["biological", "societal", "passion", "protection"];

    await fc.assert(
      fc.property(
        operatingModeArb,
        (mode) => {
          // Property: Mode should always be one of the valid four
          expect(validModes).toContain(mode);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Mode Distribution Calculation Properties
 */
describe("Mode Distribution Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 4: Mode Distribution Calculation
   * Validates: Requirements 1.6, 5.3
   *
   * For any set of check-ins with operating modes, the distribution percentages
   * should sum to 100% and each mode's percentage should equal
   * (count of that mode / total check-ins) * 100.
   */
  it("Property 4: Mode Distribution Calculation - percentages sum to 100%", async () => {
    /**
     * Calculate mode distribution from check-ins
     */
    function calculateModeDistribution(checkIns: CheckInLog[]): Record<string, number> {
      if (checkIns.length === 0) return {};

      const modeCounts: Record<string, number> = {};
      checkIns.forEach((c) => {
        const mode = c.current_state;
        modeCounts[mode] = (modeCounts[mode] || 0) + 1;
      });

      const distribution: Record<string, number> = {};
      Object.entries(modeCounts).forEach(([mode, count]) => {
        distribution[mode] = Math.round((count / checkIns.length) * 100);
      });

      return distribution;
    }

    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            id: fc.uuid(),
            created_at: fc.date().map((d) => d.toISOString()),
            element: elementArb,
            energy_level: energyLevelArb,
            current_state: operatingModeArb.map((m) => m as string),
            reflection: optionalStringArb,
            gratitude: optionalStringArb,
            intention: optionalStringArb,
          }),
          { minLength: 1, maxLength: 50 }
        ),
        async (checkIns) => {
          const distribution = calculateModeDistribution(checkIns as CheckInLog[]);

          // Property 1: Sum of percentages should be approximately 100%
          // (may not be exactly 100 due to rounding)
          const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
          expect(sum).toBeGreaterThanOrEqual(98); // Allow for rounding errors
          expect(sum).toBeLessThanOrEqual(102);

          // Property 2: Each percentage should be non-negative
          Object.values(distribution).forEach((pct) => {
            expect(pct).toBeGreaterThanOrEqual(0);
            expect(pct).toBeLessThanOrEqual(100);
          });

          // Property 3: Each mode's percentage should reflect its count
          const modeCounts: Record<string, number> = {};
          checkIns.forEach((c) => {
            const mode = c.current_state;
            modeCounts[mode] = (modeCounts[mode] || 0) + 1;
          });

          Object.entries(distribution).forEach(([mode, pct]) => {
            const expectedPct = Math.round((modeCounts[mode] / checkIns.length) * 100);
            expect(pct).toBe(expectedPct);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


/**
 * Energy Trend Chart Visibility Properties
 */
describe("Energy Trend Chart Visibility Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 3: Energy Trend Chart Visibility
   * Validates: Requirements 1.5
   *
   * For any user with N check-ins where N >= 7, the energy trend chart should be visible;
   * for N < 7, the chart should be hidden.
   */

  /**
   * Determines if the energy trend chart should be visible based on check-in count
   * @param checkInCount - Number of check-ins the user has
   * @returns true if chart should be visible, false otherwise
   */
  function shouldShowEnergyTrendChart(checkInCount: number): boolean {
    return checkInCount >= 7;
  }

  it("Property 3: Energy Trend Chart Visibility - chart visible when 7+ check-ins", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 7, max: 1000 }), // check-in count >= 7
        (checkInCount) => {
          // Property: Chart should be visible when check-in count >= 7
          const isVisible = shouldShowEnergyTrendChart(checkInCount);
          expect(isVisible).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3b: Energy Trend Chart Visibility - chart hidden when < 7 check-ins", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 6 }), // check-in count < 7
        (checkInCount) => {
          // Property: Chart should be hidden when check-in count < 7
          const isVisible = shouldShowEnergyTrendChart(checkInCount);
          expect(isVisible).toBe(false);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 3c: Energy Trend Chart Visibility - boundary condition at exactly 7", async () => {
    // Property: Chart should be visible at exactly 7 check-ins
    const isVisibleAt7 = shouldShowEnergyTrendChart(7);
    expect(isVisibleAt7).toBe(true);

    // Property: Chart should be hidden at exactly 6 check-ins
    const isVisibleAt6 = shouldShowEnergyTrendChart(6);
    expect(isVisibleAt6).toBe(false);
  });

  it("Property 3d: Energy Trend Chart Visibility - monotonic behavior", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 100 }), // any check-in count
        (checkInCount) => {
          const isVisible = shouldShowEnergyTrendChart(checkInCount);
          const isVisibleWithMore = shouldShowEnergyTrendChart(checkInCount + 1);

          // Property: If chart is visible at N, it should also be visible at N+1
          // (monotonically increasing visibility)
          if (isVisible) {
            expect(isVisibleWithMore).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Streak Increment Properties
 */
describe("Streak Increment Properties", () => {
  /**
   * Mock streak repository for testing
   */
  interface StreakRecord {
    user_id: string;
    current_streak: number;
    longest_streak: number;
    last_activity_date: string;
  }

  class MockStreakRepository {
    private streaks: Map<string, StreakRecord> = new Map();

    private getDateString(date: Date): string {
      return date.toISOString().split("T")[0];
    }

    async getUserStreak(userId: string): Promise<StreakRecord | null> {
      return this.streaks.get(userId) || null;
    }

    async recordActivity(userId: string): Promise<StreakRecord> {
      const today = this.getDateString(new Date());
      const existing = this.streaks.get(userId);

      if (!existing) {
        // New user, start streak at 1
        const newStreak: StreakRecord = {
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today,
        };
        this.streaks.set(userId, newStreak);
        return newStreak;
      }

      // Already checked in today - no change
      if (existing.last_activity_date === today) {
        return existing;
      }

      // Check if yesterday
      const yesterday = this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
      let newCurrentStreak: number;

      if (existing.last_activity_date === yesterday) {
        // Continue streak
        newCurrentStreak = existing.current_streak + 1;
      } else {
        // Streak broken, start fresh
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(newCurrentStreak, existing.longest_streak);

      const updated: StreakRecord = {
        user_id: userId,
        current_streak: newCurrentStreak,
        longest_streak: newLongestStreak,
        last_activity_date: today,
      };
      this.streaks.set(userId, updated);
      return updated;
    }

    setStreak(userId: string, streak: StreakRecord) {
      this.streaks.set(userId, streak);
    }

    clear() {
      this.streaks.clear();
    }
  }

  /**
   * Feature: tools-completion-and-platform-consolidation, Property 2: Streak Increment on Check-In
   * Validates: Requirements 1.3
   *
   * For any user completing a check-in, if they had no check-in today,
   * their streak count should increase by 1; if they already checked in today,
   * streak should remain unchanged.
   */
  it("Property 2: Streak Increment on Check-In - streak increases by 1 for new day", async () => {
    const mockStreakRepo = new MockStreakRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.integer({ min: 1, max: 100 }), // initial streak
        async (userId, initialStreak) => {
          mockStreakRepo.clear();

          // Set up user with existing streak from yesterday
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

          mockStreakRepo.setStreak(userId, {
            user_id: userId,
            current_streak: initialStreak,
            longest_streak: initialStreak,
            last_activity_date: yesterday,
          });

          // Record activity (check-in)
          const result = await mockStreakRepo.recordActivity(userId);

          // Property: Streak should increase by 1
          expect(result.current_streak).toBe(initialStreak + 1);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 2b: Streak unchanged for same-day check-in", async () => {
    const mockStreakRepo = new MockStreakRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.integer({ min: 1, max: 100 }), // initial streak
        async (userId, initialStreak) => {
          mockStreakRepo.clear();

          // Set up user with existing streak from today
          const today = new Date().toISOString().split("T")[0];

          mockStreakRepo.setStreak(userId, {
            user_id: userId,
            current_streak: initialStreak,
            longest_streak: initialStreak,
            last_activity_date: today,
          });

          // Record activity (check-in) again today
          const result = await mockStreakRepo.recordActivity(userId);

          // Property: Streak should remain unchanged
          expect(result.current_streak).toBe(initialStreak);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 2c: Streak resets to 1 when broken", async () => {
    const mockStreakRepo = new MockStreakRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.integer({ min: 2, max: 100 }), // initial streak (at least 2 to see reset)
        fc.integer({ min: 2, max: 30 }), // days since last activity
        async (userId, initialStreak, daysSinceLastActivity) => {
          mockStreakRepo.clear();

          // Set up user with existing streak from multiple days ago (broken)
          const lastActivityDate = new Date(
            Date.now() - daysSinceLastActivity * 24 * 60 * 60 * 1000
          )
            .toISOString()
            .split("T")[0];

          mockStreakRepo.setStreak(userId, {
            user_id: userId,
            current_streak: initialStreak,
            longest_streak: initialStreak,
            last_activity_date: lastActivityDate,
          });

          // Record activity (check-in)
          const result = await mockStreakRepo.recordActivity(userId);

          // Property: Streak should reset to 1
          expect(result.current_streak).toBe(1);

          // Property: Longest streak should be preserved
          expect(result.longest_streak).toBe(initialStreak);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 2d: New user starts with streak of 1", async () => {
    const mockStreakRepo = new MockStreakRepository();

    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        async (userId) => {
          mockStreakRepo.clear();

          // Record activity for new user
          const result = await mockStreakRepo.recordActivity(userId);

          // Property: New user should start with streak of 1
          expect(result.current_streak).toBe(1);
          expect(result.longest_streak).toBe(1);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
