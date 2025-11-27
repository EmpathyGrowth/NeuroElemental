# Supabase Client Usage Guide

This guide explains when and how to use each Supabase client in the codebase.

## Available Clients

### 1. Browser Client (Client Components)
**File:** `lib/auth/supabase-client.ts`
**Export:** `createClient()`
**Usage:** Client Components, browser-side code
**Auth:** Uses anon key with RLS policies
**Cookies:** Managed automatically by `@supabase/ssr`

```typescript
import { createClient } from '@/lib/auth/supabase-client';

export default function MyClientComponent() {
  const supabase = createClient();
  // Use for client-side auth and queries
}
```

### 2. Server Client with Auth (Server Components, Middleware)
**File:** `lib/auth/supabase-server.ts`
**Export:** `createClient()`
**Usage:** Server Components, Middleware, Route Handlers with user context
**Auth:** Uses anon key + cookies for session
**Cookies:** Read/write via Next.js cookies()

```typescript
import { createClient } from '@/lib/auth/supabase-server';

export default async function MyServerComponent() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // Use for server-side rendering with user context
}
```

### 3. Service Role Client (API Routes, Background Jobs)
**File:** `lib/db/supabase-server.ts`
**Export:** `getSupabaseServer()`
**Usage:** API routes, cron jobs, admin operations
**Auth:** Service role key (bypasses RLS)
**Cookies:** None (stateless)

```typescript
import { getSupabaseServer } from '@/lib/db/supabase-server';

export const GET = createPublicRoute(async (request, context) => {
  const supabase = getSupabaseServer();
  // Use for database operations in API routes
  // ⚠️ Bypasses RLS - use with caution
});
```

### 4. Auth Helper Functions
**File:** `lib/auth/supabase.ts`
**Exports:** `signIn()`, `signUp()`, `signOut()`, etc.
**Usage:** Client-side authentication flows
**Note:** These functions use browser client internally

```typescript
import { signIn, signUp, signOut } from '@/lib/auth/supabase';

// In client components
await signIn(email, password);
await signUp(email, password, name);
await signOut();
```

## Decision Tree

```
Are you in a...

├─ Client Component?
│  └─ Use: createClient() from lib/auth/supabase-client.ts
│     OR use auth helpers from lib/auth/supabase.ts
│
├─ Server Component with user context?
│  └─ Use: createClient() from lib/auth/supabase-server.ts
│
├─ API Route (with factory pattern)?
│  └─ Use: getSupabaseServer() from lib/db/supabase-server.ts
│
├─ Middleware?
│  └─ Use: createClient() from lib/auth/supabase-server.ts
│
└─ Background job / Cron?
   └─ Use: getSupabaseServer() from lib/db/supabase-server.ts
```

## Common Patterns

### Pattern 1: Client Component with Auth
```typescript
'use client';

import { createClient } from '@/lib/auth/supabase-client';
import { useEffect, useState } from 'react';

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  return <div>{user?.email}</div>;
}
```

### Pattern 2: Server Component with RLS
```typescript
import { createClient } from '@/lib/auth/supabase-server';

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Queries respect RLS for this user
  const { data } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', user.id);

  return <div>{data}</div>;
}
```

### Pattern 3: API Route with Service Role
```typescript
import { createAuthenticatedRoute, successResponse } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db/supabase-server';

export const GET = createAuthenticatedRoute(async (request, context, user) => {
  const supabase = getSupabaseServer();

  // Service role bypasses RLS
  // Manual permission checks required
  const { data } = await supabase
    .from('sensitive_data')
    .select('*')
    .eq('user_id', user.id);

  return successResponse({ data });
});
```

### Pattern 4: Using Auth Helpers
```typescript
'use client';

import { signIn, signOut } from '@/lib/auth/supabase';

export default function LoginForm() {
  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await signIn(email, password);
    if (error) {
      console.error(error);
    }
  };

  return <button onClick={() => handleLogin('user@example.com', 'pass')}>Login</button>;
}
```

## Migration Guide

### ❌ OLD (Deprecated)
```typescript
import { supabase } from '@/lib/auth/supabase';

// This hybrid client is deprecated
const user = await supabase.auth.getUser();
```

### ✅ NEW (Client Component)
```typescript
import { createClient } from '@/lib/auth/supabase-client';

const supabase = createClient();
const user = await supabase.auth.getUser();
```

### ✅ NEW (Server Component)
```typescript
import { createClient } from '@/lib/auth/supabase-server';

const supabase = await createClient();
const user = await supabase.auth.getUser();
```

### ✅ NEW (API Route)
```typescript
import { getSupabaseServer } from '@/lib/db/supabase-server';

const supabase = getSupabaseServer();
// For database operations only
```

## Security Considerations

### RLS (Row Level Security)
- **Browser Client** (`supabase-client.ts`): Always respects RLS
- **Server Client** (`supabase-server.ts`): Respects RLS with user session
- **Service Role** (`db/supabase-server.ts`): **Bypasses RLS** - use with caution!

### When to Use Service Role
✅ Good use cases:
- Admin operations (user management, system config)
- Background jobs (cleanup, aggregations)
- Cross-user queries (analytics, reports)
- Operations requiring elevated permissions

❌ Avoid for:
- User-facing operations (use RLS instead)
- Direct user data access (prefer server client with session)
- Operations that could be handled with RLS policies

### Permission Checks with Service Role
When using service role, always verify permissions manually:

```typescript
import { getSupabaseServer } from '@/lib/db/supabase-server';
import { forbiddenError } from '@/lib/api';

export const DELETE = createAuthenticatedRoute(async (request, context, user) => {
  const { id } = await context.params;
  const supabase = getSupabaseServer();

  // Manual ownership check (since RLS is bypassed)
  const { data: resource } = await supabase
    .from('resources')
    .select('user_id')
    .eq('id', id)
    .single();

  if (resource.user_id !== user.id) {
    throw forbiddenError('You do not own this resource');
  }

  // Safe to proceed
  await supabase.from('resources').delete().eq('id', id);
});
```

## Common Mistakes

### ❌ Mistake 1: Using Service Role for User Queries
```typescript
// DON'T: This bypasses RLS and could leak data
const supabase = getSupabaseServer();
const { data } = await supabase
  .from('user_profiles')
  .select('*'); // Returns ALL profiles!
```

✅ **Fix:** Use server client with session
```typescript
const supabase = await createClient(); // From supabase-server.ts
const { data } = await supabase
  .from('user_profiles')
  .select('*'); // Returns only profiles user has access to
```

### ❌ Mistake 2: Using Browser Client on Server
```typescript
// DON'T: This won't work on server
import { createClient } from '@/lib/auth/supabase-client';

export default async function ServerComponent() {
  const supabase = createClient(); // ERROR: window is not defined
}
```

✅ **Fix:** Use server client
```typescript
import { createClient } from '@/lib/auth/supabase-server';

export default async function ServerComponent() {
  const supabase = await createClient(); // Works on server
}
```

### ❌ Mistake 3: Not Awaiting Server Client
```typescript
// DON'T: createClient() from supabase-server.ts is async
const supabase = createClient(); // Missing await!
```

✅ **Fix:**
```typescript
const supabase = await createClient();
```

## Testing

For testing, use mocked clients:

```typescript
import { vi } from 'vitest';

vi.mock('@/lib/db/supabase-server', () => ({
  getSupabaseServer: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ data: [], error: null })),
    })),
  })),
}));
```

## Summary

| Context | File | Export | Auth | RLS |
|---------|------|--------|------|-----|
| Client Components | `lib/auth/supabase-client.ts` | `createClient()` | Anon + Cookies | ✅ Enforced |
| Server Components | `lib/auth/supabase-server.ts` | `createClient()` | Anon + Cookies | ✅ Enforced |
| API Routes | `lib/db/supabase-server.ts` | `getSupabaseServer()` | Service Role | ❌ Bypassed |
| Auth Helpers | `lib/auth/supabase.ts` | `signIn()`, etc. | Uses Browser Client | ✅ Enforced |

**Last Updated:** 2025-01-22
