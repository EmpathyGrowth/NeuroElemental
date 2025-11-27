/**
 * Organization Access Middleware
 *
 * @deprecated This entire module is deprecated. Use the following instead:
 *
 * - For basic org access: requireOrganizationAccess(userId, orgId) from @/lib/api
 * - For admin access: requireOrganizationAccess(userId, orgId, true) from @/lib/api
 * - For owner access: requireOrganizationOwner(userId, orgId) from @/lib/api
 * - For route factories: createAuthenticatedRoute() with access helpers
 *
 * Example migration:
 * ```typescript
 * // Before (deprecated):
 * export const GET = withOrgAccess(async (request, user, orgId, role) => { ... })
 *
 * // After (recommended):
 * export const GET = createAuthenticatedRoute(async (request, context, user) => {
 *   const { id } = await context.params
 *   await requireOrganizationAccess(user.id, id)
 *   return successResponse({ ... })
 * })
 * ```
 */

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getSupabaseServer } from '@/lib/db/supabase-server'
import { unauthorizedError, forbiddenError, errorResponse, ApiError } from '@/lib/api'
import { logger } from '@/lib/logging'

export interface OrgAccessResult {
  hasAccess: boolean
  userId?: string
  role?: string
  organizationId?: string
  error?: ApiError
}

/**
 * Check if user has access to organization
 * Returns role if user is a member
 */
export async function requireOrgAccess(
  organizationId: string
): Promise<OrgAccessResult> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      hasAccess: false,
      error: unauthorizedError(),
    }
  }

  const supabase = getSupabaseServer()

  // Check if user is a member of the organization
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .single()

  if (error || !membership) {
    return {
      hasAccess: false,
      userId: user.id,
      error: forbiddenError('Not a member of this organization'),
    }
  }

  return {
    hasAccess: true,
    userId: user.id,
    role: membership.role,
    organizationId,
  }
}

/**
 * Require admin or owner role in organization
 */
export async function requireOrgAdmin(
  organizationId: string
): Promise<OrgAccessResult> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      hasAccess: false,
      error: unauthorizedError(),
    }
  }

  const supabase = getSupabaseServer()

  // Check if user has admin/owner role
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .in('role', ['owner', 'admin'])
    .single()

  if (error || !membership) {
    return {
      hasAccess: false,
      userId: user.id,
      error: forbiddenError('Admin or owner access required'),
    }
  }

  return {
    hasAccess: true,
    userId: user.id,
    role: membership.role,
    organizationId,
  }
}

/**
 * Require owner role in organization
 */
export async function requireOrgOwner(
  organizationId: string
): Promise<OrgAccessResult> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      hasAccess: false,
      error: unauthorizedError(),
    }
  }

  const supabase = getSupabaseServer()

  // Check if user is owner
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .eq('role', 'owner')
    .single()

  if (error || !membership) {
    return {
      hasAccess: false,
      userId: user.id,
      error: forbiddenError('Owner access required'),
    }
  }

  return {
    hasAccess: true,
    userId: user.id,
    role: membership.role,
    organizationId,
  }
}

/**
 * Require specific permission in organization
 */
export async function requireOrgPermission(
  organizationId: string,
  permissionCode: string
): Promise<OrgAccessResult> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      hasAccess: false,
      error: unauthorizedError(),
    }
  }

  const supabase = getSupabaseServer()

  // Check if user has the permission
   
  // Note: user_has_permission RPC may not be in generated types
  const { data, error } = await supabase.rpc('user_has_permission' as never, {
    p_user_id: user.id,
    p_organization_id: organizationId,
    p_permission_code: permissionCode,
  } as never)

  if (error || !data) {
    return {
      hasAccess: false,
      userId: user.id,
      error: forbiddenError(`Permission ${permissionCode} required`),
    }
  }

  return {
    hasAccess: true,
    userId: user.id,
    organizationId,
  }
}

/**
 * Check if organization exists
 */
export async function verifyOrgExists(
  organizationId: string
): Promise<boolean> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('organizations')
    .select('id')
    .eq('id', organizationId)
    .single()

  return !error && !!data
}

/**
 * Get user's role in organization
 */
export async function getUserOrgRoleMiddleware(
  userId: string,
  organizationId: string
): Promise<string | null> {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.role
}

/**
 * Higher-order function for organization access
 * Wraps API route handler with organization access check
 *
 * @example
 * export const GET = withOrgAccess(async (request, user, orgId, role) => {
 *   // user has access to org, proceed with business logic
 *   return successResponse({ data })
 * })
 */
export function withOrgAccess<T = any>(
  handler: (
    request: Request,
    user: { id: string },
    organizationId: string,
    role: string,
    params?: any
  ) => Promise<NextResponse<T>>
) {
  return async (request: Request, context?: { params: Promise<any> }) => {
    try {
      const params = context?.params ? await context.params : {}
      const organizationId = params.id || params.organizationId

      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }

      const access = await requireOrgAccess(organizationId)
      if (access.error) return errorResponse(access.error)

      return await handler(
        request,
        { id: access.userId! },
        organizationId,
        access.role!,
        params
      )
    } catch (error) {
      logger.error('Organization access error', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Higher-order function for organization admin access
 */
export function withOrgAdmin<T = any>(
  handler: (
    request: Request,
    user: { id: string },
    organizationId: string,
    role: string,
    params?: any
  ) => Promise<NextResponse<T>>
) {
  return async (request: Request, context?: { params: Promise<any> }) => {
    try {
      const params = context?.params ? await context.params : {}
      const organizationId = params.id || params.organizationId

      if (!organizationId) {
        return NextResponse.json(
          { error: 'Organization ID is required' },
          { status: 400 }
        )
      }

      const access = await requireOrgAdmin(organizationId)
      if (access.error) return errorResponse(access.error)

      return await handler(
        request,
        { id: access.userId! },
        organizationId,
        access.role!,
        params
      )
    } catch (error) {
      logger.error('Organization admin access error', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}
