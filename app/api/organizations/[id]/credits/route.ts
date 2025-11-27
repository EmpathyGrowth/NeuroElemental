/**
 * Organization Credits API Routes
 * Manage credit balances and transactions
 */

import { createAuthenticatedRoute, forbiddenError, badRequestError, successResponse, internalError } from '@/lib/api'
import { getUserOrgRole, isUserOrgAdmin, getOrganizationAllCredits, getCreditTransactions, addCredits, deductCredits, getCreditStatistics } from '@/lib/db'
import type { CreditType } from '@/lib/types/supabase'

/**
 * GET /api/organizations/[id]/credits
 * Get credit balances and transaction history
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is member of organization
  const role = await getUserOrgRole(user.id, id)
  if (!role) throw forbiddenError()

  const { searchParams } = new URL(request.url)
  const includeTransactions = searchParams.get('includeTransactions') === 'true'
  const includeStats = searchParams.get('includeStats') === 'true'

  // Get credit balances
  const credits = await getOrganizationAllCredits(id)

  const response: any = { credits }

  // Optionally include transaction history
  if (includeTransactions) {
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const credit_type = searchParams.get('credit_type') as CreditType | undefined

    response.transactions = await getCreditTransactions(id, {
      credit_type,
      limit,
      offset,
    })
  }

  // Optionally include statistics
  if (includeStats) {
    response.statistics = await getCreditStatistics(id)
  }

  return successResponse(response)
})

/**
 * POST /api/organizations/[id]/credits
 * Add credits to organization (admin only)
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Only admins and owners can add credits
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Only admins can add credits')

  const body = await request.json()
  const {
    credit_type,
    amount,
    payment_id,
    expiration_days,
    metadata,
  } = body

  if (!credit_type || !amount) {
    throw badRequestError('credit_type and amount are required')
  }

  if (amount <= 0) {
    throw badRequestError('Amount must be positive')
  }

  // Add credits
  const { data: transaction, error } = await addCredits({
    organization_id: id,
    credit_type,
    amount,
    user_id: user.id,
    payment_id,
    expiration_days,
    metadata,
  })

  if (error || !transaction) {
    throw internalError('Failed to add credits')
  }

  return successResponse(
    {
      transaction,
      message: `Successfully added ${amount} ${credit_type} credits`,
    },
    201
  )
})

/**
 * DELETE /api/organizations/[id]/credits
 * Deduct credits from organization
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is member of organization
  const role = await getUserOrgRole(user.id, id)
  if (!role) throw forbiddenError()

  const body = await request.json()
  const { credit_type, amount, metadata } = body

  if (!credit_type || !amount) {
    throw badRequestError('credit_type and amount are required')
  }

  if (amount <= 0) {
    throw badRequestError('Amount must be positive')
  }

  // Deduct credits
  const { data: transaction, error } = await deductCredits({
    organization_id: id,
    credit_type,
    amount,
    user_id: user.id,
    metadata,
  })

  if (error) {
    // Check if it's insufficient credits error
    if (error === 'Insufficient credits') {
      throw badRequestError('Insufficient credits')
    }
    throw internalError('Failed to deduct credits')
  }

  return successResponse({
    transaction,
    message: `Successfully deducted ${amount} ${credit_type} credits`,
  })
})
