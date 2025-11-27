/**
 * API Error Handling
 * Standardizes error responses across all API routes
 */

import { NextResponse } from 'next/server'
import { logger } from '@/lib/logging'
import { getCurrentTimestamp } from '@/lib/utils'

/**
 * Structured API error with status code and error code
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number = 500,
    public code?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Standard error response structure
 */
export interface ErrorResponse {
  error: string
  code?: string
  details?: unknown
  timestamp: string
}

/**
 * Convert any error to a standardized NextResponse
 * 
 * Handles multiple error types:
 * - ApiError instances with custom status codes
 * - Supabase/PostgreSQL errors with specific error codes
 * - Standard Error instances
 * - Unknown error types
 * 
 * @param error - The error to convert (can be any type)
 * @param defaultStatus - Default HTTP status code if error type is unknown (default: 500)
 * @returns NextResponse with standardized error format
 * 
 * @example
 * ```typescript
 * try {
 *   const data = await fetchData()
 *   return successResponse(data)
 * } catch (error) {
 *   return errorResponse(error)
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // With custom default status
 * catch (error) {
 *   return errorResponse(error, 400)
 * }
 * ```
 */
export function errorResponse(
  error: unknown,
  defaultStatus: number = 500
): NextResponse<ErrorResponse> {
  logger.error('API Error', undefined, { errorMsg: error instanceof Error ? error.message : String(error) })

  // Handle ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        details: error.details,
        timestamp: getCurrentTimestamp(),
      },
      { status: error.status }
    )
  }

  // Handle Supabase/PostgreSQL errors
  if (error && typeof error === 'object' && 'code' in error) {
    const dbError = error as { code: string; message: string; details?: string }

    // Map common Supabase error codes
    if (dbError.code === '23505') {
      return NextResponse.json(
        {
          error: 'A record with this value already exists',
          code: 'DUPLICATE_ENTRY',
          details: dbError.details,
          timestamp: getCurrentTimestamp(),
        },
        { status: 409 }
      )
    }

    if (dbError.code === '23503') {
      return NextResponse.json(
        {
          error: 'Referenced record does not exist',
          code: 'FOREIGN_KEY_VIOLATION',
          details: dbError.details,
          timestamp: getCurrentTimestamp(),
        },
        { status: 400 }
      )
    }

    if (dbError.code === 'PGRST116') {
      return NextResponse.json(
        {
          error: 'Record not found',
          code: 'NOT_FOUND',
          timestamp: getCurrentTimestamp(),
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        error: dbError.message || 'Database error occurred',
        code: dbError.code,
        timestamp: getCurrentTimestamp(),
      },
      { status: 500 }
    )
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: getCurrentTimestamp(),
      },
      { status: defaultStatus }
    )
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
      timestamp: getCurrentTimestamp(),
    },
    { status: defaultStatus }
  )
}

/**
 * Common error factories for typical scenarios
 * These functions create standardized ApiError instances for common HTTP error cases
 */

/**
 * Create a 401 Unauthorized error
 * 
 * @param message - Custom error message (default: 'Unauthorized - Authentication required')
 * @returns ApiError with 401 status code
 * 
 * @example
 * ```typescript
 * if (!user) {
 *   throw unauthorizedError()
 * }
 * ```
 */
export function unauthorizedError(message = 'Unauthorized - Authentication required'): ApiError {
  return new ApiError(message, 401, 'UNAUTHORIZED')
}

/**
 * Create a 403 Forbidden error
 * 
 * @param message - Custom error message (default: 'Forbidden - Insufficient permissions')
 * @returns ApiError with 403 status code
 * 
 * @example
 * ```typescript
 * if (!isAdmin) {
 *   throw forbiddenError('Admin access required')
 * }
 * ```
 */
export function forbiddenError(message = 'Forbidden - Insufficient permissions'): ApiError {
  return new ApiError(message, 403, 'FORBIDDEN')
}

/**
 * Create a 404 Not Found error
 * 
 * @param resource - Name of the resource that wasn't found (default: 'Resource')
 * @returns ApiError with 404 status code
 * 
 * @example
 * ```typescript
 * if (!course) {
 *   throw notFoundError('Course')
 * }
 * ```
 */
export function notFoundError(resource = 'Resource'): ApiError {
  return new ApiError(`${resource} not found`, 404, 'NOT_FOUND')
}

/**
 * Create a 400 Bad Request error
 * 
 * @param message - Error message (default: 'Bad request')
 * @param details - Optional additional error details
 * @returns ApiError with 400 status code
 * 
 * @example
 * ```typescript
 * if (!validInput) {
 *   throw badRequestError('Invalid input format', { field: 'email' })
 * }
 * ```
 */
export function badRequestError(message = 'Bad request', details?: unknown): ApiError {
  return new ApiError(message, 400, 'BAD_REQUEST', details)
}

/**
 * Create a 409 Conflict error
 * 
 * @param message - Error message (default: 'Resource already exists')
 * @returns ApiError with 409 status code
 * 
 * @example
 * ```typescript
 * if (existingUser) {
 *   throw conflictError('User with this email already exists')
 * }
 * ```
 */
export function conflictError(message = 'Resource already exists'): ApiError {
  return new ApiError(message, 409, 'CONFLICT')
}

/**
 * Create a 422 Validation Error
 * 
 * @param message - Error message (default: 'Validation failed')
 * @param details - Validation error details (field-level errors)
 * @returns ApiError with 422 status code
 * 
 * @example
 * ```typescript
 * throw validationError('Invalid input', {
 *   email: 'Invalid email format',
 *   age: 'Must be at least 18'
 * })
 * ```
 */
export function validationError(message = 'Validation failed', details?: unknown): ApiError {
  return new ApiError(message, 422, 'VALIDATION_ERROR', details)
}

/**
 * Create a 500 Internal Server Error
 * 
 * @param message - Error message (default: 'Internal server error')
 * @returns ApiError with 500 status code
 * 
 * @example
 * ```typescript
 * if (unexpectedCondition) {
 *   throw internalError('Database connection failed')
 * }
 * ```
 */
export function internalError(message = 'Internal server error'): ApiError {
  return new ApiError(message, 500, 'INTERNAL_ERROR')
}

/**
 * Create a 429 Rate Limit Exceeded error
 * 
 * @param message - Error message (default: 'Rate limit exceeded')
 * @returns ApiError with 429 status code
 * 
 * @example
 * ```typescript
 * if (requestCount > limit) {
 *   throw rateLimitError('Too many requests, please try again later')
 * }
 * ```
 */
export function rateLimitError(message = 'Rate limit exceeded'): ApiError {
  return new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED')
}

/**
 * Validation helper functions
 * These functions validate common input patterns and throw validationError on failure
 */

/**
 * Validate that all required fields are present in an object
 *
 * @deprecated Use Zod schemas with validateRequest() instead.
 * @param fields - Object containing field values
 * @param requiredFields - Array of required field names
 * @throws {ApiError} ValidationError if any required fields are missing
 */
export function validateRequired(
  fields: Record<string, unknown>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter((field: string) => !fields[field])

  if (missing.length > 0) {
    throw validationError('Missing required fields', { missing })
  }
}

/**
 * Validate email address format
 *
 * @deprecated Use emailSchema from @/lib/validation/schemas instead.
 * @param email - Email address to validate
 * @throws {ApiError} ValidationError if email format is invalid
 */
export function validateEmail(email: string): void {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw validationError('Invalid email format', { field: 'email' })
  }
}

/**
 * Validate URL format
 *
 * @deprecated Use urlSchema from @/lib/validation/schemas instead.
 * @param url - URL string to validate
 * @throws {ApiError} ValidationError if URL format is invalid
 */
export function validateUrl(url: string): void {
  try {
    new URL(url)
  } catch (_error) {
    throw validationError('Invalid URL format', { field: 'url' })
  }
}

/**
 * Validate that a value is one of the allowed enum values
 * 
 * @param value - Value to validate
 * @param allowedValues - Array of allowed values
 * @param fieldName - Name of the field being validated (for error message)
 * @throws {ApiError} ValidationError if value is not in allowed values
 * 
 * @example
 * ```typescript
 * validateEnum('admin', ['admin', 'user', 'guest'], 'role')
 * validateEnum('invalid', ['admin', 'user'], 'role') // throws
 * ```
 */
export function validateEnum<T>(
  value: T,
  allowedValues: T[],
  fieldName: string
): void {
  if (!allowedValues.includes(value)) {
    throw validationError(
      `Invalid ${fieldName}. Must be one of: ${allowedValues.join(', ')}`,
      { field: fieldName, allowedValues }
    )
  }
}

/**
 * Create a successful JSON response
 * 
 * @param data - Data to return in the response body
 * @param status - HTTP status code (default: 200)
 * @returns NextResponse with JSON data
 * 
 * @example
 * ```typescript
 * const user = await userRepository.findById(id)
 * return successResponse(user)
 * ```
 * 
 * @example
 * ```typescript
 * // With custom status code
 * const newCourse = await courseRepository.create(data)
 * return successResponse(newCourse, 201)
 * ```
 */
export function successResponse<T = unknown>(
  data: T,
  status: number = 200
): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Paginated response structure
 * Contains data array and pagination metadata
 */
export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Create a paginated JSON response
 * 
 * Automatically calculates totalPages and hasMore based on the provided values
 * 
 * @param data - Array of data items for the current page
 * @param total - Total number of items across all pages
 * @param page - Current page number (1-indexed)
 * @param limit - Number of items per page
 * @returns NextResponse with paginated data and metadata
 * 
 * @example
 * ```typescript
 * const result = await courseRepository.paginate({ page: 1, limit: 20 })
 * return paginatedResponse(result.data, result.total, result.page, result.limit)
 * ```
 * 
 * @example
 * ```typescript
 * // Response format:
 * {
 *   data: [...],
 *   pagination: {
 *     total: 100,
 *     page: 1,
 *     limit: 20,
 *     totalPages: 5,
 *     hasMore: true
 *   }
 * }
 * ```
 */
export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): NextResponse<PaginatedResponse<T>> {
  const totalPages = Math.ceil(total / limit)

  return NextResponse.json({
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    },
  })
}

/**
 * Async error handler wrapper for API routes
 * Automatically catches errors and returns standardized responses
 *
 * @example
 * export const GET = asyncHandler(async (request: NextRequest) => {
 *   const data = await fetchData()
 *   return successResponse(data)
 * })
 */
export function asyncHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      return errorResponse(error)
    }
  }
}
