/**
 * Simple in-memory cache implementation
 * 
 * Provides a lightweight caching solution using JavaScript Map.
 * For production with multiple servers, consider using Redis or another distributed cache.
 * 
 * Features:
 * - TTL (Time To Live) support
 * - Automatic cleanup of expired entries
 * - Simple get/set/delete operations
 * 
 * @example
 * ```typescript
 * cache.set('key', 'value', 60000) // Cache for 60 seconds
 * const value = cache.get('key')
 * ```
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

/**
 * MemoryCache class
 * 
 * In-memory cache with TTL support and automatic cleanup
 */
class MemoryCache {
  private cache: Map<string, CacheEntry<unknown>>;
  private defaultTTL: number;

  constructor(defaultTTL: number = 300000) { // 5 minutes default
    this.cache = new Map();
    this.defaultTTL = defaultTTL;

    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000);
  }

  /**
   * Set a value in cache with optional TTL
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param ttl - Time to live in milliseconds (optional, uses default if not provided)
   * 
   * @example
   * ```typescript
   * cache.set('user:123', userData, 300000) // Cache for 5 minutes
   * ```
   */
  set<T>(key: string, value: T, ttl?: number): void {
    const expires = Date.now() + (ttl || this.defaultTTL);
    this.cache.set(key, { data: value, expires });
  }

  /**
   * Get a value from cache
   * 
   * Returns null if key doesn't exist or has expired
   * 
   * @param key - Cache key
   * @returns Cached value or null
   * 
   * @example
   * ```typescript
   * const user = cache.get<User>('user:123')
   * if (user) {
   *   console.log(user.name)
   * }
   * ```
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Delete a key from cache
   * 
   * @param key - Cache key to delete
   * @returns True if key was deleted, false if it didn't exist
   * 
   * @example
   * ```typescript
   * cache.delete('user:123')
   * ```
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from cache
   * 
   * @example
   * ```typescript
   * cache.clear()
   * ```
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if a key exists in cache and hasn't expired
   * 
   * @param key - Cache key to check
   * @returns True if key exists and is valid, false otherwise
   * 
   * @example
   * ```typescript
   * if (cache.has('user:123')) {
   *   // Key exists and is valid
   * }
   * ```
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (now > entry.expires) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * 
   * @returns Object containing cache size and all keys
   * 
   * @example
   * ```typescript
   * const stats = cache.getStats()
   * console.log(`Cache has ${stats.size} entries`)
   * ```
   */
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new MemoryCache();

/**
 * Helper function for cache-aside pattern
 * 
 * Checks cache first. If not found, executes fetcher function and caches the result.
 * 
 * @param key - Cache key
 * @param fetcher - Function to execute if cache miss
 * @param ttl - Time to live in milliseconds (optional)
 * @returns Cached or freshly fetched value
 * 
 * @example
 * ```typescript
 * const user = await getCached(
 *   'user:123',
 *   async () => await fetchUserFromDB('123'),
 *   300000 // 5 minutes
 * )
 * ```
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch from source
  const data = await fetcher();

  // Store in cache
  cache.set(key, data, ttl);

  return data;
}

/**
 * Helper for invalidating cache keys matching a pattern
 * 
 * Uses regex pattern matching to find and delete matching keys
 * 
 * @param pattern - Regex pattern string to match cache keys
 * @returns Number of keys deleted
 * 
 * @example
 * ```typescript
 * // Invalidate all user caches
 * const deleted = invalidatePattern('user:.*')
 * console.log(`Deleted ${deleted} cache entries`)
 * ```
 * 
 * @example
 * ```typescript
 * // Invalidate specific course caches
 * invalidatePattern('course:123:.*')
 * ```
 */
export function invalidatePattern(pattern: string): number {
  const stats = cache.getStats();
  const keys = stats.keys;
  let count = 0;

  const regex = new RegExp(pattern);
  for (const key of keys) {
    if (regex.test(key)) {
      cache.delete(key);
      count++;
    }
  }

  return count;
}
