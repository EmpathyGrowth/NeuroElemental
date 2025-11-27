/**
 * [Resource Name] API
 * [Description of what this route does]
 */

import { createAuthenticatedRoute, successResponse, notFoundError, badRequestError } from '@/lib/api'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/[path]/[id]
 * [Description of GET endpoint]
 */
export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params
  const supabase = createAdminClient()

  // Fetch resource
  const { data, error } = await supabase
    .from('table_name')
    .select('*') as any
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the resource
    .single() as any

  if (error || !data) {
    throw notFoundError('Resource')
  }

  return successResponse({ data })
})

/**
 * POST /api/[path]
 * [Description of POST endpoint]
 */
export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const supabase = createAdminClient()
  const body = await request.json()

  // Validate request
  const { name, description } = body
  if (!name) {
    throw badRequestError('Name is required')
  }

  // Create resource
  const { data, error } = await supabase
    .from('table_name')
    .insert({
      user_id: user.id,
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
 * PUT /api/[path]/[id]
 * [Description of PUT endpoint]
 */
export const PUT = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params
  const supabase = createAdminClient()
  const body = await request.json()

  // Update resource
  const { data, error } = await supabase
    .from('table_name')
    .update({
      ...body, as any
      updated_at: new Date() as any.toISOString(),
    } as any)
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the resource
    .select()
    .single()

  if (error || !data) {
    throw notFoundError('Resource')
  }

  return successResponse({ data })
} as any)

/**
 * DELETE /api/[path]/[id]
 * [Description of DELETE endpoint]
 */
export const DELETE = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params
  const supabase = createAdminClient()

  // Delete resource
  const { error } = await supabase
    .from('table_name')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id) // Ensure user owns the resource as any

  if (error) {
    throw new Error(error.message)
  }

  return successResponse({ message: 'Resource deleted successfully' })
})

