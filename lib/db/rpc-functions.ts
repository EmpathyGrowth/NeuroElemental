/**
 * Typed RPC Function Wrappers
 * Provides type-safe wrappers for Supabase RPC functions
 *
 * Note: Some RPC functions may not be in the generated Supabase types yet.
 * This module provides typed interfaces for better developer experience.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/types/supabase'

type SupabaseServerClient = SupabaseClient<Database>

// Generic RPC caller that bypasses strict typing for custom functions
type RpcCaller = {
   
  rpc: (fn: string, params?: any) => Promise<{ data: unknown; error: unknown }>
}

/**
 * Audit log export parameters
 */
interface AuditLogExportParams {
  p_organization_id: string
  p_date_from?: string
  p_date_to?: string
  p_event_types?: string[] | null
  p_user_ids?: string[] | null
  p_entity_types?: string[] | null
  p_limit?: number | null
  p_offset?: number
}

interface AuditLogEntry {
  id: string
  organization_id: string
  actor_id: string
  action: string
  resource_type: string
  resource_id: string
  details: Record<string, unknown>
  ip_address: string
  user_agent: string
  created_at: string
}

/**
 * Get audit log for export with filtering
 */
export async function getAuditLogForExport(
  supabase: SupabaseServerClient,
  params: AuditLogExportParams
): Promise<{ data: AuditLogEntry[] | null; error: Error | null }> {
  const { data, error } = await (supabase as unknown as RpcCaller).rpc('get_audit_log_for_export', params)
  return { data: data as AuditLogEntry[] | null, error: error as Error | null }
}

/**
 * Permission check parameters
 */
interface PermissionParams {
  p_user_id: string
  p_organization_id: string
  p_permission?: string
}

interface UserPermission {
  permission: string
  granted_at: string
  granted_by: string
}

/**
 * Get all permissions for a user in an organization
 */
export async function getUserPermissions(
  supabase: SupabaseServerClient,
  params: { p_user_id: string; p_organization_id: string }
): Promise<{ data: UserPermission[] | null; error: Error | null }> {
  const { data, error } = await (supabase as unknown as RpcCaller).rpc('get_user_permissions', params)
  return { data: data as UserPermission[] | null, error: error as Error | null }
}

/**
 * Check if user has a specific permission
 */
export async function userHasPermission(
  supabase: SupabaseServerClient,
  params: PermissionParams
): Promise<{ data: boolean | null; error: Error | null }> {
  const { data, error } = await (supabase as unknown as RpcCaller).rpc('user_has_permission', params)
  return { data: data as boolean | null, error: error as Error | null }
}

/**
 * SSO related parameters
 */
interface SSORequiredParams {
  p_email: string
  p_organization_id?: string
}

interface SSORequiredResult {
  required: boolean
  provider_id?: string
  provider_type?: string
}

/**
 * Check if SSO is required for a user/email
 */
export async function checkSSORequired(
  supabase: SupabaseServerClient,
  params: SSORequiredParams
): Promise<{ data: SSORequiredResult | null; error: Error | null }> {
  const { data, error } = await (supabase as unknown as RpcCaller).rpc('check_sso_required', params)
  return { data: data as SSORequiredResult | null, error: error as Error | null }
}

interface AutoProvisionSSOUserParams {
  p_organization_id: string
  p_provider_id: string
  p_email: string
  p_idp_user_id: string
  p_idp_attributes: Record<string, unknown>
}

interface ProvisionedUser {
  user_id: string
  email: string
  created: boolean
}

/**
 * Auto-provision a user via SSO
 */
export async function autoProvisionSSOUser(
  supabase: SupabaseServerClient,
  params: AutoProvisionSSOUserParams
): Promise<{ data: ProvisionedUser | null; error: Error | null }> {
  const { data, error } = await (supabase as unknown as RpcCaller).rpc('auto_provision_sso_user', params)
  return { data: data as ProvisionedUser | null, error: error as Error | null }
}

/**
 * Rate limiting parameters (matches actual DB function signature)
 */
interface RateLimitParams {
  p_organization_id: string
  p_api_key_id: string | null
  p_window_type: string
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  reset_at: string
}

/**
 * Check rate limit for a key
 */
export async function checkRateLimit(
  supabase: SupabaseServerClient,
  params: RateLimitParams
): Promise<{ data: RateLimitResult | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('check_rate_limit', params)
  return { data: data as RateLimitResult | null, error: error as Error | null }
}

/**
 * Increment rate limit counter (matches actual DB function signature)
 */
interface IncrementRateLimitParams {
  p_organization_id: string
  p_api_key_id: string | null
  p_window_type: string
  p_is_webhook: boolean
}

export async function incrementRateLimit(
  supabase: SupabaseServerClient,
  params: IncrementRateLimitParams
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('increment_rate_limit', params)
  return { error: error as Error | null }
}

/**
 * GDPR/Data access parameters (matches actual DB function signature)
 */
interface LogDataAccessParams {
  p_accessed_user_id: string
  p_accessed_by_user_id: string
  p_organization_id: string | null
  p_access_type: string
  p_resource_type: string
  p_resource_id: string | null
  p_reason: string | null
  p_ip_address: string | null
  p_user_agent: string | null
}

/**
 * Log data access for GDPR compliance
 */
export async function logDataAccess(
  supabase: SupabaseServerClient,
  params: LogDataAccessParams
): Promise<{ data: string | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('log_data_access', params)
  return { data: data as string | null, error: error as Error | null }
}

interface UserDataSummary {
  profile: boolean
  assessments: number
  enrollments: number
  certificates: number
  audit_logs: number
}

/**
 * Get summary of user data for GDPR
 */
export async function getUserDataSummary(
  supabase: SupabaseServerClient,
  params: { p_user_id: string }
): Promise<{ data: UserDataSummary | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('get_user_data_summary', params)
  return { data: data as UserDataSummary | null, error: error as Error | null }
}

/**
 * Analytics/metrics parameters (matches actual DB function signature)
 */
interface IncrementUsageMetricParams {
  p_organization_id: string
  p_metric_name: string
  p_increment?: number
}

/**
 * Increment a usage metric counter
 */
export async function incrementUsageMetric(
  supabase: SupabaseServerClient,
  params: IncrementUsageMetricParams
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('increment_usage_metric', params)
  return { error: error as Error | null }
}

/**
 * Increment event available spots
 */
export async function incrementEventSpots(
  supabase: SupabaseServerClient,
  eventId: string
): Promise<{ error: Error | null }> {
  const { error } = await supabase.rpc('increment_event_spots', { event_id: eventId } as { event_id: string })
  return { error: error as Error | null }
}

/**
 * Generate deletion confirmation token for GDPR
 */
export async function generateDeletionConfirmationToken(
  supabase: SupabaseServerClient
): Promise<{ data: string | null; error: Error | null }> {
  const { data, error } = await supabase.rpc('generate_deletion_confirmation_token')
  return { data: data as string | null, error: error as Error | null }
}
