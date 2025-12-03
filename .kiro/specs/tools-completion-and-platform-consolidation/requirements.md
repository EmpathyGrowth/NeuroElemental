# Requirements Document

## Introduction

This specification covers the completion of the NeuroElemental Tools feature set and platform consolidation. NeuroElemental is a comprehensive multi-tenant SaaS platform for neurodivergent education, featuring a unique personality framework based on six elemental energy types, four operating modes, and science-backed regeneration strategies.

### Platform Overview

**Business Model:**

- Freemium: Free assessment → Paid courses/certifications
- B2B licensing for organizations, schools, and businesses
- Revenue streams: Course sales, certifications, events, subscriptions, API credits

**User Types (6 levels):**

1. Public - Can take assessment, browse content
2. Registered (free) - Save results, access free resources
3. Student (paid) - Course access, certificates, events
4. Instructor (certified) - Teaching resources, directory listing
5. Business/School (enterprise) - Team management, diagnostics, analytics
6. Admin (staff) - Full CMS, user management

**The NeuroElemental Framework:**

- Six Elements: Electric ⚡, Fiery 🔥, Aquatic 🌊, Earthly 🌿, Airy 💨, Metallic 🪙
- Four Operating Modes: Biological (essence), Societal (learned), Passion (projects), Protection (survival)
- Energy Scale: Extroverted → Ambiverted → Introverted
- Regeneration Types: Active, Passive, Proactive
- Science-backed: Polyvagal theory, neurotransmitters, genetics, sensory processing

**Technology Stack:**

- Next.js 16 with App Router and proxy.ts (network boundary layer)
- Supabase for authentication and database with Row-Level Security
- Repository Pattern for all database operations (27+ repositories, 198+ methods)
- API Route Factory Pattern for all API endpoints (100% adoption)
- TypeScript strict mode with zero errors

**Current Tools (7 total):**

1. Daily Check-In - UI complete, needs backend integration
2. Energy Budget Calculator - UI complete, needs persistence
3. State Tracker - UI complete, needs session logging
4. Four Operating Modes - Educational content, complete
5. Regeneration Guide - UI complete, needs tracking
6. Shadow Work - UI complete, needs session persistence
7. Quick Quiz - UI complete, needs result persistence

**Existing Infrastructure:**

- `LogsRepository` with `saveCheckIn()` and `getUserCheckIns()` methods
- `LearningStreaksRepository` for tracking consecutive activity days
- `AssessmentRepository` for user assessment results with element scores
- `LessonBookmarksRepository` and `LessonNotesRepository` for course content

## Glossary

- **Element**: One of six personality types in the NeuroElemental framework (Electric, Fiery, Aquatic, Earthly, Airy, Metallic)
- **Operating Mode**: One of four states a user can be in (Biological, Passion, Societal, Protection)
- **Biological Mode**: The user's natural essence state requiring minimal energy
- **Protection Mode**: Crisis/survival state triggered by threat or depletion
- **Check-In**: A daily reflection practice to track energy and state
- **Regeneration Strategy**: Element-specific activities to restore energy (Active, Passive, Proactive)
- **Shadow Work**: Practices to integrate shadow aspects of one's element
- **Energy Budget**: Spoon Theory-based energy management system
- **Tool**: An interactive feature on the /tools page that helps users understand and manage their energy
- **Repository**: A class extending BaseRepository that provides type-safe database operations
- **Proxy**: Next.js 16 network boundary layer (formerly middleware) handling rate limiting and CSRF
- **Blend Type**: The combination of a user's top 2-3 dominant elements
- **Energy Style**: Classification of stimulation needs (high/moderate/low/variable)
- **Streak**: Consecutive days of completing a specific activity

## Requirements

---

### Part 1: Core Tool Backend Integration

---

### Requirement 1: Daily Check-In Backend Integration

**User Story:** As a user, I want my Daily Check-In data to be saved to my account, so that I can track my energy patterns over time and receive personalized insights.

#### Acceptance Criteria

1. WHEN a logged-in user completes a Daily Check-In THEN the System SHALL call the existing `logsRepository.saveCheckIn()` method to persist the element, energy level, state, reflection, gratitude, and intention fields
2. WHEN a user views the Daily Check-In tool THEN the System SHALL fetch their check-in history using `logsRepository.getUserCheckIns()` and display the past 30 days as a timeline
3. WHEN a user completes a check-in THEN the System SHALL call `learningStreaksRepository.recordActivity()` with activity type "daily_check_in" to update their streak
4. WHEN a guest user completes a check-in THEN the System SHALL display a modal prompting them to sign in to save their data with a preview of what they would see
5. WHEN a user has 7 or more check-ins THEN the System SHALL display an energy trend line chart showing energy level over time with element color coding
6. WHEN a user views their check-in history THEN the System SHALL display the distribution of operating modes as a pie chart

### Requirement 2: User Element Profile Auto-Selection

**User Story:** As a user who has taken the assessment, I want the tools to automatically use my element profile, so that I get personalized guidance without re-selecting my element each time.

#### Acceptance Criteria

1. WHEN a logged-in user with a saved assessment visits any tool THEN the System SHALL fetch their element scores from `assessmentRepository` and pre-select their primary element
2. WHEN a user has a blend type (2+ dominant elements) THEN the System SHALL display all dominant elements with the option to switch between them
3. WHEN a user without a saved assessment visits a tool THEN the System SHALL display the element selector with a badge stating "Take the assessment for personalized results"
4. WHEN a user's element is auto-selected THEN the System SHALL display a badge indicating "Based on your assessment" with the assessment date
5. WHEN a user wants to explore a different element THEN the System SHALL allow manual override via the element selector while preserving their saved profile

### Requirement 3: Energy Budget Persistence

**User Story:** As a user, I want my Energy Budget plans to be saved, so that I can review past plans and track my energy management over time.

#### Acceptance Criteria

1. WHEN a logged-in user creates an energy budget plan THEN the System SHALL save the plan with total budget, activities array, costs, and remaining budget to the database
2. WHEN a user views the Energy Budget tool THEN the System SHALL load their most recent plan if one exists for the current date
3. WHEN a user modifies their energy budget THEN the System SHALL auto-save changes after a 2-second debounce period with a visual save indicator
4. WHEN a user views their dashboard THEN the System SHALL display a compact "Today's Energy" widget showing current budget status and remaining energy
5. WHEN a user clicks the energy widget THEN the System SHALL navigate to the Energy Budget tool with today's plan loaded

### Requirement 4: Regeneration Strategy Tracking

**User Story:** As a user, I want to track which regeneration strategies work best for me, so that I can build a personalized toolkit of effective practices.

#### Acceptance Criteria

1. WHEN a user tries a regeneration strategy THEN the System SHALL allow them to rate its effectiveness from 1-5 stars with an optional note
2. WHEN a user views regeneration strategies THEN the System SHALL highlight strategies they have rated 4+ stars with a "Works for you" badge
3. WHEN a user has rated 3 or more strategies THEN the System SHALL display a "Your Top Strategies" section sorted by rating at the top of the list
4. WHEN a user views the Regeneration Guide THEN the System SHALL show their rating history for each strategy with timestamps
5. WHEN a user is in Protection Mode (based on recent check-in) THEN the System SHALL prioritize emergency regeneration strategies at the top of the guide

### Requirement 5: State Tracker Session Logging

**User Story:** As a user, I want my State Tracker sessions to be logged, so that I can see patterns in my operating modes over time.

#### Acceptance Criteria

1. WHEN a logged-in user identifies their current state THEN the System SHALL log the state with element, mode, timestamp, and any guidance viewed
2. WHEN a user views the State Tracker THEN the System SHALL display their recent state history as a vertical timeline with mode icons
3. WHEN a user has 5 or more state logs THEN the System SHALL display a distribution chart showing percentage of time spent in each mode
4. WHEN a user is in Protection Mode THEN the System SHALL display emergency regeneration strategies prominently with a "Get Help Now" section
5. WHEN a user transitions from Protection Mode to another mode THEN the System SHALL celebrate the transition with positive reinforcement

---

### Part 2: Platform Consolidation

---

### Requirement 6: Dashboard Sidebar Consolidation

**User Story:** As a developer, I want the dashboard sidebars to use a shared component, so that navigation is consistent and maintainable.

#### Acceptance Criteria

1. WHEN the System renders any dashboard sidebar THEN the System SHALL use a single shared DashboardSidebar component with role-based configuration
2. WHEN the DashboardSidebar receives a role prop THEN the System SHALL display navigation items from a centralized configuration object in `lib/constants/navigation.ts`
3. WHEN the sidebar is rendered on mobile (viewport width less than 768px) THEN the System SHALL display a responsive Sheet-based navigation using the existing Radix UI pattern
4. WHEN the sidebar collapsed state changes THEN the System SHALL persist the state to localStorage using key "dashboard-sidebar-collapsed"
5. WHEN a user has multiple roles THEN the System SHALL display a role switcher at the top of the sidebar

### Requirement 7: File Upload Component Consolidation

**User Story:** As a developer, I want file upload functionality to use a single shared component, so that upload behavior is consistent across the platform.

#### Acceptance Criteria

1. WHEN the System requires image upload functionality THEN the System SHALL use a single BaseFileUpload component from `components/forms/base-file-upload.tsx`
2. WHEN the BaseFileUpload is configured for avatars THEN the System SHALL enforce circular cropping with 1:1 aspect ratio and maximum 2MB file size
3. WHEN the BaseFileUpload is configured for general images THEN the System SHALL allow configurable aspect ratios (16:9, 4:3, 1:1, free) and maximum 10MB file size
4. WHEN a file upload fails THEN the System SHALL display a toast notification with error details and a retry button
5. WHEN a file upload succeeds THEN the System SHALL return the uploaded file URL and display a success toast

---

### Part 3: Analytics & Admin

---

### Requirement 8: Tool Analytics API

**User Story:** As an administrator, I want to view tool usage analytics, so that I can understand which tools are most valuable to users.

#### Acceptance Criteria

1. WHEN a user interacts with any tool THEN the System SHALL log the interaction using `logsRepository.createLog()` with tool name, action type, and duration
2. WHEN an admin requests tool analytics via GET /api/admin/analytics/tools THEN the System SHALL return aggregated statistics including total uses, unique users, and average session duration per tool
3. WHEN an admin views tool analytics THEN the System SHALL display completion rates for multi-step tools (Daily Check-In, Shadow Work)
4. WHEN an admin views tool analytics THEN the System SHALL display daily, weekly, and monthly active users per tool with trend indicators
5. WHEN an admin filters analytics by date range THEN the System SHALL return data for the specified period with comparison to previous period

### Requirement 9: Student Dashboard Tool Integration

**User Story:** As a student, I want to see my tool activity on my dashboard, so that I can track my energy management alongside my learning progress.

#### Acceptance Criteria

1. WHEN a student views their dashboard THEN the System SHALL display a "Your Energy" widget showing their most recent check-in data with energy level and mode
2. WHEN a student has an active streak of 3 or more days THEN the System SHALL display the streak count prominently with a flame icon and celebration animation
3. WHEN a student clicks on the energy widget THEN the System SHALL navigate to the Daily Check-In tool
4. WHEN a student has not done a check-in today THEN the System SHALL display a gentle prompt "How's your energy today?" with a quick-start button
5. WHEN a student has completed the assessment THEN the System SHALL display their primary element icon on the dashboard header

---

### Part 4: Additional Tool Persistence

---

### Requirement 10: Quick Quiz Result Persistence

**User Story:** As a user, I want my Quick Quiz results to be saved, so that I can compare them to my full assessment and track changes over time.

#### Acceptance Criteria

1. WHEN a logged-in user completes the Quick Quiz THEN the System SHALL save the element scores, timestamp, and calculated primary element to the database
2. WHEN a user views their Quick Quiz results THEN the System SHALL display how the results compare to their full assessment if available with a visual diff
3. WHEN a user has 2 or more Quick Quiz results THEN the System SHALL display a history chart showing element score trends over time
4. WHEN a guest completes the Quick Quiz THEN the System SHALL prompt them to sign in to save results with a preview of the comparison feature

### Requirement 11: Shadow Work Session Persistence

**User Story:** As a user, I want my Shadow Work sessions to be saved, so that I can continue where I left off and track my integration progress.

#### Acceptance Criteria

1. WHEN a logged-in user starts a Shadow Work session THEN the System SHALL create a session record with element, start timestamp, and session ID
2. WHEN a user progresses through Shadow Work steps THEN the System SHALL save the current step number and any reflections entered after each step
3. WHEN a user returns to Shadow Work with an incomplete session less than 7 days old THEN the System SHALL offer to resume their last session with a modal
4. WHEN a user completes all four Shadow Work steps THEN the System SHALL mark the session as complete, record completion timestamp, and display a completion celebration
5. WHEN a user has completed 3 or more Shadow Work sessions THEN the System SHALL display a "Shadow Integration Progress" badge on their profile

### Requirement 12: Daily Check-In Reminders

**User Story:** As a user, I want to receive optional reminders to do my daily check-in, so that I can build a consistent self-reflection habit.

#### Acceptance Criteria

1. WHEN a user enables check-in reminders in settings THEN the System SHALL send a push notification or email at their preferred time
2. WHEN a user has already completed today's check-in THEN the System SHALL skip the reminder for that day
3. WHEN a user configures reminder settings THEN the System SHALL allow them to choose time (hour), notification method (push, email, both), and days of week
4. WHEN a user disables reminders THEN the System SHALL stop all check-in notifications immediately and confirm with a toast

---

### Part 5: Data Export

---

### Requirement 13: Tool Data Export

**User Story:** As a user, I want to export my tool data, so that I can keep personal records or share with my therapist/coach.

#### Acceptance Criteria

1. WHEN a user requests a data export from settings THEN the System SHALL generate a downloadable file containing their complete tool history
2. WHEN exporting check-in data THEN the System SHALL include date, element, energy level (1-5), operating mode, reflection text, gratitude text, and intention text
3. WHEN exporting energy budget data THEN the System SHALL include date, total budget, activities with costs, and remaining budget
4. WHEN a user exports data THEN the System SHALL offer CSV format for spreadsheet import and PDF format for human reading
5. WHEN generating PDF export THEN the System SHALL include visualizations of energy trends and mode distribution

---

### Part 6: Advanced Personalization

---

### Requirement 14: Element-Aware Tool Recommendations

**User Story:** As a user, I want tool recommendations based on my element profile, so that I can focus on the most relevant practices for my energy type.

#### Acceptance Criteria

1. WHEN a user with a saved assessment views the tools page THEN the System SHALL display a "Recommended for You" section with tools prioritized by element relevance
2. WHEN a user's primary element is Electric or Fiery (extroverted) THEN the System SHALL recommend State Tracker and Energy Budget as top tools
3. WHEN a user's primary element is Airy or Metallic (introverted) THEN the System SHALL recommend Shadow Work and Daily Check-In as top tools
4. WHEN a user's primary element is Aquatic or Earthly (ambiverted) THEN the System SHALL recommend Regeneration Guide and Four States as top tools
5. WHEN a user has not taken the assessment THEN the System SHALL display a prompt to take the assessment for personalized recommendations

### Requirement 15: Mode-Based Emergency Guidance

**User Story:** As a user in Protection Mode, I want immediate access to emergency regeneration strategies, so that I can quickly return to a healthier state.

#### Acceptance Criteria

1. WHEN a user's most recent check-in indicates Protection Mode THEN the System SHALL display a persistent banner on the tools page with emergency resources
2. WHEN a user clicks the emergency banner THEN the System SHALL navigate directly to their element's emergency regeneration strategies
3. WHEN a user in Protection Mode views any tool THEN the System SHALL display a "Need immediate help?" floating action button
4. WHEN a user transitions out of Protection Mode THEN the System SHALL dismiss the emergency banner and display a congratulatory message

---

### Part 7: B2B Tool Features

---

### Requirement 16: Team Energy Dashboard

**User Story:** As a business or school administrator, I want to view aggregate tool usage for my team, so that I can understand team energy patterns and provide support.

#### Acceptance Criteria

1. WHEN a business admin views their organization dashboard THEN the System SHALL display a "Team Energy Overview" widget with aggregate check-in data
2. WHEN viewing team energy THEN the System SHALL display the distribution of operating modes across team members as a stacked bar chart
3. WHEN a team member is in Protection Mode for 3+ consecutive days THEN the System SHALL flag this to the admin with privacy-respecting aggregate data only
4. WHEN an admin exports team analytics THEN the System SHALL generate anonymized aggregate reports without individual identifying data
5. WHEN team members have not opted in to sharing THEN the System SHALL exclude their data from team analytics

### Requirement 17: Instructor Student Insights

**User Story:** As an instructor, I want to see aggregate energy patterns of my students, so that I can adjust my teaching approach and provide better support.

#### Acceptance Criteria

1. WHEN an instructor views their dashboard THEN the System SHALL display a "Student Energy Insights" widget for enrolled students who have opted in
2. WHEN viewing student insights THEN the System SHALL display the percentage of students who completed check-ins this week
3. WHEN an instructor views a course THEN the System SHALL display aggregate energy levels of enrolled students without individual identification
4. WHEN a student opts out of sharing THEN the System SHALL exclude their data from instructor insights immediately

---

### Part 8: Gamification

---

### Requirement 18: Tool Usage Achievements

**User Story:** As a user, I want to earn achievements for using tools consistently, so that I feel motivated to maintain healthy energy practices.

#### Acceptance Criteria

1. WHEN a user completes their first check-in THEN the System SHALL award the "First Reflection" achievement with a celebration animation
2. WHEN a user maintains a 7-day check-in streak THEN the System SHALL award the "Week of Awareness" achievement
3. WHEN a user maintains a 30-day check-in streak THEN the System SHALL award the "Month of Mindfulness" achievement with a special badge
4. WHEN a user completes Shadow Work for all 6 elements THEN the System SHALL award the "Shadow Master" achievement
5. WHEN a user earns an achievement THEN the System SHALL display a toast notification and add the achievement to their profile

### Requirement 19: Streak Bonuses

**User Story:** As a user, I want visual feedback on my streaks, so that I feel encouraged to maintain consistent practices.

#### Acceptance Criteria

1. WHEN a user has an active streak THEN the System SHALL display a flame icon with the streak count on the dashboard
2. WHEN a user's streak reaches 7, 14, 30, or 100 days THEN the System SHALL display a milestone celebration with confetti animation
3. WHEN a user is about to lose their streak (no check-in by 9 PM local time) THEN the System SHALL send a gentle reminder if notifications are enabled
4. WHEN a user loses their streak THEN the System SHALL display an encouraging message and their longest streak record

---

### Part 9: Accessibility

---

### Requirement 20: Keyboard Navigation

**User Story:** As a user who relies on keyboard navigation, I want all tools to be fully accessible via keyboard, so that I can use them without a mouse.

#### Acceptance Criteria

1. WHEN a user navigates tools with Tab key THEN the System SHALL move focus through all interactive elements in logical order
2. WHEN a user presses Enter or Space on a selectable element THEN the System SHALL activate that element
3. WHEN a user presses Escape in a modal or dropdown THEN the System SHALL close the modal and return focus to the trigger element
4. WHEN focus moves to an element THEN the System SHALL display a visible focus indicator meeting WCAG 2.1 AA contrast requirements

### Requirement 21: Screen Reader Support

**User Story:** As a user who uses a screen reader, I want all tool content to be properly announced, so that I can understand and interact with the tools.

#### Acceptance Criteria

1. WHEN a screen reader encounters an element icon THEN the System SHALL announce the element name (e.g., "Electric element")
2. WHEN a screen reader encounters an energy level THEN the System SHALL announce the level and label (e.g., "Energy level 3 of 5, Moderate")
3. WHEN a screen reader encounters a chart THEN the System SHALL provide a text summary of the data
4. WHEN a user completes an action THEN the System SHALL announce the result via ARIA live region
