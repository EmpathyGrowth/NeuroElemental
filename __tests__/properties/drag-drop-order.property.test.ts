/**
 * Feature: cms-enhancement-audit, Property 4: Drag-Drop Reorder Persistence
 * Validates: Requirements 3.4, 11.2, 11.4, 11.5
 *
 * Property: For any ordered list of items, when items are reordered via drag-and-drop,
 * the system SHALL update all affected display_order values such that the new order
 * is persisted and reflected in subsequent queries.
 */

import * as fc from "fast-check";
import { arrayMove } from "@dnd-kit/sortable";
import { updateDisplayOrder } from "@/components/ui/drag-drop-list";

interface OrderedItem {
  id: string;
  title: string;
  display_order: number;
}

// Generator for ordered items
const orderedItemArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 50 }),
  display_order: fc.integer({ min: 1, max: 1000 }),
});

// Generator for a list of ordered items
const orderedItemsArb = fc
  .array(orderedItemArb, { minLength: 2, maxLength: 20 })
  .map((items) =>
    items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }))
  );

describe("Drag-Drop Order Persistence", () => {
  /**
   * Property: After reordering, all items should have sequential display_order values
   * starting from 1, with no gaps or duplicates.
   */
  it("should maintain sequential display_order values after reorder", () => {
    fc.assert(
      fc.property(
        orderedItemsArb,
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (items, fromOffset, toOffset) => {
          // Ensure valid indices
          const fromIndex = fromOffset % items.length;
          const toIndex = toOffset % items.length;

          // Simulate drag-drop reorder
          const reorderedItems = arrayMove(items, fromIndex, toIndex);

          // Apply display_order update
          const updatedItems = updateDisplayOrder(reorderedItems);

          // Property 1: All display_order values should be sequential starting from 1
          const displayOrders = updatedItems.map((item) => item.display_order);
          const expectedOrders = Array.from(
            { length: items.length },
            (_, i) => i + 1
          );

          expect(displayOrders).toEqual(expectedOrders);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Reordering should preserve all original items (no items lost or duplicated)
   */
  it("should preserve all items after reorder", () => {
    fc.assert(
      fc.property(
        orderedItemsArb,
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (items, fromOffset, toOffset) => {
          const fromIndex = fromOffset % items.length;
          const toIndex = toOffset % items.length;

          const reorderedItems = arrayMove(items, fromIndex, toIndex);
          const updatedItems = updateDisplayOrder(reorderedItems);

          // Property 2: Same number of items
          expect(updatedItems.length).toBe(items.length);

          // Property 3: All original IDs are present
          const originalIds = new Set(items.map((item) => item.id));
          const reorderedIds = new Set(updatedItems.map((item) => item.id));

          expect(reorderedIds).toEqual(originalIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: The item at the target position should be the moved item
   */
  it("should place the moved item at the correct position", () => {
    fc.assert(
      fc.property(
        orderedItemsArb,
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (items, fromOffset, toOffset) => {
          const fromIndex = fromOffset % items.length;
          const toIndex = toOffset % items.length;

          const movedItem = items[fromIndex];
          const reorderedItems = arrayMove(items, fromIndex, toIndex);

          // Property 4: The moved item should be at the target index
          expect(reorderedItems[toIndex].id).toBe(movedItem.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Reordering to the same position should be a no-op
   */
  it("should be idempotent when moving to same position", () => {
    fc.assert(
      fc.property(orderedItemsArb, fc.integer({ min: 0 }), (items, offset) => {
        const index = offset % items.length;

        const reorderedItems = arrayMove(items, index, index);
        const updatedItems = updateDisplayOrder(reorderedItems);

        // Property 5: Items should be in the same order
        items.forEach((item, i) => {
          expect(updatedItems[i].id).toBe(item.id);
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Property: Double reorder (A->B then B->A) should restore original order
   */
  it("should restore original order after reverse reorder", () => {
    fc.assert(
      fc.property(
        orderedItemsArb,
        fc.integer({ min: 0 }),
        fc.integer({ min: 0 }),
        (items, fromOffset, toOffset) => {
          const fromIndex = fromOffset % items.length;
          const toIndex = toOffset % items.length;

          // First reorder: from -> to
          const firstReorder = arrayMove(items, fromIndex, toIndex);

          // Second reorder: to -> from (reverse)
          const secondReorder = arrayMove(firstReorder, toIndex, fromIndex);

          // Property 6: Should restore original order
          items.forEach((item, i) => {
            expect(secondReorder[i].id).toBe(item.id);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
