# B2B Features Documentation

This document outlines all the B2B features integrated from the IndieKit boilerplate into NeuroElemental.

## Table of Contents

- [Overview](#overview)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Admin Panel](#admin-panel)
- [User Features](#user-features)
- [Email Templates](#email-templates)
- [Components](#components)

## Overview

The B2B integration provides a complete multi-tenant organization system with:

- **Multi-tenant Organizations**: Users can create and join multiple organizations
- **Role-based Access Control**: Owner, Admin, and Member roles with different permissions
- **Credits System**: Flexible credit tracking for course consumption with automated low-balance warnings
- **Stripe Integration**: Secure payment processing for credit purchases with coupon support
- **Bulk Operations**: Invite up to 100 members at once with detailed result tracking
- **Activity Logging**: Comprehensive audit trail of all organization actions (25+ action types)
- **API Keys**: Secure programmatic access with scope-based permissions (9 scopes)
- **Analytics Dashboard**: Real-time usage metrics and trends
- **Usage Reports**: Exportable CSV reports for compliance and analysis
- **Waitlist Management**: Course waitlist signups and exports
- **Coupon System**: Promotional codes with various discount types
- **Email Notifications**: Professional email templates using React Email
- **Admin Dashboard**: Comprehensive platform management interface with overview dashboard
- **Cron Jobs**: Automated tasks for maintenance and notifications

## Database Schema

### Core Tables

#### `organizations`
- Organization management
- Stores: name, slug, credits (JSONB), created_at
- RLS policies for member access

#### `organization_memberships`
- Links users to organizations with roles
- Roles: owner, admin, member
- Tracks join date

#### `organization_invites`
- Email-based organization invitations
- 7-day expiration
- Tracks inviter and role

#### `credit_transactions`
- Complete audit log of credit operations
- Types: add, subtract, expire
- Supports multiple credit types per organization

#### `waitlist`
- Course waitlist signups
- Stores: email, name, course_id
- Export capability for admin

#### `coupons`
- Promotional code management
- Types: percentage, fixed_amount, credits
- Usage tracking and expiration

#### `credit_warnings`
- Tracks low credit warning notifications
- Prevents duplicate emails (7-day window)
- Records organization, credit type, balance, and threshold
- Used by automated cron jobs

#### `api_keys`
- Programmatic API access keys for organizations
- Stores: name, key_prefix (for display), key_hash (SHA-256), scopes, expiration
- Tracks last_used_at timestamp
- RLS policies for organization admins
- Supports multiple scopes for granular permissions

## API Routes

### Organization Management

#### `POST /api/organizations`
Create a new organization. User becomes owner.

#### `GET /api/organizations`
List all organizations for the current user.

#### `GET /api/organizations/[id]`
Get organization details and user's role.

#### `PUT /api/organizations/[id]`
Update organization (admin only).

#### `DELETE /api/organizations/[id]`
Delete organization (owner only).

### Member Management

#### `GET /api/organizations/[id]/members`
List organization members.

#### `PUT /api/organizations/[id]/members`
Update member role (admin only).

#### `DELETE /api/organizations/[id]/members`
Remove member (admin only).

#### `POST /api/organizations/[id]/invite`
Invite new member via email (admin only).

### Credits

#### `GET /api/organizations/[id]/credits`
Get credit balance and transaction history.

#### `POST /api/organizations/[id]/credits`
Add credits (admin only).

#### `DELETE /api/organizations/[id]/credits`
Subtract credits.

### Waitlist

#### `POST /api/waitlist`
Join waitlist (public endpoint).

#### `GET /api/waitlist`
Get waitlist entries (authenticated).

#### `DELETE /api/waitlist`
Remove from waitlist.

### Coupons

#### `POST /api/coupons/validate`
Validate coupon code.

#### `POST /api/coupons/redeem`
Redeem coupon code.

### Invitations

#### `GET /api/invitations/[id]`
Get invitation details (public).

#### `POST /api/invitations/[id]/accept`
Accept invitation (authenticated).

#### `POST /api/invitations/[id]/decline`
Decline invitation (authenticated).

### Admin Routes

#### `GET /api/admin/organizations`
List all organizations (admin only).

#### `GET /api/admin/coupons`
List all coupons (admin only).

#### `POST /api/admin/coupons`
Create coupon (admin only).

#### `GET /api/admin/credits`
View all credit transactions (admin only).

#### `GET /api/admin/invitations`
View all invitations (admin only).

#### `GET /api/admin/stats`
Platform-wide statistics (admin only).

#### `GET /api/admin/platform/stats`
Aggregated platform metrics for overview dashboard (admin only).

#### `GET /api/organizations/[id]/analytics`
Organization analytics with trends and usage metrics.

#### `POST /api/organizations/[id]/credits/purchase`
Purchase credits for organization (admin only).

#### `GET /api/organizations/[id]/reports/[type]`
Generate CSV reports (credit-usage, member-activity, course-enrollments).

### Cron Jobs

#### `GET /api/cron/check-low-credits`
Automated check for low credit balances with email notifications.
- Runs daily (configurable)
- Sends warnings to organization admins
- Prevents duplicate emails within 7 days
- Requires `CRON_SECRET` authorization header

### API Keys Management

#### `GET /api/organizations/[id]/api-keys`
List all API keys for an organization (admin only).

#### `POST /api/organizations/[id]/api-keys`
Create a new API key with specified scopes (admin only).

#### `PATCH /api/organizations/[id]/api-keys/[keyId]`
Revoke an API key (soft delete, admin only).

#### `DELETE /api/organizations/[id]/api-keys/[keyId]`
Permanently delete an API key (admin only).

### Unified Authentication

All API routes support **both authentication methods**:
- **Session Auth** (web app) - Uses cookies, full permissions
- **API Key Auth** (programmatic) - Uses Bearer tokens, scope-based permissions

This means the same endpoints work for:
- Your web application (automatic session cookies)
- External integrations (explicit API keys)
- Testing in browser (session) or curl (API key)

**Example Routes:**

#### `GET /api/organizations/[id]/credits`
Get organization credit balance.
- Session auth: Full access
- API key auth: Requires `credits:read` scope

#### `POST /api/organizations/[id]/credits`
Add credits to organization.
- Session auth: Admin check required
- API key auth: Requires `credits:write` scope

#### `GET /api/organizations/[id]/members`
List organization members.
- Session auth: Full access
- API key auth: Requires `members:read` scope
- Supports pagination: `?limit=50&offset=0`
- Supports filtering: `?role=admin`

#### `POST /api/organizations/[id]/members`
Invite a new member.
- Session auth: Admin check required
- API key auth: Requires `members:write` scope

## Admin Panel

Located at `/dashboard/admin/*`

### Pages

#### `/dashboard/admin/overview` - Platform Overview
- Real-time platform metrics and health monitoring
- Organization and user growth trends
- Total revenue and credit statistics
- Today's activity counts
- Recent platform activity feed
- System alerts and warnings
- Credit usage analytics

#### `/dashboard/admin/organizations`
- View all organizations
- Member counts
- Total credits
- Creation dates

#### `/dashboard/admin/waitlist`
- View all waitlist entries
- CSV export functionality
- Stats (total, recent week)

#### `/dashboard/admin/coupons`
- View all coupons
- Usage statistics
- Expiration tracking
- Active/inactive status

#### `/dashboard/admin/coupons/new`
- Create new promotional coupons
- Auto-generate random codes
- Three discount types (percentage, fixed amount, bonus credits)
- Optional max uses and expiration dates
- Live preview of coupon settings

#### `/dashboard/admin/credits`
- All credit transactions
- Filter by organization/type
- Transaction details
- Credits added/used totals

#### `/dashboard/admin/invitations`
- View all invitations
- Active/expired status
- Expiration tracking
- Organization and role details

### Navigation

The admin sidebar includes two sections:
- **Core**: Standard admin features
- **B2B Features**: Organization-specific features

## User Features

### Organization Management

#### `/dashboard/organizations` - Organizations List
- View all organizations user belongs to
- Create new organization
- Quick stats (members, credits)
- Role badges

#### `/dashboard/organizations/new` - Create Organization
- Organization name and slug
- Auto-generates unique slug
- Creates user as owner

#### `/dashboard/organizations/[id]` - Organization Dashboard
- Three tabs: Overview, Members, Credits
- Organization switcher component
- Stats cards (total members, total credits, member since)
- Member list with roles
- Credit transaction history (recent 10)
- Links to Analytics, Reports, and Settings
- Buy Credits button (admin only)
- View Full History button

#### `/dashboard/organizations/[id]/analytics` - Organization Analytics
- Key metrics with trend indicators
- Credit usage by type with progress bars
- Recent activity timeline
- Monthly credit usage chart (6 months)
- Member growth tracking
- Course completion statistics

#### `/dashboard/organizations/[id]/credits/history` - Transaction History
- Complete credit transaction log
- Advanced filtering (search, type, date range)
- Statistics cards (added, used, expired, average)
- Export to CSV
- Detailed transaction metadata
- Payment IDs and coupon codes

#### `/dashboard/organizations/[id]/credits/purchase` - Purchase Credits
- Pre-defined credit packages (Starter, Professional, Enterprise)
- Custom amount option
- Real-time price calculation
- Coupon code integration
- Order summary with preview
- Secure checkout process

#### `/dashboard/organizations/[id]/reports` - Usage Reports
- Three report types:
  - Credit Usage Report (transactions with details)
  - Member Activity Report (usage per member)
  - Course Enrollments Report (student progress)
- Flexible date ranges (7 days to all-time)
- One-click CSV download
- Report contents preview

#### `/dashboard/organizations/[id]/settings` - Organization Settings
Three tabs:
1. **General**: Update name and slug
2. **Members**: Manage roles and remove members
3. **Danger Zone**: Delete organization

#### `/dashboard/organizations/[id]/invite` - Invite Members
- Email invitation
- Role selection (admin/member)
- Expiration info
- Email notification

#### `/dashboard/organizations/[id]/invite/bulk` - Bulk Invite Members
- Invite multiple members at once
- Support for multiple input formats (newlines, commas, semicolons)
- File upload support (.txt, .csv)
- Real-time email validation with counts
- Detailed results for each invitation (success/error/duplicate)
- Summary statistics
- Email sending for each valid invitation
- Admin-only access with 100-invitation limit

#### `/dashboard/organizations/[id]/activity` - Activity Log
- Comprehensive audit trail of all organization actions
- Filterable timeline by action type
- Color-coded icons for different action types
- Relative timestamps (e.g., "2 hours ago")
- Expandable metadata viewer
- Tracks 25+ action types:
  - Organization management (created, updated, deleted)
  - Member actions (invited, joined, removed, role changed)
  - Credit operations (added, purchased, used, expired)
  - Invitation flow (sent, accepted, declined)
  - Security events (API key created, revoked, deleted)

#### `/dashboard/organizations/[id]/api-keys` - API Keys Management
- View and manage API keys for programmatic access
- List all keys with status (active/revoked/expired)
- Create new keys with:
  - Descriptive name
  - Scope selection (9 scopes across 5 categories)
  - Optional expiration (1-365 days)
- One-time key display with security warning
- Copy to clipboard functionality
- Expandable details showing:
  - Created by and creation date
  - Last used timestamp
  - Expiration status
  - Associated scopes
- Revoke (soft delete) or permanently delete keys
- Admin-only access

### Invitation Flow

#### `/invite/[id]` - Accept/Decline Invitation
- View invitation details
- Organization info
- Role permissions preview
- Accept or decline
- Expiration validation
- Email verification

## Email Templates

Located in `emails/templates/*`

All templates use `@react-email/components` for professional styling.

### Templates

1. **organization-invitation.tsx**
   - Sent when inviting members
   - Includes invitation link
   - Shows role and organization

2. **welcome-to-organization.tsx**
   - Sent after joining
   - Role-specific permissions list
   - Dashboard link

3. **role-changed.tsx**
   - Sent when role updated
   - Shows old → new role
   - Permission changes

4. **waitlist-confirmation.tsx**
   - Sent after joining waitlist
   - Course-specific or general
   - "What happens next" section

5. **credits-purchased.tsx**
   - Sent after credit purchase
   - Receipt details
   - Current balance
   - Expiration info

6. **low-credits-warning.tsx**
   - Sent when credits drop below threshold
   - Shows current balance and threshold
   - Link to purchase more credits
   - Automated via cron job

### Email Service

Located in `lib/email/send.ts`

Uses Resend API for delivery. Each template has a dedicated send function.

#### Environment Variables

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Components

### OrganizationSwitcher

`components/organizations/organization-switcher.tsx`

- Dropdown to switch between organizations
- Search functionality
- Create organization button
- Shows user role for each org

### WaitlistForm

`components/waitlist/waitlist-form.tsx`

- Email and name input
- Course-specific or general
- Success state
- Toast notifications

### CouponInput

`components/checkout/coupon-input.tsx`

- Full card version and inline version
- Real-time coupon validation
- Visual success state (green highlighting)
- Discount calculation for percentage and fixed amount
- Bonus credits support
- Suggested coupon codes
- Toast notifications for success/error

## Database Helper Functions

### Organizations (`lib/db/organizations.ts`)

- `createOrganization()` - Create org with owner membership
- `getUserOrgRole()` - Get user's role in org
- `isUserOrgMember()` - Check membership
- `isUserOrgAdmin()` - Check admin access
- `getOrganizationMembers()` - List members
- `updateMemberRole()` - Change member role
- `removeMember()` - Remove from org
- `createInvitation()` - Generate invite
- `acceptInvitation()` - Process acceptance
- `isSlugAvailable()` - Check slug uniqueness
- `addCredits()` - Add credits with transaction
- `subtractCredits()` - Subtract with transaction
- `getCredits()` - Get balance
- `getCreditTransactions()` - Get history
- `addToWaitlist()` - Join waitlist
- `isEmailOnWaitlist()` - Check if already joined
- `removeFromWaitlist()` - Leave waitlist
- `validateCoupon()` - Check validity
- `createCoupon()` - Create new coupon
- `getAllCoupons()` - List coupons

### Activity Log (`lib/db/activity-log.ts`)

- `logActivity()` - Log organization activity with metadata
- `getActivityLog()` - Retrieve filtered activity logs
- `formatActivityDescription()` - Generate human-readable descriptions
- **ActivityActions** - 25+ pre-defined action types
- **EntityTypes** - Standardized entity type constants

### API Keys (`lib/api-keys/manage.ts`)

- `generateApiKey()` - Generate secure API key (ne_live_xxx format)
- `hashApiKey()` - Hash key for secure storage (SHA-256)
- `getKeyPrefix()` - Get first 12 characters for display
- `createApiKey()` - Create new API key with scopes
- `validateApiKey()` - Validate and return key details
- `hasScope()` - Check if key has required scope
- `listApiKeys()` - List all keys for organization
- `revokeApiKey()` - Soft delete (set is_active to false)
- `deleteApiKey()` - Permanently delete key
- `getScopeDescription()` - Get human-readable scope description
- `getScopesByCategory()` - Group scopes by category for UI
- **API_SCOPES** - 9 available scopes (credits, members, org, analytics, courses)

### Unified Authentication (`lib/middleware/api-auth.ts`)

- `authenticateRequest()` - Try API key first, then session auth
- `checkApiScope()` - Verify permissions (session bypasses, API key requires scopes)
- `requireAuth()` - Middleware wrapper for protected routes
- `createApiErrorResponse()` - Standardized error responses
- Supports both `Authorization: Bearer` and `X-API-Key` headers
- **Key Feature:** Session auth has full permissions (trusted), API keys are scope-limited

## Validation Schemas

Located in `lib/validation/schemas.ts`

Uses Zod for runtime validation:

- `organizationCreateSchema` - Name and slug
- `organizationUpdateSchema` - Name and slug updates
- `memberUpdateSchema` - Role changes
- `invitationCreateSchema` - Email and role
- `creditAddSchema` - Credit additions
- `creditSubtractSchema` - Credit subtractions
- `waitlistCreateSchema` - Waitlist signups
- `couponCreateSchema` - Coupon creation
- `couponValidateSchema` - Coupon validation

## TypeScript Types

Located in `lib/types/organizations.ts`

Comprehensive type definitions for all entities:

- `Organization`
- `OrganizationMembership`
- `OrganizationInvite`
- `CreditTransaction`
- `WaitlistEntry`
- `Coupon`

## Row Level Security (RLS)

All tables have proper RLS policies:

- Organizations: Members can view, admins can edit
- Memberships: Members can view own org memberships
- Invites: Invitees can view their invitations
- Credits: Organization members can view transactions
- Waitlist: Users can manage own entries
- Coupons: Public read, admin write

## Migration

Located in `supabase/migrations/`

### Initial Migration
`20250122_create_b2b_tables.sql` - Creates all tables and policies

### Context Migration
`20250122_add_organization_context.sql` - Adds organization_id to existing tables:
- course_enrollments
- certificates
- payment_transactions

Updates RLS policies for organization context.

## Usage Examples

### Creating an Organization

```typescript
const { data: org, error } = await createOrganization({
  name: 'Acme Inc',
  slug: 'acme-inc',
  created_by_user_id: userId,
})
```

### Inviting a Member

```typescript
const { data: invite, error } = await createInvitation({
  organization_id: orgId,
  email: 'colleague@example.com',
  role: 'admin',
  invited_by: userId,
})

// Send email
await sendOrganizationInvitation({
  to: invite.email,
  organizationName: 'Acme Inc',
  inviterName: 'John Doe',
  role: 'admin',
  inviteId: invite.id,
})
```

### Adding Credits

```typescript
const { data: transaction, error } = await addCredits({
  organization_id: orgId,
  credit_type: 'course',
  amount: 100,
  user_id: userId,
  payment_id: 'stripe_pi_xxx',
  expiration_days: 365,
})

// Send receipt
await sendCreditsPurchased({
  to: user.email,
  organizationName: 'Acme Inc',
  creditType: 'course',
  amount: 100,
  totalCost: 999,
  currentBalance: 150,
})
```

### Validating a Coupon

```typescript
const { valid, error, coupon } = await validateCoupon({
  code: 'LAUNCH50',
  course_id: 'course_123',
  user_id: userId,
  organization_id: orgId,
})

if (valid) {
  const discount = calculateDiscount(coupon, price)
  // Apply discount
}
```

## API Keys System

### Overview

The API Keys system provides secure programmatic access to organization resources. Each key:

- Uses format `ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Stored as SHA-256 hash for security
- Has granular permissions via scopes
- Can have optional expiration dates
- Tracks last usage timestamp
- Can be revoked or permanently deleted

### Available Scopes

**Credits Management:**
- `credits:read` - Read credit balance and transactions
- `credits:write` - Add or subtract credits

**Member Management:**
- `members:read` - View organization members
- `members:write` - Invite and manage members

**Organization:**
- `org:read` - Read organization details
- `org:write` - Update organization settings

**Analytics:**
- `analytics:read` - Access analytics and reports

**Courses:**
- `courses:read` - View course information
- `courses:enroll` - Enroll users in courses

### Authentication Methods

API keys can be provided via:

1. **Authorization Header** (Recommended):
   ```
   Authorization: Bearer ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **Custom Header**:
   ```
   X-API-Key: ne_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

### Usage Example

```typescript
import { requireAuth } from '@/lib/middleware/api-auth'
import { API_SCOPES } from '@/lib/api-keys/manage'
import { getSupabaseServer } from '@/lib/db/supabase-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate with unified middleware (session OR API key)
  const auth = await requireAuth(request, [API_SCOPES.CREDITS_READ])

  if (auth.error) {
    return auth.error // Returns 401 or 403
  }

  const { userId, authMethod, organizationId } = auth.data

  // For API key auth, organizationId is guaranteed to match params.id
  // For session auth, need to verify user has access to this org
  if (authMethod === 'session') {
    // Check user is member of requested organization
    const supabase = getSupabaseServer()
    const { data: membership } = await supabase
      .from('organization_memberships')
      .select('user_id')
      .eq('organization_id', params.id)
      .eq('user_id', userId)
      .single()

    if (!membership) {
      return NextResponse.json(
        { error: 'Not a member of this organization' },
        { status: 403 }
      )
    }
  } else {
    // API key auth - verify org matches
    if (organizationId !== params.id) {
      return NextResponse.json(
        { error: 'Organization mismatch' },
        { status: 403 }
      )
    }
  }

  // Fetch and return credits...
  const supabase = getSupabaseServer()
  const { data: org } = await supabase
    .from('organizations')
    .select('credits')
    .eq('id', params.id)
    .single()

  return NextResponse.json({
    organization_id: params.id,
    credits: org?.credits || {},
    auth_method: authMethod, // Shows how request was authenticated
  })
}
```

**Key Benefits:**
- Same route works for web app (session) and API (key)
- Session auth = trusted user, full access
- API key auth = limited by scopes
- Test in browser, use programmatically

For complete API documentation, see `API_KEYS_GUIDE.md`.

## Next Steps

To extend this system further, consider:

1. ✅ **Analytics Dashboard**: Usage tracking, conversion metrics (COMPLETED)
2. ✅ **Billing Integration**: Stripe integration for credits (COMPLETED)
3. **Team Roles**: Custom role definitions
4. **Usage Limits**: Rate limiting, quotas
5. **SSO Integration**: Enterprise authentication
6. ✅ **Audit Logs**: Detailed activity tracking (COMPLETED)
7. **Webhooks**: Event notifications
8. ✅ **API Keys**: Programmatic access (COMPLETED)
9. **Multi-language**: i18n support
10. **Mobile Apps**: Native mobile experience

## Support

For questions or issues:
- Check the API route implementations
- Review the helper functions in `lib/db/organizations.ts`
- Examine the validation schemas
- Test with the admin panel
