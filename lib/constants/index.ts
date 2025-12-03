/**
 * Centralized constants
 * Eliminates hardcoded values scattered across the codebase
 */

// Re-export achievement definitions
export * from "./achievements";

/**
 * Pagination constants
 */
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
  DEFAULT_OFFSET: 0,
} as const;

/**
 * Date format constants
 */
export const DATE_LOCALE = 'en-US' as const;

/**
 * API response constants
 */
export const API = {
  MAX_TIMEOUT: 30000, // 30 seconds
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

/**
 * File upload constants
 */
export const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const,
  ALLOWED_DOCUMENT_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;

/**
 * Course constants
 */
export const COURSE = {
  MIN_PASSING_SCORE: 70,
  DEFAULT_QUIZ_TIME_LIMIT: 60, // minutes
  DEFAULT_ASSIGNMENT_POINTS: 100,
} as const;

/**
 * Credit constants
 */
export const CREDITS = {
  DEFAULT_GRANT_AMOUNT: 100,
  LOW_BALANCE_THRESHOLD: 10,
  MIN_PURCHASE_AMOUNT: 1,
} as const;

/**
 * Session constants
 */
export const SESSION = {
  CANCELLATION_HOURS: 24,
  REMINDER_HOURS: 24,
  DEFAULT_DURATION_MINUTES: 60,
} as const;

/**
 * Certificate constants
 */
export const CERTIFICATE = {
  DEFAULT_EXPIRY_DAYS: 365 * 3, // 3 years
  PREFIX: 'CERT',
} as const;

/**
 * Organization constants
 */
export const ORGANIZATION = {
  MAX_MEMBERS: 1000,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

/**
 * User role constants
 */
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student',
  BUSINESS: 'business',
  SCHOOL: 'school',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/**
 * Notification types
 */
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

/**
 * Payment status constants
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
  REFUNDED: 'refunded',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

/**
 * Subscription status constants
 */
export const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  CANCELED: 'canceled',
  PAST_DUE: 'past_due',
  UNPAID: 'unpaid',
  TRIALING: 'trialing',
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

/**
 * Course status constants
 */
export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
} as const;

export type CourseStatus = (typeof COURSE_STATUS)[keyof typeof COURSE_STATUS];

/**
 * Enrollment status constants
 */
export const ENROLLMENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  DROPPED: 'dropped',
  EXPIRED: 'expired',
} as const;

export type EnrollmentStatus = (typeof ENROLLMENT_STATUS)[keyof typeof ENROLLMENT_STATUS];

/**
 * Session status constants
 */
export const SESSION_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELED: 'canceled',
  NO_SHOW: 'no_show',
} as const;

export type SessionStatus = (typeof SESSION_STATUS)[keyof typeof SESSION_STATUS];

/**
 * Assignment status constants
 */
export const ASSIGNMENT_STATUS = {
  NOT_SUBMITTED: 'not_submitted',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
} as const;

export type AssignmentStatus = (typeof ASSIGNMENT_STATUS)[keyof typeof ASSIGNMENT_STATUS];

/**
 * Credit transaction types
 */
export const CREDIT_TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  GRANT: 'grant',
  DEDUCTION: 'deduction',
  REFUND: 'refund',
  ADJUSTMENT: 'adjustment',
} as const;

export type CreditTransactionType =
  (typeof CREDIT_TRANSACTION_TYPES)[keyof typeof CREDIT_TRANSACTION_TYPES];

/**
 * URL patterns
 */
export const URLS = {
  DASHBOARD: '/dashboard',
  LOGIN: '/login',
  SIGNUP: '/signup',
  COURSES: '/courses',
  PROFILE: '/dashboard/profile',
  SETTINGS: '/dashboard/settings',
} as const;

/**
 * Validation patterns
 */
export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s-()]+$/,
  URL: /^https?:\/\/.+/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
