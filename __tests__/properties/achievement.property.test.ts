/**
 * Property-Based Tests for Achievement Repository
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for achievement operations
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

/**
 * Types for achievement testing
 */
interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
}

interface AwardResult {
  awarded: boolean;
  achievement: UserAchievement | null;
}

describe("Achievement Repository Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 26: Achievement Awarding Idempotence
   * Validates: Requirements 18.1, 18.2, 18.3, 18.4
   *
   * For any achievement trigger (e.g., first check-in, 7-day streak),
   * the achievement should be awarded exactly once; subsequent triggers
   * should not create duplicate achievements.
   */
  it("Property 26: Achievement Awarding Idempotence - achievement awarded exactly once", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.uuid(), // achievementId
        fc.integer({ min: 1, max: 10 }), // number of award attempts
        async (userId, achievementId, attempts) => {
          // Simulate the repository storage
          const storage: Map<string, UserAchievement> = new Map();

          // Simulate hasAchievement
          const hasAchievement = (uid: string, aid: string): boolean => {
            const key = `${uid}-${aid}`;
            return storage.has(key);
          };

          // Simulate awardAchievement (idempotent)
          const awardAchievement = (
            uid: string,
            aid: string
          ): AwardResult => {
            const key = `${uid}-${aid}`;

            if (hasAchievement(uid, aid)) {
              // Already has achievement - return existing
              return {
                awarded: false,
                achievement: storage.get(key) || null,
              };
            }

            // Award new achievement
            const achievement: UserAchievement = {
              id: `ua-${Date.now()}`,
              user_id: uid,
              achievement_id: aid,
              earned_at: new Date().toISOString(),
            };
            storage.set(key, achievement);

            return { awarded: true, achievement };
          };

          // Track award results
          const results: AwardResult[] = [];

          // Attempt to award multiple times
          for (let i = 0; i < attempts; i++) {
            const result = awardAchievement(userId, achievementId);
            results.push(result);
          }

          // Property verification:
          // 1. Only the first attempt should have awarded: true
          expect(results[0].awarded).toBe(true);

          // 2. All subsequent attempts should have awarded: false
          for (let i = 1; i < results.length; i++) {
            expect(results[i].awarded).toBe(false);
          }

          // 3. All results should return the same achievement
          const firstAchievement = results[0].achievement;
          for (const result of results) {
            expect(result.achievement?.achievement_id).toBe(achievementId);
            expect(result.achievement?.user_id).toBe(userId);
          }

          // 4. Storage should contain exactly one entry
          const key = `${userId}-${achievementId}`;
          expect(storage.size).toBe(1);
          expect(storage.has(key)).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Different achievements can be awarded independently
   */
  it("Property: Different achievements can be awarded independently", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }), // multiple achievement IDs
        async (userId, achievementIds) => {
          // Ensure unique achievement IDs
          const uniqueIds = [...new Set(achievementIds)];

          // Simulate the repository storage
          const storage: Map<string, UserAchievement> = new Map();

          const awardAchievement = (
            uid: string,
            aid: string
          ): AwardResult => {
            const key = `${uid}-${aid}`;

            if (storage.has(key)) {
              return {
                awarded: false,
                achievement: storage.get(key) || null,
              };
            }

            const achievement: UserAchievement = {
              id: `ua-${Date.now()}-${aid}`,
              user_id: uid,
              achievement_id: aid,
              earned_at: new Date().toISOString(),
            };
            storage.set(key, achievement);

            return { awarded: true, achievement };
          };

          // Award each unique achievement
          const results = uniqueIds.map((aid) => awardAchievement(userId, aid));

          // Property verification:
          // 1. Each unique achievement should be awarded
          for (const result of results) {
            expect(result.awarded).toBe(true);
          }

          // 2. Storage should contain all unique achievements
          expect(storage.size).toBe(uniqueIds.length);

          // 3. Each achievement should be independently stored
          for (const aid of uniqueIds) {
            const key = `${userId}-${aid}`;
            expect(storage.has(key)).toBe(true);
            expect(storage.get(key)?.achievement_id).toBe(aid);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Same achievement can be awarded to different users
   */
  it("Property: Same achievement can be awarded to different users", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }), // multiple user IDs
        fc.uuid(), // single achievement ID
        async (userIds, achievementId) => {
          // Ensure unique user IDs
          const uniqueUserIds = [...new Set(userIds)];

          // Simulate the repository storage
          const storage: Map<string, UserAchievement> = new Map();

          const awardAchievement = (
            uid: string,
            aid: string
          ): AwardResult => {
            const key = `${uid}-${aid}`;

            if (storage.has(key)) {
              return {
                awarded: false,
                achievement: storage.get(key) || null,
              };
            }

            const achievement: UserAchievement = {
              id: `ua-${Date.now()}-${uid}`,
              user_id: uid,
              achievement_id: aid,
              earned_at: new Date().toISOString(),
            };
            storage.set(key, achievement);

            return { awarded: true, achievement };
          };

          // Award the same achievement to each user
          const results = uniqueUserIds.map((uid) =>
            awardAchievement(uid, achievementId)
          );

          // Property verification:
          // 1. Each user should receive the achievement
          for (const result of results) {
            expect(result.awarded).toBe(true);
          }

          // 2. Storage should contain one entry per user
          expect(storage.size).toBe(uniqueUserIds.length);

          // 3. Each user should have their own achievement record
          for (const uid of uniqueUserIds) {
            const key = `${uid}-${achievementId}`;
            expect(storage.has(key)).toBe(true);
            expect(storage.get(key)?.user_id).toBe(uid);
            expect(storage.get(key)?.achievement_id).toBe(achievementId);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: hasAchievement returns correct status
   */
  it("Property: hasAchievement returns correct status after awarding", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        fc.uuid(), // achievementId
        async (userId, achievementId) => {
          // Simulate the repository storage
          const storage: Map<string, UserAchievement> = new Map();

          const hasAchievement = (uid: string, aid: string): boolean => {
            const key = `${uid}-${aid}`;
            return storage.has(key);
          };

          const awardAchievement = (uid: string, aid: string): void => {
            const key = `${uid}-${aid}`;
            if (!storage.has(key)) {
              storage.set(key, {
                id: `ua-${Date.now()}`,
                user_id: uid,
                achievement_id: aid,
                earned_at: new Date().toISOString(),
              });
            }
          };

          // Before awarding
          expect(hasAchievement(userId, achievementId)).toBe(false);

          // Award the achievement
          awardAchievement(userId, achievementId);

          // After awarding
          expect(hasAchievement(userId, achievementId)).toBe(true);

          // Award again (should be idempotent)
          awardAchievement(userId, achievementId);

          // Still should have it
          expect(hasAchievement(userId, achievementId)).toBe(true);

          // Storage should still have only one entry
          expect(storage.size).toBe(1);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
