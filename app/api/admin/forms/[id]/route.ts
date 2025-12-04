/**
 * Admin Form Item API
 * GET - Get form with submissions
 * PATCH - Update form
 * DELETE - Delete form
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { contactFormsRepository } from "@/lib/db/contact-forms";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  type: z.enum([
    "text",
    "email",
    "tel",
    "textarea",
    "select",
    "checkbox",
    "radio",
    "number",
    "date",
    "hidden",
  ]),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(),
  rows: z.number().optional(),
  helpText: z.string().optional(),
});

const formUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  fields: z.array(fieldSchema).min(1).optional(),
  success_message: z.string().max(500).optional(),
  redirect_url: z.string().url().optional().nullable(),
  notification_email: z.string().email().optional().nullable(),
  is_active: z.boolean().optional(),
  requires_captcha: z.boolean().optional(),
  honeypot_field: z.string().optional(),
  submit_button_text: z.string().max(50).optional(),
});

/**
 * GET /api/admin/forms/[id]
 * Get form with submissions
 */
export const GET = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const url = new URL(request.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    const form = await contactFormsRepository.findById(id);
    const { submissions, total } = await contactFormsRepository.getSubmissions(
      id,
      {
        status: status as
          | "new"
          | "read"
          | "replied"
          | "spam"
          | "archived"
          | undefined,
        limit,
        offset,
      }
    );
    const stats = await contactFormsRepository.getSubmissionStats(id);

    return successResponse({ form, submissions, total, stats });
  }
);

/**
 * PATCH /api/admin/forms/[id]
 * Update form
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context) => {
    const { id } = await context.params;
    const body = await request.json();

    const parsed = formUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.issues[0]?.message || "Invalid form data"
      );
    }

    const form = await contactFormsRepository.update(id, parsed.data);
    return successResponse({ form, message: "Form updated" });
  }
);

/**
 * DELETE /api/admin/forms/[id]
 * Delete form
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;
    await contactFormsRepository.delete(id);
    return successResponse({ message: "Form deleted" });
  }
);
