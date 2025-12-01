/**
 * Permissions & Custom Roles Management
 * Advanced RBAC system for enterprise organizations
 */

import { getSupabaseServer } from "@/lib/db/supabase-server";
import { logger } from "@/lib/logging/logger";

export interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  is_dangerous: boolean;
  created_at: string;
}

export interface OrganizationRole {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color?: string;
  is_system: boolean;
  is_default: boolean;
  permissions: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface RoleAssignmentHistory {
  id: string;
  organization_id: string;
  user_id: string;
  role_id?: string;
  old_role_id?: string;
  action: "assigned" | "removed" | "changed";
  changed_by: string;
  created_at: string;
}

/**
 * Get all available permissions
 */
export async function getAllPermissions(): Promise<Permission[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("permissions")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching permissions", error as Error);
      return [];
    }

    return (data as Permission[]) || [];
  } catch (error) {
    logger.error(
      "Error in getAllPermissions",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return [];
  }
}

/**
 * Get permissions grouped by category
 */
export async function getPermissionsByCategory(): Promise<
  Record<string, Permission[]>
> {
  const permissions = await getAllPermissions();

  return permissions.reduce(
    (acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = [];
      }
      acc[permission.category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );
}

/**
 * Get organization roles
 */
export async function getOrganizationRoles(
  organizationId: string
): Promise<OrganizationRole[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("organization_roles")
      .select("*")
      .eq("organization_id", organizationId)
      .order("is_system", { ascending: false })
      .order("name", { ascending: true });

    if (error) {
      logger.error("Error fetching organization roles", error as Error);
      return [];
    }

    return (data as OrganizationRole[]) || [];
  } catch (error) {
    logger.error(
      "Error in getOrganizationRoles",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return [];
  }
}

/**
 * Get organization role by ID
 */
export async function getOrganizationRole(
  roleId: string
): Promise<OrganizationRole | null> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("organization_roles")
      .select("*")
      .eq("id", roleId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as OrganizationRole;
  } catch (error) {
    logger.error(
      "Error in getOrganizationRole",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return null;
  }
}

/**
 * Create custom role
 */
export async function createOrganizationRole(
  organizationId: string,
  userId: string,
  config: {
    name: string;
    description?: string;
    color?: string;
    permissions: string[];
    is_default?: boolean;
  }
): Promise<{ success: boolean; role?: OrganizationRole; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    // Validate permissions exist
    const { data: validPermissions } = await supabase
      .from("permissions")
      .select("code")
      .in("code", config.permissions);

    const validCodes =
      validPermissions?.map((p: { code: string }) => p.code) || [];
    const invalidPermissions = config.permissions.filter(
      (p: string) => !validCodes.includes(p)
    );

    if (invalidPermissions.length > 0) {
      return {
        success: false,
        error: `Invalid permissions: ${invalidPermissions.join(", ")}`,
      };
    }

    const { data, error } = await supabase
      .from("organization_roles")
      .insert({
        organization_id: organizationId,
        created_by: userId,
        name: config.name,
        description: config.description,
        color: config.color,
        permissions: config.permissions,
        is_default: config.is_default ?? false,
        is_system: false,
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating organization role", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, role: data as OrganizationRole };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in createOrganizationRole",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Update organization role
 */
export async function updateOrganizationRole(
  roleId: string,
  updates: {
    name?: string;
    description?: string;
    color?: string;
    permissions?: string[];
    is_default?: boolean;
  }
): Promise<{ success: boolean; role?: OrganizationRole; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    // Check if role is system role
    const { data: existingRole } = await supabase
      .from("organization_roles")
      .select("is_system")
      .eq("id", roleId)
      .single();

    if (existingRole?.is_system) {
      return {
        success: false,
        error: "Cannot update system roles",
      };
    }

    // Validate permissions if provided
    if (updates.permissions) {
      const { data: validPermissions } = await supabase
        .from("permissions")
        .select("code")
        .in("code", updates.permissions);

      const validCodes =
        validPermissions?.map((p: { code: string }) => p.code) || [];
      const invalidPermissions = updates.permissions.filter(
        (p: string) => !validCodes.includes(p)
      );

      if (invalidPermissions.length > 0) {
        return {
          success: false,
          error: `Invalid permissions: ${invalidPermissions.join(", ")}`,
        };
      }
    }

    const { data, error } = await supabase
      .from("organization_roles")
      .update(updates)
      .eq("id", roleId)
      .select()
      .single();

    if (error) {
      logger.error("Error updating organization role", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, role: data as OrganizationRole };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in updateOrganizationRole",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Delete organization role
 */
export async function deleteOrganizationRole(
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    // Check if role is system role
    const { data: existingRole } = await supabase
      .from("organization_roles")
      .select("is_system")
      .eq("id", roleId)
      .single();

    if (existingRole?.is_system) {
      return {
        success: false,
        error: "Cannot delete system roles",
      };
    }

    // Check if role is assigned to any members
    const { data: assignedMembers } = await supabase
      .from("organization_members")
      .select("id")
      .eq("role_id", roleId)
      .limit(1);

    if (assignedMembers && assignedMembers.length > 0) {
      return {
        success: false,
        error:
          "Cannot delete role that is assigned to members. Please reassign members first.",
      };
    }

    const { error } = await supabase
      .from("organization_roles")
      .delete()
      .eq("id", roleId);

    if (error) {
      logger.error("Error deleting organization role", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in deleteOrganizationRole",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get user permissions in organization
 */
export async function getUserPermissions(
  userId: string,
  organizationId: string
): Promise<string[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase.rpc as any)(
      "get_user_permissions",
      {
        p_user_id: userId,
        p_organization_id: organizationId,
      }
    );

    if (error) {
      logger.error("Error getting user permissions", error as Error);
      return [];
    }

    return (data as string[]) || [];
  } catch (error) {
    logger.error(
      "Error in getUserPermissions",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return [];
  }
}

/**
 * Check if user has permission
 */
export async function userHasPermission(
  userId: string,
  organizationId: string,
  permissionCode: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase.rpc as any)("user_has_permission", {
      p_user_id: userId,
      p_organization_id: organizationId,
      p_permission_code: permissionCode,
    });

    if (error) {
      logger.error("Error checking user permission", error as Error);
      return false;
    }

    return (data as boolean) || false;
  } catch (error) {
    logger.error(
      "Error in userHasPermission",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return false;
  }
}

/**
 * Check if user has any of the permissions
 */
export async function userHasAnyPermission(
  userId: string,
  organizationId: string,
  permissionCodes: string[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId);

  return permissionCodes.some((code) => permissions.includes(code));
}

/**
 * Check if user has all permissions
 */
export async function userHasAllPermissions(
  userId: string,
  organizationId: string,
  permissionCodes: string[]
): Promise<boolean> {
  const permissions = await getUserPermissions(userId, organizationId);

  return permissionCodes.every((code) => permissions.includes(code));
}

/**
 * Assign role to user
 */
export async function assignRoleToUser(
  userId: string,
  organizationId: string,
  roleId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { error } = await supabase
      .from("organization_members")
      .update({ role_id: roleId })
      .eq("organization_id", organizationId)
      .eq("user_id", userId);

    if (error) {
      logger.error("Error assigning role to user", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in assignRoleToUser",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get role assignment history
 */
export async function getRoleAssignmentHistory(
  organizationId: string,
  options?: {
    userId?: string;
    limit?: number;
    offset?: number;
  }
): Promise<{
  history: RoleAssignmentHistory[];
  total: number;
}> {
  try {
    const supabase = getSupabaseServer();
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    let query = supabase
      .from("role_assignment_history")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.userId) {
      query = query.eq("user_id", options.userId);
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching role assignment history", error as Error);
      return { history: [], total: 0 };
    }

    return {
      history: (data as RoleAssignmentHistory[]) || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      "Error in getRoleAssignmentHistory",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { history: [], total: 0 };
  }
}

/**
 * Get members count by role
 */
export async function getMembersCountByRole(
  organizationId: string
): Promise<Record<string, number>> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("organization_members")
      .select("role, role_id")
      .eq("organization_id", organizationId);

    if (error) {
      logger.error("Error fetching members count by role", error as Error);
      return {};
    }

    // Count by role
    const counts: Record<string, number> = {};
    data?.forEach((member: { role_id: string | null; role: string }) => {
      const key = member.role_id || member.role;
      if (key) {
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return counts;
  } catch (error) {
    logger.error(
      "Error in getMembersCountByRole",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return {};
  }
}
