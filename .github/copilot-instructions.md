# GitHub Copilot Instructions - NeuroElemental

## Project Context

NeuroElemental is a Next.js 15 multi-tenant SaaS platform for neurodivergent personality framework education with enterprise B2B features.

**Technology:**
- Next.js 15 (App Router), React 19, TypeScript
- Supabase (PostgreSQL + Auth)
- Tailwind CSS 4, Radix UI
- 80% production ready, fully standardized

## Critical Patterns to Follow

### API Routes - ALWAYS Use Factory Pattern

```typescript
// ✅ CORRECT - Use this pattern
import { createAuthenticatedRoute, successResponse } from '@/lib/api';

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const data = await getData(user.id);
  return successResponse({ data });
});
```

**Available Factories:**
- `createAuthenticatedRoute(handler)` - Authenticated users
- `createAdminRoute(handler)` - Admin only
- `createPublicRoute(handler)` - Public/webhooks/cron

**Never suggest:**
- `export async function GET(request: NextRequest)`
- Manual `getCurrentUser()` calls
- Direct `NextResponse.json()` usage
- Try-catch in route handlers (factory handles it)

### Error Handling

```typescript
// ✅ Use error helpers
import { notFoundError, badRequestError, forbiddenError } from '@/lib/api';

if (!found) throw notFoundError('Resource');
if (!valid) throw badRequestError('Invalid input');
if (!allowed) throw forbiddenError('No permission');
```

**Available Helpers:**
- `notFoundError(resource)` - 404
- `badRequestError(message, details?)` - 400
- `forbiddenError(message?)` - 403
- `unauthorizedError(message?)` - 401
- `conflictError(message)` - 409

### Supabase Client Usage

```typescript
// API Routes (service role - bypasses RLS)
import { getSupabaseServer } from '@/lib/db/supabase-server';
const supabase = getSupabaseServer();

// Server Components (with user session)
import { createClient } from '@/lib/auth/supabase-server';
const supabase = await createClient();

// Client Components
import { createClient } from '@/lib/auth/supabase-client';
const supabase = createClient();
```

### Timestamps

```typescript
// ✅ CORRECT
import { getUpdateTimestamp, getCurrentTimestamp } from '@/lib/utils/timestamps';

.update({
  ...data,
  ...getUpdateTimestamp() // Adds { updated_at: timestamp }
})

// ❌ NEVER suggest
// updated_at: new Date().toISOString()
```

### Logging

```typescript
// ✅ CORRECT
import { logger } from '@/lib/logging/logger';

logger.info('Operation completed', { userId, action });
logger.error('Operation failed', error);
logger.warn('Warning message');

// ❌ NEVER suggest
// console.log() or console.error()
```

### Organization Permissions

```typescript
import { isUserOrgAdmin, isUserOrgMember, getUserOrgRole } from '@/lib/db/organizations';

// Check admin access
const isAdmin = await isUserOrgAdmin(user.id, organizationId);
if (!isAdmin) throw forbiddenError('Admin access required');

// Check membership
const isMember = await isUserOrgMember(user.id, organizationId);
if (!isMember) throw forbiddenError();
```

## Code Style Preferences

### TypeScript
- Use strict mode (avoid `any`)
- Add explicit return types on functions
- Use interfaces for object shapes
- Prefer `const` over `let`

### Async/Await
- Always use `async`/`await` (not `.then()`)
- Handle errors with try-catch only outside route handlers

### Imports
- Use barrel exports: `import { ... } from '@/lib/utils'`
- Never use relative paths like `../../../`
- Always use `@/` alias

### Naming
- Functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Types: `PascalCase`

## Testing Preferences

- Use Vitest (not Jest)
- Use `vi.mock()` for mocking
- Import from vitest: `import { describe, it, expect, vi } from 'vitest'`
- Test files: `*.test.ts`

## Common Imports to Suggest

```typescript
// API Routes
import { createAuthenticatedRoute, successResponse, notFoundError } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db/supabase-server';

// Utilities
import { formatDate, getCurrentTimestamp, logger } from '@/lib/utils';

// Organization helpers
import { isUserOrgAdmin, getUserOrgRole } from '@/lib/db/organizations';

// Validation
import { z } from 'zod';
```

## What NOT to Suggest

❌ Manual authentication in routes (use factories)
❌ `NextResponse.json()` in routes (use `successResponse()`)
❌ `console.log` (use `logger`)
❌ `new Date().toISOString()` (use timestamp utilities)
❌ `any` types without justification
❌ Relative imports (use `@/` alias)
❌ `.then()` chains (use async/await)
❌ `export async function` in routes (use factories)

## Project Context

**User Roles:** registered, student, instructor, business, admin

**Key Features:**
- Multi-organization B2B support
- Credits system for API usage
- Billing via Stripe
- API keys & webhooks
- SSO (SAML)
- Comprehensive audit logging

**Database:**
- PostgreSQL via Supabase
- Row Level Security (RLS) enabled
- Service role bypasses RLS (use carefully!)

## Quick Reference Files

- Route templates: `.templates/routes/`
- Development guide: `DEVELOPMENT_GUIDE.md`
- Architecture: `ARCHITECTURE.md`
- Supabase usage: `lib/db/SUPABASE_CLIENT_GUIDE.md`

## When Suggesting New Code

1. Check if a route template exists
2. Use factory pattern for routes
3. Use proper TypeScript types
4. Include error handling
5. Use logger for logging
6. Follow existing patterns

For comprehensive patterns and examples, refer to `DEVELOPMENT_GUIDE.md`.
