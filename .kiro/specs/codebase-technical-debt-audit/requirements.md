# Requirements Document

## Introduction

This specification addresses technical debt identified in the NeuroElemental codebase through a comprehensive audit. The audit revealed circular dependencies, excessive use of `any` types, unused imports/variables, and potential database type misalignments. This document outlines requirements for systematically resolving these issues to improve code quality, maintainability, and type safety.

## Glossary

- **Circular Dependency**: A situation where two or more modules depend on each other, creating a cycle that can cause runtime issues and makes code harder to maintain
- **Type Safety**: The degree to which a programming language prevents type errors at compile time
- **ESLint**: A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code
- **Technical Debt**: The implied cost of additional rework caused by choosing an easy solution now instead of a better approach
- **Supabase Types**: Auto-generated TypeScript types that match the database schema

## Requirements

### Requirement 1

**User Story:** As a developer, I want circular dependencies eliminated from the codebase, so that the application has predictable module loading and is easier to maintain.

#### Acceptance Criteria

1. WHEN the codebase is analyzed with madge THEN the system SHALL report zero circular dependencies
2. WHEN `lib/db/assessments.ts` imports from `lib/db/index.ts` THEN the system SHALL use direct imports instead of barrel imports to break the cycle
3. WHEN `lib/db/index.ts` exports modules THEN the system SHALL not create import cycles with `lib/db/lesson-completions.ts`

### Requirement 2

**User Story:** As a developer, I want all `any` types replaced with proper TypeScript types, so that the codebase has full type safety and better IDE support.

#### Acceptance Criteria

1. WHEN a function parameter uses `any` type THEN the system SHALL replace it with a specific type or generic constraint
2. WHEN a Supabase query result is cast to `any` THEN the system SHALL use proper typed responses from the generated types
3. WHEN type guards use `any` parameter THEN the system SHALL use `unknown` type instead for safer type narrowing
4. WHEN callback handlers use `any` THEN the system SHALL define proper function signatures with typed parameters

### Requirement 3

**User Story:** As a developer, I want all unused imports and variables removed, so that the codebase is clean and bundle sizes are optimized.

#### Acceptance Criteria

1. WHEN ESLint runs on the codebase THEN the system SHALL report zero `no-unused-vars` warnings
2. WHEN a variable is declared but never used THEN the system SHALL either remove it or prefix with underscore if intentionally unused
3. WHEN an import is not referenced THEN the system SHALL remove the import statement

### Requirement 4

**User Story:** As a developer, I want database types synchronized between manual types and auto-generated Supabase types, so that there are no type mismatches when querying the database.

#### Acceptance Criteria

1. WHEN `lib/types/database.ts` defines a type THEN the system SHALL ensure it aligns with the corresponding Supabase generated type
2. WHEN a database table has columns not reflected in manual types THEN the system SHALL update the manual types to include them
3. WHEN querying the database THEN the system SHALL use types from `lib/types/supabase.ts` as the source of truth

### Requirement 5

**User Story:** As a developer, I want console.log statements replaced with proper logging, so that production code follows logging best practices.

#### Acceptance Criteria

1. WHEN code needs to output debug information THEN the system SHALL use the established logging utility instead of console.log
2. WHEN console statements exist outside of allowed methods (warn, error) THEN the system SHALL replace them with appropriate logging calls

### Requirement 6

**User Story:** As a developer, I want consistent API response patterns across all route handlers, so that the API is predictable and maintainable.

#### Acceptance Criteria

1. WHEN an API route returns a success response THEN the system SHALL use `successResponse()` helper instead of `NextResponse.json()` directly
2. WHEN an API route returns an error response THEN the system SHALL use `errorResponse()` helper with consistent error field naming
3. WHEN an API route returns paginated data THEN the system SHALL use `paginatedResponse()` helper with standard pagination structure
4. WHEN error responses are created THEN the system SHALL use the `error` field consistently (not `message`, `err`, or `success: false` patterns)

### Requirement 7

**User Story:** As a developer, I want consistent Supabase client creation patterns, so that database connections are managed uniformly.

#### Acceptance Criteria

1. WHEN server-side code needs a Supabase client THEN the system SHALL use `createAdminClient()` from `@/lib/supabase/admin`
2. WHEN a repository class needs a Supabase client THEN the system SHALL accept an optional client parameter with `createAdminClient()` as default
3. WHEN scripts need database access THEN the system SHALL use the standard client creation pattern from the lib folder
4. WHEN client-side code needs a Supabase client THEN the system SHALL use the browser client utilities

### Requirement 8

**User Story:** As a developer, I want consistent error handling patterns across the codebase, so that errors are handled predictably.

#### Acceptance Criteria

1. WHEN a catch block receives an error THEN the system SHALL type it as `unknown` and narrow appropriately
2. WHEN an error is logged THEN the system SHALL use the logger utility with proper error context
3. WHEN a function can fail THEN the system SHALL return a consistent result type with `{ data, error }` pattern
4. WHEN unused catch parameters exist THEN the system SHALL prefix them with underscore (`_error`)
