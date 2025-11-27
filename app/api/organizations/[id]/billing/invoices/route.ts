/**
 * Organization Billing Invoices API
 * GET: Get invoice history with pagination
 */

import { createAuthenticatedRoute, forbiddenError, badRequestError, internalError, successResponse } from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db'
import { getInvoices } from '@/lib/billing'

export const dynamic = 'force-dynamic'

/**
 * GET /api/organizations/[id]/billing/invoices
 * Get invoice history
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is org admin
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Organization admin access required')

  // Parse query parameters
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '50', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  // Validate parameters
  if (limit < 1 || limit > 100) {
    throw badRequestError('limit must be between 1 and 100')
  }

  if (offset < 0) {
    throw badRequestError('offset must be 0 or greater')
  }

  // Get invoices
  const result = await getInvoices(id, { limit, offset })

  if (!result.success) {
    throw internalError('Failed to fetch invoices: ' + result.error)
  }

  return successResponse({
    invoices: result.invoices,
    total: result.total,
    limit,
    offset,
  })
})
