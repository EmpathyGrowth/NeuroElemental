# Codebase Cleanup & Optimization Migration Guide

## Table of Contents

1. [Overview](#overview)
2. [Breaking Changes](#breaking-changes)
3. [Migration Patterns](#migration-patterns)
4. [Before & After Examples](#before--after-examples)
5. [Common Migration Scenarios](#common-migration-scenarios)
6. [Troubleshooting](#troubleshooting)
7. [Testing Your Changes](#testing-your-changes)
8. [Getting Help](#getting-help)

---

## Overview

This guide helps you migrate existing code to use the new standardized patterns established during the codebase cleanup and optimization initiative. The refactoring consolidates types, standardizes API routes, unifies database operations, and improves error handling across the entire application.

### What Changed?

- **Type System**: Single source of truth for database types in `lib/types/supabase.ts`
- **Repository Pattern**: All database operations use `BaseRepository` or its extensions
- **API Routes**: All routes use factory pattern (`createAuthenticatedRoute`, `createPublicRoute`, `createAdminRoute`)
- **Error Handling**: Standardized error factories and response helpers
- **Validation**: Centralized schemas in `lib/validation/schemas.ts`
- **Caching**: Consistent cache key generation and TTL standards

### Why These Changes?

- **Type Safety**: Eliminate `as any` assertions and TypeScript errors
- **Consistency**: Same patterns across all routes and database operations
- **Maintainability**: Easier to understand, modify, and extend code
- **Testing**: Simpler to test with standardized patterns
- **Performance**: Optimized caching and query patterns

---

## Breaking Changes

### 1. Type Imports

**BREAKING**: Old type import paths no longer exist.


**Old Paths (REMOVED)**:
```typescript
import { Database } from '@/types/database.types'
import { Profile, Course } from '@/types/supabase'
```

**New Path (USE THIS)**:
```typescript
import { Database, Profile, Course, TypedSupabaseClient } from '@/lib/types/supabase'
```

**Action Required**: Update all type imports to use `@/lib/types/supabase`

### 2. Database Operations

**BREAKING**: Standalone database functions removed.

**Old Pattern (REMOVED)**:
```typescript
import { getCourseById, updateCourse } from '@/lib/db/courses'

const course = await getCourseById(id)
await updateCourse(id, { title: 'New Title' })
```

**New Pattern (USE THIS)**:
```typescript
import { courseRepository } from '@/lib/db'

const course = await courseRepository.findById(id)
await courseRepository.update(id, { title: 'New Title' })
```

**Action Required**: Replace standalone function calls with repository methods

### 3. API Route Structure

**BREAKING**: Manual authentication and try-catch blocks no longer needed.

**Old Pattern (DON'T USE)**:
```typescript
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // business logic
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```


**New Pattern (USE THIS)**:
```typescript
import { createAuthenticatedRoute, successResponse } from '@/lib/api'

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  // business logic - no try-catch needed, user is guaranteed
  return successResponse({ data })
})
```

**Action Required**: Refactor routes to use factory pattern

### 4. Error Handling

**BREAKING**: Generic errors and manual error responses removed.

**Old Pattern (DON'T USE)**:
```typescript
throw new Error('Something went wrong')
return NextResponse.json({ error: 'Not found' }, { status: 404 })
```

**New Pattern (USE THIS)**:
```typescript
import { notFoundError, internalError } from '@/lib/api'

throw notFoundError('Resource')
throw internalError('Something went wrong')
```

**Action Required**: Use error factories instead of generic errors

### 5. Validation

**BREAKING**: Inline validation should be replaced with schemas.

**Old Pattern (DON'T USE)**:
```typescript
const body = await request.json()
if (!body.email || !body.email.includes('@')) {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
}
```

**New Pattern (USE THIS)**:
```typescript
import { validateRequest } from '@/lib/validation/validate'
import { profileUpdateSchema } from '@/lib/validation/schemas'

const validation = await validateRequest(request, profileUpdateSchema)
if (!validation.success) {
  throw validation.error
}
const { data } = validation
```

**Action Required**: Replace inline validation with centralized schemas


---

## Migration Patterns

### Pattern 1: Migrating Type Imports

**Step 1**: Find all type imports
```bash
# Search for old import patterns
grep -r "from '@/types/database.types'" .
grep -r "from '@/types/supabase'" .
```

**Step 2**: Replace with new imports
```typescript
// Before
import { Database } from '@/types/database.types'
import { Profile } from '@/types/supabase'

// After
import { Database, Profile } from '@/lib/types/supabase'
```

**Step 3**: Verify TypeScript compilation
```bash
npm run typecheck
```

### Pattern 2: Migrating to Repository Pattern

**Step 1**: Identify standalone database functions
```typescript
// Old standalone functions
export async function getUserById(id: string) { ... }
export async function updateUser(id: string, data: any) { ... }
```

**Step 2**: Create or use existing repository
```typescript
// New repository class
export class UserRepository extends BaseRepository<'profiles'> {
  constructor() {
    super('profiles')
  }
  
  // Domain-specific methods
  async findByEmail(email: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()
    return data
  }
}

export const userRepository = new UserRepository()
```

**Step 3**: Update all call sites
```typescript
// Before
import { getUserById, updateUser } from '@/lib/db/users'
const user = await getUserById(id)

// After
import { userRepository } from '@/lib/db'
const user = await userRepository.findById(id)
```


### Pattern 3: Migrating API Routes to Factory Pattern

**Step 1**: Identify route structure
```typescript
// Old pattern - manual everything
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const data = await someOperation()
    return NextResponse.json({ data }, { status: 200 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

**Step 2**: Choose appropriate factory
- `createPublicRoute` - No authentication required
- `createAuthenticatedRoute` - Requires authenticated user
- `createAdminRoute` - Requires admin role

**Step 3**: Refactor to factory pattern
```typescript
import { createAuthenticatedRoute, successResponse } from '@/lib/api'

export const GET = createAuthenticatedRoute(
  async (request: NextRequest, context: RouteContext, user) => {
    // No try-catch needed - factory handles errors
    // No auth check needed - user is guaranteed
    
    const data = await someOperation()
    return successResponse(data)
  }
)
```

**Step 4**: Update error handling
```typescript
// Replace manual error responses with error factories
import { notFoundError, forbiddenError, validationError } from '@/lib/api'

// Instead of:
if (!resource) {
  return NextResponse.json({ error: 'Not found' }, { status: 404 })
}

// Use:
if (!resource) {
  throw notFoundError('Resource')
}
```


### Pattern 4: Migrating Error Handling

**Step 1**: Replace generic errors
```typescript
// Before
throw new Error('Failed to create resource')

// After
import { internalError } from '@/lib/api'
throw internalError('Failed to create resource')
```

**Step 2**: Replace manual error responses
```typescript
// Before
return NextResponse.json({ error: 'Validation failed' }, { status: 422 })

// After
import { validationError } from '@/lib/api'
throw validationError('Validation failed', { field: 'email', message: 'Invalid format' })
```

**Step 3**: Use appropriate error factory
- `unauthorizedError()` - 401 - User not authenticated
- `forbiddenError()` - 403 - User lacks permissions
- `notFoundError(resource)` - 404 - Resource doesn't exist
- `badRequestError(message, details)` - 400 - Invalid request
- `validationError(message, details)` - 422 - Validation failed
- `conflictError(message)` - 409 - Duplicate or conflict
- `internalError(message)` - 500 - Unexpected error

### Pattern 5: Migrating Validation

**Step 1**: Identify inline validation
```typescript
// Old inline validation
const body = await request.json()
if (!body.email || typeof body.email !== 'string') {
  return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
}
if (!body.name || body.name.length < 2) {
  return NextResponse.json({ error: 'Name too short' }, { status: 400 })
}
```

**Step 2**: Create or use existing schema
```typescript
// Check if schema exists in lib/validation/schemas.ts
import { profileUpdateSchema } from '@/lib/validation/schemas'

// Or create new schema if needed
import { z } from 'zod'
export const mySchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100)
})
```

**Step 3**: Use validateRequest helper
```typescript
import { validateRequest } from '@/lib/validation/validate'
import { profileUpdateSchema } from '@/lib/validation/schemas'

const validation = await validateRequest(request, profileUpdateSchema)
if (!validation.success) {
  throw validation.error // Automatically formatted validation error
}

const { data } = validation // Fully typed based on schema
```


### Pattern 6: Migrating Cache Operations

**Step 1**: Replace manual cache keys
```typescript
// Before
const cacheKey = `user-${userId}-organizations`
const cached = await redis.get(cacheKey)

// After
import { cacheManager, cacheKeys } from '@/lib/cache'
const data = await cacheManager.memoize(
  cacheKeys.userOrganizations(userId),
  async () => {
    // Fetch data
    return await fetchOrganizations(userId)
  },
  { ttl: 120, namespace: 'organizations' }
)
```

**Step 2**: Use standard TTL values
- User-specific data: 120s (2 minutes)
- Public content: 300s (5 minutes)
- Static content: 3600s (1 hour)
- Aggregated stats: 600s (10 minutes)

**Step 3**: Use namespace for invalidation
```typescript
// Clear all organization caches
await cacheManager.clear('organizations')

// Clear specific key
await cacheManager.clearKey(cacheKeys.userOrganizations(userId))
```

---

## Before & After Examples

### Example 1: Complete API Route Migration

**Before** (Old Pattern):
```typescript
// app/api/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/get-current-user'
import { getCourseById, updateCourse } from '@/lib/db/courses'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await getCourseById(params.id)
    
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ course }, { status: 200 })
  } catch (error) {
    console.error('Error fetching course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    if (!body.title || body.title.length < 3) {
      return NextResponse.json(
        { error: 'Title must be at least 3 characters' },
        { status: 400 }
      )
    }
    
    const course = await updateCourse(params.id, body)
    
    return NextResponse.json({ course }, { status: 200 })
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```


**After** (New Pattern):
```typescript
// app/api/courses/[id]/route.ts
import { NextRequest } from 'next/server'
import {
  createPublicRoute,
  createAuthenticatedRoute,
  successResponse,
  notFoundError
} from '@/lib/api'
import { validateRequest } from '@/lib/validation/validate'
import { courseUpdateSchema } from '@/lib/validation/schemas'
import { courseRepository } from '@/lib/db'

type RouteContext = { params: { id: string } }

export const GET = createPublicRoute<RouteContext>(
  async (request, { params }) => {
    const course = await courseRepository.findById(params.id)
    
    if (!course) {
      throw notFoundError('Course')
    }
    
    return successResponse({ course })
  }
)

export const PATCH = createAuthenticatedRoute<RouteContext>(
  async (request, { params }, user) => {
    const validation = await validateRequest(request, courseUpdateSchema)
    
    if (!validation.success) {
      throw validation.error
    }
    
    const course = await courseRepository.update(params.id, validation.data)
    
    return successResponse({ course })
  }
)
```

**Key Improvements**:
- ✅ No manual try-catch blocks (factory handles errors)
- ✅ No manual authentication (factory provides user)
- ✅ No manual error responses (error factories)
- ✅ Centralized validation (schemas)
- ✅ Repository pattern (courseRepository)
- ✅ Consistent response format (successResponse)
- ✅ 50% less code, 100% more maintainable


### Example 2: Repository Migration

**Before** (Standalone Functions):
```typescript
// lib/db/events.ts
import { createAdminClient } from '@/lib/supabase/admin'

export async function getEventById(id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data
}

export async function createEvent(eventData: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .insert(eventData)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateEvent(id: string, updates: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteEvent(id: string) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}
```

**After** (Repository Pattern):
```typescript
// lib/db/events.ts
import { BaseRepository } from './base-repository'
import { Event, EventInsert, EventUpdate } from '@/lib/types/supabase'

export class EventRepository extends BaseRepository<'events'> {
  constructor() {
    super('events')
  }
  
  // Domain-specific methods
  async findUpcoming(limit: number = 10): Promise<Event[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(limit)
    
    if (error) throw this.handleError(error)
    return data || []
  }
  
  async findBySlug(slug: string): Promise<Event | null> {
    return this.findOne({ slug })
  }
}

export const eventRepository = new EventRepository()
```

**Usage**:
```typescript
// Before
import { getEventById, createEvent, updateEvent, deleteEvent } from '@/lib/db/events'

const event = await getEventById(id)
const newEvent = await createEvent(data)
await updateEvent(id, updates)
await deleteEvent(id)

// After
import { eventRepository } from '@/lib/db'

const event = await eventRepository.findById(id)
const newEvent = await eventRepository.create(data)
await eventRepository.update(id, updates)
await eventRepository.delete(id)

// Plus new methods from BaseRepository
const events = await eventRepository.findAll({ status: 'published' })
const paginatedEvents = await eventRepository.paginate({ page: 1, limit: 20 })
const count = await eventRepository.count({ status: 'published' })
```


### Example 3: Validation Migration

**Before** (Inline Validation):
```typescript
export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const body = await request.json()
  
  // Inline validation
  if (!body.name || typeof body.name !== 'string') {
    throw badRequestError('Name is required')
  }
  
  if (body.name.length < 2 || body.name.length > 100) {
    throw badRequestError('Name must be between 2 and 100 characters')
  }
  
  if (!body.type || !['business', 'school', 'nonprofit'].includes(body.type)) {
    throw badRequestError('Invalid organization type')
  }
  
  if (body.industry && typeof body.industry !== 'string') {
    throw badRequestError('Industry must be a string')
  }
  
  // Create organization
  const org = await organizationRepository.create({
    name: body.name,
    type: body.type,
    industry: body.industry,
    owner_id: user.id
  })
  
  return successResponse(org, 201)
})
```

**After** (Schema Validation):
```typescript
import { validateRequest } from '@/lib/validation/validate'
import { organizationCreateSchema } from '@/lib/validation/schemas'

export const POST = createAuthenticatedRoute(async (request, context, user) => {
  // Validate with schema
  const validation = await validateRequest(request, organizationCreateSchema)
  
  if (!validation.success) {
    throw validation.error // Automatically formatted with field details
  }
  
  // data is fully typed based on schema
  const { data } = validation
  
  // Create organization
  const org = await organizationRepository.create({
    ...data,
    owner_id: user.id
  })
  
  return successResponse(org, 201)
})
```

**Schema Definition** (in `lib/validation/schemas.ts`):
```typescript
import { z } from 'zod'

export const organizationCreateSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.enum(['business', 'school', 'nonprofit']),
  industry: z.string().optional(),
  size_range: z.string().optional()
})
```

**Benefits**:
- ✅ Reusable validation logic
- ✅ Automatic type inference
- ✅ Structured error messages with field details
- ✅ Easier to test
- ✅ Self-documenting with schema


---

## Common Migration Scenarios

### Scenario 1: Adding a New API Route

**Step-by-Step**:

1. **Choose the right factory**:
   - Public data? → `createPublicRoute`
   - Requires login? → `createAuthenticatedRoute`
   - Admin only? → `createAdminRoute`

2. **Create validation schema** (if needed):
```typescript
// lib/validation/schemas.ts
export const myResourceCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['draft', 'published'])
})
```

3. **Create the route**:
```typescript
// app/api/my-resource/route.ts
import {
  createAuthenticatedRoute,
  successResponse,
  paginatedResponse,
  getPaginationParams
} from '@/lib/api'
import { validateRequest } from '@/lib/validation/validate'
import { myResourceCreateSchema } from '@/lib/validation/schemas'
import { myResourceRepository } from '@/lib/db'

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const { limit, offset } = getPaginationParams(request)
  
  const result = await myResourceRepository.paginate({
    page: Math.floor(offset / limit) + 1,
    limit,
    filters: { user_id: user.id }
  })
  
  return paginatedResponse(result.data, result.total, result.page, limit)
})

export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const validation = await validateRequest(request, myResourceCreateSchema)
  
  if (!validation.success) {
    throw validation.error
  }
  
  const resource = await myResourceRepository.create({
    ...validation.data,
    user_id: user.id
  })
  
  return successResponse(resource, 201)
})
```


### Scenario 2: Adding a New Repository

**Step-by-Step**:

1. **Create repository class**:
```typescript
// lib/db/my-resource.ts
import { BaseRepository } from './base-repository'
import { MyResource, MyResourceInsert, MyResourceUpdate } from '@/lib/types/supabase'

export class MyResourceRepository extends BaseRepository<'my_resources'> {
  constructor() {
    super('my_resources')
  }
  
  // Add domain-specific methods
  async findByUserId(userId: string): Promise<MyResource[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw this.handleError(error)
    return data || []
  }
  
  async findPublished(): Promise<MyResource[]> {
    return this.findAll({ status: 'published' })
  }
}

export const myResourceRepository = new MyResourceRepository()
```

2. **Export from barrel**:
```typescript
// lib/db/index.ts
export { myResourceRepository, MyResourceRepository } from './my-resource'
```

3. **Use in routes**:
```typescript
import { myResourceRepository } from '@/lib/db'

const resources = await myResourceRepository.findByUserId(user.id)
```

### Scenario 3: Handling Authorization

**Pattern**: Check permissions and throw appropriate errors

```typescript
import { forbiddenError, notFoundError } from '@/lib/api'
import { organizationRepository } from '@/lib/db'

export const PATCH = createAuthenticatedRoute(async (request, { params }, user) => {
  // Check if resource exists
  const org = await organizationRepository.findById(params.id)
  if (!org) {
    throw notFoundError('Organization')
  }
  
  // Check if user has permission
  const isAdmin = await organizationRepository.isUserAdmin(params.id, user.id)
  if (!isAdmin) {
    throw forbiddenError('You do not have permission to update this organization')
  }
  
  // Proceed with update
  const validation = await validateRequest(request, organizationUpdateSchema)
  if (!validation.success) {
    throw validation.error
  }
  
  const updated = await organizationRepository.update(params.id, validation.data)
  return successResponse(updated)
})
```


### Scenario 4: Working with Pagination

**Pattern**: Use repository pagination and response helper

```typescript
import {
  createPublicRoute,
  paginatedResponse,
  getPaginationParams,
  getQueryParam
} from '@/lib/api'
import { courseRepository } from '@/lib/db'

export const GET = createPublicRoute(async (request) => {
  // Extract pagination params (limit, offset)
  const { limit, offset } = getPaginationParams(request)
  
  // Extract filter params
  const category = getQueryParam(request, 'category')
  const status = getQueryParam(request, 'status')
  
  // Build filters
  const filters: any = {}
  if (category) filters.category = category
  if (status) filters.status = status
  
  // Paginate with filters
  const result = await courseRepository.paginate({
    page: Math.floor(offset / limit) + 1,
    limit,
    filters
  })
  
  // Return paginated response
  return paginatedResponse(result.data, result.total, result.page, limit)
})
```

**Response Format**:
```json
{
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

### Scenario 5: Caching Data

**Pattern**: Use cacheManager with proper keys and TTL

```typescript
import { cacheManager, cacheKeys } from '@/lib/cache'
import { courseRepository } from '@/lib/db'

export const GET = createPublicRoute(async (request, { params }) => {
  // Cache course details for 5 minutes
  const course = await cacheManager.memoize(
    cacheKeys.courseDetails(params.id),
    async () => {
      return await courseRepository.findById(params.id)
    },
    { ttl: 300, namespace: 'courses' }
  )
  
  if (!course) {
    throw notFoundError('Course')
  }
  
  return successResponse({ course })
})

// Invalidate cache on update
export const PATCH = createAuthenticatedRoute(async (request, { params }, user) => {
  const validation = await validateRequest(request, courseUpdateSchema)
  if (!validation.success) {
    throw validation.error
  }
  
  const course = await courseRepository.update(params.id, validation.data)
  
  // Clear cache for this course
  await cacheManager.clearKey(cacheKeys.courseDetails(params.id))
  
  // Or clear all course caches
  await cacheManager.clear('courses')
  
  return successResponse(course)
})
```


---

## Troubleshooting

### Issue 1: TypeScript Errors After Type Import Changes

**Symptom**: 
```
Cannot find module '@/types/database.types' or its corresponding type declarations
```

**Solution**:
```typescript
// Change this:
import { Database } from '@/types/database.types'

// To this:
import { Database } from '@/lib/types/supabase'
```

**Verify**: Run `npm run typecheck` to ensure no errors remain.

### Issue 2: Repository Method Not Found

**Symptom**:
```
Property 'getUserById' does not exist on type 'UserRepository'
```

**Solution**: Use BaseRepository methods instead of old function names
```typescript
// Old function name
const user = await getUserById(id)

// New repository method
const user = await userRepository.findById(id)
```

**Common Mappings**:
- `getXById(id)` → `repository.findById(id)`
- `getXByField(value)` → `repository.findBy('field', value)` or `repository.findOne({ field: value })`
- `createX(data)` → `repository.create(data)`
- `updateX(id, data)` → `repository.update(id, data)`
- `deleteX(id)` → `repository.delete(id)`
- `getAllX()` → `repository.findAll()`

### Issue 3: Route Factory Type Errors

**Symptom**:
```
Type 'Promise<NextResponse>' is not assignable to type 'Promise<Response>'
```

**Solution**: Use response helpers instead of NextResponse.json()
```typescript
// Don't use:
return NextResponse.json({ data })

// Use:
import { successResponse } from '@/lib/api'
return successResponse(data)
```

### Issue 4: Validation Errors Not Properly Formatted

**Symptom**: Validation errors return generic 400 instead of structured 422 with field details

**Solution**: Use validateRequest helper and throw the error
```typescript
// Don't do:
const body = await request.json()
if (!body.email) {
  throw badRequestError('Email required')
}

// Do:
const validation = await validateRequest(request, mySchema)
if (!validation.success) {
  throw validation.error // Properly formatted with field details
}
```


### Issue 5: Authentication Not Working

**Symptom**: User is undefined or route returns 401 unexpectedly

**Solution**: Ensure you're using the correct factory
```typescript
// For routes that require authentication:
export const GET = createAuthenticatedRoute(async (request, context, user) => {
  // user is guaranteed to exist here
  console.log(user.id)
})

// For public routes:
export const GET = createPublicRoute(async (request, context) => {
  // No user parameter - this is public
})

// For admin-only routes:
export const GET = createAdminRoute(async (request, context, user) => {
  // user is guaranteed to be an admin
})
```

### Issue 6: Cache Not Invalidating

**Symptom**: Stale data returned after updates

**Solution**: Clear cache after mutations
```typescript
import { cacheManager, cacheKeys } from '@/lib/cache'

// After update
await courseRepository.update(id, data)

// Clear specific cache
await cacheManager.clearKey(cacheKeys.courseDetails(id))

// Or clear entire namespace
await cacheManager.clear('courses')
```

### Issue 7: Error Not Being Caught by Factory

**Symptom**: Unhandled promise rejection or 500 error without proper formatting

**Solution**: Throw ApiError instances, not generic errors
```typescript
// Don't:
throw new Error('Something went wrong')

// Do:
import { internalError } from '@/lib/api'
throw internalError('Something went wrong')
```

### Issue 8: Missing Validation Schema

**Symptom**: 
```
Cannot find module '@/lib/validation/schemas' or 'mySchema' does not exist
```

**Solution**: Create the schema in `lib/validation/schemas.ts`
```typescript
// lib/validation/schemas.ts
import { z } from 'zod'

export const myResourceCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  // ... other fields
})
```

Then import and use:
```typescript
import { myResourceCreateSchema } from '@/lib/validation/schemas'
```


### Issue 9: Repository Constructor Errors

**Symptom**:
```
Expected 1-2 arguments, but got 0
```

**Solution**: Ensure repository extends BaseRepository correctly
```typescript
// Correct pattern:
export class MyRepository extends BaseRepository<'my_table'> {
  constructor() {
    super('my_table') // Pass table name to parent
  }
}

// With custom client:
export class MyRepository extends BaseRepository<'my_table'> {
  constructor(supabase?: TypedSupabaseClient) {
    super('my_table', supabase)
  }
}
```

### Issue 10: Pagination Not Working

**Symptom**: Pagination returns wrong page or incorrect total

**Solution**: Use repository.paginate() correctly
```typescript
import { getPaginationParams } from '@/lib/api'

const { limit, offset } = getPaginationParams(request)

// Convert offset to page number
const page = Math.floor(offset / limit) + 1

const result = await repository.paginate({
  page,
  limit,
  filters: { status: 'published' }
})

// result contains: { data, total, page, limit, totalPages }
```

---

## Testing Your Changes

### 1. TypeScript Compilation

Always verify TypeScript compilation after changes:
```bash
npm run typecheck
```

Expected output: `Found 0 errors`

### 2. Unit Tests

Run tests for modified code:
```bash
# Run all tests
npm test

# Run specific test file
npm test -- my-repository.test.ts

# Run with coverage
npm run test:coverage
```

### 3. Integration Tests

Test API routes manually or with integration tests:
```bash
# Start dev server
npm run dev

# Test endpoint
curl http://localhost:3000/api/my-resource
```


### 4. Manual Testing Checklist

For each migrated route, verify:

- [ ] **Authentication works correctly**
  - Unauthenticated requests return 401 (for authenticated routes)
  - Authenticated requests succeed
  - Admin routes reject non-admin users with 403

- [ ] **Validation works correctly**
  - Invalid input returns 422 with field details
  - Valid input is accepted
  - Optional fields work as expected

- [ ] **Error handling works correctly**
  - Not found returns 404 with proper message
  - Forbidden returns 403 with proper message
  - Server errors return 500 with proper message
  - Errors are logged appropriately

- [ ] **Response format is correct**
  - Success responses use `{ data: ... }` format
  - Paginated responses include pagination metadata
  - Error responses include error message and code

- [ ] **Business logic unchanged**
  - Same functionality as before migration
  - No regressions in behavior
  - Edge cases still handled correctly

### 5. Performance Testing

Verify caching and query performance:
```bash
# Check cache hit rates
# Monitor response times
# Verify database query counts
```

---

## Getting Help

### Resources

1. **Design Document**: `.kiro/specs/codebase-cleanup-optimization/design.md`
   - Complete architecture and patterns
   - Detailed examples and interfaces

2. **Requirements Document**: `.kiro/specs/codebase-cleanup-optimization/requirements.md`
   - All acceptance criteria
   - Validation requirements

3. **Task Summaries**: `.kiro/specs/codebase-cleanup-optimization/task-*-summary.md`
   - Detailed implementation notes
   - Specific changes made in each phase

4. **Example Code**:
   - `lib/db/users.ts` - Repository pattern example
   - `app/api/courses/route.ts` - Route factory example
   - `lib/validation/schemas.ts` - Validation schema examples


### Common Questions

**Q: Do I need to migrate all my code at once?**
A: No! The new patterns coexist with old code. Migrate incrementally, starting with new features or when modifying existing code.

**Q: What if I need a pattern that doesn't exist yet?**
A: Follow the existing patterns as closely as possible. If you need a new error type, validation schema, or repository method, add it to the appropriate centralized location and document it.

**Q: Can I still use manual try-catch in special cases?**
A: The factory pattern handles most errors automatically. Only use manual try-catch for specific error recovery logic, not for general error handling.

**Q: How do I handle file uploads or streaming responses?**
A: For special response types, you can still return NextResponse directly from factory routes. The factory only transforms thrown errors and standard responses.

**Q: What about WebSocket or SSE routes?**
A: These don't fit the factory pattern. Continue using standard Next.js patterns for real-time routes.

**Q: How do I test routes that use the factory pattern?**
A: Create test requests and call the route handler directly. The factory returns a standard Response object that you can test.

```typescript
import { GET } from './route'
import { createTestRequest } from '@/test/utils'

const request = createTestRequest('GET', '/api/courses')
const response = await GET(request, {})
const data = await response.json()

expect(response.status).toBe(200)
expect(data.courses).toBeInstanceOf(Array)
```

### Quick Reference

**Import Paths**:
```typescript
// Types
import { Database, Profile, Course } from '@/lib/types/supabase'

// Repositories
import { userRepository, courseRepository } from '@/lib/db'

// API Utilities
import {
  createAuthenticatedRoute,
  createPublicRoute,
  createAdminRoute,
  successResponse,
  paginatedResponse,
  notFoundError,
  forbiddenError,
  validationError
} from '@/lib/api'

// Validation
import { validateRequest } from '@/lib/validation/validate'
import { courseCreateSchema } from '@/lib/validation/schemas'

// Caching
import { cacheManager, cacheKeys } from '@/lib/cache'
```


**Error Factories**:
```typescript
unauthorizedError(message?)      // 401 - Not authenticated
forbiddenError(message?)          // 403 - No permission
notFoundError(resource?)          // 404 - Resource not found
badRequestError(message?, details?) // 400 - Invalid request
validationError(message?, details?) // 422 - Validation failed
conflictError(message?)           // 409 - Duplicate/conflict
internalError(message?)           // 500 - Server error
rateLimitError(message?)          // 429 - Too many requests
```

**Repository Methods**:
```typescript
// CRUD operations
findById(id)                      // Get by ID (throws if not found)
findByIdOrNull(id)                // Get by ID (returns null if not found)
findAll(filters?, options?)       // Get all matching filters
findOne(filters)                  // Get first match (returns null if not found)
findBy(field, value)              // Get by single field
create(data)                      // Create new record
createMany(data[])                // Bulk create
update(id, data)                  // Update by ID
updateMany(filters, data)         // Bulk update
delete(id)                        // Delete by ID
deleteMany(filters)               // Bulk delete

// Utilities
count(filters?)                   // Count records
exists(id)                        // Check if exists
paginate(options)                 // Paginated results
```

**Cache TTL Standards**:
```typescript
120   // 2 minutes  - User-specific data
300   // 5 minutes  - Public content
600   // 10 minutes - Aggregated stats
3600  // 1 hour     - Static content
```

---

## Summary

This migration guide covers the major patterns and changes from the codebase cleanup initiative. The key principles are:

1. **Single Source of Truth**: One place for types, validation, errors
2. **Consistency**: Same patterns everywhere
3. **Type Safety**: No `as any`, proper TypeScript types
4. **Simplicity**: Less boilerplate, more maintainable code
5. **Testability**: Easier to test with standardized patterns

When in doubt, look at existing migrated code for examples. The patterns are consistent across the codebase, so once you understand one route or repository, you understand them all.

Happy coding! 🚀

