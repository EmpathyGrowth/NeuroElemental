/**
 * GDPR Data Export Request Detail API
 * Get details of a specific export request
 */

import { badRequestError, createAuthenticatedRoute, forbiddenError, notFoundError, successResponse } from '@/lib/api'
import { getExportRequest } from '@/lib/gdpr'

/**
 * GET /api/user/data-export/[requestId]
 * Get export request details
 */
export const GET = createAuthenticatedRoute<{ requestId: string }>(async (_request, context, user) => {
  const { requestId } = await context.params

  if (!requestId) {
    throw badRequestError('Request ID is required')
  }

  // Get export request
  const exportRequest = await getExportRequest(requestId)

  if (!exportRequest) {
    throw notFoundError('Export request')
  }

  // Verify user owns this request
  if (exportRequest.user_id !== user.id) {
    throw forbiddenError('You can only access your own export requests')
  }

  // If completed, add download URL
  let downloadUrl = null
  if (exportRequest.status === 'completed' && exportRequest.expires_at) {
    // Check if not expired
    const expiresAt = new Date(exportRequest.expires_at)
    if (expiresAt > new Date()) {
      downloadUrl = `/api/user/data-export/${requestId}/download`
    }
  }

  return successResponse({
    request: {
      ...exportRequest,
      download_url: downloadUrl,
    },
  })
});
