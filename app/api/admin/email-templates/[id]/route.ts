/**
 * Admin Email Template Item API
 * GET - Get template by ID
 * PATCH - Update template
 * DELETE - Delete template
 */

import { badRequestError, createAdminRoute, successResponse } from "@/lib/api";
import { emailTemplatesRepository } from "@/lib/db/email-templates";
import { z } from "zod";

const templateUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional().nullable(),
  subject: z.string().min(1).max(200).optional(),
  preview_text: z.string().max(200).optional().nullable(),
  html_content: z.string().min(1).optional(),
  text_content: z.string().optional().nullable(),
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
    .optional(),
  is_active: z.boolean().optional(),
});

const previewSchema = z.object({
  sample_data: z.record(z.string()),
});

const testEmailSchema = z.object({
  email: z.string().email(),
  sample_data: z.record(z.string()).optional(),
});

/**
 * GET /api/admin/email-templates/[id]
 * Get template by ID
 */
export const GET = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    const template = await emailTemplatesRepository.findById(id);

    return successResponse({ template });
  }
);

/**
 * PATCH /api/admin/email-templates/[id]
 * Update template or preview
 */
export const PATCH = createAdminRoute<{ id: string }>(
  async (request, context, { userId }) => {
    const { id } = await context.params;
    const body = await request.json();
    const action = body.action;

    // Preview action
    if (action === "preview") {
      const parsed = previewSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequestError("Invalid preview data");
      }
      const preview = await emailTemplatesRepository.preview(
        id,
        parsed.data.sample_data
      );
      return successResponse({ preview });
    }

    // Send test email action
    if (action === "send_test") {
      const parsed = testEmailSchema.safeParse(body);
      if (!parsed.success) {
        throw badRequestError("Invalid test email data");
      }
      
      const template = await emailTemplatesRepository.findById(id);
      if (!template) {
        throw badRequestError("Template not found");
      }

      // Get preview with sample data
      const preview = await emailTemplatesRepository.preview(
        id,
        parsed.data.sample_data || {}
      );

      // Send test email using Resend
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "NeuroElemental <noreply@neuroelemental.com>",
        to: parsed.data.email,
        subject: `[TEST] ${preview.subject}`,
        html: preview.html,
        text: preview.text || undefined,
      });

      return successResponse({ 
        success: true, 
        message: `Test email sent to ${parsed.data.email}` 
      });
    }

    // Duplicate action
    if (action === "duplicate") {
      const newSlug = body.new_slug;
      const newName = body.new_name;
      if (!newSlug || !newName) {
        throw badRequestError("new_slug and new_name required");
      }
      const duplicate = await emailTemplatesRepository.duplicate(
        id,
        newSlug,
        newName
      );
      return successResponse({
        template: duplicate,
        message: "Template duplicated",
      });
    }

    // Default: update
    const parsed = templateUpdateSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError(
        parsed.error.errors[0]?.message || "Invalid template data"
      );
    }

    const template = await emailTemplatesRepository.update(
      id,
      parsed.data,
      userId
    );

    return successResponse({ template, message: "Template updated" });
  }
);

/**
 * DELETE /api/admin/email-templates/[id]
 * Delete template
 */
export const DELETE = createAdminRoute<{ id: string }>(
  async (_request, context) => {
    const { id } = await context.params;

    await emailTemplatesRepository.delete(id);

    return successResponse({ message: "Template deleted" });
  }
);
