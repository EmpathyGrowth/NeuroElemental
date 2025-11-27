# B2B Integration Guide

This guide explains how to integrate the B2B features with your existing course system and extend the functionality.

## Table of Contents

- [Quick Start](#quick-start)
- [Database Setup](#database-setup)
- [Integrating with Courses](#integrating-with-courses)
- [Credit-Based Enrollment](#credit-based-enrollment)
- [Email Customization](#email-customization)
- [Adding Custom Features](#adding-custom-features)
- [Testing](#testing)

## Quick Start

### 1. Run Migrations

First, apply all database migrations:

```bash
# Run B2B tables migration
supabase migration up

# Verify tables were created
supabase db dump --schema public
```

### 2. Configure Environment Variables

Add these to your `.env.local`:

```env
# Email Service
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# App URL for email links
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Install Dependencies

```bash
npm install @react-email/components @react-email/render
```

### 4. Set Up Admin User

Update a user's role to admin in Supabase:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

## Database Setup

### Creating the Tables

The migrations create these tables:
- `organizations` - Organization management
- `organization_memberships` - User-organization relationships
- `organization_invites` - Email invitations
- `credit_transactions` - Credit audit log
- `waitlist` - Course waitlist
- `coupons` - Promotional codes

### Adding Organization Context to Existing Tables

To enable organization-based course access, add `organization_id` to your tables:

```sql
-- Add to course enrollments
ALTER TABLE course_enrollments
ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_course_enrollments_org ON course_enrollments(organization_id);

-- Update RLS policy
CREATE POLICY "org_members_can_view_enrollments" ON course_enrollments
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM organization_memberships om
    WHERE om.user_id = auth.uid()
    AND om.organization_id = course_enrollments.organization_id
  )
);
```

## Integrating with Courses

### Course Enrollment with Organization Credits

Add organization support to your course enrollment flow:

```typescript
// app/courses/[id]/enroll/page.tsx
import { OrganizationSwitcher } from '@/components/organizations/organization-switcher'
import { getOrganizationCredits } from '@/lib/db/organizations'

export default function EnrollPage() {
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null)
  const [orgCredits, setOrgCredits] = useState<number>(0)

  // Fetch organization credits
  useEffect(() => {
    if (selectedOrg) {
      fetchOrgCredits(selectedOrg)
    }
  }, [selectedOrg])

  const handleEnroll = async () => {
    if (selectedOrg && orgCredits > 0) {
      // Enroll with organization credits
      await enrollWithOrgCredits(courseId, selectedOrg)
    } else {
      // Regular enrollment with payment
      await enrollWithPayment(courseId)
    }
  }

  return (
    <div>
      <OrganizationSwitcher
        currentOrgId={selectedOrg}
        onOrganizationChange={setSelectedOrg}
      />

      {orgCredits > 0 && (
        <Badge>Use {orgCredits} organization credits</Badge>
      )}

      <Button onClick={handleEnroll}>
        {orgCredits > 0 ? 'Enroll with Credits' : 'Purchase Course'}
      </Button>
    </div>
  )
}
```

### API Route for Organization Enrollment

```typescript
// app/api/courses/[id]/enroll-org/route.ts
import { subtractCredits } from '@/lib/db/organizations'
import { sendEmail } from '@/lib/email/send'

export async function POST(request: NextRequest, { params }) {
  const { organization_id } = await request.json()
  const user = await getCurrentUser()

  // Check if org has credits
  const credits = await getCredits(organization_id, 'course')
  if (credits < 1) {
    return NextResponse.json(
      { error: 'Insufficient credits' },
      { status: 400 }
    )
  }

  // Subtract credit
  await subtractCredits({
    organization_id,
    credit_type: 'course',
    amount: 1,
    user_id: user.id,
    metadata: { course_id: params.id },
  })

  // Create enrollment
  const { data: enrollment } = await supabase
    .from('course_enrollments')
    .insert({
      user_id: user.id,
      course_id: params.id,
      organization_id,
      enrolled_at: new Date().toISOString(),
    })
    .select()
    .single()

  return NextResponse.json({ enrollment })
}
```

## Credit-Based Enrollment

### Checking Credit Balance

```typescript
import { getCredits } from '@/lib/db/organizations'

async function checkCredits(orgId: string, creditType: string) {
  const balance = await getCredits(orgId, creditType)
  return balance
}
```

### Using Credits

```typescript
import { subtractCredits } from '@/lib/db/organizations'

async function useCredit(orgId: string, userId: string, courseId: string) {
  const { data, error } = await subtractCredits({
    organization_id: orgId,
    credit_type: 'course',
    amount: 1,
    user_id: userId,
    metadata: {
      course_id: courseId,
      action: 'course_enrollment',
    },
  })

  if (error) {
    throw new Error(error)
  }

  return data
}
```

### Adding Credits (Payment Integration)

```typescript
import { addCredits } from '@/lib/db/organizations'
import { sendCreditsPurchased } from '@/lib/email/send'

async function handleCreditPurchase(
  orgId: string,
  userId: string,
  amount: number,
  paymentId: string
) {
  // Add credits
  const { data: transaction } = await addCredits({
    organization_id: orgId,
    credit_type: 'course',
    amount,
    user_id: userId,
    payment_id: paymentId,
    expiration_days: 365,
  })

  // Send confirmation email
  await sendCreditsPurchased({
    to: user.email,
    organizationName: org.name,
    creditType: 'course',
    amount,
    totalCost: amount * 1000, // Price in cents
    currentBalance: newBalance,
  })

  return transaction
}
```

## Email Customization

### Customizing Email Templates

Edit templates in `emails/templates/`:

```tsx
// emails/templates/organization-invitation.tsx
export const OrganizationInvitationEmail = ({
  organizationName,
  inviterName,
  role,
  inviteUrl
}: Props) => {
  return (
    <Html>
      <Head />
      <Preview>You've been invited to join {organizationName}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Add your custom branding */}
          <Img src="https://yourdomain.com/logo.png" alt="Logo" />

          <Heading style={h1}>Join {organizationName}</Heading>

          <Text style={text}>
            {inviterName} has invited you to join as a {role}.
          </Text>

          <Button style={button} href={inviteUrl}>
            Accept Invitation
          </Button>

          {/* Add custom footer */}
          <Hr style={hr} />
          <Text style={footer}>
            © 2024 Your Company. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

### Testing Email Templates

Preview emails in development:

```bash
npm run email:dev
```

This starts the React Email preview server at `http://localhost:3000`.

## Adding Custom Features

### Custom Organization Metadata

Add custom fields to organizations:

```typescript
// Add metadata column
ALTER TABLE organizations
ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

// Store custom data
const { data } = await supabase
  .from('organizations')
  .update({
    metadata: {
      industry: 'Healthcare',
      size: 'Enterprise',
      customField: 'value',
    },
  })
  .eq('id', orgId)
```

### Custom Credit Types

Support multiple credit types:

```typescript
// In your enrollment logic
const creditTypes = {
  beginner: 'beginner_course',
  advanced: 'advanced_course',
  premium: 'premium_course',
}

// Check specific credit type
const credits = await getCredits(orgId, creditTypes[courseLevel])

if (credits > 0) {
  await subtractCredits({
    organization_id: orgId,
    credit_type: creditTypes[courseLevel],
    amount: 1,
    user_id: userId,
  })
}
```

### Team Activity Feed

Create an activity feed for organizations:

```typescript
// app/api/organizations/[id]/activity/route.ts
export async function GET(request, { params }) {
  const { data: activities } = await supabase
    .from('credit_transactions')
    .select(`
      *,
      user:profiles(full_name, email),
      course:courses(title)
    `)
    .eq('organization_id', params.id)
    .order('created_at', { ascending: false })
    .limit(50)

  // Format for display
  const formattedActivities = activities.map(a => ({
    id: a.id,
    user: a.user.full_name || a.user.email,
    action: `${a.transaction_type === 'subtract' ? 'used' : 'received'} ${a.amount} ${a.credit_type} credits`,
    course: a.course?.title,
    timestamp: a.created_at,
  }))

  return NextResponse.json({ activities: formattedActivities })
}
```

### Bulk Member Management

Add bulk invite functionality:

```typescript
// app/api/organizations/[id]/bulk-invite/route.ts
export async function POST(request, { params }) {
  const { emails, role } = await request.json()
  const user = await getCurrentUser()

  // Create invitations
  const invites = await Promise.all(
    emails.map(email =>
      createInvitation({
        organization_id: params.id,
        email,
        role,
        invited_by: user.id,
      })
    )
  )

  // Send emails
  await Promise.all(
    invites.map(invite =>
      sendOrganizationInvitation({
        to: invite.email,
        organizationName: org.name,
        inviterName: user.full_name,
        role: invite.role,
        inviteId: invite.id,
      })
    )
  )

  return NextResponse.json({ invites })
}
```

## Testing

### Unit Tests

```typescript
// __tests__/organizations.test.ts
import { createOrganization, addCredits } from '@/lib/db/organizations'

describe('Organizations', () => {
  it('should create organization', async () => {
    const { data, error } = await createOrganization({
      name: 'Test Org',
      slug: 'test-org',
      created_by_user_id: userId,
    })

    expect(error).toBeNull()
    expect(data.name).toBe('Test Org')
  })

  it('should add credits', async () => {
    const { data } = await addCredits({
      organization_id: orgId,
      credit_type: 'course',
      amount: 10,
      user_id: userId,
    })

    expect(data.amount).toBe(10)
  })
})
```

### Integration Tests

```typescript
// __tests__/api/enroll-org.test.ts
describe('POST /api/courses/[id]/enroll-org', () => {
  it('should enroll with org credits', async () => {
    // Setup
    const org = await createOrganization(...)
    await addCredits({ organization_id: org.id, amount: 5 })

    // Test
    const response = await fetch('/api/courses/123/enroll-org', {
      method: 'POST',
      body: JSON.stringify({ organization_id: org.id }),
    })

    expect(response.status).toBe(200)

    // Verify credit was subtracted
    const credits = await getCredits(org.id, 'course')
    expect(credits).toBe(4)
  })
})
```

### Manual Testing Checklist

- [ ] Create organization
- [ ] Invite member
- [ ] Accept invitation
- [ ] Update member role
- [ ] Remove member
- [ ] Add credits
- [ ] Use credits for enrollment
- [ ] View credit transactions
- [ ] Create coupon
- [ ] Validate coupon
- [ ] Join waitlist
- [ ] Export waitlist
- [ ] View analytics
- [ ] Delete organization

## Common Integration Patterns

### Middleware for Organization Context

```typescript
// middleware/org-context.ts
export async function getOrgContext(request: NextRequest) {
  const orgId = request.cookies.get('current_org_id')?.value

  if (orgId) {
    const org = await getOrganization(orgId)
    const role = await getUserOrgRole(user.id, orgId)

    return { organization: org, role }
  }

  return null
}
```

### React Context for Organization State

```typescript
// contexts/OrganizationContext.tsx
export const OrganizationContext = createContext({
  currentOrg: null,
  setCurrentOrg: () => {},
  credits: {},
  refreshCredits: () => {},
})

export function OrganizationProvider({ children }) {
  const [currentOrg, setCurrentOrg] = useState(null)
  const [credits, setCredits] = useState({})

  const refreshCredits = async () => {
    if (currentOrg) {
      const balance = await getCredits(currentOrg.id)
      setCredits(balance)
    }
  }

  return (
    <OrganizationContext.Provider value={{
      currentOrg,
      setCurrentOrg,
      credits,
      refreshCredits,
    }}>
      {children}
    </OrganizationContext.Provider>
  )
}
```

## Troubleshooting

### Credits Not Subtracting

Check:
1. RLS policies allow the user to insert transactions
2. Organization has sufficient credits
3. Credit type matches

### Invitations Not Sending

Check:
1. RESEND_API_KEY is set correctly
2. FROM_EMAIL is verified in Resend
3. APP_URL is set for invite links
4. Email template renders without errors

### Organization Not Accessible

Check:
1. User is a member of the organization
2. RLS policies allow access
3. Organization ID is valid

## Best Practices

1. **Always use helper functions** - Don't write raw Supabase queries
2. **Check permissions** - Use `isUserOrgAdmin()` before sensitive operations
3. **Transaction logging** - All credit operations should create audit entries
4. **Email notifications** - Send emails for important actions
5. **Error handling** - Always handle errors gracefully
6. **Type safety** - Use TypeScript types from `lib/types/organizations.ts`
7. **Testing** - Write tests for critical flows
8. **Documentation** - Document custom extensions

## Next Steps

1. Implement billing for credit purchases
2. Add usage limits and quotas
3. Build analytics dashboard
4. Create custom reports
5. Add SSO integration
6. Implement audit logs
7. Create webhook system
8. Add API access with keys

## Support

For issues or questions:
- Check `B2B_FEATURES.md` for feature documentation
- Review helper functions in `lib/db/organizations.ts`
- Examine API routes for examples
- Test with the admin panel at `/dashboard/admin`
