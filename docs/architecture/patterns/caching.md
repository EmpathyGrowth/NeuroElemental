# Caching Pattern Guide

**Last Updated**: 2025-11-25
**Pattern Type**: Performance Optimization
**Status**: ✅ Active

## Overview

The Caching Pattern provides a dual-layer caching strategy (memory + Redis) for frequently accessed data. All caching uses `cacheManager` with standardized key helpers and TTL values.

### Benefits
- **Performance**: Reduced database queries and API calls
- **Scalability**: Handles increased load efficiently
- **Consistency**: Standardized cache keys and TTLs
- **Reliability**: Automatic fallback if cache fails
- **Observability**: Cache hit/miss metrics

---

## Core Concepts

### CacheManager

Centralized caching interface:

```typescript
import { cacheManager } from '@/lib/cache/cache-manager';

// Memoize (cache function result)
const data = await cacheManager.memoize(
  'cache-key',
  async () => await fetchData(),
  { ttl: 300, namespace: 'users' }
);

// Direct cache operations
await cacheManager.set('key', value, ttl);
const value = await cacheManager.get('key');
await cacheManager.delete('key');
await cache Manager.clear({ namespace: 'users' });
```

### Cache Key Helpers

Standardized key generation:

```typescript
import { cacheKeys } from '@/lib/cache/cache-manager';

// User keys
cacheKeys.user(userId)                    // "user:123"
cacheKeys.userProfile(userId)             // "user:123:profile"

// Course keys
cacheKeys.course(courseId)                // "course:456"
cacheKeys.courseList(filters)             // "courses:list:published:true"

// Organization keys
cacheKeys.organization(orgId)             // "org:789"
cacheKeys.organizationMembers(orgId)      // "org:789:members"

// Generic helpers
cacheKeys.list(entity, filters)           // Dynamic list key
cacheKeys.detail(entity, id)              // Dynamic detail key
cacheKeys.pagination(entity, page, limit) // Pagination key
```

---

## TTL Standards

Standardized time-to-live values:

```typescript
// lib/cache/cache-manager.ts
export const TTL = {
  SHORT: 60,        // 1 minute  - Frequently changing data
  MEDIUM: 300,      // 5 minutes - Semi-static data
  LONG: 3600,       // 1 hour    - Static content
  DAY: 86400        // 24 hours  - Rarely changing data
} as const;

// Usage
import { TTL } from '@/lib/cache/cache-manager';

await cacheManager.set('key', value, TTL.MEDIUM);
```

### TTL Guidelines

| Data Type | TTL | Example |
|-----------|-----|---------|
| User session | 2 min | User profile, preferences |
| Public content | 5 min | Course list, blog posts |
| Static content | 1 hour | Site configuration, constants |
| Analytics | 10 min | Dashboard stats, metrics |
| Search results | 5 min | Search queries |

---

## Usage Examples

### Basic Caching

```typescript
import { cacheManager, cacheKeys, TTL } from '@/lib/cache/cache-manager';
import { courseRepository } from '@/lib/db/courses';

export const GET = createPublicRoute(async (req) => {
  const courses = await cacheManager.memoize(
    cacheKeys.courseList({ published: true }),
    async () => await courseRepository.getPublishedCourses(),
    { ttl: TTL.MEDIUM, namespace: 'courses' }
  );

  return successResponse(courses);
});
```

### With Parameters

```typescript
export const GET = createPublicRoute(async (req, { params }) => {
  const course = await cacheManager.memoize(
    cacheKeys.course(params.id),
    async () => await courseRepository.findById(params.id),
    { ttl: TTL.MEDIUM, namespace: 'courses' }
  );

  return successResponse(course);
});
```

### Cache Invalidation

```typescript
export const PUT = createAuthenticatedRoute(async (req, { params }) => {
  const data = await validateRequest(req, updateCourseSchema);

  // Update course
  const course = await courseRepository.update(params.id, data);

  // Invalidate caches
  await cacheManager.delete(cacheKeys.course(params.id));
  await cacheManager.clear({ namespace: 'courses' }); // Clear all course caches

  return successResponse(course);
});
```

### Pattern-Based Invalidation

```typescript
// Clear all user-related caches
await cacheManager.invalidatePattern('user:*');

// Clear specific organization caches
await cacheManager.invalidatePattern(`org:${orgId}:*`);
```

---

## Repository Caching

### In Custom Methods

```typescript
export class CourseRepository extends BaseRepository<'courses'> {
  async getPublishedCourses(): Promise<Course[]> {
    return cacheManager.memoize(
      cacheKeys.courseList({ published: true }),
      async () => this.findAll({ is_published: true }),
      { ttl: TTL.MEDIUM, namespace: 'courses' }
    );
  }

  async getCourseWithInstructor(id: string): Promise<CourseWithInstructor> {
    return cacheManager.memoize(
      cacheKeys.course(id) + ':with-instructor',
      async () => {
        const { data, error } = await this.supabase
          .from('courses')
          .select('*, instructor:profiles(*)')
          .eq('id', id)
          .single();

        if (error) this.handleError(error, 'getCourseWithInstructor');
        return data as CourseWithInstructor;
      },
      { ttl: TTL.MEDIUM, namespace: 'courses' }
    );
  }
}
```

---

## Cache Namespaces

Organize caches by domain:

```typescript
// Namespace usage
const NAMESPACES = {
  USERS: 'users',
  COURSES: 'courses',
  EVENTS: 'events',
  ORGANIZATIONS: 'organizations',
  BLOG: 'blog'
} as const;

// Clear all course caches
await cacheManager.clear({ namespace: NAMESPACES.COURSES });

// Clear specific cache
await cacheManager.delete(
  cacheKeys.course(id),
  { namespace: NAMESPACES.COURSES }
);
```

---

## Advanced Patterns

### Conditional Caching

```typescript
async function getUser Data(userId: string, bustCache = false) {
  if (bustCache) {
    await cacheManager.delete(cacheKeys.user(userId));
  }

  return cacheManager.memoize(
    cacheKeys.user(userId),
    async () => await userRepository.findById(userId),
    { ttl: TTL.SHORT, namespace: 'users' }
  );
}
```

### Stale-While-Revalidate

```typescript
async function getCourses() {
  const cacheKey = cacheKeys.courseList({});

  // Try cache first
  const cached = await cacheManager.get(cacheKey);
  if (cached) {
    // Revalidate in background
    revalidateInBackground(cacheKey);
    return cached;
  }

  // Cache miss - fetch and cache
  const fresh = await courseRepository.findAll();
  await cacheManager.set(cacheKey, fresh, TTL.MEDIUM);
  return fresh;
}

async function revalidateInBackground(key: string) {
  // Don't await - fire and forget
  setTimeout(async () => {
    const fresh = await courseRepository.findAll();
    await cacheManager.set(key, fresh, TTL.MEDIUM);
  }, 0);
}
```

### Multi-Level Caching

```typescript
// Memory cache (fast, limited)
const memoryCache = new Map();

async function getCachedData(key: string) {
  // Level 1: Memory
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // Level 2: Redis
  const redisCached = await cacheManager.get(key);
  if (redisCached) {
    memoryCache.set(key, redisCached);
    return redisCached;
  }

  // Level 3: Database
  const fresh = await fetchFromDatabase();
  await cacheManager.set(key, fresh, TTL.MEDIUM);
  memoryCache.set(key, fresh);
  return fresh;
}
```

---

## Testing Caching

### Unit Tests

```typescript
import { cacheManager, cacheKeys } from '@/lib/cache/cache-manager';

describe('Course Caching', () => {
  beforeEach(async () => {
    await cacheManager.clear({ namespace: 'courses' });
  });

  it('should cache course data', async () => {
    const course = { id: '1', title: 'Test Course' };
    const key = cacheKeys.course('1');

    // First call - cache miss
    await cacheManager.set(key, course, TTL.MEDIUM);

    // Second call - cache hit
    const cached = await cacheManager.get(key);
    expect(cached).toEqual(course);
  });

  it('should invalidate cache on update', async () => {
    const key = cacheKeys.course('1');
    await cacheManager.set(key, { title: 'Old' }, TTL.MEDIUM);

    // Simulate update
    await cacheManager.delete(key);

    const cached = await cacheManager.get(key);
    expect(cached).toBeNull();
  });
});
```

---

## Best Practices

### ✅ DO

- **Use cacheKeys helpers** for all cache keys
- **Set appropriate TTLs** based on data freshness
- **Use namespaces** for organized invalidation
- **Invalidate on updates** to prevent stale data
- **Handle cache failures gracefully** (fallback to source)
- **Monitor cache hit rates** for optimization

### ❌ DON'T

- **Don't use hardcoded cache keys** ("user-123" - use cacheKeys)
- **Don't cache forever** (no TTL)
- **Don't cache sensitive data** (passwords, tokens)
- **Don't forget to invalidate** on updates
- **Don't cache errors** (let them propagate)
- **Don't cache user-specific data** in shared keys

---

## Cache Key Anti-Patterns

### ❌ Hardcoded Keys

```typescript
// BAD
await cacheManager.set('course-list', courses, 300);
```

### ✅ Helper-Generated Keys

```typescript
// GOOD
await cacheManager.set(
  cacheKeys.courseList({}),
  courses,
  TTL.MEDIUM
);
```

### ❌ Inconsistent Keys

```typescript
// BAD
await cacheManager.set('user_' + id, user, 300);
await cacheManager.set('user:' + id + ':profile', profile, 300);
```

### ✅ Consistent Keys

```typescript
// GOOD
await cacheManager.set(cacheKeys.user(id), user, TTL.SHORT);
await cacheManager.set(cacheKeys.userProfile(id), profile, TTL.SHORT);
```

---

## Monitoring

### Cache Metrics

```typescript
// Track hit/miss rates
const cacheStats = {
  hits: 0,
  misses: 0,
  get hitRate() {
    return this.hits / (this.hits + this.misses) || 0;
  }
};

async function getCached(key: string) {
  const cached = await cacheManager.get(key);
  if (cached) {
    cacheStats.hits++;
    return cached;
  }
  cacheStats.misses++;
  return null;
}
```

---

## Related Documentation

- [Cache Manager Source](../../../lib/cache/cache-manager.ts)
- [Cache Keys Source](../../../lib/cache/cache-manager.ts#cacheKeys)
- [Repository Pattern](./repository-pattern.md)
- [Performance Guide](../../development/performance.md)

---

## ADRs

- [ADR-004: Dual-Layer Caching Strategy](../adr/004-caching.md)
