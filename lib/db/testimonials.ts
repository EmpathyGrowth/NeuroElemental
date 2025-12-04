/**
 * Testimonial Repository
 * Manages testimonial data and testimonial-related operations
 *
 * Standalone class (testimonials table not in generated types)
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { createAdminClient } from "@/lib/supabase/admin";

/** Testimonial row type */
interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  avatar_url: string | null;
  element: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string | null;
  updated_at: string | null;
}

/**
 * Testimonial Repository
 * Standalone class with testimonial-specific operations
 */
/** Testimonial insert type */
interface TestimonialInsert {
  name: string;
  role?: string | null;
  content: string;
  avatar_url?: string | null;
  element?: string | null;
  is_published?: boolean;
  display_order?: number;
}

/** Testimonial update type */
interface TestimonialUpdate {
  name?: string;
  role?: string | null;
  content?: string;
  avatar_url?: string | null;
  element?: string | null;
  is_published?: boolean;
  display_order?: number;
}

export class TestimonialRepository {
  protected supabase = createAdminClient();

  /**
   * Find testimonial by ID
   */
  async findById(id: string): Promise<Testimonial | null> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .select("*")
      .eq("id", id)
      .single() as { data: Testimonial | null; error: { message: string } | null };

    if (error) {
      return null;
    }

    return data;
  }

  /**
   * Create a new testimonial
   */
  async create(testimonial: TestimonialInsert): Promise<Testimonial> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .insert(testimonial)
      .select()
      .single() as { data: Testimonial | null; error: { message: string } | null };

    if (error || !data) {
      logger.error(
        "Error creating testimonial",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create testimonial");
    }

    return data;
  }

  /**
   * Update a testimonial
   */
  async update(id: string, updates: TestimonialUpdate): Promise<Testimonial> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .update(updates)
      .eq("id", id)
      .select()
      .single() as { data: Testimonial | null; error: { message: string } | null };

    if (error || !data) {
      logger.error(
        "Error updating testimonial",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update testimonial");
    }

    return data;
  }

  /**
   * Delete a testimonial
   */
  async delete(id: string): Promise<void> {
    const { error } = await (this.supabase as any)
      .from("testimonials")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error(
        "Error deleting testimonial",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to delete testimonial");
    }
  }

  /**
   * Get all published testimonials ordered by display order
   *
   * @returns Array of published testimonials
   */
  async getPublished(): Promise<Testimonial[]> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: false }) as { data: Testimonial[] | null; error: { message: string } | null };

    if (error) {
      logger.error(
        "Error fetching published testimonials",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch published testimonials");
    }

    return data as Testimonial[];
  }

  /**
   * Get all testimonials (admin only) ordered by display order
   *
   * @returns Array of all testimonials
   */
  async getAllOrdered(): Promise<Testimonial[]> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: false }) as { data: Testimonial[] | null; error: { message: string } | null };

    if (error) {
      logger.error(
        "Error fetching all testimonials",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch testimonials");
    }

    return data as Testimonial[];
  }

  /**
   * Update testimonial display order
   *
   * @param id - Testimonial ID
   * @param displayOrder - New display order
   * @returns Updated testimonial
   */
  async updateDisplayOrder(
    id: string,
    displayOrder: number
  ): Promise<Testimonial> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select()
      .single() as { data: Testimonial | null; error: { message: string } | null };

    if (error || !data) {
      logger.error(
        "Error updating testimonial display order",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update testimonial display order");
    }

    return data as Testimonial;
  }

  /**
   * Toggle testimonial published status
   *
   * @param id - Testimonial ID
   * @param isPublished - New published status
   * @returns Updated testimonial
   */
  async togglePublished(
    id: string,
    isPublished: boolean
  ): Promise<Testimonial> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .update({ is_published: isPublished })
      .eq("id", id)
      .select()
      .single() as { data: Testimonial | null; error: { message: string } | null };

    if (error || !data) {
      logger.error(
        "Error toggling testimonial published status",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update testimonial");
    }

    return data as Testimonial;
  }

  /**
   * Get testimonials by element type
   *
   * @param element - Element type (electric, fiery, etc.)
   * @returns Array of testimonials for the element
   */
  async getByElement(element: string): Promise<Testimonial[]> {
    const { data, error } = await (this.supabase as any)
      .from("testimonials")
      .select("*")
      .eq("element", element)
      .eq("is_published", true)
      .order("display_order", { ascending: false }) as { data: Testimonial[] | null; error: { message: string } | null };

    if (error) {
      logger.error(
        "Error fetching testimonials by element",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch testimonials");
    }

    return data as Testimonial[];
  }
}

/**
 * Singleton instance of TestimonialRepository
 */
export const testimonialRepository = new TestimonialRepository();
