import { Redis } from 'ioredis';
import { LRUCache } from 'lru-cache';
import { logger } from '@/lib/logging';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  namespace?: string;
  compress?: boolean;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
  compressed?: boolean;
}

/**
 * CacheManager class
 * 
 * Provides a unified caching interface with automatic fallback from Redis to in-memory cache.
 * Uses LRU (Least Recently Used) eviction strategy for memory cache.
 * 
 * Features:
 * - Dual-layer caching (Redis + Memory)
 * - Automatic fallback to memory cache if Redis is unavailable
 * - TTL (Time To Live) support
 * - Namespace support for organized cache invalidation
 * - Pattern-based invalidation
 * - Cache statistics
 * 
 * @example
 * ```typescript
 * // Get cached value or fetch from source
 * const data = await cacheManager.memoize(
 *   'user:123',
 *   async () => await fetchUser('123'),
 *   { ttl: 300, namespace: 'users' }
 * )
 * ```
 */
 
type CacheValue = any;

class CacheManager {
  private redis?: Redis;
  private memoryCache: LRUCache<string, CacheValue>;
  private isRedisAvailable = false;

  constructor() {
    // Initialize in-memory LRU cache
    this.memoryCache = new LRUCache<string, CacheValue>({
      max: 500, // Maximum number of items
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 1000 * 60 * 5, // 5 minutes default TTL
      sizeCalculation: (value) => {
        // Rough size estimation
        return JSON.stringify(value).length;
      },
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });

    // Initialize Redis if available
    this.initRedis();
  }

  private async initRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = new Redis(process.env.REDIS_URL, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => {
            if (times > 3) {
              logger.error('Redis connection failed, falling back to memory cache');
              this.isRedisAvailable = false;
              return null;
            }
            return Math.min(times * 50, 2000);
          },
        });

        this.redis.on('connect', () => {
          logger.info('Redis cache connected');
          this.isRedisAvailable = true;
        });

        this.redis.on('error', (err) => {
          logger.error('Redis cache error:', err as Error);
          this.isRedisAvailable = false;
        });

        // Test connection
        await this.redis.ping();
        this.isRedisAvailable = true;
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Redis initialization failed:', err as Error);
      this.isRedisAvailable = false;
    }
  }

  private generateKey(key: string, namespace?: string): string {
    return namespace ? `${namespace}:${key}` : key;
  }

  /**
   * Get a value from cache
   * 
   * Checks memory cache first, then Redis if available
   * 
   * @param key - Cache key
   * @param options - Cache options (namespace, etc.)
   * @returns Cached value or null if not found/expired
   * 
   * @example
   * ```typescript
   * const user = await cacheManager.get<User>('user:123', { namespace: 'users' })
   * if (user) {
   *   return user
   * }
   * ```
   */
  async get<T>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const fullKey = this.generateKey(key, options.namespace);

    // Try memory cache first
    const memoryValue = this.memoryCache.get(fullKey);
    if (memoryValue !== undefined) {
      return memoryValue as T;
    }

    // Try Redis if available
    if (this.isRedisAvailable && this.redis) {
      try {
        const redisValue = await this.redis.get(fullKey);
        if (redisValue) {
          const entry: CacheEntry<T> = JSON.parse(redisValue);

          // Check if expired
          if (entry.expiresAt > Date.now()) {
            // Store in memory cache for faster access
            this.memoryCache.set(fullKey, entry.data, {
              ttl: entry.expiresAt - Date.now()
            });
            return entry.data;
          } else {
            // Clean up expired entry
            await this.redis.del(fullKey);
          }
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Redis get error:', err as Error);
      }
    }

    return null;
  }

  /**
   * Set a value in cache
   * 
   * Stores in both memory cache and Redis (if available)
   * 
   * @param key - Cache key
   * @param value - Value to cache
   * @param options - Cache options (ttl, namespace, compress)
   * 
   * @example
   * ```typescript
   * await cacheManager.set('user:123', userData, {
   *   ttl: 300, // 5 minutes
   *   namespace: 'users'
   * })
   * ```
   */
  async set<T>(
    key: string,
    value: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const fullKey = this.generateKey(key, options.namespace);
    const ttl = options.ttl || 300; // Default 5 minutes
    const expiresAt = Date.now() + (ttl * 1000);

    // Store in memory cache
    this.memoryCache.set(fullKey, value, {
      ttl: ttl * 1000
    });

    // Store in Redis if available
    if (this.isRedisAvailable && this.redis) {
      try {
        const entry: CacheEntry<T> = {
          data: value,
          expiresAt,
          compressed: options.compress
        };

        await this.redis.set(fullKey, JSON.stringify(entry), 'EX', ttl);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Redis set error:', err as Error);
      }
    }
  }

  /**
   * Delete a specific key from cache
   * 
   * @param key - Cache key to delete
   * @param namespace - Optional namespace
   * 
   * @example
   * ```typescript
   * await cacheManager.delete('user:123', 'users')
   * ```
   */
  async delete(key: string, namespace?: string): Promise<void> {
    const fullKey = this.generateKey(key, namespace);

    // Delete from memory cache
    this.memoryCache.delete(fullKey);

    // Delete from Redis if available
    if (this.isRedisAvailable && this.redis) {
      try {
        await this.redis.del(fullKey);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Redis delete error:', err as Error);
      }
    }
  }

  /**
   * Clear cache entries
   * 
   * If namespace is provided, clears only entries in that namespace.
   * Otherwise, clears all cache entries.
   * 
   * @param namespace - Optional namespace to clear (clears all if omitted)
   * 
   * @example
   * ```typescript
   * // Clear specific namespace
   * await cacheManager.clear('users')
   * 
   * // Clear all cache
   * await cacheManager.clear()
   * ```
   */
  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      // Clear specific namespace
      const pattern = `${namespace}:*`;

      // Clear from memory cache
      for (const key of Array.from(this.memoryCache.keys())) {
        if (key.startsWith(`${namespace}:`)) {
          this.memoryCache.delete(key);
        }
      }

      // Clear from Redis if available
      if (this.isRedisAvailable && this.redis) {
        try {
          const keys = await this.redis.keys(pattern);
          if (keys.length > 0) {
            await this.redis.del(...keys);
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error('Redis clear error:', err as Error);
        }
      }
    } else {
      // Clear all
      this.memoryCache.clear();

      if (this.isRedisAvailable && this.redis) {
        try {
          await this.redis.flushdb();
        } catch (error) {
          logger.error('Redis flush error:', error as Error);
        }
      }
    }
  }

  /**
   * Memoization helper - cache-aside pattern
   * 
   * Checks cache first. If not found, executes the function and caches the result.
   * 
   * @param key - Cache key
   * @param fn - Function to execute if cache miss
   * @param options - Cache options (ttl, namespace)
   * @returns Cached or freshly computed value
   * 
   * @example
   * ```typescript
   * const courses = await cacheManager.memoize(
   *   'courses:published',
   *   async () => await courseRepository.getPublishedCourses(),
   *   { ttl: 300, namespace: 'courses' }
   * )
   * ```
   */
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  /**
   * Invalidate cache entries matching a pattern
   * 
   * Uses regex pattern matching to find and delete matching keys
   * 
   * @param pattern - Regex pattern to match cache keys
   * 
   * @example
   * ```typescript
   * // Invalidate all user-related caches
   * await cacheManager.invalidatePattern('user:.*')
   * 
   * // Invalidate specific course caches
   * await cacheManager.invalidatePattern('course:123:.*')
   * ```
   */
  async invalidatePattern(pattern: string): Promise<void> {
    // Invalidate memory cache
    for (const key of Array.from(this.memoryCache.keys())) {
      if (key.match(pattern)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate Redis cache
    if (this.isRedisAvailable && this.redis) {
      try {
        const keys = await this.redis.keys(pattern);
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error('Redis pattern invalidation error:', err as Error);
      }
    }
  }

  /**
   * Get cache statistics
   * 
   * Returns information about memory cache size and Redis availability
   * 
   * @returns Object containing cache statistics
   * 
   * @example
   * ```typescript
   * const stats = cacheManager.getStats()
   * console.log(`Cache size: ${stats.memory.size}`)
   * console.log(`Redis available: ${stats.redis.available}`)
   * ```
   */
  getStats() {
    // LRUCache doesn't expose hits/misses directly, so we track size only
    return {
      memory: {
        size: this.memoryCache.size,
        calculatedSize: this.memoryCache.calculatedSize,
        maxSize: this.memoryCache.maxSize,
      },
      redis: {
        available: this.isRedisAvailable,
        connected: this.redis?.status === 'ready'
      }
    };
  }
}

// Export singleton instance
export const cacheManager = new CacheManager();

/**
 * Cache key generators for consistent naming across the application.
 * 
 * Key Naming Patterns:
 * - Use colons (:) to separate namespace levels
 * - Start with entity type (user, course, event, etc.)
 * - Include identifiers and filters as needed
 * - Keep keys descriptive but concise
 * 
 * Examples:
 * - Single entity: `user:profile:${userId}`
 * - List with filter: `courses:category:${category}`
 * - Paginated data: `${table}:page:${page}:size:${pageSize}`
 * - Aggregated data: `count:${table}:${filters}`
 */
export const cacheKeys = {
  // User-related keys
  userProfile: (userId: string) => `user:profile:${userId}`,
  userDashboard: (userId: string) => `user:dashboard:${userId}`,
  userEnrollments: (userId: string) => `user:enrollments:${userId}`,
  userOrganizations: (userId: string) => `user:organizations:${userId}`,

  // Course-related keys
  course: (courseId: string) => `course:${courseId}`,
  courseList: (category?: string) => category ? `courses:category:${category}` : 'courses:all',
  courseProgress: (userId: string, courseId: string) => `progress:${userId}:${courseId}`,
  courseEnrollments: (courseId: string) => `course:${courseId}:enrollments`,

  // Session-related keys
  sessionAvailability: (instructorId: string, date: string) => `availability:${instructorId}:${date}`,
  upcomingSessions: (userId: string) => `sessions:upcoming:${userId}`,

  // Analytics keys
  analytics: (type: string, period: string) => `analytics:${type}:${period}`,
  platformStats: () => 'platform:stats',

  // Resources keys
  resources: (category?: string) => category ? `resources:category:${category}` : 'resources:all',
  resource: (resourceId: string) => `resource:${resourceId}`,

  // Events keys
  eventList: () => 'events:all',
  event: (eventId: string) => `event:${eventId}`,

  // Blog keys
  blogPosts: () => 'blog:posts:all',
  blogPost: (postId: string) => `blog:post:${postId}`,
  blogPostBySlug: (slug: string) => `blog:post:slug:${slug}`,

  // Organization keys
  organization: (orgId: string) => `organization:${orgId}`,
  organizationMembers: (orgId: string) => `organization:${orgId}:members`,
  organizationCourses: (orgId: string) => `organization:${orgId}:courses`,

  // Generic pagination key
  paginatedList: (table: string, page: number, pageSize: number, filters?: Record<string, any>) => {
    const filterStr = filters ? `:${JSON.stringify(filters)}` : '';
    return `${table}:page:${page}:size:${pageSize}${filterStr}`;
  },

  // Generic entity key
  entity: (table: string, id: string) => `${table}:${id}`,

  // Count queries
  count: (table: string, filters?: Record<string, any>) => {
    const filterStr = filters ? `:${JSON.stringify(filters)}` : '';
    return `count:${table}${filterStr}`;
  },

  // Aggregation queries
  aggregate: (table: string, aggregations: any, filters?: Record<string, any>, groupBy?: string[]) => {
    return `aggregate:${table}:${JSON.stringify({ aggregations, filters, groupBy })}`;
  },

  // Batch fetch key
  batchEntity: (table: string, ids: string[]) => `${table}:batch:${ids.sort().join(',')}`,
};
