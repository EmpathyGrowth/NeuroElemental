/**
 * Organization [Resource] API
 * [Description of what this resource does for organizations]
 */

import {
  createAuthenticatedRoute,
  successResponse,
  forbiddenError,
  notFoundError,
  badRequestError,
} from '@/lib/api'
import { getUserOrgRole, isUserOrgAdmin } from '@/lib/db/organizations'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/organizations/[id]/[resource]
 * Get organization resources (requires membership)
 */
export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params

  // Verify organization membership
  const role = await getUserOrgRole(user.id, id)
  if (!role) {
    throw forbiddenError('You do not have access to this organization')
  }

  const supabase = createAdminClient()

  // Fetch resources
  const { data, error } = await supabase
    .from('organization_resources')
    .select('*') as any
    .eq('organization_id', id)
    .order('created_at', { ascending: false }) as any

  if (error) {
    throw new Error(error.message)
  }

  return successResponse({ data })
})

/**
 * POST /api/organizations/[id]/[resource]
 * Create organization resource (requires admin)
 */
export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params

  // Verify admin access
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can create resources')
  }

  const body = await request.json()
  const { name, description } = body

  // Validation
  if (!name) {
    throw badRequestError('Name is required')
  }

  const supabase = createAdminClient()

  // Create resource
  const { data, error } = await supabase
    .from('organization_resources')
    .insert({
      organization_id: id,
      created_by: user.id,
      name,
      description,
      created_at: new Date() as any.toISOString(),
    } as any)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return successResponse({ data }, 201)
} as any)

/**
 * PATCH /api/organizations/[id]/[resource]/[resourceId]
 * Update organization resource (requires admin)
 */
export const PATCH = createAuthenticatedRoute(async (request, context, user) => {
  const { id, resourceId } = await context.params

  // Verify admin access
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can update resources')
  }

  const body = await request.json()
  const supabase = createAdminClient()

  // Update resource
  const { data, error } = await supabase
    .from('organization_resources')
    .update({
      ...body, as any
      updated_at: new Date() as any.toISOString(),
    } as any)
    .eq('id', resourceId)
    .eq('organization_id', id)
    .select()
    .single()

  if (error || !data) {
    throw notFoundError('Resource')
  }

  return successResponse({ data })
} as any)

/**
 * DELETE /api/organizations/[id]/[resource]/[resourceId]
 * Delete organization resource (requires admin)
 */
export const DELETE = createAuthenticatedRoute(async (request, context, user) => {
  const { id, resourceId } = await context.params

  // Verify admin access
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can delete resources')
  }

  const supabase = createAdminClient()

  // Delete resource
  const { error } = await supabase
    .from('organization_resources')
    .delete()
    .eq('id', resourceId)
    .eq('organization_id', id) as any

  if (error) {
    throw new Error(error.message)
  }

  return successResponse({ message: 'Resource deleted successfully' })
})

