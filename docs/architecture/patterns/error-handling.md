# Error Handling Pattern Guide

**Last Updated**: 2025-11-25
**Pattern Type**: Error Management
**Status**: ✅ Active

## Overview

The Error Handling Pattern provides consistent, user-friendly error responses across the platform. All errors use typed error classes and factories, ensuring predictable error formats and making debugging easier.

### Benefits
- **Consistency**: Uniform error format across all endpoints
- **Type Safety**: Typed error classes with IntelliSense
- **Debugging**: Structured error logging and tracking
- **User Experience**: Clear, actionable error messages
- **Maintenance**: Centralized error handling logic

---

## Error Classes

### ApiError (Base Class)

All custom errors extend `ApiError`:

```typescript
class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
```

### Specific Error Types

```typescript
// 400 - Bad Request
class ValidationError extends ApiError {
  constructor(message: string, public details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

// 401 - Unauthorized
class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// 403 - Forbidden
class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

// 404 - Not Found
class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// 409 - Conflict
class ConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

// 500 - Internal Server Error
class InternalError extends ApiError {
  constructor(message = 'Internal server error') {
    super(message, 500, 'INTERNAL_ERROR');
  }
}
```

---

## Error Factories

Convenient functions for creating errors:

```typescript
import {
  validationError,
  unauthorizedError,
  forbiddenError,
  notFoundError,
  conflictError,
  internalError
} from '@/lib/api/error-handler';

// Usage
throw notFoundError('Course');
throw validationError('Invalid email format');
throw forbiddenError('You do not have permission');
throw conflictError('Email already exists');
```

---

## Usage Examples

### In Route Handlers

```typescript
import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { notFoundError, forbiddenError } from '@/lib/api/error-handler';
import { courseRepository } from '@/lib/db/courses';

export const GET = createAuthenticatedRoute(async (req, { user, params }) => {
  const course = await courseRepository.findById(params.id);

  if (!course) {
    throw notFoundError('Course');
  }

  if (course.instructor_id !== user.id) {
    throw forbiddenError('Not your course');
  }

  return successResponse(course);
});
```

### In Repositories

```typescript
export class CourseRepository extends BaseRepository<'courses'> {
  async getCourseBySlug(slug: string): Promise<Course> {
    const course = await this.findBy('slug', slug);

    if (!course) {
      throw notFoundError('Course');
    }

    return course;
  }
}
```

### Validation Errors

```typescript
import { validateRequest } from '@/lib/validation/validate';
import { createCourseSchema } from '@/lib/validation/schemas';

export const POST = createAuthenticatedRoute(async (req, { user }) => {
  // This automatically throws ValidationError if invalid
  const data = await validateRequest(req, createCourseSchema);

  // Custom validation
  if (data.price < 0) {
    throw validationError('Price must be positive', {
      field: 'price',
      value: data.price
    });
  }

  const course = await courseRepository.create(data);
  return successResponse(course, 201);
});
```

---

## Error Response Format

All errors return consistent JSON:

```json
{
  "success": false,
  "error": "Course not found",
  "code": "NOT_FOUND",
  "statusCode": 404
}
```

With validation details:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": {
    "field": "email",
    "message": "Invalid email format"
  }
}
```

---

## Error Logging

Errors are automatically logged with context:

```typescript
// In error handler
logger.error('API Error', {
  error: error.message,
  code: error.code,
  statusCode: error.statusCode,
  path: req.url,
  method: req.method,
  userId: user?.id
});
```

---

## Testing Error Handling

### Unit Tests

```typescript
import { GET } from './route';
import { NotFoundError } from '@/lib/api/error-handler';

describe('GET /api/courses/[id]', () => {
  it('should throw NotFoundError when course not found', async () => {
    jest.spyOn(courseRepository, 'findById').mockResolvedValue(null);

    await expect(async () => {
      await GET(mockRequest, { user: mockUser, params: { id: 'invalid' } });
    }).rejects.toThrow(NotFoundError);
  });
});
```

### Integration Tests

```typescript
describe('GET /api/courses/invalid-id', () => {
  it('should return 404 error', async () => {
    const response = await fetch('http://localhost:3000/api/courses/invalid-id', {
      headers: { Authorization: `Bearer ${token}` }
    });

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Course not found');
  });
});
```

---

## Best Practices

### ✅ DO

- **Use error factories** instead of throwing raw errors
- **Throw errors early** when validation fails
- **Provide context** in error messages
- **Log errors** with relevant information
- **Use specific error types** for different scenarios
- **Include actionable messages** for users

### ❌ DON'T

- **Don't return errors** (throw them instead)
- **Don't expose sensitive information** in error messages
- **Don't use generic error messages** ("Error occurred")
- **Don't catch errors** unless you can handle them
- **Don't log sensitive data** (passwords, tokens, etc.)

---

## Error Handling Anti-Patterns

### ❌ Returning Errors

```typescript
// BAD
export const GET = async (req: Request) => {
  try {
    const data = await getData();
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};
```

### ✅ Throwing Errors

```typescript
// GOOD
export const GET = createPublicRoute(async (req) => {
  const data = await getData();  // Throws if error
  return successResponse(data);
});
```

### ❌ Generic Error Messages

```typescript
// BAD
throw new Error('Something went wrong');
```

### ✅ Specific Error Messages

```typescript
// GOOD
throw notFoundError('Course');
throw validationError('Email is required');
throw forbiddenError('Insufficient permissions to delete this resource');
```

---

## Advanced Patterns

### Custom Error Details

```typescript
class RateLimitError extends ApiError {
  constructor(
    public retryAfter: number,
    public limit: number
  ) {
    super('Rate limit exceeded', 429, 'RATE_LIMIT');
  }
}

// Usage
throw new RateLimitError(60, 100); // retry after 60s, limit is 100 requests
```

### Error Recovery

```typescript
export const POST = createAuthenticatedRoute(async (req, { user }) => {
  try {
    return successResponse(await primaryService.create(data));
  } catch (error) {
    if (error instanceof ServiceUnavailableError) {
      // Fallback to secondary service
      logger.warn('Primary service unavailable, using fallback');
      return successResponse(await fallbackService.create(data));
    }
    throw error; // Re-throw if not recoverable
  }
});
```

### Enriching Errors

```typescript
try {
  await externalApi.call();
} catch (error) {
  throw new InternalError(
    `External API failed: ${error.message}`
  );
}
```

---

## Error Tracking Integration

### Sentry Example

```typescript
import * as Sentry from '@sentry/nextjs';

export function handleError(error: Error, context?: any) {
  // Log to console
  logger.error(error.message, { error, context });

  // Send to Sentry
  Sentry.captureException(error, {
    extra: context
  });

  // Return formatted response
  return errorResponse(
    error instanceof ApiError ? error.message : 'Internal server error',
    error instanceof ApiError ? error.statusCode : 500
  );
}
```

---

## Related Documentation

- [Error Handler Source](../../../lib/api/error-handler.ts)
- [API Route Factory Pattern](./api-route-factory.md)
- [Validation Pattern](./validation.md)
- [Logging Guide](../../operations/monitoring.md)

---

## ADRs

- [ADR-006: Error Handling Standardization](../adr/006-error-handling.md)
