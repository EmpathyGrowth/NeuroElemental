/**
 * Route Handler Factory
 *
 * Centralized higher-order functions to eliminate boilerplate in API routes.
 * This implements DRY principles and standardizes error handling across all routes.
 */

import { getCurrentUser } from '@/lib/auth/get-current-user';
import { RouteContext } from '@/lib/types/api';
import { NextRequest, NextResponse } from 'next/server';
import {
    errorResponse,
    unauthorizedError,
} from './error-handler';

/**
 * Handler function type for authenticated routes
 */
type AuthenticatedHandler<TParams = {}> = (
  request: NextRequest,
  context: RouteContext<TParams>,
  user: { id: string; email?: string; [key: string]: any }
) => Promise<NextResponse>;

/**
 * Handler function type for public routes
 */
type PublicHandler<TParams = {}> = (
  request: NextRequest,
  context: RouteContext<TParams>
) => Promise<NextResponse>;

/**
 * Handler function type for optional auth routes
 */
type OptionalAuthHandler<TParams = {}> = (
  request: NextRequest,
  context: RouteContext<TParams>,
  user: { id: string; email?: string; [key: string]: any } | null
) => Promise<NextResponse>;

/**
 * Creates an authenticated route handler
 *
 * Automatically handles:
 * - User authentication
 * - Error wrapping
 * - Consistent response patterns
 *
 * @param handler - The authenticated route handler function that receives request, context, and user
 * @returns A route handler function that wraps authentication and error handling
 *
 * @example
 * ```typescript
 * export const GET = createAuthenticatedRoute<{ id: string }>(
 *   async (req, context, user) => {
 *     const { id } = await context.params;
 *     // Your business logic here
 *     return successResponse(data);
 *   }
 * );
 * ```
 */
export function createAuthenticatedRoute<TParams = {}>(
  handler: AuthenticatedHandler<TParams>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      const user = await getCurrentUser();

      if (!user) {
        return errorResponse(unauthorizedError());
      }

      return await handler(request, context, user);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Creates a public route handler (no authentication required)
 *
 * Automatically handles:
 * - Error wrapping
 * - Consistent response patterns
 *
 * @param handler - The public route handler function that receives request and context
 * @returns A route handler function that wraps error handling
 *
 * @example
 * ```typescript
 * export const GET = createPublicRoute(async (req, context) => {
 *   // Your business logic here
 *   return successResponse(data);
 * });
 * ```
 */
export function createPublicRoute<TParams = {}>(
  handler: PublicHandler<TParams>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Creates an optional auth route handler
 *
 * Works for both authenticated and unauthenticated users.
 * The user parameter will be null if not authenticated.
 *
 * Automatically handles:
 * - Optional user authentication (null if not logged in)
 * - Error wrapping
 * - Consistent response patterns
 *
 * @param handler - The route handler function that receives request, context, and optional user
 * @returns A route handler function that wraps optional auth and error handling
 *
 * @example
 * ```typescript
 * export const POST = createOptionalAuthRoute(async (req, context, user) => {
 *   // user is null if not authenticated
 *   if (user) {
 *     // Save to database for authenticated user
 *   }
 *   return successResponse(data);
 * });
 * ```
 */
export function createOptionalAuthRoute<TParams = {}>(
  handler: OptionalAuthHandler<TParams>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      // Attempt to get user, but don't fail if not authenticated
      const user = await getCurrentUser().catch(() => null);
      return await handler(request, context, user);
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Creates an admin-only route handler
 *
 * Automatically handles:
 * - Admin authentication via requireAdmin
 * - Error wrapping
 * - Consistent response patterns
 *
 * @param handler - The admin route handler function that receives request, context, and admin data
 * @returns A route handler function that wraps admin authentication and error handling
 *
 * @example
 * ```typescript
 * export const POST = createAdminRoute(async (req, context, admin) => {
 *   // Your admin logic here
 *   return successResponse(data);
 * });
 * ```
 */
export function createAdminRoute<TParams = {}>(
  handler: (
    request: NextRequest,
    context: RouteContext<TParams>,
    admin: { userId: string; user: any }
  ) => Promise<NextResponse>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      const { requireAdmin } = await import('./with-admin');
      const auth = await requireAdmin();

      if (auth.error) {
        return errorResponse(auth.error);
      }

      return await handler(request, context, { userId: auth.userId!, user: auth.user! });
    } catch (error) {
      return errorResponse(error);
    }
  };
}

/**
 * Creates a cron job route handler
 *
 * Automatically handles:
 * - CRON_SECRET header verification
 * - Error wrapping
 * - Consistent response patterns
 *
 * @param handler - The cron route handler function that receives request and context
 * @returns A route handler function that wraps cron auth and error handling
 *
 * @example
 * ```typescript
 * export const GET = createCronRoute(async (req, context) => {
 *   // Your cron logic here
 *   return successResponse({ processed: 10 });
 * });
 * ```
 */
export function createCronRoute<TParams = {}>(
  handler: PublicHandler<TParams>
) {
  return async (
    request: NextRequest,
    context: RouteContext<TParams>
  ): Promise<NextResponse> => {
    try {
      // Verify CRON_SECRET
      const cronSecret = request.headers.get('x-cron-secret')
      if (!cronSecret || cronSecret !== process.env.CRON_SECRET) {
        return errorResponse(unauthorizedError('Invalid CRON_SECRET'))
      }

      return await handler(request, context)
    } catch (error) {
      return errorResponse(error)
    }
  }
}

/**
 * Utility to extract params from context
 * Reduces boilerplate of `const { id } = await context.params`
 *
 * @param context - The route context containing params
 * @returns The extracted parameters object
 *
 * @example
 * ```typescript
 * const { id } = await extractParams(context);
 * ```
 */
export async function extractParams<T>(
  context: RouteContext<T>
): Promise<T> {
  return await context.params;
}
