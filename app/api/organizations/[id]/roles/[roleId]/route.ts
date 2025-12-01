/**
 * Organization Role Details API Routes
 * Get, update, and delete specific roles
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  forbiddenError,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { isUserOrgMember, isUserOrgOwner } from "@/lib/db";
import {
  deleteOrganizationRole,
  getMembersCountByRole,
  getOrganizationRole,
  updateOrganizationRole,
} from "@/lib/permissions/manage";

/**
 * GET /api/organizations/[id]/roles/[roleId]
 * Get role details
 * Requires: Organization member
 */
export const GET = createAuthenticatedRoute<{ id: string; roleId: string }>(
  async (_request, context, user) => {
    const { id, roleId } = await context.params;

    // Check if user is member of organization
    const isMember = await isUserOrgMember(user.id, id);
    if (!isMember) throw forbiddenError();

    // Get role
    const role = await getOrganizationRole(roleId);
    if (!role) throw notFoundError("Role");

    // Verify role belongs to organization
    if (role.organization_id !== id) throw forbiddenError();

    // Get member count for this role
    const memberCounts = await getMembersCountByRole(id);
    const memberCount = memberCounts[roleId] || 0;

    return successResponse({
      role: {
        ...role,
        member_count: memberCount,
      },
    });
  }
);

/**
 * PATCH /api/organizations/[id]/roles/[roleId]
 * Update role
 * Requires: Organization owner
 */
export const PATCH = createAuthenticatedRoute<{ id: string; roleId: string }>(
  async (request, context, user) => {
    const { id, roleId } = await context.params;

    // Check if user is organization owner
    const isOwner = await isUserOrgOwner(user.id, id);
    if (!isOwner)
      throw forbiddenError("Only organization owners can update roles");

    // Get role to verify it belongs to this organization
    const role = await getOrganizationRole(roleId);
    if (!role) throw notFoundError("Role");
    if (role.organization_id !== id) throw forbiddenError();

    const body = await request.json();
    const { name, description, color, permissions, is_default } = body;

    // Build updates object with proper typing
    const updates: {
      name?: string;
      description?: string;
      color?: string;
      permissions?: string[];
      is_default?: boolean;
    } = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (color !== undefined) updates.color = color;
    if (permissions !== undefined) updates.permissions = permissions;
    if (is_default !== undefined) updates.is_default = is_default;

    // Update role
    const result = await updateOrganizationRole(roleId, updates);

    if (!result.success) {
      throw badRequestError(result.error || "Failed to update role");
    }

    return successResponse({ role: result.role });
  }
);

/**
 * DELETE /api/organizations/[id]/roles/[roleId]
 * Delete role
 * Requires: Organization owner
 */
export const DELETE = createAuthenticatedRoute<{ id: string; roleId: string }>(
  async (_request, context, user) => {
    const { id, roleId } = await context.params;

    // Check if user is organization owner
    const isOwner = await isUserOrgOwner(user.id, id);
    if (!isOwner)
      throw forbiddenError("Only organization owners can delete roles");

    // Get role to verify it belongs to this organization
    const role = await getOrganizationRole(roleId);
    if (!role) throw notFoundError("Role");
    if (role.organization_id !== id) throw forbiddenError();

    // Delete role
    const result = await deleteOrganizationRole(roleId);

    if (!result.success) {
      throw badRequestError(result.error || "Failed to delete role");
    }

    return successResponse({ success: true });
  }
);
