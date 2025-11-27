/**
 * API Utilities Barrel Export
 * Centralizes all API utility imports
 */

// Error handling
export {
    ApiError, asyncHandler, badRequestError,
    conflictError, errorResponse, forbiddenError, internalError, notFoundError, paginatedResponse, rateLimitError, successResponse, unauthorizedError, validateEmail, validateEnum, validateRequired, validateUrl, validationError, type ErrorResponse,
    type PaginatedResponse
} from './error-handler'

// Legacy auth utilities (requireAdmin still useful for manual checks)
// Note: withAdmin and withAuth are deprecated - use route factory instead
export { requireAdmin } from './with-admin'

// Route factory patterns (DRY approach)
export {
    createAdminRoute,
    createAuthenticatedRoute,
    createCronRoute,
    createOptionalAuthRoute,
    createPublicRoute,
    extractParams
} from './route-factory'

// Route utilities (common helpers)
export * from './route-utils'

// Request helpers
export * from './request-helpers'

// Constants
export * from './constants'

// Validation
export { validateRequest, validateQuery, validateParams, withValidation, validateMultiple } from '../validation/validate'

