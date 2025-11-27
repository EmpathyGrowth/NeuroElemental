/**
 * GDPR Data Export Download API
 * Download exported data file
 */

import { logger } from '@/lib/logging';
import { NextResponse } from 'next/server'
import { ApiError, badRequestError, createAuthenticatedRoute, forbiddenError, getClientIP, getUserAgent, internalError, notFoundError, validationError } from '@/lib/api'
import { getExportRequest, logDataAccess } from '@/lib/gdpr'

/**
 * GET /api/user/data-export/[requestId]/download
 * Download exported data file
 */
export const GET = createAuthenticatedRoute<{ requestId: string }>(async (request, context, user) => {
  const { requestId } = await context.params

  if (!requestId) {
    throw validationError('Request ID is required', { field: 'requestId' })
  }

  // Get export request
  const exportRequest = await getExportRequest(requestId)

  if (!exportRequest) {
    throw notFoundError('Export request')
  }

  // Verify user owns this request
  if (exportRequest.user_id !== user.id) {
    throw forbiddenError('You can only download your own exports')
  }

  // Check if export is completed
  if (exportRequest.status !== 'completed') {
    throw badRequestError('Export is not yet completed. Please try again later.')
  }

  // Check if export has expired
  if (exportRequest.expires_at) {
    const expiresAt = new Date(exportRequest.expires_at)
    if (expiresAt < new Date()) {
      throw new ApiError('Export has expired. Please request a new export.', 410)
    }
  }

  // Check if file_path exists
  if (!exportRequest.file_path) {
    throw notFoundError('Export data')
  }

  // Log data access
  const ip_address = getClientIP(request)
  const user_agent = getUserAgent(request)

  await logDataAccess(user.id, user.id, {
    access_type: 'export',
    resource_type: 'data_export',
    resource_id: requestId,
    reason: 'User downloaded their data export',
    ip_address,
    user_agent,
  })

  // Parse the JSON data from file_path (stored as JSON string in database)
  let exportData
  try {
    exportData = JSON.parse(exportRequest.file_path)
  } catch (parseError) {
    const err = parseError instanceof Error ? parseError : new Error(String(parseError));
    logger.error('Error parsing export data:', err)
    throw internalError('Failed to parse export data')
  }

  // Determine content type based on format
  const contentType = exportRequest.export_format === 'csv_zip'
    ? 'application/zip'
    : 'application/json'

  const filename = `data-export-${exportRequest.id}-${new Date().toISOString().split('T')[0]}.${exportRequest.export_format === 'csv_zip' ? 'zip' : 'json'
    }`

  // Return the data with appropriate headers
  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
});
