/**
 * Zod validation schemas for API endpoints
 * Provides type-safe request validation and automatic type inference
 *
 * @module validation/schemas
 * @description Centralized validation schemas for all API endpoints
 *
 * @example
 * ```typescript
 * import { emailSchema, courseCreateSchema } from '@/lib/validation/schemas'
 *
 * // Validate a single field
 * const email = emailSchema.parse('user@example.com')
 *
 * // Validate a complete object
 * const course = courseCreateSchema.parse({
 *   title: 'Introduction to Neuroscience',
 *   slug: 'intro-neuroscience',
 *   price_usd: 99.99
 * })
 * ```
 */

import { z } from 'zod'

// ============================================
// REUSABLE FIELD SCHEMAS
// ============================================

/**
 * Email address validation schema
 * @example 'user@example.com'
 */
export const emailSchema = z.string().email('Invalid email address')

/**
 * UUID validation schema
 * @example '550e8400-e29b-41d4-a716-446655440000'
 */
export const uuidSchema = z.string().uuid('Invalid UUID format')

/**
 * URL-friendly slug validation schema
 * Only allows lowercase letters, numbers, and hyphens
 * @example 'my-course-slug'
 */
export const slugSchema = z
  .string()
  .min(1, 'Slug cannot be empty')
  .max(100, 'Slug must be 100 characters or less')
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')

/**
 * URL validation schema
 * @example 'https://example.com/path'
 */
export const urlSchema = z.string().url('Invalid URL format')

/**
 * ISO 8601 datetime string validation schema
 * @example '2024-11-25T10:30:00Z'
 */
export const datetimeSchema = z.string().datetime('Invalid datetime format')

/**
 * Positive integer validation schema
 * @example 42
 */
export const positiveIntSchema = z.number().int('Must be an integer').positive('Must be positive')

/**
 * Non-negative number validation schema (includes zero)
 * @example 0, 99.99
 */
export const nonNegativeNumberSchema = z.number().min(0, 'Must be zero or greater')

/**
 * Pagination limit validation schema
 * Restricts to reasonable page sizes (1-100)
 * @example 20
 */
export const paginationLimitSchema = z
  .number()
  .int('Limit must be an integer')
  .min(1, 'Limit must be at least 1')
  .max(100, 'Limit cannot exceed 100')
  .default(20)

/**
 * Pagination offset validation schema
 * @example 0, 20, 40
 */
export const paginationOffsetSchema = z
  .number()
  .int('Offset must be an integer')
  .min(0, 'Offset must be zero or greater')
  .default(0)

/**
 * Phone number validation schema (E.164 format)
 * @example '+12025551234'
 */
export const phoneSchema = z
  .string()
  .regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format (use E.164 format: +12025551234)')
  .optional()

/**
 * Timezone validation schema
 * @example 'America/New_York', 'UTC'
 */
export const timezoneSchema = z.string().min(1, 'Timezone is required')

/**
 * Coupon code validation schema
 * Only allows uppercase letters, numbers, and hyphens
 * @example 'SAVE20', 'SUMMER-2024'
 */
export const couponCodeSchema = z
  .string()
  .min(3, 'Coupon code must be at least 3 characters')
  .max(50, 'Coupon code must be 50 characters or less')
  .regex(/^[A-Z0-9-]+$/, 'Coupon code must contain only uppercase letters, numbers, and hyphens')

/**
 * Rating validation schema (1-5 stars)
 * @example 4
 */
export const ratingSchema = z
  .number()
  .int('Rating must be an integer')
  .min(1, 'Rating must be at least 1')
  .max(5, 'Rating must be at most 5')

/**
 * Percentage validation schema (0-100)
 * @example 75.5
 */
export const percentageSchema = z
  .number()
  .min(0, 'Percentage must be at least 0')
  .max(100, 'Percentage must be at most 100')

// ============================================
// AUTH SCHEMAS
// ============================================

/**
 * Password requirements configuration
 * Centralized password policy for consistency across signup and reset flows
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requiresUppercase: true,
  requiresLowercase: true,
  requiresNumber: true,
} as const

/**
 * Strong password validation schema
 * Used for both signup and password reset to ensure consistency
 * Requirements: 8+ chars, uppercase, lowercase, number
 *
 * @example 'SecurePass123'
 */
export const passwordSchema = z
  .string()
  .min(PASSWORD_REQUIREMENTS.minLength, `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`)
  .refine(
    (pwd) => !PASSWORD_REQUIREMENTS.requiresUppercase || /[A-Z]/.test(pwd),
    'Password must contain at least one uppercase letter (A-Z)'
  )
  .refine(
    (pwd) => !PASSWORD_REQUIREMENTS.requiresLowercase || /[a-z]/.test(pwd),
    'Password must contain at least one lowercase letter (a-z)'
  )
  .refine(
    (pwd) => !PASSWORD_REQUIREMENTS.requiresNumber || /[0-9]/.test(pwd),
    'Password must contain at least one number (0-9)'
  )

/**
 * Login schema
 * Used for user authentication
 *
 * @example
 * ```typescript
 * {
 *   email: 'user@example.com',
 *   password: 'securePassword123'
 * }
 * ```
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * Signup schema
 * Used for new user registration
 * Uses strong password validation for security
 *
 * @example
 * ```typescript
 * {
 *   fullName: 'John Doe',
 *   email: 'user@example.com',
 *   password: 'SecurePass123',
 *   confirmPassword: 'SecurePass123'
 * }
 * ```
 */
export const signupSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be 100 characters or less'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Password reset schema
 * Uses strong password validation for security
 *
 * @example
 * ```typescript
 * {
 *   password: 'SecurePass123',
 *   confirmPassword: 'SecurePass123'
 * }
 * ```
 */
export const passwordResetSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// ============================================
// PROFILE & USER SCHEMAS
// ============================================

/**
 * Profile update schema
 * Used for updating user profile information
 *
 * @example
 * ```typescript
 * {
 *   full_name: 'John Doe',
 *   avatar_url: 'https://example.com/avatar.jpg',
 *   bio: 'Neuroscience enthusiast'
 * }
 * ```
 */

export const profileUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: urlSchema.optional(),
  bio: z.string().max(500).optional(),
})

/**
 * Role update schema
 * Used for updating user roles (admin only)
 *
 * @example
 * ```typescript
 * {
 *   userId: '550e8400-e29b-41d4-a716-446655440000',
 *   role: 'instructor'
 * }
 * ```
 */
export const roleUpdateSchema = z.object({
  userId: uuidSchema,
  role: z.enum(['registered', 'student', 'instructor', 'business', 'school', 'admin']),
})

// ============================================
// COURSE SCHEMAS
// ============================================

/**
 * Course creation schema
 * Used for creating new courses
 *
 * @example
 * ```typescript
 * {
 *   slug: 'intro-neuroscience',
 *   title: 'Introduction to Neuroscience',
 *   subtitle: 'Learn the basics of brain science',
 *   price_usd: 99.99,
 *   difficulty_level: 'beginner',
 *   is_published: false
 * }
 * ```
 */
export const courseCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  subtitle: z.string().max(300, 'Subtitle must be 300 characters or less').optional(),
  description: z.string().optional(),
  long_description: z.string().optional(),
  instructor_name: z.string().max(100, 'Instructor name must be 100 characters or less').optional(),
  duration_hours: positiveIntSchema.optional(),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  price_usd: nonNegativeNumberSchema,
  is_published: z.boolean().default(false),
  thumbnail_url: urlSchema.optional(),
  preview_video_url: urlSchema.optional(),
  category: z.string().max(50, 'Category must be 50 characters or less').optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * Course update schema
 * All fields are optional for partial updates
 */
export const courseUpdateSchema = courseCreateSchema.partial()

/**
 * Course enrollment schema
 * Used when a user enrolls in a course
 *
 * @example
 * ```typescript
 * {
 *   courseId: '550e8400-e29b-41d4-a716-446655440000',
 *   paymentIntentId: 'pi_1234567890'
 * }
 * ```
 */
export const courseEnrollmentSchema = z.object({
  courseId: uuidSchema,
  paymentIntentId: z.string().optional(),
})

/**
 * Course enrollment request schema
 * Used when enrolling in a course via API
 *
 * @example
 * ```typescript
 * {
 *   payment_method: 'free'
 * }
 * ```
 */
export const courseEnrollmentRequestSchema = z.object({
  payment_method: z.enum(['free', 'stripe']).default('free'),
})

/**
 * Course review schema
 * Used for submitting course reviews
 *
 * @example
 * ```typescript
 * {
 *   rating: 5,
 *   comment: 'Excellent course! Learned a lot about neuroscience.'
 * }
 * ```
 */
export const courseReviewSchema = z.object({
  rating: ratingSchema,
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment must be 1000 characters or less').optional(),
})

// ============================================
// MODULE SCHEMAS
// ============================================

/**
 * Module creation schema
 * Used for creating new modules within a course
 *
 * @example
 * ```typescript
 * {
 *   title: 'Getting Started',
 *   description: 'Introduction module',
 *   order_index: 0
 * }
 * ```
 */
export const moduleCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  order_index: z.number().int('Order index must be an integer').min(0, 'Order index must be zero or greater'),
})

/**
 * Module update schema
 * All fields are optional for partial updates
 */
export const moduleUpdateSchema = moduleCreateSchema.partial()

// ============================================
// LESSON SCHEMAS
// ============================================

/**
 * Lesson creation schema
 * Used for creating new lessons within a course
 *
 * @example
 * ```typescript
 * {
 *   title: 'Introduction to Neurons',
 *   content_type: 'video',
 *   video_url: 'https://example.com/video.mp4',
 *   duration_minutes: 15,
 *   order_index: 0,
 *   is_preview: true
 * }
 * ```
 */
export const lessonCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  content_type: z.enum(['video', 'text', 'quiz', 'download', 'external_link']),
  content_url: urlSchema.optional(),
  content_text: z.string().optional(),
  video_url: urlSchema.optional(),
  duration_minutes: positiveIntSchema.optional(),
  order_index: z.number().int('Order index must be an integer').min(0, 'Order index must be zero or greater'),
  is_preview: z.boolean().default(false),
  is_free: z.boolean().default(false),
})

/**
 * Lesson update schema
 * All fields are optional for partial updates
 */
export const lessonUpdateSchema = lessonCreateSchema.partial()

/**
 * Lesson completion schema
 * Used when a user completes a lesson
 *
 * @example
 * ```typescript
 * {
 *   lessonId: '550e8400-e29b-41d4-a716-446655440000',
 *   timeSpent: 900 // 15 minutes in seconds
 * }
 * ```
 */
export const lessonCompleteSchema = z.object({
  lessonId: uuidSchema,
  timeSpent: positiveIntSchema.optional(),
})

// ============================================
// EVENT SCHEMAS
// ============================================

/**
 * Event creation schema
 * Used for creating new events (workshops, webinars, conferences)
 *
 * @example
 * ```typescript
 * {
 *   slug: 'neuroscience-workshop-2024',
 *   title: 'Neuroscience Workshop 2024',
 *   event_type: 'online_workshop',
 *   start_datetime: '2024-12-01T10:00:00Z',
 *   end_datetime: '2024-12-01T12:00:00Z',
 *   timezone: 'America/New_York',
 *   price_usd: 49.99,
 *   capacity: 50
 * }
 * ```
 */
export const eventCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().optional(),
  event_type: z.enum(['online_workshop', 'in_person_workshop', 'webinar', 'conference']),
  start_datetime: datetimeSchema,
  end_datetime: datetimeSchema,
  timezone: timezoneSchema,
  location_name: z.string().optional(),
  location_address: z.record(z.any()).optional(),
  online_meeting_url: urlSchema.optional(),
  price_usd: nonNegativeNumberSchema,
  capacity: positiveIntSchema.optional(),
  is_published: z.boolean().default(false),
  thumbnail_url: urlSchema.optional(),
})

/**
 * Event update schema
 * All fields are optional for partial updates
 */
export const eventUpdateSchema = eventCreateSchema.partial()

/**
 * Event registration schema
 * Used when a user registers for an event
 *
 * @example
 * ```typescript
 * {
 *   eventId: '550e8400-e29b-41d4-a716-446655440000'
 * }
 * ```
 */
export const eventRegistrationSchema = z.object({
  eventId: uuidSchema,
})

/**
 * Event registration request schema
 * Used when registering for an event
 *
 * @example
 * ```typescript
 * {
 *   attendee_info: { name: 'John Doe', dietary: 'vegetarian' },
 *   payment_method: 'stripe'
 * }
 * ```
 */
export const eventRegistrationRequestSchema = z.object({
  attendee_info: z.record(z.unknown()).optional(),
  payment_method: z.enum(['stripe', 'free']).optional(),
})

// ============================================
// ASSESSMENT SCHEMAS
// ============================================

/**
 * Assessment submission schema
 * Used for submitting assessment answers
 *
 * @example
 * ```typescript
 * {
 *   answers: { 'q1': 'answer1', 'q2': 'answer2' },
 *   scores: { 'q1': 10, 'q2': 8 },
 *   is_organizational: false
 * }
 * ```
 */
export const assessmentSubmitSchema = z.object({
  answers: z.record(z.any()),
  scores: z.record(z.number()).optional(),
  is_organizational: z.boolean().default(false),
  organization_id: uuidSchema.optional(),
})

/**
 * Assessment answers schema (for personality assessment)
 * Used for submitting personality assessment answers with ratings
 *
 * @example
 * ```typescript
 * {
 *   answers: { '1': 4, '2': 5, '3': 3 }
 * }
 * ```
 */
export const assessmentAnswersSchema = z.object({
  answers: z.record(z.number().int('Rating must be an integer').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5')),
})

// ============================================
// PAYMENT SCHEMAS
// ============================================

/**
 * Checkout session creation schema
 * Used for creating Stripe checkout sessions
 *
 * @example
 * ```typescript
 * {
 *   productId: '550e8400-e29b-41d4-a716-446655440000',
 *   productType: 'course',
 *   successUrl: 'https://example.com/success',
 *   cancelUrl: 'https://example.com/cancel'
 * }
 * ```
 */
export const checkoutSessionSchema = z.object({
  productId: uuidSchema,
  productType: z.enum(['course', 'event', 'subscription', 'product']),
  successUrl: urlSchema.optional(),
  cancelUrl: urlSchema.optional(),
})

/**
 * Webhook event schema
 * Used for processing webhook events from external services
 *
 * @example
 * ```typescript
 * {
 *   type: 'payment.succeeded',
 *   data: { amount: 9999, currency: 'usd' }
 * }
 * ```
 */
export const webhookEventSchema = z.object({
  type: z.string(),
  data: z.record(z.any()),
})

// ============================================
// ASSIGNMENT & QUIZ SCHEMAS
// ============================================

/**
 * Assignment submission schema
 * Used for submitting assignments
 *
 * @example
 * ```typescript
 * {
 *   assignmentId: '550e8400-e29b-41d4-a716-446655440000',
 *   submission_text: 'My assignment submission...',
 *   files: ['https://example.com/file1.pdf']
 * }
 * ```
 */
export const assignmentSubmitSchema = z.object({
  assignmentId: uuidSchema,
  submission_text: z.string().optional(),
  submission_url: urlSchema.optional(),
  files: z.array(urlSchema).optional(),
})

/**
 * Assignment grading schema
 * Used by instructors to grade assignments
 *
 * @example
 * ```typescript
 * {
 *   score: 85,
 *   feedback: 'Great work! Consider expanding on...',
 *   graded_at: '2024-11-25T10:30:00Z'
 * }
 * ```
 */
export const assignmentGradeSchema = z.object({
  score: percentageSchema,
  feedback: z.string().optional(),
  graded_at: datetimeSchema.optional(),
})

/**
 * Quiz submission schema
 * Used for submitting quiz answers
 *
 * @example
 * ```typescript
 * {
 *   quizId: '550e8400-e29b-41d4-a716-446655440000',
 *   answers: { 'q1': 'A', 'q2': 'B', 'q3': 'C' }
 * }
 * ```
 */
export const quizSubmitSchema = z.object({
  quizId: uuidSchema,
  answers: z.record(z.any()),
})

/**
 * Quiz creation schema
 * Used for creating new quizzes
 *
 * @example
 * ```typescript
 * {
 *   title: 'Neuroscience Basics Quiz',
 *   passing_score: 70,
 *   questions: [
 *     {
 *       question: 'What is a neuron?',
 *       type: 'multiple_choice',
 *       options: ['A cell', 'A protein', 'A hormone'],
 *       correct_answer: 'A cell',
 *       points: 10
 *     }
 *   ]
 * }
 * ```
 */
/** Quiz question schema */
export const quizQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string().min(1, 'Question is required'),
  type: z.enum(['multiple_choice', 'true_false', 'short_answer']),
  options: z.array(z.string()).optional(),
  correct_answer: z.union([z.string(), z.boolean()]),
  points: positiveIntSchema.default(1),
  explanation: z.string().optional(),
})

export const quizCreateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  passing_score: percentageSchema.default(70),
  questions: z.array(quizQuestionSchema),
})

// ============================================
// BLOG SCHEMAS
// ============================================

/**
 * Blog post creation schema
 * Used for creating new blog posts
 *
 * @example
 * ```typescript
 * {
 *   slug: 'understanding-neuroplasticity',
 *   title: 'Understanding Neuroplasticity',
 *   excerpt: 'Learn how the brain adapts and changes...',
 *   content: '<p>Full blog post content...</p>',
 *   category: 'neuroscience',
 *   tags: ['brain', 'learning', 'neuroplasticity'],
 *   is_published: true
 * }
 * ```
 */
export const blogPostCreateSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  excerpt: z.string().max(500, 'Excerpt must be 500 characters or less').optional(),
  content: z.string().min(1, 'Content is required'),
  category: z.string().max(50, 'Category must be 50 characters or less').optional(),
  tags: z.array(z.string()).optional(),
  featured_image_url: urlSchema.optional(),
  is_published: z.boolean().default(false),
})

/**
 * Blog post update schema
 * All fields are optional for partial updates
 */
export const blogPostUpdateSchema = blogPostCreateSchema.partial()

// ============================================
// ORGANIZATION SCHEMAS
// ============================================

/**
 * Organization creation schema
 * Used for creating new organizations
 *
 * @example
 * ```typescript
 * {
 *   name: 'Acme Corporation',
 *   type: 'business',
 *   industry: 'Technology',
 *   size_range: '50-200',
 *   address: { city: 'New York', country: 'USA' }
 * }
 * ```
 */
export const organizationCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  type: z.enum(['business', 'school', 'nonprofit']),
  industry: z.string().max(100, 'Industry must be 100 characters or less').optional(),
  size_range: z.string().optional(),
  address: z.record(z.any()).optional(),
})

/**
 * Organization update schema
 * All fields are optional for partial updates
 *
 * @example
 * ```typescript
 * {
 *   name: 'Updated Organization Name',
 *   image: 'https://example.com/logo.png',
 *   onboarding_done: true
 * }
 * ```
 */
export const organizationUpdateSchema = organizationCreateSchema
  .partial()
  .extend({
    image: urlSchema.optional(),
    onboarding_data: z.record(z.any()).optional(),
    onboarding_done: z.boolean().optional(),
  })

/**
 * Organization member invitation schema
 * Used for inviting new members to an organization
 *
 * @example
 * ```typescript
 * {
 *   email: 'newmember@example.com',
 *   role: 'member'
 * }
 * ```
 */
export const organizationMemberInviteSchema = z.object({
  email: emailSchema,
  role: z.enum(['owner', 'admin', 'member']).default('member'),
})

/**
 * Organization member update schema
 * Used for updating member roles
 *
 * @example
 * ```typescript
 * {
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   role: 'admin'
 * }
 * ```
 */
export const organizationMemberUpdateSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(['owner', 'admin', 'member']),
})

/**
 * Organization bulk invitation schema
 * Used for inviting multiple members at once
 *
 * @example
 * ```typescript
 * {
 *   emails: ['user1@example.com', 'user2@example.com'],
 *   role: 'member'
 * }
 * ```
 */
export const organizationBulkInviteSchema = z.object({
  emails: z.array(emailSchema).min(1, 'At least one email is required').max(100, 'Cannot invite more than 100 members at once'),
  role: z.enum(['admin', 'member']),
})

/**
 * Organization custom role creation schema
 * Used for creating custom roles in an organization
 *
 * @example
 * ```typescript
 * {
 *   name: 'Course Manager',
 *   description: 'Can manage courses and enrollments',
 *   permissions: ['courses.view', 'courses.edit', 'enrollments.manage'],
 *   color: '#3B82F6',
 *   is_default: false
 * }
 * ```
 */
export const organizationRoleCreateSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(50, 'Role name must be 50 characters or less'),
  description: z.string().max(200, 'Description must be 200 characters or less').optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format').optional(),
  permissions: z.array(z.string()).min(1, 'At least one permission is required'),
  is_default: z.boolean().default(false),
})

// ============================================
// WAITLIST SCHEMAS
// ============================================

/**
 * Waitlist entry creation schema
 * Used for adding users to waitlists
 *
 * @example
 * ```typescript
 * {
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   course_id: '550e8400-e29b-41d4-a716-446655440000',
 *   metadata: { source: 'landing_page' }
 * }
 * ```
 */
export const waitlistCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less').optional(),
  email: emailSchema,
  referral_code: z.string().max(50).optional(),
  referred_by: uuidSchema.optional(),
})

// ============================================
// COUPON SCHEMAS
// ============================================

/**
 * Coupon creation schema
 * Used for creating discount coupons
 *
 * @example
 * ```typescript
 * {
 *   code: 'SAVE20',
 *   discount_type: 'percentage',
 *   discount_value: 20,
 *   max_uses: 100,
 *   applicable_to: 'course',
 *   expires_at: '2024-12-31T23:59:59Z'
 * }
 * ```
 */
export const couponCreateSchema = z.object({
  code: couponCodeSchema,
  discount_type: z.enum(['percentage', 'fixed_amount', 'credits']),
  discount_value: nonNegativeNumberSchema,
  max_uses: positiveIntSchema.optional(),
  applicable_to: z.enum(['all', 'course', 'event']).optional(),
  course_id: uuidSchema.optional(),
  expires_at: datetimeSchema.optional(),
})

/**
 * Coupon validation schema
 * Used for validating coupon codes before applying them
 *
 * @example
 * ```typescript
 * {
 *   code: 'SAVE20',
 *   course_id: '550e8400-e29b-41d4-a716-446655440000'
 * }
 * ```
 */
export const couponValidateSchema = z.object({
  code: z.string(),
  course_id: uuidSchema.optional(),
  organization_id: uuidSchema.optional(),
})

// ============================================
// CREDITS SCHEMAS
// ============================================

/**
 * Credit transaction schema
 * Used for recording credit transactions
 *
 * @example
 * ```typescript
 * {
 *   organization_id: '550e8400-e29b-41d4-a716-446655440000',
 *   credit_type: 'course_enrollment',
 *   amount: -10,
 *   metadata: { course_id: 'abc123' }
 * }
 * ```
 */
export const creditTransactionSchema = z.object({
  organization_id: uuidSchema,
  credit_type: z.enum([
    'course_enrollment',
    'assessment_attempt',
    'event_registration',
    'certificate_generation',
    'ai_tutoring',
  ]),
  amount: z.number().int('Amount must be an integer'),
  metadata: z.record(z.any()).optional(),
})

// ============================================
// NOTIFICATION SCHEMAS
// ============================================

/**
 * Notification creation schema
 * Used for creating user notifications
 *
 * @example
 * ```typescript
 * {
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   type: 'course_enrollment',
 *   title: 'Welcome to the course!',
 *   message: 'You have successfully enrolled in Introduction to Neuroscience',
 *   action_url: 'https://example.com/courses/intro-neuroscience'
 * }
 * ```
 */
export const notificationCreateSchema = z.object({
  user_id: uuidSchema,
  type: z.string().min(1, 'Type is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be 1000 characters or less'),
  action_url: urlSchema.optional(),
})

/**
 * Notification update schema
 * Used for marking notifications as read
 *
 * @example
 * ```typescript
 * {
 *   is_read: true
 * }
 * ```
 */
export const notificationUpdateSchema = z.object({
  is_read: z.boolean(),
})

// ============================================
// PRODUCT SCHEMAS
// ============================================

/**
 * Product creation schema
 * Used for creating new products in the catalog
 *
 * @example
 * ```typescript
 * {
 *   slug: 'neuroscience-workbook',
 *   name: 'Neuroscience Workbook',
 *   description: 'Comprehensive workbook for neuroscience students',
 *   type: 'workbook',
 *   price_usd: 29.99,
 *   stripe_price_id: 'price_1234567890',
 *   is_active: true
 * }
 * ```
 */
export const productCreateSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
  description: z.string().optional(),
  type: z.enum(['digital_course', 'workbook', 'coaching_session', 'event_ticket', 'subscription']),
  price_usd: nonNegativeNumberSchema,
  stripe_price_id: z.string().optional(),
  is_active: z.boolean().default(true),
  metadata: z.record(z.any()).optional(),
})

/**
 * Product update schema
 * All fields are optional for partial updates
 */
export const productUpdateSchema = productCreateSchema.partial()

// ============================================
// STRIPE CHECKOUT SCHEMAS
// ============================================

/**
 * Stripe checkout session request schema
 * Used for creating Stripe checkout sessions
 *
 * @example
 * ```typescript
 * {
 *   priceId: 'price_1234567890',
 *   successUrl: 'https://example.com/success',
 *   cancelUrl: 'https://example.com/cancel'
 * }
 * ```
 */
export const stripeCheckoutSchema = z.object({
  priceId: z.string().min(1, 'Price ID is required'),
  successUrl: urlSchema.optional(),
  cancelUrl: urlSchema.optional(),
  metadata: z.record(z.string()).optional(),
})

/**
 * Subscription update schema
 * Used for updating subscription settings
 *
 * @example
 * ```typescript
 * {
 *   action: 'cancel',
 *   plan_id: 'pro'
 * }
 * ```
 */
export const subscriptionUpdateSchema = z.object({
  action: z.enum(['cancel', 'reactivate', 'update_plan']),
  plan_id: z.string().optional(),
})

// ============================================
// RESOURCE SCHEMAS
// ============================================

/**
 * Resource upload schema
 * Used for uploading course resources and files
 *
 * @example
 * ```typescript
 * {
 *   file_name: 'lecture-notes.pdf',
 *   file_url: 'https://example.com/files/lecture-notes.pdf',
 *   file_size: 1048576,
 *   mime_type: 'application/pdf',
 *   resource_type: 'document',
 *   access_level: 'private'
 * }
 * ```
 */
export const resourceUploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required'),
  file_url: urlSchema,
  file_size: positiveIntSchema.optional(),
  mime_type: z.string().optional(),
  resource_type: z.string().optional(),
  access_level: z.enum(['public', 'private', 'instructor_only']).default('private'),
  metadata: z.record(z.any()).optional(),
})

// ============================================
// PAGINATION & QUERY SCHEMAS
// ============================================

/**
 * Pagination query parameters schema
 * Used for paginated API endpoints
 *
 * @example
 * ```typescript
 * {
 *   limit: 20,
 *   offset: 0,
 *   page: 1
 * }
 * ```
 */
export const paginationQuerySchema = z.object({
  limit: paginationLimitSchema,
  offset: paginationOffsetSchema,
  page: z.number().int('Page must be an integer').min(1, 'Page must be at least 1').optional(),
})

/**
 * Search query parameters schema
 * Used for search endpoints
 *
 * @example
 * ```typescript
 * {
 *   q: 'neuroscience',
 *   limit: 20,
 *   offset: 0
 * }
 * ```
 */
export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Search query is required').max(200, 'Search query must be 200 characters or less'),
  limit: paginationLimitSchema,
  offset: paginationOffsetSchema,
})

/**
 * ID parameter schema
 * Used for route parameters that expect a UUID
 *
 * @example
 * ```typescript
 * {
 *   id: '550e8400-e29b-41d4-a716-446655440000'
 * }
 * ```
 */
export const idParamSchema = z.object({
  id: uuidSchema,
})

/**
 * Slug parameter schema
 * Used for route parameters that expect a slug
 *
 * @example
 * ```typescript
 * {
 *   slug: 'intro-neuroscience'
 * }
 * ```
 */
export const slugParamSchema = z.object({
  slug: slugSchema,
})

// ============================================
// DATA EXPORT & GDPR SCHEMAS
// ============================================

/**
 * Data export request schema
 * Used for GDPR data export requests
 *
 * @example
 * ```typescript
 * {
 *   format: 'json',
 *   include_deleted: false
 * }
 * ```
 */
export const dataExportRequestSchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  include_deleted: z.boolean().default(false),
})

/**
 * Data deletion request schema (simple confirmation)
 * Used for GDPR data deletion requests
 *
 * @example
 * ```typescript
 * {
 *   reason: 'No longer need the service',
 *   confirm: true
 * }
 * ```
 */
export const dataDeletionRequestSchema = z.object({
  reason: z.string().max(500, 'Reason must be 500 characters or less').optional(),
  confirm: z.boolean().refine(val => val === true, 'Must confirm deletion'),
})

/**
 * Data deletion request (API) schema
 * Used for GDPR data deletion requests via API endpoint
 *
 * @example
 * ```typescript
 * {
 *   deletion_type: 'account',
 *   requested_reason: 'No longer need the service'
 * }
 * ```
 */
export const dataDeletionApiRequestSchema = z.object({
  deletion_type: z.enum(['account', 'organization_data']),
  organization_id: z.string().uuid().optional(),
  requested_reason: z.string().optional(),
}).refine(
  (data) => data.deletion_type !== 'organization_data' || data.organization_id,
  { message: 'organization_id is required for organization data deletion', path: ['organization_id'] }
)

/**
 * Blog post publish schema
 * Used for publishing/unpublishing blog posts
 *
 * @example
 * ```typescript
 * {
 *   is_published: true
 * }
 * ```
 */
export const blogPostPublishSchema = z.object({
  is_published: z.boolean(),
})

// ============================================
// CERTIFICATION SCHEMAS
// ============================================

/**
 * Certification application schema
 * Used for submitting certification applications
 *
 * @example
 * ```typescript
 * {
 *   certification_level: 'practitioner',
 *   professional_background: 'I have worked in...',
 *   motivation: 'I want to become certified because...'
 * }
 * ```
 */
export const certificationApplicationSchema = z.object({
  certification_level: z.enum(['practitioner', 'instructor']),
  professional_background: z.string().min(50, 'Professional background must be at least 50 characters').max(2000),
  motivation: z.string().min(50, 'Motivation must be at least 50 characters').max(2000),
  experience_years: z.number().int().min(0).max(50).optional(),
  specializations: z.array(z.string()).max(10).optional(),
  certifications_held: z.array(z.string()).max(10).optional(),
  linkedin_url: z.string().url().optional().or(z.literal('')),
  website_url: z.string().url().optional().or(z.literal('')),
})

// ============================================
// DIAGNOSTICS SCHEMAS
// ============================================

/**
 * Diagnostic creation schema
 * Used for creating organization diagnostics
 *
 * @example
 * ```typescript
 * {
 *   template_id: '550e8400-e29b-41d4-a716-446655440000',
 *   name: 'Q4 Team Assessment',
 *   include_all_members: true
 * }
 * ```
 */
export const createDiagnosticSchema = z.object({
  template_id: z.string().uuid('Invalid template ID'),
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().optional(),
  target_user_ids: z.array(z.string().uuid()).optional(),
  target_department: z.string().optional(),
  include_all_members: z.boolean().optional(),
  anonymous_results: z.boolean().optional(),
  deadline_at: z.string().datetime().optional(),
})

/**
 * Diagnostic update schema
 * Used for updating organization diagnostics
 *
 * @example
 * ```typescript
 * {
 *   name: 'Updated Assessment Name',
 *   status: 'active'
 * }
 * ```
 */
export const updateDiagnosticSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['draft', 'active', 'in_progress', 'completed', 'archived']).optional(),
  target_user_ids: z.array(z.string().uuid()).optional(),
  target_department: z.string().nullable().optional(),
  include_all_members: z.boolean().optional(),
  anonymous_results: z.boolean().optional(),
  deadline_at: z.string().datetime().nullable().optional(),
})

// ============================================
// SESSION & BOOKING SCHEMAS
// ============================================

/**
 * Session booking schema
 * Used for booking coaching or therapy sessions
 *
 * @example
 * ```typescript
 * {
 *   session_type: 'coaching',
 *   start_time: '2024-12-01T10:00:00Z',
 *   duration_minutes: 60,
 *   notes: 'Looking forward to discussing...'
 * }
 * ```
 */
export const sessionBookingSchema = z.object({
  session_type: z.string().min(1, 'Session type is required'),
  start_time: datetimeSchema,
  duration_minutes: positiveIntSchema,
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
})

/**
 * Session creation request schema
 * Used when booking a session via API
 *
 * @example
 * ```typescript
 * {
 *   instructor_id: '550e8400-e29b-41d4-a716-446655440000',
 *   scheduled_at: '2024-01-15T14:00:00Z',
 *   duration: 60,
 *   notes: 'Focus on anxiety management'
 * }
 * ```
 */
export const sessionCreateRequestSchema = z.object({
  instructor_id: uuidSchema,
  scheduled_at: datetimeSchema,
  duration: positiveIntSchema.optional().default(60),
  notes: z.string().max(1000, 'Notes must be 1000 characters or less').optional(),
})

// ============================================
// ANALYTICS & METRICS SCHEMAS
// ============================================

/**
 * Analytics event schema
 * Used for tracking user events
 *
 * @example
 * ```typescript
 * {
 *   event_name: 'course_viewed',
 *   properties: { course_id: 'abc123', duration: 300 },
 *   timestamp: '2024-11-25T10:30:00Z'
 * }
 * ```
 */
export const analyticsEventSchema = z.object({
  event_name: z.string().min(1, 'Event name is required'),
  properties: z.record(z.any()).optional(),
  timestamp: datetimeSchema.optional(),
})

// ============================================
// SSO SCHEMAS
// ============================================

/**
 * SSO login schema
 * Used for initiating SSO login flow
 *
 * @example
 * ```typescript
 * {
 *   email: 'user@company.com',
 *   redirectUrl: '/dashboard'
 * }
 * ```
 */
export const ssoLoginSchema = z.object({
  email: emailSchema,
  redirectUrl: z.string().optional(),
})

/**
 * SSO provider configuration schema
 * Used for creating/updating SSO providers
 *
 * @example
 * ```typescript
 * {
 *   provider_type: 'saml',
 *   provider_name: 'Okta',
 *   domains: ['company.com'],
 *   saml_entity_id: 'https://company.okta.com',
 *   saml_sso_url: 'https://company.okta.com/sso',
 *   saml_certificate: '-----BEGIN CERTIFICATE-----...'
 * }
 * ```
 */
export const ssoProviderSchema = z.object({
  provider_type: z.enum(['saml', 'oauth', 'oidc']),
  provider_name: z.string().min(1, 'Provider name is required').max(100, 'Provider name must be 100 characters or less'),
  domains: z.array(z.string().regex(/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/, 'Invalid domain format')).min(1, 'At least one domain is required'),
  enforce_sso: z.boolean().default(false),
  auto_provision_users: z.boolean().default(true),
  default_role: z.enum(['member', 'admin']).default('member'),
  saml_entity_id: z.string().optional(),
  saml_sso_url: urlSchema.optional(),
  saml_certificate: z.string().refine(
    (val) => !val || val.includes('BEGIN CERTIFICATE'),
    'Invalid certificate format. Must be PEM encoded.'
  ).optional(),
  saml_sign_requests: z.boolean().default(false),
  oauth_client_id: z.string().optional(),
  oauth_client_secret: z.string().optional(),
  oauth_authorize_url: urlSchema.optional(),
  oauth_token_url: urlSchema.optional(),
  oauth_userinfo_url: urlSchema.optional(),
  oauth_scopes: z.array(z.string()).optional(),
  attribute_mapping: z.record(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
}).refine(
  (data) => {
    if (data.provider_type === 'saml') {
      return !!(data.saml_entity_id && data.saml_sso_url && data.saml_certificate)
    }
    if (data.provider_type === 'oauth' || data.provider_type === 'oidc') {
      return !!(data.oauth_client_id && data.oauth_client_secret && data.oauth_authorize_url && data.oauth_token_url && data.oauth_userinfo_url)
    }
    return true
  },
  {
    message: 'Missing required fields for provider type',
  }
)

/**
 * SSO provider update schema
 * All fields are optional for partial updates
 */
export const ssoProviderUpdateSchema = z.object({
  provider_name: z.string().min(1).max(100).optional(),
  domains: z.array(z.string().min(1)).min(1).optional(),
  saml_entity_id: z.string().optional(),
  saml_sso_url: urlSchema.optional(),
  saml_certificate: z.string().refine(
    (val) => !val || val.includes('BEGIN CERTIFICATE'),
    'Invalid certificate format. Must be PEM encoded.'
  ).optional(),
  oauth_client_id: z.string().optional(),
  oauth_client_secret: z.string().optional(),
  oauth_authorize_url: urlSchema.optional(),
  oauth_token_url: urlSchema.optional(),
  oauth_userinfo_url: urlSchema.optional(),
  oauth_scopes: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
})

// ============================================
// WEBHOOK SCHEMAS
// ============================================

/**
 * Webhook creation schema
 * Used for creating organization webhooks
 *
 * @example
 * ```typescript
 * {
 *   name: 'Course Enrollment Webhook',
 *   url: 'https://example.com/webhooks/enrollments',
 *   events: ['course.enrolled', 'course.completed']
 * }
 * ```
 */
export const webhookCreateSchema = z.object({
  name: z.string().min(1, 'Webhook name is required').max(100, 'Webhook name must be 100 characters or less'),
  url: urlSchema,
  events: z.array(z.string().min(1, 'Event cannot be empty')).min(1, 'At least one event is required'),
})

/**
 * Webhook update schema
 * All fields are optional for partial updates
 */
export const webhookUpdateSchema = webhookCreateSchema.partial()

// ============================================
// API KEY SCHEMAS
// ============================================

/**
 * API key creation schema
 * Used for creating organization API keys
 *
 * @example
 * ```typescript
 * {
 *   name: 'Production API Key',
 *   scopes: ['courses:read', 'users:read'],
 *   expiresInDays: 90
 * }
 * ```
 */
export const apiKeyCreateSchema = z.object({
  name: z.string().min(1, 'API key name is required').max(100, 'API key name must be 100 characters or less'),
  scopes: z.array(z.string().min(1, 'Scope cannot be empty')).min(1, 'At least one scope is required'),
  expiresInDays: z.number().int('Expiration must be an integer').min(1, 'Expiration must be at least 1 day').max(365, 'Expiration cannot exceed 365 days').optional(),
})

// ============================================
// SEARCH SCHEMAS
// ============================================

/**
 * Search query schema
 * Used for search endpoints
 *
 * @example
 * ```typescript
 * {
 *   q: 'neuroscience',
 *   type: 'courses',
 *   limit: 20
 * }
 * ```
 */
export const searchSchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').max(200, 'Search query must be 200 characters or less'),
  type: z.enum(['all', 'courses', 'events', 'blog', 'instructors', 'resources']).optional(),
  limit: paginationLimitSchema,
})

/**
 * Autocomplete query schema
 * Used for search autocomplete
 *
 * @example
 * ```typescript
 * {
 *   query: 'neuro'
 * }
 * ```
 */
export const autocompleteSchema = z.object({
  query: z.string().min(2, 'Query must be at least 2 characters').max(200, 'Query must be 200 characters or less'),
})

// ============================================
// ASSIGNMENT & SUBMISSION SCHEMAS
// ============================================

/**
 * Assignment content submission schema
 * Used for submitting assignment content
 *
 * @example
 * ```typescript
 * {
 *   content: 'My assignment submission text...',
 *   attachments: ['https://example.com/file.pdf']
 * }
 * ```
 */
export const assignmentContentSchema = z.object({
  content: z.string().min(1, 'Assignment content is required'),
  attachments: z.array(urlSchema).optional(),
})

/**
 * Course review content schema
 * Used for submitting course reviews
 *
 * @example
 * ```typescript
 * {
 *   rating: 5,
 *   content: 'Excellent course!'
 * }
 * ```
 */
export const reviewContentSchema = z.object({
  rating: ratingSchema,
  content: z.string().min(10, 'Review content must be at least 10 characters').max(2000, 'Review content must be 2000 characters or less'),
  title: z.string().max(200, 'Title must be 200 characters or less').optional(),
  would_recommend: z.boolean().optional(),
})

// ============================================
// EMAIL PREFERENCES SCHEMA
// ============================================

/**
 * Email preferences update schema
 * All fields are optional booleans with defaults
 *
 * @example
 * ```typescript
 * {
 *   course_updates: true,
 *   session_reminders: true,
 *   marketing: false,
 *   payment_receipts: true
 * }
 * ```
 */
export const emailPreferencesUpdateSchema = z.object({
  course_updates: z.boolean().optional().default(true),
  session_reminders: z.boolean().optional().default(true),
  marketing: z.boolean().optional().default(false),
  payment_receipts: z.boolean().optional().default(true),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type EmailPreferencesUpdate = z.infer<typeof emailPreferencesUpdateSchema>
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>
export type RoleUpdate = z.infer<typeof roleUpdateSchema>
export type CourseCreate = z.infer<typeof courseCreateSchema>
export type CourseUpdate = z.infer<typeof courseUpdateSchema>
export type CourseEnrollment = z.infer<typeof courseEnrollmentSchema>
export type EventCreate = z.infer<typeof eventCreateSchema>
export type EventUpdate = z.infer<typeof eventUpdateSchema>
export type AssessmentSubmit = z.infer<typeof assessmentSubmitSchema>
export type CheckoutSession = z.infer<typeof checkoutSessionSchema>
export type BlogPostCreate = z.infer<typeof blogPostCreateSchema>
export type BlogPostUpdate = z.infer<typeof blogPostUpdateSchema>
export type OrganizationCreate = z.infer<typeof organizationCreateSchema>
export type OrganizationUpdate = z.infer<typeof organizationUpdateSchema>
export type SSOLogin = z.infer<typeof ssoLoginSchema>
export type SSOProvider = z.infer<typeof ssoProviderSchema>
export type WebhookCreate = z.infer<typeof webhookCreateSchema>
export type ApiKeyCreate = z.infer<typeof apiKeyCreateSchema>
export type SearchQuery = z.infer<typeof searchSchema>
export type AssignmentContent = z.infer<typeof assignmentContentSchema>
export type ReviewContent = z.infer<typeof reviewContentSchema>
export type PasswordReset = z.infer<typeof passwordResetSchema>
