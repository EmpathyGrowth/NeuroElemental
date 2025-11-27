# NeuroElemental Setup Guide

**Complete guide for setting up and running your NeuroElemental platform**

Last Updated: 2025-11-23

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Supabase Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [OAuth Configuration](#oauth-configuration)
6. [Installation & Running](#installation--running)
7. [Testing the System](#testing-the-system)
8. [Quick Start Testing](#quick-start-testing)
9. [Navigation Map](#navigation-map)
10. [Troubleshooting](#troubleshooting)
11. [Development Workflow](#development-workflow)
12. [Security Checklist](#security-checklist)

---

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- Git installed

---

## Supabase Setup

### Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Project Name:** NeuroElemental
   - **Database Password:** (save this somewhere safe)
   - **Region:** Choose closest to your users
   - **Pricing Plan:** Free (sufficient for development)
5. Click "Create new project"
6. Wait 2-3 minutes for project to be ready

### Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** (gear icon) → **API**
2. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)
   - **service_role key** (another long string - keep this secret!)

---

## Environment Configuration

### Create Your .env.local File

```bash
# Copy the example file
cp .env.local.example .env.local
```

### Fill in Your Credentials

Open `.env.local` in your editor and replace the values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** The other variables (Stripe, Cloudflare, etc.) are for future phases. Leave them blank for now.

---

## Database Setup

### Option A: Using Supabase Dashboard (Easiest)

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste into the SQL editor
5. Click **Run**
6. Wait for "Success" message
7. Repeat for `002_rls_policies.sql`

### Option B: Using Supabase CLI (Recommended for production)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

**Finding your project-ref:**
- Go to Supabase dashboard → Settings → General
- Look for "Reference ID"

---

## OAuth Configuration

If you want Google/GitHub login to work:

### Google OAuth

1. In Supabase dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Enable "Google enabled"
4. Follow the instructions to:
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
5. Paste Client ID and Client Secret into Supabase
6. Click **Save**

### GitHub OAuth

1. Go to GitHub → Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** NeuroElemental
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `https://your-project.supabase.co/auth/v1/callback`
4. Click "Register application"
5. Copy Client ID and generate a Client Secret
6. In Supabase → Authentication → Providers → GitHub
7. Enable and paste credentials
8. Click **Save**

---

## Installation & Running

```bash
# Install all dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing the System

### Create Your First User

1. Navigate to [http://localhost:3000/auth/signup](http://localhost:3000/auth/signup)
2. Fill in the form:
   - Full name
   - Email
   - Password (min 8 characters)
3. Click "Create account"
4. You should see a success message and be redirected to `/dashboard`

### Verify User in Database

1. Go to Supabase dashboard → **Table Editor**
2. Click on **profiles** table
3. You should see your user with role `registered`

### Test Role-Based Access

**Make yourself an admin:**

1. In Supabase → Table Editor → profiles
2. Find your user
3. Click the `role` field
4. Change from `registered` to `admin`
5. Click the checkmark to save
6. Refresh your browser
7. You should be redirected to `/dashboard/admin`

**Test permissions:**

- Try accessing `/dashboard/student` (should work - admins can access all)
- Try accessing `/dashboard/instructor` (should work)
- Create another user and leave them as `registered`
- Login as that user and try `/dashboard/admin` (should redirect away)

### Test Password Reset

1. Go to [http://localhost:3000/auth/forgot-password](http://localhost:3000/auth/forgot-password)
2. Enter your email
3. Check your email inbox
4. Click the reset link (will redirect to your app)
5. Enter new password

---

## Quick Start Testing

### Test Different User Roles

**Make yourself Admin:**
```sql
-- Run in Supabase SQL Editor
UPDATE profiles
SET role = 'admin'
WHERE email = 'your@email.com';
```

Refresh browser → You'll see `/dashboard/admin` with full admin panel!

**Try Instructor Role:**
```sql
UPDATE profiles
SET role = 'instructor', instructor_status = 'approved'
WHERE email = 'your@email.com';
```

Refresh → See `/dashboard/instructor` with teaching resources!

**Try Student Role:**
```sql
UPDATE profiles
SET role = 'student'
WHERE email = 'your@email.com';
```

Refresh → See `/dashboard/student` with courses and certificates!

**Try Business Role:**
```sql
UPDATE profiles
SET role = 'business'
WHERE email = 'your@email.com';
```

Refresh → See `/dashboard/business` with organization features!

---

## Navigation Map

### Public Pages (Anyone Can Visit)
- **`/`** - Homepage with assessment
- **`/courses`** - Browse courses
- **`/courses/[slug]`** - Course detail pages
- **`/events`** - Browse events
- **`/events/[slug]`** - Event detail pages
- **`/framework`** - Framework explanation
- **`/elements`** - Element descriptions
- **`/assessment`** - Free assessment
- **`/results`** - Assessment results
- **`/certification`** - Instructor certification info
- **`/blog`** - Blog posts
- **`/about`** - About page
- **`/ethics`** - Ethics statement
- **`/privacy`** - Privacy policy
- **`/terms`** - Terms of service

### Authenticated Pages (Must Login)
- **`/dashboard`** - Your dashboard (routes by role)
- **`/dashboard/profile`** - Edit profile
- **`/dashboard/settings`** - Account settings

### Student Pages (role: student, instructor, or admin)
- **`/dashboard/student`** - Student dashboard
  - Courses enrolled
  - Certificates
  - Events registered
  - Progress tracking

### Instructor Pages (role: instructor or admin)
- **`/dashboard/instructor`** - Instructor dashboard
  - Certification status
  - Quick access to resources
  - Training progress
  - Community links
- **`/dashboard/instructor/resources`** - Teaching resources
  - Workshop materials (PDFs)
  - Training videos
  - Marketing materials
  - Community links

### Business Pages (role: business, school, or admin)
- **`/dashboard/business`** - Organization dashboard
  - Team overview
  - Diagnostic tools
  - Team management
  - Analytics

### Admin Pages (role: admin only)
- **`/dashboard/admin`** - Admin overview
  - Platform stats
  - Quick actions
  - Content management
- **`/dashboard/admin/courses`** - Course management
  - All courses table
  - Search and filter
  - Edit/delete courses
  - Revenue stats
- **`/dashboard/admin/events`** - Event management
  - All events table
  - Registration tracking
  - Event stats
- **`/dashboard/admin/users`** - User management
  - All users table
  - Role filtering
  - Change roles
  - Approve instructors

---

## Troubleshooting

### "Invalid API key" error

**Problem:** Environment variables not loaded

**Solution:**
```bash
# Make sure .env.local exists
ls -la .env.local

# Restart dev server
# Press Ctrl+C to stop
npm run dev
```

### "Failed to fetch" when trying to login

**Problem:** Supabase URL or key is incorrect

**Solution:**
1. Double-check `.env.local` values
2. Make sure you copied the **anon public key** (not service_role)
3. Verify URL doesn't have trailing slash

### Middleware redirecting incorrectly

**Problem:** Cookies not being set properly

**Solution:**
1. Clear browser cookies for localhost
2. Try incognito/private browsing mode
3. Check browser console for errors

### OAuth not working

**Problem:** Redirect URLs not configured

**Solution:**
1. Verify redirect URL in OAuth provider settings
2. Use format: `https://your-project.supabase.co/auth/v1/callback`
3. Wait a few minutes after saving (caching)

### Database migrations fail

**Problem:** SQL syntax error or missing dependencies

**Solution:**
1. Make sure you ran `001_initial_schema.sql` BEFORE `002_rls_policies.sql`
2. Check for any error messages in SQL editor
3. Try running migrations one section at a time

### Users can't access protected routes

**Problem:** RLS policies not applied

**Solution:**
1. Verify `002_rls_policies.sql` was run successfully
2. Check Supabase → Authentication → Policies
3. Make sure RLS is enabled on tables

---

## Development Workflow

### Daily Development

```bash
# Start dev server
npm run dev

# In another terminal, watch for type errors
npm run typecheck
```

### Before Committing

```bash
# Check for lint errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix

# Type check
npm run typecheck
```

### Useful Commands

```bash
# Generate types from Supabase
npx supabase gen types typescript --project-id your-project-id > lib/types/supabase.ts

# Create a new migration
supabase migration new migration_name

# Reset database (caution!)
supabase db reset
```

---

## Security Checklist

Before deploying to production:

- [ ] Change all default passwords
- [ ] Never commit `.env.local` to git
- [ ] Use service_role key only on server-side
- [ ] Enable RLS on all tables
- [ ] Test all permission scenarios
- [ ] Enable 2FA on Supabase account
- [ ] Set up SSL certificate (handled by Vercel automatically)
- [ ] Configure CORS properly
- [ ] Set up monitoring and alerts

---

## Next Steps

Once everything is working:

1. Review the platform architecture in `ARCHITECTURE.md`
2. Explore B2B features in `B2B_FEATURES.md`
3. Check billing integration in `BILLING.md`
4. Read the development guide in `DEVELOPMENT_GUIDE.md`
5. Customize the branding (colors, logo, copy)
6. Start implementing payment integration with Stripe
7. Set up course delivery with Cloudflare Stream

---

## Support

If you run into issues:

1. Check the error message carefully
2. Search Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
3. Check Next.js docs: [https://nextjs.org/docs](https://nextjs.org/docs)
4. Review the implementation files for examples

---

**You're all set!**

Your NeuroElemental platform is now running with:
- Authentication working
- Database connected
- All features built
- Ready to explore and customize
