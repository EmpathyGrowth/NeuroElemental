/**
 * Feature: cms-enhancement-audit, Property 5: Filter Results Subset
 * Validates: Requirements 3.5, 7.5
 *
 * Property: For any content list with applied filters, the filtered results SHALL be
 * a subset of the unfiltered results, and every item in the filtered results SHALL
 * match all active filter criteria.
 */

import * as fc from "fast-check";

// ============================================================================
// Types
// ============================================================================

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  element: string | null;
  is_published: boolean;
  is_verified: boolean;
  display_order: number;
}

type ElementType = "Electric" | "Fire" | "Water" | "Earth" | "Air" | "Metal";

interface FilterCriteria {
  element: ElementType | null;
  status: "published" | "draft" | null;
  verified: "verified" | "not_verified" | null;
  search: string | null;
}

// ============================================================================
// Filter Implementation (mirrors the page logic)
// ============================================================================

function filterTestimonials(
  testimonials: Testimonial[],
  filters: FilterCriteria
): Testimonial[] {
  let result = testimonials;

  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.role?.toLowerCase().includes(q) ||
        t.quote.toLowerCase().includes(q)
    );
  }

  if (filters.element) {
    result = result.filter((t) => t.element === filters.element);
  }

  if (filters.status) {
    const isPublished = filters.status === "published";
    result = result.filter((t) => t.is_published === isPublished);
  }

  if (filters.verified) {
    const isVerified = filters.verified === "verified";
    result = result.filter((t) => t.is_verified === isVerified);
  }

  return result;
}

// ============================================================================
// Generators
// ============================================================================

const elementArb = fc.constantFrom<ElementType | null>(
  "Electric",
  "Fire",
  "Water",
  "Earth",
  "Air",
  "Metal",
  null
);

const testimonialArb: fc.Arbitrary<Testimonial> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  role: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
  quote: fc.string({ minLength: 1, maxLength: 200 }),
  element: elementArb,
  is_published: fc.boolean(),
  is_verified: fc.boolean(),
  display_order: fc.integer({ min: 0, max: 100 }),
});

const testimonialsArb = fc.array(testimonialArb, { minLength: 0, maxLength: 20 });

const filterCriteriaArb: fc.Arbitrary<FilterCriteria> = fc.record({
  element: fc.constantFrom<ElementType | null>(
    "Electric",
    "Fire",
    "Water",
    "Earth",
    "Air",
    "Metal",
    null
  ),
  status: fc.constantFrom<"published" | "draft" | null>("published", "draft", null),
  verified: fc.constantFrom<"verified" | "not_verified" | null>(
    "verified",
    "not_verified",
    null
  ),
  search: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null }),
});

// ============================================================================
// Property Tests
// ============================================================================

describe("Testimonial Filter Properties", () => {
  /**
   * Property 5: Filter Results Subset
   * Filtered results should always be a subset of unfiltered results
   */
  describe("Property 5: Filter Results Subset", () => {
    it("filtered results should be a subset of unfiltered results", () => {
      fc.assert(
        fc.property(testimonialsArb, filterCriteriaArb, (testimonials, filters) => {
          const filtered = filterTestimonials(testimonials, filters);

          // Property: Every filtered item should exist in the original list
          const originalIds = new Set(testimonials.map((t) => t.id));
          filtered.forEach((item) => {
            expect(originalIds.has(item.id)).toBe(true);
          });

          // Property: Filtered count should be <= original count
          expect(filtered.length).toBeLessThanOrEqual(testimonials.length);
        }),
        { numRuns: 100 }
      );
    });

    it("every filtered item should match all active filter criteria", () => {
      fc.assert(
        fc.property(testimonialsArb, filterCriteriaArb, (testimonials, filters) => {
          const filtered = filterTestimonials(testimonials, filters);

          filtered.forEach((item) => {
            // Check element filter
            if (filters.element) {
              expect(item.element).toBe(filters.element);
            }

            // Check status filter
            if (filters.status) {
              const expectedPublished = filters.status === "published";
              expect(item.is_published).toBe(expectedPublished);
            }

            // Check verified filter
            if (filters.verified) {
              const expectedVerified = filters.verified === "verified";
              expect(item.is_verified).toBe(expectedVerified);
            }

            // Check search filter
            if (filters.search) {
              const q = filters.search.toLowerCase();
              const matchesSearch =
                item.name.toLowerCase().includes(q) ||
                item.role?.toLowerCase().includes(q) ||
                item.quote.toLowerCase().includes(q);
              expect(matchesSearch).toBe(true);
            }
          });
        }),
        { numRuns: 100 }
      );
    });

    it("no filters should return all items", () => {
      fc.assert(
        fc.property(testimonialsArb, (testimonials) => {
          const noFilters: FilterCriteria = {
            element: null,
            status: null,
            verified: null,
            search: null,
          };

          const filtered = filterTestimonials(testimonials, noFilters);

          // Property: No filters should return all items
          expect(filtered.length).toBe(testimonials.length);
          expect(filtered).toEqual(testimonials);
        }),
        { numRuns: 100 }
      );
    });

    it("combining filters should be more restrictive", () => {
      fc.assert(
        fc.property(
          testimonialsArb,
          elementArb,
          fc.constantFrom<"published" | "draft" | null>("published", "draft", null),
          (testimonials, element, status) => {
            // Filter with just element
            const elementOnly = filterTestimonials(testimonials, {
              element,
              status: null,
              verified: null,
              search: null,
            });

            // Filter with element AND status
            const combined = filterTestimonials(testimonials, {
              element,
              status,
              verified: null,
              search: null,
            });

            // Property: Combined filters should be <= single filter
            expect(combined.length).toBeLessThanOrEqual(elementOnly.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Filter idempotence - applying same filter twice should give same result
   */
  describe("Filter Idempotence", () => {
    it("applying the same filter twice should give the same result", () => {
      fc.assert(
        fc.property(testimonialsArb, filterCriteriaArb, (testimonials, filters) => {
          const firstFilter = filterTestimonials(testimonials, filters);
          const secondFilter = filterTestimonials(firstFilter, filters);

          // Property: Filtering already filtered data should give same result
          expect(secondFilter).toEqual(firstFilter);
        }),
        { numRuns: 100 }
      );
    });
  });
});
