/**
 * Server-side logger for API routes
 * Provides structured logging with context and error tracking
 */

import { errorReporter } from '@/lib/monitoring/error-reporter';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface ServerLogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  timestamp: string;
  environment: string;
  requestId?: string;
  userId?: string;
}

class ServerLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLogEntry(entry: ServerLogEntry): string {
    const { level, message, timestamp, context, error } = entry;
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    let output = `${prefix} ${message}`;

    if (context && Object.keys(context).length > 0) {
      output += `\n  Context: ${JSON.stringify(context, null, 2)}`;
    }

    if (error) {
      output += `\n  Error: ${error.name}: ${error.message}`;
      if (error.stack) {
        output += `\n  Stack: ${error.stack}`;
      }
    }

    return output;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error
  ): ServerLogEntry {
    const entry: ServerLogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private log(entry: ServerLogEntry) {
    const formatted = this.formatLogEntry(entry);

    // Always log to console on server (intentional - this IS the logger)
    switch (entry.level) {
      case 'debug':
      case 'info':
        // eslint-disable-next-line no-console
        console.log(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
      case 'fatal':
        console.error(formatted);
        break;
    }

    // In production, send errors to external monitoring service
    if (this.isProduction && (entry.level === 'error' || entry.level === 'fatal')) {
      if (entry.error) {
        const error = new Error(entry.error.message);
        error.name = entry.error.name;
        error.stack = entry.error.stack;
        errorReporter.captureError(error, {
          ...entry.context,
          requestId: entry.requestId,
          userId: entry.userId,
        });
      } else {
        errorReporter.captureMessage(entry.message, 'error', entry.context);
      }
    }
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

  error(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorObj = error instanceof Error ? error : undefined;
    const contextWithError = error instanceof Error ? context : { ...context, error };
    const entry = this.createLogEntry('error', message, contextWithError, errorObj);
    this.log(entry);
  }

  fatal(message: string, error?: Error | unknown, context?: Record<string, unknown>) {
    const errorObj = error instanceof Error ? error : undefined;
    const contextWithError = error instanceof Error ? context : { ...context, error };
    const entry = this.createLogEntry('fatal', message, contextWithError, errorObj);
    this.log(entry);
  }

  // Performance tracking
  async measureAsync<T>(
    name: string,
    fn: () => Promise<T>,
    context?: Record<string, unknown>
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - start;
      this.info(`${name} completed`, { ...context, duration_ms: duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${name} failed`, error, { ...context, duration_ms: duration });
      throw error;
    }
  }
}

// Export singleton instance
export const serverLogger = new ServerLogger();

// Convenience export
export const log = serverLogger;
