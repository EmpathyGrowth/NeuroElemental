/**
 * GDPR Data Deletion Confirmation API
 * Confirm deletion request with token
 */

import { confirmDataDeletionRequest } from '@/lib/gdpr/data-export'
import { createPublicRoute, badRequestError, successResponse } from '@/lib/api'

/**
 * POST /api/user/data-deletion/confirm
 * Confirm deletion request with token
 */
export const POST = createPublicRoute(async (request, _context) => {
  // Parse request body
  const body = await request.json()
  const { confirmation_token } = body

  if (!confirmation_token) {
    throw badRequestError('Confirmation token is required')
  }

  // Confirm deletion request
  const result = await confirmDataDeletionRequest(confirmation_token)

  if (!result.success) {
    throw badRequestError(result.error || 'Failed to confirm deletion request')
  }

  return successResponse({
    success: true,
    message: 'Deletion request confirmed successfully. Your data will be deleted within 30 days.',
    request: {
      id: result.request?.id,
      deletion_type: result.request?.deletion_type,
      status: result.request?.status,
      confirmed_at: result.request?.confirmed_at,
    },
  })
});

/**
 * GET /api/user/data-deletion/confirm
 * Confirm deletion request with token (via URL query parameter)
 */
export const GET = createPublicRoute(async (request, _context) => {
  const searchParams = request.nextUrl.searchParams
  const confirmation_token = searchParams.get('token')

  if (!confirmation_token) {
    throw badRequestError('Confirmation token is required')
  }

  // Confirm deletion request
  const result = await confirmDataDeletionRequest(confirmation_token)

  if (!result.success) {
    throw badRequestError(result.error || 'Failed to confirm deletion request')
  }

  return successResponse({
    success: true,
    message: 'Deletion request confirmed successfully. Your data will be deleted within 30 days.',
    request: {
      id: result.request?.id,
      deletion_type: result.request?.deletion_type,
      status: result.request?.status,
      confirmed_at: result.request?.confirmed_at,
    },
  })
});
