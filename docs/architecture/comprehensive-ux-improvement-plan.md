# NeuroElemental - Comprehensive UX Improvement Plan

**Created**: 2025-11-29
**Status**: Planning
**Estimated Duration**: 6-8 weeks (phased approach)

---

## Executive Summary

This plan addresses all critical issues identified in the codebase analysis across 8 major areas:
- Security & Authentication
- Mobile Navigation & Responsiveness
- Forms, Validation & State Management
- Settings & User Preferences
- Learning Experience & Assessment Integration
- Landing Pages & Trust Signals
- Dashboard & Admin Improvements
- Accessibility & Polish

---

## Phase 1: Critical Security & Authentication (Week 1)

### 1.1 Password Validation Consistency
**Priority**: Critical | **Effort**: 2 hours

**Problem**: Signup allows 8-char passwords, but reset requires uppercase+lowercase+number

**Files to modify**:
- `lib/validation/schemas.ts` - Unify password schema
- `components/auth/signup-form.tsx` - Use unified schema
- `app/auth/reset-password/page.tsx` - Use unified schema

**Implementation**:
```typescript
// lib/validation/schemas.ts
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number');

export const signupSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: emailSchema,
  password: passwordSchema, // Use unified schema
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
```

### 1.2 Redirect Consistency
**Priority**: Critical | **Effort**: 1 hour

**Problem**: Mixed `window.location.href` and `router.replace` usage

**Files to modify**:
- `components/auth/signup-form.tsx:60` - Change to router.replace
- `app/auth/login/page.tsx:18` - Change to router.replace

**Implementation**:
```typescript
// All auth redirects should use:
import { useRouter } from 'next/navigation';
const router = useRouter();
router.replace('/dashboard');
```

### 1.3 Password Strength Indicator
**Priority**: High | **Effort**: 3 hours

**Files to create**:
- `components/auth/password-strength-meter.tsx`

**Files to modify**:
- `components/auth/signup-form.tsx` - Add strength meter
- `app/auth/reset-password/page.tsx` - Add strength meter

### 1.4 Onboarding State Persistence
**Priority**: Critical | **Effort**: 4 hours

**Problem**: Users can't resume incomplete onboarding

**Database migration**:
```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_current_step TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
```

**Files to modify**:
- `lib/db/users.ts` - Add onboarding tracking functions
- `app/onboarding/page.tsx` - Save progress on each step
- `app/dashboard/page.tsx` - Check onboarding completion before redirect

---

## Phase 2: Mobile Navigation & Responsiveness (Week 1-2)

### 2.1 Mobile Admin Sidebar
**Priority**: Critical | **Effort**: 6 hours

**Problem**: Admin sidebar completely hidden on mobile with no alternative

**Files to create**:
- `components/dashboard/mobile-sidebar.tsx` - Sheet-based mobile nav

**Files to modify**:
- `components/dashboard/admin-sidebar.tsx` - Add mobile toggle
- `app/dashboard/admin/layout.tsx` - Include mobile component

**Implementation approach**:
```typescript
// Use Sheet component for mobile drawer
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function MobileSidebar({ items }: { items: NavItem[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        {/* Render same nav items */}
      </SheetContent>
    </Sheet>
  );
}
```

### 2.2 Implement Breadcrumbs
**Priority**: High | **Effort**: 4 hours

**Problem**: 897-line breadcrumb component exists but is never used

**Files to modify**:
- `app/dashboard/admin/layout.tsx` - Add BreadcrumbProvider
- `app/dashboard/admin/[section]/page.tsx` - Add breadcrumb display
- Create `hooks/use-breadcrumbs.ts` - Dynamic breadcrumb generation

**Implementation**:
```typescript
// hooks/use-breadcrumbs.ts
export function useBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return segments.map((segment, index) => ({
    label: formatLabel(segment),
    href: '/' + segments.slice(0, index + 1).join('/'),
    current: index === segments.length - 1,
  }));
}
```

### 2.3 Student/Instructor Secondary Navigation
**Priority**: High | **Effort**: 4 hours

**Problem**: Student/Instructor dashboards lack visible navigation for features

**Files to create**:
- `components/dashboard/student-sidebar.tsx`
- `components/dashboard/instructor-sidebar.tsx`

**Files to modify**:
- `app/dashboard/student/layout.tsx` - Add sidebar
- `app/dashboard/instructor/layout.tsx` - Add sidebar

---

## Phase 3: Forms, Validation & State Management (Week 2)

### 3.1 Unified Form Validation with Zod
**Priority**: High | **Effort**: 8 hours

**Problem**: 500+ lines of Zod schemas exist but aren't used in admin CRUD

**Files to modify**:
- `app/dashboard/admin/courses/new/page.tsx` - Use courseSchema
- `app/dashboard/admin/blog/new/page.tsx` - Use blogSchema
- `app/dashboard/admin/events/new/page.tsx` - Use eventSchema
- All edit pages - Use corresponding schemas

**Create shared form hook**:
```typescript
// hooks/use-validated-form.ts
export function useValidatedForm<T extends z.ZodSchema>(
  schema: T,
  defaultValues: z.infer<T>
) {
  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return form;
}
```

### 3.2 Standardize Dialog Patterns
**Priority**: High | **Effort**: 4 hours

**Problem**: Three different dialog patterns used (useConfirmDialog, Dialog+state, window.confirm)

**Files to migrate to useConfirmDialog**:
- `app/dashboard/admin/users/page.tsx` - 5+ dialog instances
- `app/dashboard/admin/events/[id]/edit/page.tsx` - date picker dialogs

### 3.3 Refactor Users Page State
**Priority**: High | **Effort**: 6 hours

**Problem**: 12+ useState calls in single 876-line component

**Files to modify**:
- `app/dashboard/admin/users/page.tsx`

**Implementation**:
```typescript
// Replace 12 useState calls with useReducer
type UsersPageState = {
  searchQuery: string;
  roleFilter: string;
  currentPage: number;
  pageSize: number;
  selectedUsers: User[];
  dialogs: {
    view: { open: boolean; user: User | null };
    edit: { open: boolean; user: User | null };
    role: { open: boolean; user: User | null; newRole: string };
    email: { open: boolean; user: User | null };
  };
  saving: boolean;
};

type UsersPageAction =
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ROLE_FILTER'; payload: string }
  | { type: 'OPEN_DIALOG'; payload: { dialog: keyof State['dialogs']; user: User } }
  | { type: 'CLOSE_DIALOG'; payload: keyof State['dialogs'] }
  // ... etc

function usersPageReducer(state: UsersPageState, action: UsersPageAction) {
  // Handle actions
}
```

### 3.4 Add Inline Field Errors
**Priority**: Medium | **Effort**: 3 hours

**Problem**: Forms only show toast notifications, not inline field errors

**Files to create**:
- `components/ui/form-field-error.tsx`

**Files to modify**:
- All form pages - Add inline error display

---

## Phase 4: Settings & User Preferences (Week 3)

### 4.1 Migrate Learning Preferences to Database
**Priority**: High | **Effort**: 4 hours

**Problem**: Learning preferences stored in auth.user_metadata, not database

**Database migration**:
```sql
CREATE TABLE IF NOT EXISTS learning_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  learning_style TEXT DEFAULT 'visual',
  content_pacing TEXT DEFAULT 'normal',
  auto_play_videos BOOLEAN DEFAULT false,
  video_speed NUMERIC DEFAULT 1.0,
  show_captions BOOLEAN DEFAULT true,
  audio_descriptions BOOLEAN DEFAULT false,
  daily_goal_minutes INTEGER DEFAULT 30,
  break_reminders BOOLEAN DEFAULT true,
  break_interval_minutes INTEGER DEFAULT 25,
  focus_mode BOOLEAN DEFAULT false,
  hide_distractions BOOLEAN DEFAULT false,
  progress_reminders BOOLEAN DEFAULT true,
  achievement_notifications BOOLEAN DEFAULT true,
  streak_reminders BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE learning_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON learning_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON learning_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON learning_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

**Files to modify**:
- `app/api/user/learning-preferences/route.ts` - Use database instead of metadata
- `lib/db/index.ts` - Add learningPreferencesRepository

### 4.2 Sync Appearance Settings to Server
**Priority**: Medium | **Effort**: 4 hours

**Problem**: Appearance settings only in localStorage, lost on other devices

**Database migration**:
```sql
CREATE TABLE IF NOT EXISTS appearance_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'system',
  accent_color TEXT DEFAULT 'purple',
  font_size INTEGER DEFAULT 100,
  compact_mode BOOLEAN DEFAULT false,
  reduced_motion BOOLEAN DEFAULT false,
  high_contrast BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Files to create**:
- `app/api/user/appearance/route.ts`

**Files to modify**:
- `components/settings/appearance-settings.tsx` - Sync to server

### 4.3 Add Timezone Settings
**Priority**: Medium | **Effort**: 3 hours

**Files to modify**:
- `app/dashboard/settings/page.tsx` - Add timezone selector
- `lib/db/users.ts` - Add timezone field
- Database migration to add timezone to profiles

### 4.4 Enable Email Change
**Priority**: Medium | **Effort**: 4 hours

**Problem**: Email is hardcoded read-only

**Files to modify**:
- `app/dashboard/profile/page.tsx` - Add email change form
- `app/api/profile/route.ts` - Handle email update with verification

---

## Phase 5: Learning Experience & Assessment Integration (Week 3-4)

### 5.1 Connect Assessment to Course Recommendations
**Priority**: High | **Effort**: 8 hours

**Problem**: Assessment results never used to recommend courses

**Database requirements**:
```sql
-- Add element tags to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS element_tags TEXT[] DEFAULT '{}';

-- Create element-course mapping table
CREATE TABLE IF NOT EXISTS course_element_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  element TEXT NOT NULL, -- 'electric', 'fiery', 'aquatic', etc.
  relevance_score NUMERIC DEFAULT 0.5, -- How relevant (0-1)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Files to create**:
- `lib/db/recommendations.ts` - Recommendation repository
- `app/api/recommendations/route.ts` - Get personalized recommendations
- `components/recommendations/element-based-courses.tsx` - Display component

**Files to modify**:
- `app/dashboard/page.tsx` - Show recommended courses
- `app/results/page.tsx` - Add "Recommended Courses" section

### 5.2 Learning Path Visualization
**Priority**: Medium | **Effort**: 6 hours

**Files to create**:
- `components/learning-path/personalized-roadmap.tsx`
- `components/learning-path/progress-timeline.tsx`

### 5.3 Assessment History Tracking
**Priority**: Medium | **Effort**: 4 hours

**Files to create**:
- `components/results/assessment-history-chart.tsx`

**Files to modify**:
- `app/results/page.tsx` - Add history tab

### 5.4 Energy Tracking Dashboard
**Priority**: Medium | **Effort**: 6 hours

**Files to create**:
- `components/dashboard/energy-dashboard.tsx`
- `components/dashboard/energy-monitor.tsx`

---

## Phase 6: Landing Pages & Trust Signals (Week 4-5)

### 6.1 Expand Testimonials
**Priority**: High | **Effort**: 3 hours

**Problem**: Only 3 testimonials with initials only

**Files to modify**:
- `components/landing/testimonials-section.tsx`
- Add 3-4 more testimonials with full names, photos, verification badges

### 6.2 Improve Pricing Page Copy
**Priority**: High | **Effort**: 2 hours

**Files to modify**:
- `app/pricing/page.tsx`

**Copy improvements**:
| Current | Improved |
|---------|----------|
| "Perfect for getting started" (Free) | "Free forever for basic self-discovery" |
| "For serious personal development" (Pro) | "For people ready to eliminate burnout patterns" |
| "Learn More" (Practitioner) | "See Certification Details" |

### 6.3 Add Founder Credentials
**Priority**: Medium | **Effort**: 2 hours

**Files to modify**:
- `app/about/page.tsx` - Add credentials, education, research background

### 6.4 Clarify Practitioner Tier
**Priority**: Medium | **Effort**: 2 hours

**Problem**: Practitioner certification positioning is confusing

**Files to modify**:
- `app/pricing/page.tsx` - Separate certification from subscriptions
- Consider creating `/app/certification/page.tsx` for dedicated info

### 6.5 Add Results Preview
**Priority**: Medium | **Effort**: 3 hours

**Files to modify**:
- `app/framework/page.tsx` - Add sample results profile visualization

---

## Phase 7: Dashboard & Admin Improvements (Week 5-6)

### 7.1 Split Course Editor
**Priority**: High | **Effort**: 8 hours

**Problem**: 1118-line component is unmaintainable

**Files to create**:
- `components/courses/course-editor/index.tsx` - Main coordinator
- `components/courses/course-editor/module-list.tsx` - Module management
- `components/courses/course-editor/lesson-editor.tsx` - Lesson editing
- `components/courses/course-editor/module-form.tsx` - Add/edit module dialog
- `components/courses/course-editor/lesson-form.tsx` - Add/edit lesson dialog

**Files to modify**:
- `app/dashboard/instructor/courses/[id]/edit/page.tsx` - Use new components

### 7.2 Drag-Drop Module Reordering
**Priority**: Medium | **Effort**: 6 hours

**Problem**: Current button-based reordering is inefficient

**Dependencies**: @dnd-kit/core, @dnd-kit/sortable

**Files to modify**:
- `components/courses/course-editor/module-list.tsx` - Add DnD

### 7.3 Real-Time Notifications
**Priority**: Medium | **Effort**: 4 hours

**Problem**: Notifications use one-time fetch, not real-time

**Files to modify**:
- `components/global/notification-bell.tsx` - Add Supabase subscription

```typescript
useEffect(() => {
  const channel = supabase
    .channel('notifications')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${userId}`,
    }, (payload) => {
      setNotifications(prev => [payload.new, ...prev]);
      setUnreadCount(prev => prev + 1);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [userId]);
```

### 7.4 DataTable Enhancements
**Priority**: Low | **Effort**: 6 hours

**Files to modify**:
- `components/ui/data-table.tsx`

**Enhancements**:
- Add inline editing for quick updates
- Add row expansion for details
- Add date range filters

---

## Phase 8: Accessibility & Polish (Week 6-7)

### 8.1 Add ARIA Labels
**Priority**: High | **Effort**: 4 hours

**Files to modify**:
- `components/ui/button.tsx` - Icon button aria-label support
- `components/ui/data-table.tsx` - Add aria-rowcount, aria-colcount
- `components/dashboard/admin-sidebar.tsx` - Add aria-current

### 8.2 Reduced Motion Support
**Priority**: Medium | **Effort**: 3 hours

**Files to modify**:
- `app/globals.css` - Add prefers-reduced-motion queries
- `components/ui/energy-orb.tsx` - Respect reduced motion
- All animation components

### 8.3 Dyslexia-Friendly Font Option
**Priority**: Medium | **Effort**: 3 hours

**Files to create**:
- Add OpenDyslexic font to public/fonts

**Files to modify**:
- `components/settings/appearance-settings.tsx` - Add font toggle
- `app/globals.css` - Add dyslexia font class

### 8.4 Keyboard Shortcuts
**Priority**: Low | **Effort**: 4 hours

**Files to create**:
- `hooks/use-keyboard-shortcuts.ts`
- `components/global/keyboard-shortcuts-dialog.tsx`

**Shortcuts to implement**:
- `Cmd+K` - Quick search/navigation
- `?` - Show shortcuts help
- `Esc` - Close dialogs

### 8.5 Skip to Content Enhancement
**Priority**: Low | **Effort**: 1 hour

**Files to modify**:
- `components/skip-to-content.tsx` - Improve styling and visibility

---

## Implementation Order Summary

### Week 1: Critical Fixes
- [ ] 1.1 Password validation consistency
- [ ] 1.2 Redirect consistency
- [ ] 1.3 Password strength indicator
- [ ] 1.4 Onboarding state persistence
- [ ] 2.1 Mobile admin sidebar

### Week 2: Navigation & Forms
- [ ] 2.2 Implement breadcrumbs
- [ ] 2.3 Student/Instructor secondary navigation
- [ ] 3.1 Unified form validation
- [ ] 3.2 Standardize dialog patterns
- [ ] 3.3 Refactor users page state

### Week 3: Settings & Learning
- [ ] 3.4 Add inline field errors
- [ ] 4.1 Migrate learning preferences to DB
- [ ] 4.2 Sync appearance settings
- [ ] 5.1 Connect assessment to recommendations

### Week 4: Learning Experience
- [ ] 4.3 Add timezone settings
- [ ] 4.4 Enable email change
- [ ] 5.2 Learning path visualization
- [ ] 5.3 Assessment history tracking

### Week 5: Landing & Dashboard
- [ ] 6.1 Expand testimonials
- [ ] 6.2 Improve pricing copy
- [ ] 6.3 Add founder credentials
- [ ] 7.1 Split course editor

### Week 6: Polish
- [ ] 7.2 Drag-drop module reordering
- [ ] 7.3 Real-time notifications
- [ ] 8.1 Add ARIA labels
- [ ] 8.2 Reduced motion support

### Week 7: Final Polish
- [ ] 8.3 Dyslexia-friendly font
- [ ] 8.4 Keyboard shortcuts
- [ ] 8.5 Skip to content enhancement
- [ ] Final testing and QA

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Mobile admin usability | 0% (hidden) | 100% functional |
| Password validation consistency | Mismatched | 100% consistent |
| Form validation coverage | ~20% | 100% |
| Breadcrumb usage | 0 pages | All dashboard pages |
| Testimonials with photos | 0 | 6+ |
| Assessment-course connection | None | Full integration |
| Accessibility score | ~60% | 90%+ |

---

## Dependencies

**NPM packages to add**:
- `@dnd-kit/core` - Drag and drop
- `@dnd-kit/sortable` - Sortable lists

**Database migrations required**:
- `learning_preferences` table
- `appearance_preferences` table
- `course_element_mappings` table
- `profiles.onboarding_current_step` column
- `profiles.timezone` column

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Large refactors break existing functionality | Comprehensive testing before merge |
| Database migrations affect production | Use Supabase branching for testing |
| State management changes introduce bugs | Implement incrementally with feature flags |
| User preferences migration loses data | Create migration script to copy from metadata |

---

## Notes

- All changes follow existing patterns in `CLAUDE.md`
- Use factory pattern for all new API routes
- Use repository pattern for all new database access
- Run `npm run lint` and `npm run typecheck` before each commit
- Create feature branches for each phase
