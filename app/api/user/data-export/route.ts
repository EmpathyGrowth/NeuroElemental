/**
 * GDPR Data Export API Routes
 * Implements GDPR Article 20 (Right to Data Portability)
 */

import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET, HTTP_STATUS, badRequestError, createAuthenticatedRoute, internalError, successResponse, validateEnum } from '@/lib/api'
import { createDataExportRequest, getUserExportRequests } from '@/lib/gdpr'

/**
 * GET /api/user/data-export
 * List user's export requests
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  // Get query params
  const searchParams = request.nextUrl.searchParams
  const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
  const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))

  // Get user's export requests
  const { requests, total } = await getUserExportRequests(user.id, {
    limit,
    offset,
  })

  return successResponse({
    requests,
    total,
    limit,
    offset,
  })
});

/**
 * POST /api/user/data-export
 * Create new data export request
 */
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Parse request body
  const body = await request.json()
  const {
    export_type,
    export_format,
    organization_id,
    include_profile,
    include_activity,
    include_memberships,
    include_api_keys,
    include_webhooks,
    include_billing,
    include_content,
    requested_reason,
  } = body

  // Validate export_type
  if (!export_type) {
    throw badRequestError('export_type is required');
  }

  validateEnum(export_type, ['personal', 'organization'], 'export_type')

  // If organization export, verify organization_id is provided
  if (export_type === 'organization' && !organization_id) {
    throw badRequestError('organization_id is required for organization exports');
  }

  // Get client IP and user agent
  const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined
  const user_agent = request.headers.get('user-agent') || undefined

  // Create export request
  const result = await createDataExportRequest(user.id, {
    export_type,
    export_format: export_format || 'json',
    organization_id,
    include_profile,
    include_activity,
    include_memberships,
    include_api_keys,
    include_webhooks,
    include_billing,
    include_content,
    requested_reason,
    ip_address,
    user_agent,
  })

  if (!result.success) {
    throw internalError(result.error || 'Failed to create export request')
  }

  return successResponse(
    {
      success: true,
      request: result.request,
      message: 'Export request created successfully. Processing will begin shortly.',
    },
    HTTP_STATUS.CREATED
  )
});
