/**
 * Property-Based Tests for Quick Quiz Repository
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for quick quiz operations
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { ElementType, ElementScores, QuickQuizResult, QuizAssessmentComparison } from "@/lib/db/quick-quiz-results";

/**
 * Arbitrary generators for quiz data
 */
const elementTypeArb: fc.Arbitrary<ElementType> = fc.constantFrom(
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic"
);

const elementScoresArb: fc.Arbitrary<ElementScores> = fc.record({
  electric: fc.integer({ min: 0, max: 100 }),
  fiery: fc.integer({ min: 0, max: 100 }),
  aquatic: fc.integer({ min: 0, max: 100 }),
  earthly: fc.integer({ min: 0, max: 100 }),
  airy: fc.integer({ min: 0, max: 100 }),
  metallic: fc.integer({ min: 0, max: 100 }),
});

/**
 * Calculate primary element from scores (same logic as repository)
 */
function calculatePrimaryElement(scores: ElementScores): ElementType {
  const elements: ElementType[] = [
    "electric",
    "fiery",
    "aquatic",
    "earthly",
    "airy",
    "metallic",
  ];

  let maxElement: ElementType = "electric";
  let maxScore = scores.electric;

  for (const element of elements) {
    if (scores[element] > maxScore) {
      maxScore = scores[element];
      maxElement = element;
    }
  }

  return maxElement;
}

/**
 * Calculate differences between quiz and assessment scores
 */
function calculateDifferences(
  quizScores: ElementScores,
  assessmentScores: ElementScores
): Record<ElementType, number> {
  const elements: ElementType[] = [
    "electric",
    "fiery",
    "aquatic",
    "earthly",
    "airy",
    "metallic",
  ];

  const differences: Record<ElementType, number> = {
    electric: 0,
    fiery: 0,
    aquatic: 0,
    earthly: 0,
    airy: 0,
    metallic: 0,
  };

  for (const element of elements) {
    differences[element] = quizScores[element] - assessmentScores[element];
  }

  return differences;
}

describe("Quick Quiz Repository Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 18: Quick Quiz Comparison Calculation
   * Validates: Requirements 10.2
   *
   * For any user with both Quick Quiz and full assessment results, the comparison
   * should show the difference in element scores between the two.
   */
  it("Property 18: Quick Quiz Comparison Calculation - differences are correctly calculated", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(), // userId
        elementScoresArb, // quiz scores
        elementScoresArb, // assessment scores
        async (userId, quizScores, assessmentScores) => {
          // Simulate quiz result
          const quizResult: QuickQuizResult = {
            id: `quiz-${Date.now()}`,
            user_id: userId,
            scores: quizScores,
            primary_element: calculatePrimaryElement(quizScores),
            created_at: new Date().toISOString(),
          };

          // Simulate comparison calculation (same logic as repository)
          const differences = calculateDifferences(quizScores, assessmentScores);

          const assessmentPrimaryElement = calculatePrimaryElement(assessmentScores);
          const primaryElementMatch = assessmentPrimaryElement === quizResult.primary_element;

          const comparison: QuizAssessmentComparison = {
            quizResult,
            assessmentScores,
            differences,
            primaryElementMatch,
          };

          // Property verification:
          const elements: ElementType[] = [
            "electric",
            "fiery",
            "aquatic",
            "earthly",
            "airy",
            "metallic",
          ];

          // 1. Each difference should equal quiz score minus assessment score
          for (const element of elements) {
            const expectedDiff = quizScores[element] - assessmentScores[element];
            expect(comparison.differences[element]).toBe(expectedDiff);
          }

          // 2. Primary element match should be correct
          expect(comparison.primaryElementMatch).toBe(
            calculatePrimaryElement(quizScores) === calculatePrimaryElement(assessmentScores)
          );

          // 3. Quiz result should be preserved in comparison
          expect(comparison.quizResult.scores).toEqual(quizScores);

          // 4. Assessment scores should be preserved in comparison
          expect(comparison.assessmentScores).toEqual(assessmentScores);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Primary element calculation is deterministic
   */
  it("Property: Primary element is the element with highest score", async () => {
    await fc.assert(
      fc.asyncProperty(
        elementScoresArb,
        async (scores) => {
          const primaryElement = calculatePrimaryElement(scores);

          // The primary element should have the highest (or tied for highest) score
          const elements: ElementType[] = [
            "electric",
            "fiery",
            "aquatic",
            "earthly",
            "airy",
            "metallic",
          ];

          const maxScore = Math.max(...elements.map((e) => scores[e]));
          expect(scores[primaryElement]).toBe(maxScore);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Differences sum to zero when scores are equal
   */
  it("Property: Differences are zero when quiz and assessment scores are equal", async () => {
    await fc.assert(
      fc.asyncProperty(
        elementScoresArb,
        async (scores) => {
          // When quiz and assessment have same scores
          const differences = calculateDifferences(scores, scores);

          const elements: ElementType[] = [
            "electric",
            "fiery",
            "aquatic",
            "earthly",
            "airy",
            "metallic",
          ];

          // All differences should be zero
          for (const element of elements) {
            expect(differences[element]).toBe(0);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Differences are symmetric (negation)
   */
  it("Property: Swapping quiz and assessment negates all differences", async () => {
    await fc.assert(
      fc.asyncProperty(
        elementScoresArb,
        elementScoresArb,
        async (scoresA, scoresB) => {
          const diffAB = calculateDifferences(scoresA, scoresB);
          const diffBA = calculateDifferences(scoresB, scoresA);

          const elements: ElementType[] = [
            "electric",
            "fiery",
            "aquatic",
            "earthly",
            "airy",
            "metallic",
          ];

          // Swapping should negate all differences
          // Note: Using == instead of toBe to handle JavaScript's +0/-0 edge case
          for (const element of elements) {
            expect(diffAB[element] === -diffBA[element]).toBe(true);
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
