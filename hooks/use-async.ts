/**
 * Custom hook for handling async operations with loading, error, and data states
 * Eliminates 20+ duplicated loading state patterns across the codebase
 */

import { useState, useCallback, useEffect } from 'react';

export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface UseAsyncReturn<T> extends AsyncState<T> {
  execute: (asyncFunc: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
}

/**
 * Hook for managing async operations
 *
 * @example
 * const { data, loading, error, execute } = useAsync<Course[]>()
 *
 * const loadCourses = async () => {
 *   await execute(async () => {
 *     const response = await fetch('/api/courses')
 *     return response.json()
 *   })
 * }
 */
export function useAsync<T = unknown>(): UseAsyncReturn<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (asyncFunc: () => Promise<T>): Promise<T | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const data = await asyncFunc();
      setState({ data, loading: false, error: null });
      return data;
    } catch (error: any) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      setState({ data: null, loading: false, error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    execute,
    reset,
    setData,
    setError,
  };
}

/**
 * Hook for managing async operations with automatic execution on mount
 *
 * @param asyncFunc - Async function to execute on mount
 * @param deps - Dependency array for re-execution
 *
 * @example
 * const { data, loading, error } = useAsyncEffect(async () => {
 *   const response = await fetch('/api/courses')
 *   return response.json()
 * }, [])
 */
export function useAsyncEffect<T = unknown>(
  asyncFunc: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    const execute = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const data = await asyncFunc();
        if (!cancelled) {
          setState({ data, loading: false, error: null });
        }
      } catch (error: any) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : 'An error occurred';
          setState({ data: null, loading: false, error: message });
        }
      }
    };

    execute();

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
