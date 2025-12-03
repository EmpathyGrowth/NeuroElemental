import {
  createAdminRoute,
  successResponse,
  badRequestError,
  notFoundError,
} from "@/lib/api";
import { createServerClient } from "@/lib/supabase/server";
import { z } from "zod";

/**
 * Supported content types for bulk operations
 */
const SUPPORTED_CONTENT_TYPES = [
  "blog_posts",
  "courses",
  "events",
  "faqs",
  "testimonials",
  "announcements",
  "email_templates",
] as const;

type ContentType = (typeof SUPPORTED_CONTENT_TYPES)[number];

/**
 * Bulk operation types
 */
const BULK_OPERATIONS = ["publish", "unpublish", "delete"] as const;
type BulkOperation = (typeof BULK_OPERATIONS)[number];

/**
 * Schema for bulk operation request
 */
const bulkOperationSchema = z.object({
  contentType: z.enum(SUPPORTED_CONTENT_TYPES),
  operation: z.enum(BULK_OPERATIONS),
  ids: z.array(z.string().uuid()).min(1, "At least one ID is required"),
});

/**
 * Get the status field name for a content type
 */
function getStatusField(contentType: ContentType): string {
  switch (contentType) {
    case "blog_posts":
    case "testimonials":
    case "announcements":
      return "is_published";
    case "courses":
    case "events":
      return "status";
    case "faqs":
      return "is_active";
    case "email_templates":
      return "is_active";
    default:
      return "is_published";
  }
}

/**
 * Get the publish value for a content type
 */
function getPublishValue(
  contentType: ContentType,
  publish: boolean
): boolean | string {
  switch (contentType) {
    case "courses":
    case "events":
      return publish ? "published" : "draft";
    default:
      return publish;
  }
}

interface BulkOperationResult {
  success: boolean;
  operation: BulkOperation;
  contentType: ContentType;
  processed: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
}

/**
 * POST /api/admin/bulk
 * Perform bulk operations on content items
 */
export const POST = createAdminRoute(async (req) => {
  const body = await req.json();
  const parsed = bulkOperationSchema.safeParse(body);

  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid request body"
    );
  }

  const { contentType, operation, ids } = parsed.data;
  const supabase = await createServerClient();

  const result: BulkOperationResult = {
    success: true,
    operation,
    contentType,
    processed: 0,
    failed: 0,
    errors: [],
  };

  if (operation === "delete") {
    // Bulk delete
    const { error, count } = await supabase
      .from(contentType)
      .delete()
      .in("id", ids);

    if (error) {
      result.success = false;
      result.failed = ids.length;
      result.errors.push({ id: "bulk", error: error.message });
    } else {
      result.processed = count || ids.length;
    }
  } else {
    // Bulk publish/unpublish
    const statusField = getStatusField(contentType);
    const statusValue = getPublishValue(contentType, operation === "publish");

    const { error, count } = await supabase
      .from(contentType)
      .update({ [statusField]: statusValue, updated_at: new Date().toISOString() })
      .in("id", ids);

    if (error) {
      result.success = false;
      result.failed = ids.length;
      result.errors.push({ id: "bulk", error: error.message });
    } else {
      result.processed = count || ids.length;
    }
  }

  return successResponse(result);
});

/**
 * GET /api/admin/bulk/types
 * Get supported content types for bulk operations
 */
export const GET = createAdminRoute(async () => {
  return successResponse({
    contentTypes: SUPPORTED_CONTENT_TYPES,
    operations: BULK_OPERATIONS,
  });
});
