# Validation Pattern Guide

**Last Updated**: 2025-11-25
**Pattern Type**: Request Processing
**Status**: ✅ Active

## Overview

The Validation Pattern ensures all request data is validated using reusable Zod schemas before processing. This provides type safety, consistent error messages, and prevents invalid data from entering the system.

### Benefits
- **Type Safety**: Auto-generated TypeScript types from schemas
- **Reusability**: Schemas defined once, used everywhere
- **Consistency**: Uniform validation across all endpoints
- **User Experience**: Clear, actionable validation errors
- **Security**: Input sanitization and validation

---

## Core Concepts

### Zod Schemas

Define validation rules using Zod:

```typescript
import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().min(0),
  is_published: z.boolean().default(false)
});

// Infer TypeScript type
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
```

### validateRequest Helper

Standard way to validate request bodies:

```typescript
import { validateRequest } from '@/lib/validation/validate';

export const POST = createAuthenticatedRoute(async (req, { user }) => {
  const data = await validateRequest(req, createCourseSchema);
  // data is now typed as CreateCourseInput and validated

  return successResponse(await courseRepository.create(data));
});
```

---

## Schema Organization

### Location

All schemas in `lib/validation/schemas/`:

```
lib/validation/schemas/
├── index.ts           # Barrel export
├── courses.ts         # Course schemas
├── users.ts           # User schemas
├── organizations.ts   # Organization schemas
└── common.ts          # Shared/reusable schemas
```

### Schema File Structure

```typescript
// lib/validation/schemas/courses.ts
import { z } from 'zod';

// Create
export const createCourseSchema = z.object({
  title: z.string().min(3).max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().min(0)
});

// Update (partial)
export const updateCourseSchema = createCourseSchema.partial();

// With custom error messages
export const courseQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  published: z.enum(['true', 'false']).optional()
});

// Type exports
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseQuery = z.infer<typeof courseQuerySchema>;
```

---

## Usage Examples

### Basic Validation

```typescript
import { validateRequest } from '@/lib/validation/validate';
import { createCourseSchema } from '@/lib/validation/schemas';

export const POST = createAuthenticatedRoute(async (req, { user }) => {
  const data = await validateRequest(req, createCourseSchema);

  const course = await courseRepository.create({
    ...data,
    instructor_id: user.id
  });

  return successResponse(course, 201);
});
```

### Query Parameter Validation

```typescript
import { courseQuerySchema } from '@/lib/validation/schemas';

export const GET = createPublicRoute(async (req) => {
  const { searchParams } = new URL(req.url);

  // Validate query params
  const query = courseQuerySchema.parse({
    page: searchParams.get('page'),
    limit: searchParams.get('limit'),
    search: searchParams.get('search'),
    published: searchParams.get('published')
  });

  const courses = await courseRepository.paginate({
    page: query.page,
    limit: query.limit,
    filters: {
      ...(query.search && { title_ilike: `%${query.search}%` }),
      ...(query.published && { is_published: query.published === 'true' })
    }
  });

  return paginatedResponse(courses.data, courses.meta);
});
```

### Nested Objects

```typescript
export const createEnrollmentSchema = z.object({
  course_id: z.string().uuid(),
  user_id: z.string().uuid(),
  payment: z.object({
    amount: z.number().positive(),
    currency: z.enum(['USD', 'EUR', 'GBP']),
    method: z.enum(['card', 'paypal', 'bank'])
  }),
  metadata: z.record(z.string()).optional()
});
```

### Arrays

```typescript
export const bulkCreateUsersSchema = z.object({
  users: z.array(z.object({
    email: z.string().email(),
    full_name: z.string().min(1),
    role: z.enum(['student', 'instructor'])
  })).min(1).max(100)
});
```

---

## Schema Composition

### Extending Schemas

```typescript
const  baseUserSchema = z.object({
  email: z.string().email(),
  full_name: z.string().min(1)
});

export const createUserSchema = baseUserSchema.extend({
  password: z.string().min(8),
  role: z.enum(['student', 'instructor', 'admin'])
});

export const updateUserSchema = baseUserSchema.partial().extend({
  avatar_url: z.string().url().optional()
});
```

### Reusable Validators

```typescript
// common.ts
export const emailSchema = z.string().email().toLowerCase();
export const uuidSchema = z.string().uuid();
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/);

// Usage
import { emailSchema, slugSchema } from './common';

export const createCourseSchema = z.object({
  title: z.string(),
  slug: slugSchema,
  instructor_email: emailSchema
});
```

### Conditional Validation

```typescript
export const courseSchema = z.object({
  type: z.enum(['free', 'paid']),
  price: z.number().optional()
}).refine(
  (data) => data.type !== 'paid' || (data.price !== undefined && data.price > 0),
  { message: 'Paid courses must have a price', path: ['price'] }
);
```

---

## Custom Error Messages

```typescript
export const createUserSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email({ message: 'Please enter a valid email address' }),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password must contain an uppercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain a number' }),

  age: z
    .number({ invalid_type_error: 'Age must be a number' })
    .min(18, { message: 'You must be 18 or older' })
    .max(120, { message: 'Please enter a valid age' })
});
```

---

## Validation Error Response

Auto-formatted by `validateRequest`:

```json
{
  "success": false,
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "statusCode": 400,
  "details": {
    "email": "Please enter a valid email address",
    "password": "Password must be at least 8 characters"
  }
}
```

---

## Testing Validation

### Unit Tests

```typescript
import { createCourseSchema } from '@/lib/validation/schemas/courses';

describe('createCourseSchema', () => {
  it('should validate valid course data', () => {
    const validData = {
      title: 'TypeScript Basics',
      slug: 'typescript-basics',
      price: 49.99
    };

    expect(() => createCourseSchema.parse(validData)).not.toThrow();
  });

  it('should reject invalid slug', () => {
    const invalidData = {
      title: 'Test Course',
      slug: 'Invalid Slug!',  // Contains spaces and special chars
      price: 49.99
    };

    expect(() => createCourseSchema.parse(invalidData)).toThrow();
  });

  it('should reject negative price', () => {
    const invalidData = {
      title: 'Test Course',
      slug: 'test-course',
      price: -10
    };

    const result = createCourseSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
```

### Integration Tests

```typescript
describe('POST /api/courses', () => {
  it('should return 400 for invalid data', async () => {
    const response = await fetch('/api/courses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: '', // Too short
        slug: 'invalid slug', // Invalid format
        price: -10 // Negative
      })
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.details).toBeDefined();
  });
});
```

---

## Best Practices

### ✅ DO

- **Define schemas centrally** in `lib/validation/schemas/`
- **Export TypeScript types** from schemas
- **Use schema composition** for reusability
- **Add custom error messages** for user clarity
- **Validate early** before processing
- **Use `.safeParse()`** when errors need custom handling

### ❌ DON'T

- **Don't inline validation** in route handlers
- **Don't skip validation** for "trusted" inputs
- **Don't use loose validation** (.string() without constraints)
- **Don't validate the same data twice**
- **Don't mix validation logic** with business logic

---

## Migration from Inline Validation

### ❌ Old Pattern

```typescript
export const POST = async (req: Request) => {
  const body = await req.json();

  // Inline validation
  if (!body.email || !body.email.includes('@')) {
    return NextResponse.json(
      { error: 'Invalid email' },
      { status: 400 }
    );
  }

  if (!body.password || body.password.length < 8) {
    return NextResponse.json(
      { error: 'Password too short' },
      { status: 400 }
    );
  }

  // Process...
};
```

### ✅ New Pattern

```typescript
// Schema
export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// Route
export const POST = createPublicRoute(async (req) => {
  const data = await validateRequest(req, signupSchema);
  // All validation handled, data is typed
});
```

---

## Related Documentation

- [Validation Source](../../../lib/validation/)
- [Zod Documentation](https://zod.dev/)
- [API Route Factory Pattern](./api-route-factory.md)
- [Error Handling Pattern](./error-handling.md)

---

## ADRs

- [ADR-003: Centralized Validation with Zod](../adr/003-validation.md)
