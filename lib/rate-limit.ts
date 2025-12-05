import { NextResponse } from 'next/server';

interface RateLimitConfig {
  limit: number;
  windowMs: number;
}

const ipRequests = new Map<string, { count: number; startTime: number }>();

/**
 * Basic in-memory rate limiter.
 * Note: This works per-instance. For distributed environments (Vercel, AWS Lambda),
 * use an external store like Redis/Upstash.
 */
export function rateLimit(ip: string, config: RateLimitConfig = { limit: 100, windowMs: 60 * 1000 }) {
  const now = Date.now();
  const record = ipRequests.get(ip);

  if (!record) {
    ipRequests.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  if (now - record.startTime > config.windowMs) {
    // Reset window
    ipRequests.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  if (record.count >= config.limit) {
    return { success: false };
  }

  record.count++;
  return { success: true };
}

export function withRateLimit(handler: Function, config?: RateLimitConfig) {
  return async (request: Request, ...args: unknown[]) => {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    const { success } = rateLimit(ip, config);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests, please try again later.' },
        { status: 429 }
      );
    }

    return handler(request, ...args);
  };
}
