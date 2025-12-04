/**
 * Membership Repository
 * Manages organization membership operations
 */

import { logger } from '@/lib/logging';
import { BaseRepository } from './base-repository';
import type {
  OrganizationMembership,
  OrganizationInvite,
  OrganizationRole,
} from '@/lib/types/supabase';
import { getCurrentTimestamp, getUpdateTimestamp } from '@/lib/utils';
import { internalError, notFoundError } from '@/lib/api';
import type { Database } from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type OrganizationMembershipInsert = Database['public']['Tables']['organization_members']['Insert'];
type OrganizationMembershipUpdate = Database['public']['Tables']['organization_members']['Update'];
type OrganizationInviteInsert = Database['public']['Tables']['organization_invitations']['Insert'];

/** Membership with joined profile data */
interface MemberWithProfile extends OrganizationMembership {
  profiles: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
    role: string;
  } | null;
}

/** Invite with joined organization data */
interface InviteWithOrganization extends OrganizationInvite {
  organizations: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  } | null;
}

export class MembershipRepository extends BaseRepository<'organization_members'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('organization_members', supabase);
  }

  async addOrganizationMember(data: {
    organization_id: string;
    user_id: string;
    role: OrganizationRole;
  }): Promise<OrganizationMembership> {
    const membershipData: OrganizationMembershipInsert = {
      organization_id: data.organization_id,
      user_id: data.user_id,
      role: data.role,
    };

    return this.create(membershipData) as Promise<OrganizationMembership>;
  }

  async removeOrganizationMember(organization_id: string, user_id: string): Promise<void> {
    await this.deleteMany({ organization_id, user_id } as Partial<OrganizationMembership>);
  }

  async updateMemberRole(
    organization_id: string,
    user_id: string,
    role: OrganizationRole
  ): Promise<OrganizationMembership> {
    const updateData: OrganizationMembershipUpdate = { role, ...getUpdateTimestamp() };

    const memberships = await this.updateMany(
      { organization_id, user_id } as Partial<OrganizationMembership>,
      updateData
    );

    if (memberships.length === 0) {
      throw internalError('Membership not found');
    }

    return memberships[0] as OrganizationMembership;
  }

  async getOrganizationMembers(organization_id: string): Promise<MemberWithProfile[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_members')
        .select(`
          *,
          profiles:user_id (
            id,
            full_name,
            email,
            avatar_url,
            role
          )
        `)
        .eq('organization_id', organization_id)
        .order('created_at', { ascending: false }) as { data: MemberWithProfile[] | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching members', new Error(error.message));
        throw internalError('Failed to fetch organization members');
      }

      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getOrganizationMembers', error);
      throw err;
    }
  }

  async createOrganizationInvite(data: {
    email: string;
    organization_id: string;
    role: OrganizationRole;
    invited_by: string;
    expires_in_days?: number;
  }): Promise<OrganizationInvite> {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (data.expires_in_days || 7));

      const inviteData: OrganizationInviteInsert = {
        email: data.email,
        organization_id: data.organization_id,
        role: data.role,
        invited_by: data.invited_by,
        expires_at: expiresAt.toISOString(),
      };

      const { data: invite, error } = await (this.supabase as any)
        .from('organization_invitations')
        .insert(inviteData)
        .select()
        .single() as { data: OrganizationInvite | null; error: { message: string } | null };

      if (error) {
        logger.error('Error creating invite', new Error(error.message));
        throw internalError('Failed to create invite');
      }

      return invite as OrganizationInvite;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in createOrganizationInvite', error);
      throw err;
    }
  }

  async getOrganizationInvites(organization_id: string): Promise<OrganizationInvite[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_invitations')
        .select('*')
        .eq('organization_id', organization_id)
        .gte('expires_at', getCurrentTimestamp())
        .order('created_at', { ascending: false }) as { data: OrganizationInvite[] | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching invites', new Error(error.message));
        throw internalError('Failed to fetch invites');
      }

      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getOrganizationInvites', error);
      throw err;
    }
  }

  async getInviteById(id: string): Promise<OrganizationInvite | null> {
    try {
      const { data, error } = await this.supabase
        .from('organization_invitations')
        .select('*')
        .eq('id', id)
        .single() as { data: OrganizationInvite | null; error: unknown };

      if (error || !data) {
        return null;
      }

      // Check if expired
      if (new Date(data.expires_at) < new Date()) {
        return null;
      }

      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getInviteById', error);
      return null;
    }
  }

  async acceptInvitation(invite_id: string, user_id: string): Promise<OrganizationMembership> {
    const invite = await this.getInviteById(invite_id);
    if (!invite) {
      throw notFoundError('Invite');
    }

    const membership = await this.addOrganizationMember({
      organization_id: invite.organization_id,
      user_id,
      role: invite.role as 'owner' | 'admin' | 'member',
    });

    // Delete invite
    await this.supabase.from('organization_invitations').delete().eq('id', invite_id);

    return membership;
  }

  async cancelInvitation(invite_id: string): Promise<void> {
    await this.supabase.from('organization_invitations').delete().eq('id', invite_id);
  }

  async getPendingInvitesForEmail(email: string): Promise<InviteWithOrganization[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_invitations')
        .select(`
          *,
          organizations (
            id,
            name,
            slug,
            image
          )
        `)
        .eq('email', email)
        .gte('expires_at', getCurrentTimestamp())
        .order('created_at', { ascending: false }) as { data: InviteWithOrganization[] | null; error: { message: string } | null };

      if (error) {
        logger.error('Error fetching pending invites', new Error(error.message));
        throw internalError('Failed to fetch pending invites');
      }

      return data || [];
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in getPendingInvitesForEmail', error);
      throw err;
    }
  }

  async isEmailAlreadyMember(email: string, organization_id: string): Promise<boolean> {
    try {
      const { data: profile } = await this.supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle() as { data: { id: string } | null; error: unknown };

      if (!profile) {
        return false;
      }

      const { data } = await this.supabase
        .from('organization_members')
        .select('user_id')
        .eq('user_id', profile.id)
        .eq('organization_id', organization_id)
        .maybeSingle() as { data: { user_id: string } | null; error: unknown };

      return !!data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('Exception in isEmailAlreadyMember', error);
      return false;
    }
  }

  async transferOwnership(
    organization_id: string,
    current_owner_id: string,
    new_owner_id: string
  ): Promise<OrganizationMembership> {
    await this.updateMemberRole(organization_id, current_owner_id, 'admin');
    return this.updateMemberRole(organization_id, new_owner_id, 'owner');
  }
}

export const membershipRepository = new MembershipRepository();

// Backward compatibility exports
/**
 * Add a member to an organization (backward compatibility wrapper)
 * @param data - Membership data including organization_id, user_id, and role
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await addOrganizationMember({ organization_id: 'org-123', user_id: 'user-456', role: 'member' });
 */
export async function addOrganizationMember(data: {
  organization_id: string;
  user_id: string;
  role: OrganizationRole;
}) {
  try {
    const membership = await membershipRepository.addOrganizationMember(data);
    return { data: membership, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Remove a member from an organization (backward compatibility wrapper)
 * @param organization_id - Organization ID
 * @param user_id - User ID to remove
 * @returns Object with error property
 * @example
 * const { error } = await removeOrganizationMember('org-123', 'user-456');
 */
export async function removeOrganizationMember(organization_id: string, user_id: string) {
  try {
    await membershipRepository.removeOrganizationMember(organization_id, user_id);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Update a member's role in an organization (backward compatibility wrapper)
 * @param organization_id - Organization ID
 * @param user_id - User ID
 * @param role - New role
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await updateMemberRole('org-123', 'user-456', 'admin');
 */
export async function updateMemberRole(organization_id: string, user_id: string, role: OrganizationRole) {
  try {
    const data = await membershipRepository.updateMemberRole(organization_id, user_id, role);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get all members of an organization (backward compatibility wrapper)
 * @param organization_id - Organization ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getOrganizationMembers('org-123');
 */
export async function getOrganizationMembers(organization_id: string) {
  try {
    const data = await membershipRepository.getOrganizationMembers(organization_id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Create an organization invitation (backward compatibility wrapper)
 * @param data - Invitation data including email, organization_id, role, and invited_by
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await createOrganizationInvite({ email: 'user@example.com', organization_id: 'org-123', role: 'member', invited_by: 'user-789' });
 */
export async function createOrganizationInvite(data: {
  email: string;
  organization_id: string;
  role: OrganizationRole;
  invited_by: string;
  expires_in_days?: number;
}) {
  try {
    const invite = await membershipRepository.createOrganizationInvite(data);
    return { data: invite, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get all active invitations for an organization (backward compatibility wrapper)
 * @param organization_id - Organization ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getOrganizationInvites('org-123');
 */
export async function getOrganizationInvites(organization_id: string) {
  try {
    const data = await membershipRepository.getOrganizationInvites(organization_id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get an invitation by ID (backward compatibility wrapper)
 * @param id - Invitation ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getInviteById('inv-123');
 */
export async function getInviteById(id: string) {
  try {
    const data = await membershipRepository.getInviteById(id);
    return { data, error: data ? null : 'Invite not found or expired' };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Accept an organization invitation (backward compatibility wrapper)
 * @param invite_id - Invitation ID
 * @param user_id - User ID accepting the invitation
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await acceptInvitation('inv-123', 'user-456');
 */
export async function acceptInvitation(invite_id: string, user_id: string) {
  try {
    const data = await membershipRepository.acceptInvitation(invite_id, user_id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Cancel an organization invitation (backward compatibility wrapper)
 * @param invite_id - Invitation ID
 * @returns Object with error property
 * @example
 * const { error } = await cancelInvitation('inv-123');
 */
export async function cancelInvitation(invite_id: string) {
  try {
    await membershipRepository.cancelInvitation(invite_id);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Get all pending invitations for an email address (backward compatibility wrapper)
 * @param email - Email address
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getPendingInvitesForEmail('user@example.com');
 */
export async function getPendingInvitesForEmail(email: string) {
  try {
    const data = await membershipRepository.getPendingInvitesForEmail(email);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Check if an email is already a member of an organization (backward compatibility wrapper)
 * @param email - Email address
 * @param organization_id - Organization ID
 * @returns Boolean indicating membership status
 * @example
 * const isMember = await isEmailAlreadyMember('user@example.com', 'org-123');
 */
export async function isEmailAlreadyMember(email: string, organization_id: string): Promise<boolean> {
  return membershipRepository.isEmailAlreadyMember(email, organization_id);
}

/**
 * Transfer organization ownership from one user to another (backward compatibility wrapper)
 * @param organization_id - Organization ID
 * @param current_owner_id - Current owner's user ID
 * @param new_owner_id - New owner's user ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await transferOwnership('org-123', 'user-456', 'user-789');
 */
export async function transferOwnership(
  organization_id: string,
  current_owner_id: string,
  new_owner_id: string
) {
  try {
    const data = await membershipRepository.transferOwnership(organization_id, current_owner_id, new_owner_id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
