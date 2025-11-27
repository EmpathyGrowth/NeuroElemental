# Development Guide

**Best practices and standards for developing NeuroElemental**

Last Updated: 2025-11-23

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [API Route Development](#api-route-development)
3. [Factory Pattern Guide](#factory-pattern-guide)
4. [Code Quality](#code-quality)
5. [Testing](#testing)
6. [Technical Debt & Cleanup](#technical-debt--cleanup)
7. [Optimization Guidelines](#optimization-guidelines)

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (preferred) or npm
- Git
- VS Code (recommended)

### Development Setup

```bash
# Clone repository
git clone <repository-url>
cd NeuroElemental

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

### Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Build for production
npm run start              # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run lint -- --fix      # Fix auto-fixable issues
npm run typecheck          # TypeScript type checking

# Testing
npm run test               # Run tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report

# Database
npx supabase migration new [name]  # Create migration
npx supabase db push               # Apply migrations
npx supabase gen types typescript  # Generate types
```

---

## API Route Development

### Core Principles

All API routes follow a standardized factory pattern:

1. **Use factory functions** - Never use `export async function GET/POST/etc`
2. **Centralized auth** - Authentication handled by factories
3. **Throw errors** - Use typed errors, never return error responses
4. **Type-safe params** - Always use `await context.params`
5. **Preserve business logic** - Focus on what, not how

### Available Factory Functions

| Factory | Use Case | Auth Required |
|---------|----------|---------------|
| `createAuthenticatedRoute` | User must be logged in | ✅ Yes |
| `createAdminRoute` | Admin-only access | ✅ Admin |
| `createPublicRoute` | No authentication | ❌ No |

---

## Factory Pattern Guide

### Simple Authenticated Route

```typescript
import { createAuthenticatedRoute, successResponse, notFoundError } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db/supabase-server'

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('table_name')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    throw notFoundError('Resource')
  }

  return successResponse({ data })
})
```

### Organization Route with Permission Check

```typescript
import { createAuthenticatedRoute, successResponse, forbiddenError } from '@/lib/api'
import { isUserOrgAdmin } from '@/lib/db/organizations'
import { getSupabaseServer } from '@/lib/db/supabase-server'

export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params

  // Verify admin access
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Admin access required')

  const body = await request.json()

  // Create resource
  const supabase = getSupabaseServer()
  const { data, error } = await supabase
    .from('organization_resources')
    .insert({
      organization_id: id,
      created_by: user.id,
      ...body,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  return successResponse({ data }, 201)
})
```

### Admin-Only Route

```typescript
import { createAdminRoute, paginatedResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db/supabase-server'

export const GET = createAdminRoute(async (request, context, { userId, user }) => {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') || '20')
  const offset = parseInt(searchParams.get('offset') || '0')
  const page = Math.floor(offset / limit) + 1

  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from('admin_resources')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw new Error(error.message)

  const { count } = await supabase
    .from('admin_resources')
    .select('*', { count: 'exact', head: true })

  return paginatedResponse(data || [], count || 0, page, limit)
})
```

### Public Webhook Route

```typescript
import { createPublicRoute, badRequestError, successResponse } from '@/lib/api'

export const dynamic = 'force-dynamic'

export const POST = createPublicRoute(async (request, context) => {
  // Validate webhook signature
  const signature = request.headers.get('x-webhook-signature')
  const body = await request.text()

  if (!signature) {
    throw badRequestError('Missing signature')
  }

  // Verify signature
  const isValid = verifyWebhookSignature(body, signature)
  if (!isValid) {
    throw badRequestError('Invalid signature')
  }

  // Process event
  const event = JSON.parse(body)
  await handleWebhookEvent(event)

  return successResponse({ received: true })
})
```

### Error Handling

Available error functions from `@/lib/api`:

```typescript
import {
  unauthorizedError,    // 401 - Not authenticated
  forbiddenError,       // 403 - Not authorized
  badRequestError,      // 400 - Invalid request
  notFoundError,        // 404 - Resource not found
  conflictError,        // 409 - Conflict (duplicate)
  internalError,        // 500 - Server error
} from '@/lib/api'

// Usage
throw notFoundError('User')
throw forbiddenError('Only organization admins can perform this action')
throw badRequestError('Email is required')
throw conflictError('User already exists')
```

### Response Helpers

```typescript
import { successResponse, paginatedResponse, HTTP_STATUS } from '@/lib/api'

// Simple success
return successResponse({ user })

// Success with custom status code
return successResponse({ created: true }, HTTP_STATUS.CREATED)

// Paginated response
return paginatedResponse(items, totalCount, page, limit)
```

---

## Code Quality

### TypeScript Standards

**Type Safety:**
- ❌ Avoid `as any` - use proper types
- ✅ Use generated database types from Supabase
- ✅ Define interfaces for all data structures
- ✅ Use type guards for runtime checks

**Example:**
```typescript
// ❌ Bad
const data = await supabase.from('users').select('*') as any

// ✅ Good
import { Tables } from '@/types'
const { data } = await supabase
  .from('users')
  .select('*')
  .returns<Tables<'users'>[]>()
```

### ESLint Configuration

Run lint checks before committing:

```bash
npm run lint          # Check for issues
npm run lint -- --fix # Auto-fix issues
```

### Code Style

- Use 2-space indentation
- Use single quotes for strings
- Add trailing commas
- Use semicolons
- Prefer `const` over `let`
- Use descriptive variable names
- Add JSDoc comments for public functions

---

## Testing

### Testing Infrastructure

NeuroElemental uses Vitest + React Testing Library.

### Writing Tests

**Test Structure:**
```typescript
import { describe, it, expect, beforeEach } from 'vitest'

describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
  })

  it('should do something', () => {
    // Arrange
    const input = 'test'

    // Act
    const result = functionToTest(input)

    // Assert
    expect(result).toBe('expected')
  })
})
```

**API Route Testing:**
```typescript
import { POST } from './route'

describe('POST /api/resource', () => {
  it('should create resource', async () => {
    const request = new Request('http://localhost/api/resource', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })

    const response = await POST(request, { params: Promise.resolve({}) })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
  })
})
```

### Testing Priorities

1. **Authentication flows** - Sign up, sign in, password reset
2. **Payment flows** - Checkout, webhooks, subscriptions
3. **API routes** - Critical business logic
4. **UI components** - Forms, dashboards, assessment

**Target:** 80%+ test coverage on critical paths

---

## Technical Debt & Cleanup

### Priority Issues

**1. Type Safety (Critical):**
- Fix 251 instances of `as any`
- Update Supabase client types
- Fix API route handlers
- Estimated time: 6-8 hours

**2. Input Validation (Critical):**
- Add Zod schemas for all API endpoints
- Create validation middleware
- Apply to all routes
- Estimated time: 4-5 hours

**3. Error Tracking (High):**
- Implement Sentry
- Add error boundaries
- Configure monitoring
- Estimated time: 2-3 hours

**4. Documentation (Medium):**
- Consolidate markdown files
- Update API documentation
- Keep docs up-to-date
- Estimated time: 4-6 hours

### Quick Wins

These can be done immediately:

1. **Run ESLint and fix warnings** (30 min)
2. **Write first test** (1 hour)
3. **Add validation to one API route** (1 hour)
4. **Set up Sentry** (2 hours)

---

## Optimization Guidelines

### Performance Best Practices

**Database Queries:**
```typescript
// ❌ Bad - N+1 query problem
for (const user of users) {
  const orders = await getOrders(user.id)
}

// ✅ Good - Single query with join
const usersWithOrders = await supabase
  .from('users')
  .select('*, orders(*)')
```

**Pagination:**
```typescript
// ✅ Always paginate large datasets
const { data } = await supabase
  .from('items')
  .select('*')
  .range(offset, offset + limit - 1)
```

**Caching:**
```typescript
// ✅ Use React Query for client-side caching
const { data, isLoading } = useQuery({
  queryKey: ['users', userId],
  queryFn: () => fetchUser(userId),
  staleTime: 5 * 60 * 1000, // 5 minutes
})
```

### Image Optimization

```tsx
// ✅ Always use Next.js Image component
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={false}
/>
```

### Code Splitting

```typescript
// ✅ Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```

### Bundle Size

```bash
# Analyze bundle size
npm install --save-dev @next/bundle-analyzer

# Run analysis
ANALYZE=true npm run build
```

---

## Code Review Checklist

Before submitting a PR:

- [ ] Route uses factory functions
- [ ] Uses `await context.params` with destructuring
- [ ] Throws typed errors (not returns)
- [ ] Uses `successResponse()` for success
- [ ] TypeScript types are correct
- [ ] No `as any` type assertions
- [ ] Input validation implemented
- [ ] Tests written for new features
- [ ] ESLint passes (`npm run lint`)
- [ ] Type check passes (`npm run typecheck`)
- [ ] Documentation updated
- [ ] No console.logs left in code

---

## Common Patterns

### Organization Membership Check

```typescript
import { getUserOrgRole } from '@/lib/db/organizations'

const role = await getUserOrgRole(user.id, organizationId)
if (!role) throw forbiddenError()
```

### Organization Admin Check

```typescript
import { isUserOrgAdmin } from '@/lib/db/organizations'

const isAdmin = await isUserOrgAdmin(user.id, organizationId)
if (!isAdmin) throw forbiddenError('Admin access required')
```

### Enum Validation

```typescript
import { validateEnum } from '@/lib/api'

validateEnum(role, ['admin', 'member', 'viewer'], 'role')
```

### Pagination

```typescript
import { DEFAULT_PAGE_LIMIT, DEFAULT_PAGE_OFFSET } from '@/lib/api'

const { searchParams } = new URL(request.url)
const limit = parseInt(searchParams.get('limit') || String(DEFAULT_PAGE_LIMIT))
const offset = parseInt(searchParams.get('offset') || String(DEFAULT_PAGE_OFFSET))
const page = Math.floor(offset / limit) + 1
```

---

## What NOT to Do

### ❌ Anti-Patterns

```typescript
// ❌ NEVER use async function exports
export async function GET(request: NextRequest) { }

// ❌ NEVER manually call getCurrentUser
const user = await getCurrentUser()
if (!user) return NextResponse.json(...)

// ❌ NEVER return NextResponse.json for errors
return NextResponse.json({ error: 'Not found' }, { status: 404 })

// ❌ NEVER use try/catch in route handlers
try {
  // logic
} catch (error) {
  return errorResponse(error)
}
```

### ✅ Correct Patterns

```typescript
// ✅ ALWAYS use factory functions
export const GET = createAuthenticatedRoute(async (request, context, user) => {
  // ✅ ALWAYS throw errors
  if (!data) throw notFoundError('Resource')

  // ✅ ALWAYS use successResponse
  return successResponse({ data })
})
```

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Best Practices](https://typescript-eslint.io/docs/)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)

---

## Getting Help

- **Questions?** Open a GitHub Discussion
- **Found a bug?** Open an issue with the `bug` label
- **Suggestions?** Open an issue with the `enhancement` label

---

**Last Updated:** 2025-11-23
**Status:** All 126 routes standardized ✅
