# NeuroElemental Codebase Refactoring Guide

## Executive Summary

**Code Health Score**: 7.5/10

The NeuroElemental codebase has **excellent infrastructure and utilities** already in place, but they are **not being consistently used**. This document provides a comprehensive guide to:
1. Leverage existing utilities
2. Apply Next.js 16 best practices
3. Eliminate technical debt
4. Improve type safety and code quality

**Estimated Effort**: ~140 hours total (40 critical, 60 high, 40 medium priority)

---

## ✅ New Utilities Created

The following utilities have been created to eliminate code duplication:

### 1. Date Formatting (`lib/utils/date-formatting.ts`)
**Replaces**: 7+ duplicate implementations
```typescript
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/utils'

// Before:
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString(...)

// After:
const formatted = formatDate(dateString)
const relative = formatRelativeTime(dateString) // "2 hours ago"
```

### 2. Timestamps (`lib/utils/timestamps.ts`)
**Replaces**: 40+ `new Date().toISOString()` calls
```typescript
import { getCurrentTimestamp, getTimestampFields } from '@/lib/utils'

// Before:
created_at: new Date().toISOString(),
updated_at: new Date().toISOString()

// After:
...getTimestampFields() // { created_at, updated_at }
```

### 3. useAsync Hook (`hooks/use-async.ts`)
**Replaces**: 20+ duplicate loading state patterns
```typescript
import { useAsync } from '@/hooks/use-async'

// Before: 15 lines of useState, try/catch, finally
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)
// ... fetch logic

// After: 3 lines
const { data, loading, error, execute } = useAsync<Course[]>()
await execute(async () => fetch('/api/courses').then(r => r.json()))
```

### 4. CSV Export (`lib/utils/csv-export.ts`)
**Replaces**: 3+ duplicate implementations
```typescript
import { exportToCSV } from '@/lib/utils'

// Before: 25 lines of CSV generation + download logic
const csv = [headers, ...rows].join('\n')
const blob = new Blob(...)
// ... download logic

// After: 1 line
exportToCSV(data, 'export', columns)
```

### 5. Constants (`lib/constants/index.ts`)
**Centralizes**: All magic numbers and hardcoded values
```typescript
import { PAGINATION, COURSE, ROLES } from '@/lib/constants'

// Before:
const limit = parseInt(searchParams.get('limit') || '20') // inconsistent values

// After:
const limit = getIntParam(request, 'limit', PAGINATION.DEFAULT_LIMIT)
```

---

## 🔴 Critical Priority (40 hours)

### 1. Replace console.log with Proper Logging
**Impact**: 80+ instances
**File**: `lib/logging/logger.ts` (already exists!)

**Find & Replace**:
```typescript
// ❌ Before
console.log('User logged in', userId)
console.error('Error:', error)

// ✅ After
import { logger } from '@/lib/logging/logger'
logger.info('User logged in', { userId })
logger.error('Error in login', { error: error.message })
```

**Affected Files**:
- `lib/auth/supabase.ts` (10+ instances)
- `components/auth/*.tsx` (5+ instances)
- All API routes `app/api/**/*.ts` (60+ instances)

### 2. Use Next/Image Instead of <img>
**Impact**: 2 files, significant performance improvement

**Files**:
- `app/blog/page.tsx`
- `app/blog/[slug]/page.tsx`

```tsx
// ❌ Before
<img src={post.image} alt={post.title} className="..." />

// ✅ After
import Image from 'next/image'
<Image
  src={post.image}
  alt={post.title}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
  priority={isFeatured}
/>
```

### 3. Implement Suspense Boundaries
**Impact**: All dashboard and course pages

**Pattern**:
```tsx
// app/dashboard/student/page.tsx
import { Suspense } from 'react'

export default function StudentDashboard() {
  return (
    <>
      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesList />  {/* Async Server Component */}
      </Suspense>

      <Suspense fallback={<CertificatesSkeleton />}>
        <CertificatesList />  {/* Async Server Component */}
      </Suspense>
    </>
  )
}
```

**Create loading.tsx files**:
```tsx
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return <DashboardSkeleton />
}
```

### 4. Consolidate Date Formatting
**Impact**: 7+ duplicate implementations

**Files to Update**:
- `app/dashboard/admin/waitlist/page.tsx`
- `app/dashboard/admin/coupons/page.tsx`
- `app/dashboard/organizations/[id]/sso/page.tsx`
- `app/dashboard/settings/privacy/page.tsx`
- `app/dashboard/admin/invitations/page.tsx`
- `app/dashboard/admin/overview/page.tsx`

```typescript
// ❌ Before (remove this)
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {...})
}

// ✅ After
import { formatDate } from '@/lib/utils'
```

### 5. Use Existing withAuth/withAdmin HOCs
**Impact**: 125 API routes
**Files**: `lib/api/with-admin.ts` (exists but **ZERO usage**)

```typescript
// ❌ Before (112 lines typical)
export async function GET(request: NextRequest, context: RouteContext) {
  const user = await getCurrentUser()
  if (!user) return unauthorizedError()

  const role = await getUserRole()
  if (role !== 'admin') return forbiddenError()

  // business logic (100+ lines)
}

// ✅ After (5 lines)
import { withAuth, withAdmin } from '@/lib/api/with-admin'

export const GET = withAdmin(async (request, user, params) => {
  // business logic only (100+ lines)
})
```

### 6. Fix 'any' Types
**Impact**: 20+ critical instances

**Files**:
- `app/dashboard/student/page.tsx`
- `app/dashboard/settings/privacy/page.tsx`
- `lib/api/error-handler.ts`
- `lib/api/request-helpers.ts`

```typescript
// ❌ Before
{enrollments.map((enrollment: any) => (

// ✅ After
import { Tables } from '@/lib/types/supabase'
type Enrollment = Tables<'enrollments'> & { course: Tables<'courses'> }

{enrollments.map((enrollment: Enrollment) => (
```

---

## 🟡 High Priority (60 hours)

### 7. Apply useAsync Hook
**Impact**: 20+ components

**Files**:
- `app/invite/[id]/page.tsx`
- `app/onboarding/page.tsx`
- `app/dashboard/student/page.tsx`
- `app/dashboard/profile/page.tsx`
- Plus 15+ more

```typescript
// ❌ Before (15 lines)
const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [data, setData] = useState(null)

const fetchData = async () => {
  setLoading(true)
  try {
    const response = await fetch('/api/data')
    const data = await response.json()
    setData(data)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// ✅ After (3 lines)
import { useAsync } from '@/hooks/use-async'

const { data, loading, error, execute } = useAsync<DataType>()
const fetchData = () => execute(() => fetch('/api/data').then(r => r.json()))
```

### 8. Use Timestamp Utilities
**Impact**: 40+ API routes

**Pattern**:
```typescript
// ❌ Before
import { getCurrentTimestamp, getTimestampFields, getExpiryTimestamp } from '@/lib/utils'

// Insert
await supabase.from('table').insert({
  ...data,
  ...getTimestampFields()  // created_at, updated_at
})

// Update
await supabase.from('table').update({
  ...data,
  ...getUpdateTimestamp()  // updated_at only
})

// Expiry
await supabase.from('subscriptions').insert({
  ...data,
  ...getExpiryTimestamp(365)  // expires in 365 days
})
```

### 9. Use Existing Validation System
**Impact**: 125 API routes
**Files**: `lib/validation/schemas.ts` (exists with **ZERO usage**)

```typescript
// ❌ Before (manual validation)
const { email, role } = body
if (!email) return badRequestError('Email required')

// ✅ After (use existing validation)
import { withValidation } from '@/lib/api/with-admin'
import { organizationMemberInviteSchema } from '@/lib/validation/schemas'

export const POST = withValidation(
  organizationMemberInviteSchema,
  async (request, validData, params) => {
    const { email, role } = validData // Fully typed!
    // business logic
  }
)
```

### 10. Convert API Routes to Server Actions
**Impact**: 40+ routes (internal mutations only)

**When to Convert**:
- ✅ Form submissions
- ✅ Profile updates
- ✅ Internal mutations
- ❌ Webhooks (keep as API route)
- ❌ Public APIs (keep as API route)
- ❌ External integrations (keep as API route)

**Pattern**:
```typescript
// ❌ Before: API route
// app/api/profile/route.ts
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  // update profile
  return NextResponse.json({ success: true })
}

// Client
await fetch('/api/profile', { method: 'PATCH', body: JSON.stringify(data) })

// ✅ After: Server Action
// app/actions/profile.ts
'use server'

export async function updateProfile(formData: FormData) {
  const user = await getCurrentUser()
  // direct database access
  revalidatePath('/dashboard/profile')
  return { success: true }
}

// Client
import { updateProfile } from '@/app/actions/profile'
await updateProfile(formData)
```

**Candidates** (40 routes):
- Profile operations
- Course enrollment (internal)
- Assignment submissions
- Quiz submissions
- Notification operations
- Settings updates

### 11. Add Dynamic Metadata
**Impact**: 10+ [slug] pages

```typescript
// app/courses/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const course = await getCourse(params.slug)

  return {
    title: `${course.title} | NeuroElemental`,
    description: course.description,
    openGraph: {
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: course.title,
      description: course.description,
      images: [course.thumbnail_url],
    },
  }
}
```

### 12. Implement Missing Email Templates
**Impact**: 6 templates
**Location**: `lib/email/templates/`

**Missing Templates**:
1. `organization-invitation.tsx`
2. `waitlist-confirmation.tsx`
3. `credit-low-warning.tsx`
4. `assignment-graded.tsx`
5. `course-enrollment.tsx`
6. `event-registration.tsx`

**Pattern** (use existing templates as reference):
```tsx
// lib/email/templates/organization-invitation.tsx
import { BaseEmailTemplate } from './base-template'

export function OrganizationInvitationEmail({ organizationName, inviterName, acceptUrl }) {
  return (
    <BaseEmailTemplate>
      <h1>You've been invited to {organizationName}</h1>
      <p>{inviterName} has invited you to join their organization.</p>
      <a href={acceptUrl}>Accept Invitation</a>
    </BaseEmailTemplate>
  )
}
```

---

## 🟢 Medium Priority (40 hours)

### 13. Use CSV Export Utility
**Impact**: 3 files

**Files**:
- `app/dashboard/admin/waitlist/page.tsx`
- `app/dashboard/organizations/[id]/credits/history/page.tsx`

```typescript
// ❌ Before (25 lines)
const csv = [
  ['Header1', 'Header2'].join(','),
  ...data.map(item => [item.field1, item.field2].join(','))
].join('\n')
const blob = new Blob([csv], { type: 'text/csv' })
const url = window.URL.createObjectURL(blob)
const a = document.createElement('a')
a.href = url
a.download = `export-${new Date().toISOString()}.csv`
a.click()

// ✅ After (3 lines)
import { exportToCSV } from '@/lib/utils'

exportToCSV(data, 'waitlist', [
  { key: 'email', label: 'Email' },
  { key: 'created_at', label: 'Joined', format: formatDate }
])
```

### 14. Add Dynamic Imports
**Impact**: 5+ heavy components

**Candidates**:
- Analytics chart libraries
- PDF generators (PDFKit)
- Rich text editors
- Admin panels

```tsx
import dynamic from 'next/dynamic'

const AnalyticsCharts = dynamic(() => import('./analytics-charts'), {
  loading: () => <LoadingSpinner />,
  ssr: false  // if needed
})

const CertificateGenerator = dynamic(() => import('./certificate-generator'))
```

### 15. Standardize Supabase Client Usage
**Current**: 5 different ways to create client

**Recommendation**:
- Server Components: `createClient()` from `lib/auth/supabase-server.ts`
- Client Components: `createClient()` from `lib/auth/supabase-client.ts`
- Service Operations: `getSupabaseServer()` from `lib/db/supabase-server.ts`
- **DEPRECATE**: `lib/auth/supabase.ts` singleton

### 16. Add error.tsx Files
**Impact**: All route segments

```tsx
// app/dashboard/error.tsx
'use client'

export default function DashboardError({
  error,
  reset
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### 17. Break Up Large Page Components
**Impact**: 3 files > 300 lines

**Files**:
- `app/dashboard/settings/privacy/page.tsx`
- `app/dashboard/admin/overview/page.tsx`
- `app/dashboard/organizations/[id]/sso/page.tsx`

**Pattern**:
```tsx
// Extract into smaller components
<PrivacyDataSummary />
<PrivacyExportSection />
<PrivacyDeletionSection />
<PrivacyAuditLog />
```

### 18. Document Database Indexes
**Create**: `docs/DATABASE_INDEXES.md`

```sql
-- High-traffic queries
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_organization_members_user_org ON organization_members(user_id, organization_id);
CREATE INDEX idx_credit_transactions_org_type ON credit_transactions(organization_id, credit_type);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_lesson_completions_user_lesson ON lesson_completions(user_id, lesson_id);
CREATE INDEX idx_quiz_submissions_user_quiz ON quiz_submissions(user_id, quiz_id);
```

### 19. Implement TODO Items

**Critical TODOs**:
1. `app/error.tsx:22` - Implement Sentry error tracking
2. `app/api/waitlist/route.ts:30` - Add admin check
3. `app/api/waitlist/route.ts:112` - Send confirmation email
4. `app/api/organizations/[id]/members/route.ts:91` - Send invitation email

### 20. Audit for N+1 Queries

**Suspicious Patterns** (potential N+1):
```typescript
// ❌ Bad (N+1)
const enrollments = await supabase.from('enrollments').select('*')
for (const enrollment of enrollments) {
  const course = await supabase.from('courses').select('*').eq('id', enrollment.course_id)
}

// ✅ Good (single query)
const enrollments = await supabase
  .from('enrollments')
  .select('*, courses(*)')
```

---

## 📊 Implementation Checklist

### Phase 1: Foundational Utilities (Week 1)
- [x] Create date formatting utilities
- [x] Create timestamp utilities
- [x] Create useAsync hook
- [x] Create CSV export utility
- [x] Create constants file
- [ ] Update all imports to use new utilities

### Phase 2: Critical Fixes (Weeks 2-3)
- [ ] Replace all console.log with logger
- [ ] Fix blog images to use Next/Image
- [ ] Add Suspense boundaries to key pages
- [ ] Update date formatting in 7+ files
- [ ] Refactor API routes to use withAuth/withAdmin HOCs
- [ ] Fix 'any' types in critical files

### Phase 3: High Priority (Weeks 4-6)
- [ ] Apply useAsync hook to 20+ components
- [ ] Use timestamp utilities in 40+ API routes
- [ ] Apply validation utilities to API routes
- [ ] Convert 40+ API routes to Server Actions
- [ ] Add dynamic metadata to [slug] pages
- [ ] Implement missing email templates

### Phase 4: Medium Priority (Weeks 7-8)
- [ ] Update CSV export implementations
- [ ] Add dynamic imports for heavy components
- [ ] Standardize Supabase client usage
- [ ] Add error.tsx files to route segments
- [ ] Break up large page components
- [ ] Document database indexes
- [ ] Implement TODO items
- [ ] Audit and fix N+1 queries

---

## 🎯 Quick Wins (Start Here)

If you want to start seeing immediate benefits, tackle these first:

1. **Use timestamp utilities** (2 hours, affects 40+ files)
   - Find & replace `new Date().toISOString()` with `getCurrentTimestamp()`
   - Find & replace timestamp object patterns with `getTimestampFields()`

2. **Fix blog images** (1 hour, 2 files)
   - Replace `<img>` with `<Image>` in blog pages
   - Immediate performance improvement

3. **Use date formatting utility** (3 hours, 7 files)
   - Remove duplicate `formatDate` functions
   - Import from centralized utility

4. **Replace console.log** (8 hours, 80+ files)
   - Find & replace with `logger` calls
   - Better debugging and monitoring

5. **Apply useAsync hook** (8 hours, pick 5-10 components)
   - Immediate code reduction (~10 lines per component)
   - Cleaner, more maintainable code

---

## 📈 Expected Outcomes

After completing this refactoring:

**Code Quality**:
- ✅ Reduced code duplication by ~40%
- ✅ Consistent patterns across codebase
- ✅ Improved type safety
- ✅ Better error handling and logging

**Performance**:
- ✅ Faster page loads (Next/Image, Suspense, dynamic imports)
- ✅ Better SEO (dynamic metadata)
- ✅ Reduced bundle size (code splitting)

**Developer Experience**:
- ✅ Faster development (reusable utilities)
- ✅ Easier debugging (proper logging)
- ✅ Better IntelliSense (proper types)
- ✅ Clearer code (less boilerplate)

**Maintainability**:
- ✅ Easier to add new features
- ✅ Easier to onboard new developers
- ✅ Consistent patterns reduce bugs
- ✅ Better test coverage (smaller, focused components)

---

## 🔗 Related Documentation

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Supabase TypeScript Guide](https://supabase.com/docs/guides/api/typescript-support)
- [Zod Validation](https://zod.dev/)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)

---

## 💡 Questions or Issues?

If you encounter any issues during refactoring:
1. Check this guide for patterns
2. Look at existing utility implementations
3. Test changes incrementally
4. Review TypeScript errors carefully
5. Use git to track changes and revert if needed

**Remember**: The goal is not perfection, but consistent improvement. Start with quick wins and work your way through the priorities.
