# Cron Job Setup Guide

This document explains how to set up automated cron jobs for the NeuroElemental platform.

## Available Cron Jobs

### 1. Low Credits Check

**Endpoint:** `GET /api/cron/check-low-credits`

**Purpose:** Checks all organizations for low credit balances and sends warning emails to admins.

**Frequency:** Daily at 9:00 AM

**Thresholds:**
- Course credits: 10
- API credits: 100
- Storage credits: 50

**Features:**
- Sends emails only to organization owners and admins
- Prevents duplicate emails (won't send again within 7 days)
- Records all warnings in the database
- Returns detailed execution report

## Setup Options

### Option 1: Vercel Cron (Recommended for Vercel deployments)

1. Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-low-credits",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. Add your cron secret to Vercel environment variables:
```bash
CRON_SECRET=your-secure-random-token
```

3. Deploy to Vercel - cron jobs will run automatically

### Option 2: GitHub Actions

1. Create `.github/workflows/cron-jobs.yml`:

```yaml
name: Scheduled Cron Jobs

on:
  schedule:
    # Run daily at 9:00 AM UTC
    - cron: '0 9 * * *'
  workflow_dispatch: # Allow manual trigger

jobs:
  check-low-credits:
    runs-on: ubuntu-latest
    steps:
      - name: Call low credits check
        run: |
          curl -X GET \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://your-domain.com/api/cron/check-low-credits
```

2. Add `CRON_SECRET` to your GitHub repository secrets

### Option 3: External Cron Service (e.g., cron-job.org, EasyCron)

1. Sign up for a cron service
2. Create a new cron job with:
   - URL: `https://your-domain.com/api/cron/check-low-credits`
   - Method: GET
   - Header: `Authorization: Bearer YOUR_CRON_SECRET`
   - Schedule: `0 9 * * *` (daily at 9 AM)

### Option 4: Manual Testing

You can manually trigger the cron job for testing:

```bash
curl -X GET \
  -H "Authorization: Bearer your-cron-secret" \
  https://your-domain.com/api/cron/check-low-credits
```

## Environment Variables

Add these to your `.env.local` or deployment environment:

```bash
# Required for cron jobs
CRON_SECRET=your-secure-random-token-change-this

# Required for sending emails
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Your app URL
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Security

- **Always** use a strong, random `CRON_SECRET`
- Never commit secrets to version control
- Use environment variables for all sensitive data
- Consider IP whitelisting if your cron service supports it

## Monitoring

The cron endpoint returns a detailed JSON response:

```json
{
  "success": true,
  "message": "Credit check completed",
  "organizations_checked": 45,
  "warnings_sent": 3,
  "warnings": [
    {
      "organization": "Acme Corp",
      "creditType": "course",
      "balance": 5
    }
  ],
  "timestamp": "2024-01-19T09:00:00.000Z"
}
```

### Setting Up Monitoring

1. **Log the response** to track execution
2. **Set up alerts** if `warnings_sent` exceeds a threshold
3. **Monitor failures** via status code or error messages

Example with logging service:

```bash
curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/check-low-credits \
  | tee -a cron-logs/low-credits-$(date +%Y%m%d).log
```

## Troubleshooting

### Cron job returns 401 Unauthorized
- Check that `CRON_SECRET` environment variable is set correctly
- Verify the Authorization header is being sent

### Emails not sending
- Verify `RESEND_API_KEY` is set and valid
- Check that `RESEND_FROM_EMAIL` is verified in Resend
- Review logs for email sending errors

### Duplicate warnings
- The system prevents duplicates within 7 days
- Check the `credit_warnings` table to see recent warnings
- Adjust the 7-day window in the code if needed

### High execution time
- The job runs sequentially through all organizations
- Consider batching if you have 100+ organizations
- Monitor execution time via Vercel/deployment platform logs

## Database Maintenance

The `credit_warnings` table will grow over time. Consider archiving old records:

```sql
-- Archive warnings older than 90 days
DELETE FROM credit_warnings
WHERE sent_at < NOW() - INTERVAL '90 days';
```

Set up a monthly cleanup cron job if needed.

## Customization

### Changing Thresholds

Edit the thresholds in `app/api/cron/check-low-credits/route.ts`:

```typescript
const CREDIT_THRESHOLDS = {
  course: 10,      // Change this
  api: 100,        // Change this
  storage: 50,     // Change this
}
```

### Changing Warning Frequency

Change the 7-day window in the same file:

```typescript
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)  // Change -7 to desired days
```

### Adding More Cron Jobs

Follow the same pattern:

1. Create endpoint at `app/api/cron/your-job/route.ts`
2. Add authorization check with `CRON_SECRET`
3. Implement your logic
4. Add to your cron configuration
5. Test manually first

## Best Practices

1. **Test locally first** using manual curl requests
2. **Start with less frequent runs** (e.g., weekly) and increase as needed
3. **Monitor execution time** and optimize if needed
4. **Set up failure alerts** for critical cron jobs
5. **Document any custom cron jobs** you add
6. **Use descriptive response messages** for debugging
7. **Log all executions** for audit trail

## Additional Cron Jobs to Consider

Here are some useful cron jobs you might want to add:

1. **Expired Invitations Cleanup** - Daily
   - Remove expired organization invitations

2. **Credit Expiration** - Daily
   - Mark credits as expired based on expiration_date

3. **Usage Reports** - Weekly
   - Generate and email weekly usage reports to admins

4. **Inactive Organizations** - Monthly
   - Notify or archive organizations with no activity

5. **Database Cleanup** - Weekly
   - Clean up old logs, temporary data, etc.

Each of these follows the same pattern as the low credits check.
