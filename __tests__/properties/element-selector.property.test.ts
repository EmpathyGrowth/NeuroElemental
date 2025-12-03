/**
 * Property-Based Tests for ElementSelector Component
 *
 * Feature: tools-completion-and-platform-consolidation
 *
 * These tests verify correctness properties for element selection
 * as specified in the design document.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  getPrimaryElement,
  getBlendElements,
  type ElementType,
  type AssessmentResult,
} from "@/components/tools/element-selector";

/**
 * Valid element types
 */
const VALID_ELEMENTS: ElementType[] = [
  "electric",
  "fiery",
  "aquatic",
  "earthly",
  "airy",
  "metallic",
];

/**
 * Arbitrary generators for element-related data
 */
const elementArb = fc.constantFrom(...VALID_ELEMENTS);

/**
 * Generate valid element scores (0-100 for each element)
 */
const elementScoresArb = fc.record({
  electric: fc.integer({ min: 0, max: 100 }),
  fiery: fc.integer({ min: 0, max: 100 }),
  aquatic: fc.integer({ min: 0, max: 100 }),
  earthly: fc.integer({ min: 0, max: 100 }),
  airy: fc.integer({ min: 0, max: 100 }),
  metallic: fc.integer({ min: 0, max: 100 }),
}) as fc.Arbitrary<Record<ElementType, number>>;

/**
 * Generate assessment result with valid scores
 */
const assessmentResultArb: fc.Arbitrary<AssessmentResult> = elementScoresArb.chain(
  (scores) => {
    // Determine primary element from scores
    const primary = getPrimaryElement(scores) || "electric";
    return fc.record({
      scores: fc.constant(scores),
      primary_element: fc.constant(primary as ElementType),
      completed_at: fc.date().map((d) => d.toISOString()),
    });
  }
);


describe("Element Auto-Selection Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 5: Element Auto-Selection from Assessment
   * Validates: Requirements 2.1
   *
   * For any user with a saved assessment, visiting a tool should pre-select
   * the element with the highest score from their assessment results.
   */
  it("Property 5: Element Auto-Selection from Assessment - selects highest scoring element", async () => {
    await fc.assert(
      fc.property(
        elementScoresArb,
        (scores) => {
          // Get the primary element using our function
          const primaryElement = getPrimaryElement(scores);

          // Find the actual maximum score
          const maxScore = Math.max(...Object.values(scores));

          // If all scores are 0, primary element can be null
          if (maxScore === 0) {
            // When all scores are 0, any element could be selected or null
            return true;
          }

          // Property: Primary element should have the maximum score
          expect(primaryElement).not.toBeNull();
          expect(scores[primaryElement!]).toBe(maxScore);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: getPrimaryElement returns null for empty scores
   */
  it("Property: getPrimaryElement returns null for empty scores", () => {
    expect(getPrimaryElement({})).toBeNull();
  });

  /**
   * Property: getPrimaryElement always returns a valid element type
   */
  it("Property: getPrimaryElement returns valid element type", async () => {
    await fc.assert(
      fc.property(
        elementScoresArb.filter((scores) => Math.max(...Object.values(scores)) > 0),
        (scores) => {
          const primaryElement = getPrimaryElement(scores);

          // Property: Result should be a valid element type
          expect(primaryElement).not.toBeNull();
          expect(VALID_ELEMENTS).toContain(primaryElement);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: When multiple elements have the same max score, one is selected
   */
  it("Property: Handles tied scores deterministically", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // shared max score
        fc.array(elementArb, { minLength: 2, maxLength: 6 }), // elements to tie
        (maxScore, tiedElements) => {
          // Create scores where specified elements are tied at max
          const scores: Record<ElementType, number> = {
            electric: 0,
            fiery: 0,
            aquatic: 0,
            earthly: 0,
            airy: 0,
            metallic: 0,
          };

          // Set tied elements to max score
          const uniqueTied = [...new Set(tiedElements)];
          uniqueTied.forEach((el) => {
            scores[el] = maxScore;
          });

          const primaryElement = getPrimaryElement(scores);

          // Property: Result should be one of the tied elements
          expect(primaryElement).not.toBeNull();
          expect(uniqueTied).toContain(primaryElement);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});


describe("Blend Type Detection Properties", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 6: Blend Type Detection
   * Validates: Requirements 2.2
   *
   * For any assessment result where 2+ elements have scores within 10% of
   * the maximum score, those elements should be identified as the blend type.
   */
  it("Property 6: Blend Type Detection - identifies elements within threshold", async () => {
    const BLEND_THRESHOLD = 10; // 10% threshold

    await fc.assert(
      fc.property(
        elementScoresArb.filter((scores) => Math.max(...Object.values(scores)) > 0),
        (scores) => {
          const blendElements = getBlendElements(scores, BLEND_THRESHOLD);
          const maxScore = Math.max(...Object.values(scores));

          // Property 1: All blend elements should be within threshold of max
          blendElements.forEach((element) => {
            const score = scores[element];
            const percentDiff = ((maxScore - score) / maxScore) * 100;
            expect(percentDiff).toBeLessThanOrEqual(BLEND_THRESHOLD);
          });

          // Property 2: No non-blend element should be within threshold
          VALID_ELEMENTS.forEach((element) => {
            if (!blendElements.includes(element)) {
              const score = scores[element];
              const percentDiff = ((maxScore - score) / maxScore) * 100;
              expect(percentDiff).toBeGreaterThan(BLEND_THRESHOLD);
            }
          });

          // Property 3: Blend elements should be sorted by score descending
          for (let i = 1; i < blendElements.length; i++) {
            expect(scores[blendElements[i - 1]]).toBeGreaterThanOrEqual(
              scores[blendElements[i]]
            );
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Blend always includes the primary element
   */
  it("Property: Blend always includes primary element", async () => {
    await fc.assert(
      fc.property(
        elementScoresArb.filter((scores) => Math.max(...Object.values(scores)) > 0),
        (scores) => {
          const primaryElement = getPrimaryElement(scores);
          const blendElements = getBlendElements(scores);

          // Property: Primary element should always be in blend
          expect(blendElements).toContain(primaryElement);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Blend returns empty array for empty scores
   */
  it("Property: getBlendElements returns empty array for empty scores", () => {
    expect(getBlendElements({})).toEqual([]);
  });

  /**
   * Property: All elements with same score are in blend
   */
  it("Property: All elements with same max score are in blend", async () => {
    await fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100 }), // max score
        (maxScore) => {
          // All elements have the same score
          const scores: Record<ElementType, number> = {
            electric: maxScore,
            fiery: maxScore,
            aquatic: maxScore,
            earthly: maxScore,
            airy: maxScore,
            metallic: maxScore,
          };

          const blendElements = getBlendElements(scores);

          // Property: All elements should be in blend when scores are equal
          expect(blendElements.length).toBe(6);
          VALID_ELEMENTS.forEach((el) => {
            expect(blendElements).toContain(el);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Single dominant element results in blend of 1
   */
  it("Property: Single dominant element results in blend of 1", async () => {
    await fc.assert(
      fc.property(
        elementArb, // dominant element
        fc.integer({ min: 50, max: 100 }), // high score for dominant
        fc.integer({ min: 0, max: 30 }), // low score for others
        (dominantElement, highScore, lowScore) => {
          // Ensure the gap is large enough (more than 10%)
          if (highScore - lowScore <= highScore * 0.1) {
            return true; // Skip this case
          }

          const scores: Record<ElementType, number> = {
            electric: lowScore,
            fiery: lowScore,
            aquatic: lowScore,
            earthly: lowScore,
            airy: lowScore,
            metallic: lowScore,
          };
          scores[dominantElement] = highScore;

          const blendElements = getBlendElements(scores);

          // Property: Only the dominant element should be in blend
          expect(blendElements.length).toBe(1);
          expect(blendElements[0]).toBe(dominantElement);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
