/**
 * Admin Form Submission API (by ID)
 * PATCH - Update submission status
 * DELETE - Delete submission
 */

import {
  badRequestError,
  createAdminRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { contactFormsRepository } from "@/lib/db/contact-forms";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string; submissionId: string }>;
}

const updateSchema = z.object({
  status: z.enum(["new", "read", "replied", "archived"]),
});

/**
 * PATCH /api/admin/forms/[id]/submissions/[submissionId]
 * Update submission status
 */
export const PATCH = createAdminRoute(
  async (request, context: RouteContext) => {
    const { id, submissionId } = await context.params;
    const body = await request.json();

    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError("Invalid status");
    }

    // Verify form exists
    const form = await contactFormsRepository.findById(id);
    if (!form) {
      throw notFoundError("Form");
    }

    await contactFormsRepository.updateSubmissionStatus(
      submissionId,
      parsed.data.status
    );

    return successResponse({ message: "Submission updated" });
  }
);

/**
 * DELETE /api/admin/forms/[id]/submissions/[submissionId]
 * Delete submission
 */
export const DELETE = createAdminRoute(
  async (_request, context: RouteContext) => {
    const { id, submissionId } = await context.params;

    // Verify form exists
    const form = await contactFormsRepository.findById(id);
    if (!form) {
      throw notFoundError("Form");
    }

    await contactFormsRepository.deleteSubmission(submissionId);

    return successResponse({ message: "Submission deleted" });
  }
);
