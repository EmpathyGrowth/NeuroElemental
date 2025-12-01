import { logger } from '@/lib/logging';

/**
 * Exponential backoff retry delays (in milliseconds)
 */
const RETRY_DELAYS = [100, 200, 400, 1000, 2000];

/**
 * Default fetch timeout (30 seconds)
 */
const DEFAULT_TIMEOUT = 30000;

export interface FetchOptions extends RequestInit {
  /**
   * Maximum number of retry attempts for network errors
   * Default: 3
   */
  retries?: number;
  /**
   * Timeout in milliseconds before aborting the request
   * Default: 30000 (30 seconds)
   */
  timeout?: number;
  /**
   * Whether to retry on specific HTTP status codes
   * Default: [408, 429, 500, 502, 503, 504]
   */
  retryOnStatus?: number[];
  /**
   * Custom function to determine if request should be retried
   */
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor() {
    super('Request timed out');
    this.name = 'TimeoutError';
  }
}

/**
 * Check if the browser is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

/**
 * Wait for a specified duration
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fetch with timeout support
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === 'AbortError') {
      throw new TimeoutError();
    }
    throw error;
  }
}

/**
 * Enhanced fetch with retry logic, timeout, and network error handling
 *
 * @param url - The URL to fetch
 * @param options - Fetch options including retry configuration
 * @returns The fetch response
 * @throws {NetworkError} When offline or network error occurs
 * @throws {TimeoutError} When request exceeds timeout
 * @throws {FetchError} When server returns error response
 *
 * @example
 * ```typescript
 * try {
 *   const response = await clientFetch('/api/courses', {
 *     retries: 3,
 *     timeout: 10000,
 *   });
 *   const data = await response.json();
 * } catch (error) {
 *   if (error instanceof NetworkError) {
 *     // Handle offline/network error
 *   } else if (error instanceof TimeoutError) {
 *     // Handle timeout
 *   } else if (error instanceof FetchError) {
 *     // Handle HTTP error
 *   }
 * }
 * ```
 */
export async function clientFetch(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    timeout = DEFAULT_TIMEOUT,
    retryOnStatus = [408, 429, 500, 502, 503, 504],
    shouldRetry,
    ...fetchOptions
  } = options;

  // Check if online before attempting
  if (!isOnline()) {
    throw new NetworkError('No internet connection. Please check your network and try again.');
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, fetchOptions, timeout);

      // Check if we should retry based on status code
      if (!response.ok && attempt < retries) {
        const shouldRetryStatus = retryOnStatus.includes(response.status);
        const shouldRetryCustom = shouldRetry
          ? shouldRetry(new FetchError(response.statusText, response.status, response), attempt)
          : false;

        if (shouldRetryStatus || shouldRetryCustom) {
          const delayMs = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
          logger.info(`Retrying request to ${url} after ${delayMs}ms (attempt ${attempt + 1}/${retries})`);
          await delay(delayMs);
          continue;
        }
      }

      // If response is not OK and we're not retrying, throw error
      if (!response.ok) {
        throw new FetchError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on timeout for final attempt
      if (error instanceof TimeoutError && attempt >= retries) {
        throw error;
      }

      // Check if we should retry network errors
      if (attempt < retries) {
        const isNetworkError =
          error instanceof TypeError ||
          error instanceof NetworkError ||
          error instanceof TimeoutError ||
          (error as Error).message.includes('Failed to fetch') ||
          (error as Error).message.includes('NetworkError');

        if (isNetworkError) {
          // Check if still online
          if (!isOnline()) {
            throw new NetworkError('Lost internet connection. Please check your network.');
          }

          const shouldRetryCustom = shouldRetry ? shouldRetry(error as Error, attempt) : true;

          if (shouldRetryCustom) {
            const delayMs = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
            logger.info(`Network error, retrying ${url} after ${delayMs}ms (attempt ${attempt + 1}/${retries})`);
            await delay(delayMs);
            continue;
          }
        }
      }

      // Don't retry on final attempt
      if (attempt >= retries) {
        throw error;
      }
    }
  }

  // Should never reach here, but throw last error if we do
  throw lastError || new Error('Request failed after retries');
}

/**
 * Convenience wrapper for JSON API calls with automatic parsing
 *
 * @param url - The URL to fetch
 * @param options - Fetch options
 * @returns Parsed JSON response
 *
 * @example
 * ```typescript
 * const data = await clientFetchJson<Course[]>('/api/courses');
 * ```
 */
export async function clientFetchJson<T = unknown>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const response = await clientFetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  return response.json();
}
