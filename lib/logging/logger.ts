import { createClient } from '@/lib/supabase/client';

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

class Logger {
  private supabase = createClient();
  private queue: LogEntry[] = [];
  private batchSize = 10;
  private flushInterval = 5000; // 5 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    // Start batch processing
    this.startBatchProcessing();

    // Flush on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.flush();
      });
    }
  }

  private startBatchProcessing() {
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private async flush() {
    if (this.queue.length === 0) return;

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
      await this.supabase
        .from('logs')
         
        .insert(dbBatch as any);

      // Also send critical errors to external service (e.g., Sentry)
      const criticalErrors = batch.filter(log => log.level === 'error' || log.level === 'fatal');
      if (criticalErrors.length > 0 && typeof window !== 'undefined') {
        // Send to external monitoring service
        this.sendToMonitoring(criticalErrors);
      }
    } catch (error) {
      // Fallback to console if database fails - intentional use of console for last-resort logging
      // when the logging system itself has failed
      if (process.env.NODE_ENV === 'development') {
        const err = error instanceof Error ? error : new Error(String(error));
         
        console.error('[Logger] Failed to send logs to database:', err.message);
        batch.forEach(log => this.consoleLog(log));
      }
    }
  }

  private sendToMonitoring(logs: LogEntry[]) {
    // Integration with external monitoring service
    // e.g., Sentry, LogRocket, etc.
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

  private consoleLog(entry: LogEntry) {
    const _style = this.getConsoleStyle(entry.level);
    const _prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;

    if (entry.context) {
    }
    if (entry.stack) {
    }
  }

  private getConsoleStyle(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #gray';
      case 'info':
        return 'color: #blue';
      case 'warn':
        return 'color: #orange; font-weight: bold';
      case 'error':
        return 'color: #red; font-weight: bold';
      case 'fatal':
        return 'color: #darkred; font-weight: bold; font-size: 1.2em';
      default:
        return '';
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

    // Add error details
    if (error) {
      const serializedError: SerializedError = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
      entry.error = serializedError as unknown as Error;
      entry.stack = error.stack;
    }

    // Add browser info
    if (typeof window !== 'undefined') {
      entry.browser = navigator.userAgent;
      entry.url = window.location.href;
    }

    // Add user info if available
    this.addUserContext(entry);

    return entry;
  }

  private async addUserContext(entry: LogEntry) {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      if (user) {
        entry.user_id = user.id;
      }

      // Add session ID from localStorage or sessionStorage
      if (typeof window !== 'undefined') {
        entry.session_id = sessionStorage.getItem('session_id') || undefined;
      }
    } catch (_error) {
      // Ignore errors getting user context
    }
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
    // Immediately flush fatal errors
    this.flush();
    return entry.id || '';
  }

  private log(entry: LogEntry) {
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      this.consoleLog(entry);
    }

    // Add to queue for batch processing
    this.queue.push(entry);

    // Flush if queue is full
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  // Performance monitoring
  measurePerformance<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.info(`Performance: ${name}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Performance error: ${name}`, error instanceof Error ? error : new Error(String(error)), { duration: `${duration}ms` });
      throw error;
    }
  }

  async measureAsyncPerformance<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.info(`Async Performance: ${name}`, { duration: `${duration}ms` });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`Async Performance error: ${name}`, error instanceof Error ? error : new Error(String(error)), { duration: `${duration}ms` });
      throw error;
    }
  }

  // Clean up
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


