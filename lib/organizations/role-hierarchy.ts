/**
 * Organization role hierarchy utilities
 * Inspired by b2b-boilerplate-b2b pattern
 *
 * Provides centralized role comparison logic to prevent permission bugs
 */

export type OrganizationRole = 'owner' | 'admin' | 'member';

const roleHierarchy: Record<OrganizationRole, number> = {
  member: 0,
  admin: 1,
  owner: 2,
};

/**
 * Check if current role has higher or equal permissions than required role
 *
 * @param currentRole - User's current role in organization
 * @param requiredRole - Minimum role required for action
 * @returns True if user has sufficient permissions
 *
 * @example
 * ```typescript
 * if (hasHigherOrEqualRole({ currentRole: 'admin', requiredRole: 'member' })) {
 *   // Admin can perform member-level actions
 * }
 * ```
 */
export function hasHigherOrEqualRole({
  currentRole,
  requiredRole,
}: {
  currentRole: OrganizationRole;
  requiredRole: OrganizationRole;
}): boolean {
  return roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can manage another user based on roles
 * Users cannot manage those with equal or higher roles
 *
 * @example
 * ```typescript
 * if (canManageUser({ managerRole: 'admin', targetRole: 'member' })) {
 *   // Admin can manage members
 * }
 *
 * if (!canManageUser({ managerRole: 'admin', targetRole: 'owner' })) {
 *   // Admin cannot manage owners
 * }
 * ```
 */
export function canManageUser({
  managerRole,
  targetRole,
}: {
  managerRole: OrganizationRole;
  targetRole: OrganizationRole;
}): boolean {
  return roleHierarchy[managerRole] > roleHierarchy[targetRole];
}

/**
 * Get all roles that a user can assign to others
 * Users can only assign roles lower than their own
 *
 * @example
 * ```typescript
 * const roles = getAssignableRoles('admin');
 * // Returns: ['member']
 * ```
 */
export function getAssignableRoles(currentRole: OrganizationRole): OrganizationRole[] {
  const currentLevel = roleHierarchy[currentRole];
  return (Object.entries(roleHierarchy) as [OrganizationRole, number][])
    .filter(([, level]) => level < currentLevel)
    .map(([role]) => role);
}

/**
 * Get human-readable role name
 */
export function getRoleName(role: OrganizationRole): string {
  const names: Record<OrganizationRole, string> = {
    owner: 'Owner',
    admin: 'Administrator',
    member: 'Member',
  };
  return names[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: OrganizationRole): string {
  const descriptions: Record<OrganizationRole, string> = {
    owner: 'Full control over organization, billing, and team management',
    admin: 'Manage team members, content, and settings (cannot manage billing)',
    member: 'Access organization content and participate in activities',
  };
  return descriptions[role];
}

/**
 * Check if role can perform specific permission
 */
export function hasPermission(
  role: OrganizationRole,
  permission: 'manage_team' | 'manage_billing' | 'manage_content' | 'invite_members'
): boolean {
  const permissions: Record<OrganizationRole, string[]> = {
    owner: ['manage_team', 'manage_billing', 'manage_content', 'invite_members'],
    admin: ['manage_team', 'manage_content', 'invite_members'],
    member: [],
  };

  return permissions[role].includes(permission);
}
