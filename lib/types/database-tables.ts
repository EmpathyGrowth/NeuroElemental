/**
 * Database Table Types
 *
 * These are manually maintained types for tables that require special handling.
 * For full auto-generated types, run: npx supabase gen types typescript
 */

import type { Json } from './supabase'

// Re-export Json type for convenience
export type { Json }

/**
 * SSO Providers table
 */
export interface SSOProviderRow {
  id: string
  organization_id: string
  provider_type: 'saml' | 'oidc'
  provider_name: string
  is_active: boolean
  domains: string[]
  metadata_url: string | null
  saml_entity_id: string | null
  saml_sso_url: string | null
  saml_certificate: string | null
  saml_sign_requests: boolean | null
  oidc_client_id: string | null
  oidc_client_secret: string | null
  oidc_issuer_url: string | null
  oauth_client_id: string | null
  oauth_client_secret: string | null
  oauth_authorize_url: string | null
  oauth_token_url: string | null
  oauth_userinfo_url: string | null
  oauth_scopes: string[] | null
  enforce_sso: boolean | null
  auto_provision_users: boolean | null
  default_role: string | null
  attribute_mapping: Json | null
  metadata: Json | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface SSOProviderInsert extends Partial<SSOProviderRow> {
  organization_id: string
  provider_type: 'saml' | 'oidc'
  provider_name: string
  domains: string[]
}

export interface SSOProviderUpdate extends Partial<SSOProviderRow> {}

/**
 * SSO Sessions table
 */
export interface SSOSessionRow {
  id: string
  provider_id: string
  user_id: string
  session_index: string | null
  name_id: string
  expires_at: string
  logged_out_at: string | null
  ip_address: string | null
  user_agent: string | null
  organization_id: string | null
  created_at: string
}

export interface SSOSessionInsert extends Partial<SSOSessionRow> {
  provider_id: string
  user_id: string
  name_id: string
  expires_at: string
}

export interface SSOSessionUpdate extends Partial<SSOSessionRow> {}

/**
 * SSO Auth Attempts table
 */
export interface SSOAuthAttemptRow {
  id: string
  provider_id: string
  organization_id: string | null
  email: string
  status: 'success' | 'failed' | 'error'
  error_code: string | null
  error_message: string | null
  user_id: string | null
  ip_address: string | null
  user_agent: string | null
  duration_ms: number | null
  saml_request_id: string | null
  saml_assertion: string | null
  oauth_state: string | null
  created_at: string
}

export interface SSOAuthAttemptInsert extends Partial<SSOAuthAttemptRow> {
  provider_id: string
  email: string
  status: 'success' | 'failed' | 'error'
}

/**
 * Sessions table (coaching/tutoring sessions)
 */
export interface SessionRow {
  id: string
  student_id: string
  instructor_id: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  type: string
  meeting_link: string | null
  notes: string | null
  created_at: string
}

export interface SessionInsert extends Partial<SessionRow> {
  student_id: string
  instructor_id: string
  scheduled_at: string
  type: string
}

export interface SessionUpdate extends Partial<SessionRow> {}

/**
 * Webhooks table
 */
export interface WebhookRow {
  id: string
  organization_id: string
  name: string
  url: string
  events: string[]
  secret: string
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  last_triggered_at: string | null
}

export interface WebhookInsert extends Partial<WebhookRow> {
  organization_id: string
  name: string
  url: string
  secret: string
}

export interface WebhookUpdate extends Partial<WebhookRow> {}

/**
 * Webhook Deliveries table
 */
export interface WebhookDeliveryRow {
  id: string
  webhook_id: string
  event_type: string
  payload: Json
  status: 'pending' | 'success' | 'failed'
  response_status: number | null
  response_body: string | null
  response_headers: Json | null
  attempts: number
  next_retry_at: string | null
  delivered_at: string | null
  created_at: string
  completed_at: string | null
}

export interface WebhookDeliveryInsert extends Partial<WebhookDeliveryRow> {
  webhook_id: string
  event_type: string
  payload: Json
}

export interface WebhookDeliveryUpdate extends Partial<WebhookDeliveryRow> {}

/**
 * Usage Reports table
 */
export interface UsageReportRow {
  id: string
  organization_id: string
  created_by: string
  report_type: string
  start_date: string
  end_date: string
  data: Json
  format: string
  created_at: string
}

export interface UsageReportInsert extends Partial<UsageReportRow> {
  organization_id: string
  created_by: string
  report_type: string
  start_date: string
  end_date: string
  data: Json
}

/**
 * Organization Usage Metrics table
 */
export interface OrganizationUsageMetricRow {
  id: string
  organization_id: string
  metric_name: string
  metric_value: number
  period_start: string
  period_end: string
  created_at: string
  updated_at: string
}

export interface OrganizationUsageMetricInsert extends Partial<OrganizationUsageMetricRow> {
  organization_id: string
  metric_name: string
  period_start: string
  period_end: string
}

/**
 * User Activity Metrics table
 */
export interface UserActivityMetricRow {
  id: string
  organization_id: string
  user_id: string
  metric_name: string
  metric_value: number
  period_start: string
  period_end: string
  created_at: string
}

export interface UserActivityMetricInsert extends Partial<UserActivityMetricRow> {
  organization_id: string
  user_id: string
  metric_name: string
  period_start: string
  period_end: string
}

/**
 * Profiles table
 */
export interface ProfileRow {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'registered' | 'student' | 'instructor' | 'business' | 'school' | 'admin'
  instructor_status: 'pending' | 'approved' | 'revoked' | null
  created_at: string | null
  updated_at: string | null
  instructor_certified_at: string | null
  stripe_customer_id: string | null
}

export interface ProfileInsert extends Partial<ProfileRow> {
  id: string
  email: string
}

export interface ProfileUpdate extends Partial<ProfileRow> {}
