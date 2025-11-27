# Cache Key Patterns Documentation

This document describes the standardized cache key patterns used throughout the application.

## Overview

All cache keys should be generated using the `cacheKeys` helper functions from `@/lib/cache/cache-manager`. This ensures consistency, prevents typos, and makes cache invalidation predictable.

## Key Naming Conventions

### Structure
Cache keys follow a hierarchical structure using colons (`:`) as separators:

```
<entity_type>:<sub_type>:<identifier>[:<additional_context>]
```

### Examples
- Single entity: `user:profile:abc123`
- List with filter: `courses:category:neuroscience`
- Paginated data: `courses:page:1:size:20`
- Aggregated data: `count:courses:{"status":"published"}`

### Rules
1. **Use lowercase**: All key segments should be lowercase
2. **Use colons**: Separate segments with colons (`:`)
3. **Be descriptive**: Keys should be self-explanatory
4. **Be consistent**: Use the same pattern for similar data types
5. **Include filters**: When filtering data, include filter criteria in the key

## Available Cache Key Generators

### User-Related Keys

```typescript
import { cacheKeys } from '@/lib/cache/cache-manager';

// User profile data
cacheKeys.userProfile(userId: string)
// Example: "user:profile:abc123"

// User dashboard data
cacheKeys.userDashboard(userId: string)
// Example: "user:dashboard:abc123"

// User enrollments
cacheKeys.userEnrollments(userId: string)
// Example: "user:enrollments:abc123"

// User organizations
cacheKeys.userOrganizations(userId: string)
// Example: "user:organizations:abc123"
```

### Course-Related Keys

```typescript
// Single course
cacheKeys.course(courseId: string)
// Example: "course:xyz789"

// Course list (all or by category)
cacheKeys.courseList(category?: string)
// Example: "courses:all" or "courses:category:neuroscience"

// User's progress in a course
cacheKeys.courseProgress(userId: string, courseId: string)
// Example: "progress:abc123:xyz789"

// Course enrollments
cacheKeys.courseEnrollments(courseId: string)
// Example: "course:xyz789:enrollments"
```

### Event-Related Keys

```typescript
// All events
cacheKeys.eventList()
// Example: "events:all"

// Single event
cacheKeys.event(eventId: string)
// Example: "event:evt123"
```

### Organization-Related Keys

```typescript
// Single organization
cacheKeys.organization(orgId: string)
// Example: "organization:org456"

// Organization members
cacheKeys.organizationMembers(orgId: string)
// Example: "organization:org456:members"

// Organization courses
cacheKeys.organizationCourses(orgId: string)
// Example: "organization:org456:courses"
```

### Blog-Related Keys

```typescript
// All blog posts
cacheKeys.blogPosts()
// Example: "blog:posts:all"

// Single blog post by ID
cacheKeys.blogPost(postId: string)
// Example: "blog:post:post123"

// Blog post by slug
cacheKeys.blogPostBySlug(slug: string)
// Example: "blog:post:slug:my-article"
```

### Resource-Related Keys

```typescript
// All resources or by category
cacheKeys.resources(category?: string)
// Example: "resources:all" or "resources:category:worksheets"

// Single resource
cacheKeys.resource(resourceId: string)
// Example: "resource:res789"
```

### Session-Related Keys

```typescript
// Instructor availability
cacheKeys.sessionAvailability(instructorId: string, date: string)
// Example: "availability:inst123:2024-12-01"

// Upcoming sessions for user
cacheKeys.upcomingSessions(userId: string)
// Example: "sessions:upcoming:abc123"
```

### Analytics Keys

```typescript
// Analytics data
cacheKeys.analytics(type: string, period: string)
// Example: "analytics:enrollments:monthly"

// Platform statistics
cacheKeys.platformStats()
// Example: "platform:stats"
```

### Generic Keys

```typescript
// Paginated list
cacheKeys.paginatedList(table: string, page: number, pageSize: number, filters?: Record<string, any>)
// Example: "courses:page:1:size:20" or "courses:page:1:size:20:{"status":"published"}"

// Generic entity
cacheKeys.entity(table: string, id: string)
// Example: "profiles:abc123"

// Count queries
cacheKeys.count(table: string, filters?: Record<string, any>)
// Example: "count:courses" or "count:courses:{"status":"published"}"

// Aggregation queries
cacheKeys.aggregate(table: string, aggregations: any, filters?: Record<string, any>, groupBy?: string[])
// Example: "aggregate:courses:{"count":true}:{"status":"published"}:null"

// Batch entity fetch
cacheKeys.batchEntity(table: string, ids: string[])
// Example: "courses:batch:id1,id2,id3"
```

## Usage Examples

### Basic Caching

```typescript
import { cacheManager, cacheKeys } from '@/lib/cache/cache-manager';

// Cache user profile
const profile = await cacheManager.memoize(
  cacheKeys.userProfile(userId),
  async () => await fetchUserProfile(userId),
  { ttl: 300, namespace: 'user' }
);
```

### Cache Invalidation

```typescript
// Invalidate specific user's cache
await cacheManager.delete(cacheKeys.userProfile(userId), 'user');

// Invalidate all user-related caches
await cacheManager.clear('user');

// Invalidate pattern
await cacheManager.invalidatePattern('user:*');
```

### Paginated Data

```typescript
// Cache paginated course list
const cacheKey = cacheKeys.paginatedList('courses', page, pageSize, { status: 'published' });
const result = await cacheManager.memoize(
  cacheKey,
  async () => await fetchCourses(page, pageSize, { status: 'published' }),
  { ttl: 60 }
);
```

## TTL Guidelines

Use consistent TTL (Time To Live) values for similar data types:

- **User-specific data**: 120 seconds (2 minutes)
- **Public content**: 300 seconds (5 minutes)
- **Static content**: 3600 seconds (1 hour)
- **Aggregated stats**: 600 seconds (10 minutes)
- **Real-time data**: 30 seconds

## Cache Namespaces

Organize caches using namespaces for easier invalidation:

- `user` - User-related data
- `course` - Course-related data
- `event` - Event-related data
- `organization` - Organization-related data
- `blog` - Blog-related data
- `resource` - Resource-related data
- `analytics` - Analytics data

## Best Practices

### DO ✅

- Always use `cacheKeys` helpers instead of string literals
- Include relevant filters in cache keys
- Use appropriate TTL values based on data volatility
- Use namespaces for organized invalidation
- Document custom cache keys if added

### DON'T ❌

- Don't use hardcoded string literals for cache keys
- Don't cache sensitive user data without encryption
- Don't use overly long TTL for frequently changing data
- Don't forget to invalidate cache when data changes
- Don't include PII (Personally Identifiable Information) in cache keys

## Adding New Cache Keys

When adding new cache key generators:

1. Add the function to the `cacheKeys` object in `lib/cache/cache-manager.ts`
2. Follow the naming conventions outlined above
3. Add JSDoc comments explaining the purpose
4. Update this documentation with examples
5. Add tests to verify the key format

Example:

```typescript
// In lib/cache/cache-manager.ts
export const cacheKeys = {
  // ... existing keys ...
  
  /**
   * Generate cache key for user notifications
   * @param userId - The user ID
   * @param unreadOnly - Whether to filter for unread notifications only
   * @returns Cache key string
   */
  userNotifications: (userId: string, unreadOnly: boolean = false) => 
    `user:${userId}:notifications${unreadOnly ? ':unread' : ':all'}`,
};
```

## Troubleshooting

### Cache Not Invalidating

If cache isn't being invalidated properly:

1. Check that you're using the correct namespace
2. Verify the cache key matches exactly
3. Ensure `cacheManager.clear()` is called after data mutations
4. Check Redis connection if using distributed cache

### Cache Misses

If experiencing frequent cache misses:

1. Verify TTL is appropriate for the data type
2. Check that cache keys are consistent across reads/writes
3. Monitor cache hit rates using `cacheManager.getStats()`
4. Consider increasing cache size if memory allows

### Key Collisions

If different data types are colliding:

1. Ensure entity types are unique in the first segment
2. Add more specific sub-types to differentiate
3. Include relevant identifiers in the key structure
4. Review the key naming conventions

## Related Files

- `lib/cache/cache-manager.ts` - Cache manager implementation and key generators
- `lib/cache/redis-cache.ts` - Redis cache implementation
- `lib/optimization/db-optimizer.ts` - Database optimization utilities using cache
