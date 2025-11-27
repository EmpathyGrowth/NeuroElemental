/**
 * SSO Authentication Attempts API
 * View SSO authentication attempt logs
 */

import {
  createAuthenticatedRoute,
  successResponse,
  badRequestError,
  requireOrganizationAccess,
} from '@/lib/api'
import { getSSOAuthAttempts } from '@/lib/sso/manage'

/**
 * GET /api/organizations/[id]/sso/attempts
 * Get SSO authentication attempts log (requires org admin)
 * Query params:
 *   - limit: number (default: 50, max: 100)
 *   - offset: number (default: 0)
 *   - status: 'success' | 'failed' | 'error' (optional filter)
 */
export const GET = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params

    // Require admin access
    await requireOrganizationAccess(user.id, id, true)

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const status = searchParams.get('status') as 'success' | 'failed' | 'error' | null

    // Validate parameters
    if (limit < 1 || limit > 100) {
      throw badRequestError('Limit must be between 1 and 100')
    }

    if (offset < 0) {
      throw badRequestError('Offset must be non-negative')
    }

    if (status && !['success', 'failed', 'error'].includes(status)) {
      throw badRequestError('Status must be success, failed, or error')
    }

    // Fetch attempts
    const result = await getSSOAuthAttempts(id, {
      limit,
      offset,
      status: status || undefined,
    })

    return successResponse({
      attempts: result.attempts,
      total: result.total,
      limit,
      offset,
    })
  }
)
