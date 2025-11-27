/**
 * Admin Credits API
 * View all credit transactions across the platform
 */

import { createAdminRoute, DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET, internalError, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/**
 * GET /api/admin/credits
 * List all credit transactions (admin only)
 */
export const GET = createAdminRoute(async (request, _context, _admin) => {
  const supabase = getSupabaseServer()
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))
  const organizationId = searchParams.get('organization_id')
  const creditType = searchParams.get('credit_type')
  const transactionType = searchParams.get('transaction_type')

  // Build query
  let query = supabase
    .from('credit_transactions')
    .select(`
      *,
      organization:organizations(name,
        slug
      )
    `
    )
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Apply filters
  if (organizationId) {
    query = query.eq('organization_id', organizationId)
  }

  if (creditType) {
    query = query.eq('credit_type', creditType)
  }

  if (transactionType) {
    query = query.eq('transaction_type', transactionType)
  }

  const { data: transactions, error } = await query

  if (error) {
    throw internalError('Failed to fetch transactions: ' + error.message)
  }

  // Get total count for pagination
  const { count } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })

  return successResponse({
    transactions: transactions || [],
    total: count || 0,
    limit,
    offset,
  })
})

