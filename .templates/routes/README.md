# API Route Templates

This directory contains templates for creating new API routes following NeuroElemental's standardized patterns.

## Available Templates

### 1. `authenticated-route.template.ts`
**Use for:** User-authenticated endpoints

**Features:**
- Full CRUD operations (GET, POST, PUT, DELETE)
- User ownership verification
- Request validation
- Error handling

**Example use cases:**
- User profile management
- User-owned resources
- Personal data endpoints

### 2. `organization-route.template.ts`
**Use for:** Organization-scoped endpoints

**Features:**
- Organization membership verification
- Admin permission checks
- Multi-level access control
- Organization resource management

**Example use cases:**
- Organization settings
- Team member management
- Organization-owned resources

### 3. `admin-route.template.ts`
**Use for:** Admin-only endpoints

**Features:**
- Admin-only access
- Pagination support
- Full CRUD operations
- Audit logging

**Example use cases:**
- Platform administration
- User management (admin)
- System configuration

### 4. `public-webhook.template.ts`
**Use for:** External webhook handlers

**Features:**
- Signature verification
- Event logging
- Multiple event types
- Error resilience

**Example use cases:**
- Payment webhooks (Stripe, PayPal)
- Third-party integrations
- External notifications

### 5. `cron-job.template.ts`
**Use for:** Scheduled background jobs

**Features:**
- Secret-based authentication
- Batch processing
- Progress tracking
- Error handling

**Example use cases:**
- Data cleanup
- Scheduled reports
- Background processing

## How to Use

### Step 1: Copy Template

```bash
# Copy the appropriate template
cp .templates/routes/authenticated-route.template.ts app/api/your-resource/route.ts
```

### Step 2: Customize

1. Replace `[Resource Name]` with your resource name
2. Replace `[Description]` with endpoint descriptions
3. Update table names and field names
4. Implement business logic
5. Add validation rules

### Step 3: Remove Unused Methods

If you only need certain HTTP methods, remove the others:

```typescript
// Keep only what you need
export const GET = createAuthenticatedRoute(...)
// Remove POST, PUT, DELETE if not needed
```

### Step 4: Test

1. Verify ESLint passes: `npm run lint`
2. Check TypeScript: `npx tsc --noEmit`
3. Test the endpoint manually
4. Add unit tests

## Quick Reference

### Factory Functions

```typescript
import {
  createAuthenticatedRoute,  // For authenticated users
  createAdminRoute,           // For admins only
  createPublicRoute,          // For public access
} from '@/lib/api'
```

### Response Helpers

```typescript
import {
  successResponse,      // Return success with data
  paginatedResponse,    // Return paginated data
} from '@/lib/api'
```

### Error Helpers

```typescript
import {
  notFoundError,        // 404
  badRequestError,      // 400
  forbiddenError,       // 403
  unauthorizedError,    // 401
  conflictError,        // 409
} from '@/lib/api'
```

### Organization Helpers

```typescript
import {
  getUserOrgRole,       // Check membership
  isUserOrgAdmin,       // Check if admin
  isUserOrgMember,      // Check if member
} from '@/lib/db/organizations'
```

## Examples

### Simple GET Endpoint

```typescript
export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params

  const data = await fetchData(id, user.id)

  if (!data) throw notFoundError('Resource')

  return successResponse({ data })
})
```

### Organization Endpoint with Permission Check

```typescript
export const POST = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params

  // Check permission
  const isAdmin = await isUserOrgAdmin(user.id, id)
  if (!isAdmin) throw forbiddenError('Admin access required')

  // Process request
  const body = await request.json()
  const result = await createResource(id, body)

  return successResponse({ result }, 201)
})
```

## Best Practices

1. ✅ **Always validate input** before processing
2. ✅ **Check permissions early** in the handler
3. ✅ **Use descriptive error messages** for better debugging
4. ✅ **Log important events** for audit trail
5. ✅ **Keep business logic focused** and readable
6. ✅ **Return appropriate HTTP status codes**
7. ✅ **Document your endpoints** with JSDoc comments

## Common Patterns

### Pagination

```typescript
const { searchParams } = new URL(request.url)
const limit = parseInt(searchParams.get('limit') || '20')
const offset = parseInt(searchParams.get('offset') || '0')
```

### Filtering

```typescript
const { searchParams } = new URL(request.url)
const status = searchParams.get('status')
const type = searchParams.get('type')
```

### Multiple Params

```typescript
const { organizationId, userId, resourceId } = await context.params
```

## Need Help?

- See [CONTRIBUTING.md](../../CONTRIBUTING.md) for full documentation
- Check existing routes in `app/api/` for real examples
- Ask in team chat or open a discussion

## Template Maintenance

Templates are kept in sync with:
- Factory functions in `lib/api/route-factory.ts`
- Error handlers in `lib/api/error-handler.ts`
- Best practices in `CONTRIBUTING.md`

Last updated: 2025-01-22
