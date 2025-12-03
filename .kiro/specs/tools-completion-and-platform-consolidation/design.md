# Design Document: Tools Completion and Platform Consolidation

## Overview

This design document outlines the technical architecture for completing the NeuroElemental tools feature set and consolidating platform components. The implementation leverages the existing repository pattern, API route factory, and TypeScript strict mode infrastructure.

### Goals

1. Connect all 7 tools to backend persistence using existing repositories
2. Add user personalization based on assessment results
3. Consolidate duplicate dashboard and upload components
4. Implement analytics, gamification, and accessibility features

### Non-Goals

- Redesigning the tool UIs (already complete)
- Changing the assessment algorithm
- Modifying the core element/mode framework

## Architecture

### High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        TOOLS LAYER                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Daily   │  │  Energy  │  │  State   │  │  Shadow  │       │
│  │ Check-In │  │  Budget  │  │ Tracker  │  │   Work   │       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘       │
└───────┼─────────────┼─────────────┼─────────────┼──────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API ROUTES LAYER                            │
│  /api/tools/check-in  /api/tools/budget  /api/tools/state       │
│  /api/tools/shadow    /api/tools/quiz    /api/tools/regen       │
└───────┬─────────────┬─────────────┬─────────────┬──────────────┘
        │             │             │             │
        ▼             ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPOSITORY LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │    Logs      │  │   Energy     │  │   Shadow     │          │
│  │  Repository  │  │   Budget     │  │   Sessions   │          │
│  │  (existing)  │  │  Repository  │  │  Repository  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Learning    │  │  Strategy    │  │    Tool      │          │
│  │   Streaks    │  │   Ratings    │  │  Analytics   │          │
│  │  (existing)  │  │  Repository  │  │  Repository  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SUPABASE DATABASE                             │
│  logs | energy_budgets | shadow_sessions | strategy_ratings     │
│  tool_analytics | achievements | user_streaks                   │
└─────────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### New Repositories

#### EnergyBudgetRepository

```typescript
// lib/db/energy-budgets.ts
export interface EnergyBudget {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  total_budget: number;
  activities: EnergyActivity[];
  remaining_budget: number;
  created_at: string;
  updated_at: string;
}

export interface EnergyActivity {
  id: string;
  name: string;
  cost: number; // positive = drain, negative = regenerate
  category: "work" | "social" | "chore" | "regeneration";
}

export class EnergyBudgetRepository extends BaseRepository<"energy_budgets"> {
  async getByUserAndDate(
    userId: string,
    date: string
  ): Promise<EnergyBudget | null>;
  async upsert(
    userId: string,
    date: string,
    data: Partial<EnergyBudget>
  ): Promise<EnergyBudget>;
  async getHistory(userId: string, limit?: number): Promise<EnergyBudget[]>;
}
```

#### ShadowSessionRepository

```typescript
// lib/db/shadow-sessions.ts
export interface ShadowSession {
  id: string;
  user_id: string;
  element: ElementType;
  current_step: number; // 1-4
  reflections: Record<number, string>; // step -> reflection text
  started_at: string;
  completed_at: string | null;
  status: "in_progress" | "completed" | "abandoned";
}

export class ShadowSessionRepository extends BaseRepository<"shadow_sessions"> {
  async getActiveSession(userId: string): Promise<ShadowSession | null>;
  async createSession(
    userId: string,
    element: ElementType
  ): Promise<ShadowSession>;
  async updateProgress(
    sessionId: string,
    step: number,
    reflection?: string
  ): Promise<ShadowSession>;
  async completeSession(sessionId: string): Promise<ShadowSession>;
  async getCompletedByElement(
    userId: string
  ): Promise<Record<ElementType, number>>;
}
```

#### StrategyRatingRepository

```typescript
// lib/db/strategy-ratings.ts
export interface StrategyRating {
  id: string;
  user_id: string;
  element: ElementType;
  strategy_id: string;
  strategy_name: string;
  rating: number; // 1-5
  note?: string;
  created_at: string;
}

export class StrategyRatingRepository extends BaseRepository<"strategy_ratings"> {
  async rateStrategy(
    userId: string,
    data: Omit<StrategyRating, "id" | "created_at">
  ): Promise<StrategyRating>;
  async getUserRatings(
    userId: string,
    element?: ElementType
  ): Promise<StrategyRating[]>;
  async getTopStrategies(
    userId: string,
    minRating?: number
  ): Promise<StrategyRating[]>;
}
```

#### ToolAnalyticsRepository

```typescript
// lib/db/tool-analytics.ts
export interface ToolInteraction {
  id: string;
  user_id: string;
  tool_name: string;
  action: "view" | "start" | "complete" | "interact";
  duration_seconds?: number;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export class ToolAnalyticsRepository extends BaseRepository<"tool_analytics"> {
  async logInteraction(
    data: Omit<ToolInteraction, "id" | "created_at">
  ): Promise<void>;
  async getToolStats(
    toolName: string,
    dateRange?: DateRange
  ): Promise<ToolStats>;
  async getActiveUsers(
    toolName: string,
    period: "day" | "week" | "month"
  ): Promise<number>;
  async getCompletionRate(toolName: string): Promise<number>;
}
```

### Shared Components

#### DashboardSidebar

```typescript
// components/dashboard/shared-sidebar.tsx
interface SidebarConfig {
  role: UserRole;
  items: NavItem[];
  showRoleSwitcher?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  roles: UserRole[];
}

export function SharedDashboardSidebar({ config }: { config: SidebarConfig });
```

#### BaseFileUpload

```typescript
// components/forms/base-file-upload.tsx
interface FileUploadConfig {
  type: "avatar" | "image" | "document";
  aspectRatio?: "1:1" | "16:9" | "4:3" | "free";
  maxSizeMB?: number;
  acceptedTypes?: string[];
  onUpload: (url: string) => void;
  onError: (error: string) => void;
}

export function BaseFileUpload({ config }: { config: FileUploadConfig });
```

#### ElementSelector

```typescript
// components/tools/element-selector.tsx
interface ElementSelectorProps {
  selectedElement: ElementType | null;
  onSelect: (element: ElementType) => void;
  userAssessment?: AssessmentResult;
  showBlend?: boolean;
}

export function ElementSelector({ ...props }: ElementSelectorProps);
```

### API Routes

#### Check-In API

```typescript
// app/api/tools/check-in/route.ts
POST /api/tools/check-in
  Body: { element, energy_level, state, reflection?, gratitude?, intention? }
  Response: { success: true, checkIn: CheckInLog, streak: number }

GET /api/tools/check-in
  Query: { limit?: number }
  Response: { checkIns: CheckInLog[], stats: CheckInStats }

GET /api/tools/check-in/today
  Response: { hasCheckedIn: boolean, checkIn?: CheckInLog }
```

#### Energy Budget API

```typescript
// app/api/tools/energy-budget/route.ts
GET /api/tools/energy-budget?date=YYYY-MM-DD
  Response: { budget: EnergyBudget | null }

POST /api/tools/energy-budget
  Body: { date, total_budget, activities }
  Response: { budget: EnergyBudget }

PATCH /api/tools/energy-budget/:id
  Body: { activities?, remaining_budget? }
  Response: { budget: EnergyBudget }
```

#### State Tracker API

```typescript
// app/api/tools/state/route.ts
POST /api/tools/state
  Body: { element, mode, guidance_viewed?: string[] }
  Response: { success: true, log: StateLog }

GET /api/tools/state
  Query: { limit?: number }
  Response: { logs: StateLog[], distribution: ModeDistribution }
```

## Data Models

### Database Schema Extensions

The database migrations will be applied using the **Supabase MCP** (Model Context Protocol) integration, which provides direct access to apply migrations, execute SQL, and manage the database schema.

#### Migration Strategy

1. **Use Supabase MCP `apply_migration`** for all DDL operations
2. **Use Supabase MCP `execute_sql`** for data queries and testing
3. **Use Supabase MCP `list_tables`** to verify schema changes
4. **Use Supabase MCP `generate_typescript_types`** to regenerate types after schema changes

#### Existing Tables (Already in Database)

The following tables already exist and can be leveraged:

- `logs` (101 rows) - For check-in data via LogsRepository
- `learning_streaks` - For streak tracking via LearningStreaksRepository
- `assessments` (3 rows) - For element profile
- `assessment_results` (1 row) - For element scores
- `achievements` (12 rows) - Achievement definitions
- `user_achievements` - For tracking earned achievements
- `user_preferences` - For reminder settings

#### Tables to Create

```sql
-- Migration: create_tools_tables
-- Applied via Supabase MCP apply_migration
-- NOTE: user_achievements already exists - DO NOT recreate

-- Energy Budgets
CREATE TABLE energy_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_budget INTEGER NOT NULL DEFAULT 100,
  activities JSONB NOT NULL DEFAULT '[]',
  remaining_budget INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Shadow Work Sessions
CREATE TABLE shadow_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  element TEXT NOT NULL,
  current_step INTEGER NOT NULL DEFAULT 1,
  reflections JSONB NOT NULL DEFAULT '{}',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'in_progress'
);

-- Strategy Ratings
CREATE TABLE strategy_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  element TEXT NOT NULL,
  strategy_id TEXT NOT NULL,
  strategy_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, strategy_id)
);

-- Tool Analytics
CREATE TABLE tool_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  action TEXT NOT NULL,
  duration_seconds INTEGER,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quick Quiz Results
CREATE TABLE quick_quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  scores JSONB NOT NULL, -- { electric: 0-100, fiery: 0-100, ... }
  primary_element TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_energy_budgets_user_date ON energy_budgets(user_id, date);
CREATE INDEX idx_shadow_sessions_user_status ON shadow_sessions(user_id, status);
CREATE INDEX idx_strategy_ratings_user_element ON strategy_ratings(user_id, element);
CREATE INDEX idx_tool_analytics_tool_created ON tool_analytics(tool_name, created_at);
CREATE INDEX idx_quick_quiz_user ON quick_quiz_results(user_id);
```

```sql
-- Migration: create_tools_rls_policies
-- Applied via Supabase MCP apply_migration
-- NOTE: user_achievements already has RLS enabled - DO NOT modify

-- RLS Policies for NEW tables only
ALTER TABLE energy_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE shadow_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategy_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_quiz_results ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage own energy_budgets" ON energy_budgets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own shadow_sessions" ON shadow_sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own strategy_ratings" ON strategy_ratings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tool_analytics" ON tool_analytics
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quick_quiz_results" ON quick_quiz_results
  FOR ALL USING (auth.uid() = user_id);

-- Admin policies for analytics
CREATE POLICY "Admins can view all tool_analytics" ON tool_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
```

#### Type Generation

After applying migrations, regenerate TypeScript types:

```bash
# Via Supabase MCP generate_typescript_types
# Output to lib/types/supabase.ts
```

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Check-In Data Persistence Round Trip

_For any_ valid check-in data (element, energy_level 1-5, state, optional reflections), saving via `logsRepository.saveCheckIn()` and then retrieving via `logsRepository.getUserCheckIns()` should return the same data with matching fields.
**Validates: Requirements 1.1, 1.2**

### Property 2: Streak Increment on Check-In

_For any_ user completing a check-in, if they had no check-in today, their streak count should increase by 1; if they already checked in today, streak should remain unchanged.
**Validates: Requirements 1.3**

### Property 3: Energy Trend Chart Visibility

_For any_ user with N check-ins where N >= 7, the energy trend chart should be visible; for N < 7, the chart should be hidden.
**Validates: Requirements 1.5**

### Property 4: Mode Distribution Calculation

_For any_ set of check-ins with operating modes, the distribution percentages should sum to 100% and each mode's percentage should equal (count of that mode / total check-ins) \* 100.
**Validates: Requirements 1.6**

### Property 5: Element Auto-Selection from Assessment

_For any_ user with a saved assessment, visiting a tool should pre-select the element with the highest score from their assessment results.
**Validates: Requirements 2.1**

### Property 6: Blend Type Detection

_For any_ assessment result where 2+ elements have scores within 10% of the maximum score, those elements should be identified as the blend type.
**Validates: Requirements 2.2**

### Property 7: Energy Budget Date-Based Retrieval

_For any_ user with energy budgets on multiple dates, requesting a specific date should return only the budget for that date, or null if none exists.
**Validates: Requirements 3.1, 3.2**

### Property 8: Strategy Rating Persistence

_For any_ strategy rating (1-5 stars), saving and retrieving should return the same rating value; updating a rating should replace the previous value.
**Validates: Requirements 4.1**

### Property 9: Top Strategies Filtering

_For any_ user with rated strategies, the "Top Strategies" list should contain only strategies with rating >= 4, sorted by rating descending.
**Validates: Requirements 4.2, 4.3**

### Property 10: Protection Mode Strategy Prioritization

_For any_ user whose most recent check-in has state "protection", emergency regeneration strategies should appear before daily and weekly strategies.
**Validates: Requirements 4.5, 5.4**

### Property 11: State Log Timeline Ordering

_For any_ set of state logs, the timeline should display logs in reverse chronological order (most recent first).
**Validates: Requirements 5.2**

### Property 12: Role-Based Navigation Items

_For any_ user role, the sidebar should display exactly the navigation items configured for that role in the centralized config, with no items from other roles.
**Validates: Requirements 6.2**

### Property 13: Sidebar Collapse State Persistence

_For any_ sidebar collapse action, the state should persist to localStorage and be restored on page reload.
**Validates: Requirements 6.4**

### Property 14: File Upload Size Validation

_For any_ file upload attempt, files exceeding the configured maxSizeMB should be rejected with an error before upload begins.
**Validates: Requirements 7.2, 7.3**

### Property 15: Tool Interaction Logging

_For any_ tool interaction (view, start, complete), a log entry should be created with the correct tool_name, action, and user_id.
**Validates: Requirements 8.1**

### Property 16: Analytics Aggregation Accuracy

_For any_ set of tool interactions, the aggregated statistics should accurately reflect total count, unique users, and average duration.
**Validates: Requirements 8.2, 8.3, 8.4**

### Property 17: Streak Display Threshold

_For any_ user with streak count N, the streak should be displayed prominently if N >= 3, otherwise shown subtly or hidden.
**Validates: Requirements 9.2**

### Property 18: Quick Quiz Comparison Calculation

_For any_ user with both Quick Quiz and full assessment results, the comparison should show the difference in element scores between the two.
**Validates: Requirements 10.2**

### Property 19: Shadow Session Resume Logic

_For any_ incomplete shadow session started less than 7 days ago, the user should be offered to resume; sessions older than 7 days should not trigger resume prompt.
**Validates: Requirements 11.3**

### Property 20: Shadow Session Completion Marking

_For any_ shadow session where current_step reaches 4 and all reflections are saved, the session status should be set to "completed" with completed_at timestamp.
**Validates: Requirements 11.4**

### Property 21: Reminder Skip Logic

_For any_ user with reminders enabled who has already completed today's check-in, no reminder should be sent for that day.
**Validates: Requirements 12.2**

### Property 22: Data Export Completeness

_For any_ data export request, the exported file should contain all check-ins, energy budgets, and tool data for that user with no missing records.
**Validates: Requirements 13.1, 13.2, 13.3**

### Property 23: Element-Based Tool Recommendations

_For any_ user with a primary element, the recommended tools should match the element's energy type (extroverted elements get State Tracker/Energy Budget, introverted get Shadow Work/Daily Check-In, ambiverted get Regeneration/Four States).
**Validates: Requirements 14.2, 14.3, 14.4**

### Property 24: Protection Mode Banner Visibility

_For any_ user whose most recent check-in has state "protection", the emergency banner should be visible on the tools page; for other states, it should be hidden.
**Validates: Requirements 15.1, 15.4**

### Property 25: Team Analytics Opt-In Filtering

_For any_ team analytics query, only data from users who have opted in to sharing should be included; opted-out users should be completely excluded.
**Validates: Requirements 16.5, 17.4**

### Property 26: Achievement Awarding Idempotence

_For any_ achievement trigger (e.g., first check-in, 7-day streak), the achievement should be awarded exactly once; subsequent triggers should not create duplicate achievements.
**Validates: Requirements 18.1, 18.2, 18.3, 18.4**

### Property 27: Streak Milestone Detection

_For any_ streak reaching a milestone (7, 14, 30, 100), the celebration should trigger exactly once when the milestone is first reached.
**Validates: Requirements 19.2**

## Error Handling

### API Error Responses

All API routes use the standardized error handling from `lib/api/error-handler.ts`:

```typescript
// Validation errors (422)
throw validationError("Invalid check-in data", {
  field: "energy_level",
  message: "Must be 1-5",
});

// Not found errors (404)
throw notFoundError("Energy budget");

// Authorization errors (403)
throw forbiddenError("Cannot access other user data");

// Rate limiting (429)
// Handled by proxy.ts at network boundary
```

### Client-Side Error Handling

```typescript
// Tool components should handle errors gracefully
try {
  const result = await saveCheckIn(data);
  toast.success("Check-in saved!");
} catch (error) {
  if (error.status === 422) {
    toast.error("Please fill in all required fields");
  } else if (error.status === 401) {
    // Redirect to login
    router.push("/auth/login?redirect=/tools/daily-checkin");
  } else {
    toast.error("Something went wrong. Please try again.");
    // Log to error tracking
    captureException(error);
  }
}
```

## Testing Strategy

### Dual Testing Approach

This implementation uses both unit tests and property-based tests for comprehensive coverage.

#### Unit Tests

- Verify specific examples and edge cases
- Test component rendering and user interactions
- Test API route responses for known inputs

#### Property-Based Tests

- Verify universal properties across all valid inputs
- Use `fast-check` library (already in devDependencies)
- Minimum 100 iterations per property test

### Property-Based Testing Framework

```typescript
// Example property test structure
import * as fc from "fast-check";
import { describe, it, expect } from "vitest";

describe("Check-In Persistence", () => {
  /**
   * Feature: tools-completion-and-platform-consolidation, Property 1: Check-In Data Persistence Round Trip
   * Validates: Requirements 1.1, 1.2
   */
  it("should persist and retrieve check-in data correctly", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          element: fc.constantFrom(
            "electric",
            "fiery",
            "aquatic",
            "earthly",
            "airy",
            "metallic"
          ),
          energy_level: fc.integer({ min: 1, max: 5 }),
          state: fc.constantFrom(
            "biological",
            "societal",
            "passion",
            "protection"
          ),
          reflection: fc.option(fc.string({ maxLength: 500 })),
        }),
        async (checkInData) => {
          const saved = await logsRepository.saveCheckIn(
            testUserId,
            checkInData
          );
          const retrieved = await logsRepository.getUserCheckIns(testUserId, 1);

          expect(retrieved[0].element).toBe(checkInData.element);
          expect(retrieved[0].energy_level).toBe(checkInData.energy_level);
          expect(retrieved[0].current_state).toBe(checkInData.state);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Test File Organization

```
__tests__/
├── lib/
│   └── db/
│       ├── energy-budgets.test.ts
│       ├── shadow-sessions.test.ts
│       ├── strategy-ratings.test.ts
│       └── tool-analytics.test.ts
├── api/
│   └── tools/
│       ├── check-in.test.ts
│       ├── energy-budget.test.ts
│       ├── state.test.ts
│       └── shadow.test.ts
├── components/
│   └── tools/
│       ├── element-selector.test.tsx
│       └── shared-sidebar.test.tsx
└── properties/
    ├── check-in.property.test.ts
    ├── energy-budget.property.test.ts
    ├── streak.property.test.ts
    └── analytics.property.test.ts
```
