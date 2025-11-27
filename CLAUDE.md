# NeuroElemental - Claude Code Rules

**Project**: Next.js 16 multi-tenant SaaS platform for neurodivergent education
**Status**: 100% production ready
**Last Updated**: 2025-11-27

## Quick Reference

**Tech**: Next.js 16 | React 19 | TypeScript (strict) | Supabase | Tailwind 4 | Radix UI

**Build Status**:
- TypeScript: 0 errors
- ESLint: 0 errors (warnings in tests only)
- All routes use factory pattern (100%)
- All barrel exports centralized
- All database tables have RLS with proper policies
- All foreign keys indexed for performance
- All RLS policies optimized with `(select auth.uid())` pattern

**Docs**:
- [10-Phase Consolidation Plan](docs/architecture/consolidation-plan.md)
- [Pattern Guides](docs/architecture/patterns/) - Repository, Routes, Errors, Validation, Caching
- [Full Docs](docs/README.md)

---

## Mandatory Patterns

### 1. API Routes - Factory Pattern ONLY

```typescript
// REQUIRED
import { createAuthenticatedRoute, successResponse } from '@/lib/api';

export const GET = createAuthenticatedRoute(async (req, context, user) => {
  return successResponse({ data });
});

// Available factories:
// createAuthenticatedRoute - User authenticated endpoints
// createAdminRoute - Admin-only endpoints
// createPublicRoute - Public/webhook endpoints
// createCronRoute - Scheduled job endpoints
// createOptionalAuthRoute - Optional auth endpoints
```

**NEVER**:
- `export async function GET`
- `getCurrentUser()` manually
- `NextResponse.json()` directly

### 2. Database - Repository Pattern ONLY

```typescript
// REQUIRED - Use repositories
import { courseRepository } from '@/lib/db/courses';

const course = await courseRepository.findById(id);
const courses = await courseRepository.findAll({ is_published: true });
const created = await courseRepository.create(data);

// FORBIDDEN - Direct Supabase in routes
const { data } = await supabase.from('courses').select('*');
```

**Repositories return objects directly** (not `{data, error}`)

Methods: `findById | findAll | findOne | create | update | delete | paginate | count`

See: [Repository Pattern Guide](docs/architecture/patterns/repository-pattern.md)

### 3. Errors - Use Helpers

```typescript
import { notFoundError, badRequestError, forbiddenError } from '@/lib/api';

throw notFoundError('Course');
throw badRequestError('Invalid input');
throw forbiddenError('Admin only');
```

### 4. Validation - Zod Schemas

```typescript
import { validateRequest } from '@/lib/validation/validate';
import { createCourseSchema } from '@/lib/validation/schemas';

const data = await validateRequest(req, createCourseSchema);
```

See: [Validation Pattern Guide](docs/architecture/patterns/validation.md)

### 5. Logging - Use Logger (Barrel Export)

```typescript
import { logger } from '@/lib/logging';

logger.info('Message', { context });
logger.error('Error', error);

// NEVER: console.log
```

### 6. Timestamps - Use Utilities

```typescript
import { getUpdateTimestamp, getCurrentTimestamp } from '@/lib/utils';

.update({ ...data, ...getUpdateTimestamp() })
```

### 7. Supabase Clients

```typescript
// API Routes (service role - bypasses RLS)
import { getSupabaseServer } from '@/lib/db';

// Server Components (with session)
import { createClient } from '@/lib/auth/supabase-server';

// Client Components
import { createClient } from '@/lib/supabase/client';
```

---

## Barrel Exports (USE THESE)

All utilities are available via centralized barrel exports:

```typescript
// API utilities
import { createAuthenticatedRoute, successResponse, notFoundError } from '@/lib/api';

// Database & repositories
import { getSupabaseServer, courseRepository, userRepository } from '@/lib/db';

// Utilities
import { logger, formatDate, getCurrentTimestamp } from '@/lib/utils';

// Validation
import { validateRequest } from '@/lib/validation';

// Logging
import { logger, serverLogger } from '@/lib/logging';

// Email
import { emailService, sendLowCreditsWarning } from '@/lib/email';

// Billing
import { stripe, getOrganizationSubscription } from '@/lib/billing';

// Analytics
import { trackApiUsage, getOrganizationStats } from '@/lib/analytics';

// Storage
import { uploadFile, deleteFile } from '@/lib/storage';

// API Keys
import { createApiKey, validateApiKey } from '@/lib/api-keys';

// Notifications
import { notificationManager } from '@/lib/notifications';

// Types
import { Tables, InsertTables, UpdateTables } from '@/lib/types';

// Cache
import { getCacheKey, setCache, getCache } from '@/lib/cache';

// Permissions
import { hasPermission, getPermissionsByCategory } from '@/lib/permissions';

// Organizations
import { isUserOrgAdmin, isUserOrgMember } from '@/lib/db';
```

---

## Code Standards

- TypeScript strict (no `any` without reason)
- Use `const` over `let`
- Async/await (not `.then()`)
- Barrel imports: `import { ... } from '@/lib/utils'`
- JSDoc on exported functions
- Prefix unused parameters with `_`

---

## Testing

- **Framework**: Vitest (not Jest)
- **Mocking**: `vi.mock()` not `jest.mock()`
- **Files**: `*.test.ts`
- **Expect syntax**: `expect(value, "message").toBe(expected)` (message as second arg)

---

## Before Commit

```bash
npm run lint       # 0 errors required
npm run typecheck  # 0 errors required
npm test           # All tests pass
```

---

## Pattern Guides

All patterns documented with examples:

1. [Repository Pattern](docs/architecture/patterns/repository-pattern.md) - Data access layer
2. [API Route Factory](docs/architecture/patterns/api-route-factory.md) - Endpoint creation
3. [Error Handling](docs/architecture/patterns/error-handling.md) - Error management
4. [Validation](docs/architecture/patterns/validation.md) - Request validation
5. [Caching](docs/architecture/patterns/caching.md) - Performance optimization

**See**: [Platform Consolidation Plan](docs/architecture/consolidation-plan.md) for complete 10-phase roadmap

---

## Project Context

**User Roles**: registered | student | instructor | business | admin

**Key Features**:
- Multi-organization B2B
- Credits system
- Billing (Stripe)
- API keys & webhooks
- SSO (SAML)
- Audit logging

**Database**: PostgreSQL with RLS (service role bypasses RLS!)

---

## Common Imports

```typescript
// API
import { createAuthenticatedRoute, successResponse, notFoundError } from '@/lib/api';

// Database
import { courseRepository, userRepository, getSupabaseServer } from '@/lib/db';

// Validation
import { validateRequest } from '@/lib/validation';
import { createCourseSchema } from '@/lib/validation/schemas';

// Utilities
import { logger, formatDate, getCurrentTimestamp } from '@/lib/utils';

// Organizations
import { isUserOrgAdmin } from '@/lib/db';

// Email
import { emailService, sendLowCreditsWarning } from '@/lib/email';

// Billing
import { stripe, getOrganizationSubscription } from '@/lib/billing';
```

---

For detailed patterns see `DEVELOPMENT_GUIDE.md` and pattern guides in `docs/architecture/patterns/`.
