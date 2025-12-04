import {
  badRequestError,
  conflictError,
  createAuthenticatedRoute,
  notFoundError,
  successResponse,
  validateRequest,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { stripe } from "@/lib/stripe/config";
import { RouteContext } from "@/lib/types/api";
import { getCurrentTimestamp } from "@/lib/utils";
import { eventRegistrationRequestSchema } from "@/lib/validation/schemas";
import { randomBytes } from "crypto";
import { NextRequest } from "next/server";

/** Generate a unique ticket code */
function generateTicketCode(): string {
  return `TKT-${randomBytes(6).toString("hex").toUpperCase()}`;
}

/** Event record from database - matches actual DB schema */
interface EventRecord {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_usd: number;
  capacity: number | null;
  thumbnail_url: string | null;
  start_datetime: string;
  end_datetime: string;
  location_name: string | null;
  is_published: boolean;
  created_at: string;
}

/** Event registration record */
interface EventRegistrationRecord {
  id: string;
  event_id: string;
  user_id: string;
  attendee_info: Record<string, unknown> | null;
  status: string;
  payment_status: string;
  stripe_session_id: string | null;
  stripe_payment_id: string | null;
  cancelled_at: string | null;
  created_at: string;
}

/** Registration insert data */
interface RegistrationInsert {
  event_id: string;
  user_id: string;
  attendee_info?: Record<string, unknown>;
  status: string;
  payment_status: string;
  stripe_session_id?: string;
  ticket_code: string;
}

/** Registration update data */
interface RegistrationUpdate {
  status?: string;
  cancelled_at?: string;
  attended?: boolean;
}

/** Registration query result */
interface RegistrationIdResult {
  id: string;
}

export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    // Get event details
    const { data: event } = (await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()) as { data: EventRecord | null; error: unknown };

    if (!event) {
      throw notFoundError("Event not found");
    }

    // Check if already registered
    const { data: existingRegistration } = (await supabase
      .from("event_registrations")
      .select("id")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()) as { data: RegistrationIdResult | null; error: unknown };

    if (existingRegistration) {
      throw conflictError("Already registered for this event");
    }

    // Check capacity
    const { count: registrationCount } = (await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", id)
      .eq("status", "confirmed")) as { count: number | null; error: unknown };

    if (
      event.capacity &&
      registrationCount &&
      registrationCount >= event.capacity
    ) {
      throw badRequestError("Event is full");
    }

    // Validate request body
    const validation = await validateRequest(
      request,
      eventRegistrationRequestSchema
    );
    if (!validation.success) {
      throw validation.error;
    }

    const { attendee_info, payment_method } = validation.data;

    // Handle payment if event is paid
    if (event.price_usd && event.price_usd > 0) {
      if (payment_method === "stripe") {
        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: event.title,
                  description: event.description || undefined,
                  images: event.thumbnail_url ? [event.thumbnail_url] : [],
                },
                unit_amount: Math.round(event.price_usd * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}?registration=success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.slug}?registration=cancelled`,
          metadata: {
            event_id: event.id,
            user_id: user.id,
            type: "event_registration",
          },
        });

        // Create registration with pending status
        const insertData: RegistrationInsert = {
          event_id: id,
          user_id: user.id,
          attendee_info,
          status: "pending",
          payment_status: "pending",
          stripe_session_id: session.id,
          ticket_code: generateTicketCode(),
        };
        const { data: registration } = (await (supabase as any)
          .from("event_registrations")
          .insert(insertData)
          .select()
          .single()) as {
          data: EventRegistrationRecord | null;
          error: unknown;
        };

        return successResponse({
          registration,
          checkout_url: session.url,
        });
      } else {
        throw badRequestError(
          "Invalid payment method. Stripe is required for paid events."
        );
      }
    } else {
      // Free event - direct registration
      const freeInsertData: RegistrationInsert = {
        event_id: id,
        user_id: user.id,
        attendee_info,
        status: "confirmed",
        payment_status: "free",
        ticket_code: generateTicketCode(),
      };
      const { data: registration, error } = (await (supabase as any)
        .from("event_registrations")
        .insert(freeInsertData)
        .select()
        .single()) as {
        data: EventRegistrationRecord | null;
        error: { message: string } | null;
      };

      if (error) {
        throw badRequestError(error.message);
      }

      // Send confirmation email
      if (user.email) {
        await sendEventRegistrationEmail(user.email, event, registration);
      }

      // Create notification
      await (supabase as any).from("notifications").insert({
        user_id: user.id,
        title: "Event Registration Confirmed",
        message: `You're registered for ${event.title}`,
        type: "success",
        action_url: `/events/${event.slug}`,
      });

      return successResponse({ registration }, 201);
    }
  }
);

export const DELETE = createAuthenticatedRoute<{ id: string }>(
  async (request: NextRequest, context: RouteContext<{ id: string }>, user) => {
    const { id } = await context.params;
    const supabase = await getSupabaseServer();

    // Get registration
    const { data: registration } = (await supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()) as { data: EventRegistrationRecord | null; error: unknown };

    if (!registration) {
      throw notFoundError("Registration not found");
    }

    // Check cancellation policy
    const { data: event } = (await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()) as { data: EventRecord | null; error: unknown };

    if (!event) {
      throw notFoundError("Event not found");
    }

    const now = new Date();
    const eventDate = new Date(event.start_datetime);
    const hoursUntilEvent =
      (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilEvent < 24) {
      throw badRequestError("Cannot cancel within 24 hours of event");
    }

    // Process refund if paid
    if (
      registration.payment_status === "paid" &&
      registration.stripe_payment_id
    ) {
      try {
        await stripe.refunds.create({
          payment_intent: registration.stripe_payment_id,
        });
      } catch (error) {
        logger.error("Error processing refund", undefined, {
          errorMsg: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Update registration status
    const cancelUpdate: RegistrationUpdate = {
      status: "cancelled",
      cancelled_at: getCurrentTimestamp(),
    };

    const { error } = (await (supabase as any)
      .from("event_registrations")
      .update(cancelUpdate)
      .eq("id", registration.id)) as { error: { message: string } | null };

    if (error) {
      throw badRequestError(error.message);
    }

    // Send cancellation email
    if (user.email && event) {
      await sendEventCancellationEmail(user.email, event);
    }

    return successResponse({
      success: true,
      message: "Registration cancelled successfully",
    });
  }
);

async function sendEventRegistrationEmail(
  email: string,
  _event: EventRecord,
  _registration: EventRegistrationRecord | null
) {
  // Implement email sending logic
  logger.info("Sending registration email", { email });
}

async function sendEventCancellationEmail(email: string, _event: EventRecord) {
  // Implement email sending logic
  logger.info("Sending cancellation email", { email });
}
