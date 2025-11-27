/**
 * Diagnostics Repository
 * Manages diagnostic templates, organization diagnostics, and responses
 *
 * NOTE: This repository uses generic Supabase client typing because the
 * diagnostic tables are created via migration and types need to be
 * regenerated after migration is applied.
 */

import { logger } from '@/lib/logging';
import { internalError } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type DiagnosticType =
  | 'leadership'
  | 'communication'
  | 'conflict_resolution'
  | 'motivation_engagement'
  | 'sales_optimization'
  | 'team_composition'
  | 'custom';

export type DiagnosticStatus =
  | 'draft'
  | 'active'
  | 'in_progress'
  | 'completed'
  | 'archived';

export interface DiagnosticQuestion {
  id: number;
  text: string;
  type: 'scale' | 'multiple_choice' | 'text' | 'ranking';
  options?: string[];
  required?: boolean;
}

export interface DiagnosticTemplate {
  id: string;
  name: string;
  description: string | null;
  type: DiagnosticType;
  questions: DiagnosticQuestion[];
  scoring_config: Record<string, unknown>;
  report_template: Record<string, unknown>;
  is_active: boolean;
  is_system: boolean;
  min_participants: number;
  max_participants: number | null;
  estimated_time_minutes: number;
  icon: string | null;
  color: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface OrganizationDiagnostic {
  id: string;
  organization_id: string;
  template_id: string;
  name: string;
  description: string | null;
  status: DiagnosticStatus;
  target_user_ids: string[];
  target_department: string | null;
  include_all_members: boolean;
  anonymous_results: boolean;
  total_participants: number;
  completed_participants: number;
  results: Record<string, unknown>;
  insights: unknown[];
  started_at: string | null;
  completed_at: string | null;
  deadline_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  // Relations
  template?: DiagnosticTemplate;
}

export interface DiagnosticResponse {
  id: string;
  diagnostic_id: string;
  user_id: string;
  answers: Record<string, unknown>;
  scores: Record<string, unknown>;
  is_complete: boolean;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface DiagnosticWithTemplate extends OrganizationDiagnostic {
  template: DiagnosticTemplate;
}

// ============================================================================
// Repository
// ============================================================================

export class DiagnosticsRepository {
  // Using generic SupabaseClient because diagnostic tables
  // types need to be regenerated after migration is applied
   
  private supabase: SupabaseClient<any>;

   
  constructor(supabase?: SupabaseClient<any>) {
    if (supabase) {
      this.supabase = supabase;
    } else {
      this.supabase = createAdminClient();
    }
  }

  // ============================================================================
  // Templates
  // ============================================================================

  /**
   * Get all active diagnostic templates
   */
  async getTemplates(filters?: {
    type?: DiagnosticType;
    isActive?: boolean;
  }): Promise<DiagnosticTemplate[]> {
    let query = this.supabase
      .from('diagnostic_templates')
      .select('*')
      .order('name');

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }
    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    } else {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching diagnostic templates', error);
      throw internalError('Failed to fetch diagnostic templates');
    }

    return (data as unknown as DiagnosticTemplate[]) || [];
  }

  /**
   * Get a template by ID
   */
  async getTemplateById(id: string): Promise<DiagnosticTemplate | null> {
    const { data, error } = await this.supabase
      .from('diagnostic_templates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching template', error);
      return null;
    }

    return data as unknown as DiagnosticTemplate | null;
  }

  /**
   * Get a template by type (for system templates)
   */
  async getTemplateByType(type: DiagnosticType): Promise<DiagnosticTemplate | null> {
    const { data, error } = await this.supabase
      .from('diagnostic_templates')
      .select('*')
      .eq('type', type)
      .eq('is_system', true)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching template by type', error);
      return null;
    }

    return data as unknown as DiagnosticTemplate | null;
  }

  // ============================================================================
  // Organization Diagnostics
  // ============================================================================

  /**
   * Get all diagnostics for an organization
   */
  async getOrganizationDiagnostics(
    organizationId: string,
    filters?: {
      status?: DiagnosticStatus;
      templateId?: string;
    }
  ): Promise<DiagnosticWithTemplate[]> {
    let query = this.supabase
      .from('organization_diagnostics')
      .select('*, template:diagnostic_templates(*)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }
    if (filters?.templateId) {
      query = query.eq('template_id', filters.templateId);
    }

    const { data, error } = await query;

    if (error) {
      logger.error('Error fetching organization diagnostics', error);
      throw internalError('Failed to fetch diagnostics');
    }

    return (data as unknown as DiagnosticWithTemplate[]) || [];
  }

  /**
   * Get a single diagnostic by ID
   */
  async getDiagnosticById(id: string): Promise<DiagnosticWithTemplate | null> {
    const { data, error } = await this.supabase
      .from('organization_diagnostics')
      .select('*, template:diagnostic_templates(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching diagnostic', error);
      return null;
    }

    return data as unknown as DiagnosticWithTemplate | null;
  }

  /**
   * Create a new diagnostic for an organization
   */
  async createDiagnostic(data: {
    organization_id: string;
    template_id: string;
    name: string;
    description?: string;
    target_user_ids?: string[];
    target_department?: string;
    include_all_members?: boolean;
    anonymous_results?: boolean;
    deadline_at?: string;
    created_by: string;
  }): Promise<OrganizationDiagnostic> {
    const { data: diagnostic, error } = await this.supabase
      .from('organization_diagnostics')
      .insert({
        organization_id: data.organization_id,
        template_id: data.template_id,
        name: data.name,
        description: data.description || null,
        target_user_ids: data.target_user_ids || [],
        target_department: data.target_department || null,
        include_all_members: data.include_all_members || false,
        anonymous_results: data.anonymous_results || false,
        deadline_at: data.deadline_at || null,
        created_by: data.created_by,
        status: 'draft',
      } as unknown as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      logger.error('Error creating diagnostic', error);
      throw internalError('Failed to create diagnostic');
    }

    return diagnostic as unknown as OrganizationDiagnostic;
  }

  /**
   * Update a diagnostic
   */
  async updateDiagnostic(
    id: string,
    updates: Partial<{
      name: string;
      description: string | null;
      status: DiagnosticStatus;
      target_user_ids: string[];
      target_department: string | null;
      include_all_members: boolean;
      anonymous_results: boolean;
      deadline_at: string | null;
      results: Record<string, unknown>;
      insights: unknown[];
      started_at: string;
      completed_at: string;
    }>
  ): Promise<OrganizationDiagnostic> {
    const { data, error } = await this.supabase
      .from('organization_diagnostics')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      } as unknown as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating diagnostic', error);
      throw internalError('Failed to update diagnostic');
    }

    return data as unknown as OrganizationDiagnostic;
  }

  /**
   * Start a diagnostic (change status to active)
   */
  async startDiagnostic(id: string): Promise<OrganizationDiagnostic> {
    return this.updateDiagnostic(id, {
      status: 'active',
      started_at: new Date().toISOString(),
    });
  }

  /**
   * Complete a diagnostic
   */
  async completeDiagnostic(
    id: string,
    results: Record<string, unknown>,
    insights: unknown[]
  ): Promise<OrganizationDiagnostic> {
    return this.updateDiagnostic(id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      results,
      insights,
    });
  }

  /**
   * Delete a diagnostic
   */
  async deleteDiagnostic(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('organization_diagnostics')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting diagnostic', error);
      throw internalError('Failed to delete diagnostic');
    }
  }

  // ============================================================================
  // Responses
  // ============================================================================

  /**
   * Get all responses for a diagnostic
   */
  async getDiagnosticResponses(diagnosticId: string): Promise<DiagnosticResponse[]> {
    const { data, error } = await this.supabase
      .from('diagnostic_responses')
      .select('*')
      .eq('diagnostic_id', diagnosticId);

    if (error) {
      logger.error('Error fetching responses', error);
      return [];
    }

    return (data as unknown as DiagnosticResponse[]) || [];
  }

  /**
   * Get a user's response to a diagnostic
   */
  async getUserResponse(
    diagnosticId: string,
    userId: string
  ): Promise<DiagnosticResponse | null> {
    const { data, error } = await this.supabase
      .from('diagnostic_responses')
      .select('*')
      .eq('diagnostic_id', diagnosticId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching user response', error);
      return null;
    }

    return data as unknown as DiagnosticResponse | null;
  }

  /**
   * Submit or update a diagnostic response
   */
  async submitResponse(data: {
    diagnostic_id: string;
    user_id: string;
    answers: Record<string, unknown>;
    scores?: Record<string, unknown>;
    is_complete?: boolean;
    time_spent_seconds?: number;
  }): Promise<DiagnosticResponse> {
    // Check if response exists
    const existing = await this.getUserResponse(data.diagnostic_id, data.user_id);

    if (existing) {
      // Update existing response
      const { data: response, error } = await this.supabase
        .from('diagnostic_responses')
        .update({
          answers: data.answers,
          scores: data.scores || {},
          is_complete: data.is_complete || false,
          completed_at: data.is_complete ? new Date().toISOString() : null,
          time_spent_seconds: data.time_spent_seconds,
          updated_at: new Date().toISOString(),
        } as unknown as Record<string, unknown>)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        logger.error('Error updating response', error);
        throw internalError('Failed to update response');
      }

      return response as unknown as DiagnosticResponse;
    } else {
      // Create new response
      const { data: response, error } = await this.supabase
        .from('diagnostic_responses')
        .insert({
          diagnostic_id: data.diagnostic_id,
          user_id: data.user_id,
          answers: data.answers,
          scores: data.scores || {},
          is_complete: data.is_complete || false,
          completed_at: data.is_complete ? new Date().toISOString() : null,
          time_spent_seconds: data.time_spent_seconds,
        } as unknown as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        logger.error('Error creating response', error);
        throw internalError('Failed to create response');
      }

      // Update participant count
      await this.updateParticipantCount(data.diagnostic_id);

      return response as unknown as DiagnosticResponse;
    }
  }

  /**
   * Update participant counts for a diagnostic
   */
  private async updateParticipantCount(diagnosticId: string): Promise<void> {
    const { data: responses } = await this.supabase
      .from('diagnostic_responses')
      .select('is_complete')
      .eq('diagnostic_id', diagnosticId);

    if (responses) {
      const typedResponses = responses as unknown as Array<{ is_complete: boolean }>;
      const total = typedResponses.length;
      const completed = typedResponses.filter((r) => r.is_complete).length;

      await this.supabase
        .from('organization_diagnostics')
        .update({
          total_participants: total,
          completed_participants: completed,
          updated_at: new Date().toISOString(),
        } as unknown as Record<string, unknown>)
        .eq('id', diagnosticId);
    }
  }

  // ============================================================================
  // Statistics
  // ============================================================================

  /**
   * Get diagnostic statistics for an organization
   */
  async getOrganizationStats(organizationId: string): Promise<{
    totalDiagnostics: number;
    activeDiagnostics: number;
    completedDiagnostics: number;
    totalResponses: number;
    byType: Record<DiagnosticType, number>;
  }> {
    const { data: diagnostics, error } = await this.supabase
      .from('organization_diagnostics')
      .select('id, status, template:diagnostic_templates(type), total_participants')
      .eq('organization_id', organizationId);

    if (error) {
      logger.error('Error fetching organization stats', error);
      return {
        totalDiagnostics: 0,
        activeDiagnostics: 0,
        completedDiagnostics: 0,
        totalResponses: 0,
        byType: {} as Record<DiagnosticType, number>,
      };
    }

    const typedDiagnostics = diagnostics as unknown as Array<{
      id: string;
      status: DiagnosticStatus;
      template: { type: DiagnosticType };
      total_participants: number;
    }>;

    const byType: Record<DiagnosticType, number> = {
      leadership: 0,
      communication: 0,
      conflict_resolution: 0,
      motivation_engagement: 0,
      sales_optimization: 0,
      team_composition: 0,
      custom: 0,
    };

    let totalResponses = 0;
    let activeDiagnostics = 0;
    let completedDiagnostics = 0;

    typedDiagnostics.forEach((d) => {
      if (d.template?.type) {
        byType[d.template.type] = (byType[d.template.type] || 0) + 1;
      }
      totalResponses += d.total_participants || 0;
      if (d.status === 'active' || d.status === 'in_progress') {
        activeDiagnostics++;
      }
      if (d.status === 'completed') {
        completedDiagnostics++;
      }
    });

    return {
      totalDiagnostics: typedDiagnostics.length,
      activeDiagnostics,
      completedDiagnostics,
      totalResponses,
      byType,
    };
  }
}

// Export singleton instance
export const diagnosticsRepository = new DiagnosticsRepository();
