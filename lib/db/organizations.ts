/**
 * Organization Repository
 * Handles organization and membership operations with proper type safety
 */

import { internalError, notFoundError } from '@/lib/api';
import { logger } from '@/lib/logging';
import { toError, getCurrentTimestamp } from '@/lib/utils';
import type { Database } from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { createAdminClient } from '@/lib/supabase/admin';

type Organization = Database['public']['Tables']['organizations']['Row'];
type OrganizationInsert = Database['public']['Tables']['organizations']['Insert'];
type OrganizationUpdate = Database['public']['Tables']['organizations']['Update'];
type OrganizationMembership = Database['public']['Tables']['organization_members']['Row'];
type OrganizationMembershipInsert = Database['public']['Tables']['organization_members']['Insert'];
type OrganizationMembershipUpdate = Database['public']['Tables']['organization_members']['Update'];

/** User profile in organization context */
interface UserProfile {
  id: string;
  full_name: string | null;
  email: string;
  avatar_url: string | null;
  role: string;
}

/** Organization membership with user profile */
interface MembershipWithUser extends OrganizationMembership {
  user: UserProfile | null;
}

/** Membership with organization */
interface MembershipWithOrg extends OrganizationMembership {
  organization: Organization;
}

/** Organization invitation */
interface OrganizationInvitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  status: string;
  accepted_at: string | null;
}

/**
 * Organization with members
 */
export interface OrganizationWithMembers extends Organization {
  members: MembershipWithUser[];
}

/**
 * Repository for organization operations
 */
export class OrganizationRepository extends BaseRepository<'organizations'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('organizations', supabase);
  }

  /**
   * Get organization by ID with error handling
   */
  async getOrganization(id: string): Promise<Organization> {
    return this.findById(id);
  }

  /**
   * Get all organizations with optional filters
   */
  async getAllOrganizations(filters?: { type?: string }): Promise<Organization[]> {
    return this.findAll(filters as Partial<Organization>);
  }

  /**
   * Create a new organization
   */
  async createOrganization(org: OrganizationInsert): Promise<Organization> {
    return this.create(org);
  }

  /**
   * Update an organization
   */
  async updateOrganization(id: string, updates: OrganizationUpdate): Promise<Organization> {
    return this.update(id, updates);
  }

  /**
   * Delete an organization
   */
  async deleteOrganization(id: string): Promise<void> {
    return this.delete(id);
  }

  /**
   * Get organization members with user profiles
   */
  async getOrganizationMembers(orgId: string): Promise<MembershipWithUser[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('*, user:profiles(*)')
        .eq('organization_id', orgId) as { data: MembershipWithUser[] | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching organization members', toError(error));
        throw internalError('Failed to fetch organization members');
      }

      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getOrganizationMembers', error);
      throw err;
    }
  }

  /**
   * Add a member to an organization
   */
  async addMemberToOrganization(
    orgId: string,
    userId: string,
    role: string = 'member'
  ): Promise<OrganizationMembership> {
    try {
      const insertData: OrganizationMembershipInsert = { organization_id: orgId, user_id: userId, role };
      // Use fresh admin client for cross-table operations (membership table differs from org repository)
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('organization_members')
        .insert(insertData)
        .select()
        .single() as { data: OrganizationMembership | null; error: { message: string } | null };

      if (error) {
        logger.error('Error adding member to organization', toError(error));
        throw internalError('Failed to add member to organization');
      }

      return data as OrganizationMembership;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in addMemberToOrganization', error);
      throw err;
    }
  }

  /**
   * Remove a member from an organization
   */
  async removeMemberFromOrganization(orgId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', userId);

      if (error) {
        logger.error('Error removing member from organization', toError(error));
        throw internalError('Failed to remove member from organization');
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in removeMemberFromOrganization', error);
      throw err;
    }
  }

  /**
   * Update a member's role in an organization
   */
  async updateMemberRole(orgId: string, userId: string, role: string): Promise<OrganizationMembership> {
    try {
      const updateData: OrganizationMembershipUpdate = { role };
      // Use fresh admin client for cross-table operations
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from('organization_members')
        .update(updateData)
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .select()
        .single() as { data: OrganizationMembership | null; error: { message: string } | null };

      if (error) {
        logger.error('Error updating member role', toError(error));
        throw internalError('Failed to update member role');
      }

      return data as OrganizationMembership;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in updateMemberRole', error);
      throw err;
    }
  }

  /**
   * Get all organizations for a user
   */
  async getUserOrganizations(userId: string): Promise<MembershipWithOrg[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('*, organization:organizations(*)')
        .eq('user_id', userId) as { data: MembershipWithOrg[] | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching user organizations', toError(error));
        throw internalError('Failed to fetch user organizations');
      }

      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getUserOrganizations', error);
      throw err;
    }
  }

  /**
   * Check if user is a member of an organization
   */
  async isUserOrgMember(userId: string, orgId: string): Promise<boolean> {
    try {
      const { data } = await this.supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .maybeSingle();

      return !!data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in isUserOrgMember', error);
      return false;
    }
  }

  /**
   * Check if user is an admin of an organization
   * Reuses getUserOrgRole to avoid query duplication
   */
  async isUserOrgAdmin(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserOrgRole(userId, orgId);
    return role === 'admin' || role === 'owner';
  }

  /**
   * Check if user is the owner of an organization
   * Reuses getUserOrgRole to avoid query duplication
   */
  async isUserOrgOwner(userId: string, orgId: string): Promise<boolean> {
    const role = await this.getUserOrgRole(userId, orgId);
    return role === 'owner';
  }

  /**
   * Accept an organization invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<OrganizationMembership> {
    try {
      // Get invitation
      const { data: invitation, error: inviteError } = await this.supabase
        .from('organization_invitations')
        .select('*')
        .eq('id', invitationId)
        .maybeSingle() as { data: OrganizationInvitation | null; error: { message: string } | null };

      if (inviteError || !invitation) {
        logger.error('Invitation not found', new Error(inviteError?.message || 'Invitation not found'));
        throw notFoundError('Invitation');
      }

      // Add member
      const memberInsertData: OrganizationMembershipInsert = {
        organization_id: invitation.organization_id,
        user_id: userId,
        role: invitation.role || 'member'
      };
      // Use fresh admin client for cross-table operations
      const adminClient = createAdminClient();
      const { data: membership, error: memberError } = await adminClient
        .from('organization_members')
        .insert(memberInsertData)
        .select()
        .single() as { data: OrganizationMembership | null; error: { message: string } | null };

      if (memberError) {
        logger.error('Error creating membership', toError(memberError));
        throw internalError('Failed to accept invitation');
      }

      // Mark invitation as accepted
      await this.supabase
        .from('organization_invitations')
        .update({ status: 'accepted', accepted_at: getCurrentTimestamp() })
        .eq('id', invitationId);

      return membership as OrganizationMembership;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in acceptInvitation', error);
      throw err;
    }
  }

  /**
   * Get user's role in an organization
   */
  async getUserOrgRole(userId: string, orgId: string): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select('role')
        .eq('user_id', userId)
        .eq('organization_id', orgId)
        .maybeSingle() as { data: { role: string } | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching user org role', toError(error));
        return null;
      }

      return data?.role || null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getUserOrgRole', error);
      return null;
    }
  }

  // Note: Credit operations should use creditRepository from @/lib/db/credits

  /**
   * Get organization with members
   */
  async getOrganizationWithMembers(id: string): Promise<OrganizationWithMembers> {
    try {
      const org = await this.findById(id);
      const members = await this.getOrganizationMembers(id);

      return {
        ...org,
        members
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getOrganizationWithMembers', error);
      throw err;
    }
  }

  /**
   * Check if a slug is available
   */
  async isSlugAvailable(slug: string, excludeId?: string): Promise<boolean> {
    try {
      let query = this.supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data } = await query.maybeSingle();
      return !data; // Available if no data found
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in isSlugAvailable', error);
      return false;
    }
  }
}

/**
 * Singleton instance of OrganizationRepository
 */
export const organizationRepository = new OrganizationRepository();

// ============================================================================
// CONVENIENCE EXPORTS
// These are bound repository methods for easier imports. They return values
// directly (not {data, error} tuples). Use repository instance for full control.
// ============================================================================

// Direct bindings (boolean/string returns)
export const isUserOrgMember = organizationRepository.isUserOrgMember.bind(organizationRepository);
export const isUserOrgAdmin = organizationRepository.isUserOrgAdmin.bind(organizationRepository);
export const isUserOrgOwner = organizationRepository.isUserOrgOwner.bind(organizationRepository);
export const getUserOrgRole = organizationRepository.getUserOrgRole.bind(organizationRepository);
export const isSlugAvailable = organizationRepository.isSlugAvailable.bind(organizationRepository);
