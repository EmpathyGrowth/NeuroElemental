/**
 * Event Registration Repository
 * Manages event registrations and attendance tracking
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for event registration management.
 */

import { internalError, notFoundError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type EventRegistration =
  Database["public"]["Tables"]["event_registrations"]["Row"];
type EventRegistrationInsert =
  Database["public"]["Tables"]["event_registrations"]["Insert"];
type _EventRegistrationUpdate =
  Database["public"]["Tables"]["event_registrations"]["Update"];
type _Profile = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Event registration with user profile
 */
export interface EventRegistrationWithUser extends EventRegistration {
  user: {
    id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

/**
 * Event registration statistics
 */
export interface EventRegistrationStats {
  total: number;
  attended: number;
  pending: number;
  capacity: number | null;
  fillRate: number;
}

/**
 * Event Registration Repository
 * Extends BaseRepository with event registration-specific operations
 */
export class EventRegistrationRepository extends BaseRepository<"event_registrations"> {
  constructor() {
    super("event_registrations");
  }

  /**
   * Get all registrations for an event
   *
   * @param eventId - Event ID
   * @returns Array of registrations
   */
  async getByEvent(eventId: string): Promise<EventRegistration[]> {
    const { data, error } = await this.supabase
      .from("event_registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("registered_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching event registrations",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch registrations");
    }

    return data as EventRegistration[];
  }

  /**
   * Get registrations with user profiles
   *
   * @param eventId - Event ID
   * @returns Array of registrations with user data
   */
  async getByEventWithUsers(
    eventId: string
  ): Promise<EventRegistrationWithUser[]> {
    const registrations = await this.getByEvent(eventId);

    // Get unique user IDs
    const userIds = [
      ...new Set(registrations.map((r) => r.user_id).filter(Boolean)),
    ] as string[];

    if (userIds.length === 0) {
      return registrations.map((reg) => ({ ...reg, user: null }));
    }

    // Fetch user profiles
    const { data: profiles } = await this.supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    // Create a map of user profiles for quick lookup
    const profileMap = new Map((profiles || []).map((p) => [p.id, p]));

    // Transform data to include user info
    return registrations.map((reg) => {
      const profile = reg.user_id ? profileMap.get(reg.user_id) : null;
      return {
        ...reg,
        user: profile
          ? {
              id: profile.id,
              full_name: profile.full_name,
              email: profile.email,
            }
          : null,
      };
    });
  }

  /**
   * Get registration by ID for an event
   *
   * @param registrationId - Registration ID
   * @param eventId - Event ID
   * @returns Registration or null
   */
  async getByIdForEvent(
    registrationId: string,
    eventId: string
  ): Promise<EventRegistration | null> {
    const { data, error } = await this.supabase
      .from("event_registrations")
      .select("*")
      .eq("id", registrationId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching registration",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as EventRegistration | null;
  }

  /**
   * Update registration attendance status
   *
   * @param registrationId - Registration ID
   * @param eventId - Event ID
   * @param attended - Attendance status
   * @returns Updated registration
   */
  async updateAttendance(
    registrationId: string,
    eventId: string,
    attended: boolean
  ): Promise<EventRegistration> {
    // Verify registration exists for this event
    const existing = await this.getByIdForEvent(registrationId, eventId);
    if (!existing) {
      throw notFoundError("Registration");
    }

    const { data, error } = await this.supabase
      .from("event_registrations")
      .update({ attended })
      .eq("id", registrationId)
      .select()
      .single();

    if (error || !data) {
      logger.error(
        "Error updating registration attendance",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update registration");
    }

    return data as EventRegistration;
  }

  /**
   * Get registration statistics for an event
   *
   * @param eventId - Event ID
   * @param capacity - Event capacity (optional)
   * @returns Registration statistics
   */
  async getStats(
    eventId: string,
    capacity: number | null = null
  ): Promise<EventRegistrationStats> {
    const registrations = await this.getByEvent(eventId);

    const total = registrations.length;
    const attended = registrations.filter((r) => r.attended).length;
    const pending = registrations.filter((r) => !r.attended).length;
    const fillRate = capacity ? Math.round((total / capacity) * 100) : 100;

    return {
      total,
      attended,
      pending,
      capacity,
      fillRate,
    };
  }

  /**
   * Get user's registrations
   *
   * @param userId - User ID
   * @returns Array of user's registrations
   */
  async getByUser(userId: string): Promise<EventRegistration[]> {
    const { data, error } = await this.supabase
      .from("event_registrations")
      .select("*")
      .eq("user_id", userId)
      .order("registered_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching user registrations",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch user registrations");
    }

    return data as EventRegistration[];
  }

  /**
   * Check if user is registered for event
   *
   * @param userId - User ID
   * @param eventId - Event ID
   * @returns True if user is registered
   */
  async isUserRegistered(userId: string, eventId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from("event_registrations")
      .select("id")
      .eq("user_id", userId)
      .eq("event_id", eventId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error checking user registration",
        error instanceof Error ? error : new Error(String(error))
      );
      return false;
    }

    return !!data;
  }

  /**
   * Create new registration
   *
   * @param data - Registration data
   * @returns Created registration
   */
  async createRegistration(
    data: EventRegistrationInsert
  ): Promise<EventRegistration> {
    const { data: registration, error } = await this.supabase
      .from("event_registrations")
      .insert(data)
      .select()
      .single();

    if (error || !registration) {
      logger.error(
        "Error creating registration",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create registration");
    }

    return registration as EventRegistration;
  }

  /**
   * Delete registration
   *
   * @param registrationId - Registration ID
   * @param eventId - Event ID (optional, for verification)
   */
  async deleteRegistration(
    registrationId: string,
    eventId?: string
  ): Promise<void> {
    let query = this.supabase
      .from("event_registrations")
      .delete()
      .eq("id", registrationId);

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { error } = await query;

    if (error) {
      logger.error(
        "Error deleting registration",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to delete registration");
    }
  }
}

/**
 * Singleton instance of EventRegistrationRepository
 */
export const eventRegistrationRepository = new EventRegistrationRepository();
