/**
 * Request Helper Utilities
 * Common patterns for extracting data from requests
 */

import { NextRequest } from 'next/server'
import { badRequestError } from './error-handler'
import { getCurrentTimestamp } from '@/lib/utils'

/**
 * Extract and parse pagination parameters from query string
 * 
 * Parses 'page' and 'limit' query parameters and calculates offset
 * 
 * @param request - NextRequest object
 * @param defaults - Optional default values for page and limit
 * @returns Object containing page, limit, and calculated offset
 * 
 * @example
 * ```typescript
 * // URL: /api/courses?page=2&limit=20
 * const { page, limit, offset } = getPaginationParams(request)
 * // Returns: { page: 2, limit: 20, offset: 20 }
 * ```
 * 
 * @example
 * ```typescript
 * // With custom defaults
 * const { page, limit, offset } = getPaginationParams(request, { page: 1, limit: 10 })
 * ```
 */
export function getPaginationParams(request: NextRequest, defaults?: { page?: number; limit?: number }) {
  const { searchParams } = new URL(request.url)

  const page = parseInt(searchParams.get('page') || String(defaults?.page || 1))
  const limit = parseInt(searchParams.get('limit') || String(defaults?.limit || 50))
  const offset = (page - 1) * limit

  return { page, limit, offset }
}

/**
 * Extract client IP address from request headers
 * 
 * Checks x-forwarded-for and x-real-ip headers (common in proxy/load balancer setups)
 * 
 * @param request - NextRequest object
 * @returns Client IP address or undefined if not found
 * 
 * @example
 * ```typescript
 * const ip = getClientIP(request)
 * logger.info(`Request from IP: ${ip}`)
 * ```
 */
export function getClientIP(request: NextRequest): string | undefined {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    undefined
  )
}

/**
 * Extract user agent string from request headers
 * 
 * @param request - NextRequest object
 * @returns User agent string or undefined if not found
 * 
 * @example
 * ```typescript
 * const userAgent = getUserAgent(request)
 * // Returns: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
 * ```
 */
export function getUserAgent(request: NextRequest): string | undefined {
  return request.headers.get('user-agent') || undefined
}

/**
 * Extract common request metadata for logging and analytics
 * 
 * Combines IP address, user agent, and timestamp into a single object
 * 
 * @param request - NextRequest object
 * @returns Object containing ip_address, user_agent, and timestamp
 * 
 * @example
 * ```typescript
 * const metadata = getRequestMetadata(request)
 * await logActivity({ ...metadata, action: 'course_viewed' })
 * ```
 */
export function getRequestMetadata(request: NextRequest) {
  return {
    ip_address: getClientIP(request),
    user_agent: getUserAgent(request),
    timestamp: getCurrentTimestamp(),
  }
}

/**
 * Parse and validate JSON request body
 * 
 * @param request - NextRequest object
 * @returns Parsed JSON body
 * @throws {ApiError} BadRequestError if JSON is invalid
 * 
 * @example
 * ```typescript
 * const body = await parseJsonBody<{ name: string; email: string }>(request)
 * console.log(body.name, body.email)
 * ```
 */
export async function parseJsonBody<T = unknown>(request: NextRequest): Promise<T> {
  try {
    const body = await request.json()
    return body as T
  } catch (_error) {
    throw badRequestError('Invalid JSON in request body')
  }
}

/**
 * Extract a single query parameter with optional validation
 * 
 * @param request - NextRequest object
 * @param name - Name of the query parameter
 * @param options - Optional configuration
 * @param options.required - If true, throws error when parameter is missing
 * @param options.defaultValue - Default value if parameter is not present
 * @returns Query parameter value, default value, or null
 * @throws {ApiError} BadRequestError if required parameter is missing
 * 
 * @example
 * ```typescript
 * // URL: /api/courses?category=neuroscience
 * const category = getQueryParam(request, 'category')
 * // Returns: 'neuroscience'
 * ```
 * 
 * @example
 * ```typescript
 * // Required parameter
 * const id = getQueryParam(request, 'id', { required: true })
 * ```
 * 
 * @example
 * ```typescript
 * // With default value
 * const sort = getQueryParam(request, 'sort', { defaultValue: 'created_at' })
 * ```
 */
export function getQueryParam(
  request: NextRequest,
  name: string,
  options?: {
    required?: boolean
    defaultValue?: string
  }
): string | null {
  const { searchParams } = new URL(request.url)
  const value = searchParams.get(name)

  if (options?.required && !value) {
    throw badRequestError(`Query parameter '${name}' is required`)
  }

  return value || options?.defaultValue || null
}

/**
 * Extract multiple query parameters
 * @param request - Next.js request object
 * @param names - Array of parameter names to extract
 * @returns Object with parameter names as keys and values as strings or null
 * @example
 * const params = getQueryParams(request, ['status', 'category']);
 */
export function getQueryParams(
  request: NextRequest,
  names: string[]
): Record<string, string | null> {
  const { searchParams } = new URL(request.url)

  return names.reduce((acc: Record<string, string | null>, name: string) => {
    acc[name] = searchParams.get(name)
    return acc
  }, {} as Record<string, string | null>)
}

/**
 * Parse integer query parameter
 * @param request - Next.js request object
 * @param name - Parameter name
 * @param options - Optional configuration for validation
 * @returns Parsed integer or null
 * @example
 * const page = getIntParam(request, 'page', { defaultValue: 1, min: 1 });
 */
export function getIntParam(
  request: NextRequest,
  name: string,
  options?: {
    required?: boolean
    defaultValue?: number
    min?: number
    max?: number
  }
): number | null {
  const value = getQueryParam(request, name, {
    required: options?.required,
    defaultValue: options?.defaultValue?.toString(),
  })

  if (value === null) return null

  const parsed = parseInt(value, 10)

  if (isNaN(parsed)) {
    throw badRequestError(`Query parameter '${name}' must be a valid integer`)
  }

  if (options?.min !== undefined && parsed < options.min) {
    throw badRequestError(`Query parameter '${name}' must be at least ${options.min}`)
  }

  if (options?.max !== undefined && parsed > options.max) {
    throw badRequestError(`Query parameter '${name}' must be at most ${options.max}`)
  }

  return parsed
}

/**
 * Parse boolean query parameter
 * @param request - Next.js request object
 * @param name - Parameter name
 * @param defaultValue - Default value if parameter is not present
 * @returns Boolean value
 * @example
 * const isActive = getBooleanParam(request, 'active', false);
 */
export function getBooleanParam(
  request: NextRequest,
  name: string,
  defaultValue: boolean = false
): boolean {
  const value = getQueryParam(request, name)

  if (value === null) return defaultValue

  return value === 'true' || value === '1'
}

/**
 * Parse array query parameter (comma-separated)
 * @param request - Next.js request object
 * @param name - Parameter name
 * @param options - Optional configuration
 * @returns Array of strings
 * @example
 * const tags = getArrayParam(request, 'tags', { defaultValue: [] });
 */
export function getArrayParam(
  request: NextRequest,
  name: string,
  options?: {
    required?: boolean
    defaultValue?: string[]
  }
): string[] {
  const value = getQueryParam(request, name, {
    required: options?.required,
  })

  if (!value) return options?.defaultValue || []

  return value.split(',').map(v => v.trim()).filter(v => v)
}

/**
 * Parse date query parameter
 * @param request - Next.js request object
 * @param name - Parameter name
 * @param options - Optional configuration
 * @returns Date object or null
 * @example
 * const startDate = getDateParam(request, 'start_date', { required: true });
 */
export function getDateParam(
  request: NextRequest,
  name: string,
  options?: {
    required?: boolean
    defaultValue?: Date
  }
): Date | null {
  const value = getQueryParam(request, name, {
    required: options?.required,
  })

  if (!value) return options?.defaultValue || null

  const date = new Date(value)

  if (isNaN(date.getTime())) {
    throw badRequestError(`Query parameter '${name}' must be a valid date`)
  }

  return date
}

/**
 * Parse enum query parameter
 * @param request - Next.js request object
 * @param name - Parameter name
 * @param allowedValues - Array of allowed enum values
 * @param options - Optional configuration
 * @returns Enum value or null
 * @example
 * const status = getEnumParam(request, 'status', ['active', 'inactive'], { defaultValue: 'active' });
 */
export function getEnumParam<T extends string>(
  request: NextRequest,
  name: string,
  allowedValues: T[],
  options?: {
    required?: boolean
    defaultValue?: T
  }
): T | null {
  const value = getQueryParam(request, name, {
    required: options?.required,
    defaultValue: options?.defaultValue,
  }) as T | null

  if (!value) return null

  if (!allowedValues.includes(value)) {
    throw badRequestError(
      `Query parameter '${name}' must be one of: ${allowedValues.join(', ')}`
    )
  }

  return value
}

/**
 * Build filter object from query params
 * @param request - Next.js request object
 * @param filterMap - Mapping of query param names to database column names
 * @returns Filter object for database queries
 * @example
 * const filters = buildFilters(request, { status: 'status', category: 'category_id' });
 */
export function buildFilters(
  request: NextRequest,
  filterMap: Record<string, string>
): Record<string, unknown> {
  const { searchParams } = new URL(request.url)
  const filters: Record<string, unknown> = {}

  Object.entries(filterMap).forEach(([queryParam, dbColumn]) => {
    const value = searchParams.get(queryParam)
    if (value !== null) {
      filters[dbColumn] = value
    }
  })

  return filters
}

/**
 * Extract sort/order parameters
 * @param request - Next.js request object
 * @param defaultColumn - Default column to sort by
 * @param defaultOrder - Default sort order ('asc' or 'desc')
 * @returns Object with column and ascending properties
 * @example
 * const { column, ascending } = getSortParams(request, 'created_at', 'desc');
 */
export function getSortParams(
  request: NextRequest,
  defaultColumn: string = 'created_at',
  defaultOrder: 'asc' | 'desc' = 'desc'
): { column: string; ascending: boolean } {
  const { searchParams } = new URL(request.url)

  const sortBy = searchParams.get('sort_by') || searchParams.get('sortBy') || defaultColumn
  const order = searchParams.get('order') || searchParams.get('sort_order') || defaultOrder

  return {
    column: sortBy,
    ascending: order === 'asc',
  }
}

/**
 * Parse request body with required fields validation
 * @param request - Next.js request object
 * @param requiredFields - Array of required field names
 * @returns Parsed and validated request body
 * @throws {ApiError} If required fields are missing
 * @example
 * const body = await parseBodyWithValidation(request, ['name', 'email']);
 */
export async function parseBodyWithValidation<T extends Record<string, unknown> = Record<string, unknown>>(
  request: NextRequest,
  requiredFields: string[]
): Promise<T> {
  const body = await parseJsonBody<T>(request)

  const missing = requiredFields.filter(field => !(field in body))

  if (missing.length > 0) {
    throw badRequestError('Missing required fields', { missing })
  }

  return body
}

/**
 * Extract file from multipart form data
 * @param request - Next.js request object
 * @param fieldName - Name of the form field containing the file (defaults to 'file')
 * @returns File object or null if not found
 * @example
 * const file = await getFormFile(request, 'avatar');
 */
export async function getFormFile(
  request: NextRequest,
  fieldName: string = 'file'
): Promise<File | null> {
  const formData = await request.formData()
  const file = formData.get(fieldName)

  if (!file || !(file instanceof File)) {
    return null
  }

  return file
}

/**
 * Validate file type
 * @param file - File object to validate
 * @param allowedTypes - Array of allowed MIME types
 * @param fieldName - Name of the field for error messages
 * @throws {ApiError} If file type is not allowed
 * @example
 * validateFileType(file, ['image/jpeg', 'image/png'], 'avatar');
 */
export function validateFileType(
  file: File,
  allowedTypes: string[],
  fieldName: string = 'file'
): void {
  if (!allowedTypes.includes(file.type)) {
    throw badRequestError(
      `Invalid ${fieldName} type. Allowed types: ${allowedTypes.join(', ')}`
    )
  }
}

/**
 * Validate file size
 * @param file - File object to validate
 * @param maxSizeBytes - Maximum allowed file size in bytes
 * @param fieldName - Name of the field for error messages
 * @throws {ApiError} If file size exceeds maximum
 * @example
 * validateFileSize(file, 5 * 1024 * 1024, 'document'); // 5MB max
 */
export function validateFileSize(
  file: File,
  maxSizeBytes: number,
  fieldName: string = 'file'
): void {
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(2)
    throw badRequestError(`${fieldName} size must not exceed ${maxSizeMB}MB`)
  }
}
