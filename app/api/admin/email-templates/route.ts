/**
 * Admin Email Templates API
 * GET - Get all email templates
 * POST - Create a new template
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { emailTemplatesRepository } from "@/lib/db/email-templates";
import { z } from "zod";

const templateSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens"),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  subject: z.string().min(1).max(200),
  preview_text: z.string().max(200).optional(),
  html_content: z.string().min(1),
  text_content: z.string().optional(),
  variables: z
    .array(
      z.object({
        name: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  category: z
    .enum(["transactional", "marketing", "notification", "system"])
    .default("transactional"),
  is_active: z.boolean().default(true),
});

/**
 * GET /api/admin/email-templates
 * Get all email templates
 */
export const GET = createAdminRoute(async (request) => {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");

  if (
    category &&
    ["transactional", "marketing", "notification", "system"].includes(category)
  ) {
    const templates = await emailTemplatesRepository.getByCategory(
      category as "transactional" | "marketing" | "notification" | "system"
    );
    return successResponse({ templates });
  }

  const templates = await emailTemplatesRepository.getAll();
  return successResponse({ templates });
});

/**
 * POST /api/admin/email-templates
 * Create a new email template
 */
export const POST = createAdminRoute(async (request) => {
  const body = await request.json();

  const parsed = templateSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.issues[0]?.message || "Invalid template data"
    );
  }

  const template = await emailTemplatesRepository.create(parsed.data);

  return successResponse({ template, message: "Template created" }, 201);
});
