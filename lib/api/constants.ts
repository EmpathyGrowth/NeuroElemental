/**
 * API Constants
 * Centralized constants to eliminate magic numbers across the codebase
 */

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Default pagination limit for API responses
 */
export const DEFAULT_PAGE_LIMIT = 50

/**
 * Maximum pagination limit (prevents excessive data fetching)
 */
export const MAX_PAGE_LIMIT = 500

/**
 * Default page offset
 */
export const DEFAULT_PAGE_OFFSET = 0

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Default rate limit window in seconds
 */
export const RATE_LIMIT_WINDOW_SECONDS = 60

/**
 * Default max requests per window for authenticated users
 */
export const RATE_LIMIT_MAX_REQUESTS = 100

/**
 * Rate limit for API keys (per minute)
 */
export const API_KEY_RATE_LIMIT = 1000

/**
 * Rate limit for anonymous/public endpoints
 */
export const ANONYMOUS_RATE_LIMIT = 20

// ============================================================================
// FILE UPLOADS
// ============================================================================

/**
 * Maximum file size for uploads (10MB in bytes)
 */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

/**
 * Maximum file size for document uploads (50MB)
 */
export const MAX_DOCUMENT_SIZE_BYTES = 50 * 1024 * 1024

/**
 * Maximum file size for exports (100MB)
 */
export const MAX_EXPORT_SIZE_BYTES = 100 * 1024 * 1024

/**
 * Allowed file types for document uploads
 */
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
]

/**
 * Allowed image types for uploads
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
]

// ============================================================================
// TIMEOUTS & EXPIRATION
// ============================================================================

/**
 * API request timeout in milliseconds (30 seconds)
 */
export const API_TIMEOUT_MS = 30000

/**
 * Long-running operation timeout (5 minutes)
 */
export const LONG_OPERATION_TIMEOUT_MS = 300000

/**
 * Session expiration in seconds (24 hours)
 */
export const SESSION_EXPIRATION_SECONDS = 86400

/**
 * SSO session expiration (8 hours)
 */
export const SSO_SESSION_EXPIRATION_SECONDS = 28800

/**
 * Email verification token expiration (24 hours)
 */
export const EMAIL_VERIFICATION_EXPIRATION_SECONDS = 86400

/**
 * Password reset token expiration (1 hour)
 */
export const PASSWORD_RESET_EXPIRATION_SECONDS = 3600

/**
 * Data export download URL expiration (30 days)
 */
export const EXPORT_URL_EXPIRATION_DAYS = 30

/**
 * Deletion confirmation token expiration (24 hours)
 */
export const DELETION_CONFIRMATION_EXPIRATION_HOURS = 24

// ============================================================================
// AUDIT & LOGGING
// ============================================================================

/**
 * Maximum audit log records per export
 */
export const MAX_AUDIT_RECORDS_PER_EXPORT = 100000

/**
 * Audit log retention period in days
 */
export const AUDIT_LOG_RETENTION_DAYS = 365

/**
 * Activity log page size
 */
export const ACTIVITY_LOG_PAGE_SIZE = 50

// ============================================================================
// ORGANIZATION LIMITS
// ============================================================================

/**
 * Maximum organization members (adjust per plan)
 */
export const MAX_ORG_MEMBERS = 1000

/**
 * Maximum custom roles per organization
 */
export const MAX_CUSTOM_ROLES = 50

/**
 * Maximum API keys per organization
 */
export const MAX_API_KEYS = 20

/**
 * Maximum webhooks per organization
 */
export const MAX_WEBHOOKS = 50

/**
 * Maximum SSO providers per organization
 */
export const MAX_SSO_PROVIDERS = 5

// ============================================================================
// API KEYS
// ============================================================================

/**
 * API key prefix for identification
 */
export const API_KEY_PREFIX = 'ne_'

/**
 * API key length (excluding prefix)
 */
export const API_KEY_LENGTH = 48

/**
 * API key expiration warning threshold (7 days)
 */
export const API_KEY_EXPIRATION_WARNING_DAYS = 7

// ============================================================================
// WEBHOOKS
// ============================================================================

/**
 * Webhook delivery timeout in milliseconds
 */
export const WEBHOOK_TIMEOUT_MS = 10000

/**
 * Maximum webhook retry attempts
 */
export const WEBHOOK_MAX_RETRIES = 3

/**
 * Webhook retry backoff base (exponential backoff)
 */
export const WEBHOOK_RETRY_BACKOFF_MS = 1000

/**
 * Maximum webhook payload size
 */
export const WEBHOOK_MAX_PAYLOAD_SIZE_BYTES = 1024 * 1024 // 1MB

// ============================================================================
// BILLING & CREDITS
// ============================================================================

/**
 * Default trial credits
 */
export const DEFAULT_TRIAL_CREDITS = 1000

/**
 * Minimum credit purchase
 */
export const MIN_CREDIT_PURCHASE = 100

/**
 * Maximum credit purchase per transaction
 */
export const MAX_CREDIT_PURCHASE = 100000

/**
 * Low credit warning threshold (general)
 */
export const LOW_CREDIT_WARNING_THRESHOLD = 100

/**
 * Credit thresholds for low credit warnings by type
 */
export const CREDIT_THRESHOLDS: Record<string, number> = {
  course: 10,
  api: 100,
  storage: 50,
  default: 10,
}

/**
 * Cron job settings
 */
export const CRON_JOB_BATCH_SIZE = 10

/**
 * Low credit warning cooldown in days
 */
export const LOW_CREDIT_WARNING_COOLDOWN_DAYS = 7

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Maximum length for organization name
 */
export const MAX_ORG_NAME_LENGTH = 100

/**
 * Maximum length for role name
 */
export const MAX_ROLE_NAME_LENGTH = 50

/**
 * Maximum length for webhook URL
 */
export const MAX_WEBHOOK_URL_LENGTH = 2048

/**
 * Minimum password length
 */
export const MIN_PASSWORD_LENGTH = 8

/**
 * Maximum password length
 */
export const MAX_PASSWORD_LENGTH = 128

/**
 * Maximum description length
 */
export const MAX_DESCRIPTION_LENGTH = 500

// ============================================================================
// CRON & BACKGROUND JOBS
// ============================================================================

/**
 * Batch size for processing export jobs
 */
export const EXPORT_BATCH_SIZE = 1000

/**
 * Batch size for processing webhook deliveries
 */
export const WEBHOOK_BATCH_SIZE = 100

/**
 * Maximum concurrent background jobs
 */
export const MAX_CONCURRENT_JOBS = 5

// ============================================================================
// SUBSCRIPTION PLANS
// ============================================================================

/**
 * Available subscription plan IDs
 */
export const PLAN_IDS = {
  basic: 'basic',
  pro: 'pro',
  premium: 'premium',
} as const

export type PlanId = keyof typeof PLAN_IDS

/**
 * Get Stripe price ID for a plan
 * Returns undefined if plan is invalid
 */
export function getStripePriceId(planId: string): string | undefined {
  const priceMappings: Record<string, string | undefined> = {
    basic: process.env.STRIPE_BASIC_PRICE_ID,
    pro: process.env.STRIPE_PRO_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  }
  return priceMappings[planId]
}

/**
 * Validate if a plan ID is valid
 */
export function isValidPlanId(planId: string): planId is PlanId {
  return planId in PLAN_IDS
}

// ============================================================================
// HTTP STATUS CODES (for reference)
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Quota errors
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',

  // Database errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',

  // External service errors
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  WEBHOOK_DELIVERY_FAILED: 'WEBHOOK_DELIVERY_FAILED',
  SSO_ERROR: 'SSO_ERROR',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const
