/**
 * API Keys Management Routes
 * Create and list API keys for an organization
 */

import { createAuthenticatedRoute, badRequestError, internalError, requireOrganizationAccess, successResponse, validateRequest } from '@/lib/api'
import { logActivity, ActivityActions, EntityTypes } from '@/lib/db'
import { createApiKey, listApiKeys, API_SCOPES, type ApiScope } from '@/lib/api-keys'
import { apiKeyCreateSchema } from '@/lib/validation/schemas'

/** API key data from createApiKey */
interface ApiKeyData {
  id: string;
  key_prefix: string;
  name: string;
  scopes: string[];
  expires_at: string | null;
  is_active: boolean;
}

/** Success result from createApiKey */
interface CreateApiKeySuccess {
  success: true;
  apiKey: string;
  keyData: ApiKeyData;
}

/**
 * GET /api/organizations/[id]/api-keys
 * List all API keys for an organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (_request, context, user) => {
  const { id } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  const result = await listApiKeys(id)

  if (!result.success) {
    throw internalError('Failed to list API keys')
  }

  return successResponse({ keys: result.keys })
})

/**
 * POST /api/organizations/[id]/api-keys
 * Create a new API key for an organization
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params

  // Check if user is an admin
  await requireOrganizationAccess(user.id, id, true)

  // Validate request body
  const validation = await validateRequest(request, apiKeyCreateSchema)
  if (!validation.success) {
    throw validation.error
  }

  const { name, scopes, expiresInDays } = validation.data

  // Validate scopes against allowed values
  const validScopes = Object.values(API_SCOPES)
  const invalidScopes = scopes.filter((scope: string) => !validScopes.includes(scope as ApiScope))
  if (invalidScopes.length > 0) {
    throw badRequestError('Invalid scopes: ' + invalidScopes.join(', '))
  }

  // Create the API key
  const result = await createApiKey({
    organizationId: id,
    userId: user.id,
    name: name.trim(),
    scopes: scopes as ApiScope[],
    expiresInDays,
  })

  if (!result.success) {
    throw internalError('Failed to create API key')
  }

  // Type narrow to success result
  const successResult = result as CreateApiKeySuccess;
  const { apiKey, keyData } = successResult;

  // Log activity
  await logActivity({
    organization_id: id,
    user_id: user.id,
    action_type: ActivityActions.API_KEY_CREATED,
    entity_type: EntityTypes.API_KEY,
    entity_id: keyData.id,
    description: 'Created API key "' + name.trim() + '" with ' + scopes.length + ' scope(s)',
    metadata: {
      key_prefix: keyData.key_prefix,
      scopes: scopes,
      expires_in_days: expiresInDays || null,
    },
  })

  return successResponse({
    success: true,
    apiKey,
    keyData,
  })
})
