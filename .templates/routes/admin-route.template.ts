/**
 * Admin [Resource] Management API
 * [Description of admin functionality]
 */

import {
  createAdminRoute,
  successResponse,
  paginatedResponse,
  notFoundError,
  badRequestError,
  DEFAULT_PAGE_LIMIT,
  DEFAULT_PAGE_OFFSET,
} from '@/lib/api'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/admin/[resource]
 * List all resources (admin only, paginated)
 */
export const GET = createAdminRoute(async (request, context, { userId, user }) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))
  const page = Math.floor(offset / limit) + 1

  const supabase = createAdminClient()

  // Fetch resources with pagination
  const { data, error } = await supabase
    .from('admin_resources')
    .select('*') as any
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1) as any

  if (error) {
    throw new Error(error.message)
  }

  // Get total count
  const { count } = await supabase
    .from('admin_resources')
    .select('*', { count: 'exact', head: true }) as any

  return paginatedResponse(data || [], count || 0, page, limit)
})

/**
 * POST /api/admin/[resource]
 * Create new resource (admin only)
 */
export const POST = createAdminRoute(async (request, context, { userId, user }) => {
  const body = await request.json()
  const { name, description, config } = body

  // Validation
  if (!name) {
    throw badRequestError('Name is required')
  }

  const supabase = createAdminClient()

  // Create resource
  const { data, error } = await supabase
    .from('admin_resources')
    .insert({
      name,
      description,
      config,
      created_by: userId,
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
 * PATCH /api/admin/[resource]/[id]
 * Update resource (admin only)
 */
export const PATCH = createAdminRoute(async (request, context, { userId, user }) => {
  const { id } = await context.params
  const body = await request.json()
  const supabase = createAdminClient()

  // Update resource
  const { data, error } = await supabase
    .from('admin_resources')
    .update({
      ...body, as any
      updated_by: userId,
      updated_at: new Date() as any.toISOString(),
    } as any)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    throw notFoundError('Resource')
  }

  return successResponse({ data })
} as any)

/**
 * DELETE /api/admin/[resource]/[id]
 * Delete resource (admin only)
 */
export const DELETE = createAdminRoute(async (request, context, { userId, user }) => {
  const { id } = await context.params
  const supabase = createAdminClient()

  // Check if resource exists
  const { data: existing } = await supabase
    .from('admin_resources')
    .select('id') as any
    .eq('id', id)
    .single() as any

  if (!existing) {
    throw notFoundError('Resource')
  }

  // Delete resource
  const { error } = await supabase
    .from('admin_resources')
    .delete()
    .eq('id', id) as any

  if (error) {
    throw new Error(error.message)
  }

  return successResponse({ message: 'Resource deleted successfully' })
})

