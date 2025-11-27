/**
 * Certifications Repository
 * Manages certification applications and instructor approval workflow
 *
 * NOTE: This repository uses generic Supabase client typing because the
 * certification_applications table is created via migration and types
 * need to be regenerated after migration is applied.
 */

import { logger } from '@/lib/logging';
import { internalError } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type CertificationLevel = 'practitioner' | 'instructor' | 'all';

export type CertificationApplicationStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'waitlist';

export interface CertificationApplication {
  id: string;
  user_id: string;
  certification_level: CertificationLevel;
  status: CertificationApplicationStatus;
  professional_background: string | null;
  motivation: string | null;
  experience_years: number | null;
  specializations: string[];
  certifications_held: string[];
  linkedin_url: string | null;
  website_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  user?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  reviewer?: {
    id: string;
    full_name: string | null;
  };
}

export interface CertificationApplicationInsert {
  user_id: string;
  certification_level: CertificationLevel;
  professional_background?: string;
  motivation?: string;
  experience_years?: number;
  specializations?: string[];
  certifications_held?: string[];
  linkedin_url?: string;
  website_url?: string;
}

// ============================================================================
// Repository
// ============================================================================

export class CertificationRepository {
  // Using generic SupabaseClient because certification_applications table
  // types need to be regenerated after migration is applied
   
  private supabase: SupabaseClient<any>;

   
  constructor(supabase?: SupabaseClient<any>) {
    if (supabase) {
      this.supabase = supabase;
    } else {
      this.supabase = createAdminClient();
    }
  }

  /**
   * Get all certification applications with optional filters
   */
  async getApplications(filters?: {
    status?: CertificationApplicationStatus;
    certificationLevel?: CertificationLevel;
    limit?: number;
    offset?: number;
  }): Promise<CertificationApplication[]> {
    // Build query with filters
    const baseQuery = this.supabase
      .from('certification_applications')
      .select(
        `
        *,
        user:profiles!certification_applications_user_id_fkey(id, full_name, email, avatar_url),
        reviewer:profiles!certification_applications_reviewed_by_fkey(id, full_name)
      `
      );

    // Apply filters dynamically
    const filterConditions: Record<string, unknown> = {};
    if (filters?.status) {
      filterConditions.status = filters.status;
    }
    if (filters?.certificationLevel) {
      filterConditions.certification_level = filters.certificationLevel;
    }

    // Execute with filters
    let queryBuilder = baseQuery.order('created_at', { ascending: false });

    // Apply equality filters
    for (const [key, value] of Object.entries(filterConditions)) {
      queryBuilder = queryBuilder.eq(key, value as string);
    }

    // Apply pagination
    if (filters?.limit) {
      queryBuilder = queryBuilder.limit(filters.limit);
    }
    if (filters?.offset && filters?.limit) {
      queryBuilder = queryBuilder.range(
        filters.offset,
        filters.offset + filters.limit - 1
      );
    }

    const { data, error } = await queryBuilder;

    if (error) {
      logger.error('Error fetching certification applications', error);
      throw internalError('Failed to fetch applications');
    }

    return (data as unknown as CertificationApplication[]) || [];
  }

  /**
   * Get a single application by ID
   */
  async getApplicationById(id: string): Promise<CertificationApplication | null> {
    const { data, error } = await this.supabase
      .from('certification_applications')
      .select(
        `
        *,
        user:profiles!certification_applications_user_id_fkey(id, full_name, email, avatar_url),
        reviewer:profiles!certification_applications_reviewed_by_fkey(id, full_name)
      `
      )
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching application', error);
      return null;
    }

    return data as unknown as CertificationApplication | null;
  }

  /**
   * Get user's application for a certification level
   */
  async getUserApplication(
    userId: string,
    certificationLevel: CertificationLevel
  ): Promise<CertificationApplication | null> {
    const { data, error } = await this.supabase
      .from('certification_applications')
      .select('*')
      .eq('user_id', userId)
      .eq('certification_level', certificationLevel)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching user application', error);
      return null;
    }

    return data as unknown as CertificationApplication | null;
  }

  /**
   * Get all applications for a user
   */
  async getUserApplications(userId: string): Promise<CertificationApplication[]> {
    const { data, error } = await this.supabase
      .from('certification_applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching user applications', error);
      return [];
    }

    return (data as unknown as CertificationApplication[]) || [];
  }

  /**
   * Create a new certification application
   */
  async createApplication(
    data: CertificationApplicationInsert
  ): Promise<CertificationApplication> {
    // Check if user already has an application for this level
    const existing = await this.getUserApplication(
      data.user_id,
      data.certification_level
    );

    if (existing) {
      // If rejected, allow re-application
      if (existing.status !== 'rejected') {
        throw internalError(
          'You already have a pending application for this certification level'
        );
      }
      // Update the existing rejected application
      return this.updateApplication(existing.id, {
        ...data,
        status: 'pending',
        reviewed_by: null,
        reviewed_at: null,
        review_notes: null,
        rejection_reason: null,
      });
    }

    const { data: application, error } = await this.supabase
      .from('certification_applications')
      .insert({
        user_id: data.user_id,
        certification_level: data.certification_level,
        professional_background: data.professional_background || null,
        motivation: data.motivation || null,
        experience_years: data.experience_years || null,
        specializations: data.specializations || [],
        certifications_held: data.certifications_held || [],
        linkedin_url: data.linkedin_url || null,
        website_url: data.website_url || null,
        status: 'pending',
      } as unknown as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      logger.error('Error creating application', error);
      throw internalError('Failed to submit application');
    }

    return application as unknown as CertificationApplication;
  }

  /**
   * Update an application
   */
  async updateApplication(
    id: string,
    updates: Partial<CertificationApplication>
  ): Promise<CertificationApplication> {
    const { data, error } = await this.supabase
      .from('certification_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating application', error);
      throw internalError('Failed to update application');
    }

    return data as unknown as CertificationApplication;
  }

  /**
   * Review an application (approve, reject, or waitlist)
   */
  async reviewApplication(
    id: string,
    reviewerId: string,
    decision: 'approved' | 'rejected' | 'waitlist',
    notes?: string,
    rejectionReason?: string
  ): Promise<CertificationApplication> {
    const application = await this.updateApplication(id, {
      status: decision,
      reviewed_by: reviewerId,
      reviewed_at: new Date().toISOString(),
      review_notes: notes || null,
      rejection_reason: decision === 'rejected' ? rejectionReason || null : null,
    });

    // If approved, update user's profile with instructor status
    if (decision === 'approved') {
      const app = await this.getApplicationById(id);
      if (app) {
        await this.supabase
          .from('profiles')
          .update({
            instructor_status: 'approved',
            role: 'instructor',
            updated_at: new Date().toISOString(),
          })
          .eq('id', app.user_id);
      }
    }

    return application;
  }

  /**
   * Get application statistics
   */
  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
    waitlist: number;
    byLevel: Record<CertificationLevel, number>;
  }> {
    const { data, error } = await this.supabase
      .from('certification_applications')
      .select('status, certification_level');

    if (error) {
      logger.error('Error fetching application stats', error);
      return {
        total: 0,
        pending: 0,
        underReview: 0,
        approved: 0,
        rejected: 0,
        waitlist: 0,
        byLevel: { practitioner: 0, instructor: 0, all: 0 },
      };
    }

    const typedData = data as unknown as Array<{
      status: CertificationApplicationStatus;
      certification_level: CertificationLevel;
    }>;

    const stats = {
      total: typedData.length,
      pending: 0,
      underReview: 0,
      approved: 0,
      rejected: 0,
      waitlist: 0,
      byLevel: { practitioner: 0, instructor: 0, all: 0 },
    };

    typedData.forEach((app) => {
      switch (app.status) {
        case 'pending':
          stats.pending++;
          break;
        case 'under_review':
          stats.underReview++;
          break;
        case 'approved':
          stats.approved++;
          break;
        case 'rejected':
          stats.rejected++;
          break;
        case 'waitlist':
          stats.waitlist++;
          break;
      }
      stats.byLevel[app.certification_level]++;
    });

    return stats;
  }

  /**
   * Check if user is a certified instructor
   */
  async isUserCertified(
    userId: string,
    level?: CertificationLevel
  ): Promise<boolean> {
    let query = this.supabase
      .from('certification_applications')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'approved');

    if (level) {
      query = query.eq('certification_level', level);
    }

    const { data } = await query.maybeSingle();
    return !!data;
  }
}

// Export singleton instance
export const certificationRepository = new CertificationRepository();
