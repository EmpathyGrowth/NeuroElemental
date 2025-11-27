# API Route Factory Pattern Guide

**Last Updated**: 2025-11-25
**Pattern Type**: API Layer
**Status**: ✅ Active

## Overview

The Route Factory Pattern provides a consistent, standardized way to create API endpoints with built-in authentication, error handling, and request processing. All route handlers use factory functions instead of manual try-catch blocks and auth checks.

### Benefits
- **Consistency**: Uniform error handling across all endpoints
- **Security**: Automatic authentication and authorization
- **DRY**: No repetitive try-catch or auth code
- **Type Safety**: Full TypeScript support with request context
- **Testing**: Easier to test with consistent interfaces

---

## Factory Functions

### createPublicRoute

For endpoints accessible without authentication:

```typescript
import { createPublicRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';

export const GET = createPublicRoute(async (req) => {
  const data = await getData();
  return successResponse(data);
});
```

### createAuthenticatedRoute

For endpoints requiring user authentication:

```typescript
import { createAuthenticatedRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';

export const GET = createAuthenticatedRoute(async (req, { user }) => {
  // user is automatically available and typed
  const data = await userRepository.findById(user.id);
  return successResponse(data);
});
```

### createAdminRoute

For endpoints requiring admin access:

```typescript
import { createAdminRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';

export const DELETE = createAdminRoute(async (req, { user, params }) => {
  await repository.delete(params.id);
  return successResponse({ deleted: true });
});
```

---

## Request Context

Each factory provides context based on access level:

```typescript
// Public route context
interface PublicContext {
  params: Record<string, string>;  // Route parameters
}

// Authenticated route context
interface AuthContext extends PublicContext {
  user: User;  // Authenticated user
}

// Admin route context
interface AdminContext extends AuthContext {
  // Same as Auth, but user is verified as admin
}
```

---

## Complete Examples

### GET Endpoint with Pagination

```typescript
import { createAuthenticatedRoute } from '@/lib/api/route-factory';
import { paginatedResponse } from '@/lib/api/request-helpers';
import { courseRepository } from '@/lib/db/courses';

export const GET = createAuthenticatedRoute(async (req, { user }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') ?? '1');
  const limit = parseInt(searchParams.get('limit') ?? '20');

  const result = await courseRepository.paginate({
    page,
    limit,
    filters: { instructor_id: user.id }
  });

  return paginatedResponse(result.data, result.meta);
});
```

### POST Endpoint with Validation

```typescript
import { createAuthenticatedRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';
import { validateRequest } from '@/lib/validation/validate';
import { createCourseSchema } from '@/lib/validation/schemas';
import { courseRepository } from '@/lib/db/courses';

export const POST = createAuthenticatedRoute(async (req, { user }) => {
  const data = await validateRequest(req, createCourseSchema);

  const course = await courseRepository.create({
    ...data,
    instructor_id: user.id
  });

  return successResponse(course, 201);
});
```

### PUT Endpoint with Params

```typescript
import { createAuthenticatedRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';
import { validateRequest } from '@/lib/validation/validate';
import { updateCourseSchema } from '@/lib/validation/schemas';
import { courseRepository } from '@/lib/db/courses';

export const PUT = createAuthenticatedRoute(async (req, { user, params }) => {
  const data = await validateRequest(req, updateCourseSchema);

  // Verify ownership
  const course = await courseRepository.findById(params.id);
  if (course.instructor_id !== user.id) {
    throw forbiddenError('Not your course');
  }

  const updated = await courseRepository.update(params.id, data);
  return successResponse(updated);
});
```

### DELETE Endpoint

```typescript
import { createAuthenticatedRoute } from '@/lib/api/route-factory';
import { successResponse } from '@/lib/api/request-helpers';
import { courseRepository } from '@/lib/db/courses';

export const DELETE = createAuthenticatedRoute(async (req, { user, params }) => {
  const course = await courseRepository.findById(params.id);

  if (course.instructor_id !== user.id) {
    throw forbiddenError('Not your course');
  }

  await courseRepository.delete(params.id);
  return successResponse({ deleted: true });
});
```

---

## Response Helpers

### successResponse

For successful operations:

```typescript
import { successResponse } from '@/lib/api/request-helpers';

// With data
return successResponse(data);

// With custom status code
return successResponse(data, 201);

// Just success
return successResponse({ success: true });
```

### paginatedResponse

For paginated results:

```typescript
import { paginatedResponse } from '@/lib/api/request-helpers';

return paginatedResponse(data, {
  page: 1,
  limit: 20,
  total: 100,
  totalPages: 5
});
```

### errorResponse

Handled automatically by factories, but can be used manually:

```typescript
import { errorResponse } from '@/lib/api/request-helpers';

return errorResponse('Not found', 404);
```

---

## Error Handling

### Automatic Error Handling

Factories automatically catch and format errors:

```typescript
export const GET = createAuthenticatedRoute(async (req, { user }) => {
  // This error is automatically caught and formatted
  throw new NotFoundError('Course not found');

  // Returns:
  // {
  //   "success": false,
  //   "error": "Course not found",
  //   "code": 404
  // }
});
```

### Custom Error Handling

For specific error scenarios:

```typescript
export const POST = createAuthenticatedRoute(async (req, { user }) => {
  try {
    const data = await validateRequest(req, schema);
    return successResponse(await repository.create(data));
  } catch (error) {
    if (error instanceof ValidationError) {
      // Custom handling for validation errors
      return errorResponse(error.message, 422);
    }
    // Other errors bubble up to factory
    throw error;
  }
});
```

---

## Testing

### Unit Tests

```typescript
import { GET } from './route';
import { createMockRequest } from '@/__tests__/utils/request-mock';

describe('GET /api/courses', () => {
  it('should return courses', async () => {
    const req = createMockRequest({
      url: 'http://localhost:3000/api/courses',
      method: 'GET'
    });

    const response = await GET(req);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data)).toBe(true);
  });
});
```

### Integration Tests

```typescript
describe('POST /api/courses', () => {
  it('should create course when authenticated', async () => {
    const response = await fetch('http://localhost:3000/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        title: 'New Course',
        slug: 'new-course'
      })
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.data.title).toBe('New Course');
  });
});
```

---

## Migration from Manual Patterns

### ❌ Old Pattern

```typescript
export async function GET(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const courses = await getCourses(user.id);

    return NextResponse.json({ data: courses });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### ✅ New Pattern

```typescript
import { createAuthenticatedRoute, successResponse } from '@/lib/api';

export const GET = createAuthenticatedRoute(async (req, { user }) => {
  const courses = await courseRepository.findAll({
    instructor_id: user.id
  });

  return successResponse(courses);
});
```

---

## Best Practices

### ✅ DO

- **Use appropriate factory** based on access requirements
- **Return response helpers** for consistency
- **Throw errors** instead of returning error responses
- **Validate requests** with schemas
- **Use repository pattern** for data access
- **Add JSDoc** to route handlers

### ❌ DON'T

- **Don 't use manual try-catch** (factory handles this)
- **Don't manually check auth** (factory handles this)
- **Don't return raw NextResponse** (use helpers)
- **Don't put business logic in routes** (use services)
- **Don't query database directly** (use repositories)

---

## Advanced Patterns

### Conditional Access

```typescript
export const GET = createAuthenticatedRoute(async (req, { user, params }) => {
  const organization = await organizationRepository.findById(params.id);

  // Check membership
  const isMember = await organizationRepository.isMember(
    params.id,
    user.id
  );

  if (!isMember) {
    throw forbiddenError('Not a member of this organization');
  }

  return successResponse(organization);
});
```

### Streaming Responses

```typescript
export const GET = createAuthenticatedRoute(async (req, { user }) => {
  const stream = await generateReport(user.id);

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
});
```

---

## Related Documentation

- [Route Factory Source](../../../lib/api/route-factory.ts)
- [Request Helpers Source](../../../lib/api/request-helpers.ts)
- [Error Handling Pattern](./error-handling.md)
- [Validation Pattern](./validation.md)
- [API Documentation](../../api/overview.md)

---

## ADRs

- [ADR-002: API Route Factory Pattern](../adr/002-route-factories.md)
