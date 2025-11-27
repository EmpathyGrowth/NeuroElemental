/**
 * API Route Types
 *
 * For API responses and error handling, use the helpers from '@/lib/api':
 * - successResponse, errorResponse, notFoundError, etc.
 *
 * This file only contains the RouteContext type for Next.js 15+ params handling.
 */

/**
 * Route params type for Next.js 15+ (params is now a Promise)
 * Used by route factory and legacy routes during migration.
 */
export interface RouteContext<T = Record<string, string>> {
  params: Promise<T>;
}
