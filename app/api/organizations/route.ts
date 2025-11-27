/**
 * Organizations API Routes
 * Handle organization creation and listing
 */

import { createAuthenticatedRoute, successResponse, validateRequest } from '@/lib/api'
import { cacheKeys, cacheManager } from '@/lib/cache/cache-manager'
import { organizationRepository } from '@/lib/db/organizations'
import { organizationCreateSchema } from '@/lib/validation/schemas'

// Cache user organizations for 2 minutes (user-specific data)
const ORGANIZATIONS_CACHE_TTL = 120

/**
 * GET /api/organizations
 * List all organizations for the current user
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Try to get from cache first
  const cachedData = await cacheManager.memoize(
    cacheKeys.userOrganizations(user.id),
    async () => {
      const organizations = await organizationRepository.getUserOrganizations(user.id)
      return {
        organizations,
        count: organizations.length,
      }
    },
    { ttl: ORGANIZATIONS_CACHE_TTL, namespace: 'organizations' }
  )

  return successResponse(cachedData)
})

/**
 * POST /api/organizations
 * Create a new organization
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate request body
  const validation = await validateRequest(request, organizationCreateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { name, type, industry, size_range } = validation.data

  // Create organization
  const org = await organizationRepository.createOrganization({
    name,
    owner_id: user.id,
    type,
    industry,
    size_range,
  })

  // Invalidate user's organizations cache
  await cacheManager.clear('organizations')

  return successResponse(
    {
      organization: org,
      message: 'Organization created successfully',
    },
    201
  )
})
