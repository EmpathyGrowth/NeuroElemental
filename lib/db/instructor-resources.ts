/**
 * Instructor Resources Repository
 * Manages teaching materials, videos, and marketing assets for certified instructors
 *
 * NOTE: This repository uses generic Supabase client typing because the
 * instructor_resources table is created via migration and types need to be
 * regenerated after migration is applied.
 */

import { logger } from '@/lib/logging';
// Direct import to avoid circular dependency with @/lib/api barrel
import { internalError } from '@/lib/api/error-handler';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type InstructorResourceCategory =
  | 'workshop_materials'
  | 'training_videos'
  | 'marketing'
  | 'community'
  | 'templates'
  | 'guides';

export type InstructorResourceType =
  | 'pdf'
  | 'video'
  | 'presentation'
  | 'image'
  | 'link'
  | 'document'
  | 'audio';

export type CertificationLevel = 'practitioner' | 'instructor' | 'all';

export interface InstructorResource {
  id: string;
  title: string;
  description: string | null;
  category: InstructorResourceCategory;
  type: InstructorResourceType;
  cert_level: CertificationLevel;
  file_url: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  duration_seconds: number | null;
  external_url: string | null;
  thumbnail_url: string | null;
  tags: string[];
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  download_count: number;
  view_count: number;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface InstructorResourceInsert {
  title: string;
  description?: string | null;
  category: InstructorResourceCategory;
  type: InstructorResourceType;
  cert_level?: CertificationLevel;
  file_url?: string | null;
  file_path?: string | null;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  external_url?: string | null;
  thumbnail_url?: string | null;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
  created_by?: string | null;
}

export interface InstructorResourceUpdate {
  title?: string;
  description?: string | null;
  category?: InstructorResourceCategory;
  type?: InstructorResourceType;
  cert_level?: CertificationLevel;
  file_url?: string | null;
  file_path?: string | null;
  file_size_bytes?: number | null;
  duration_seconds?: number | null;
  external_url?: string | null;
  thumbnail_url?: string | null;
  tags?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  sort_order?: number;
}

export interface ResourceDownload {
  id: string;
  resource_id: string;
  user_id: string;
  downloaded_at: string;
  ip_address: string | null;
  user_agent: string | null;
}

// ============================================================================
// Repository
// ============================================================================

export class InstructorResourceRepository {
  // Using generic SupabaseClient because instructor_resources table
  // types need to be regenerated after migration is applied
   
  private supabase: SupabaseClient<any>;

   
  constructor(supabase?: SupabaseClient<any>) {
    // Use provided client or create an admin client
    this.supabase = supabase ?? createAdminClient();
  }

  /**
   * Get all resources with optional filters
   */
  async getResources(filters?: {
    category?: InstructorResourceCategory;
    type?: InstructorResourceType;
    certLevel?: CertificationLevel;
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<InstructorResource[]> {
    let query = this.supabase
      .from('instructor_resources')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.certLevel) {
      query = query.eq('cert_level', filters.certLevel);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }
    if (filters?.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }
    if (filters?.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching instructor resources', error);
      throw internalError('Failed to fetch resources');
    }

    return (data as unknown as InstructorResource[]) || [];
  }

  /**
   * Get resources by category
   */
  async getResourcesByCategory(
    category: InstructorResourceCategory
  ): Promise<InstructorResource[]> {
    return this.getResources({ category, isActive: true });
  }

  /**
   * Get a single resource by ID
   */
  async getResourceById(id: string): Promise<InstructorResource | null> {
    const { data, error } = await this.supabase
      .from('instructor_resources')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching resource by ID', error);
      return null;
    }

    return data as unknown as InstructorResource | null;
  }

  /**
   * Create a new resource
   */
  async createResource(
    resource: InstructorResourceInsert
  ): Promise<InstructorResource> {
    const { data, error } = await this.supabase
      .from('instructor_resources')
      .insert(resource as unknown as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      logger.error('Error creating resource', error);
      throw internalError('Failed to create resource');
    }

    return data as unknown as InstructorResource;
  }

  /**
   * Update a resource
   */
  async updateResource(
    id: string,
    updates: InstructorResourceUpdate
  ): Promise<InstructorResource> {
    const { data, error } = await this.supabase
      .from('instructor_resources')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating resource', error);
      throw internalError('Failed to update resource');
    }

    return data as unknown as InstructorResource;
  }

  /**
   * Delete a resource
   */
  async deleteResource(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('instructor_resources')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting resource', error);
      throw internalError('Failed to delete resource');
    }
  }

  /**
   * Track a resource download
   */
  async trackDownload(
    resourceId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    // Insert download record
    await this.supabase.from('instructor_resource_downloads').insert({
      resource_id: resourceId,
      user_id: userId,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    });

    // Increment download count
    await this.supabase.rpc('increment_resource_download_count', {
      resource_id: resourceId,
    });
  }

  /**
   * Increment view count for a resource
   */
  async trackView(resourceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('instructor_resources')
      .update({ view_count: this.supabase.rpc('increment', { x: 1 }) } as unknown as Record<string, unknown>)
      .eq('id', resourceId);

    if (error) {
      logger.error('Error tracking view', error);
    }
  }

  /**
   * Get user's download history
   */
  async getUserDownloads(userId: string): Promise<ResourceDownload[]> {
    const { data, error } = await this.supabase
      .from('instructor_resource_downloads')
      .select('*')
      .eq('user_id', userId)
      .order('downloaded_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user downloads', error);
      return [];
    }

    return (data as unknown as ResourceDownload[]) || [];
  }

  /**
   * Get resource statistics
   */
  async getResourceStats(): Promise<{
    totalResources: number;
    totalDownloads: number;
    byCategory: Record<InstructorResourceCategory, number>;
  }> {
    const { data: resources, error } = await this.supabase
      .from('instructor_resources')
      .select('category, download_count')
      .eq('is_active', true);

    if (error) {
      logger.error('Error fetching resource stats', error);
      return {
        totalResources: 0,
        totalDownloads: 0,
        byCategory: {} as Record<InstructorResourceCategory, number>,
      };
    }

    const typedResources = resources as unknown as Array<{
      category: InstructorResourceCategory;
      download_count: number;
    }>;

    const byCategory: Record<InstructorResourceCategory, number> = {
      workshop_materials: 0,
      training_videos: 0,
      marketing: 0,
      community: 0,
      templates: 0,
      guides: 0,
    };

    let totalDownloads = 0;

    typedResources.forEach((r) => {
      byCategory[r.category] = (byCategory[r.category] || 0) + 1;
      totalDownloads += r.download_count || 0;
    });

    return {
      totalResources: typedResources.length,
      totalDownloads,
      byCategory,
    };
  }
}

// Export singleton instance
export const instructorResourceRepository = new InstructorResourceRepository();
