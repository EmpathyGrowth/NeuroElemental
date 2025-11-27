/**
 * Cache Wrapper Utility
 *
 * Generic caching utilities for memoizing expensive operations.
 * Provides both in-memory and React-compatible caching strategies.
 */

import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { logger } from '@/lib/logging';

/**
 * In-memory cache store with TTL support
 */
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(cleanupIntervalMs: number = 60000) {
    // Run cleanup every minute by default
    if (typeof window === 'undefined') {
      // Only run cleanup on server
      this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
    }
  }

  /**
   * Get a value from cache
   */
  get<T>(key: string): T | undefined {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * Set a value in cache with TTL
   */
  set<T>(key: string, value: T, ttlMs: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Delete a value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Delete entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): number {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    let deleted = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.debug(`Cache cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Stop the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get cache statistics
   */
  stats(): { size: number; entries: { key: string; expiresIn: number }[] } {
    const now = Date.now();
    const entries: { key: string; expiresIn: number }[] = [];

    for (const [key, entry] of this.cache.entries()) {
      entries.push({
        key,
        expiresIn: Math.max(0, entry.expiresAt - now),
      });
    }

    return {
      size: this.cache.size,
      entries,
    };
  }
}

/**
 * Global memory cache instance
 */
export const memoryCache = new MemoryCache();

/**
 * Cache options for wrapper functions
 */
interface CacheOptions {
  /** Time to live in seconds */
  ttl?: number;
  /** Cache key prefix */
  keyPrefix?: string;
  /** Tags for cache invalidation (Next.js only) */
  tags?: string[];
  /** Whether to log cache hits/misses */
  debug?: boolean;
}

/**
 * Generate a cache key from function arguments
 */
function generateCacheKey(prefix: string, args: unknown[]): string {
  const argsHash = args
    .map((arg) => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') return JSON.stringify(arg);
      return String(arg);
    })
    .join(':');

  return `${prefix}:${argsHash}`;
}

/**
 * Wrap a function with in-memory caching
 *
 * @example
 * ```typescript
 * const getCachedUser = withMemoryCache(
 *   async (userId: string) => {
 *     return await userRepository.findById(userId);
 *   },
 *   { ttl: 60, keyPrefix: 'user' }
 * );
 *
 * const user = await getCachedUser('user-123');
 * ```
 */
export function withMemoryCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  const { ttl = 60, keyPrefix = 'cache', debug = false } = options;
  const ttlMs = ttl * 1000;

  return async (...args: TArgs): Promise<TReturn> => {
    const key = generateCacheKey(keyPrefix, args);
    const cached = memoryCache.get<TReturn>(key);

    if (cached !== undefined) {
      if (debug) {
        logger.debug(`Cache HIT: ${key}`);
      }
      return cached;
    }

    if (debug) {
      logger.debug(`Cache MISS: ${key}`);
    }

    const result = await fn(...args);
    memoryCache.set(key, result, ttlMs);

    return result;
  };
}

/**
 * Wrap a function with React's cache() for request-level deduplication
 * This ensures the function is only called once per request, regardless of how many times it's invoked
 *
 * @example
 * ```typescript
 * const getCurrentUser = withRequestCache(async () => {
 *   const session = await getSession();
 *   return session?.user;
 * });
 * ```
 */
export function withRequestCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>
): (...args: TArgs) => Promise<TReturn> {
  return cache(fn);
}

/**
 * Wrap a function with Next.js unstable_cache for server-side caching
 * This cache persists across requests and can be invalidated by tags
 *
 * @example
 * ```typescript
 * const getCachedCourses = withNextCache(
 *   async (category: string) => {
 *     return await courseRepository.findAll({ category });
 *   },
 *   { ttl: 3600, keyPrefix: 'courses', tags: ['courses'] }
 * );
 * ```
 */
export function withNextCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  const { ttl = 60, keyPrefix = 'cache', tags = [] } = options;

  return unstable_cache(fn, [keyPrefix], {
    revalidate: ttl,
    tags,
  });
}

/**
 * Combine request-level and persistent caching
 *
 * @example
 * ```typescript
 * const getOptimizedCourses = withDualCache(
 *   async (filters: CourseFilters) => {
 *     return await courseRepository.findAll(filters);
 *   },
 *   { ttl: 3600, keyPrefix: 'courses', tags: ['courses'] }
 * );
 * ```
 */
export function withDualCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions = {}
): (...args: TArgs) => Promise<TReturn> {
  // First apply Next.js cache for persistence
  const nextCached = withNextCache(fn, options);
  // Then apply React cache for request deduplication
  return withRequestCache(nextCached);
}

/**
 * Stale-while-revalidate caching pattern
 * Returns stale data immediately while fetching fresh data in the background
 *
 * @example
 * ```typescript
 * const getSwrUser = withSWR(
 *   async (userId: string) => await userRepository.findById(userId),
 *   { ttl: 60, staleTime: 300, keyPrefix: 'user' }
 * );
 * ```
 */
export function withSWR<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions & { staleTime?: number } = {}
): (...args: TArgs) => Promise<TReturn> {
  const { ttl = 60, staleTime = 300, keyPrefix = 'swr', debug = false } = options;
  const ttlMs = ttl * 1000;
  const staleMs = staleTime * 1000;

  // Track ongoing revalidation to prevent duplicate fetches
  const revalidating = new Set<string>();

  return async (...args: TArgs): Promise<TReturn> => {
    const key = generateCacheKey(keyPrefix, args);
    const cached = memoryCache.get<{ value: TReturn; fetchedAt: number }>(key);
    const now = Date.now();

    // If we have cached data
    if (cached !== undefined) {
      const age = now - cached.fetchedAt;

      // Fresh data - return immediately
      if (age < ttlMs) {
        if (debug) logger.debug(`SWR fresh: ${key}`);
        return cached.value;
      }

      // Stale data - return but trigger background revalidation
      if (age < staleMs) {
        if (debug) logger.debug(`SWR stale, revalidating: ${key}`);

        // Revalidate in background if not already doing so
        if (!revalidating.has(key)) {
          revalidating.add(key);
          fn(...args)
            .then((result) => {
              memoryCache.set(key, { value: result, fetchedAt: Date.now() }, staleMs);
            })
            .catch((error) => {
              logger.error(`SWR revalidation failed: ${key}`, error);
            })
            .finally(() => {
              revalidating.delete(key);
            });
        }

        return cached.value;
      }
    }

    // No cache or expired - fetch fresh data
    if (debug) logger.debug(`SWR miss: ${key}`);
    const result = await fn(...args);
    memoryCache.set(key, { value: result, fetchedAt: now }, staleMs);

    return result;
  };
}

/**
 * Memoize a function with automatic cache invalidation based on dependency keys
 *
 * @example
 * ```typescript
 * const deps = createDependencyTracker();
 *
 * const getUserCourses = memoizeWithDeps(
 *   async (userId: string) => await courseRepository.findByUser(userId),
 *   (userId) => [`user:${userId}:courses`]
 * );
 *
 * // Invalidate when user enrolls in a course
 * deps.invalidate(`user:${userId}:courses`);
 * ```
 */
export function createDependencyTracker() {
  const versions = new Map<string, number>();

  return {
    getVersion(key: string): number {
      return versions.get(key) || 0;
    },

    invalidate(key: string): void {
      versions.set(key, (versions.get(key) || 0) + 1);
    },

    invalidatePattern(pattern: string | RegExp): void {
      const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
      for (const key of versions.keys()) {
        if (regex.test(key)) {
          versions.set(key, (versions.get(key) || 0) + 1);
        }
      }
    },
  };
}

/**
 * Clear all caches - useful for testing or cache invalidation
 */
export function clearAllCaches(): void {
  memoryCache.clear();
  logger.info('All caches cleared');
}

/**
 * Pre-warm a cache by calling a function with specified arguments
 *
 * @example
 * ```typescript
 * await prewarmCache(
 *   getCachedCategories,
 *   [['news', 'tech', 'sports']] // array of argument arrays
 * );
 * ```
 */
export async function prewarmCache<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  argsList: TArgs[]
): Promise<void> {
  await Promise.all(argsList.map((args) => fn(...args)));
  logger.debug(`Prewarmed cache with ${argsList.length} entries`);
}
