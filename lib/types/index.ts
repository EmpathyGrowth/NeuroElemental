/**
 * Types Barrel Export
 * Centralized type definitions for the application
 *
 * Import types from this file to ensure consistency across the codebase:
 * import { Profile, Enrollment, Course } from '@/lib/types'
 */

// Domain types (database models)
export type {
  Profile,
  Course,
  Enrollment,
  Session,
  Payment,
  Invoice,
  Subscription,
  Resource,
  Certification,
  Review,
  Notification,
  EmailPreferences,
  ScheduledEmail,
  LogEntry,
  OrganizationMember,
  AssessmentResult,
  CourseProgress,
} from './database'

// Type guards
export {
  isProfile,
  isCourse,
  isPayment,
} from './database'

// API types
export type { RouteContext } from './api'

// Supabase generated types
export type { Database, Json } from './supabase'

// Database table types (manually maintained for tables needing special handling)
export type {
  SSOProviderRow,
  SSOProviderInsert,
  SSOProviderUpdate,
  SSOSessionRow,
  SSOSessionInsert,
  SSOSessionUpdate,
  SSOAuthAttemptRow,
  SSOAuthAttemptInsert,
  SessionRow,
  SessionInsert,
  SessionUpdate,
  WebhookRow,
  WebhookInsert,
  WebhookUpdate,
  WebhookDeliveryRow,
  WebhookDeliveryInsert,
  WebhookDeliveryUpdate,
  UsageReportRow,
  UsageReportInsert,
  OrganizationUsageMetricRow,
  OrganizationUsageMetricInsert,
  UserActivityMetricRow,
  UserActivityMetricInsert,
  ProfileRow,
  ProfileInsert,
  ProfileUpdate,
} from './database-tables'

// Helper types
export * from './helpers'
