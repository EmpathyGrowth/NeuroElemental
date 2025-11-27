/**
 * Organization Roles API Routes
 * Manage custom roles for an organization
 */

import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
  requireOrganizationAccess,
  requireOrganizationOwner,
  validateRequest,
} from '@/lib/api'
import { organizationRoleCreateSchema } from '@/lib/validation/schemas'
import {
  getOrganizationRoles,
  createOrganizationRole,
  getMembersCountByRole,
} from '@/lib/permissions/manage'

/**
 * GET /api/organizations/[id]/roles
 * Get all roles for an organization (system + custom)
 * Requires: Organization member
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (_request, context, user) => {
    const { id } = await context.params

    // Check if user is member of organization
    await requireOrganizationAccess(user.id, id)

    // Get all roles
    const roles = await getOrganizationRoles(id)

    // Get member counts for each role
    const memberCounts = await getMembersCountByRole(id)

    // Enrich roles with member counts
    const rolesWithCounts = roles.map((role) => ({
      ...role,
      member_count: memberCounts[role.id] || 0,
    }))

    return successResponse({ roles: rolesWithCounts })
  }
)

/**
 * POST /api/organizations/[id]/roles
 * Create a custom role
 * Requires: Organization owner
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params

    // Require owner access
    await requireOrganizationOwner(user.id, id)

    // Validate request body
    const validation = await validateRequest(request, organizationRoleCreateSchema)
    if (!validation.success) {
      throw validation.error
    }

    const { name, description, color, permissions, is_default } = validation.data

    // Create role
    const result = await createOrganizationRole(id, user.id, {
      name,
      description,
      color,
      permissions,
      is_default,
    })

    if (!result.success) {
      throw badRequestError(result.error || 'Failed to create role')
    }

    return successResponse({ role: result.role }, 201)
  }
)
