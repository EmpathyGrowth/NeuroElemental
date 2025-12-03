/**
 * Email Template Duplication API
 * POST /api/admin/email-templates/[id]/duplicate
 *
 * Creates a duplicate of the specified email template with:
 * - "(Copy)" suffix appended to name
 * - Unique slug generated
 * - Status set to inactive (is_active = false)
 *
 * Requirements: 16.1, 16.2, 16.3, 16.5
 */

import { createAdminRoute, successResponse } from "@/lib/api";
import { duplicateEmailTemplate } from "@/lib/content/duplication";

export const POST = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const result = await duplicateEmailTemplate(id);

    if (!result.success) {
      throw new Error(result.error || "Failed to duplicate email template");
    }

    return successResponse({
      message: "Email template duplicated successfully",
      data: result.data,
    });
  }
);
