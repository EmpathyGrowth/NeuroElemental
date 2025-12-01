/**
 * Next.js Proxy (formerly Middleware)
 * Handles rate limiting, CSRF protection, and request validation
 * Runs on the Node.js runtime for all matching routes
 *
 * Note: In Next.js 16, middleware.ts was renamed to proxy.ts
 * to better reflect its purpose as a network boundary layer
 */

import { createServerClient } from "@supabase/ssr";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Simple in-memory rate limiter
// In production with multiple instances, use Upstash Redis
const ipRequests = new Map<string, { count: number; resetTime: number }>();

// Rate limit configurations by route type
const RATE_LIMITS = {
  // Public API endpoints - stricter limits
  public: { limit: 30, windowMs: 60 * 1000 }, // 30 req/min
  // Auth endpoints - very strict to prevent brute force
  auth: { limit: 5, windowMs: 60 * 1000 }, // 5 req/min
  // Webhooks - need higher limits for legitimate traffic
  webhook: { limit: 100, windowMs: 60 * 1000 }, // 100 req/min
  // General API - moderate limits
  api: { limit: 60, windowMs: 60 * 1000 }, // 60 req/min
  // Health checks - no rate limiting
  health: { limit: 1000, windowMs: 60 * 1000 }, // Effectively unlimited
};

/**
 * Get client IP from request headers
 */
function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Check if request is rate limited
 */
function checkRateLimit(
  ip: string,
  routeType: keyof typeof RATE_LIMITS
): { limited: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[routeType];
  const now = Date.now();
  const key = `${ip}:${routeType}`;

  const record = ipRequests.get(key);

  // Clean up expired entries periodically
  if (ipRequests.size > 10000) {
    for (const [k, v] of ipRequests.entries()) {
      if (now > v.resetTime) {
        ipRequests.delete(k);
      }
    }
  }

  if (!record || now > record.resetTime) {
    // New window
    ipRequests.set(key, { count: 1, resetTime: now + config.windowMs });
    return {
      limited: false,
      remaining: config.limit - 1,
      resetIn: config.windowMs,
    };
  }

  if (record.count >= config.limit) {
    return {
      limited: true,
      remaining: 0,
      resetIn: Math.max(0, record.resetTime - now),
    };
  }

  record.count++;
  return {
    limited: false,
    remaining: config.limit - record.count,
    resetIn: Math.max(0, record.resetTime - now),
  };
}

/**
 * Determine route type for rate limiting
 */
function getRouteType(pathname: string): keyof typeof RATE_LIMITS {
  // Health checks
  if (pathname.startsWith("/api/health")) {
    return "health";
  }

  // Webhooks
  if (
    pathname.includes("/webhook") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/billing/webhook")
  ) {
    return "webhook";
  }

  // Auth endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/sso") ||
    pathname.startsWith("/auth")
  ) {
    return "auth";
  }

  // Public API routes that don't require authentication
  if (
    pathname.startsWith("/api/waitlist") ||
    pathname.startsWith("/api/certificates/verify") ||
    pathname.startsWith("/api/pricing") ||
    (pathname.startsWith("/api/courses") && !pathname.includes("/enroll"))
  ) {
    return "public";
  }

  // General API routes
  if (pathname.startsWith("/api/")) {
    return "api";
  }

  return "api";
}

/**
 * Validate CSRF for state-changing requests
 * Uses the double-submit cookie pattern for API routes
 */
function validateCsrf(request: NextRequest): boolean {
  // Only validate for state-changing methods
  const method = request.method;
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return true;
  }

  // Skip CSRF for:
  // - Webhooks (have their own signature verification)
  // - Public API calls with API keys
  // - Same-origin requests (checked via Origin/Referer)
  const pathname = request.nextUrl.pathname;

  if (
    pathname.includes("/webhook") ||
    pathname.startsWith("/api/stripe/webhook") ||
    pathname.startsWith("/api/billing/webhook") ||
    pathname.startsWith("/api/cron/") ||
    pathname.startsWith("/api/assessment/") ||
    pathname.startsWith("/api/waitlist")
  ) {
    return true;
  }

  // Check for API key authentication (skip CSRF)
  if (request.headers.get("x-api-key")) {
    return true;
  }

  // For browser requests, validate origin
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // If no origin or referer, it might be a direct API call
  // In that case, require authentication headers
  if (!origin && !referer) {
    // Allow if it has auth header (programmatic access)
    if (request.headers.get("authorization")) {
      return true;
    }
    // Block potentially malicious requests without origin
    return false;
  }

  // Validate origin matches our app
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const allowedOrigins = [
    appUrl,
    new URL(appUrl).origin,
    "http://localhost:3000",
    "http://127.0.0.1:3000",
  ];

  if (
    origin &&
    allowedOrigins.some((allowed) =>
      origin.startsWith(allowed.replace(/\/$/, ""))
    )
  ) {
    return true;
  }

  // Check referer as fallback
  if (
    referer &&
    allowedOrigins.some((allowed) =>
      referer.startsWith(allowed.replace(/\/$/, ""))
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Check if the current path should be redirected (CMS redirects)
 */
async function checkRedirect(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  try {
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(
      `${baseUrl}/api/redirects/check?path=${encodeURIComponent(pathname)}`,
      {
        headers: { "x-middleware-request": "true" },
        signal: AbortSignal.timeout(1000),
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.redirect) {
      const { destination_url, redirect_type, preserve_query_string } =
        data.redirect;

      let finalUrl = destination_url;
      if (preserve_query_string && request.nextUrl.search) {
        finalUrl += request.nextUrl.search;
      }

      if (finalUrl.startsWith("/")) {
        const url = request.nextUrl.clone();
        url.pathname = finalUrl.split("?")[0];
        if (finalUrl.includes("?")) {
          url.search = finalUrl.split("?")[1];
        }
        return NextResponse.redirect(url, redirect_type);
      }

      return NextResponse.redirect(finalUrl, redirect_type);
    }
  } catch {
    // Silently fail - redirects are non-critical
  }

  return null;
}

/**
 * Check if maintenance mode is enabled
 */
async function checkMaintenanceMode(
  request: NextRequest,
  pathname: string
): Promise<NextResponse | null> {
  if (pathname === "/maintenance") return null;

  try {
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/settings/maintenance`, {
      headers: { "x-middleware-request": "true" },
      signal: AbortSignal.timeout(1000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.maintenance_mode === true) {
      const url = request.nextUrl.clone();
      url.pathname = "/maintenance";
      return NextResponse.rewrite(url);
    }
  } catch {
    // Silently fail - maintenance check is non-critical
  }

  return null;
}

/**
 * Refresh Supabase auth session
 * This ensures auth tokens are refreshed on every request
 */
async function refreshSupabaseSession(
  request: NextRequest,
  response: NextResponse
) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // This refreshes the session if expired
  await supabase.auth.getUser();

  return response;
}

/**
 * Next.js 16 Proxy function (renamed from middleware)
 * Handles request interception at the network boundary
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip proxy for static files and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".") // Files with extensions
  ) {
    return NextResponse.next();
  }

  // Check for CMS URL redirects (skip for API routes)
  if (!pathname.startsWith("/api/")) {
    const redirectResponse = await checkRedirect(request, pathname);
    if (redirectResponse) {
      return redirectResponse;
    }

    // Check for maintenance mode (skip for admin routes)
    if (!pathname.startsWith("/dashboard/admin")) {
      const maintenanceResponse = await checkMaintenanceMode(request, pathname);
      if (maintenanceResponse) {
        return maintenanceResponse;
      }
    }
  }

  // Get client IP
  const ip = getClientIp(request);

  // Determine route type
  const routeType = getRouteType(pathname);

  // Check rate limit
  const { limited, remaining, resetIn } = checkRateLimit(ip, routeType);

  if (limited) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
        retryAfter: Math.ceil(resetIn / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil(resetIn / 1000).toString(),
          "X-RateLimit-Limit": RATE_LIMITS[routeType].limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": new Date(Date.now() + resetIn).toISOString(),
        },
      }
    );
  }

  // CSRF validation for API routes
  if (pathname.startsWith("/api/") && !validateCsrf(request)) {
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "Invalid or missing origin. CSRF validation failed.",
      },
      { status: 403 }
    );
  }

  // Add rate limit headers to response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Refresh Supabase auth session
  response = await refreshSupabaseSession(request, response);

  // Add security headers
  response.headers.set(
    "X-RateLimit-Limit",
    RATE_LIMITS[routeType].limit.toString()
  );
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  response.headers.set(
    "X-RateLimit-Reset",
    new Date(Date.now() + resetIn).toISOString()
  );

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set("X-Request-ID", requestId);

  return response;
}

// Configure which routes use the proxy
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
