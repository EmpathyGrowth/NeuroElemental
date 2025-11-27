# Validation Patterns Audit

## Executive Summary

This document catalogs all inline validation patterns found across API routes that should be extracted into centralized validation schemas. The audit identified **45+ routes** with inline validation that can be standardized using Zod schemas.

## Current State

### Existing Validation Infrastructure

**Location**: `lib/validation/schemas.ts`

**Already Defined Schemas** (23 schemas):
- Profile & User: `profileUpdateSchema`, `roleUpdateSchema`
- Courses: `courseCreateSchema`, `courseUpdateSchema`, `courseEnrollmentSchema`, `courseReviewSchema`
- Lessons: `lessonCreateSchema`, `lessonUpdateSchema`, `lessonCompleteSchema`
- Events: `eventCreateSchema`, `eventUpdateSchema`, `eventRegistrationSchema`
- Assessments: `assessmentSubmitSchema`
- Payments: `checkoutSessionSchema`, `webhookEventSchema`
- Assignments & Quizzes: `assignmentSubmitSchema`, `assignmentGradeSchema`, `quizSubmitSchema`, `quizCreateSchema`
- Blog: `blogPostCreateSchema`, `blogPostUpdateSchema`
- Organizations: `organizationCreateSchema`, `organizationUpdateSchema`, `organizationMemberInviteSchema`, `organizationMemberUpdateSchema`, `organizationBulkInviteSchema`
- Waitlist: `waitlistCreateSchema`
- Coupons: `couponCreateSchema`, `couponValidateSchema`
- Credits: `creditTransactionSchema`
- Notifications: `notificationCreateSchema`, `notificationUpdateSchema`
- Products: `productCreateSchema`, `productUpdateSchema`
- Resources: `resourceUploadSchema`

**Helper**: `validateRequest` function in `lib/validation/validate.ts`

### Routes Already Using Validation Schemas (11 routes)

✅ **Good Examples**:
1. `app/api/waitlist/route.ts` - Uses `waitlistCreateSchema`
2. `app/api/profile/route.ts` - Uses `profileUpdateSchema`
3. `app/api/organizations/route.ts` - Uses `organizationCreateSchema`
4. `app/api/organizations/[id]/route.ts` - Uses `organizationUpdateSchema`
5. `app/api/organizations/[id]/members/route.ts` - Uses `organizationMemberInviteSchema`, `organizationMemberUpdateSchema`
6. `app/api/organizations/[id]/invite/bulk/route.ts` - Uses `organizationBulkInviteSchema`
7. `app/api/coupons/redeem/route.ts` - Uses `couponValidateSchema`
8. `app/api/coupons/validate/route.ts` - Uses `couponValidateSchema`
9. `app/api/assessment/submit/route.ts` - Uses `submissionSchema` (inline, should be moved)
10. `app/api/admin/coupons/route.ts` - Uses `couponCreateSchema`

## Inline Validation Patterns Found

### Category 1: Required Field Validation

**Pattern**: `if (!field) { throw badRequestError(...) }`

**Routes with this pattern**:

1. **Sessions API** (`app/api/sessions/route.ts`)
   - Fields: `instructor_id`, `scheduled_at`
   - Validation: Required fields check
   
2. **Reviews API** (`app/api/reviews/route.ts`)
   - Fields: `rating` (must be 1-5), `content` (min 10 chars)
   - Validation: Range and length checks
   
3. **Stripe Checkout** (`app/api/stripe/checkout/route.ts`)
   - Fields: `priceId`
   - Validation: Required field
   
4. **Stripe Credits Checkout** (`app/api/stripe/credits/checkout/route.ts`)
   - Fields: `organizationId`, `packageId`, `customAmount`
   - Validation: Required + range (1-1000 for customAmount)
   
5. **Uploads API** (`app/api/uploads/route.ts`)
   - Fields: `file`
   - Validation: File presence, size (max 50MB), type (whitelist)
   
6. **Search API** (`app/api/search/route.ts`)
   - Fields: `query`
   - Validation: Min length (2 chars)
   
7. **User Data Export** (`app/api/user/data-export/route.ts`)
   - Fields: `export_type`
   - Validation: Required field
   
8. **User Data Deletion** (`app/api/user/data-deletion/route.ts`)
   - Fields: `deletion_type`
   - Validation: Required field
   
9. **Data Deletion Confirm** (`app/api/user/data-deletion/confirm/route.ts`)
   - Fields: `confirmation_token`
   - Validation: Required field
   
10. **Quiz Submit** (`app/api/quizzes/[id]/submit/route.ts`)
    - Fields: `answers`
    - Validation: Object type check

### Category 2: Type Validation

**Pattern**: `typeof field !== 'type'`

**Routes with this pattern**:

1. **SSO Login** (`app/api/sso/login/route.ts`)
   - Fields: `email`
   - Validation: `typeof email !== 'string'`
   
2. **Organization SSO** (`app/api/organizations/[id]/sso/route.ts`)
   - Fields: `provider_name`, `url`, `name`
   - Validation: String type + non-empty trim check
   
3. **Organization Webhooks** (`app/api/organizations/[id]/webhooks/route.ts`)
   - Fields: `name`, `url`
   - Validation: String type + non-empty trim
   
4. **Organization Rate Limits** (`app/api/organizations/[id]/rate-limits/route.ts`)
   - Fields: `tier`
   - Validation: String type check
   
5. **Organization API Keys** (`app/api/organizations/[id]/api-keys/route.ts`)
   - Fields: `name`, `expiresInDays`
   - Validation: String type + trim, number range (1-365)

### Category 3: Format/Pattern Validation

**Pattern**: Regex validation, custom format checks

**Routes with this pattern**:

1. **Organization SSO** (`app/api/organizations/[id]/sso/route.ts`)
   - Fields: `domains`
   - Pattern: `/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/`
   - Additional: Certificate format validation (PEM)
   
2. **Audit Schedules** (`app/api/organizations/[id]/audit/schedules/route.ts`)
   - Fields: `time_of_day`
   - Pattern: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/` (HH:MM format)
   
3. **Audit Schedule Update** (`app/api/organizations/[id]/audit/schedules/[scheduleId]/route.ts`)
   - Fields: `time_of_day`
   - Pattern: `/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/` (HH:MM or HH:MM:SS)

### Category 4: Enum/Choice Validation

**Pattern**: Checking against allowed values

**Routes with this pattern**:

1. **Organization SSO** (`app/api/organizations/[id]/sso/route.ts`)
   - Fields: `provider_type`
   - Allowed: `['saml', 'oauth', 'oidc']`
   
2. **Organization API Keys** (`app/api/organizations/[id]/api-keys/route.ts`)
   - Fields: `scopes`
   - Allowed: Values from `API_SCOPES` constant
   
3. **Subscriptions** (`app/api/subscriptions/[id]/route.ts`)
   - Fields: `plan_id`
   - Validation: Check against plans object keys

### Category 5: Array Validation

**Pattern**: Array length, element validation

**Routes with this pattern**:

1. **Organization SSO** (`app/api/organizations/[id]/sso/route.ts`)
   - Fields: `domains`
   - Validation: Array type, min length 1, each element matches domain regex
   
2. **Organization API Keys** (`app/api/organizations/[id]/api-keys/route.ts`)
   - Fields: `scopes`
   - Validation: Array type, min length 1, each element in valid scopes
   
3. **Resources** (`app/api/resources/route.ts`)
   - Fields: `category_ids`, `tag_ids`
   - Validation: Array length > 0

### Category 6: Conditional/Complex Validation

**Pattern**: Provider-specific or context-dependent validation

**Routes with this pattern**:

1. **Organization SSO** (`app/api/organizations/[id]/sso/route.ts`)
   - SAML-specific: `saml_entity_id`, `saml_sso_url`, `saml_certificate`
   - OAuth/OIDC-specific: `oauth_client_id`, `oauth_client_secret`, `oauth_authorize_url`, `oauth_token_url`, `oauth_userinfo_url`
   
2. **SSO Login** (`app/api/sso/login/route.ts`)
   - Provider-specific URL validation based on provider type

### Category 7: Numeric Range Validation

**Pattern**: Min/max value checks

**Routes with this pattern**:

1. **Reviews** (`app/api/reviews/route.ts`)
   - Fields: `rating`
   - Range: 1-5
   
2. **Stripe Credits** (`app/api/stripe/credits/checkout/route.ts`)
   - Fields: `customAmount`
   - Range: 1-1000
   
3. **Organization API Keys** (`app/api/organizations/[id]/api-keys/route.ts`)
   - Fields: `expiresInDays`
   - Range: 1-365
   
4. **Search** (`app/api/search/route.ts`)
   - Fields: `query.length`
   - Min: 2 characters

### Category 8: File Validation

**Pattern**: File type, size validation

**Routes with this pattern**:

1. **Uploads** (`app/api/uploads/route.ts`)
   - Validation: File size (max 50MB), MIME type whitelist
   - Types: images, PDFs, Office docs, videos, audio

## Needed Validation Schemas

Based on the audit, the following schemas should be created:

### High Priority (Frequently Used)

1. **sessionCreateSchema**
   ```typescript
   {
     instructor_id: uuid,
     scheduled_at: datetime,
     duration: number (optional, default 60),
     notes: string (optional)
   }
   ```

2. **reviewCreateSchema** (extend existing `courseReviewSchema`)
   ```typescript
   {
     course_id: uuid (optional),
     instructor_id: uuid (optional),
     product_id: uuid (optional),
     rating: number (1-5),
     title: string (optional),
     content: string (min 10, max 1000),
     pros: string (optional),
     cons: string (optional),
     would_recommend: boolean (optional)
   }
   ```

3. **stripeCheckoutSchema**
   ```typescript
   {
     priceId: string,
     successUrl: url (optional),
     cancelUrl: url (optional),
     metadata: record (optional)
   }
   ```

4. **creditsPurchaseSchema**
   ```typescript
   {
     organizationId: uuid,
     packageId: string (optional),
     customAmount: number (1-1000, optional),
     couponCode: string (optional)
   }
   ```

5. **fileUploadSchema**
   ```typescript
   {
     file: custom file validator,
     folder: string (optional, default 'general'),
     isPublic: boolean (optional, default false)
   }
   ```

6. **searchQuerySchema**
   ```typescript
   {
     query: string (min 2),
     type: enum (optional),
     limit: number (1-100, default 20)
   }
   ```

7. **dataExportRequestSchema**
   ```typescript
   {
     export_type: enum ['full', 'profile', 'activity', 'assessments'],
     format: enum ['json', 'csv'] (optional, default 'json')
   }
   ```

8. **dataDeletionRequestSchema**
   ```typescript
   {
     deletion_type: enum ['account', 'data', 'both'],
     reason: string (optional)
   }
   ```

9. **confirmationTokenSchema**
   ```typescript
   {
     confirmation_token: string (min 1)
   }
   ```

### Medium Priority (SSO & Organization Management)

10. **ssoProviderCreateSchema**
    ```typescript
    {
      provider_type: enum ['saml', 'oauth', 'oidc'],
      provider_name: string,
      domains: array of domain strings (min 1),
      enforce_sso: boolean (optional),
      auto_provision_users: boolean (optional),
      default_role: enum (optional),
      // SAML fields (conditional)
      saml_entity_id: string (optional),
      saml_sso_url: url (optional),
      saml_certificate: string (PEM format, optional),
      saml_sign_requests: boolean (optional),
      // OAuth/OIDC fields (conditional)
      oauth_client_id: string (optional),
      oauth_client_secret: string (optional),
      oauth_authorize_url: url (optional),
      oauth_token_url: url (optional),
      oauth_userinfo_url: url (optional),
      oauth_scopes: array of strings (optional),
      attribute_mapping: record (optional),
      metadata: record (optional)
    }
    ```

11. **ssoProviderUpdateSchema** (partial of above)

12. **ssoLoginSchema**
    ```typescript
    {
      email: email,
      redirectUrl: string (optional)
    }
    ```

13. **webhookCreateSchema**
    ```typescript
    {
      name: string (min 1),
      url: url,
      events: array of strings,
      secret: string (optional),
      active: boolean (optional, default true)
    }
    ```

14. **apiKeyCreateSchema**
    ```typescript
    {
      name: string (min 1),
      scopes: array of ApiScope (min 1),
      expiresInDays: number (1-365, optional)
    }
    ```

15. **rateLimitUpdateSchema**
    ```typescript
    {
      tier: enum ['free', 'basic', 'pro', 'enterprise']
    }
    ```

16. **auditScheduleCreateSchema**
    ```typescript
    {
      frequency: enum ['daily', 'weekly', 'monthly'],
      time_of_day: string (HH:MM format),
      timezone: string,
      recipients: array of emails
    }
    ```

17. **auditScheduleUpdateSchema** (partial of above)

### Lower Priority (Specific Use Cases)

18. **quizAnswersSchema**
    ```typescript
    {
      answers: record of any (question_id -> answer)
    }
    ```

19. **subscriptionUpdateSchema**
    ```typescript
    {
      plan_id: string
    }
    ```

20. **resourceCategoriesSchema**
    ```typescript
    {
      category_ids: array of uuids (optional),
      tag_ids: array of uuids (optional)
    }
    ```

## Reusable Field Schemas

These should be added to `lib/validation/schemas.ts` as building blocks:

```typescript
// Basic types
export const emailSchema = z.string().email()
export const uuidSchema = z.string().uuid()
export const slugSchema = z.string().regex(/^[a-z0-9-]+$/)
export const urlSchema = z.string().url()

// Domain validation
export const domainSchema = z.string().regex(
  /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
  'Invalid domain format'
)

// Time formats
export const timeHHMMSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
  'Time must be in HH:MM format'
)

export const timeHHMMSSSchema = z.string().regex(
  /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
  'Time must be in HH:MM or HH:MM:SS format'
)

// PEM certificate
export const pemCertificateSchema = z.string().refine(
  (val) => val.includes('BEGIN CERTIFICATE'),
  'Certificate must be in PEM format'
)

// File size validation (in bytes)
export const fileSizeSchema = (maxBytes: number) => 
  z.number().max(maxBytes, `File size must not exceed ${maxBytes / 1024 / 1024}MB`)

// Rating
export const ratingSchema = z.number().int().min(1).max(5)

// Pagination
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0)
})
```

## Migration Priority

### Phase 1: High-Traffic Routes (Week 1)
- Sessions API
- Reviews API
- Search API
- Uploads API
- Stripe Checkout

### Phase 2: Organization Management (Week 2)
- SSO Provider Management
- API Keys
- Webhooks
- Rate Limits
- Audit Schedules

### Phase 3: User Data Management (Week 3)
- Data Export
- Data Deletion
- Confirmation Tokens

### Phase 4: Remaining Routes (Week 4)
- Quiz submissions
- Subscriptions
- Resources

## Implementation Checklist

For each route being migrated:

- [ ] Create validation schema in `lib/validation/schemas.ts`
- [ ] Add JSDoc comments with examples
- [ ] Export TypeScript type using `z.infer`
- [ ] Update route to import schema
- [ ] Replace inline validation with `validateRequest(request, schema)`
- [ ] Remove manual validation checks
- [ ] Test with valid inputs
- [ ] Test with invalid inputs (verify error messages)
- [ ] Update route tests to cover validation

## Benefits of Migration

1. **Consistency**: All validation uses same patterns and error messages
2. **Type Safety**: Automatic TypeScript type inference from schemas
3. **Maintainability**: Single source of truth for validation rules
4. **Testability**: Schemas can be tested independently
5. **Documentation**: Schemas serve as API documentation
6. **Reusability**: Common field schemas can be composed
7. **Error Messages**: Zod provides detailed, structured error messages

## Notes

- Some routes already use `validateRequest` but with inline schemas (e.g., `assessment/submit/route.ts`)
- File validation may need custom Zod refinements or separate utility functions
- SSO validation is complex due to provider-specific requirements - consider discriminated unions
- Consider adding schema versioning for API evolution
