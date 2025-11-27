/**
 * Middleware Barrel Export
 * Centralizes all middleware imports
 */

// User role check
export { getUserRole } from './require-admin'

// Organization access
export {
  requireOrgAccess,
  requireOrgAdmin,
  requireOrgOwner,
  requireOrgPermission,
  verifyOrgExists,
  getUserOrgRoleMiddleware,
  withOrgAccess,
  withOrgAdmin,
  type OrgAccessResult,
} from './require-org-access'

// API authentication
export {
  authenticateRequest,
  checkApiScope,
  requireAuth,
  requireApiAuth,
  createApiErrorResponse,
  requireAuthWithRateLimit,
  type ApiAuthResult,
} from './api-auth'

// Rate limiting
export {
  checkRateLimit,
  incrementRateLimit,
  addRateLimitHeaders,
} from './rate-limiter'
