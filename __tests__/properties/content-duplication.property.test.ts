/**
 * Feature: cms-enhancement-audit, Property 22, 23, 24: Content Duplication Properties
 *
 * Property 22: Content Duplication Naming
 * For any content duplication operation, the duplicated item SHALL have a title
 * equal to the original title with " (Copy)" appended, and SHALL have status set to 'draft'.
 * Validates: Requirements 16.2, 16.3
 *
 * Property 23: Course Duplication Completeness
 * For any course duplication operation, the duplicated course SHALL include copies
 * of all modules and lessons from the original, with preserved order and relationships.
 * Validates: Requirements 16.4
 *
 * Property 24: Duplicate Slug Uniqueness
 * For any content duplication where the content type uses slugs, the duplicated item
 * SHALL have a unique slug different from the original.
 * Validates: Requirements 16.5
 */

import * as fc from "fast-check";
import { generateCopyTitle, generateUniqueSlug } from "@/lib/content/duplication";

// ============================================================================
// Types for Testing
// ============================================================================

interface ContentItem {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
}

interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
}

interface Lesson {
  id: string;
  module_id: string;
  title: string;
  order_index: number;
}

interface Course extends ContentItem {
  modules: Module[];
  lessons: Lesson[];
}

// ============================================================================
// Simulated Duplication System (for property testing without DB)
// ============================================================================

class ContentStore {
  private items: Map<string, ContentItem> = new Map();
  private slugs: Set<string> = new Set();

  addItem(item: ContentItem): void {
    this.items.set(item.id, item);
    this.slugs.add(item.slug);
  }

  hasSlug(slug: string): boolean {
    return this.slugs.has(slug);
  }

  generateUniqueSlugSync(baseSlug: string): string {
    let slug = `${baseSlug}-copy`;
    let counter = 1;

    while (this.hasSlug(slug)) {
      counter++;
      slug = `${baseSlug}-copy-${counter}`;
    }

    return slug;
  }

  duplicateItem(originalId: string): ContentItem | null {
    const original = this.items.get(originalId);
    if (!original) return null;

    const newTitle = generateCopyTitle(original.title);
    const newSlug = this.generateUniqueSlugSync(original.slug);
    const newId = `dup-${Date.now()}-${Math.random()}`;

    const duplicate: ContentItem = {
      id: newId,
      title: newTitle,
      slug: newSlug,
      is_published: false, // Always draft
    };

    this.addItem(duplicate);
    return duplicate;
  }

  clear(): void {
    this.items.clear();
    this.slugs.clear();
  }
}

class CourseStore {
  private courses: Map<string, Course> = new Map();
  private slugs: Set<string> = new Set();

  addCourse(course: Course): void {
    this.courses.set(course.id, course);
    this.slugs.add(course.slug);
  }

  hasSlug(slug: string): boolean {
    return this.slugs.has(slug);
  }

  generateUniqueSlugSync(baseSlug: string): string {
    let slug = `${baseSlug}-copy`;
    let counter = 1;

    while (this.hasSlug(slug)) {
      counter++;
      slug = `${baseSlug}-copy-${counter}`;
    }

    return slug;
  }

  duplicateCourse(originalId: string): Course | null {
    const original = this.courses.get(originalId);
    if (!original) return null;

    const newTitle = generateCopyTitle(original.title);
    const newSlug = this.generateUniqueSlugSync(original.slug);
    const newCourseId = `course-dup-${Date.now()}-${Math.random()}`;

    // Duplicate modules with new IDs
    const moduleIdMap = new Map<string, string>();
    const newModules: Module[] = original.modules.map((m, idx) => {
      const newModuleId = `module-dup-${idx}-${Date.now()}`;
      moduleIdMap.set(m.id, newModuleId);
      return {
        id: newModuleId,
        course_id: newCourseId,
        title: m.title,
        order_index: m.order_index,
      };
    });

    // Duplicate lessons with updated module references
    const newLessons: Lesson[] = original.lessons.map((l, idx) => ({
      id: `lesson-dup-${idx}-${Date.now()}`,
      module_id: moduleIdMap.get(l.module_id) || l.module_id,
      title: l.title,
      order_index: l.order_index,
    }));

    const duplicate: Course = {
      id: newCourseId,
      title: newTitle,
      slug: newSlug,
      is_published: false,
      modules: newModules,
      lessons: newLessons,
    };

    this.addCourse(duplicate);
    return duplicate;
  }

  clear(): void {
    this.courses.clear();
    this.slugs.clear();
  }
}

// ============================================================================
// Generators
// ============================================================================

const titleArb = fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0);

const slugArb = fc
  .string({ minLength: 1, maxLength: 50 })
  .map((s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "item"
  );

const contentItemArb = fc.record({
  id: fc.uuid(),
  title: titleArb,
  slug: slugArb,
  is_published: fc.boolean(),
});

const moduleArb = (courseId: string) =>
  fc.record({
    id: fc.uuid(),
    course_id: fc.constant(courseId),
    title: titleArb,
    order_index: fc.integer({ min: 0, max: 100 }),
  });

const lessonArb = (moduleId: string) =>
  fc.record({
    id: fc.uuid(),
    module_id: fc.constant(moduleId),
    title: titleArb,
    order_index: fc.integer({ min: 0, max: 100 }),
  });

// ============================================================================
// Property Tests
// ============================================================================

describe("Content Duplication Properties", () => {
  /**
   * Property 22: Content Duplication Naming
   * Validates: Requirements 16.2, 16.3
   */
  describe("Property 22: Content Duplication Naming", () => {
    let store: ContentStore;

    beforeEach(() => {
      store = new ContentStore();
    });

    it("should append (Copy) suffix to duplicated title", () => {
      fc.assert(
        fc.property(contentItemArb, (original) => {
          store.clear();
          store.addItem(original);

          const duplicate = store.duplicateItem(original.id);

          // Property: Duplicate title should have (Copy) suffix
          expect(duplicate).not.toBeNull();
          expect(duplicate!.title).toContain("(Copy)");
        }),
        { numRuns: 100 }
      );
    });

    it("should set duplicate status to draft (is_published = false)", () => {
      fc.assert(
        fc.property(contentItemArb, (original) => {
          store.clear();
          store.addItem(original);

          const duplicate = store.duplicateItem(original.id);

          // Property: Duplicate should always be draft
          expect(duplicate).not.toBeNull();
          expect(duplicate!.is_published).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it("should increment copy number when duplicating a duplicate", () => {
      fc.assert(
        fc.property(contentItemArb, (original) => {
          store.clear();
          store.addItem(original);

          // Duplicate the original
          const dup1 = store.duplicateItem(original.id);
          expect(dup1).not.toBeNull();

          // Duplicate the duplicate (should get "Copy 2")
          const dup2 = store.duplicateItem(dup1!.id);

          // Property: Duplicating a copy should increment the copy number
          expect(dup2).not.toBeNull();
          expect(dup2!.title).toContain("(Copy 2)");
        }),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 24: Duplicate Slug Uniqueness
   * Validates: Requirements 16.5
   */
  describe("Property 24: Duplicate Slug Uniqueness", () => {
    let store: ContentStore;

    beforeEach(() => {
      store = new ContentStore();
    });

    it("should generate unique slug different from original", () => {
      fc.assert(
        fc.property(contentItemArb, (original) => {
          store.clear();
          store.addItem(original);

          const duplicate = store.duplicateItem(original.id);

          // Property: Duplicate slug should be different from original
          expect(duplicate).not.toBeNull();
          expect(duplicate!.slug).not.toBe(original.slug);
        }),
        { numRuns: 100 }
      );
    });

    it("should generate unique slugs for multiple duplications", () => {
      fc.assert(
        fc.property(contentItemArb, (original) => {
          store.clear();
          store.addItem(original);

          const duplicates: ContentItem[] = [];
          for (let i = 0; i < 5; i++) {
            const dup = store.duplicateItem(original.id);
            if (dup) duplicates.push(dup);
          }

          // Property: All slugs should be unique
          const allSlugs = [original.slug, ...duplicates.map((d) => d.slug)];
          const uniqueSlugs = new Set(allSlugs);
          expect(uniqueSlugs.size).toBe(allSlugs.length);
        }),
        { numRuns: 50 }
      );
    });

    it("should handle slug conflicts gracefully", () => {
      fc.assert(
        fc.property(slugArb, (baseSlug) => {
          store.clear();

          // Pre-populate with conflicting slugs
          store.addItem({ id: "1", title: "Original", slug: baseSlug, is_published: true });
          store.addItem({ id: "2", title: "Copy 1", slug: `${baseSlug}-copy`, is_published: false });
          store.addItem({ id: "3", title: "Copy 2", slug: `${baseSlug}-copy-2`, is_published: false });

          const newSlug = store.generateUniqueSlugSync(baseSlug);

          // Property: Generated slug should not conflict with existing
          expect(store.hasSlug(newSlug)).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 23: Course Duplication Completeness
   * Validates: Requirements 16.4
   */
  describe("Property 23: Course Duplication Completeness", () => {
    let store: CourseStore;

    beforeEach(() => {
      store = new CourseStore();
    });

    it("should duplicate all modules from original course", () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          titleArb,
          slugArb,
          fc.integer({ min: 1, max: 10 }),
          (courseId, title, slug, moduleCount) => {
            store.clear();

            const modules: Module[] = [];
            for (let i = 0; i < moduleCount; i++) {
              modules.push({
                id: `module-${i}`,
                course_id: courseId,
                title: `Module ${i}`,
                order_index: i,
              });
            }

            const original: Course = {
              id: courseId,
              title,
              slug,
              is_published: true,
              modules,
              lessons: [],
            };

            store.addCourse(original);
            const duplicate = store.duplicateCourse(courseId);

            // Property: Duplicate should have same number of modules
            expect(duplicate).not.toBeNull();
            expect(duplicate!.modules.length).toBe(original.modules.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should duplicate all lessons from original course", () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          titleArb,
          slugArb,
          fc.integer({ min: 1, max: 5 }),
          fc.integer({ min: 1, max: 5 }),
          (courseId, title, slug, moduleCount, lessonsPerModule) => {
            store.clear();

            const modules: Module[] = [];
            const lessons: Lesson[] = [];

            for (let i = 0; i < moduleCount; i++) {
              const moduleId = `module-${i}`;
              modules.push({
                id: moduleId,
                course_id: courseId,
                title: `Module ${i}`,
                order_index: i,
              });

              for (let j = 0; j < lessonsPerModule; j++) {
                lessons.push({
                  id: `lesson-${i}-${j}`,
                  module_id: moduleId,
                  title: `Lesson ${i}.${j}`,
                  order_index: j,
                });
              }
            }

            const original: Course = {
              id: courseId,
              title,
              slug,
              is_published: true,
              modules,
              lessons,
            };

            store.addCourse(original);
            const duplicate = store.duplicateCourse(courseId);

            // Property: Duplicate should have same number of lessons
            expect(duplicate).not.toBeNull();
            expect(duplicate!.lessons.length).toBe(original.lessons.length);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should preserve module order in duplicated course", () => {
      fc.assert(
        fc.property(
          fc.uuid(),
          titleArb,
          slugArb,
          fc.array(fc.integer({ min: 0, max: 100 }), { minLength: 2, maxLength: 10 }),
          (courseId, title, slug, orderIndices) => {
            store.clear();

            const modules: Module[] = orderIndices.map((order, i) => ({
              id: `module-${i}`,
              course_id: courseId,
              title: `Module ${i}`,
              order_index: order,
            }));

            const original: Course = {
              id: courseId,
              title,
              slug,
              is_published: true,
              modules,
              lessons: [],
            };

            store.addCourse(original);
            const duplicate = store.duplicateCourse(courseId);

            // Property: Module order should be preserved
            expect(duplicate).not.toBeNull();
            const originalOrders = original.modules.map((m) => m.order_index);
            const duplicateOrders = duplicate!.modules.map((m) => m.order_index);
            expect(duplicateOrders).toEqual(originalOrders);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should set duplicated course to draft status", () => {
      fc.assert(
        fc.property(fc.uuid(), titleArb, slugArb, fc.boolean(), (courseId, title, slug, isPublished) => {
          store.clear();

          const original: Course = {
            id: courseId,
            title,
            slug,
            is_published: isPublished,
            modules: [],
            lessons: [],
          };

          store.addCourse(original);
          const duplicate = store.duplicateCourse(courseId);

          // Property: Duplicate course should always be draft
          expect(duplicate).not.toBeNull();
          expect(duplicate!.is_published).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * generateCopyTitle utility tests
   */
  describe("generateCopyTitle utility", () => {
    it("should append (Copy) to titles without copy suffix", () => {
      fc.assert(
        fc.property(
          titleArb.filter((t) => !t.includes("(Copy")),
          (title) => {
            const result = generateCopyTitle(title);
            expect(result).toBe(`${title} (Copy)`);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should increment copy number for titles with existing (Copy)", () => {
      const result1 = generateCopyTitle("My Title (Copy)");
      expect(result1).toBe("My Title (Copy 2)");

      const result2 = generateCopyTitle("My Title (Copy 2)");
      expect(result2).toBe("My Title (Copy 3)");

      const result3 = generateCopyTitle("My Title (Copy 99)");
      expect(result3).toBe("My Title (Copy 100)");
    });
  });
});
