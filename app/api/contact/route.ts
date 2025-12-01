/**
 * Contact Form Submission API
 * POST - Submit a contact form
 */

import { badRequestError, createPublicRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { z } from "zod";

type SupabaseAny = any;

const submissionSchema = z.object({
  form_slug: z.string().min(1, "Form slug required"),
  data: z.record(z.unknown()),
});

/**
 * POST /api/contact
 * Submit a contact form
 */
export const POST = createPublicRoute(async (request) => {
  const body = await request.json();

  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    throw badRequestError(
      parsed.error.errors[0]?.message || "Invalid submission data"
    );
  }

  const { form_slug, data } = parsed.data;
  const supabase = getSupabaseServer() as SupabaseAny;

  // Get the form by slug
  const { data: form, error: formError } = await supabase
    .from("contact_forms")
    .select("id, is_active, success_message")
    .eq("slug", form_slug)
    .single();

  if (formError || !form) {
    throw badRequestError("Form not found");
  }

  if (!form.is_active) {
    throw badRequestError("This form is currently not accepting submissions");
  }

  // Get client info
  const ip_address =
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    null;
  const user_agent = request.headers.get("user-agent") || null;

  // Create the submission
  const { error: submitError } = await supabase
    .from("contact_form_submissions")
    .insert({
      form_id: form.id,
      data,
      ip_address,
      user_agent,
    });

  if (submitError) {
    logger.error("Error submitting contact form", submitError);
    throw badRequestError("Failed to submit form");
  }

  logger.info(`Contact form submitted: ${form_slug}`);

  return successResponse({
    message: form.success_message || "Thank you for your submission!",
  });
});
