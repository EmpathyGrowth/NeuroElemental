# Design Document

## Overview

This design establishes a comprehensive refactoring strategy to eliminate technical debt, consolidate duplicate patterns, enforce type safety, and standardize architectural approaches across the Next.js 16 application. The refactoring will be executed in phases to minimize risk while maximizing impact.

The core principle is **progressive enhancement**: we'll establish solid foundations (types, base patterns) first, then systematically migrate existing code to use these patterns, ensuring the application remains functional throughout the process.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js App Router                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  API Routes  │  │    Pages     │  │  Components  │      │
│  │              │  │              │  │              │      │
│  │ - Factory    │  │ - Server     │  │ - Client     │      │
│  │   Pattern    │  │   Components │  │   Components │      │
│  │ - Standard   │  │ - Data       │  │ - UI         │      │
│  │   Errors     │  │   Fetching   │  │   Logic      │      │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘      │
│         │                  │                                 │
│         └──────────────────┼─────────────────────────────┐  │
│                            │                             │  │
│  ┌─────────────────────────▼──────────────────────────┐  │  │
│  │           Business Logic Layer                     │  │  │
│  │                                                     │  │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │  │  │
│  │  │ Repositories │  │  Services    │  │  Utils  │ │  │  │
│  │  │              │  │              │  │         │ │  │  │
│  │  │ - Base       │  │ - Cache      │  │ - API   │ │  │  │
│  │  │ - Extended   │  │ - Email      │  │ - Auth  │ │  │  │
│  │  │ - Typed      │  │ - Billing    │  │ - Valid │ │  │  │
│  │  └──────┬───────┘  └──────────────┘  └─────────┘ │  │  │
│  │         │                                         │  │  │
│  └─────────┼─────────────────────────────────────────┘  │  │
│            │                                             │  │
│  ┌─────────▼──────────────────────────────────────────┐ │  │
│  │         Data Access Layer                          │ │  │
│  │                                                     │ │  │
│  │  ┌──────────────────────────────────────────────┐ │ │  │
│  │  │      Supabase Client (Typed)                 │ │ │  │
│  │  │  - Admin Client                              │ │ │  │
│  │  │  - Server Client                             │ │ │  │
│  │  │  - Type-safe queries                         │ │ │  │
│  │  └──────────────────────────────────────────────┘ │ │  │
│  └────────────────────────────────────────────────────┘ │  │
│                                                           │  │
└───────────────────────────────────────────────────────────┘  │
                                                                │
┌───────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────┐
│  │              Supabase PostgreSQL                      │
│  │  - Tables                                             │
│  │  - RLS Policies                                       │
│  │  - Functions                                          │
│  └──────────────────────────────────────────────────────┘
```

### Layered Architecture Principles

1. **API Layer**: Thin handlers using factory pattern, no business logic
2. **Business Logic Layer**: Repositories and services, reusable across routes
3. **Data Access Layer**: Type-safe Supabase client wrappers
4. **Separation of Concerns**: Each layer has clear responsibilities

## Components and Interfaces

### 1. Type System Consolidation

#### Single Source of Truth

```typescript
// lib/types/supabase.ts (CANONICAL)
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

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
```

#### Migration Strategy

- **Phase 1**: Consolidate types/database.types.ts and types/supabase.ts into lib/types/supabase.ts
- **Phase 2**: Update all imports to use @/lib/types/supabase
- **Phase 3**: Delete obsolete type files
- **Phase 4**: Verify zero TypeScript errors

### 2. Unified Repository Pattern

#### Base Repository (Consolidated)

```typescript
// lib/db/base-repository.ts (ENHANCED)
export class BaseRepository<T extends Tables> {
  protected supabase: TypedSupabaseClient
  protected tableName: T

  constructor(tableName: T, supabase?: TypedSupabaseClient) {
    this.tableName = tableName
    this.supabase = supabase || createAdminClient()
  }

  // Core CRUD
  async findById(id: string): Promise<Row<T>>
  async findByIdOrNull(id: string): Promise<Row<T> | null>
  async findAll(filters?: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>[]>
  async findOne(filters: Partial<Row<T>>): Promise<Row<T> | null>
  async create(data: Insert<T>): Promise<Row<T>>
  async createMany(data: Insert<T>[]): Promise<Row<T>[]>
  async update(id: string, data: Update<T>): Promise<Row<T>>
  async updateMany(filters: Partial<Row<T>>, data: Update<T>): Promise<Row<T>[]>
  async delete(id: string): Promise<void>
  async deleteMany(filters: Partial<Row<T>>): Promise<void>
  
  // Utilities
  async count(filters?: Partial<Row<T>>): Promise<number>
  async exists(id: string): Promise<boolean>
  async paginate(options: PaginationOptions): Promise<PaginatedResult<Row<T>>>
}

// Query options interface
interface QueryOptions {
  orderBy?: { column: string; ascending?: boolean }
  limit?: number
  offset?: number
}

interface PaginationOptions extends QueryOptions {
  page: number
  limit: number
  filters?: Record<string, any>
}
```

#### Extended Repositories

```typescript
// lib/db/users.ts
export class UserRepository extends BaseRepository<'profiles'> {
  constructor() {
    super('profiles')
  }

  // Domain-specific methods
  async findByEmail(email: string): Promise<Profile | null>
  async updateRole(userId: string, role: string): Promise<Profile>
  async searchUsers(query: string, limit?: number): Promise<Profile[]>
  async softDelete(userId: string): Promise<void>
}

// Export singleton
export const userRepository = new UserRepository()
```

#### Migration Strategy

- **Phase 1**: Enhance BaseRepository with missing methods from base-crud.ts
- **Phase 2**: Migrate all db modules to extend BaseRepository
- **Phase 3**: Remove base-crud.ts
- **Phase 4**: Update all imports

### 3. API Route Factory Pattern

#### Factory Functions

```typescript
// lib/api/route-factory.ts (CURRENT - NO CHANGES NEEDED)
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

#### Standard Route Structure

```typescript
// app/api/[resource]/route.ts (TEMPLATE)
import {
  createAuthenticatedRoute,
  createPublicRoute,
  successResponse,
  paginatedResponse,
  getPaginationParams,
  getQueryParam
} from '@/lib/api'
import { resourceRepository } from '@/lib/db/resources'

export const GET = createPublicRoute(async (request) => {
  const { limit, offset } = getPaginationParams(request)
  const filter = getQueryParam(request, 'filter')
  
  const result = await resourceRepository.paginate({
    page: Math.floor(offset / limit) + 1,
    limit,
    filters: filter ? { status: filter } : undefined
  })
  
  return paginatedResponse(result.data, result.total, result.page, limit)
})

export const POST = createAuthenticatedRoute(async (request, _context, user) => {
  const body = await request.json()
  const resource = await resourceRepository.create({
    ...body,
    created_by: user.id
  })
  
  return successResponse(resource, 201)
})
```

#### Migration Strategy

- **Phase 1**: Identify routes not using factory pattern
- **Phase 2**: Refactor routes one-by-one to use factories
- **Phase 3**: Remove manual try-catch blocks
- **Phase 4**: Standardize response formats

### 4. Error Handling System

#### Error Hierarchy

```typescript
// lib/api/error-handler.ts (CURRENT - MINOR ENHANCEMENTS)
export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public code?: string,
    public details?: any
  )
}

// Error factories (existing)
export function unauthorizedError(message?: string): ApiError
export function forbiddenError(message?: string): ApiError
export function notFoundError(resource?: string): ApiError
export function badRequestError(message?: string, details?: any): ApiError
export function validationError(message?: string, details?: any): ApiError
export function conflictError(message?: string): ApiError
export function internalError(message?: string): ApiError
export function rateLimitError(message?: string): ApiError
```

#### Usage Pattern

```typescript
// In route handlers
if (!resource) {
  throw notFoundError('Resource')
}

if (validation.errors) {
  throw validationError('Invalid input', validation.errors)
}

// Factory handles conversion to NextResponse automatically
```

### 5. Validation System

#### Schema Definition

```typescript
// lib/validation/schemas.ts (ENHANCED)
import { z } from 'zod'

// Reusable field schemas
export const emailSchema = z.string().email()
export const uuidSchema = z.string().uuid()
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/)

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
  category: z.string().optional()
})

// ... more schemas
```

#### Validation Helper

```typescript
// lib/validation/validate.ts (ENHANCED)
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: validationError('Validation failed', error.errors)
      }
    }
    return {
      success: false,
      error: badRequestError('Invalid request body')
    }
  }
}
```

### 6. Cache Management

#### Cache Strategy

```typescript
// lib/cache/cache-manager.ts (CURRENT - GOOD)
export const cacheManager = {
  async memoize<T>(
    key: string,
    fn: () => Promise<T>,
    options?: { ttl?: number; namespace?: string }
  ): Promise<T>
  
  async clear(namespace?: string): Promise<void>
  async clearKey(key: string): Promise<void>
}

// Cache key generators
export const cacheKeys = {
  userOrganizations: (userId: string) => `user:${userId}:organizations`,
  courseDetails: (courseId: string) => `course:${courseId}:details`,
  courseEnrollments: (courseId: string) => `course:${courseId}:enrollments`,
  // ... more key generators
}
```

#### TTL Standards

- **User-specific data**: 2 minutes (120s)
- **Public content**: 5 minutes (300s)
- **Static content**: 1 hour (3600s)
- **Aggregated stats**: 10 minutes (600s)

## Data Models

### Repository Instances

```typescript
// lib/db/index.ts (BARREL EXPORT)
export { BaseRepository, createRepository } from './base-repository'
export { userRepository, UserRepository } from './users'
export { courseRepository, CourseRepository } from './courses'
export { organizationRepository, OrganizationRepository } from './organizations'
export { eventRepository, EventRepository } from './events'
// ... more repositories
```

### Type Exports

```typescript
// lib/types/supabase.ts
export type Profile = Tables<'profiles'>
export type Course = Tables<'courses'>
export type Organization = Tables<'organizations'>
export type Event = Tables<'events'>

export type ProfileInsert = TablesInsert<'profiles'>
export type CourseInsert = TablesInsert<'courses'>

export type ProfileUpdate = TablesUpdate<'profiles'>
export type CourseUpdate = TablesUpdate<'courses'>
```


## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Single Type Source Import Consistency

*For any* TypeScript file in the codebase that imports database types, all imports SHALL reference @/lib/types/supabase exclusively.
**Validates: Requirements 1.2**

### Property 2: Type Assertion Absence

*For any* file containing Supabase queries, the code SHALL contain zero type assertions ('as any', 'as unknown', etc.).
**Validates: Requirements 1.4, 8.1**

### Property 3: Repository Pattern Usage

*For any* database operation in the codebase, the operation SHALL be performed through BaseRepository or its extensions.
**Validates: Requirements 2.1**

### Property 4: CRUD Operation Uniqueness

*For any* CRUD operation type (create, read, update, delete) on a table, the operation SHALL exist in exactly one location (the repository for that table).
**Validates: Requirements 2.3**

### Property 5: Repository Return Type Consistency

*For any* repository method, the return type SHALL follow consistent patterns: Promise<T> for single items, Promise<T[]> for lists, Promise<void> for deletions.
**Validates: Requirements 2.5**

### Property 6: Route Factory Adoption

*For any* API route file in app/api, the route handlers SHALL use createAuthenticatedRoute, createPublicRoute, or createAdminRoute.
**Validates: Requirements 3.1, 3.2, 3.3**

### Property 7: Response Helper Usage

*For any* route handler return statement, the response SHALL use successResponse, errorResponse, or paginatedResponse helpers.
**Validates: Requirements 3.4**

### Property 8: Try-Catch Absence in Routes

*For any* route handler using factory pattern, the handler SHALL not contain manual try-catch blocks.
**Validates: Requirements 3.5**

### Property 9: Standard Client Creation

*For any* Supabase client instantiation, the code SHALL use createAdminClient from @/lib/supabase/admin.
**Validates: Requirements 4.1**

### Property 10: Client Type Annotation

*For any* Supabase client variable, the type annotation SHALL use TypedSupabaseClient or Database from @/lib/types/supabase.
**Validates: Requirements 4.3**

### Property 11: Repository Constructor Signature

*For any* repository class constructor, the constructor SHALL accept an optional supabase client parameter.
**Validates: Requirements 4.4**

### Property 12: API Barrel Import Usage

*For any* import of API utilities (error handlers, route factories, helpers), the import SHALL use @/lib/api barrel export.
**Validates: Requirements 5.1**

### Property 13: Consolidated Module Imports

*For any* file importing multiple utilities from the same module, the file SHALL use a single import statement.
**Validates: Requirements 5.2**

### Property 14: Complete Barrel Exports

*For any* utility file in lib/api/*, the utility SHALL be exported through lib/api/index.ts.
**Validates: Requirements 5.3**

### Property 15: ApiError Usage

*For any* error thrown in business logic or routes, the error SHALL be an instance of ApiError or created via error factory functions.
**Validates: Requirements 6.1**

### Property 16: Error Response Helper Usage

*For any* error return in route handlers, the return SHALL use errorResponse helper.
**Validates: Requirements 6.2**

### Property 17: Validation Error Pattern

*For any* validation failure, the code SHALL throw validationError with structured details.
**Validates: Requirements 6.3, 9.4**

### Property 18: Not Found Error Pattern

*For any* resource lookup that fails, the code SHALL throw notFoundError with resource name.
**Validates: Requirements 6.4**

### Property 19: Pagination Helper Usage

*For any* pagination logic, the code SHALL use formatPaginationMeta helper.
**Validates: Requirements 7.3**

### Property 20: Course Enrollment Helper Usage

*For any* course enrollment verification, the code SHALL use requireCourseEnrollment helper.
**Validates: Requirements 7.4**

### Property 21: Organization Access Helper Usage

*For any* organization access verification, the code SHALL use requireOrganizationAccess helper.
**Validates: Requirements 7.5**

### Property 22: Repository Return Type Annotations

*For any* repository method, the method SHALL have explicit return type annotations.
**Validates: Requirements 8.3**

### Property 23: Validation Schema Import

*For any* request validation, the validation SHALL use schemas imported from @/lib/validation/schemas.
**Validates: Requirements 9.1**

### Property 24: No Inline Validation

*For any* validation logic, the validation SHALL use reusable schemas rather than inline validation code.
**Validates: Requirements 9.2**

### Property 25: Validation Helper Usage

*For any* request body validation, the code SHALL use validateRequest helper function.
**Validates: Requirements 9.3**

### Property 26: Cache Manager Usage

*For any* caching operation, the code SHALL use cacheManager.memoize for reads and cacheManager.clear for invalidation.
**Validates: Requirements 10.1**

### Property 27: Cache Key Helper Usage

*For any* cache key generation, the code SHALL use cacheKeys helper functions.
**Validates: Requirements 10.2**

### Property 28: Cache Namespace Usage

*For any* cache invalidation, the clear call SHALL include a namespace parameter.
**Validates: Requirements 10.3, 10.5**

### Property 29: TTL Consistency

*For any* two caching operations on the same data type, the TTL values SHALL be identical.
**Validates: Requirements 10.4**

### Property 30: Repository Test Coverage

*For any* repository class, a corresponding test file SHALL exist in the same directory or __tests__ subdirectory.
**Validates: Requirements 11.1**

### Property 31: Route Test Coverage

*For any* refactored API route, a corresponding integration test file SHALL exist.
**Validates: Requirements 11.2**

### Property 32: Utility JSDoc Coverage

*For any* utility function in lib/*, the function SHALL include JSDoc comments with description and examples.
**Validates: Requirements 12.3**

## Error Handling

### Error Categories

1. **Validation Errors (422)**: Input data fails schema validation
2. **Authentication Errors (401)**: User not authenticated
3. **Authorization Errors (403)**: User lacks permissions
4. **Not Found Errors (404)**: Resource doesn't exist
5. **Conflict Errors (409)**: Duplicate or conflicting data
6. **Internal Errors (500)**: Unexpected system failures

### Error Response Format

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

### Error Handling Flow

```
Route Handler
    ↓
  Throws ApiError
    ↓
Factory Catches Error
    ↓
errorResponse() Converts to NextResponse
    ↓
Client Receives Structured Error
```

### Database Error Mapping

- **23505 (Unique Violation)** → 409 Conflict
- **23503 (Foreign Key Violation)** → 400 Bad Request
- **PGRST116 (Not Found)** → 404 Not Found

## Testing Strategy

### Unit Testing

**Scope**: Individual functions, classes, and utilities

**Framework**: Vitest with @testing-library/react for components

**Coverage Targets**:
- Repository methods: 90%
- Utility functions: 85%
- Error handlers: 95%
- Validation schemas: 90%

**Example Unit Test**:

```typescript
// lib/db/__tests__/base-repository.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { BaseRepository } from '../base-repository'
import { createMockSupabaseClient } from '@/test/utils'

describe('BaseRepository', () => {
  let repository: BaseRepository<'profiles'>
  let mockClient: any

  beforeEach(() => {
    mockClient = createMockSupabaseClient()
    repository = new BaseRepository('profiles', mockClient)
  })

  it('should find record by id', async () => {
    const mockProfile = { id: '123', email: 'test@example.com' }
    mockClient.from().select().eq().single.mockResolvedValue({
      data: mockProfile,
      error: null
    })

    const result = await repository.findById('123')
    expect(result).toEqual(mockProfile)
  })

  it('should throw notFoundError when record does not exist', async () => {
    mockClient.from().select().eq().single.mockResolvedValue({
      data: null,
      error: { message: 'Not found' }
    })

    await expect(repository.findById('999')).rejects.toThrow('profiles not found')
  })
})
```

### Integration Testing

**Scope**: API routes with database interactions

**Framework**: Vitest with Supabase test client

**Coverage Targets**:
- API routes: 80%
- End-to-end flows: 75%

**Example Integration Test**:

```typescript
// app/api/courses/__tests__/route.test.ts
import { describe, it, expect } from 'vitest'
import { GET, POST } from '../route'
import { createTestRequest, createTestUser } from '@/test/utils'

describe('GET /api/courses', () => {
  it('should return paginated courses', async () => {
    const request = createTestRequest('GET', '/api/courses?limit=10')
    const response = await GET(request, {})
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.courses).toBeInstanceOf(Array)
    expect(data.pagination).toHaveProperty('total')
    expect(data.pagination).toHaveProperty('limit', 10)
  })

  it('should filter courses by category', async () => {
    const request = createTestRequest('GET', '/api/courses?category=neuroscience')
    const response = await GET(request, {})
    const data = await response.json()

    expect(data.courses.every(c => c.category === 'neuroscience')).toBe(true)
  })
})

describe('POST /api/courses', () => {
  it('should require authentication', async () => {
    const request = createTestRequest('POST', '/api/courses', {
      title: 'New Course'
    })
    const response = await POST(request, {})

    expect(response.status).toBe(401)
  })

  it('should create course when authenticated', async () => {
    const user = await createTestUser({ role: 'instructor' })
    const request = createTestRequest('POST', '/api/courses', {
      title: 'New Course',
      slug: 'new-course',
      price_usd: 99
    }, { user })

    const response = await POST(request, {})
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.title).toBe('New Course')
  })
})
```

### Property-Based Testing

**Scope**: Critical business logic with complex input spaces

**Framework**: fast-check (JavaScript property-based testing library)

**Target Areas**:
- Slug generation from arbitrary strings
- Pagination calculations
- Cache key generation
- Validation schema edge cases

**Example Property Test**:

```typescript
// lib/utils/__tests__/slug.property.test.ts
import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import { generateSlug } from '../slug'

describe('generateSlug property tests', () => {
  it('should always produce valid slugs from any string', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug = generateSlug(input)
        
        // Property 1: Slug matches valid pattern
        expect(slug).toMatch(/^[a-z0-9-]*$/)
        
        // Property 2: No leading/trailing hyphens
        expect(slug).not.toMatch(/^-|-$/)
        
        // Property 3: No consecutive hyphens
        expect(slug).not.toMatch(/--/)
      }),
      { numRuns: 100 }
    )
  })

  it('should be idempotent - generating slug of slug returns same slug', () => {
    fc.assert(
      fc.property(fc.string(), (input) => {
        const slug1 = generateSlug(input)
        const slug2 = generateSlug(slug1)
        expect(slug1).toBe(slug2)
      }),
      { numRuns: 100 }
    )
  })
})
```

### Test Organization

```
lib/
  db/
    base-repository.ts
    __tests__/
      base-repository.test.ts
      base-repository.property.test.ts
  api/
    error-handler.ts
    __tests__/
      error-handler.test.ts
  validation/
    schemas.ts
    __tests__/
      schemas.test.ts

app/
  api/
    courses/
      route.ts
      __tests__/
        route.test.ts
```

### Testing Requirements

1. **All repository methods** MUST have unit tests
2. **All refactored API routes** MUST have integration tests
3. **Critical utilities** SHOULD have property-based tests
4. **Error scenarios** MUST be tested for each route
5. **Validation schemas** MUST test edge cases and invalid inputs

### Test Execution

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- base-repository.test.ts

# Run in watch mode during development
npm test -- --watch
```

### Coverage Thresholds

```javascript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
      exclude: [
        'node_modules/',
        '__tests__/',
        '*.config.*',
        'types/'
      ]
    }
  }
})
```

## Implementation Phases

### Phase 1: Foundation (Type System & Base Patterns)

**Duration**: 2-3 days

**Goals**:
- Consolidate type definitions
- Enhance BaseRepository
- Verify zero TypeScript errors

**Deliverables**:
- Single lib/types/supabase.ts file
- Enhanced BaseRepository with all CRUD methods
- Removed base-crud.ts
- Zero tsc errors

### Phase 2: Repository Migration

**Duration**: 3-4 days

**Goals**:
- Migrate all db modules to use BaseRepository
- Remove duplicate CRUD operations
- Add repository tests

**Deliverables**:
- All db modules extend BaseRepository
- Comprehensive repository test suite
- Barrel export from lib/db/index.ts

### Phase 3: API Route Standardization

**Duration**: 4-5 days

**Goals**:
- Refactor all routes to use factory pattern
- Standardize error handling
- Add route integration tests

**Deliverables**:
- All routes use createAuthenticatedRoute/createPublicRoute/createAdminRoute
- Consistent error responses
- Integration test coverage >75%

### Phase 4: Validation & Caching

**Duration**: 2-3 days

**Goals**:
- Centralize validation schemas
- Standardize caching patterns
- Add validation tests

**Deliverables**:
- All validation in lib/validation/schemas
- Consistent cache key generation
- Validation test coverage >90%

### Phase 5: Documentation & Cleanup

**Duration**: 1-2 days

**Goals**:
- Update ARCHITECTURE.md
- Add JSDoc to all utilities
- Final verification

**Deliverables**:
- Comprehensive architecture documentation
- Migration guide for team
- Final test run with >80% coverage

## Migration Strategy

### Backward Compatibility

During migration, both old and new patterns will coexist temporarily:

1. **Dual Exports**: Keep old functions while adding new repository methods
2. **Gradual Migration**: Migrate routes one at a time
3. **Feature Flags**: Use environment variables to toggle new implementations
4. **Rollback Plan**: Git branches for each phase

### Risk Mitigation

1. **Comprehensive Testing**: Test each change before proceeding
2. **Incremental Deployment**: Deploy phases separately
3. **Monitoring**: Watch error rates and performance metrics
4. **Quick Rollback**: Maintain ability to revert changes

### Team Communication

1. **Daily Updates**: Share progress in team channel
2. **Code Reviews**: Require review for each phase
3. **Documentation**: Update docs as patterns change
4. **Training**: Pair programming sessions for new patterns

## Performance Considerations

### Database Query Optimization

- Use select() with specific columns instead of select('*')
- Implement proper indexing for frequently queried fields
- Use pagination for large result sets
- Cache frequently accessed data

### Caching Strategy

- **User-specific data**: Short TTL (2 min) due to frequent changes
- **Public content**: Medium TTL (5 min) for balance
- **Static content**: Long TTL (1 hour) for rarely changing data
- **Namespace-based invalidation**: Clear related caches efficiently

### Bundle Size

- Tree-shaking through barrel exports
- Lazy loading for heavy components
- Code splitting for routes

## Security Considerations

### Authentication & Authorization

- All authenticated routes use factory pattern with built-in auth
- Admin routes use createAdminRoute with role verification
- Organization access uses requireOrganizationAccess helper

### Input Validation

- All inputs validated with Zod schemas
- SQL injection prevented by Supabase parameterized queries
- XSS prevention through proper escaping

### Error Messages

- Don't expose internal details in production
- Use generic messages for security-sensitive errors
- Log detailed errors server-side only

## Monitoring & Observability

### Metrics to Track

- API response times
- Error rates by endpoint
- Cache hit/miss ratios
- Database query performance
- TypeScript compilation time

### Logging Strategy

- Use structured logging with logger utility
- Log all errors with context
- Track user actions for audit
- Monitor cache invalidation patterns

## Success Criteria

### Technical Metrics

- ✅ Zero TypeScript compilation errors
- ✅ Zero 'as any' type assertions
- ✅ 100% of routes use factory pattern
- ✅ 100% of db operations use repositories
- ✅ >80% test coverage on refactored code
- ✅ <100ms average API response time
- ✅ >90% cache hit rate for public content

### Code Quality Metrics

- ✅ Single source of truth for types
- ✅ No duplicate CRUD operations
- ✅ Consistent error handling
- ✅ Centralized validation schemas
- ✅ Complete JSDoc coverage for utilities

### Team Metrics

- ✅ All team members trained on new patterns
- ✅ Architecture documentation complete
- ✅ Migration guide available
- ✅ Zero production incidents during rollout
