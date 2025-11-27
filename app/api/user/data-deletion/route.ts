/**
 * GDPR Data Deletion API Routes
 * Implements GDPR Article 17 (Right to Erasure)
 */

import { createAuthenticatedRoute, getRequestMetadata, internalError, successResponse, validateRequest } from '@/lib/api'
import { sendDataDeletionConfirmation } from '@/lib/email'
import { createDataDeletionRequest, getUserDeletionRequests } from '@/lib/gdpr'
import { logger } from '@/lib/logging'
import { dataDeletionApiRequestSchema } from '@/lib/validation/schemas'

/**
 * GET /api/user/data-deletion
 * List user's deletion requests
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  // Get user's deletion requests
  const requests = await getUserDeletionRequests(user.id)

  return successResponse({ requests })
});

/**
 * POST /api/user/data-deletion
 * Create data deletion request
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate request body
  const validation = await validateRequest(request, dataDeletionApiRequestSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { deletion_type, organization_id, requested_reason } = validation.data

  // Get request metadata
  const { ip_address, user_agent } = getRequestMetadata(request)

  // Create deletion request
  const result = await createDataDeletionRequest(user.id, {
    deletion_type: deletion_type as 'account' | 'organization_data',
    organization_id,
    requested_reason,
    ip_address,
    user_agent,
  })

  if (!result.success) {
    throw internalError('Failed to create deletion request')
  }

  // Send confirmation email with token (required for security)
  if (result.request?.confirmation_token && user.email) {
    sendDataDeletionConfirmation({
      to: user.email,
      deletionType: deletion_type as 'account' | 'organization_data',
      confirmationToken: result.request.confirmation_token,
    }).catch((err) => {
      logger.error('Failed to send data deletion confirmation email:', err as Error)
    })
  }

  return successResponse({
    success: true,
    request: {
      id: result.request?.id,
      deletion_type: result.request?.deletion_type,
      status: result.request?.status,
      created_at: result.request?.created_at,
    },
    message: 'Deletion request created. Please check your email to confirm.',
  })
});
