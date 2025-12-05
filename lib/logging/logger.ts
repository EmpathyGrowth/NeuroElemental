export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogEntry {
  id?: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
  stack?: string;
  user_id?: string;
  session_id?: string;
  request_id?: string;
  timestamp: string;
  environment: string;
  browser?: string;
  url?: string;
}

/** Serialized error for storage */
interface SerializedError {
  name: string;
  message: string;
  stack?: string;
}

/** Window with Sentry */
interface WindowWithSentry extends Window {
  Sentry?: {
    captureException(error: Error, options: { level: string; extra?: Record<string, unknown> }): void;
  };
}

/**
 * Server-safe Logger
 * Only initializes browser-specific features when running in browser context
 */
class Logger {
  private supabase: ReturnType<typeof import('@/lib/supabase/client').createClient> | null = null;
  private queue: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private timer: ReturnType<typeof setInterval> | null = null;
  private isServer = typeof window === 'undefined';

  constructor() {
    // Only initialize browser features on client side
    if (!this.isServer) {
      this.initBrowserFeatures();
    }
  }

  private async initBrowserFeatures() {
    // Lazy load browser client only on client side
    try {
      const { createClient } = await import('@/lib/supabase/client');
      this.supabase = createClient();
    } catch {
      // Ignore - logging will fall back to console
    }


    // Start batch processing
    this.startBatchProcessing();

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private startBatchProcessing() {
    if (this.isServer) return;
    
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.queue.length === 0 || this.isServer || !this.supabase) return;

    const batch = this.queue.splice(0, this.batchSize);

    try {
      // Send to Supabase - transform LogEntry to match DB schema
      const dbBatch = batch.map(entry => ({
        level: entry.level,
        message: entry.message,
        timestamp: entry.timestamp,
        user_id: entry.user_id ?? null,
        context: (entry.context ?? null) as unknown,
        error: entry.error ? { name: entry.error.name, message: entry.error.message, stack: entry.stack } as unknown : null,
        stack: entry.stack ?? null,
        session_id: entry.session_id ?? null,
        browser: entry.browser ?? null,
        url: entry.url ?? null,
        environment: entry.environment ?? 'development',
      }));
      
      await (this.supabase as any)
        .from('logs')
        .insert(dbBatch);

      // Also send critical errors to external service (e.g., Sentry)
      const criticalErrors = batch.filter(log => log.level === 'error' || log.level === 'fatal');
      if (criticalErrors.length > 0) {
        this.sendToMonitoring(criticalErrors);
      }
    } catch (error) {
      // Fallback to console if database fails
      if (process.env.NODE_ENV === 'development') {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('[Logger] Failed to send logs to database:', err.message);
      }
    }
  }

  private sendToMonitoring(logs: LogEntry[]) {
    if (this.isServer) return;
    
    const windowWithSentry = window as unknown as WindowWithSentry;
    if (windowWithSentry.Sentry) {
      logs.forEach(log => {
        windowWithSentry.Sentry?.captureException(log.error || new Error(log.message), {
          level: log.level,
          extra: log.context,
        });
      });
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case 'debug': return 'color: gray';
      case 'info': return 'color: blue';
      case 'warn': return 'color: orange; font-weight: bold';
      case 'error': return 'color: red; font-weight: bold';
      case 'fatal': return 'color: darkred; font-weight: bold';
      default: return '';
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      id: this.generateId(),
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    if (error) {
      const serializedError: SerializedError = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      entry.error = serializedError as unknown as Error;
      entry.stack = error.stack;
    }

    // Add browser info only on client
    if (!this.isServer) {
      entry.browser = navigator.userAgent;
      entry.url = window.location.href;
    }

    return entry;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  debug(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('debug', message, context);
    this.log(entry);
  }

  info(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('info', message, context);
    this.log(entry);
  }

  warn(message: string, context?: Record<string, unknown>) {
    const entry = this.createLogEntry('warn', message, context);
    this.log(entry);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): string {
    const entry = this.createLogEntry('error', message, context, error);
    this.log(entry);
    return entry.id || '';
  }

  fatal(message: string, error?: Error, context?: Record<string, unknown>): string {
    const entry = this.createLogEntry('fatal', message, context, error);
    this.log(entry);
    this.flush();
    return entry.id || '';
  }

  private log(entry: LogEntry) {
    // On server, just use console (intentional - this IS the logger)
    if (this.isServer) {
      const prefix = `[${entry.level.toUpperCase()}]`;
      if (entry.level === 'error' || entry.level === 'fatal') {
        console.error(prefix, entry.message, entry.context || '');
      } else if (entry.level === 'warn') {
        console.warn(prefix, entry.message, entry.context || '');
      } else {
        // eslint-disable-next-line no-console
        console.log(prefix, entry.message, entry.context || '');
      }
      return;
    }

    // On client, queue for batch processing
    this.queue.push(entry);
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  destroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.flush();
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper function for error logging
export function logError(error: Error, context?: Record<string, unknown>): string {
  return logger.error(error.message, error, context);
}
