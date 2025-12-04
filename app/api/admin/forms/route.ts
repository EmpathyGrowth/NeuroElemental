/**
 * Admin Contact Forms API
 * GET - Get all forms with stats
 * POST - Create a new form
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
  min: z.number().optional(),
  max: z.number().optional(),
  pattern: z.string().optional(),
  helpText: z.string().optional(),
});

const formSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).optional(),
  fields: z.array(fieldSchema).min(1),
  success_message: z
    .string()
    .max(500)
    .default("Thank you for your submission!"),
  redirect_url: z.string().url().optional(),
  notification_email: z.string().email().optional(),
  is_active: z.boolean().default(true),
  requires_captcha: z.boolean().default(true),
  honeypot_field: z.string().default("website"),
  submit_button_text: z.string().max(50).default("Submit"),
});

/**
 * GET /api/admin/forms
 * Get all forms with submission stats
 */
export const GET = createAdminRoute(async () => {
  const forms = await contactFormsRepository.getAll();
  const stats = await contactFormsRepository.getSubmissionStats();
  const recentSubmissions =
    await contactFormsRepository.getRecentSubmissions(10);

  return successResponse({ forms, stats, recentSubmissions });
});

/**
 * POST /api/admin/forms
 * Create a new form
 */
export const POST = createAdminRoute(async (request) => {
  const body = await request.json();

  const parsed = formSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid form data"
    );
  }

  const form = await contactFormsRepository.create(parsed.data);
  return successResponse({ form, message: "Form created" }, 201);
});
