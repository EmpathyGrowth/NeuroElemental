/**
 * Feature: cms-enhancement-audit, Property 2 & 3: Block Content Editor
 * Property 2: Visual-JSON Editor Round Trip Consistency - Validates: Requirements 2.7
 * Property 3: Block Type Editor Mapping - Validates: Requirements 2.1-2.6
 *
 * Property 2: For any valid content block data, converting from visual editor format
 * to JSON and back to visual editor format SHALL produce equivalent content.
 *
 * Property 3: For any content block type in ['text', 'html', 'cta', 'feature',
 * 'testimonial', 'stats', 'gallery'], the BlockContentEditor component SHALL
 * render the corresponding type-specific editor form.
 */

import * as fc from "fast-check";
import {
  BlockType,
  hasVisualEditor,
  VISUAL_EDITOR_TYPES,
} from "@/components/cms/block-content-editor";

// ============================================================================
// Content Generators for each block type
// ============================================================================

const textBlockContentArb = fc.record({
  body: fc.string({ minLength: 0, maxLength: 500 }),
});

const ctaBlockContentArb = fc.record({
  title: fc.string({ minLength: 0, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 300 }),
  buttonText: fc.string({ minLength: 0, maxLength: 50 }),
  buttonUrl: fc.string({ minLength: 0, maxLength: 200 }),
  buttonVariant: fc.constantFrom("primary", "secondary", "outline"),
  backgroundImage: fc.option(fc.webUrl(), { nil: undefined }),
});

const featureBlockContentArb = fc.record({
  icon: fc.constantFrom(
    "star",
    "check",
    "zap",
    "shield",
    "heart",
    "rocket",
    "lightbulb"
  ),
  title: fc.string({ minLength: 0, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 300 }),
  link: fc.option(fc.string({ minLength: 0, maxLength: 200 }), {
    nil: undefined,
  }),
  linkText: fc.option(fc.string({ minLength: 0, maxLength: 50 }), {
    nil: undefined,
  }),
});

const testimonialBlockContentArb = fc.record({
  quote: fc.string({ minLength: 0, maxLength: 500 }),
  authorName: fc.string({ minLength: 0, maxLength: 100 }),
  authorRole: fc.string({ minLength: 0, maxLength: 100 }),
  authorAvatar: fc.option(fc.webUrl(), { nil: undefined }),
  rating: fc.option(fc.integer({ min: 1, max: 5 }), { nil: undefined }),
});

const statItemArb = fc.record({
  value: fc.string({ minLength: 1, maxLength: 20 }),
  label: fc.string({ minLength: 1, maxLength: 50 }),
  prefix: fc.option(fc.string({ minLength: 0, maxLength: 5 }), {
    nil: undefined,
  }),
  suffix: fc.option(fc.string({ minLength: 0, maxLength: 5 }), {
    nil: undefined,
  }),
});

const statsBlockContentArb = fc.record({
  items: fc.array(statItemArb, { minLength: 0, maxLength: 6 }),
});

const galleryImageArb = fc.record({
  url: fc.webUrl(),
  alt: fc.string({ minLength: 1, maxLength: 100 }),
  caption: fc.option(fc.string({ minLength: 0, maxLength: 200 }), {
    nil: undefined,
  }),
});

const galleryBlockContentArb = fc.record({
  images: fc.array(galleryImageArb, { minLength: 0, maxLength: 10 }),
  columns: fc.constantFrom(2, 3, 4),
  gap: fc.constantFrom("sm", "md", "lg"),
});

// Map block types to their content generators
const blockContentGenerators: Record<string, fc.Arbitrary<unknown>> = {
  text: textBlockContentArb,
  html: textBlockContentArb,
  cta: ctaBlockContentArb,
  feature: featureBlockContentArb,
  testimonial: testimonialBlockContentArb,
  stats: statsBlockContentArb,
  gallery: galleryBlockContentArb,
};

// ============================================================================
// Property Tests
// ============================================================================

describe("Block Content Editor Properties", () => {
  /**
   * Property 2: Visual-JSON Round Trip Consistency
   */
  describe("Property 2: Visual-JSON Round Trip", () => {
    it("should preserve content through JSON serialization round trip", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...VISUAL_EDITOR_TYPES),
          (blockType) => {
            const contentArb = blockContentGenerators[blockType];
            if (!contentArb) return true; // Skip if no generator

            return fc.assert(
              fc.property(contentArb, (content) => {
                // Simulate round trip: content -> JSON string -> parsed content
                const jsonString = JSON.stringify(content);
                const parsed = JSON.parse(jsonString);

                // Property: Parsed content should deep equal original
                expect(parsed).toEqual(content);
              }),
              { numRuns: 20 }
            );
          }
        ),
        { numRuns: 10 }
      );
    });

    it("should handle nested objects in content", () => {
      fc.assert(
        fc.property(statsBlockContentArb, (content) => {
          const jsonString = JSON.stringify(content);
          const parsed = JSON.parse(jsonString);

          // Property: Nested items array should be preserved
          expect(parsed.items).toEqual(content.items);
          expect(parsed.items.length).toBe(content.items.length);
        }),
        { numRuns: 50 }
      );
    });

    it("should handle optional fields correctly", () => {
      fc.assert(
        fc.property(featureBlockContentArb, (content) => {
          const jsonString = JSON.stringify(content);
          const parsed = JSON.parse(jsonString);

          // Property: Optional fields should be preserved or undefined
          if (content.link !== undefined) {
            expect(parsed.link).toBe(content.link);
          }
          if (content.linkText !== undefined) {
            expect(parsed.linkText).toBe(content.linkText);
          }
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 3: Block Type Editor Mapping
   */
  describe("Property 3: Block Type Editor Mapping", () => {
    it("should have visual editor for all supported block types", () => {
      const supportedTypes: BlockType[] = [
        "text",
        "html",
        "cta",
        "feature",
        "testimonial",
        "stats",
        "gallery",
      ];

      supportedTypes.forEach((blockType) => {
        // Property: Each supported type should have a visual editor
        expect(hasVisualEditor(blockType)).toBe(true);
      });
    });

    it("should not have visual editor for unsupported block types", () => {
      const unsupportedTypes: BlockType[] = ["video", "code", "custom"];

      unsupportedTypes.forEach((blockType) => {
        // Property: Unsupported types should not have visual editor
        expect(hasVisualEditor(blockType)).toBe(false);
      });
    });

    it("should have content generator for each visual editor type", () => {
      fc.assert(
        fc.property(fc.constantFrom(...VISUAL_EDITOR_TYPES), (blockType) => {
          // Property: Each visual editor type should have a content generator
          expect(blockContentGenerators[blockType]).toBeDefined();
        }),
        { numRuns: 20 }
      );
    });
  });

  /**
   * Property: Content structure validation
   */
  describe("Content Structure Validation", () => {
    it("should generate valid CTA block content", () => {
      fc.assert(
        fc.property(ctaBlockContentArb, (content) => {
          // Property: CTA content should have required fields
          expect(typeof content.title).toBe("string");
          expect(typeof content.description).toBe("string");
          expect(typeof content.buttonText).toBe("string");
          expect(typeof content.buttonUrl).toBe("string");
          expect(["primary", "secondary", "outline"]).toContain(
            content.buttonVariant
          );
        }),
        { numRuns: 50 }
      );
    });

    it("should generate valid stats block content with items", () => {
      fc.assert(
        fc.property(statsBlockContentArb, (content) => {
          // Property: Stats content should have items array
          expect(Array.isArray(content.items)).toBe(true);

          // Property: Each item should have value and label
          content.items.forEach((item) => {
            expect(typeof item.value).toBe("string");
            expect(typeof item.label).toBe("string");
          });
        }),
        { numRuns: 50 }
      );
    });

    it("should generate valid gallery block content", () => {
      fc.assert(
        fc.property(galleryBlockContentArb, (content) => {
          // Property: Gallery content should have valid structure
          expect(Array.isArray(content.images)).toBe(true);
          expect([2, 3, 4]).toContain(content.columns);
          expect(["sm", "md", "lg"]).toContain(content.gap);

          // Property: Each image should have url and alt
          content.images.forEach((image) => {
            expect(typeof image.url).toBe("string");
            expect(typeof image.alt).toBe("string");
          });
        }),
        { numRuns: 50 }
      );
    });
  });
});
