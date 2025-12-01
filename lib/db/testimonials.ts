/**
 * Testimonial Repository
 * Manages testimonial data and testimonial-related operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for testimonial management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type Testimonial = Database["public"]["Tables"]["testimonials"]["Row"];
type _TestimonialInsert =
  Database["public"]["Tables"]["testimonials"]["Insert"];
type _TestimonialUpdate =
  Database["public"]["Tables"]["testimonials"]["Update"];

/**
 * Testimonial Repository
 * Extends BaseRepository with testimonial-specific operations
 */
export class TestimonialRepository extends BaseRepository<"testimonials"> {
  constructor() {
    super("testimonials");
  }

  /**
   * Get all published testimonials ordered by display order
   *
   * @returns Array of published testimonials
   */
  async getPublished(): Promise<Testimonial[]> {
    const { data, error } = await this.supabase
      .from("testimonials")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: false });

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
    const { data, error } = await this.supabase
      .from("testimonials")
      .select("*")
      .order("display_order", { ascending: false });

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
    const { data, error } = await this.supabase
      .from("testimonials")
      .update({ display_order: displayOrder })
      .eq("id", id)
      .select()
      .single();

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
    const { data, error } = await this.supabase
      .from("testimonials")
      .update({ is_published: isPublished })
      .eq("id", id)
      .select()
      .single();

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
    const { data, error } = await this.supabase
      .from("testimonials")
      .select("*")
      .eq("element", element)
      .eq("is_published", true)
      .order("display_order", { ascending: false });

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
