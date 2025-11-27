# Caching Patterns Audit Report

**Date**: November 25, 2025
**Task**: 28. Audit caching patterns across routes
**Requirements**: 10.1, 10.2

## Executive Summary

This audit identifies all current caching implementations, inconsistent patterns, and routes that would benefit from caching. The analysis covers 100+ API routes across the application.

## Current Caching Infrastructure

### Cache Manager Implementation
- **Location**: `lib/cache/cache-manager.ts`
- **Features**:
  - Dual-layer caching (Redis + in-memory LRU)
  - Automatic fallback to memory cache if Redis unavailable
  - Namespace support for organized invalidation
  - TTL configuration per cache entry
  - Memoization helper for easy integration

### Cache Key Generators
- **Location**: `lib/cache/cache-manager.ts` (exported as `cacheKeys`)
- **Current Keys**:
  - User-related: `userProfile`, `userDashboard`, `userEnrollments`, `userOrganizations`
  - Course-related: `course`, `courseList`, `courseProgress`
  - Session-related: `sessionAvailability`, `upcomingSessions`
  - Analytics: `analytics`, `platformStats`
  - Resources: `resources`, `resource`
  - Events: `eventList`, `event`

## Routes Currently Using Caching

### ✅ Properly Implemented (4 routes)

#### 1. `/api/profile` (GET)
- **Pattern**: `cacheManager.memoize()`
- **Key**: `cacheKeys.userProfile(userId)`
- **TTL**: 120 seconds (2 minutes)
- **Namespace**: `profiles`
- **Invalidation**: On PUT and DELETE operations
- **Status**: ✅ GOOD - Follows all best practices

#### 2. `/api/organizations` (GET)
- **Pattern**: `cacheManager.memoize()`
- **Key**: `cacheKeys.userOrganizations(userId)`
- **TTL**: 120 seconds (2 minutes)
- **Namespace**: `organizations`
- **Invalidation**: On POST, PUT, DELETE operations
- **Status**: ✅ GOOD - Follows all best practices

#### 3. `/api/organizations/[id]` (PUT, DELETE)
- **Pattern**: Cache invalidation only
- **Invalidation**: `cacheManager.clear('organizations')`
- **Status**: ✅ GOOD - Proper invalidation

#### 4. `/api/events` (GET)
- **Pattern**: `cacheManager.memoize()`
- **Key**: `cacheKeys.eventList()`
- **TTL**: 300 seconds (5 minutes)
- **Namespace**: Not specified in memoize call
- **Invalidation**: On POST operation
- **Status**: ⚠️ NEEDS IMPROVEMENT - Missing namespace in memoize call

#### 5. `/api/events/[id]` (PUT, DELETE)
- **Pattern**: Cache invalidation only
- **Invalidation**: `cacheManager.clear('events')`
- **Status**: ✅ GOOD - Proper invalidation

## Inconsistent Patterns Identified

### 1. Missing Namespace in Memoize Calls
**Issue**: `/api/events/route.ts` uses `cacheManager.memoize()` without namespace parameter
```typescript
// Current (inconsistent)
const events = await cacheManager.memoize(
  cacheKeys.eventList(),
  async () => await eventRepository.getAllEventsWithInstructor(),
  { ttl: EVENTS_CACHE_TTL }
);

// Should be (consistent)
const events = await cacheManager.memoize(
  cacheKeys.eventList(),
  async () => await eventRepository.getAllEventsWithInstructor(),
  { ttl: EVENTS_CACHE_TTL, namespace: 'events' }
);
```

### 2. Inconsistent TTL Values
**Issue**: No clear standard for TTL values across similar data types

**Current TTLs**:
- User-specific data: 120s (profile, organizations)
- Public content: 300s (events)
- Not specified: Many routes

**Recommendation**: Establish TTL standards per data type (see recommendations section)

### 3. Missing Cache Key Generators
**Issue**: Many potential cache keys not defined in `cacheKeys` object

**Missing Keys**:
- `blogList()` - for blog posts listing
- `blogPost(postId)` - for individual blog posts
- `courseList(filters)` - for filtered course listings
- `courseDetails(courseId)` - for individual course details
- `searchResults(query, type)` - for search results
- `resourceList(filters)` - for filtered resource listings
- `sessionList(filters)` - for filtered session listings
- `permissionsList()` - for permissions listing
- `organizationDetails(orgId)` - for individual organization details
- `organizationMembers(orgId)` - for organization members

### 4. No Caching on High-Traffic Public Routes
**Issue**: Several high-traffic public routes perform expensive queries without caching

**Routes Missing Caching**:
- `/api/courses` (GET) - Public course listing with filters
- `/api/blog` (GET) - Public blog posts listing
- `/api/search` (GET) - Search across multiple tables
- `/api/resources` (GET) - Resource listing with filters
- `/api/sessions` (GET) - Session listing
- `/api/permissions` (GET) - Permissions listing

## Routes That Should Use Caching

### High Priority (Public, High-Traffic Routes)

#### 1. `/api/courses` (GET)
- **Reason**: Public route with complex joins and filters
- **Current**: No caching
- **Recommendation**: Cache with filters as part of key
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.courseList(category, level, search)`
- **Namespace**: `courses`

#### 2. `/api/blog` (GET)
- **Reason**: Public route, blog posts change infrequently
- **Current**: No caching
- **Recommendation**: Cache all published posts
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.blogList()`
- **Namespace**: `blog`

#### 3. `/api/search` (GET)
- **Reason**: Expensive multi-table queries
- **Current**: No caching
- **Recommendation**: Cache search results by query and type
- **Suggested TTL**: 180s (3 minutes - search results)
- **Suggested Key**: `cacheKeys.searchResults(query, type)`
- **Namespace**: `search`
- **Note**: Consider cache size limits for search results

#### 4. `/api/resources` (GET)
- **Reason**: Public route with complex joins and filters
- **Current**: No caching
- **Recommendation**: Cache with filters as part of key
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.resourceList(category, type, tag, search, sort)`
- **Namespace**: `resources`

### Medium Priority (Authenticated, Moderate Traffic)

#### 5. `/api/sessions` (GET)
- **Reason**: Frequently accessed, relatively static data
- **Current**: No caching
- **Recommendation**: Cache with filters as part of key
- **Suggested TTL**: 120s (2 minutes - user-specific)
- **Suggested Key**: `cacheKeys.sessionList(instructorId, status)`
- **Namespace**: `sessions`

#### 6. `/api/permissions` (GET)
- **Reason**: Static data, rarely changes
- **Current**: No caching
- **Recommendation**: Cache permissions list
- **Suggested TTL**: 3600s (1 hour - static content)
- **Suggested Key**: `cacheKeys.permissionsList()`
- **Namespace**: `permissions`

#### 7. `/api/courses/[id]` (GET)
- **Reason**: Individual course details accessed frequently
- **Current**: No caching
- **Recommendation**: Cache individual course details
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.courseDetails(courseId)`
- **Namespace**: `courses`

#### 8. `/api/blog/[id]` (GET)
- **Reason**: Individual blog posts accessed frequently
- **Current**: No caching
- **Recommendation**: Cache individual blog posts
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.blogPost(postId)`
- **Namespace**: `blog`

#### 9. `/api/resources/[id]` (GET)
- **Reason**: Individual resource details accessed frequently
- **Current**: No caching
- **Recommendation**: Cache individual resource details
- **Suggested TTL**: 300s (5 minutes - public content)
- **Suggested Key**: `cacheKeys.resourceDetails(resourceId)`
- **Namespace**: `resources`

#### 10. `/api/organizations/[id]` (GET)
- **Reason**: Organization details accessed frequently
- **Current**: No caching
- **Recommendation**: Cache organization details
- **Suggested TTL**: 120s (2 minutes - user-specific)
- **Suggested Key**: `cacheKeys.organizationDetails(orgId)`
- **Namespace**: `organizations`

#### 11. `/api/organizations/[id]/members` (GET)
- **Reason**: Member lists accessed frequently
- **Current**: No caching
- **Recommendation**: Cache member lists
- **Suggested TTL**: 120s (2 minutes - user-specific)
- **Suggested Key**: `cacheKeys.organizationMembers(orgId)`
- **Namespace**: `organizations`

### Low Priority (Less Frequent Access)

#### 12. `/api/subscriptions` (GET)
- **Reason**: User-specific, moderate access
- **Suggested TTL**: 120s (2 minutes)
- **Namespace**: `subscriptions`

#### 13. `/api/uploads` (GET)
- **Reason**: User-specific, moderate access
- **Suggested TTL**: 120s (2 minutes)
- **Namespace**: `uploads`

#### 14. `/api/reviews` (GET)
- **Reason**: User-specific, moderate access
- **Suggested TTL**: 120s (2 minutes)
- **Namespace**: `reviews`

## Routes That Should NOT Use Caching

### Real-Time or Transactional Data
- `/api/payments/*` - Payment operations require real-time data
- `/api/stripe/*` - Webhook handlers and payment processing
- `/api/user/data-export/*` - Export operations are one-time
- `/api/user/data-deletion/*` - Deletion operations are one-time
- `/api/uploads` (POST) - File upload operations
- `/api/sso/*` - SSO operations require real-time validation

### Admin Operations
- `/api/admin/*` - Admin operations typically need fresh data
- `/api/cron/*` - Cron jobs should work with fresh data

### Mutation Operations
- All POST, PUT, DELETE operations (except for cache invalidation)

## Recommended TTL Standards

Based on data characteristics and access patterns:

### Static Content (Rarely Changes)
- **TTL**: 3600s (1 hour)
- **Examples**: Permissions, system configuration
- **Rationale**: Changes infrequently, safe to cache longer

### Public Content (Changes Occasionally)
- **TTL**: 300s (5 minutes)
- **Examples**: Courses, blog posts, events, resources
- **Rationale**: Balance between freshness and performance

### Search Results
- **TTL**: 180s (3 minutes)
- **Examples**: Search queries, filtered lists
- **Rationale**: Shorter TTL due to dynamic nature

### User-Specific Data
- **TTL**: 120s (2 minutes)
- **Examples**: User profile, enrollments, organizations
- **Rationale**: More frequent updates, shorter TTL

### Aggregated Stats
- **TTL**: 600s (10 minutes)
- **Examples**: Dashboard stats, analytics
- **Rationale**: Expensive to compute, acceptable staleness

## Cache Invalidation Patterns

### Current Patterns
1. **Namespace-based**: `cacheManager.clear('namespace')` - Clears all keys in namespace
2. **Pattern-based**: `cacheManager.invalidatePattern('pattern')` - Clears keys matching pattern

### Recommended Invalidation Strategy

#### On Create Operations (POST)
```typescript
// Invalidate list caches
await cacheManager.clear('namespace');
```

#### On Update Operations (PUT)
```typescript
// Invalidate specific item and related lists
await cacheManager.delete(cacheKeys.item(id), 'namespace');
await cacheManager.clear('namespace');
```

#### On Delete Operations (DELETE)
```typescript
// Invalidate specific item and related lists
await cacheManager.delete(cacheKeys.item(id), 'namespace');
await cacheManager.clear('namespace');
```

## Missing Cache Key Generators

Add these to `lib/cache/cache-manager.ts`:

```typescript
export const cacheKeys = {
  // ... existing keys ...
  
  // Blog
  blogList: () => 'blog:list',
  blogPost: (postId: string) => `blog:post:${postId}`,
  
  // Courses (enhanced)
  courseDetails: (courseId: string) => `course:details:${courseId}`,
  courseList: (category?: string, level?: string, search?: string) => {
    const parts = ['courses'];
    if (category) parts.push(`cat:${category}`);
    if (level) parts.push(`lvl:${level}`);
    if (search) parts.push(`q:${search}`);
    return parts.join(':');
  },
  
  // Search
  searchResults: (query: string, type?: string) => 
    `search:${type || 'all'}:${query}`,
  
  // Resources (enhanced)
  resourceDetails: (resourceId: string) => `resource:details:${resourceId}`,
  resourceList: (category?: string, type?: string, tag?: string, search?: string, sort?: string) => {
    const parts = ['resources'];
    if (category) parts.push(`cat:${category}`);
    if (type) parts.push(`type:${type}`);
    if (tag) parts.push(`tag:${tag}`);
    if (search) parts.push(`q:${search}`);
    if (sort) parts.push(`sort:${sort}`);
    return parts.join(':');
  },
  
  // Sessions (enhanced)
  sessionList: (instructorId?: string, status?: string) => {
    const parts = ['sessions'];
    if (instructorId) parts.push(`inst:${instructorId}`);
    if (status) parts.push(`status:${status}`);
    return parts.join(':');
  },
  
  // Permissions
  permissionsList: () => 'permissions:all',
  
  // Organizations (enhanced)
  organizationDetails: (orgId: string) => `org:details:${orgId}`,
  organizationMembers: (orgId: string) => `org:members:${orgId}`,
  
  // Subscriptions
  subscriptionList: (userId: string) => `subscriptions:user:${userId}`,
  
  // Uploads
  uploadList: (userId: string) => `uploads:user:${userId}`,
  
  // Reviews
  reviewList: (userId: string) => `reviews:user:${userId}`,
};
```

## Implementation Priority

### Phase 1: Fix Existing Issues (Immediate)
1. Add namespace to `/api/events` memoize call
2. Standardize TTL constants across existing cached routes

### Phase 2: High-Impact Routes (Next Sprint)
1. `/api/courses` (GET) - High traffic, expensive queries
2. `/api/blog` (GET) - High traffic, static content
3. `/api/search` (GET) - Very expensive multi-table queries

### Phase 3: Medium-Impact Routes (Following Sprint)
4. `/api/resources` (GET) - Moderate traffic, complex queries
5. `/api/sessions` (GET) - Moderate traffic
6. `/api/permissions` (GET) - Static data
7. Individual detail routes (courses/[id], blog/[id], etc.)

### Phase 4: Low-Impact Routes (As Needed)
8. Remaining authenticated routes with moderate access patterns

## Metrics to Track

After implementing caching:
1. **Cache Hit Rate**: Target >70% for public content
2. **Response Time Improvement**: Target 50-80% reduction for cached routes
3. **Database Load**: Target 40-60% reduction in query volume
4. **Memory Usage**: Monitor Redis and LRU cache sizes
5. **Cache Invalidation Frequency**: Ensure not too aggressive

## Conclusion

**Summary**:
- **Current State**: 4 routes properly cached, 1 with minor issues
- **Opportunity**: 11+ high/medium priority routes would benefit from caching
- **Inconsistencies**: Missing namespaces, inconsistent TTLs, missing cache keys
- **Impact**: Implementing caching on identified routes could reduce database load by 40-60% and improve response times by 50-80%

**Next Steps**:
1. Review and approve this audit
2. Implement Phase 1 fixes (existing issues)
3. Add missing cache key generators
4. Implement Phase 2 (high-impact routes)
5. Monitor metrics and adjust TTLs as needed
