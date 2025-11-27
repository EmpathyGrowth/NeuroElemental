# Migration to Unified Authentication

## What Changed

We consolidated the API structure to use **one authentication system** that supports both session cookies (web app) and API keys (programmatic access).

### Before (v1 Split)

```
/api/
├── organizations/[id]/credits      # Session auth only (web app)
└── v1/
    └── organizations/[id]/credits  # API key auth only (external)
```

**Problems:**
- Duplicate routes for same functionality
- Can't test API routes in browser
- Confusing documentation
- More code to maintain

### After (Unified)

```
/api/
└── organizations/[id]/credits      # BOTH session AND API key auth
```

**Benefits:**
- ✅ One route, two auth methods
- ✅ Test in browser (session) or curl (API key)
- ✅ Less code, easier to maintain
- ✅ Simpler documentation
- ✅ No version prefixes needed

## How It Works

### Smart Middleware

```typescript
// lib/middleware/api-auth.ts

export async function requireAuth(request, scopes) {
  // Try API key first
  if (hasApiKeyHeader) {
    return validateApiKey()
  }

  // Fall back to session
  if (hasSessionCookie) {
    return getCurrentUser()
  }

  // No auth
  return { error: 'Unauthorized' }
}
```

### Session vs API Key

**Session Auth** (Web App):
- Automatic via cookies
- Trusted user
- Full permissions (bypasses scopes)
- Still need to check org membership

**API Key Auth** (Programmatic):
- Explicit via `Authorization: Bearer` header
- Limited by scopes
- Organization locked to key
- Requires specific permissions

## Example Usage

### Same Route, Two Ways

**Browser (Session):**
```javascript
// Logged into web app
fetch('/api/organizations/org-123/credits')
  .then(r => r.json())
  .then(console.log)
```

**cURL (API Key):**
```bash
curl -H "Authorization: Bearer ne_live_xxx" \
  http://localhost:3000/api/organizations/org-123/credits
```

### Implementation Pattern

```typescript
export async function GET(request: NextRequest, { params }) {
  // 1. Authenticate (smart middleware)
  const auth = await requireAuth(request, ['credits:read'])
  if (auth.error) return auth.error

  // 2. Authorization (check access)
  if (auth.data.authMethod === 'session') {
    // Verify user is member
    await checkMembership(auth.data.userId, params.id)
  } else {
    // Verify org matches API key
    if (auth.data.organizationId !== params.id) {
      return error403()
    }
  }

  // 3. Handle request
  return getCredits(params.id)
}
```

## Files Changed

### Modified
- `lib/middleware/api-auth.ts` - Added session fallback
- `API_KEYS_GUIDE.md` - Updated to reflect unified approach
- `B2B_FEATURES.md` - Removed v1 references

### Removed
- `app/api/v1/**` - Entire v1 directory deleted

### Created
- `UNIFIED_AUTH_EXAMPLE.md` - Complete implementation guide
- `MIGRATION_UNIFIED_AUTH.md` - This file

## For Developers

### When Building New Routes

Always use the unified pattern:

```typescript
import { requireAuth } from '@/lib/middleware/api-auth'
import { API_SCOPES } from '@/lib/api-keys/manage'

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request, [API_SCOPES.CREDITS_READ])
  if (auth.error) return auth.error

  // Check authorization based on auth method
  if (auth.data.authMethod === 'session') {
    // Session-specific checks
  } else {
    // API key-specific checks
  }

  // Handle request
}
```

### Testing

1. **Browser Testing (Session)**
   - Log into web app
   - Open DevTools console
   - Call API directly with `fetch()`

2. **API Key Testing (Programmatic)**
   - Create API key in dashboard
   - Use cURL or Postman
   - Pass in `Authorization: Bearer` header

3. **Both Should Work!** ✅

## Why This Is Better

### For Users
- Same API works everywhere
- Test in browser before deploying
- No version confusion

### For Developers
- Less code duplication
- Easier to maintain
- Clear patterns

### For Business
- Faster development
- Fewer bugs
- Better DX (developer experience)

## Migration Checklist

Since you have no production users:

- [x] Update middleware to support both auth methods
- [x] Remove v1 routes
- [x] Update documentation
- [x] Create migration guide
- [ ] Update any existing route implementations (as needed)
- [ ] Test both auth methods work
- [ ] Update any frontend API clients

## Summary

**Old way:** Separate routes for session vs API key
**New way:** Same routes, smart middleware, both auth methods

**Result:** Simpler, cleaner, better! 🚀
