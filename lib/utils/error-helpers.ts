/**
 * Error handling utilities
 * Centralized error conversion and handling helpers
 */

/**
 * Ensures the value is an Error object
 * Use this when catching unknown errors to safely pass to logger
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logger.error('Operation failed', toError(error));
 * }
 */
export function toError(value: unknown): Error {
  if (value instanceof Error) {
    return value;
  }
  if (typeof value === 'string') {
    return new Error(value);
  }
  return new Error(String(value));
}

/**
 * Extracts error message from unknown error
 * Safe to use with any caught value
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   return { success: false, error: getErrorMessage(error) };
 * }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return String(error);
}

/**
 * Type guard to check if value is an Error
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}

/**
 * Wraps an async function to return {data, error} tuple
 * Use for backward compatibility with legacy code patterns
 *
 * @example
 * const result = await wrapAsync(() => repository.findById(id));
 * if (result.error) return handleError(result.error);
 * return result.data;
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>
): Promise<{ data: T | null; error: Error | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    return { data: null, error: toError(error) };
  }
}

/**
 * Creates a wrapper function that converts exceptions to {data, error} tuples
 * Use for creating backward-compatible exports from repository methods
 *
 * @example
 * const getUser = createLegacyWrapper(userRepository.findById.bind(userRepository));
 * const { data, error } = await getUser(id);
 */
export function createLegacyWrapper<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>
): (...args: TArgs) => Promise<{ data: TResult | null; error: Error | null }> {
  return async (...args: TArgs) => {
    try {
      const data = await fn(...args);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: toError(error) };
    }
  };
}
