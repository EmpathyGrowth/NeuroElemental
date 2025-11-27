/**
 * Organization Detail API Routes
 * Handle individual organization operations
 */

import { createAuthenticatedRoute, forbiddenError, successResponse, validateRequest } from '@/lib/api'
import { cacheManager } from '@/lib/cache/cache-manager'
import { organizationRepository } from '@/lib/db/organizations'
import { organizationUpdateSchema } from '@/lib/validation/schemas'

/**
 * GET /api/organizations/[id]
 * Get organization details
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is a member of the organization
  const role = await organizationRepository.getUserOrgRole(user.id, id)
  if (!role) throw forbiddenError('Not a member of this organization')

  // Fetch organization details with members (throws notFoundError if not found)
  const organization = await organizationRepository.getOrganizationWithMembers(id)

  return successResponse({
    organization,
    role,
  })
})

/**
 * PUT /api/organizations/[id]
 * Update organization details
 */
export const PUT = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is owner or admin
  const isAdmin = await organizationRepository.isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only owners and admins can update organization settings')

  // Validate request body
  const validation = await validateRequest(request, organizationUpdateSchema)
  if (!validation.success) {
    throw validation.error
  }

  // Update organization (throws on error)
  const organization = await organizationRepository.updateOrganization(id, validation.data)

  // Invalidate organization cache
  await cacheManager.clear('organizations')

  return successResponse({ organization })
})

/**
 * DELETE /api/organizations/[id]
 * Delete organization (owner only)
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is owner
  const role = await organizationRepository.getUserOrgRole(user.id, id)
  if (role !== 'owner') throw forbiddenError('Only owners can delete the organization')

  // Delete organization (cascade will handle memberships, invites, etc.)
  await organizationRepository.deleteOrganization(id)

  // Invalidate organization cache
  await cacheManager.clear('organizations')

  return successResponse({ success: true })
})
