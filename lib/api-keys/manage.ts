/**
 * API Key Management
 * Functions for creating, validating, and managing API keys
 */

import { logger } from '@/lib/logging';
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentTimestamp } from '@/lib/utils'

// API key format: ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
// ne = NeuroElemental
// live/test = environment
// followed by 32 random characters

const KEY_PREFIX = 'ne'
const KEY_LENGTH = 32

/**
 * Available API scopes
 */
export const API_SCOPES = {
  // Credits
  CREDITS_READ: 'credits:read',
  CREDITS_WRITE: 'credits:write',

  // Members
  MEMBERS_READ: 'members:read',
  MEMBERS_WRITE: 'members:write',

  // Organizations
  ORG_READ: 'org:read',
  ORG_WRITE: 'org:write',

  // Analytics
  ANALYTICS_READ: 'analytics:read',

  // Courses
  COURSES_READ: 'courses:read',
  COURSES_ENROLL: 'courses:enroll',
} as const

export type ApiScope = typeof API_SCOPES[keyof typeof API_SCOPES]

/**
 * Generate a secure API key
 */
export function generateApiKey(environment: 'live' | 'test' = 'live'): string {
  const randomBytes = crypto.randomBytes(KEY_LENGTH)
  const randomString = randomBytes.toString('base64')
    .replace(/[+/=]/g, '') // Remove special characters
    .substring(0, KEY_LENGTH)

  return `${KEY_PREFIX}_${environment}_${randomString}`
}

/**
 * Hash an API key for storage
 */
export function hashApiKey(key: string): string {
  return crypto
    .createHash('sha256')
    .update(key)
    .digest('hex')
}

/**
 * Get key prefix (first 12 characters for display)
 */
export function getKeyPrefix(key: string): string {
  return key.substring(0, 12) + '...'
}

/**
 * Create a new API key
 */
export async function createApiKey(params: {
  organizationId: string
  userId: string
  name: string
  scopes: ApiScope[]
  expiresInDays?: number
}) {
  try {
    const supabase = createAdminClient()

    // Generate new key
    const apiKey = generateApiKey()
    const keyHash = hashApiKey(apiKey)
    const keyPrefix = getKeyPrefix(apiKey)

    // Calculate expiration
    let expiresAt = null
    if (params.expiresInDays) {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + params.expiresInDays)
    }

    // Store in database
    const { data, error } = await (supabase as any)
      .from('api_keys')
      .insert({
        organization_id: params.organizationId,
        user_id: params.userId,
        name: params.name,
        key_prefix: keyPrefix,
        key_hash: keyHash,
        scopes: params.scopes,
        expires_at: expiresAt?.toISOString() || null,
        is_active: true,
      })
      .select()
      .single()

    if (error) {
      logger.error('Error creating API key:', error as Error)
      return { success: false, error }
    }

    return {
      success: true,
      apiKey, // Return the plain key only once
      keyData: data,
    }
  } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
    logger.error('Error in createApiKey:', err as Error)
    return { success: false, error }
  }
}

/**
 * Validate an API key
 */
export async function validateApiKey(apiKey: string) {
  try {
    const supabase = createAdminClient()

    // Hash the provided key
    const keyHash = hashApiKey(apiKey)

    // Find matching key
    const { data: keyData, error } = await (supabase as any)
      .from('api_keys')
      .select(`
        *,
        organization:organizations(id, name, slug, credits),
        user:profiles(id, email, full_name)
      `)
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .single() as { data: { id: string; expires_at: string | null; [key: string]: unknown } | null; error: unknown }

    if (error || !keyData) {
      return { valid: false, error: 'Invalid API key' }
    }

    // Check expiration
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return { valid: false, error: 'API key has expired' }
    }

    // Update last used timestamp
    await (supabase as any)
      .from('api_keys')
      .update({ last_used_at: getCurrentTimestamp() })
      .eq('id', keyData.id)

    return {
      valid: true,
      key: keyData,
    }
  } catch (error) {
    logger.error('Error validating API key:', error as Error)
    return { valid: false, error: 'Validation error' }
  }
}

/**
 * Check if API key has required scope
 */
export function hasScope(keyScopes: string[], requiredScope: ApiScope): boolean {
  return keyScopes.includes(requiredScope)
}

/**
 * List API keys for an organization
 */
export async function listApiKeys(organizationId: string) {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('api_keys')
      .select(`
        id,
        name,
        key_prefix,
        scopes,
        last_used_at,
        expires_at,
        is_active,
        created_at,
        user:profiles(full_name, email)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('Error listing API keys:', error as Error)
      return { success: false, error, keys: [] }
    }

    return { success: true, keys: data || [] }
  } catch (error) {
    logger.error('Error in listApiKeys:', error as Error)
    return { success: false, error, keys: [] }
  }
}

/**
 * Revoke an API key
 */
export async function revokeApiKey(keyId: string, organizationId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await (supabase as any)
      .from('api_keys')
      .update({ is_active: false })
      .eq('id', keyId)
      .eq('organization_id', organizationId)

    if (error) {
      logger.error('Error revoking API key:', error as Error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in revokeApiKey:', error as Error)
    return { success: false, error }
  }
}

/**
 * Delete an API key permanently
 */
export async function deleteApiKey(keyId: string, organizationId: string) {
  try {
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('id', keyId)
      .eq('organization_id', organizationId)

    if (error) {
      logger.error('Error deleting API key:', error as Error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    logger.error('Error in deleteApiKey:', error as Error)
    return { success: false, error }
  }
}

/**
 * Get scope descriptions for UI
 */
export function getScopeDescription(scope: ApiScope): string {
  const descriptions: Record<ApiScope, string> = {
    [API_SCOPES.CREDITS_READ]: 'Read credit balance and transactions',
    [API_SCOPES.CREDITS_WRITE]: 'Add or subtract credits',
    [API_SCOPES.MEMBERS_READ]: 'View organization members',
    [API_SCOPES.MEMBERS_WRITE]: 'Invite and manage members',
    [API_SCOPES.ORG_READ]: 'Read organization details',
    [API_SCOPES.ORG_WRITE]: 'Update organization settings',
    [API_SCOPES.ANALYTICS_READ]: 'Access analytics and reports',
    [API_SCOPES.COURSES_READ]: 'View course information',
    [API_SCOPES.COURSES_ENROLL]: 'Enroll users in courses',
  }

  return descriptions[scope] || scope
}

/**
 * Group scopes by category for UI
 */
export function getScopesByCategory() {
  return {
    'Credits Management': [
      { scope: API_SCOPES.CREDITS_READ, description: getScopeDescription(API_SCOPES.CREDITS_READ) },
      { scope: API_SCOPES.CREDITS_WRITE, description: getScopeDescription(API_SCOPES.CREDITS_WRITE) },
    ],
    'Member Management': [
      { scope: API_SCOPES.MEMBERS_READ, description: getScopeDescription(API_SCOPES.MEMBERS_READ) },
      { scope: API_SCOPES.MEMBERS_WRITE, description: getScopeDescription(API_SCOPES.MEMBERS_WRITE) },
    ],
    'Organization': [
      { scope: API_SCOPES.ORG_READ, description: getScopeDescription(API_SCOPES.ORG_READ) },
      { scope: API_SCOPES.ORG_WRITE, description: getScopeDescription(API_SCOPES.ORG_WRITE) },
    ],
    'Analytics & Reporting': [
      { scope: API_SCOPES.ANALYTICS_READ, description: getScopeDescription(API_SCOPES.ANALYTICS_READ) },
    ],
    'Courses': [
      { scope: API_SCOPES.COURSES_READ, description: getScopeDescription(API_SCOPES.COURSES_READ) },
      { scope: API_SCOPES.COURSES_ENROLL, description: getScopeDescription(API_SCOPES.COURSES_ENROLL) },
    ],
  }
}

