# NeuroElemental Platform Architecture

**Complete technical architecture and implementation guide**

Last Updated: 2025-11-25

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [User Roles & Permissions](#user-roles--permissions)
4. [Database Schema](#database-schema)
5. [Authentication System](#authentication-system)
6. [Tech Stack](#tech-stack)
7. [Implementation Status](#implementation-status)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Architectural Patterns & Standards](#architectural-patterns--standards)
   - [Repository Pattern](#repository-pattern)
   - [API Route Factory Pattern](#api-route-factory-pattern)
   - [Error Handling Standards](#error-handling-standards)
   - [Validation Approach](#validation-approach)
   - [Caching Strategy](#caching-strategy)
   - [Type Safety Standards](#type-safety-standards)
10. [File Structure](#file-structure)
11. [Security & Scalability](#security--scalability)
12. [Development Standards](#development-standards)

---

## Executive Summary

NeuroElemental is a comprehensive, multi-tenant platform featuring:

- **Authentication system** with 6 user levels
- **Role-based dashboards** for each user type
- **Learning Management System (LMS)** for courses and certification
- **E-commerce platform** for digital products and event tickets
- **Event management** with calendar and capacity tracking
- **Diagnostic onboarding systems** for businesses, schools, and individuals
- **Instructor training portal** with downloadable resources
- **Admin CMS** for content and user management
- **B2B features** with organizations, teams, and analytics

**Current Status:** 80% production ready
**Tech Stack:** Next.js 16, Supabase, Stripe, Cloudflare, Resend

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS FRONTEND                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Public  │  │ Student  │  │Instructor│  │  Admin   │   │
│  │  Pages   │  │Dashboard │  │Dashboard │  │Dashboard │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓ API Routes
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND SERVICES LAYER                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │   LMS    │  │Commerce  │  │ Events   │   │
│  │(Supabase)│  │  Engine  │  │ (Stripe) │  │ Manager  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATA & STORAGE LAYER                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Supabase │  │Cloudflare│  │  Stripe  │  │  Resend  │   │
│  │PostgreSQL│  │   R2     │  │  API     │  │  Email   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## User Roles & Permissions

### Role Hierarchy

```
PUBLIC (Not Logged In)
  ↓ Sign Up
REGISTERED USER (Free)
  ↓ Purchase
STUDENT (Paid Courses)
  ↓ Certification
CERTIFIED INSTRUCTOR (Practitioners)
  ↓ Organization License
BUSINESS/SCHOOL CLIENT (Enterprise)
  ↓ Staff
ADMIN (NeuroElemental Staff)
```

### Permission Matrix

| Permission | Public | Registered | Student | Instructor | Business | Admin |
|------------|--------|------------|---------|------------|----------|-------|
| Take assessment | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Save results | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Browse courses | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Purchase courses | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Access courses | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| Teaching materials | ❌ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Team management | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Content management | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Database Schema

### Core Tables Overview

**Users & Authentication:**
- `profiles` - User profiles and roles
- `instructor_profiles` - Instructor-specific data
- `organizations` - Business/school accounts
- `organization_members` - Team members

**Assessments:**
- `assessments` - Assessment results
- `assessment_history` - Result tracking

**Learning Management:**
- `courses` - Course catalog
- `course_modules` - Course sections
- `course_lessons` - Individual lessons
- `course_enrollments` - Student enrollments
- `lesson_progress` - Completion tracking
- `certificates` - Earned certificates

**Events:**
- `events` - Event calendar
- `event_registrations` - Event signups

**Commerce:**
- `products` - Product catalog
- `orders` - Purchase records
- `order_items` - Order line items

**B2B Features:**
- `organizations` - Multi-tenant orgs
- `organization_memberships` - Team members
- `organization_invitations` - Pending invites
- `organization_activity_log` - Audit trail
- `credit_transactions` - Credit management
- `api_keys` - Programmatic access
- `webhooks` - Event notifications

**Instructor Resources:**
- `instructor_resources` - Teaching materials
- `resource_downloads` - Download tracking

**Diagnostics:**
- `diagnostic_templates` - Assessment templates
- `diagnostic_results` - Results and recommendations

---

## Authentication System

### Implementation with Supabase Auth

**Sign Up:**
```typescript
export async function signUp(email: string, password: string, full_name: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name }
    }
  });

  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email,
      full_name,
      role: 'registered'
    });
  }

  return { data, error };
}
```

### Protected Routes Middleware

Routes are protected based on user roles:

```typescript
const protectedRoutes = {
  '/dashboard': ['registered', 'student', 'instructor', 'business', 'school', 'admin'],
  '/dashboard/student': ['student', 'instructor', 'admin'],
  '/dashboard/instructor': ['instructor', 'admin'],
  '/dashboard/admin': ['admin'],
  '/dashboard/business': ['business', 'school', 'admin'],
};
```

---

## Tech Stack

### Core Technologies

| Component | Technology | Why |
|-----------|-----------|------|
| **Frontend** | Next.js 16 App Router | SEO, server components |
| **Authentication** | Supabase Auth | Social auth, RLS policies |
| **Database** | Supabase PostgreSQL | Relational data, real-time |
| **File Storage** | Cloudflare R2 | Cost-effective, CDN |
| **Payments** | Stripe | Industry standard |
| **Email** | Resend | Modern API, deliverability |
| **Video Hosting** | Cloudflare Stream | Adaptive streaming |
| **Analytics** | PostHog + Plausible | Privacy-friendly |

### Monthly Costs (Estimated)

| Service | Purpose | Cost |
|---------|---------|------|
| Supabase Pro | Database, auth, storage | $25 |
| Cloudflare R2 | Video storage (1TB) | $15 |
| Cloudflare Stream | Video streaming | Pay-per-view |
| Stripe | Payment processing | 2.9% + 30¢ per transaction |
| Resend | Email (50k/month) | $20 |
| PostHog | Analytics (1M events) | $0 (free tier) |
| Vercel Pro | Hosting | $20 |
| **Total** | | ~$80/month + fees |

---

## Implementation Status

### Completed (80%)

**Phase 1: Core Infrastructure** ✅
- Supabase project setup
- Authentication system (email, social)
- Database schema and RLS policies
- User profile system
- Role-based access control
- Stripe integration basics

**Phase 2: LMS & Courses** ✅
- Course creation CMS
- Video upload (Cloudflare Stream)
- Video player with progress tracking
- Quiz system
- Certificate generation
- Email notifications

**Phase 3: Instructor Portal** ✅
- Resource library
- Downloadable PDF system
- Instructor training LMS
- Certification approval workflow

**Phase 4: E-commerce & Events** ✅
- Stripe checkout flows
- Event calendar system
- Event registration
- Ticket generation

**Phase 5: B2B Features** ✅
- Multi-organization system
- Team management
- Credits and billing
- API keys
- Webhooks
- Analytics and reporting

### Remaining Work (10%)

**Completed Refactoring (2024-11):**
- ✅ Type safety consolidation - Single source of truth for database types
- ✅ Repository pattern standardization - All database operations use BaseRepository
- ✅ API route factory adoption - Consistent authentication and error handling
- ✅ Error handling standardization - Structured error responses
- ✅ Validation schema consolidation - Centralized Zod schemas
- ✅ Caching strategy standardization - Consistent cache patterns
- ✅ Import path standardization - Barrel exports for clean imports
- ✅ Type assertion removal - Eliminated `as any` in refactored code

**Current Priority: Platform Consolidation (16-week plan)**

See **[Platform Consolidation Plan](./docs/architecture/consolidation-plan.md)** for the comprehensive 10-phase roadmap.

**Recent Achievements (Nov 2025):**
- ✅ Created comprehensive pattern documentation (5 guides)
- ✅ Organized documentation structure (11 categories)
- ✅ Property-based testing (15/32 properties passing)
- ✅ Repository pattern adoption (90% complete)
- ✅ API route factory adoption (95% complete)
- ✅ Caching standardization (100% complete)

**Next Priorities:**
1. **Complete Property Tests** (1-2 weeks)
   - Implement 17 remaining property tests
   - Target: 100% (32/32)

2. **Testing Infrastructure** (2-3 weeks)
   - E2E test framework setup
   - Integration test expansion
   - Target: 80% API coverage, 75% component coverage

3. **Performance Monitoring** (1 week)
   - Core Web Vitals tracking
   - Query performance monitoring
   - Cache hit rate metrics

4. **Remove Deprecated Wrappers** (1 week)
   - Phase out backward compatibility wrappers
   - Update consuming code
   - 100% repository pattern adoption

---

## Implementation Roadmap

### Current Phase Status

**Phase 1: Foundation** (Complete)
- Core authentication ✅
- Database structure ✅
- Basic dashboards ✅

**Phase 2: Revenue Features** (Complete)
- Checkout UI ✅
- Course purchase flow ✅
- Subscription management ✅
- Payment history ✅

**Phase 3: Content Delivery** (Complete)
- Course lesson system ✅
- Video integration ✅
- Resource downloads ✅
- Certificate generation ✅
- Progress tracking ✅

**Phase 4: Organization Features** (Complete)
- Team management ✅
- Bulk assessments ✅
- Organization analytics ✅
- Role management ✅

**Phase 5: Analytics & Admin** (In Progress)
- Real dashboard data ✅
- Admin analytics ✅
- User growth metrics 🔄
- Revenue reports 🔄
- Engagement tracking 🔄

### Quick Wins (Next Steps)

1. **Complete repository migration** (2-3 hours)
   - Migrate EventRepository and remaining modules
   - Follow established BaseRepository pattern

2. **Expand test coverage** (ongoing)
   - Add property-based tests for new repositories
   - Write integration tests for refactored routes

3. **Set up Sentry** (2 hours)
   - Configure error tracking
   - Add error boundaries

4. **Performance audit** (1 day)
   - Run bundle analysis
   - Identify optimization opportunities

---

## Architectural Patterns & Standards

> [!IMPORTANT]
> **See [Platform Consolidation Plan](./docs/architecture/consolidation-plan.md) for the complete 10-phase standardization roadmap.**

This section documents the standardized patterns established during the codebase refactoring initiative. All new code MUST follow these patterns to maintain consistency and quality.

**Detailed Pattern Guides:**
- **[Repository Pattern](./docs/architecture/patterns/repository-pattern.md)** - Data access layer
- **[API Route Factory](./docs/architecture/patterns/api-route-factory.md)** - API endpoint creation
- **[Error Handling](./docs/architecture/patterns/error-handling.md)** - Error management
- **[Validation](./docs/architecture/patterns/validation.md)** - Request validation with Zod
- **[Caching](./docs/architecture/patterns/caching.md)** - Performance optimization

### Repository Pattern

**Purpose:** Provide a consistent, type-safe abstraction layer for all database operations.

**Implementation:**

All database operations use the Repository Pattern with a base class that provides standard CRUD operations:

```typescript
// lib/db/base-repository.ts
export class BaseRepository<T extends keyof Database['public']['Tables']> {
  protected supabase: TypedSupabaseClient
  protected tableName: T

  constructor(tableName: T, supabase?: TypedSupabaseClient) {
    this.tableName = tableName
    this.supabase = supabase || createAdminClient()
  }

  // Standard CRUD operations
  async findById(id: string): Promise<Tables<T>>
  async findByIdOrNull(id: string): Promise<Tables<T> | null>
  async findAll(filters?: Partial<Tables<T>>): Promise<Tables<T>[]>
  async findOne(filters: Partial<Tables<T>>): Promise<Tables<T> | null>
  async create(data: TablesInsert<T>): Promise<Tables<T>>
  async createMany(data: TablesInsert<T>[]): Promise<Tables<T>[]>
  async update(id: string, data: TablesUpdate<T>): Promise<Tables<T>>
  async updateMany(filters: Partial<Tables<T>>, data: TablesUpdate<T>): Promise<Tables<T>[]>
  async delete(id: string): Promise<void>
  async deleteMany(filters: Partial<Tables<T>>): Promise<void>
  async count(filters?: Partial<Tables<T>>): Promise<number>
  async exists(id: string): Promise<boolean>
  async paginate(options: PaginationOptions): Promise<PaginatedResult<Tables<T>>>
}
```

**Domain-Specific Repositories:**

Extend BaseRepository for domain-specific operations:

```typescript
// lib/db/users.ts
export class UserRepository extends BaseRepository<'profiles'> {
  constructor(supabase?: TypedSupabaseClient) {
    super('profiles', supabase)
  }

  // Domain-specific methods
  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()

    if (error) throw notFoundError('User')
    return data
  }

  async updateRole(userId: string, role: string): Promise<Profile> {
    return this.update(userId, { role })
  }

  async searchUsers(query: string, limit = 10): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .ilike('full_name', `%${query}%`)
      .limit(limit)

    if (error) throw internalError('Failed to search users')
    return data
  }
}

// Export singleton instance
export const userRepository = new UserRepository()
```

**Usage in API Routes:**

```typescript
import { userRepository } from '@/lib/db'

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const users = await userRepository.findAll({ organization_id: user.organization_id })
  return successResponse(users)
})
```

**Benefits:**
- Single source of truth for database operations
- Type-safe queries with TypeScript
- Consistent error handling
- Reusable across routes and services
- Easy to test with dependency injection

---

### API Route Factory Pattern

**Purpose:** Standardize authentication, error handling, and response formatting across all API routes.

**Implementation:**

All API routes use factory functions instead of manual try-catch blocks:

```typescript
// lib/api/route-factory.ts
export function createAuthenticatedRoute<TParams>(
  handler: AuthenticatedHandler<TParams>
): RouteHandler<TParams>

export function createPublicRoute<TParams>(
  handler: PublicHandler<TParams>
): RouteHandler<TParams>

export function createAdminRoute<TParams>(
  handler: AdminHandler<TParams>
): RouteHandler<TParams>
```

**Standard Route Structure:**

```typescript
// app/api/courses/route.ts
import {
  createAuthenticatedRoute,
  createPublicRoute,
  successResponse,
  paginatedResponse,
  getPaginationParams
} from '@/lib/api'
import { courseRepository } from '@/lib/db'
import { courseCreateSchema } from '@/lib/validation/schemas'

// Public endpoint - no authentication required
export const GET = createPublicRoute(async (request) => {
  const { limit, offset } = getPaginationParams(request)

  const result = await courseRepository.paginate({
    page: Math.floor(offset / limit) + 1,
    limit,
    filters: { published: true }
  })

  return paginatedResponse(result.data, result.total, result.page, limit)
})

// Authenticated endpoint - requires valid user
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const body = await request.json()

  // Validate input
  const validation = courseCreateSchema.safeParse(body)
  if (!validation.success) {
    throw validationError('Invalid course data', validation.error.errors)
  }

  const course = await courseRepository.create({
    ...validation.data,
    created_by: user.id
  })

  return successResponse(course, 201)
})
```

**Admin-Only Routes:**

```typescript
// app/api/admin/users/route.ts
import { createAdminRoute, successResponse } from '@/lib/api'
import { userRepository } from '@/lib/db'

export const GET = createAdminRoute(async (request) => {
  const users = await userRepository.findAll()
  return successResponse(users)
})
```

**Benefits:**
- Automatic authentication handling
- Consistent error responses
- No manual try-catch blocks needed
- Built-in role verification
- Standardized response formats

---

### Error Handling Standards

**Purpose:** Provide consistent, structured error responses across the entire API.

**Error Hierarchy:**

```typescript
// lib/api/error-handler.ts
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
```

**Error Factory Functions:**

```typescript
// Validation errors (422)
export function validationError(message?: string, details?: any): ApiError {
  return new ApiError(
    message || 'Validation failed',
    422,
    'VALIDATION_ERROR',
    details
  )
}

// Not found errors (404)
export function notFoundError(resource?: string): ApiError {
  return new ApiError(
    `${resource || 'Resource'} not found`,
    404,
    'NOT_FOUND'
  )
}

// Authentication errors (401)
export function unauthorizedError(message?: string): ApiError {
  return new ApiError(
    message || 'Authentication required',
    401,
    'UNAUTHORIZED'
  )
}

// Authorization errors (403)
export function forbiddenError(message?: string): ApiError {
  return new ApiError(
    message || 'Access forbidden',
    403,
    'FORBIDDEN'
  )
}

// Bad request errors (400)
export function badRequestError(message?: string, details?: any): ApiError {
  return new ApiError(
    message || 'Bad request',
    400,
    'BAD_REQUEST',
    details
  )
}

// Conflict errors (409)
export function conflictError(message?: string): ApiError {
  return new ApiError(
    message || 'Resource conflict',
    409,
    'CONFLICT'
  )
}

// Internal errors (500)
export function internalError(message?: string): ApiError {
  return new ApiError(
    message || 'Internal server error',
    500,
    'INTERNAL_ERROR'
  )
}
```

**Usage Pattern:**

```typescript
// In route handlers or repositories
if (!user) {
  throw unauthorizedError('User not authenticated')
}

if (user.role !== 'admin') {
  throw forbiddenError('Admin access required')
}

if (!course) {
  throw notFoundError('Course')
}

if (validation.errors) {
  throw validationError('Invalid input', validation.errors)
}

// Factory automatically converts to proper NextResponse
```

**Error Response Format:**

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "specific error details"
  },
  "timestamp": "2024-11-24T10:30:00Z"
}
```

**Benefits:**
- Consistent error structure
- Proper HTTP status codes
- Detailed error information for debugging
- Automatic conversion to NextResponse
- Type-safe error handling

---

### Validation Approach

**Purpose:** Centralize and standardize input validation using Zod schemas.

**Schema Organization:**

```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

// Reusable field schemas
export const emailSchema = z.string().email()
export const uuidSchema = z.string().uuid()
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
export const urlSchema = z.string().url()

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10)
})

// Resource schemas
export const organizationCreateSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['business', 'school', 'nonprofit']),
  industry: z.string().optional(),
  size_range: z.string().optional()
})

export const courseCreateSchema = z.object({
  title: z.string().min(1).max(200),
  slug: slugSchema,
  description: z.string().optional(),
  price_usd: z.number().min(0),
  category: z.string().optional(),
  published: z.boolean().default(false)
})

export const userUpdateSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: urlSchema.optional(),
  role: z.enum(['registered', 'student', 'instructor', 'admin']).optional()
})
```

**Validation Helper:**

```typescript
// lib/validation/validate.ts
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw validationError('Validation failed', error.errors)
    }
    throw badRequestError('Invalid request body')
  }
}
```

**Usage in Routes:**

```typescript
import { validateRequest } from '@/lib/validation/validate'
import { courseCreateSchema } from '@/lib/validation/schemas'

export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  // Validate and parse request body
  const data = await validateRequest(request, courseCreateSchema)

  // Data is now type-safe and validated
  const course = await courseRepository.create({
    ...data,
    created_by: user.id
  })

  return successResponse(course, 201)
})
```

**Benefits:**
- Centralized validation logic
- Type-safe validated data
- Reusable schemas
- Detailed validation errors
- Automatic type inference

---

### Caching Strategy

**Purpose:** Improve performance through consistent, organized caching patterns.

**Cache Manager:**

```typescript
// lib/cache/cache-manager.ts
export const cacheManager = {
  /**
   * Memoize a function result with caching
   */
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options?: { ttl?: number; namespace?: string }
  ): Promise<T> {
    const cached = await redisCache.get(key)
    if (cached) return JSON.parse(cached)

    const result = await fn()
    await redisCache.set(
      key,
      JSON.stringify(result),
      options?.ttl || 300 // 5 minutes default
    )

    return result
  },

  /**
   * Clear cache by namespace or specific key
   */
  async clear(namespace?: string): Promise<void> {
    if (namespace) {
      const keys = await redisCache.keys(`${namespace}:*`)
      if (keys.length > 0) {
        await redisCache.del(...keys)
      }
    } else {
      await redisCache.flushall()
    }
  },

  async clearKey(key: string): Promise<void> {
    await redisCache.del(key)
  }
}
```

**Cache Key Generators:**

```typescript
// lib/cache/cache-manager.ts
export const cacheKeys = {
  // User-related
  userOrganizations: (userId: string) => `user:${userId}:organizations`,
  userProfile: (userId: string) => `user:${userId}:profile`,

  // Course-related
  courseDetails: (courseId: string) => `course:${courseId}:details`,
  courseEnrollments: (courseId: string) => `course:${courseId}:enrollments`,
  courseModules: (courseId: string) => `course:${courseId}:modules`,

  // Organization-related
  orgMembers: (orgId: string) => `org:${orgId}:members`,
  orgCourses: (orgId: string) => `org:${orgId}:courses`,

  // Public content
  publicCourses: () => 'public:courses',
  publicEvents: () => 'public:events'
}
```

**TTL Standards:**

| Data Type | TTL | Reason |
|-----------|-----|--------|
| User-specific data | 2 minutes (120s) | Frequently changing |
| Public content | 5 minutes (300s) | Balance freshness/performance |
| Static content | 1 hour (3600s) | Rarely changes |
| Aggregated stats | 10 minutes (600s) | Expensive to compute |

**Usage in Routes:**

```typescript
import { cacheManager, cacheKeys } from '@/lib/cache/cache-manager'

export const GET = createPublicRoute(async (request) => {
  const courses = await cacheManager.memoize(
    cacheKeys.publicCourses(),
    async () => {
      return await courseRepository.findAll({ published: true })
    },
    { ttl: 300, namespace: 'courses' }
  )

  return successResponse(courses)
})

// Invalidate cache on updates
export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const course = await courseRepository.create(data)

  // Clear relevant caches
  await cacheManager.clear('courses')

  return successResponse(course, 201)
})
```

**Benefits:**
- Consistent cache key patterns
- Organized cache invalidation
- Configurable TTLs
- Namespace-based clearing
- Performance optimization

---

### Type Safety Standards

**Single Source of Truth:**

All database types are consolidated in a single file:

```typescript
// lib/types/supabase.ts
export type Database = {
  public: {
    Tables: {
      profiles: { Row: {...}, Insert: {...}, Update: {...} }
      courses: { Row: {...}, Insert: {...}, Update: {...} }
      // ... all tables
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Typed client
export type TypedSupabaseClient = SupabaseClient<Database>

// Convenience exports
export type Profile = Tables<'profiles'>
export type Course = Tables<'courses'>
export type Organization = Tables<'organizations'>
```

**Import Standards:**

```typescript
// ✅ CORRECT - Import from single source
import { Profile, Course, TypedSupabaseClient } from '@/lib/types/supabase'

// ❌ WRONG - Don't import from multiple sources
import { Profile } from '@/types/database.types'
import { Course } from '@/types/supabase'
```

**No Type Assertions:**

```typescript
// ❌ WRONG - Using type assertions
const user = data as any
const courses = result as Course[]

// ✅ CORRECT - Proper typing
const user: Profile = data
const courses: Course[] = result
```

---

## File Structure

```
neuroelemental/
├── app/
│   ├── (auth)/                    # Authentication pages
│   ├── (public)/                  # Public pages
│   ├── dashboard/                 # Protected dashboards
│   │   ├── student/
│   │   ├── instructor/
│   │   ├── business/
│   │   └── admin/
│   ├── courses/                   # Course catalog
│   ├── events/                    # Event calendar
│   ├── checkout/                  # Checkout flow
│   └── api/                       # API routes
│       ├── auth/
│       ├── webhooks/
│       ├── checkout/
│       ├── courses/
│       ├── organizations/
│       └── billing/
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── lms/
│   ├── events/
│   ├── admin/
│   ├── diagnostics/
│   └── organizations/
│
├── lib/
│   ├── api/                       # API utilities
│   │   ├── route-factory.ts      # Route factory functions
│   │   ├── error-handler.ts      # Error classes and factories
│   │   ├── route-utils.ts        # Response helpers
│   │   └── index.ts              # Barrel export
│   ├── db/                        # Database layer
│   │   ├── base-repository.ts    # Base repository class
│   │   ├── users.ts              # User repository
│   │   ├── courses.ts            # Course repository
│   │   ├── organizations.ts      # Organization repository
│   │   └── index.ts              # Barrel export
│   ├── validation/                # Validation schemas
│   │   ├── schemas.ts            # Zod schemas
│   │   └── validate.ts           # Validation helpers
│   ├── cache/                     # Caching layer
│   │   ├── cache-manager.ts      # Cache utilities
│   │   └── redis-cache.ts        # Redis client
│   ├── types/                     # Type definitions
│   │   └── supabase.ts           # Database types (single source)
│   ├── auth/
│   ├── stripe/
│   ├── email/
│   └── utils/
│
├── types/                         # Legacy (being phased out)
│   ├── api.ts
│   └── index.ts
│
└── supabase/
    ├── migrations/
    └── seed.sql
```

---

## Security & Scalability

### Security Measures

**Row-Level Security (RLS):**
- All tables have RLS enabled
- Users can only access their own data
- Role-based policies for admin/instructor access

**API Security:**
- All routes check authentication
- Role verification before sensitive operations
- Rate limiting on public endpoints

**Payment Security:**
- Never store credit card data (Stripe handles)
- Webhook signature verification
- PCI compliance through Stripe

**Data Encryption:**
- Data encrypted at rest (Supabase default)
- TLS/SSL for data in transit
- Environment variables for secrets

### Performance Optimization

**Database:**
- Indexes on frequently queried columns
- Connection pooling via Supabase
- Read replicas for analytics (if needed)

**Caching:**
- Next.js ISR for public pages
- React Query for client-side caching
- Cloudflare CDN for static assets

**Video Delivery:**
- Adaptive bitrate streaming
- CDN delivery
- Lazy loading

**Code Splitting:**
- Dynamic imports for dashboards
- Route-based code splitting
- Lazy load heavy components

---

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_STREAM_API_TOKEN=

# Email
RESEND_API_KEY=

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=

# Cron Jobs
CRON_SECRET=

# App
NEXT_PUBLIC_APP_URL=https://neuroelemental.com
```

---

## Next Steps

### Immediate Priorities

1. **Fix type safety issues** - Remove `as any` assertions
2. **Add input validation** - Implement Zod schemas
3. **Write critical tests** - 80%+ coverage goal
4. **Set up error tracking** - Configure Sentry
5. **Optimize performance** - Bundle analysis and optimization

### Production Checklist

- [x] TypeScript builds without errors
- [x] Type safety consolidated (single source of truth)
- [x] Repository pattern implemented for database operations
- [x] API routes use factory pattern for consistency
- [x] Error handling standardized across all routes
- [x] Validation schemas centralized with Zod
- [x] Caching strategy standardized
- [x] Documentation up-to-date with architectural patterns
- [ ] All database modules migrated to repository pattern
- [ ] 80%+ test coverage on critical paths
- [ ] Error tracking configured (Sentry)
- [ ] Performance metrics baseline established
- [ ] Security audit completed
- [ ] Load testing performed
- [ ] Deployment pipeline configured

---

## Development Standards

### Code Quality Requirements

All new code MUST adhere to these standards:

1. **Type Safety**
   - Import types from `@/lib/types/supabase` only
   - No `as any` or type assertions
   - Explicit return type annotations on all functions

2. **Database Operations**
   - Use repository pattern (extend BaseRepository)
   - No standalone database functions
   - Proper error handling with ApiError

3. **API Routes**
   - Use route factory pattern (createAuthenticatedRoute, etc.)
   - No manual try-catch blocks
   - Use response helpers (successResponse, errorResponse)

4. **Validation**
   - Define schemas in `lib/validation/schemas.ts`
   - Use validateRequest helper
   - Structured validation errors

5. **Caching**
   - Use cacheManager.memoize for reads
   - Use cacheKeys helpers for key generation
   - Include namespace for organized invalidation

6. **Error Handling**
   - Use error factory functions (notFoundError, validationError, etc.)
   - Throw ApiError instances
   - Provide detailed error context

### Code Review Checklist

Before submitting code for review, verify:

- [ ] Follows repository pattern for database operations
- [ ] Uses route factory for API endpoints
- [ ] Includes input validation with Zod schemas
- [ ] Uses standardized error handling
- [ ] Implements caching where appropriate
- [ ] Has proper TypeScript types (no `as any`)
- [ ] Includes JSDoc comments for public functions
- [ ] Has corresponding tests (unit/integration/property)
- [ ] Follows established file structure
- [ ] Uses barrel exports for imports

---

**Platform is 90% production ready!** Major architectural refactoring complete. Focus on completing repository migration, expanding test coverage, and performance optimization to reach 100% production readiness.

For detailed information about specific features, see:
- `B2B_FEATURES.md` - B2B and enterprise features
- `BILLING.md` - Billing and subscription management
- `DATABASE_SETUP.md` - Database configuration
- `SETUP.md` - Initial setup and configuration
- `DEVELOPMENT_GUIDE.md` - Development best practices
- `.kiro/specs/codebase-cleanup-optimization/` - Refactoring specification and design
