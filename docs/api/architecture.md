# API Architecture Guidelines

This document defines the architectural patterns and conventions for our API routes.

## User API Namespaces

We maintain two distinct namespaces for user-related endpoints, each with a specific purpose:

### `/api/user/*` - User Settings & System Data

**Purpose:** User account settings, preferences, and system-managed data.

**Use this namespace for:**
- User account settings and preferences
- GDPR/privacy operations (exports, deletions, access logs)
- System-managed user data
- Analytics and statistics
- Authentication-related operations

**Examples:**
- `/api/user/preferences` - Email notification preferences
- `/api/user/learning-preferences` - Learning style and content settings
- `/api/user/data-export` - GDPR data export requests
- `/api/user/data-deletion` - Account deletion requests
- `/api/user/data-access-log` - Privacy compliance audit trail
- `/api/user/learning-stats` - Learning progress statistics

**Characteristics:**
- Typically stored in `email_preferences`, `profiles`, or auth metadata
- System-level user data
- Configuration and settings

---

### `/api/users/me/*` - User-Generated Content

**Purpose:** Content and data created or collected by users during their usage of the platform.

**Use this namespace for:**
- Content created or saved by users
- User activity and engagement tracking
- Social features and interactions
- User-collected resources

**Examples:**
- `/api/users/me/notes/{id}` - User-created lesson notes
- `/api/users/me/bookmarks` - Saved courses and content
- `/api/users/me/streak` - Daily learning streak tracking

**Characteristics:**
- Typically stored in dedicated tables (`notes`, `bookmarks`, `learning_streaks`)
- User-generated or user-curated content
- Activity tracking and engagement metrics

---

## When to Use Each Namespace

**Decision Tree:**

```
Is this user-created content (notes, bookmarks, etc.)?
├─ Yes → Use /api/users/me/*
└─ No → Is it a user setting or preference?
    ├─ Yes → Use /api/user/*
    └─ No → Consider if it needs a specialized namespace
```

**Examples:**

| Feature | Endpoint | Namespace | Reasoning |
|---------|----------|-----------|-----------|
| Email preferences | `/api/user/preferences` | `/api/user/*` | User setting |
| Learning notes | `/api/users/me/notes` | `/api/users/me/*` | User-generated content |
| Streak tracking | `/api/users/me/streak` | `/api/users/me/*` | User activity tracking |
| GDPR export | `/api/user/data-export` | `/api/user/*` | System operation |
| Course bookmarks | `/api/users/me/bookmarks` | `/api/users/me/*` | User-curated collection |

---

## API Route Factory Pattern

All API routes should use the standardized factory pattern from `lib/api`:

### Available Factories

1. **`createPublicRoute`** - No authentication required
   ```typescript
   export const GET = createPublicRoute(async (request, context) => {
     // Handle public request
     return successResponse({ data });
   });
   ```

2. **`createAuthenticatedRoute`** - Requires authenticated user
   ```typescript
   export const GET = createAuthenticatedRoute(async (request, context, user) => {
     // user.id is available here
     return successResponse({ data });
   });
   ```

3. **`createAdminRoute`** - Requires admin role
   ```typescript
   export const POST = createAdminRoute(async (request, context, user) => {
     // Only admins can access this
     return successResponse({ data });
   });
   ```

### Benefits

- ✅ Consistent authentication/authorization
- ✅ Standardized error handling
- ✅ Type-safe user objects
- ✅ Automatic logging and monitoring hooks
- ✅ Reduced boilerplate code

---

## Request Validation

Use Zod schemas from `lib/validation/schemas` for request validation:

```typescript
import { validateRequest } from '@/lib/validation';
import { userPreferencesSchema } from '@/lib/validation/schemas';

export const PUT = createAuthenticatedRoute(async (request, context, user) => {
  const validation = await validateRequest(request, userPreferencesSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = validation.data; // Type-safe validated data
  // Process request...
});
```

---

## Repository Pattern

For complex data operations, use repository classes (see `lib/db/certifications.ts` as an example):

**Benefits:**
- Centralized database access logic
- Reusable across multiple API routes
- Easier testing and maintenance
- Type-safe data operations

**Example:**
```typescript
// In API route
import { certificationRepository } from '@/lib/db';

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const applications = await certificationRepository.getUserApplications(user.id);
  return successResponse({ applications });
});
```

---

## Migration History

### User API Consolidation (2025-11-29)

**Problem:** Duplicate streak endpoints existed at `/api/user/streak` and `/api/users/me/streak`

**Solution:**
- Migrated to `/api/users/me/streak` (more complete implementation)
- Removed legacy `/api/user/streak` endpoint
- Updated `components/gamification/streak-display.tsx` to use modern endpoint

**Rationale:** Streak tracking is user activity data, fitting better in the `/api/users/me/*` namespace.

---

## Best Practices

1. **Consistency First:** Follow established patterns, even if they seem verbose
2. **Use Factories:** Always use route factories (`createAuthenticatedRoute`, etc.)
3. **Validate Inputs:** Use Zod schemas for all request data
4. **Repository Pattern:** Extract complex database logic into repository classes
5. **Error Handling:** Use standardized error helpers (`internalError`, `badRequestError`, etc.)
6. **Logging:** Use the `logger` utility for all logging operations
7. **Type Safety:** Maintain strict TypeScript types throughout

---

## Related Documentation

- [Validation Schemas](../lib/validation/schemas.ts) - All Zod validation schemas
- [API Helpers](../lib/api.ts) - Route factories and error utilities
- [Database Repositories](../lib/db/) - Data access layer patterns
- [CODEBASE_AUDIT.md](../../CODEBASE_AUDIT.md) - Architecture decisions and technical debt

---

## Questions?

If you're unsure which namespace to use for a new endpoint:
1. Check this guide first
2. Look for similar existing endpoints
3. Consider the data source (user-created vs. system-managed)
4. When in doubt, ask the team or refer to this document
