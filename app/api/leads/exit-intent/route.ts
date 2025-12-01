import { badRequestError, createPublicRoute, successResponse } from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { getCurrentTimestamp } from "@/lib/utils";
import { z } from "zod";

const exitIntentSchema = z.object({
  email: z.string().email("Invalid email address"),
  context: z.enum(["results", "pricing", "assessment", "generic"]),
  top_element: z.string().optional(),
});

/**
 * POST /api/leads/exit-intent
 * Capture email from exit intent popup
 */
export const POST = createPublicRoute(async (req) => {
  const body = await req.json();
  const validation = exitIntentSchema.safeParse(body);

  if (!validation.success) {
    throw badRequestError(
      validation.error.errors[0]?.message || "Invalid data"
    );
  }

  const { email, context, top_element } = validation.data;
  const supabase = getSupabaseServer();

  try {
    // Add to waitlist with exit-intent source
    await supabase.from("waitlist").upsert(
      {
        email,
        source: `exit_intent_${context}`,
        metadata: {
          context,
          top_element,
          captured_at: getCurrentTimestamp(),
        },
      },
      {
        onConflict: "email",
      }
    );

    // Schedule immediate email with promised resources
    await supabase.from("scheduled_emails").insert({
      to: email,
      type: "exit_intent_resources",
      props: { context, top_element },
      scheduled_for: getCurrentTimestamp(), // Send immediately
      status: "pending",
    });

    logger.info("Exit intent email captured", { email, context });

    return successResponse({
      message: "Email saved successfully",
      email,
    });
  } catch (error) {
    logger.error("Failed to save exit intent email:", error as Error);
    throw badRequestError("Failed to save email");
  }
});
