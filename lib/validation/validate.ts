/**
 * Request validation utilities
 * Validates request bodies against Zod schemas with proper error handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// ============================================================================
// Query Parameter Helpers
// ============================================================================

/**
 * Safely parse an integer from a query parameter string
 *
 * Handles NaN, negative numbers, and out-of-range values safely.
 * Returns the fallback value if the input is invalid.
 *
 * @param value - String value from query parameter (or null)
 * @param fallback - Default value to use if parsing fails
 * @param options - Optional min/max constraints
 * @returns Parsed integer or fallback value
 *
 * @example
 * ```typescript
 * const limit = safeParseInt(searchParams.get('limit'), 20, { min: 1, max: 100 })
 * const offset = safeParseInt(searchParams.get('offset'), 0, { min: 0 })
 * ```
 */
export function safeParseInt(
  value: string | null,
  fallback: number,
  options?: { min?: number; max?: number }
): number {
  if (value === null || value === '') {
    return fallback
  }

  const parsed = parseInt(value, 10)

  // Check for NaN
  if (isNaN(parsed)) {
    return fallback
  }

  // Apply min constraint
  if (options?.min !== undefined && parsed < options.min) {
    return options.min
  }

  // Apply max constraint
  if (options?.max !== undefined && parsed > options.max) {
    return options.max
  }

  return parsed
}

/**
 * Sanitize a search query string
 *
 * Removes potentially dangerous characters and limits length.
 * Safe for use in Supabase ilike queries.
 *
 * @param input - Raw search input from query parameter
 * @param maxLength - Maximum length of sanitized string (default: 100)
 * @returns Sanitized search string
 *
 * @example
 * ```typescript
 * const search = sanitizeSearchQuery(searchParams.get('search'))
 * if (search) {
 *   query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
 * }
 * ```
 */
export function sanitizeSearchQuery(
  input: string | null,
  maxLength: number = 100
): string {
  if (!input) {
    return ''
  }

  // Remove characters that could be problematic in SQL-like patterns
  // Allow: alphanumeric, spaces, hyphens, underscores, and common punctuation
  return input
    .replace(/[^a-zA-Z0-9\s\-_.,!?'"]/g, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * Validation result type
 * 
 * Discriminated union type for validation results
 */
export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: NextResponse }

/**
 * Validate request body against a Zod schema
 * 
 * Parses JSON body and validates it against the provided schema.
 * Returns typed data on success or error response on failure.
 * 
 * @param request - NextRequest object
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with either typed data or error response
 * 
 * @example
 * ```typescript
 * const validation = await validateRequest(request, courseCreateSchema)
 * if (!validation.success) {
 *   return validation.error
 * }
 * const { title, price_usd } = validation.data
 * ```
 */
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    // Parse request body
    const body = await request.json()

    // Validate against schema
    const result = schema.safeParse(body)

    if (!result.success) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Validation failed',
            details: result.error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: true,
      data: result.data,
    }
  } catch {
    // JSON parsing error or other unexpected error
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid request body - must be valid JSON' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validate query parameters against a Zod schema
 * 
 * Converts URLSearchParams to an object and validates against the schema
 * 
 * @param searchParams - URLSearchParams from request URL
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with either typed data or error response
 * 
 * @example
 * ```typescript
 * const { searchParams } = new URL(request.url)
 * const validation = validateQuery(searchParams, paginationQuerySchema)
 * if (!validation.success) {
 *   return validation.error
 * }
 * const { limit, offset } = validation.data
 * ```
 */
export function validateQuery<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  try {
    // Convert URLSearchParams to object
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    // Validate against schema
    const result = schema.safeParse(params)

    if (!result.success) {
      return {
        success: false,
        error: NextResponse.json(
          {
            error: 'Invalid query parameters',
            details: result.error.issues.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
            })),
          },
          { status: 400 }
        ),
      }
    }

    return {
      success: true,
      data: result.data,
    }
  } catch {
    return {
      success: false,
      error: NextResponse.json(
        { error: 'Invalid query parameters' },
        { status: 400 }
      ),
    }
  }
}

/**
 * Validate route parameters against a Zod schema
 * 
 * Validates dynamic route parameters (e.g., [id], [slug])
 * 
 * @param params - Route parameters object
 * @param schema - Zod schema to validate against
 * @returns ValidationResult with either typed data or error response
 * 
 * @example
 * ```typescript
 * export const GET = createPublicRoute(async (request, context) => {
 *   const params = await context.params
 *   const validation = validateParams(params, idParamSchema)
 *   if (!validation.success) {
 *     return validation.error
 *   }
 *   const { id } = validation.data
 * })
 * ```
 */
export function validateParams<T>(
  params: Record<string, string>,
  schema: z.ZodSchema<T>
): ValidationResult<T> {
  const result = schema.safeParse(params)

  if (!result.success) {
    return {
      success: false,
      error: NextResponse.json(
        {
          error: 'Invalid route parameters',
          details: result.error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      ),
    }
  }

  return {
    success: true,
    data: result.data,
  }
}

/**
 * Route context type for Next.js App Router
 */
interface RouteContext<TParams = Record<string, string>> {
  params: Promise<TParams>
}

/**
 * Higher-order function that wraps an API route handler with validation
 * 
 * Automatically validates request body and passes typed data to handler.
 * Returns validation error response if validation fails.
 * 
 * @param schema - Zod schema to validate request body against
 * @param handler - Route handler function that receives validated data
 * @returns Wrapped route handler function
 * 
 * @example
 * ```typescript
 * export const POST = withValidation(
 *   profileUpdateSchema,
 *   async (request, validatedData) => {
 *     // validatedData is fully typed based on schema
 *     const updated = await userRepository.updateProfile(user.id, validatedData)
 *     return successResponse(updated)
 *   }
 * )
 * ```
 */
export function withValidation<T, TParams = Record<string, string>>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, data: T, context?: RouteContext<TParams>) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: RouteContext<TParams>) => {
    const validation = await validateRequest(request, schema)

    if (!validation.success) {
      return validation.error
    }

    return handler(request, validation.data, context)
  }
}

/**
 * Validate multiple inputs at once
 * 
 * Useful when you need to validate request body, query parameters, and route parameters together.
 * Returns all validated data in a single object or the first validation error encountered.
 * 
 * @param options - Object containing request, query, and/or params to validate
 * @param options.request - Request body validation config
 * @param options.query - Query parameters validation config
 * @param options.params - Route parameters validation config
 * @returns ValidationResult with all validated data or error response
 * 
 * @example
 * ```typescript
 * const validation = await validateMultiple({
 *   request: { request, schema: courseUpdateSchema },
 *   query: { searchParams, schema: paginationQuerySchema },
 *   params: { params: await context.params, schema: idParamSchema }
 * })
 * 
 * if (!validation.success) {
 *   return validation.error
 * }
 * 
 * const { body, query, params } = validation.data
 * // All three are now typed and validated
 * ```
 */
export async function validateMultiple<
  TBody = unknown,
  TQuery = unknown,
  TParams = unknown
>(options: {
  request?: {
    request: NextRequest
    schema: z.ZodSchema<TBody>
  }
  query?: {
    searchParams: URLSearchParams
    schema: z.ZodSchema<TQuery>
  }
  params?: {
    params: Record<string, string>
    schema: z.ZodSchema<TParams>
  }
}): Promise<
  | { success: true; data: { body?: TBody; query?: TQuery; params?: TParams } }
  | { success: false; error: NextResponse }
> {
  const data: { body?: TBody; query?: TQuery; params?: TParams } = {}

  // Validate request body
  if (options.request) {
    const result = await validateRequest(options.request.request, options.request.schema)
    if (!result.success) return result
    data.body = result.data
  }

  // Validate query params
  if (options.query) {
    const result = validateQuery(options.query.searchParams, options.query.schema)
    if (!result.success) return result
    data.query = result.data
  }

  // Validate route params
  if (options.params) {
    const result = validateParams(options.params.params, options.params.schema)
    if (!result.success) return result
    data.params = result.data
  }

  return { success: true, data }
}
