/**
 * Error Reporter Service
 * Abstraction layer for error tracking services (Sentry, Datadog, etc.)
 *
 * Usage:
 * 1. Install @sentry/nextjs: npm install @sentry/nextjs
 * 2. Initialize in sentry.client.config.ts and sentry.server.config.ts
 * 3. Set NEXT_PUBLIC_SENTRY_DSN environment variable
 */

interface ErrorContext {
  userId?: string;
  organizationId?: string;
  requestId?: string;
  route?: string;
  [key: string]: unknown;
}

interface ErrorReporterConfig {
  dsn?: string;
  environment?: string;
  enabled?: boolean;
}

/**
 * Sentry interface for type safety without requiring package installation
 */
interface SentryLike {
  captureException(error: Error, options?: {
    extra?: Record<string, unknown>;
    tags?: Record<string, string | undefined>;
    user?: { id: string } | undefined;
  }): string;
  captureMessage(message: string, options?: {
    level?: string;
    extra?: Record<string, unknown>;
    tags?: Record<string, string | undefined>;
  }): string;
  setUser(user: { id: string; email?: string; username?: string } | null): void;
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, unknown>;
    timestamp?: number;
  }): void;
}

/**
 * Check if Sentry is available (loaded dynamically)
 */
function getSentry(): SentryLike | null {
  try {
    // Dynamic import check - Sentry must be installed and configured
     
    const Sentry = require('@sentry/nextjs') as SentryLike;
    return Sentry;
  } catch {
    return null;
  }
}

class ErrorReporter {
  private config: ErrorReporterConfig;
  private sentry: ReturnType<typeof getSentry>;

  constructor() {
    this.config = {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      enabled: process.env.NODE_ENV === 'production',
    };
    this.sentry = getSentry();
  }

  /**
   * Check if error reporting is available
   */
  isAvailable(): boolean {
    return this.config.enabled === true && this.sentry !== null && !!this.config.dsn;
  }

  /**
   * Report an error to the monitoring service
   */
  captureError(error: Error, context?: ErrorContext): string | null {
    // Always log locally
    console.error('[ErrorReporter]', error.message, context || '');

    if (!this.isAvailable() || !this.sentry) {
      return null;
    }

    try {
      const eventId = this.sentry.captureException(error, {
        extra: context,
        tags: {
          environment: this.config.environment,
          ...(context?.route && { route: context.route }),
        },
        user: context?.userId ? { id: context.userId } : undefined,
      });
      return eventId;
    } catch (reportError) {
      // Fallback logging if Sentry fails
      console.warn('[ErrorReporter] Failed to report error to monitoring service', {
        originalError: error.message,
        reportError: reportError instanceof Error ? reportError.message : String(reportError),
      });
      return null;
    }
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext): string | null {
    if (!this.isAvailable() || !this.sentry) {
      return null;
    }

    try {
      const eventId = this.sentry.captureMessage(message, {
        level,
        extra: context,
        tags: {
          environment: this.config.environment,
        },
      });
      return eventId;
    } catch {
      return null;
    }
  }

  /**
   * Set user context for subsequent error reports
   */
  setUser(user: { id: string; email?: string; username?: string } | null): void {
    if (!this.isAvailable() || !this.sentry) {
      return;
    }

    this.sentry.setUser(user);
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: 'debug' | 'info' | 'warning' | 'error';
    data?: Record<string, unknown>;
  }): void {
    if (!this.isAvailable() || !this.sentry) {
      return;
    }

    this.sentry.addBreadcrumb({
      message: breadcrumb.message,
      category: breadcrumb.category || 'app',
      level: breadcrumb.level || 'info',
      data: breadcrumb.data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Wrap an async function with error reporting
   */
  async withErrorReporting<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof Error) {
        this.captureError(error, context);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const errorReporter = new ErrorReporter();

/**
 * Helper function to report errors
 */
export function reportError(error: Error, context?: ErrorContext): string | null {
  return errorReporter.captureError(error, context);
}

/**
 * Helper to wrap API handlers with error reporting
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  handler: T,
  routeName: string
): T {
  return (async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof Error) {
        errorReporter.captureError(error, { route: routeName });
      }
      throw error;
    }
  }) as T;
}
