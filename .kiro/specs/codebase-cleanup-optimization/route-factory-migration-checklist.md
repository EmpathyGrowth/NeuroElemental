# API Route Factory Pattern Migration Checklist

## Audit Summary

**Date:** November 24, 2025  
**Total Route Files:** 126  
**Using Factory Pattern:** 121 (96%)  
**Needs Migration:** 5 (4%)  
**Status:** Excellent adoption rate - only minor cleanup needed

## Factory Pattern Usage Breakdown

- **createAuthenticatedRoute:** 81 routes
- **createPublicRoute:** 32 routes  
- **createAdminRoute:** 19 routes

## Routes Requiring Migration

The following 5 routes need to be migrated to use the factory pattern:

### 1. Cron Job Routes (1 file)

#### app/api/cron/process-audit-exports/route.ts
- **Current State:** Uses `async function GET()` with manual try-catch and NextResponse.json
- **HTTP Methods:** GET
- **Authentication:** Manual CRON_SECRET validation
- **Migration Target:** `createPublicRoute` with CRON_SECRET validation inside handler
- **Priority:** Medium
- **Notes:** 
  - Contains manual authentication via CRON_SECRET header
  - Uses manual NextResponse.json for all responses
  - Should use response helpers (successResponse, errorResponse)

### 2. Organization Audit Routes (2 files)

#### app/api/organizations/[id]/audit/export/[jobId]/route.ts
- **Current State:** Uses `async function GET()` and `async function DELETE()` with manual try-catch
- **HTTP Methods:** GET, DELETE
- **Authentication:** Manual getCurrentUser() and isUserOrgAdmin() checks
- **Migration Target:** `createAuthenticatedRoute` with requireOrganizationAccess helper
- **Priority:** High
- **Notes:**
  - Contains manual authentication
  - Uses manual NextResponse.json
  - Should use notFoundError, forbiddenError, and successResponse helpers

#### app/api/organizations/[id]/audit/schedules/[scheduleId]/route.ts
- **Current State:** Uses `async function PATCH()` and `async function DELETE()` with manual try-catch
- **HTTP Methods:** PATCH, DELETE
- **Authentication:** Manual getCurrentUser() and isUserOrgOwner() checks
- **Migration Target:** `createAuthenticatedRoute` with custom owner check
- **Priority:** High
- **Notes:**
  - Contains manual authentication
  - Uses manual NextResponse.json
  - Should use validationError, notFoundError, forbiddenError, and successResponse helpers
  - Has extensive validation logic that could be extracted to schemas

### 3. Organization SSO Routes (2 files)

#### app/api/organizations/[id]/sso/attempts/route.ts
- **Current State:** Uses `async function GET()` with manual try-catch
- **HTTP Methods:** GET
- **Authentication:** Manual getCurrentUser() and isUserOrgAdmin() checks
- **Migration Target:** `createAuthenticatedRoute` with requireOrganizationAccess helper
- **Priority:** High
- **Notes:**
  - Contains manual authentication
  - Uses manual NextResponse.json
  - Should use validationError, forbiddenError, and successResponse helpers
  - Query parameter validation could be extracted to schema

#### app/api/organizations/[id]/sso/test/route.ts
- **Current State:** Uses `async function POST()` with manual try-catch
- **HTTP Methods:** POST
- **Authentication:** Manual getCurrentUser() and isUserOrgAdmin() checks
- **Migration Target:** `createAuthenticatedRoute` with requireOrganizationAccess helper
- **Priority:** High
- **Notes:**
  - Contains manual authentication
  - Uses manual NextResponse.json
  - Should use notFoundError, badRequestError, and successResponse helpers

## Migration Steps for Each Route

### Standard Migration Pattern

For each route file, follow these steps:

1. **Import factory and helpers:**
   ```typescript
   import {
     createAuthenticatedRoute,
     createPublicRoute,
     createAdminRoute,
     successResponse,
     errorResponse,
     notFoundError,
     forbiddenError,
     validationError,
     badRequestError
   } from '@/lib/api'
   ```

2. **Replace function declaration:**
   ```typescript
   // Before:
   export async function GET(request: NextRequest, context: RouteContext<T>) {
     try {
       const user = await getCurrentUser()
       if (!user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
       }
       // ... business logic
     } catch (error) {
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
     }
   }

   // After:
   export const GET = createAuthenticatedRoute<T>(async (request, context, user) => {
     // ... business logic (no try-catch needed)
   })
   ```

3. **Replace manual responses with helpers:**
   ```typescript
   // Before:
   return NextResponse.json({ data }, { status: 200 })
   
   // After:
   return successResponse(data)
   ```

4. **Replace manual errors with error factories:**
   ```typescript
   // Before:
   return NextResponse.json({ error: 'Not found' }, { status: 404 })
   
   // After:
   throw notFoundError('Resource')
   ```

5. **Remove manual try-catch blocks** - The factory handles this

6. **Remove manual authentication** - The factory handles this

## Additional Improvements Identified

While 121 routes already use the factory pattern, some could benefit from additional improvements:

### Routes Not Using Response Helpers (3 files)

These routes use the factory pattern but still use manual NextResponse.json:

1. **app/api/analytics/overview/route.ts**
   - Uses factory: ✓
   - Uses response helpers: ✗
   - Recommendation: Replace NextResponse.json with successResponse

2. **app/api/organizations/[id]/audit/export/[jobId]/download/route.ts**
   - Uses factory: ✓
   - Uses response helpers: ✗
   - Recommendation: May be intentional for file downloads, verify if response helpers support binary responses

3. **app/api/organizations/[id]/reports/[reportId]/download/[type]/route.ts**
   - Uses factory: ✓
   - Uses response helpers: ✗
   - Recommendation: May be intentional for file downloads, verify if response helpers support binary responses

## Migration Priority

### High Priority (4 files)
Organization-related routes that handle sensitive operations:
- app/api/organizations/[id]/audit/export/[jobId]/route.ts
- app/api/organizations/[id]/audit/schedules/[scheduleId]/route.ts
- app/api/organizations/[id]/sso/attempts/route.ts
- app/api/organizations/[id]/sso/test/route.ts

### Medium Priority (1 file)
Cron job that runs periodically:
- app/api/cron/process-audit-exports/route.ts

## Success Criteria

- [ ] All 5 routes migrated to use factory pattern
- [ ] Zero routes with manual try-catch blocks
- [ ] Zero routes with manual authentication (except special cases like CRON_SECRET)
- [ ] All routes use response helpers (successResponse, errorResponse, etc.)
- [ ] All routes use error factories (notFoundError, forbiddenError, etc.)
- [ ] TypeScript compilation passes with zero errors
- [ ] All existing tests pass
- [ ] Manual testing confirms functionality unchanged

## Testing Checklist

For each migrated route:
- [ ] Verify successful requests return correct data
- [ ] Verify authentication is enforced
- [ ] Verify authorization checks work correctly
- [ ] Verify error responses are properly formatted
- [ ] Verify HTTP status codes are correct
- [ ] Verify logging still works

## Notes

- The codebase has excellent factory pattern adoption (96%)
- Most routes already follow best practices
- The remaining 5 routes are straightforward migrations
- No breaking changes expected - factory pattern is backward compatible
- Consider extracting validation logic to schemas during migration

## Related Requirements

This checklist addresses:
- **Requirement 3.1:** API routes SHALL use factory pattern
- **Requirement 3.2:** Authentication SHALL use factory's built-in auth
- **Requirement 3.3:** Errors SHALL use factory's error handling
- **Requirement 3.4:** Responses SHALL use response helpers
- **Requirement 3.5:** Manual try-catch blocks SHALL be removed

## Completion Status

- [x] Audit completed
- [x] Routes identified
- [x] Migration checklist created
- [ ] Routes migrated (0/5)
- [ ] Testing completed
- [ ] Documentation updated
