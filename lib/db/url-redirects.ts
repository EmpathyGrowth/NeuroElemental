/**
 * URL Redirects Repository
 * Manages URL redirect rules for SEO and legacy URLs
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { getSupabaseServer } from "./supabase-server";

/** Redirect types */
export type RedirectType = 301 | 302 | 307 | 308;

/** URL redirect */
export interface UrlRedirect {
  id: string;
  source_path: string;
  destination_url: string;
  redirect_type: RedirectType;
  is_regex: boolean;
  is_active: boolean;
  preserve_query_string: boolean;
  hit_count: number;
  last_hit_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

/** Redirect insert */
export interface UrlRedirectInsert {
  source_path: string;
  destination_url: string;
  redirect_type?: RedirectType;
  is_regex?: boolean;
  is_active?: boolean;
  preserve_query_string?: boolean;
  notes?: string;
  created_by?: string;
}

/** Redirect update */
export interface UrlRedirectUpdate {
  source_path?: string;
  destination_url?: string;
  redirect_type?: RedirectType;
  is_regex?: boolean;
  is_active?: boolean;
  preserve_query_string?: boolean;
  notes?: string | null;
}

/**
 * URL Redirects Repository
 */
export class UrlRedirectsRepository {
  private get supabase() {
     
    return getSupabaseServer() as any;
  }

  /**
   * Find redirect for a path
   */
  async findRedirectForPath(path: string): Promise<UrlRedirect | null> {
    // First try exact match
    const { data: exactMatch } = await this.supabase
      .from("url_redirects")
      .select("*")
      .eq("source_path", path)
      .eq("is_active", true)
      .eq("is_regex", false)
      .single();

    if (exactMatch) {
      // Increment hit count async
      this.incrementHitCount(exactMatch.id).catch(() => {});
      return exactMatch as UrlRedirect;
    }

    // Try regex matches
    const { data: regexRedirects } = await this.supabase
      .from("url_redirects")
      .select("*")
      .eq("is_active", true)
      .eq("is_regex", true);

    if (regexRedirects) {
      for (const redirect of regexRedirects) {
        try {
          const regex = new RegExp(redirect.source_path);
          if (regex.test(path)) {
            this.incrementHitCount(redirect.id).catch(() => {});
            return redirect as UrlRedirect;
          }
        } catch {
          // Invalid regex, skip
        }
      }
    }

    return null;
  }

  /**
   * Get all redirects
   */
  async getAll(): Promise<UrlRedirect[]> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .select("*")
      .order("source_path", { ascending: true });

    if (error) {
      logger.error("Error fetching redirects", error);
      return [];
    }

    return (data || []) as UrlRedirect[];
  }

  /**
   * Get active redirects only
   */
  async getActive(): Promise<UrlRedirect[]> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .select("*")
      .eq("is_active", true)
      .order("source_path", { ascending: true });

    if (error) {
      logger.error("Error fetching active redirects", error);
      return [];
    }

    return (data || []) as UrlRedirect[];
  }

  /**
   * Get redirect by ID
   */
  async findById(id: string): Promise<UrlRedirect> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      logger.error("Error fetching redirect", error);
      throw internalError("Redirect not found");
    }

    return data as UrlRedirect;
  }

  /**
   * Create a redirect
   */
  async create(redirect: UrlRedirectInsert): Promise<UrlRedirect> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .insert(redirect)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating redirect", error);
      throw internalError("Failed to create redirect");
    }

    return data as UrlRedirect;
  }

  /**
   * Update a redirect
   */
  async update(id: string, updates: UrlRedirectUpdate): Promise<UrlRedirect> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating redirect", error);
      throw internalError("Failed to update redirect");
    }

    return data as UrlRedirect;
  }

  /**
   * Delete a redirect
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("url_redirects")
      .delete()
      .eq("id", id);

    if (error) {
      logger.error("Error deleting redirect", error);
      throw internalError("Failed to delete redirect");
    }
  }

  /**
   * Toggle redirect active status
   */
  async toggleActive(id: string, isActive: boolean): Promise<UrlRedirect> {
    return this.update(id, { is_active: isActive });
  }

  /**
   * Increment hit count
   */
  private async incrementHitCount(id: string): Promise<void> {
    await this.supabase
      .from("url_redirects")
      .update({
        hit_count: this.supabase.rpc("increment", { x: 1 }),
        last_hit_at: new Date().toISOString(),
      })
      .eq("id", id);
  }

  /**
   * Get redirect stats
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    totalHits: number;
  }> {
    const { data, error } = await this.supabase
      .from("url_redirects")
      .select("is_active, hit_count");

    if (error || !data) {
      return { total: 0, active: 0, totalHits: 0 };
    }

    return {
      total: data.length,
      active: data.filter((r: { is_active: boolean }) => r.is_active).length,
      totalHits: data.reduce(
        (sum: number, r: { hit_count: number }) => sum + r.hit_count,
        0
      ),
    };
  }

  /**
   * Import redirects from CSV-like data
   */
  async bulkCreate(
    redirects: UrlRedirectInsert[]
  ): Promise<{ created: number; errors: number }> {
    let created = 0;
    let errors = 0;

    for (const redirect of redirects) {
      try {
        await this.create(redirect);
        created++;
      } catch {
        errors++;
      }
    }

    return { created, errors };
  }

  /**
   * Check for conflicts
   */
  async checkConflict(
    sourcePath: string,
    excludeId?: string
  ): Promise<boolean> {
    let query = this.supabase
      .from("url_redirects")
      .select("id")
      .eq("source_path", sourcePath)
      .eq("is_active", true);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query.single();
    return !!data;
  }
}

/** Singleton instance */
export const urlRedirectsRepository = new UrlRedirectsRepository();
