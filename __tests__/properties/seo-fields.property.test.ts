/**
 * Feature: cms-enhancement-audit, Property 16 & 17: SEO Fields Properties
 * Property 16: SEO Auto-Generation - Validates: Requirements 10.2
 * Property 17: Meta Description Length Warning - Validates: Requirements 10.5
 *
 * Property 16: For any publishable content with empty SEO fields, the system SHALL
 * auto-generate meta title from the content title and meta description from the
 * first 160 characters of the content excerpt or description.
 *
 * Property 17: For any meta description input exceeding 160 characters, the system
 * SHALL display a visual warning indicator without preventing save.
 */

import * as fc from "fast-check";
import {
  generateMetaTitle,
  generateMetaDescription,
  isMetaDescriptionTooLong,
} from "@/components/cms/seo-fields-section";

// ============================================================================
// Constants
// ============================================================================

const META_DESCRIPTION_MAX_LENGTH = 160;
const META_TITLE_MAX_LENGTH = 60;

// ============================================================================
// Generators
// ============================================================================

// Generate content titles of various lengths
const contentTitleArb = fc.string({ minLength: 1, maxLength: 200 });

// Generate content excerpts of various lengths
const contentExcerptArb = fc.string({ minLength: 1, maxLength: 500 });

// Generate meta descriptions that are exactly at the boundary
const boundaryDescriptionArb = fc.oneof(
  fc.string({ minLength: META_DESCRIPTION_MAX_LENGTH, maxLength: META_DESCRIPTION_MAX_LENGTH }),
  fc.string({ minLength: META_DESCRIPTION_MAX_LENGTH + 1, maxLength: META_DESCRIPTION_MAX_LENGTH + 1 }),
  fc.string({ minLength: META_DESCRIPTION_MAX_LENGTH - 1, maxLength: META_DESCRIPTION_MAX_LENGTH - 1 })
);

// Generate HTML content that needs stripping
const htmlExcerptArb = fc.tuple(
  fc.string({ minLength: 1, maxLength: 100 }),
  fc.constantFrom("<p>", "<div>", "<span>", "<h1>", "<strong>", "<em>"),
  fc.constantFrom("</p>", "</div>", "</span>", "</h1>", "</strong>", "</em>")
).map(([text, openTag, closeTag]) => `${openTag}${text}${closeTag}`);

// ============================================================================
// Property Tests
// ============================================================================

describe("SEO Fields Properties", () => {
  /**
   * Feature: cms-enhancement-audit, Property 17: Meta Description Length Warning
   * Validates: Requirements 10.5
   */
  describe("Property 17: Meta Description Length Warning", () => {
    it("should return true for descriptions exceeding 160 characters", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: META_DESCRIPTION_MAX_LENGTH + 1, maxLength: 500 }),
          (description) => {
            // Property: Any description longer than 160 chars should trigger warning
            expect(isMetaDescriptionTooLong(description)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return false for descriptions at or below 160 characters", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 0, maxLength: META_DESCRIPTION_MAX_LENGTH }),
          (description) => {
            // Property: Any description 160 chars or less should not trigger warning
            expect(isMetaDescriptionTooLong(description)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should correctly identify boundary cases", () => {
      // Exactly 160 characters - should NOT trigger warning
      const exactly160 = "a".repeat(160);
      expect(isMetaDescriptionTooLong(exactly160)).toBe(false);

      // 161 characters - SHOULD trigger warning
      const exactly161 = "a".repeat(161);
      expect(isMetaDescriptionTooLong(exactly161)).toBe(true);

      // 159 characters - should NOT trigger warning
      const exactly159 = "a".repeat(159);
      expect(isMetaDescriptionTooLong(exactly159)).toBe(false);
    });

    it("should handle empty strings", () => {
      expect(isMetaDescriptionTooLong("")).toBe(false);
    });

    it("should count all characters including whitespace and special chars", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 200 }),
          (description) => {
            const result = isMetaDescriptionTooLong(description);
            const expected = description.length > META_DESCRIPTION_MAX_LENGTH;
            
            // Property: Warning should be based on actual character count
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: cms-enhancement-audit, Property 16: SEO Auto-Generation
   * Validates: Requirements 10.2
   */
  describe("Property 16: SEO Auto-Generation", () => {
    describe("Meta Title Generation", () => {
      it("should generate meta title from content title", () => {
        fc.assert(
          fc.property(contentTitleArb, (title) => {
            const metaTitle = generateMetaTitle(title);

            // Property: Generated title should not exceed max length
            expect(metaTitle.length).toBeLessThanOrEqual(META_TITLE_MAX_LENGTH);

            // Property: Generated title should be a prefix of original (or equal if short enough)
            if (title.length <= META_TITLE_MAX_LENGTH) {
              expect(metaTitle).toBe(title);
            } else {
              expect(title.startsWith(metaTitle)).toBe(true);
            }
          }),
          { numRuns: 100 }
        );
      });

      it("should return empty string for empty title", () => {
        expect(generateMetaTitle("")).toBe("");
      });

      it("should truncate long titles to max length", () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: META_TITLE_MAX_LENGTH + 1, maxLength: 200 }),
            (longTitle) => {
              const metaTitle = generateMetaTitle(longTitle);

              // Property: Result should be exactly max length
              expect(metaTitle.length).toBe(META_TITLE_MAX_LENGTH);

              // Property: Result should be the first N characters
              expect(metaTitle).toBe(longTitle.slice(0, META_TITLE_MAX_LENGTH));
            }
          ),
          { numRuns: 50 }
        );
      });

      it("should preserve short titles unchanged", () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: META_TITLE_MAX_LENGTH }),
            (shortTitle) => {
              const metaTitle = generateMetaTitle(shortTitle);

              // Property: Short titles should be unchanged
              expect(metaTitle).toBe(shortTitle);
            }
          ),
          { numRuns: 50 }
        );
      });
    });

    describe("Meta Description Generation", () => {
      it("should generate meta description from content excerpt", () => {
        fc.assert(
          fc.property(contentExcerptArb, (excerpt) => {
            const metaDescription = generateMetaDescription(excerpt);

            // Property: Generated description should not exceed max length
            expect(metaDescription.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
          }),
          { numRuns: 100 }
        );
      });

      it("should return empty string for empty excerpt", () => {
        expect(generateMetaDescription("")).toBe("");
      });

      it("should strip HTML tags from excerpt", () => {
        fc.assert(
          fc.property(htmlExcerptArb, (htmlExcerpt) => {
            const metaDescription = generateMetaDescription(htmlExcerpt);

            // Property: No HTML tags should remain in output
            expect(metaDescription).not.toMatch(/<[^>]+>/);
          }),
          { numRuns: 50 }
        );
      });

      it("should truncate long excerpts to max length", () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: META_DESCRIPTION_MAX_LENGTH + 1, maxLength: 500 }),
            (longExcerpt) => {
              const metaDescription = generateMetaDescription(longExcerpt);

              // Property: Result should not exceed max length
              expect(metaDescription.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX_LENGTH);
            }
          ),
          { numRuns: 50 }
        );
      });

      it("should preserve short excerpts (after HTML stripping)", () => {
        fc.assert(
          fc.property(
            fc.string({ minLength: 1, maxLength: META_DESCRIPTION_MAX_LENGTH }),
            (shortExcerpt) => {
              // Only test plain text (no HTML)
              if (!shortExcerpt.includes("<") && !shortExcerpt.includes(">")) {
                const metaDescription = generateMetaDescription(shortExcerpt);

                // Property: Short plain text excerpts should be unchanged (after trim)
                expect(metaDescription).toBe(shortExcerpt.trim());
              }
            }
          ),
          { numRuns: 50 }
        );
      });

      it("should trim whitespace from result", () => {
        fc.assert(
          fc.property(
            fc.tuple(
              fc.constantFrom("", " ", "  ", "\n", "\t"),
              fc.string({ minLength: 1, maxLength: 100 }),
              fc.constantFrom("", " ", "  ", "\n", "\t")
            ),
            ([prefix, content, suffix]) => {
              const excerpt = `${prefix}${content}${suffix}`;
              const metaDescription = generateMetaDescription(excerpt);

              // Property: Result should not have leading/trailing whitespace
              expect(metaDescription).toBe(metaDescription.trim());
            }
          ),
          { numRuns: 50 }
        );
      });
    });
  });
});
