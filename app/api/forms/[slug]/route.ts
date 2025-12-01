/**
 * Public Forms API
 * GET - Get form by slug
 * POST - Submit a form
 */

import {
  badRequestError,
  createPublicRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { contactFormsRepository } from "@/lib/db/contact-forms";
import { headers } from "next/headers";

/**
 * GET /api/forms/[slug]
 * Get form definition by slug
 */
export const GET = createPublicRoute<{ slug: string }>(
  async (_request, context) => {
    const { slug } = await context.params;

    const form = await contactFormsRepository.getBySlug(slug);
    if (!form) {
      throw notFoundError("Form");
    }

    // Don't expose internal fields
    const publicForm = {
      id: form.id,
      name: form.name,
      description: form.description,
      fields: form.fields,
      success_message: form.success_message,
      redirect_url: form.redirect_url,
      requires_captcha: form.requires_captcha,
      honeypot_field: form.honeypot_field,
      submit_button_text: form.submit_button_text,
    };

    return successResponse({ form: publicForm });
  }
);

/**
 * POST /api/forms/[slug]
 * Submit a form
 */
export const POST = createPublicRoute<{ slug: string }>(
  async (request, context) => {
    const { slug } = await context.params;

    const form = await contactFormsRepository.getBySlug(slug);
    if (!form) {
      throw notFoundError("Form");
    }

    const body = await request.json();

    // Check honeypot (spam protection)
    if (form.honeypot_field && body[form.honeypot_field]) {
      // Silently reject spam
      return successResponse({ success: true, message: form.success_message });
    }

    // Validate required fields
    for (const field of form.fields) {
      if (field.required && !body[field.name]) {
        throw badRequestError(`${field.label} is required`);
      }
    }

    // Get metadata
    const headersList = await headers();
    const metadata = {
      ipAddress:
        headersList.get("x-forwarded-for") ||
        headersList.get("x-real-ip") ||
        undefined,
      userAgent: headersList.get("user-agent") || undefined,
      referrer: headersList.get("referer") || undefined,
    };

    // Extract only form fields from body
    const formData: Record<string, unknown> = {};
    for (const field of form.fields) {
      if (body[field.name] !== undefined) {
        formData[field.name] = body[field.name];
      }
    }

    const submission = await contactFormsRepository.submitForm(
      form.id,
      formData,
      metadata
    );

    return successResponse(
      {
        success: true,
        message: form.success_message,
        redirect_url: form.redirect_url,
        submission_id: submission.id,
      },
      201
    );
  }
);
