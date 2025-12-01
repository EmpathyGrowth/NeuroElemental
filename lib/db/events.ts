import { getSupabaseServer } from "@/lib/db/supabase-server";
import { logger } from "@/lib/logging/logger";

export type EventType =
  | "online_workshop"
  | "in_person_workshop"
  | "webinar"
  | "conference";

export interface AgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface Event {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  long_description: string | null;
  event_type: EventType;
  start_datetime: string;
  end_datetime: string;
  timezone: string;
  location_name: string | null;
  location_address: Record<string, unknown> | null;
  online_meeting_url: string | null;
  instructor_id: string | null;
  instructor_name: string | null;
  instructor_bio: string | null;
  price_usd: number;
  capacity: number | null;
  spots_taken: number;
  is_published: boolean;
  thumbnail_url: string | null;
  // Rich content fields
  benefits: string[];
  agenda: AgendaItem[];
  requirements: string[];
  tags: string[];
  rating: number | null;
  review_count: number;
  // Metadata
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventWithStats extends Event {
  spots_remaining?: number;
  registration_count?: number;
}

/**
 * Fetch all published upcoming events
 */
export async function getUpcomingEvents(): Promise<EventWithStats[]> {
  try {
    const supabase = getSupabaseServer();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("is_published", true)
      .gte("start_datetime", now)
      .order("start_datetime", { ascending: true });

    if (error) {
      logger.error("Error fetching events", error);
      return [];
    }

    // Calculate spots remaining
    return (data || []).map((event: any) => ({
      ...event,
      event_type: event.event_type as Event["event_type"],
      spots_remaining: event.capacity
        ? event.capacity - event.spots_taken
        : null,
      registration_count: event.spots_taken,
    })) as EventWithStats[];
  } catch (err) {
    logger.error(
      "Error in getUpcomingEvents",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return [];
  }
}

/**
 * Fetch all events (for admin)
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_datetime", { ascending: false });

    if (error) {
      logger.error("Error fetching all events", error);
      return [];
    }

    return (data || []).map((event: any) => ({
      ...event,
      event_type: event.event_type as Event["event_type"],
    })) as Event[];
  } catch (err) {
    logger.error(
      "Error in getAllEvents",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return [];
  }
}

/**
 * Fetch a single event by slug
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("slug", slug)
      .single();

    if (error) {
      logger.error("Error fetching event", error);
      return null;
    }

    return data
      ? ({
          ...data,
          event_type: data.event_type as Event["event_type"],
        } as Event)
      : null;
  } catch (err) {
    logger.error(
      "Error in getEventBySlug",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return null;
  }
}

/**
 * Create a new event
 */
export async function createEvent(event: Partial<Event>) {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .insert([event as any])
      .select()
      .single();

    if (error) {
      logger.error("Error creating event", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    logger.error(
      "Error in createEvent",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return { data: null, error: err };
  }
}

/**
 * Update an event
 */
export async function updateEvent(id: string, updates: Partial<Event>) {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .update({
        ...(updates as any),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Error updating event", error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    logger.error(
      "Error in updateEvent",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return { data: null, error: err };
  }
}

/**
 * Delete an event
 */
export async function deleteEvent(id: string) {
  try {
    const supabase = getSupabaseServer();

    const { error } = await supabase.from("events").delete().eq("id", id);

    if (error) {
      logger.error("Error deleting event", error);
      return { error };
    }

    return { error: null };
  } catch (err) {
    logger.error(
      "Error in deleteEvent",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return { error: err };
  }
}

/**
 * Register user for an event
 */
export async function registerForEvent(userId: string, eventId: string) {
  try {
    const supabase = getSupabaseServer();

    // Generate a unique ticket code
    const ticketCode = `NE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data, error } = await supabase
      .from("event_registrations")
      .insert([
        {
          user_id: userId,
          event_id: eventId,
          ticket_code: ticketCode,
        },
      ])
      .select()
      .single();

    if (error) {
      logger.error("Error registering for event", error);
      return { data: null, error };
    }

    // Increment spots_taken
    await supabase.rpc("increment_event_spots", { event_id: eventId });

    return { data, error: null };
  } catch (err) {
    logger.error(
      "Error in registerForEvent",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return { data: null, error: err };
  }
}

/**
 * Check if user is registered for an event
 */
export async function isUserRegistered(
  userId: string,
  eventId: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .single();

    return !!data && !error;
  } catch (_err) {
    return false;
  }
}

/**
 * Get event by ID
 */
export async function getEventById(id: string): Promise<Event | null> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Error fetching event by ID", error);
      return null;
    }

    return data
      ? ({
          ...data,
          event_type: data.event_type as Event["event_type"],
        } as Event)
      : null;
  } catch (err) {
    logger.error(
      "Error in getEventById",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return null;
  }
}

/**
 * Get all events with instructor information
 */
export async function getAllEventsWithInstructor(): Promise<Event[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("events")
      .select(
        `
        *,
        instructor:profiles!events_instructor_id_fkey(full_name, email)
      `
      )
      .order("start_datetime", { ascending: false });

    if (error) {
      logger.error("Error fetching events with instructor", error);
      return [];
    }

    return (data || []).map((event: any) => ({
      ...event,
      event_type: event.event_type as Event["event_type"],
    })) as Event[];
  } catch (err) {
    logger.error(
      "Error in getAllEventsWithInstructor",
      err instanceof Error ? err : undefined,
      { error: String(err) }
    );
    return [];
  }
}

/**
 * Event Repository - Object-based interface for event operations
 */
export const eventRepository = {
  findById: getEventById,
  findBySlug: getEventBySlug,
  findAll: getAllEvents,
  getUpcoming: getUpcomingEvents,
  getAllEventsWithInstructor,
  create: createEvent,
  update: updateEvent,
  delete: deleteEvent,
  registerUser: registerForEvent,
  isUserRegistered,
};
