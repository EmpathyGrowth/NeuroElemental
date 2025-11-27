# Database Setup Guide

**Complete guide for setting up and managing the NeuroElemental database**

Last Updated: 2025-11-23

---

## Table of Contents

1. [Overview](#overview)
2. [Running Migrations](#running-migrations)
3. [Seeding Sample Data](#seeding-sample-data)
4. [Verification](#verification)
5. [Database Schema](#database-schema)
6. [Troubleshooting](#troubleshooting)
7. [Database Maintenance](#database-maintenance)

---

## Overview

The NeuroElemental database consists of:
- **30+ tables** for all platform features
- **Row-Level Security (RLS)** policies for data protection
- **Sample data** for courses, events, and users
- **Functions and triggers** for automation

---

## Running Migrations

### Option 1: Using Supabase Dashboard (Recommended)

This is the easiest and most reliable method.

#### Step 1: Open Supabase SQL Editor

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** (left sidebar)
3. Click **"New Query"**

Or use direct link: `https://supabase.com/dashboard/project/YOUR-PROJECT-ID/sql/new`

#### Step 2: Run Migration 001 - Initial Schema

1. Click **"New Query"** in the SQL Editor
2. Open the file: `supabase/migrations/001_initial_schema.sql`
3. **Copy all the contents** (it's a large file with ~400 lines)
4. **Paste** into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for the success message: "Success. No rows returned"

This creates all 30+ tables including:
- `profiles` - User profiles and roles
- `assessments` - User assessments and results
- `courses` - Course catalog
- `course_modules` - Course module structure
- `course_lessons` - Individual lessons
- `course_enrollments` - Student enrollments
- `events` - Event calendar
- `event_registrations` - Event registrations
- `orders` - Payment transactions
- `instructor_resources` - Teaching materials
- `diagnostic_templates` - B2B diagnostic tools
- And more...

#### Step 3: Run Migration 002 - Security Policies

1. Click **"New Query"** again
2. Open the file: `supabase/migrations/002_rls_policies.sql`
3. **Copy all the contents**
4. **Paste** into the SQL Editor
5. Click **"Run"**
6. Wait for success message

This enables Row-Level Security and creates all the permission policies for:
- User authentication
- Role-based access control
- Data privacy and isolation
- API security

#### Step 4: Verify Tables Were Created

1. In Supabase dashboard, go to **Table Editor** (left sidebar)
2. You should see all the tables listed
3. Click on a few tables to verify they exist:
   - `profiles`
   - `courses`
   - `events`
   - `assessments`

**You're done with migrations!**

---

### Option 2: Using Supabase CLI (Alternative)

If you prefer command-line tools:

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR-PROJECT-REF

# Run migrations
supabase db push
```

**Finding your project-ref:**
- Go to Supabase dashboard → Settings → General
- Look for "Reference ID"

---

## Seeding Sample Data

After running migrations, populate the database with sample data.

### Step 1: Open SQL Editor

Navigate to: **SQL Editor** → **New Query**

### Step 2: Run the Seed Script

1. Open the file: `supabase/seed.sql`
2. **Copy everything** from the file
3. **Paste** into the SQL Editor
4. Click **"Run"**
5. Should see: "Success. 6 rows returned" (or similar)

### Step 3: Verify Data Was Seeded

**Check Courses:**
1. Go to **Table Editor** → **courses** table
2. Should see 6 courses:
   - Energy Management Fundamentals ($97)
   - Elemental Communication ($77)
   - Instructor Certification Level 1 ($497)
   - Burnout Recovery Roadmap ($87)
   - Workplace Energy Optimization ($97)
   - Parenting with Elements ($87)

**Check Events:**
1. Go to **Table Editor** → **events** table
2. Should see 6 events:
   - Energy Reset Workshop ($47)
   - Communication Masterclass ($67)
   - NYC In-Person Intensive ($497)
   - Free Monthly Q&A (FREE)
   - Workplace Workshop ($197)
   - Certification Info Session (FREE)

---

## Verification

### Test Your Setup

#### 1. Create Your First User

1. Start your development server: `npm run dev`
2. Go to: `http://localhost:3000/auth/signup`
3. Fill in the form:
   - **Full Name:** Your name
   - **Email:** your@email.com
   - **Password:** (at least 8 characters)
4. Click **"Create account"**
5. You should see a success message and be redirected to `/dashboard`

#### 2. Verify in Database

1. Go to Supabase → **Table Editor** → **profiles**
2. You should see your user with:
   - `email`: your@email.com
   - `full_name`: Your name
   - `role`: registered

#### 3. Make Yourself an Admin

1. In Supabase **Table Editor** → **profiles**
2. Click on the `role` field for your user
3. Change from `registered` to `admin`
4. Click the checkmark to save
5. Refresh your browser
6. You'll be redirected to `/dashboard/admin`

Now you have full admin access!

#### 4. Test Data Access

1. **Visit courses page:** `http://localhost:3000/courses`
   - Should display the 6 seeded courses

2. **Visit events page:** `http://localhost:3000/events`
   - Should display the 6 seeded events

3. **Visit admin panel:** `http://localhost:3000/dashboard/admin/courses`
   - Should show course management interface with real data

---

## Database Schema

### Core Tables

#### User Management
- `profiles` - User profiles, roles, and metadata
- `user_settings` - User preferences and configurations
- `notifications` - User notifications

#### Learning Management
- `courses` - Course catalog
- `course_modules` - Course modules/chapters
- `course_lessons` - Individual lessons
- `course_resources` - Downloadable resources
- `course_enrollments` - Student enrollments
- `lesson_progress` - Lesson completion tracking
- `course_reviews` - Course ratings and reviews

#### Events & Webinars
- `events` - Event calendar
- `event_registrations` - Event registrations
- `webinars` - Webinar sessions

#### Assessments
- `assessments` - Assessment definitions
- `assessment_responses` - User responses
- `assessment_results` - Calculated results
- `certificates` - Generated certificates

#### Commerce
- `orders` - Payment transactions
- `subscriptions` - Subscription management
- `coupons` - Discount codes

#### Instructor Features
- `instructor_applications` - Certification applications
- `instructor_resources` - Teaching materials
- `instructor_earnings` - Revenue tracking

#### B2B Features
- `organizations` - Company accounts
- `teams` - Organization teams
- `team_members` - Team membership
- `diagnostic_templates` - Assessment templates
- `diagnostic_sessions` - Team assessments
- `team_reports` - Analytics reports

---

## Troubleshooting

### "relation does not exist" error

**Problem:** Tables not created yet

**Solution:** Run the migrations using Option 1 above

### "permission denied" error

**Problem:** RLS policies blocking access

**Solution:**
1. Make sure you ran `002_rls_policies.sql`
2. Check that you're logged in
3. Try clearing cookies and logging in again
4. Verify RLS is enabled: **Authentication** → **Policies**

### Migration SQL errors

**Problem:** Syntax error in SQL

**Solution:**
1. Make sure you copied the ENTIRE file
2. Run migrations in order (001, then 002)
3. Check for any error messages and look for line numbers
4. Verify you're using the correct Supabase project

### Can't access protected routes

**Problem:** Authentication not working

**Solution:**
1. Clear browser cookies for localhost
2. Make sure `.env.local` file has correct credentials
3. Restart dev server: `Ctrl+C`, then `npm run dev`
4. Check middleware configuration

### Seed data not appearing

**Problem:** Data not inserted

**Solution:**
1. Check SQL Editor for error messages
2. Make sure migrations ran successfully first
3. Verify tables exist in Table Editor
4. Try re-running the seed script

---

## Database Maintenance

### Re-seeding the Database

If you need to clear and re-seed the database:

```sql
-- Clear existing data first (run in SQL Editor)
DELETE FROM course_enrollments;
DELETE FROM event_registrations;
DELETE FROM course_reviews;
DELETE FROM lesson_progress;
DELETE FROM courses;
DELETE FROM events;

-- Then run seed.sql again
```

### Resetting the Database

**Warning:** This will delete ALL data!

```bash
# Using Supabase CLI
supabase db reset
```

Or manually in SQL Editor:

```sql
-- Drop all tables (careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

-- Then re-run migrations 001 and 002
```

### Backing Up Data

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Restore from backup
supabase db push --db-url "your-database-url" < backup.sql
```

### Updating Schema

To make schema changes:

1. Create a new migration file:
```bash
supabase migration new your_migration_name
```

2. Write your SQL changes in the new migration file

3. Test locally:
```bash
supabase db reset  # Resets and runs all migrations
```

4. Push to production:
```bash
supabase db push
```

### Generating TypeScript Types

Keep your TypeScript types in sync with the database:

```bash
# Generate types
npx supabase gen types typescript --project-id YOUR-PROJECT-ID > lib/types/supabase.ts
```

Run this command whenever you update the database schema.

---

## Next Steps

After completing database setup:

1. Your database is fully configured
2. Sample data is loaded
3. Security policies are enabled
4. Ready to start developing features

**What's Next:**
- Review the API documentation
- Set up Stripe for payments
- Configure Cloudflare Stream for videos
- Start building custom features

---

## Support

If you encounter any issues:

1. Check the error message in the browser console (F12)
2. Check the error in Supabase SQL Editor
3. Review the migration files for any typos
4. Make sure all environment variables are set correctly
5. Check Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)

---

**Database setup complete!** Your NeuroElemental platform is ready for development.
