/**
 * Admin Form Submissions API
 * GET - Get all submissions for a form
 */

import { createAdminRoute, notFoundError, successResponse } from "@/lib/api";
import { contactFormsRepository } from "@/lib/db/contact-forms";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/forms/[id]/submissions
 * Get all submissions for a form
 */
export const GET = createAdminRoute(async (_request, context: RouteContext) => {
  const { id } = await context.params;

  // Verify form exists
  const form = await contactFormsRepository.findById(id);
  if (!form) {
    throw notFoundError("Form");
  }

  const result = await contactFormsRepository.getSubmissions(id);

  return successResponse({
    submissions: result.submissions,
    total: result.total,
  });
});
