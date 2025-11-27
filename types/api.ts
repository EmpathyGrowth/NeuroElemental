// API response types and request/response interfaces

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
}

export interface ApiError {
  error: string
  status: number
  details?: Record<string, unknown>
}

export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Course API types
export interface CourseEnrollmentRequest {
  courseId: string
  paymentIntentId?: string
}

export interface CourseProgressUpdate {
  lessonId: string
  progress: number
  timeSpent?: number
}

// Event API types
export interface EventRegistrationRequest {
  eventId: string
  ticketType?: string
}

// Payment API types
export interface CheckoutSessionRequest {
  productId: string
  productType: 'course' | 'event' | 'subscription'
  successUrl: string
  cancelUrl: string
}

export interface WebhookEvent {
  type: string
  data: Record<string, unknown>
}

// Assessment API types
export interface AssessmentSubmission {
  answers: Record<string, unknown>
  scores?: Record<string, number>
}

// User API types
export interface ProfileUpdateRequest {
  full_name?: string
  avatar_url?: string
  bio?: string
}

export interface RoleUpdateRequest {
  userId: string
  role: 'registered' | 'student' | 'instructor' | 'business' | 'school' | 'admin'
}
