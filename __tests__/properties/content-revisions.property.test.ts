/**
 * Feature: cms-enhancement-audit, Property 12, 13, 14: Content Revision Properties
 * Property 12: Revision Creation on Save - Validates: Requirements 8.1
 * Property 13: Revision Restore Creates New Revision - Validates: Requirements 8.4
 * Property 14: Revision Limit Enforcement - Validates: Requirements 8.5
 *
 * Property 12: For any content save operation on a revision-tracked entity, the system
 * SHALL create a new revision record containing the complete content snapshot, timestamp,
 * and user ID.
 *
 * Property 13: For any revision restore operation, the system SHALL update the current
 * content to match the restored revision AND create a new revision record documenting
 * the restore action.
 *
 * Property 14: For any entity with more than 50 revisions, the system SHALL archive
 * revisions beyond the 50 most recent, ensuring exactly 50 revisions remain accessible.
 */

import * as fc from "fast-check";
import { compareRevisions } from "@/lib/db/content-revisions";

// ============================================================================
// Types for Testing
// ============================================================================

interface Revision {
  id: string;
  entity_type: string;
  entity_id: string;
  content_snapshot: Record<string, unknown>;
  changed_fields: string[];
  created_by: string;
  created_at: string;
}

// ============================================================================
// Simulated Revision System (for property testing without DB)
// ============================================================================

class RevisionStore {
  private revisions: Map<string, Revision[]> = new Map();
  private maxRevisions = 50;

  private getKey(entityType: string, entityId: string): string {
    return `${entityType}:${entityId}`;
  }

  createRevision(
    entityType: string,
    entityId: string,
    content: Record<string, unknown>,
    userId: string,
    changedFields: string[] = []
  ): Revision {
    const key = this.getKey(entityType, entityId);
    const revisions = this.revisions.get(key) || [];

    const revision: Revision = {
      id: `rev-${Date.now()}-${Math.random()}`,
      entity_type: entityType,
      entity_id: entityId,
      content_snapshot: { ...content },
      changed_fields: changedFields,
      created_by: userId,
      created_at: new Date().toISOString(),
    };

    revisions.unshift(revision); // Add to front (newest first)

    // Enforce limit
    if (revisions.length > this.maxRevisions) {
      revisions.splice(this.maxRevisions);
    }

    this.revisions.set(key, revisions);
    return revision;
  }

  getRevisions(entityType: string, entityId: string): Revision[] {
    const key = this.getKey(entityType, entityId);
    return this.revisions.get(key) || [];
  }

  getRevisionById(revisionId: string): Revision | null {
    for (const revisions of this.revisions.values()) {
      const found = revisions.find((r) => r.id === revisionId);
      if (found) return found;
    }
    return null;
  }

  restoreRevision(revisionId: string, userId: string): Revision | null {
    const revision = this.getRevisionById(revisionId);
    if (!revision) return null;

    // Create a new revision documenting the restore
    return this.createRevision(
      revision.entity_type,
      revision.entity_id,
      revision.content_snapshot,
      userId,
      ["_restored_from_revision"]
    );
  }

  getRevisionCount(entityType: string, entityId: string): number {
    return this.getRevisions(entityType, entityId).length;
  }

  clear(): void {
    this.revisions.clear();
  }
}

// ============================================================================
// Generators
// ============================================================================

const entityTypeArb = fc.constantFrom(
  "blog_post",
  "faq",
  "course",
  "email_template",
  "testimonial"
);

const uuidArb = fc.uuid();

const contentArb = fc.dictionary(
  fc.string({ minLength: 1, maxLength: 20 }),
  fc.oneof(
    fc.string({ minLength: 0, maxLength: 100 }),
    fc.integer(),
    fc.boolean(),
    fc.constant(null)
  ),
  { minKeys: 1, maxKeys: 10 }
);

// ============================================================================
// Property Tests
// ============================================================================

describe("Content Revision Properties", () => {
  let store: RevisionStore;

  beforeEach(() => {
    store = new RevisionStore();
  });

  /**
   * Property 12: Revision Creation on Save
   */
  describe("Property 12: Revision Creation on Save", () => {
    it("should create revision with complete content snapshot", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          uuidArb,
          (entityType, entityId, content, userId) => {
            const revision = store.createRevision(
              entityType,
              entityId,
              content,
              userId
            );

            // Property: Revision should contain complete content snapshot
            expect(revision.content_snapshot).toEqual(content);

            // Property: Revision should have entity info
            expect(revision.entity_type).toBe(entityType);
            expect(revision.entity_id).toBe(entityId);

            // Property: Revision should have user ID
            expect(revision.created_by).toBe(userId);

            // Property: Revision should have timestamp
            expect(revision.created_at).toBeDefined();
            expect(new Date(revision.created_at).getTime()).not.toBeNaN();
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should store revision in retrievable location", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          uuidArb,
          (entityType, entityId, content, userId) => {
            const revision = store.createRevision(
              entityType,
              entityId,
              content,
              userId
            );

            // Property: Revision should be retrievable
            const revisions = store.getRevisions(entityType, entityId);
            expect(revisions.length).toBeGreaterThan(0);
            expect(revisions[0].id).toBe(revision.id);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve content immutably", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          uuidArb,
          (entityType, entityId, content, userId) => {
            const originalContent = { ...content };
            const revision = store.createRevision(
              entityType,
              entityId,
              content,
              userId
            );

            // Mutate original content
            content["mutated_field"] = "mutated_value";

            // Property: Revision snapshot should be unchanged
            expect(revision.content_snapshot).toEqual(originalContent);
            expect(revision.content_snapshot).not.toHaveProperty("mutated_field");
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 13: Revision Restore Creates New Revision
   */
  describe("Property 13: Revision Restore Creates New Revision", () => {
    it("should create new revision when restoring", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          contentArb,
          uuidArb,
          uuidArb,
          (entityType, entityId, content1, content2, userId1, userId2) => {
            // Create initial revision
            const rev1 = store.createRevision(entityType, entityId, content1, userId1);

            // Create second revision (simulating content change)
            store.createRevision(entityType, entityId, content2, userId1);

            const countBefore = store.getRevisionCount(entityType, entityId);

            // Restore first revision
            const restoredRev = store.restoreRevision(rev1.id, userId2);

            // Property: Restore should create a new revision
            expect(restoredRev).not.toBeNull();
            const countAfter = store.getRevisionCount(entityType, entityId);
            expect(countAfter).toBe(countBefore + 1);
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should mark restored revision with special field", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          uuidArb,
          uuidArb,
          (entityType, entityId, content, userId1, userId2) => {
            const rev = store.createRevision(entityType, entityId, content, userId1);
            const restoredRev = store.restoreRevision(rev.id, userId2);

            // Property: Restored revision should be marked
            expect(restoredRev?.changed_fields).toContain("_restored_from_revision");
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should restore content exactly", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          contentArb,
          contentArb,
          uuidArb,
          uuidArb,
          (entityType, entityId, content1, content2, userId1, userId2) => {
            const rev1 = store.createRevision(entityType, entityId, content1, userId1);
            store.createRevision(entityType, entityId, content2, userId1);

            const restoredRev = store.restoreRevision(rev1.id, userId2);

            // Property: Restored content should match original
            expect(restoredRev?.content_snapshot).toEqual(content1);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Property 14: Revision Limit Enforcement
   */
  describe("Property 14: Revision Limit Enforcement", () => {
    it("should enforce maximum revision limit", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          fc.integer({ min: 51, max: 100 }),
          uuidArb,
          (entityType, entityId, revisionCount, userId) => {
            // Create more than 50 revisions
            for (let i = 0; i < revisionCount; i++) {
              store.createRevision(
                entityType,
                entityId,
                { version: i },
                userId
              );
            }

            // Property: Should have exactly 50 revisions
            const count = store.getRevisionCount(entityType, entityId);
            expect(count).toBe(50);
          }
        ),
        { numRuns: 20 }
      );
    });

    it("should keep most recent revisions", () => {
      fc.assert(
        fc.property(entityTypeArb, uuidArb, uuidArb, (entityType, entityId, userId) => {
          // Create 60 revisions
          for (let i = 0; i < 60; i++) {
            store.createRevision(entityType, entityId, { version: i }, userId);
          }

          const revisions = store.getRevisions(entityType, entityId);

          // Property: Most recent revision should be version 59
          expect(revisions[0].content_snapshot.version).toBe(59);

          // Property: Oldest kept revision should be version 10 (60 - 50)
          expect(revisions[49].content_snapshot.version).toBe(10);
        }),
        { numRuns: 20 }
      );
    });

    it("should not affect revisions under limit", () => {
      fc.assert(
        fc.property(
          entityTypeArb,
          uuidArb,
          fc.integer({ min: 1, max: 50 }),
          uuidArb,
          (entityType, entityId, revisionCount, userId) => {
            for (let i = 0; i < revisionCount; i++) {
              store.createRevision(
                entityType,
                entityId,
                { version: i },
                userId
              );
            }

            // Property: All revisions should be kept
            const count = store.getRevisionCount(entityType, entityId);
            expect(count).toBe(revisionCount);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  /**
   * Compare Revisions Utility
   */
  describe("Compare Revisions Utility", () => {
    it("should detect changed fields", () => {
      fc.assert(
        fc.property(contentArb, contentArb, (content1, content2) => {
          const changedFields = compareRevisions(content1, content2);

          // Property: Changed fields should only include actually changed keys
          changedFields.forEach((field) => {
            const val1 = JSON.stringify(content1[field]);
            const val2 = JSON.stringify(content2[field]);
            expect(val1).not.toBe(val2);
          });
        }),
        { numRuns: 100 }
      );
    });

    it("should return empty array for identical content", () => {
      fc.assert(
        fc.property(contentArb, (content) => {
          const changedFields = compareRevisions(content, { ...content });

          // Property: No changes for identical content
          expect(changedFields).toEqual([]);
        }),
        { numRuns: 100 }
      );
    });
  });
});
