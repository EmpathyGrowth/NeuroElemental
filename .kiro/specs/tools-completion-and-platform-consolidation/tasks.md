# Implementation Plan

## Database Status (as of 2025-12-03)

**Project:** neuroelemental (ieqvhgqubvfruqfjggqf) - ACTIVE_HEALTHY
**Database:** PostgreSQL 17.6.1 | 97 migrations applied | RLS enabled on all tables

### Existing Tables (can be leveraged):

- ✅ `logs` (101 rows) - Use for check-in data via existing LogsRepository
- ✅ `learning_streaks` - Use for streak tracking via existing LearningStreaksRepository
- ✅ `assessments` (3 rows) - Use for element profile
- ✅ `assessment_results` (1 row) - Use for element scores
- ✅ `achievements` (12 rows) - Achievement definitions exist
- ✅ `user_achievements` - For tracking earned achievements
- ✅ `user_preferences` - For reminder settings

### Tables to Create:

- ❌ `energy_budgets` - NOT EXISTS
- ❌ `shadow_sessions` - NOT EXISTS
- ❌ `strategy_ratings` - NOT EXISTS
- ❌ `tool_analytics` - NOT EXISTS
- ❌ `quick_quiz_results` - NOT EXISTS

---

- [x] 1. Database Schema Setup
  - [x] 1.1 Apply tools tables migration via Supabase MCP
    - Use `apply_migration` to create ONLY the missing tables: energy_budgets, shadow_sessions, strategy_ratings, tool_analytics, quick_quiz_results
    - NOTE: user_achievements already exists - skip creation
    - Include indexes for performance
    - _Requirements: 3.1, 5.1, 4.1, 8.1, 10.1_

  - [x] 1.2 Apply RLS policies migration via Supabase MCP
    - Use `apply_migration` to enable RLS on new tables and create user/admin policies
    - NOTE: Existing tables already have RLS enabled
    - _Requirements: 16.5, 17.4_

  - [x] 1.3 Regenerate TypeScript types
    - Use `generate_typescript_types` to update lib/types/supabase.ts
    - _Requirements: All_

- [x] 2. Core Repositories
  - NOTE: LogsRepository and LearningStreaksRepository already exist with saveCheckIn(), getUserCheckIns(), recordActivity() methods
  - [x] 2.1 Create EnergyBudgetRepository
    - Extend BaseRepository with getByUserAndDate, upsert, getHistory methods
    - _Requirements: 3.1, 3.2_

  - [x] 2.2 Write property test for energy budget round trip
    - **Property 7: Energy Budget Date-Based Retrieval**
    - **Validates: Requirements 3.1, 3.2**

  - [x] 2.3 Create ShadowSessionRepository
    - Extend BaseRepository with getActiveSession, createSession, updateProgress, completeSession methods
    - _Requirements: 11.1, 11.2, 11.3, 11.4_

  - [x] 2.4 Write property test for shadow session completion
    - **Property 20: Shadow Session Completion Marking**
    - **Validates: Requirements 11.4**

  - [x] 2.5 Create StrategyRatingRepository
    - Extend BaseRepository with rateStrategy, getUserRatings, getTopStrategies methods
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 2.6 Write property test for strategy rating persistence
    - **Property 8: Strategy Rating Persistence**
    - **Validates: Requirements 4.1**

  - [x] 2.7 Create ToolAnalyticsRepository
    - Extend BaseRepository with logInteraction, getToolStats, getActiveUsers, getCompletionRate methods
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x]\* 2.8 Write property test for analytics aggregation
    - **Property 16: Analytics Aggregation Accuracy**
    - **Validates: Requirements 8.2, 8.3, 8.4**

  - [x] 2.9 Create QuickQuizRepository
    - Extend BaseRepository with saveResult, getHistory, compareWithAssessment methods
    - _Requirements: 10.1, 10.2, 10.3_

  - [x] 2.10 Extend existing AchievementsRepository (user_achievements table exists)
    - Add awardAchievement, getUserAchievements, hasAchievement methods if not present
    - NOTE: achievements and user_achievements tables already exist with 12 achievement definitions
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [x] 2.11 Write property test for achievement idempotence
    - **Property 26: Achievement Awarding Idempotence**
    - **Validates: Requirements 18.1, 18.2, 18.3, 18.4**

- [x] 3. Checkpoint - Verify repositories
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. API Routes - Check-In
  - [x] 4.1 Create POST /api/tools/check-in route
    - Use createAuthenticatedRoute factory, call logsRepository.saveCheckIn and learningStreaksRepository.recordActivity
    - _Requirements: 1.1, 1.3_

  - [x] 4.2 Write property test for check-in persistence
    - **Property 1: Check-In Data Persistence Round Trip**
    - **Validates: Requirements 1.1, 1.2**

  - [x] 4.3 Create GET /api/tools/check-in route
    - Return check-in history with stats using logsRepository.getUserCheckIns
    - _Requirements: 1.2_

  - [x] 4.4 Create GET /api/tools/check-in/today route
    - Return whether user has checked in today
    - _Requirements: 9.4, 12.2_
  - [x] 4.5 Write property test for streak increment
    - **Property 2: Streak Increment on Check-In**
    - **Validates: Requirements 1.3**

- [x] 5. API Routes - Energy Budget
  - [x] 5.1 Create GET /api/tools/energy-budget route
    - Return budget for specified date using energyBudgetRepository.getByUserAndDate
    - _Requirements: 3.2_

  - [x] 5.2 Create POST /api/tools/energy-budget route
    - Create or update budget using energyBudgetRepository.upsert
    - _Requirements: 3.1_

  - [x] 5.3 Create PATCH /api/tools/energy-budget/[id] route
    - Update activities and remaining budget
    - _Requirements: 3.3_

- [x] 6. API Routes - State Tracker
  - [x] 6.1 Create POST /api/tools/state route
    - Log state using logsRepository.createLog with state data
    - _Requirements: 5.1_

  - [x] 6.2 Create GET /api/tools/state route
    - Return state history and mode distribution
    - _Requirements: 5.2, 5.3_

  - [x] 6.3 Write property test for mode distribution
    - **Property 4: Mode Distribution Calculation**
    - **Validates: Requirements 1.6, 5.3**

- [x] 7. API Routes - Shadow Work
  - [x] 7.1 Create POST /api/tools/shadow/start route
    - Create new session using shadowSessionRepository.createSession
    - _Requirements: 11.1_

  - [x] 7.2 Create PATCH /api/tools/shadow/[id]/progress route
    - Update step and reflection using shadowSessionRepository.updateProgress
    - _Requirements: 11.2_

  - [x] 7.3 Create POST /api/tools/shadow/[id]/complete route
    - Mark session complete using shadowSessionRepository.completeSession
    - _Requirements: 11.4_

  - [x] 7.4 Create GET /api/tools/shadow/active route
    - Return active session for resume prompt
    - _Requirements: 11.3_

  - [x] 7.5 Write property test for session resume logic
    - **Property 19: Shadow Session Resume Logic**
    - **Validates: Requirements 11.3**

-

- [x] 8. API Routes - Regeneration & Quiz
  - [x] 8.1 Create POST /api/tools/regeneration/rate route
    - Save rating using strategyRatingRepository.rateStrategy
    - _Requirements: 4.1_

  - [x] 8.2 Create GET /api/tools/regeneration/ratings route
    - Return user ratings and top strategies
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 8.3 Write property test for top strategies filtering
    - **Property 9: Top Strategies Filtering**
    - **Validates: Requirements 4.2, 4.3**

  - [x] 8.4 Create POST /api/tools/quiz route
    - Save quiz result using quickQuizRepository.saveResult
    - _Requirements: 10.1_

  - [x] 8.5 Create GET /api/tools/quiz/history route
    - Return quiz history with assessment comparison
    - _Requirements: 10.2, 10.3_

  - [x] 8.6 Write property test for quiz comparison
    - **Property 18: Quick Quiz Comparison Calculation**
    - **Validates: Requirements 10.2**

-

- [x] 9. Checkpoint - Verify API routes
  - Ensure all tests pass, ask the user if questions arise.

-

- [x] 10. Tool Analytics API
  - [x] 10.1 Create POST /api/tools/analytics/log route
    - Log tool interaction using toolAnalyticsRepository.logInteraction
    - _Requirements: 8.1_

  - [x] 10.2 Create GET /api/admin/analytics/tools route (admin only)
    - Return aggregated tool statistics
    - _Requirements: 8.2, 8.3, 8.4, 8.5_

  - [x] 10.3 Write property test for interaction logging
    - **Property 15: Tool Interaction Logging**
    - **Validates: Requirements 8.1**

-

- [x] 11. Shared Components
  - [x] 11.1 Create ElementSelector component
    - Reusable element picker with assessment integration and blend support
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 11.2 Write property test for element auto-selection
    - **Property 5: Element Auto-Selection from Assessment**
    - **Validates: Requirements 2.1**

  - [ ]\* 11.3 Write property test for blend detection
    - **Property 6: Blend Type Detection**
    - **Validates: Requirements 2.2**
  - [x] 11.4 Create SharedDashboardSidebar component
    - Role-based navigation with centralized config
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 11.5 Write property test for role-based navigation
    - **Property 12: Role-Based Navigation Items**
    - **Validates: Requirements 6.2**

  - [x] 11.6 Create BaseFileUpload component
    - Unified upload with avatar/image modes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 11.7 Write property test for file size validation
    - **Property 14: File Upload Size Validation**
    - **Validates: Requirements 7.2, 7.3**

- [x] 12. Daily Check-In Tool Integration
  - [x] 12.1 Connect Daily Check-In to backend
    - Call POST /api/tools/check-in on completion, fetch history on load
    - _Requirements: 1.1, 1.2_

  - [x] 12.2 Add energy trend chart
    - Display line chart when 7+ check-ins exist
    - _Requirements: 1.5_

  - [ ] 12.3 Write property test for chart visibility
    - **Property 3: Energy Trend Chart Visibility**
    - **Validates: Requirements 1.5**

  - [x] 12.4 Add mode distribution pie chart
    - Calculate and display mode percentages
    - _Requirements: 1.6_

  - [x] 12.5 Add guest user prompt
    - Show sign-in modal for unauthenticated users
    - _Requirements: 1.4_

  - [x] 12.6 Integrate ElementSelector component
    - Replace inline element selection with shared component
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

-

- [x] 13. Energy Budget Tool Integration
  - [x] 13.1 Connect Energy Budget to backend
    - Load today's budget on mount, save on changes with debounce
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 13.2 Add auto-save indicator
    - Show saving/saved status with debounced updates
    - _Requirements: 3.3_

  - [x] 13.3 Add dashboard widget
    - Create compact "Today's Energy" widget for student dashboard
    - _Requirements: 3.4, 3.5_

-

- [x] 14. State Tracker Tool Integration
  - [x] 14.1 Connect State Tracker to backend
    - Log state on identification, fetch history on load
    - _Requirements: 5.1, 5.2_

  - [x] 14.2 Add state timeline
    - Display recent states as vertical timeline
    - _Requirements: 5.2_

  - [x] 14.3 Add mode distribution chart
    - Show percentage time in each mode when 5+ logs
    - _Requirements: 5.3_

  - [x] 14.4 Add Protection Mode emergency section
    - Prioritize emergency strategies when in Protection Mode
    - _Requirements: 5.4_

  - [x] 14.5 Write property test for protection mode prioritization
    - **Property 10: Protection Mode Strategy Prioritization**
    - **Validates: Requirements 4.5, 5.4**

  - [x] 14.6 Add transition celebration
    - Celebrate when user exits Protection Mode
    - _Requirements: 5.5_

  - [x] 14.7 Integrate ElementSelector component
    - Replace inline element selection with shared component
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 15. Checkpoint - Verify tool integrations
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Regeneration Guide Integration
  - [x] 16.1 Connect Regeneration Guide to backend
    - Fetch user ratings on load, save ratings on interaction
    - _Requirements: 4.1, 4.4_

  - [x] 16.2 Add strategy rating UI
    - 1-5 star rating with optional note
    - _Requirements: 4.1_

  - [x] 16.3 Add "Your Top Strategies" section
    - Display 4+ star strategies at top when 3+ rated
    - _Requirements: 4.2, 4.3_

  - [x] 16.4 Add "Works for you" badges
    - Highlight highly-rated strategies
    - _Requirements: 4.2_
  - [x] 16.5 Integrate ElementSelector component
    - Replace inline element selection with shared component
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 17. Shadow Work Tool Integration
  - [x] 17.1 Connect Shadow Work to backend
    - Create session on start, save progress on each step
    - _Requirements: 11.1, 11.2_

  - [x] 17.2 Add session resume prompt
    - Check for active session on load, offer to resume
    - _Requirements: 11.3_

  - [x] 17.3 Add completion celebration
    - Mark complete and celebrate when all steps done
    - _Requirements: 11.4_

  - [x] 17.4 Add progress badge
    - Display badge when 3+ sessions completed
    - _Requirements: 11.5_

  - [x] 17.5 Integrate ElementSelector component
    - Replace inline element selection with shared component
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 18. Quick Quiz Tool Integration
  - [x] 18.1 Connect Quick Quiz to backend
    - Save results on completion, fetch history on load
    - _Requirements: 10.1_

  - [x] 18.2 Add assessment comparison
    - Show diff between quiz and full assessment results
    - _Requirements: 10.2_

  - [x] 18.3 Add history chart
    - Display element score trends when 2+ results
    - _Requirements: 10.3_

  - [x] 18.4 Add guest user prompt
    - Show sign-in modal for unauthenticated users
    - _Requirements: 10.4_

- [x] 19. Dashboard Consolidation
  - [x] 19.1 Create navigation config
    - Centralize nav items in lib/constants/navigation.ts
    - _Requirements: 6.2_

  - [x] 19.2 Migrate student-sidebar to SharedDashboardSidebar
    - Replace with shared component using role config
    - _Requirements: 6.1_

  - [x] 19.3 Migrate instructor-sidebar to SharedDashboardSidebar
    - Replace with shared component using role config
    - _Requirements: 6.1_

  - [x] 19.4 Migrate admin-sidebar to SharedDashboardSidebar
    - Replace with shared component using role config
    - _Requirements: 6.1_

  - [x] 19.5 Migrate business-sidebar to SharedDashboardSidebar
    - Replace with shared component using role config
    - _Requirements: 6.1_

  - [x] 19.6 Add collapse state persistence
    - Save to localStorage, restore on load
    - _Requirements: 6.4_

  - [x] 19.7 Write property test for collapse persistence
    - **Property 13: Sidebar Collapse State Persistence**
    - **Validates: Requirements 6.4**

  - [x] 19.8 Add role switcher
    - Display when user has multiple roles
    - _Requirements: 6.5_

-

- [x] 20. File Upload Consolidation
  - [x] 20.1 Create BaseFileUpload component
    - Support avatar and general image modes
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 20.2 Migrate avatar-upload to BaseFileUpload
    - Replace with shared component in avatar mode
    - _Requirements: 7.2_

  - [x] 20.3 Migrate image-upload to BaseFileUpload
    - Replace with shared component in image mode
    - _Requirements: 7.3_

  - [x] 20.4 Add error handling with toast
    - Display error details and retry option
    - _Requirements: 7.4_

  - [x] 20.5 Add success handling
    - Return URL and display success toast
    - _Requirements: 7.5_

-

- [x] 21. Checkpoint - Verify consolidation
  - Ensure all tests pass, ask the user if questions arise.

-

- [x] 22. Student Dashboard Integration
  - [x] 22.1 Add "Your Energy" widget
    - Display recent check-in data with energy level and mode
    - _Requirements: 9.1_

  - [x] 22.2 Add streak display
    - Show flame icon with count when streak >= 3
    - _Requirements: 9.2_

  - [x] 22.3 Write property test for streak display threshold
    - **Property 17: Streak Display Threshold**
    - **Validates: Requirements 9.2**

  - [x] 22.4 Add check-in prompt
    - Show gentle prompt when no check-in today
    - _Requirements: 9.4_

  - [x] 22.5 Add element icon display
    - Show primary element icon when assessment completed
    - _Requirements: 9.5_

-

- [x] 23. Advanced Personalization
  - [x] 23.1 Add tool recommendations section
    - Display "Recommended for You" based on element
    - _Requirements: 14.1_

  - [x] 23.2 Implement element-based recommendations
    - Map element energy types to recommended tools
    - _Requirements: 14.2, 14.3, 14.4_

  - [x] 23.3 Write property test for element-based recommendations
    - **Property 23: Element-Based Tool Recommendations**
    - **Validates: Requirements 14.2, 14.3, 14.4**

  - [x] 23.4 Add assessment prompt for non-assessed users
    - Show prompt to take assessment
    - _Requirements: 14.5_

  - [x] 23.5 Add Protection Mode emergency banner
    - Display persistent banner when in Protection Mode
    - _Requirements: 15.1_

  - [ ]\* 23.6 Write property test for protection mode banner
    - **Property 24: Protection Mode Banner Visibility**
    - **Validates: Requirements 15.1, 15.4**
  - [x] 23.7 Add emergency floating action button
    - Show FAB on all tools when in Protection Mode
    - _Requirements: 15.3_

  - [x] 23.8 Add transition dismissal
    - Dismiss banner and show message when exiting Protection Mode
    - _Requirements: 15.4_

- [x] 24. Gamification - Achievements
  - [x] 24.1 Create achievement definitions
    - Define all achievements with triggers and badges
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [x] 24.2 Implement achievement service
    - Check and award achievements on relevant actions
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  - [x] 24.3 Add achievement toast notifications
    - Display celebration when achievement earned
    - _Requirements: 18.5_
  - [x] 24.4 Add achievements to profile
    - Display earned achievements on user profile
    - _Requirements: 18.5_

- [x] 25. Gamification - Streaks
  - [x] 25.1 Add streak display component
    - Flame icon with count on dashboard
    - _Requirements: 19.1_
  - [x] 25.2 Add milestone celebrations
    - Confetti animation at 7, 14, 30, 100 days
    - _Requirements: 19.2_
  - [x] 25.3 Write property test for milestone detection
    - **Property 27: Streak Milestone Detection**
    - **Validates: Requirements 19.2**

  - [x] 25.4 Add streak loss handling
    - Display encouraging message and longest streak record
    - _Requirements: 19.4_

- [x] 26. Checkpoint - Verify gamification
  - Ensure all tests pass, ask the user if questions arise.

- [x] 27. Data Export
  - [x] 27.1 Create export API route
    - Generate downloadable file with all tool data
    - _Requirements: 13.1_
  - [x] 27.2 Implement CSV export
    - Format check-ins, budgets, and tool data as CSV
    - _Requirements: 13.2, 13.3, 13.4_
  - [x] 27.3 Write property test for export completeness
    - **Property 22: Data Export Completeness**
    - **Validates: Requirements 13.1, 13.2, 13.3**

  - [x] 27.4 Implement PDF export
    - Generate PDF with visualizations
    - _Requirements: 13.4, 13.5_
  - [x] 27.5 Add export UI in settings
    - Format selection and download button
    - _Requirements: 13.4_

- [x] 28. Reminders
  - [x] 28.1 Create reminder settings API
    - Save time, method, and days preferences
    - _Requirements: 12.3_
  - [x] 28.2 Implement reminder skip logic
    - Check if already checked in before sending
    - _Requirements: 12.2_
  - [x] 28.3 Write property test for reminder skip
    - **Property 21: Reminder Skip Logic**
    - **Validates: Requirements 12.2**

  - [x] 28.4 Add reminder settings UI
    - Time picker, method selection, day toggles
    - _Requirements: 12.3_
  - [x] 28.5 Implement reminder disable
    - Stop all notifications immediately
    - _Requirements: 12.4_

- [x] 29. B2B Features
  - [x] 29.1 Create team energy dashboard widget
    - Aggregate check-in data for organization
    - _Requirements: 16.1, 16.2_
  - [x] 29.2 Implement opt-in filtering
    - Exclude non-opted-in users from analytics
    - _Requirements: 16.5_

  - [ ]\* 29.3 Write property test for opt-in filtering
    - **Property 25: Team Analytics Opt-In Filtering**
    - **Validates: Requirements 16.5, 17.4**
  - [x] 29.4 Add Protection Mode alerts
    - Flag team members in Protection Mode 3+ days
    - _Requirements: 16.3_
  - [x] 29.5 Create instructor insights widget
    - Student energy insights for enrolled students
    - _Requirements: 17.1, 17.2, 17.3_
  - [x] 29.6 Implement anonymized export
    - Generate reports without individual identification
    - _Requirements: 16.4_

- [x] 30. Accessibility
  - [x] 30.1 Add keyboard navigation to tools
    - Tab order, Enter/Space activation, Escape handling
    - _Requirements: 20.1, 20.2, 20.3_
  - [x] 30.2 Add focus indicators
    - Visible focus rings meeting WCAG 2.1 AA
    - _Requirements: 20.4_
  - [x] 30.3 Add ARIA labels for elements
    - Announce element names and energy levels
    - _Requirements: 21.1, 21.2_
  - [x] 30.4 Add chart accessibility
    - Text summaries for screen readers
    - _Requirements: 21.3_
  - [x] 30.5 Add ARIA live regions
    - Announce action results
    - _Requirements: 21.4_

- [x] 31. Final Checkpoint - Complete verification
  - Ensure all tests pass, ask the user if questions arise.
