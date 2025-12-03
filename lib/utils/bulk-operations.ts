/**
 * Bulk Operations Utility
 * 
 * Provides client-side utilities for performing bulk operations on content items.
 * Used by admin pages to handle bulk publish, unpublish, delete, and export operations.
 */

export type ContentType =
  | "blog_posts"
  | "courses"
  | "events"
  | "faqs"
  | "testimonials"
  | "announcements"
  | "email_templates";

export type BulkOperation = "publish" | "unpublish" | "delete";

export interface BulkOperationResult {
  success: boolean;
  operation: BulkOperation;
  contentType: ContentType;
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * Perform a bulk operation on content items
 */
export async function performBulkOperation(
  contentType: ContentType,
  operation: BulkOperation,
  ids: string[]
): Promise<BulkOperationResult> {
  const response = await fetch("/api/admin/bulk", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType, operation, ids }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    return {
      success: false,
      operation,
      contentType,
      processed: 0,
      failed: ids.length,
      errors: [{ id: "request", error: error.error || "Request failed" }],
    };
  }

  return response.json();
}

/**
 * Export data to CSV format
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: Array<{ key: keyof T; header: string }>,
  filename: string
): void {
  if (data.length === 0) return;

  const headers = columns.map((col) => col.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      const value = item[col.key];
      // Handle different value types
      if (value === null || value === undefined) return "";
      if (typeof value === "boolean") return value ? "Yes" : "No";
      if (value instanceof Date) return value.toISOString();
      // Escape quotes and wrap in quotes if contains comma or newline
      const stringValue = String(value);
      if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    })
  );

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  downloadFile(csvContent, `${filename}.csv`, "text/csv;charset=utf-8;");
}

/**
 * Export data to JSON format
 */
export function exportToJSON<T>(data: T[], filename: string): void {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, "application/json");
}

/**
 * Helper to download a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

/**
 * Generate a timestamped filename for exports
 */
export function generateExportFilename(prefix: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${prefix}_export_${date}`;
}

/**
 * Validate that all items have the required ID field
 */
export function validateBulkItems<T extends { id: string }>(
  items: T[]
): { valid: boolean; ids: string[] } {
  const ids = items.map((item) => item.id).filter(Boolean);
  return {
    valid: ids.length === items.length,
    ids,
  };
}
