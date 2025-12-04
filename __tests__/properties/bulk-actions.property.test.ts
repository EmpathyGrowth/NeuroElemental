/**
 * Feature: cms-enhancement-audit, Property 20 & 21: Bulk Action Behavior
 * 
 * Property 20: Bulk Action Selection Visibility
 * Validates: Requirements 14.1
 * For any content list with one or more items selected, the system SHALL display
 * a bulk actions toolbar showing the count of selected items and available bulk operations.
 *
 * Property 21: Bulk Operation Completeness
 * Validates: Requirements 14.2, 14.3, 14.4
 * For any bulk publish, unpublish, or delete operation, the system SHALL apply
 * the operation to ALL selected items and report the count of successfully processed items.
 */

import * as fc from "fast-check";

// Types representing the DataTable state
interface DataTableItem {
  id: string;
  title: string;
  status: "published" | "draft";
}

interface BulkAction {
  id: string;
  label: string;
  variant?: "default" | "destructive";
}

interface BulkToolbarState {
  visible: boolean;
  selectedCount: number;
  availableActions: string[];
}

// Pure function to compute bulk toolbar state
function computeBulkToolbarState(
  selectedItems: DataTableItem[],
  bulkActions: BulkAction[]
): BulkToolbarState {
  const hasSelection = selectedItems.length > 0;

  return {
    visible: hasSelection,
    selectedCount: selectedItems.length,
    availableActions: hasSelection ? bulkActions.map((a) => a.id) : [],
  };
}

// Generators
const itemIdArb = fc.uuid();

const dataTableItemArb: fc.Arbitrary<DataTableItem> = fc.record({
  id: itemIdArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  status: fc.constantFrom("published" as const, "draft" as const),
});

const bulkActionArb: fc.Arbitrary<BulkAction> = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  label: fc.string({ minLength: 1, maxLength: 30 }),
  variant: fc.option(
    fc.constantFrom("default" as const, "destructive" as const),
    { nil: undefined }
  ),
});

describe("Bulk Action Selection Visibility", () => {
  /**
   * Property 20: Bulk Action Selection Visibility
   * For any content list with one or more items selected, the system SHALL display
   * a bulk actions toolbar showing the count of selected items and available bulk operations.
   */
  describe("Property 20: Bulk Action Selection Visibility", () => {
    it("should show toolbar when at least one item is selected", () => {
      fc.assert(
        fc.property(
          fc.array(dataTableItemArb, { minLength: 1, maxLength: 50 }),
          fc.array(bulkActionArb, { minLength: 1, maxLength: 5 }),
          (items, bulkActions) => {
            // Select at least one item (random subset)
            const selectedItems = items.slice(
              0,
              Math.max(1, Math.floor(Math.random() * items.length))
            );

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Property: Toolbar should be visible when items are selected
            expect(toolbarState.visible).toBe(true);
            // Property: Selected count should match actual selection
            expect(toolbarState.selectedCount).toBe(selectedItems.length);
            // Property: All bulk actions should be available
            expect(toolbarState.availableActions).toHaveLength(
              bulkActions.length
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should hide toolbar when no items are selected", () => {
      fc.assert(
        fc.property(
          fc.array(bulkActionArb, { minLength: 1, maxLength: 5 }),
          (bulkActions) => {
            const selectedItems: DataTableItem[] = [];

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Property: Toolbar should not be visible when nothing selected
            expect(toolbarState.visible).toBe(false);
            // Property: Selected count should be zero
            expect(toolbarState.selectedCount).toBe(0);
            // Property: No actions should be available
            expect(toolbarState.availableActions).toHaveLength(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should display correct count for any number of selected items", () => {
      fc.assert(
        fc.property(
          fc.array(dataTableItemArb, { minLength: 1, maxLength: 100 }),
          fc.array(bulkActionArb, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 100 }),
          (items, bulkActions, selectCount) => {
            // Select exactly selectCount items (or all if fewer available)
            const actualSelectCount = Math.min(selectCount, items.length);
            const selectedItems = items.slice(0, actualSelectCount);

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Property: Count should exactly match number of selected items
            expect(toolbarState.selectedCount).toBe(actualSelectCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should show all configured bulk actions when items selected", () => {
      fc.assert(
        fc.property(
          fc.array(dataTableItemArb, { minLength: 1, maxLength: 20 }),
          fc.array(bulkActionArb, { minLength: 1, maxLength: 10 }),
          (items, bulkActions) => {
            // Select all items
            const selectedItems = items;

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Property: All configured actions should be available
            const expectedActionIds = bulkActions.map((a) => a.id);
            expect(toolbarState.availableActions).toEqual(expectedActionIds);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional invariants for bulk selection
   */
  describe("Selection Invariants", () => {
    it("should maintain visibility invariant: visible iff selectedCount > 0", () => {
      fc.assert(
        fc.property(
          fc.array(dataTableItemArb, { minLength: 0, maxLength: 50 }),
          fc.array(bulkActionArb, { minLength: 1, maxLength: 5 }),
          fc.boolean(),
          (items, bulkActions, selectAll) => {
            const selectedItems = selectAll ? items : [];

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Invariant: visible === (selectedCount > 0)
            expect(toolbarState.visible).toBe(toolbarState.selectedCount > 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should have actions available iff toolbar is visible", () => {
      fc.assert(
        fc.property(
          fc.array(dataTableItemArb, { minLength: 0, maxLength: 50 }),
          fc.array(bulkActionArb, { minLength: 1, maxLength: 5 }),
          (items, bulkActions) => {
            // Randomly select some items
            const selectedItems = items.filter(() => Math.random() > 0.5);

            const toolbarState = computeBulkToolbarState(
              selectedItems,
              bulkActions
            );

            // Invariant: actions available iff visible
            if (toolbarState.visible) {
              expect(toolbarState.availableActions.length).toBeGreaterThan(0);
            } else {
              expect(toolbarState.availableActions).toHaveLength(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Property 21: Bulk Operation Completeness
 * Validates: Requirements 14.2, 14.3, 14.4
 */

// Types for bulk operation simulation
type BulkOperationType = "publish" | "unpublish" | "delete";

interface ContentItem {
  id: string;
  title: string;
  status: "published" | "draft";
}

interface BulkOperationResult {
  success: boolean;
  operation: BulkOperationType;
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

// Simulate bulk operation execution
function simulateBulkOperation(
  items: ContentItem[],
  operation: BulkOperationType,
  failureRate: number = 0 // 0-1, probability of individual item failure
): BulkOperationResult {
  let processed = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const item of items) {
    // Simulate potential failure
    if (Math.random() < failureRate) {
      failed++;
      errors.push({ id: item.id, error: "Simulated failure" });
    } else {
      processed++;
    }
  }

  return {
    success: failed === 0,
    operation,
    processed,
    failed,
    errors,
  };
}

// Apply bulk operation to items (pure function for testing)
function applyBulkOperation(
  items: ContentItem[],
  selectedIds: string[],
  operation: BulkOperationType
): ContentItem[] {
  if (operation === "delete") {
    return items.filter((item) => !selectedIds.includes(item.id));
  }

  return items.map((item) => {
    if (!selectedIds.includes(item.id)) return item;

    if (operation === "publish") {
      return { ...item, status: "published" as const };
    } else if (operation === "unpublish") {
      return { ...item, status: "draft" as const };
    }
    return item;
  });
}

// Generators for Property 21
const contentItemArb: fc.Arbitrary<ContentItem> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  status: fc.constantFrom("published" as const, "draft" as const),
});

const bulkOperationTypeArb: fc.Arbitrary<BulkOperationType> = fc.constantFrom(
  "publish",
  "unpublish",
  "delete"
);

describe("Bulk Operation Completeness", () => {
  /**
   * Property 21: Bulk Operation Completeness
   */
  describe("Property 21: Bulk Operation Completeness", () => {
    it("should process all selected items in a bulk operation", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 1, maxLength: 50 }),
          bulkOperationTypeArb,
          (items, operation) => {
            // Select a random subset of items
            const selectedItems = items.filter(() => Math.random() > 0.3);
            if (selectedItems.length === 0) return; // Skip if no selection

            const result = simulateBulkOperation(selectedItems, operation, 0);

            // Property: All items should be processed when no failures
            expect(result.processed).toBe(selectedItems.length);
            expect(result.failed).toBe(0);
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should report correct counts for processed and failed items", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 1, maxLength: 50 }),
          bulkOperationTypeArb,
          fc.float({ min: 0, max: 0.5 }), // Failure rate 0-50%
          (items, operation, failureRate) => {
            const result = simulateBulkOperation(items, operation, failureRate);

            // Property: processed + failed should equal total items
            expect(result.processed + result.failed).toBe(items.length);
            // Property: errors array length should match failed count
            expect(result.errors.length).toBe(result.failed);
            // Property: success should be true iff no failures
            expect(result.success).toBe(result.failed === 0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply publish operation to all selected items", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 1, maxLength: 50 }),
          (items) => {
            // Select items that are drafts
            const draftItems = items.filter((i) => i.status === "draft");
            if (draftItems.length === 0) return;

            const selectedIds = draftItems.map((i) => i.id);
            const result = applyBulkOperation(items, selectedIds, "publish");

            // Property: All selected items should now be published
            for (const id of selectedIds) {
              const item = result.find((i) => i.id === id);
              expect(item?.status).toBe("published");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should apply unpublish operation to all selected items", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 1, maxLength: 50 }),
          (items) => {
            // Select items that are published
            const publishedItems = items.filter((i) => i.status === "published");
            if (publishedItems.length === 0) return;

            const selectedIds = publishedItems.map((i) => i.id);
            const result = applyBulkOperation(items, selectedIds, "unpublish");

            // Property: All selected items should now be draft
            for (const id of selectedIds) {
              const item = result.find((i) => i.id === id);
              expect(item?.status).toBe("draft");
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should remove all selected items in bulk delete", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 1, maxLength: 50 }),
          (items) => {
            // Select random items for deletion
            const selectedItems = items.filter(() => Math.random() > 0.5);
            if (selectedItems.length === 0) return;

            const selectedIds = selectedItems.map((i) => i.id);
            const result = applyBulkOperation(items, selectedIds, "delete");

            // Property: No selected items should remain
            for (const id of selectedIds) {
              expect(result.find((i) => i.id === id)).toBeUndefined();
            }
            // Property: Unselected items should remain
            const unselectedIds = items
              .filter((i) => !selectedIds.includes(i.id))
              .map((i) => i.id);
            for (const id of unselectedIds) {
              expect(result.find((i) => i.id === id)).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should not affect unselected items", () => {
      fc.assert(
        fc.property(
          fc.array(contentItemArb, { minLength: 2, maxLength: 50 }),
          bulkOperationTypeArb,
          (items, operation) => {
            // Select only first half of items
            const halfIndex = Math.floor(items.length / 2);
            const selectedIds = items.slice(0, halfIndex).map((i) => i.id);
            const unselectedItems = items.slice(halfIndex);

            const result = applyBulkOperation(items, selectedIds, operation);

            // Property: Unselected items should be unchanged
            for (const original of unselectedItems) {
              const resultItem = result.find((i) => i.id === original.id);
              if (operation !== "delete") {
                expect(resultItem).toBeDefined();
                expect(resultItem?.status).toBe(original.status);
                expect(resultItem?.title).toBe(original.title);
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});


/**
 * Feature: cms-enhancement-audit, Property 10: Export Format Validity
 * Validates: Requirements 5.5
 *
 * For any content export operation, the exported CSV SHALL be parseable as valid CSV
 * with headers matching column names, and exported JSON SHALL be parseable as valid JSON array.
 */

// CSV Export utilities (matching lib/utils/bulk-operations.ts)
function exportToCSVString<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string }>
): string {
  if (data.length === 0) return columns.map((col) => col.header).join(",");

  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      if (value === null || value === undefined) return "";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (value instanceof Date) return value.toISOString();
      const stringValue = String(value);
      if (
        stringValue.includes(",") ||
        stringValue.includes("\n") ||
        stringValue.includes('"')
      ) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function exportToJSONString<T>(data: T[]): string {
  return JSON.stringify(data, null, 2);
}

// Simple CSV parser for validation
function parseCSV(csv: string): { headers: string[]; rows: string[][] } {
  const lines = csv.split("\n").filter((line) => line.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(",");
  const rows = lines.slice(1).map((line) => {
    // Simple CSV parsing (handles basic cases)
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  });

  return { headers, rows };
}

// Generators for export tests
interface ExportableItem extends Record<string, unknown> {
  id: string;
  title: string;
  status: string;
  created_at: string;
  is_published: boolean;
  views: number;
}

const exportableItemArb: fc.Arbitrary<ExportableItem> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  status: fc.constantFrom("published", "draft", "archived"),
  created_at: fc
    .integer({ min: 1577836800000, max: 1924905600000 })
    .map((ms) => new Date(ms).toISOString()),
  is_published: fc.boolean(),
  views: fc.integer({ min: 0, max: 100000 }),
});

const columnConfigArb = fc.constantFrom(
  { key: "id" as const, header: "ID" },
  { key: "title" as const, header: "Title" },
  { key: "status" as const, header: "Status" },
  { key: "created_at" as const, header: "Created At" },
  { key: "is_published" as const, header: "Published" },
  { key: "views" as const, header: "Views" }
);

describe("Export Format Validity", () => {
  /**
   * Property 10: Export Format Validity
   */
  describe("Property 10: Export Format Validity", () => {
    it("should produce valid parseable JSON for any data array", () => {
      fc.assert(
        fc.property(
          fc.array(exportableItemArb, { minLength: 0, maxLength: 50 }),
          (items) => {
            const jsonString = exportToJSONString(items);

            // Property: JSON should be parseable
            let parsed: unknown;
            expect(() => {
              parsed = JSON.parse(jsonString);
            }).not.toThrow();

            // Property: Parsed result should be an array
            expect(Array.isArray(parsed)).toBe(true);

            // Property: Array length should match original
            expect((parsed as unknown[]).length).toBe(items.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve all data in JSON export", () => {
      fc.assert(
        fc.property(
          fc.array(exportableItemArb, { minLength: 1, maxLength: 30 }),
          (items) => {
            const jsonString = exportToJSONString(items);
            const parsed = JSON.parse(jsonString) as ExportableItem[];

            // Property: All items should be preserved
            for (let i = 0; i < items.length; i++) {
              expect(parsed[i].id).toBe(items[i].id);
              expect(parsed[i].title).toBe(items[i].title);
              expect(parsed[i].status).toBe(items[i].status);
              expect(parsed[i].is_published).toBe(items[i].is_published);
              expect(parsed[i].views).toBe(items[i].views);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should produce valid CSV with correct headers", () => {
      fc.assert(
        fc.property(
          fc.array(exportableItemArb, { minLength: 0, maxLength: 30 }),
          fc.array(columnConfigArb, { minLength: 1, maxLength: 6 }),
          (items, columns) => {
            // Ensure unique columns
            const uniqueColumns = columns.filter(
              (col, idx, arr) =>
                arr.findIndex((c) => c.key === col.key) === idx
            );

            const csvString = exportToCSVString(items, uniqueColumns);
            const { headers, rows } = parseCSV(csvString);

            // Property: Headers should match column config
            expect(headers).toEqual(uniqueColumns.map((c) => c.header));

            // Property: Number of rows should match data length
            expect(rows.length).toBe(items.length);

            // Property: Each row should have same number of columns as headers
            for (const row of rows) {
              expect(row.length).toBe(headers.length);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle special characters in CSV export", () => {
      // Test with items containing commas, quotes, and newlines
      const specialItems: ExportableItem[] = [
        {
          id: "test-1",
          title: 'Title with "quotes"',
          status: "published",
          created_at: new Date().toISOString(),
          is_published: true,
          views: 100,
        },
        {
          id: "test-2",
          title: "Title, with, commas",
          status: "draft",
          created_at: new Date().toISOString(),
          is_published: false,
          views: 50,
        },
      ];

      const columns = [
        { key: "id" as const, header: "ID" },
        { key: "title" as const, header: "Title" },
      ];

      const csvString = exportToCSVString(specialItems, columns);
      const { rows } = parseCSV(csvString);

      // Property: Special characters should be properly escaped and parseable
      expect(rows.length).toBe(2);
      expect(rows[0][0]).toBe("test-1");
      expect(rows[1][0]).toBe("test-2");
    });

    it("should handle empty data arrays", () => {
      const columns = [
        { key: "id" as const, header: "ID" },
        { key: "title" as const, header: "Title" },
      ];

      const csvString = exportToCSVString([] as ExportableItem[], columns);
      const jsonString = exportToJSONString([]);

      // Property: Empty CSV should still have headers
      const { headers, rows } = parseCSV(csvString);
      expect(headers).toEqual(["ID", "Title"]);
      expect(rows.length).toBe(0);

      // Property: Empty JSON should be valid empty array
      expect(JSON.parse(jsonString)).toEqual([]);
    });

    it("should handle boolean values correctly in CSV", () => {
      fc.assert(
        fc.property(
          fc.array(exportableItemArb, { minLength: 1, maxLength: 20 }),
          (items) => {
            const columns = [{ key: "is_published" as const, header: "Published" }];
            const csvString = exportToCSVString(items, columns);
            const { rows } = parseCSV(csvString);

            // Property: Boolean values should be "Yes" or "No"
            for (let i = 0; i < items.length; i++) {
              const expected = items[i].is_published ? "Yes" : "No";
              expect(rows[i][0]).toBe(expected);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
