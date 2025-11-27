# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

#### Type Safety Improvements
- **Select Components**: Replaced `any` types in `onValueChange` callbacks with proper union types across all organization dashboard pages
  - `invite/bulk/page.tsx`: Role select now uses `'admin' | 'member'`
  - `sso/page.tsx`: Provider type uses `'saml' | 'oauth' | 'oidc'`
  - `audit/exports/page.tsx`: Export format and schedule frequency properly typed

- **Error Handling**: Standardized catch block patterns to use proper TypeScript idioms
  - Changed `catch (error: any)` to `catch (error)` with `instanceof Error` checks
  - Updated error logging to use conditional error instantiation
  - Files updated: `api-keys/page.tsx`, `rate-limits/page.tsx`, `reports/page.tsx`, `webhooks/page.tsx`, `audit/exports/page.tsx`

- **Format Functions**: Added proper types to format callbacks in data tables
  - `credits/history/page.tsx`: Format functions now use `CreditTransaction` type references
  - `admin/analytics/page.tsx`: Tooltip formatter uses `number` type

- **Map Callbacks**: Replaced inline `any` types with proper interfaces
  - `events/[slug]/page.tsx`: Agenda items properly typed with `{ time, title, description }`
  - `courses/[slug]/page.tsx`: Module objects properly typed with `{ title, lessons, duration, description }`

- **Interface Definitions**: Added explicit interfaces for dynamic payloads
  - `admin/coupons/new/page.tsx`: Added `CouponPayload` interface
  - `webhooks/[webhookId]/page.tsx`: Changed `payload: any` to `Record<string, unknown>`
  - `billing/page.tsx`: Added proper type for `upcomingInvoice` with `amount_due` and `currency`

- **Blog Post Types**: Added `BlogPost` interface in `admin/blog/[id]/edit/page.tsx`

#### Code Quality
- **Dead Code Removal**: Removed unused `_selectedTier` state variable from `rate-limits/page.tsx`
- **Standardized Logging**: Ensured consistent use of `logger` from `@/lib/logging` barrel export
- **React Keys**: Fixed index-based keys to use stable identifiers where applicable
- **Accessibility**: Added missing aria-labels to interactive elements
- **Memory Leaks**: Added cleanup for setTimeout in component unmount effects

### Fixed
- Stripe null checks for optional properties
- Added `safeParseInt` and `sanitizeSearchQuery` helper functions for input validation

## [0.1.0] - 2025-11-26

### Added
- Initial release of NeuroElemental platform
- Multi-tenant SaaS architecture with Next.js 16 and React 19
- Supabase integration with Row Level Security
- Organization management with roles and permissions
- Course and event management system
- Credits-based billing system with Stripe integration
- API key management and webhooks
- SSO support (SAML, OAuth, OIDC)
- Audit logging and compliance features
- Admin dashboard with analytics
