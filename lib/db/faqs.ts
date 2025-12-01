/**
 * FAQs Repository
 * Manages Frequently Asked Questions via CMS
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** FAQ record */
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/** FAQ insert data */
export interface FAQInsert {
  question: string;
  answer: string;
  category?: string;
  display_order?: number;
  is_published?: boolean;
}

/** FAQ update data */
export interface FAQUpdate {
  question?: string;
  answer?: string;
  category?: string;
  display_order?: number;
  is_published?: boolean;
}

/**
 * FAQs Repository
 */
export class FAQsRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Get all published FAQs ordered by display order
   */
  async getPublished(): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching published FAQs", error);
      return [];
    }

    return (data || []) as FAQ[];
  }

  /**
   * Get all FAQs (admin)
   */
  async getAll(): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching all FAQs", error);
      return [];
    }

    return (data || []) as FAQ[];
  }

  /**
   * Get FAQs by category
   */
  async getByCategory(category: string): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("*")
      .eq("category", category)
      .eq("is_published", true)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error fetching FAQs by category", error);
      return [];
    }

    return (data || []) as FAQ[];
  }

  /**
   * Get all categories
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("category")
      .eq("is_published", true);

    if (error) {
      logger.error("Error fetching FAQ categories", error);
      return [];
    }

    const categories = [
      ...new Set((data || []).map((d: { category: string }) => d.category)),
    ];
    return categories.filter(Boolean) as string[];
  }

  /**
   * Get FAQ by ID
   */
  async findById(id: string): Promise<FAQ> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching FAQ by ID", error);
      throw internalError("FAQ not found");
    }

    return data as FAQ;
  }

  /**
   * Create a new FAQ
   */
  async create(faq: FAQInsert): Promise<FAQ> {
    const { data, error } = await this.supabase
      .from("faqs")
      .insert(faq)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating FAQ", error);
      throw internalError("Failed to create FAQ");
    }

    return data as FAQ;
  }

  /**
   * Update an FAQ
   */
  async update(id: string, updates: FAQUpdate): Promise<FAQ> {
    const { data, error } = await this.supabase
      .from("faqs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating FAQ", error);
      throw internalError("Failed to update FAQ");
    }

    return data as FAQ;
  }

  /**
   * Delete an FAQ
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("faqs").delete().eq("id", id);

    if (error) {
      logger.error("Error deleting FAQ", error);
      throw internalError("Failed to delete FAQ");
    }
  }

  /**
   * Toggle FAQ publish status
   */
  async togglePublished(id: string, isPublished: boolean): Promise<FAQ> {
    return this.update(id, { is_published: isPublished });
  }

  /**
   * Reorder FAQs
   */
  async reorder(orderedIds: string[]): Promise<void> {
    for (let i = 0; i < orderedIds.length; i++) {
      await this.supabase
        .from("faqs")
        .update({ display_order: i + 1 })
        .eq("id", orderedIds[i]);
    }
  }

  /**
   * Get FAQ count
   */
  async count(publishedOnly: boolean = false): Promise<number> {
    let query = this.supabase
      .from("faqs")
      .select("*", { count: "exact", head: true });

    if (publishedOnly) {
      query = query.eq("is_published", true);
    }

    const { count, error } = await query;

    if (error) {
      logger.error("Error counting FAQs", error);
      return 0;
    }

    return count || 0;
  }

  /**
   * Search FAQs
   */
  async search(query: string): Promise<FAQ[]> {
    const { data, error } = await this.supabase
      .from("faqs")
      .select("*")
      .eq("is_published", true)
      .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
      .order("display_order", { ascending: true });

    if (error) {
      logger.error("Error searching FAQs", error);
      return [];
    }

    return (data || []) as FAQ[];
  }
}

/** Singleton instance */
export const faqsRepository = new FAQsRepository();
