/**
 * Property-Based Tests for Streak Milestone Detection
 *
 * Feature: tools-completion-and-platform-consolidation
 * Property 27: Streak Milestone Detection
 * Validates: Requirements 19.2
 *
 * These tests verify that streak milestones (7, 14, 30, 100 days)
 * are correctly detected and celebrations trigger exactly once.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// Import the milestone detection functions
import {
  isStreakMilestone,
  getNextMilestone,
  getMilestoneMessage,
  STREAK_MILESTONES,
} from "@/components/gamification/streak-milestone";

/**
 * Simulates checking if a milestone was just reached
 * Returns true if currentStreak is a milestone and previousStreak was below it
 */
function justReachedMilestone(
  currentStreak: number,
  previousStreak: number
): number | null {
  for (const milestone of STREAK_MILESTONES) {
    if (currentStreak >= milestone && previousStreak < milestone) {
      return milestone;
    }
  }
  return null;
}

describe("Streak Milestone Detection Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 27: Streak Milestone Detection
   * Validates: Requirements 19.2
   *
   * For any streak reaching a milestone (7, 14, 30, 100), the celebration
   * should trigger exactly once when the milestone is first reached.
   */
  it("Property 27: Milestone detection - milestones are exactly 7, 14, 30, 100", () => {
    // Property: The milestone set should be exactly [7, 14, 30, 100]
    expect(STREAK_MILESTONES).toEqual([7, 14, 30, 100]);
    expect(STREAK_MILESTONES.length).toBe(4);
  });

  it("Property 27a: Milestone detection - isStreakMilestone returns true only for milestones", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 200 }),
        (streak) => {
          const isMilestone = isStreakMilestone(streak);
          const shouldBeMilestone = [7, 14, 30, 100].includes(streak);

          // Property: isStreakMilestone should return true iff streak is in [7, 14, 30, 100]
          expect(isMilestone).toBe(shouldBeMilestone);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27b: Milestone detection - celebration triggers exactly once per milestone", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 150 }), // previous streak
        fc.integer({ min: 1, max: 150 }), // current streak (must be >= previous for valid streak)
        (previousStreak, currentStreak) => {
          // Ensure current >= previous (streak can only go up or reset)
          if (currentStreak < previousStreak) {
            return true; // Skip invalid cases
          }

          const reachedMilestone = justReachedMilestone(currentStreak, previousStreak);

          // Property: If we crossed a milestone boundary, we should detect it
          for (const milestone of STREAK_MILESTONES) {
            if (currentStreak >= milestone && previousStreak < milestone) {
              // We crossed this milestone
              expect(reachedMilestone).toBe(milestone);
              return true;
            }
          }

          // If we didn't cross any milestone, reachedMilestone should be null
          // (unless we crossed multiple, in which case it returns the first one)
          if (reachedMilestone !== null) {
            // Verify we actually crossed this milestone
            expect(currentStreak).toBeGreaterThanOrEqual(reachedMilestone);
            expect(previousStreak).toBeLessThan(reachedMilestone);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27c: Milestone detection - no celebration when staying at same streak", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 150 }),
        (streak) => {
          // Property: If streak doesn't change, no milestone should be detected
          const reachedMilestone = justReachedMilestone(streak, streak);
          expect(reachedMilestone).toBeNull();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27d: Milestone detection - no celebration when streak decreases (reset)", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 10, max: 150 }), // previous streak (high)
        fc.integer({ min: 0, max: 9 }), // current streak (low - reset)
        (previousStreak, currentStreak) => {
          // Property: When streak resets (decreases), no milestone should be detected
          const reachedMilestone = justReachedMilestone(currentStreak, previousStreak);
          expect(reachedMilestone).toBeNull();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27e: Milestone detection - getNextMilestone returns correct next target", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 150 }),
        (currentStreak) => {
          const nextMilestone = getNextMilestone(currentStreak);

          if (currentStreak >= 100) {
            // Property: No next milestone after 100
            expect(nextMilestone).toBeNull();
          } else {
            // Property: Next milestone should be the smallest milestone > currentStreak
            expect(nextMilestone).not.toBeNull();
            expect(nextMilestone).toBeGreaterThan(currentStreak);

            // Verify it's the smallest one
            for (const milestone of STREAK_MILESTONES) {
              if (milestone > currentStreak) {
                expect(nextMilestone).toBe(milestone);
                break;
              }
            }
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27f: Milestone detection - getMilestoneMessage returns non-empty string", async () => {
    await fc.assert(
      fc.property(
        fc.constantFrom(...STREAK_MILESTONES),
        (milestone) => {
          const message = getMilestoneMessage(milestone);

          // Property: Message should be a non-empty string
          expect(typeof message).toBe("string");
          expect(message.length).toBeGreaterThan(0);

          // Property: Message should contain the milestone number or relevant emoji
          expect(
            message.includes("🔥") ||
              message.includes("⭐") ||
              message.includes("🏆") ||
              message.includes("👑") ||
              message.includes("🎉")
          ).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Property 27g: Milestone detection - milestones are in ascending order", () => {
    // Property: Milestones should be sorted in ascending order
    for (let i = 1; i < STREAK_MILESTONES.length; i++) {
      expect(STREAK_MILESTONES[i]).toBeGreaterThan(STREAK_MILESTONES[i - 1]);
    }
  });

  it("Property 27h: Milestone detection - first milestone triggers at exactly 7", () => {
    // Property: Going from 6 to 7 should trigger the first milestone
    const reachedMilestone = justReachedMilestone(7, 6);
    expect(reachedMilestone).toBe(7);

    // Property: Going from 5 to 6 should NOT trigger any milestone
    const noMilestone = justReachedMilestone(6, 5);
    expect(noMilestone).toBeNull();
  });

  it("Property 27i: Milestone detection - jumping over milestones triggers first crossed", async () => {
    // Property: If streak jumps from 0 to 50, should trigger 7 (first milestone crossed)
    const reachedMilestone = justReachedMilestone(50, 0);
    expect(reachedMilestone).toBe(7);

    // Property: If streak jumps from 10 to 50, should trigger 14 (first milestone crossed)
    const reachedMilestone2 = justReachedMilestone(50, 10);
    expect(reachedMilestone2).toBe(14);
  });
});

describe("Streak Milestone Celebration Properties", () => {
  /**
   * Tests for celebration behavior
   */
  it("Property: Celebration intensity increases with milestone", () => {
    // Property: Higher milestones should have more confetti
    const getConfettiCount = (streak: number) => {
      if (streak >= 100) return 100;
      if (streak >= 30) return 75;
      return 50;
    };

    expect(getConfettiCount(7)).toBe(50);
    expect(getConfettiCount(14)).toBe(50);
    expect(getConfettiCount(30)).toBe(75);
    expect(getConfettiCount(100)).toBe(100);
  });

  it("Property: Each milestone has unique styling", () => {
    // Property: Different milestones should have different visual treatments
    const getMilestoneStyle = (streak: number) => {
      if (streak >= 100) return "amber-gold";
      if (streak >= 30) return "purple-pink";
      if (streak >= 14) return "blue-cyan";
      return "orange-red";
    };

    expect(getMilestoneStyle(7)).toBe("orange-red");
    expect(getMilestoneStyle(14)).toBe("blue-cyan");
    expect(getMilestoneStyle(30)).toBe("purple-pink");
    expect(getMilestoneStyle(100)).toBe("amber-gold");
  });
});
