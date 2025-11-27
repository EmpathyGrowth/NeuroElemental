# Production Deployment Checklist

## Pre-Deployment Verification

### Environment Variables
All required environment variables must be set. See `.env.example` for the complete list.

**Critical (Required):**
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)
- [ ] `STRIPE_SECRET_KEY` - Stripe API key
- [ ] `STRIPE_WEBHOOK_SECRET` - Webhook signature verification
- [ ] `CRON_SECRET` - Authentication for cron jobs

**Recommended:**
- [ ] `NEXT_PUBLIC_APP_URL` - Your production domain
- [ ] `RESEND_API_KEY` - Email delivery
- [ ] `SENTRY_DSN` - Error tracking

### Build Verification
```bash
npm run typecheck  # Should show 0 errors
npm run lint       # Should show 0 errors
npm run build      # Should complete successfully
```

### Security Headers
The following security headers are automatically applied via `next.config.js`:
- [x] Strict-Transport-Security (HSTS)
- [x] X-Content-Type-Options
- [x] X-Frame-Options
- [x] X-XSS-Protection
- [x] Referrer-Policy
- [x] Permissions-Policy
- [x] Content-Security-Policy

### Rate Limiting
Rate limiting is enforced via middleware:
- Public API: 30 requests/minute
- Auth endpoints: 5 requests/minute (brute force protection)
- Webhooks: 100 requests/minute
- General API: 60 requests/minute

### Health Checks
Configure your load balancer/monitoring with:
- **Liveness probe**: `GET /api/health/live` - Returns 200 if server is running
- **Readiness probe**: `GET /api/health` - Returns 200 if database is accessible

### Database
- [ ] Enable RLS on all tables (already configured)
- [ ] Verify connection pooling settings in Supabase dashboard
- [ ] Set up database backups

### Stripe Configuration
1. [ ] Create products and prices in Stripe Dashboard
2. [ ] Configure webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
3. [ ] Enable required webhook events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

### Monitoring
- [ ] Configure Sentry project and set `SENTRY_DSN`
- [ ] Set up uptime monitoring for `/api/health`
- [ ] Configure alerting for 5xx errors

### DNS & SSL
- [ ] Point domain to deployment
- [ ] Verify SSL certificate
- [ ] Test HTTPS redirect

### Cron Jobs
Configure cron jobs in your hosting provider (Vercel/AWS):
- `GET /api/cron/retry-webhooks` - Every minute
- `GET /api/cron/process-data-exports` - Every 5 minutes

All cron requests must include header: `x-cron-secret: YOUR_CRON_SECRET`

## Post-Deployment Verification

### Functional Tests
- [ ] User registration flow
- [ ] Login/logout
- [ ] Course enrollment
- [ ] Payment processing (use Stripe test mode first)
- [ ] Email delivery

### Security Tests
- [ ] Verify CSP headers in browser DevTools
- [ ] Test rate limiting with rapid requests
- [ ] Verify authentication on protected routes
- [ ] Check for exposed environment variables

### Performance Tests
- [ ] Run Lighthouse audit
- [ ] Test page load times
- [ ] Verify database query performance

## Rollback Plan
If issues are detected:
1. Revert to previous deployment
2. Check error logs in Sentry
3. Review recent database migrations
4. Verify environment variables haven't changed

## Support
For issues, check:
- Application logs in hosting dashboard
- Sentry error reports
- Supabase logs
- Stripe webhook logs
