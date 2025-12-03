/**
 * Course Duplication API
 * POST /api/courses/[id]/duplicate
 *
 * Creates a duplicate of the specified course with all modules and lessons:
 * - "(Copy)" suffix appended to title
 * - Unique slug generated
 * - Status set to draft (is_published = false)
 * - All modules and lessons duplicated with preserved order
 *
 * Requirements: 16.1, 16.2, 16.3, 16.4, 16.5
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { duplicateCourse } from "@/lib/content/duplication";

export const POST = createAdminRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params;

    const result = await duplicateCourse(id, user?.id);

    if (!result.success) {
      throw new Error(result.error || "Failed to duplicate course");
    }

    return successResponse({
      message: "Course duplicated successfully",
      data: result.data,
    });
  }
);
