/**
 * Cache Utilities Barrel Export
 *
 * Provides caching utilities for the application:
 * - CacheManager: Full-featured cache with Redis + memory fallback
 * - Cache wrappers: Function decorators for easy caching
 * - Cache keys: Standardized key generators
 */

// Cache manager with Redis support
export { cacheManager, cacheKeys } from './cache-manager';

// Function caching wrappers
export {
  memoryCache,
  withMemoryCache,
  withRequestCache,
  withNextCache,
  withDualCache,
  withSWR,
  createDependencyTracker,
  clearAllCaches,
  prewarmCache,
} from './cache-wrapper';
