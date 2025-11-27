# NeuroElemental Platform

**The first personality framework designed for neurodivergent brains, now with a complete multi-tenant platform for courses, events, and organizational diagnostics.**

---

## ✅ System Status

**Authentication:** ✅ Working
**Database:** ✅ Connected
**Migrations:** ✅ Run migrations 001, 002, 004
**Ready to use:** ✅ Yes!

---

## 🚀 Quick Start

Your Supabase credentials are already configured!

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

**Option A: Via Supabase Dashboard (Easiest)**

1. Open: https://supabase.com/dashboard/project/ieqvhgqubvfruqfjggqf/sql/new
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and click "Run"
4. Repeat for `002_rls_policies.sql`

**Option B: Via Supabase CLI**

```bash
npm install -g supabase
supabase login
supabase link --project-ref ieqvhgqubvfruqfjggqf
supabase db push
```

See **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** for detailed steps.

### 3. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 🎉

### 4. Create Your First Account

1. Go to: http://localhost:3000/auth/signup
2. Create an account
3. Access your dashboard at `/dashboard`

### 5. Make Yourself Admin (Optional)

1. Go to Supabase → Table Editor → profiles
2. Change your `role` from `registered` to `admin`
3. Refresh browser → redirected to `/dashboard/admin`

---

## 📋 What's Included

### ✅ Platform Features (COMPLETE)

**Core Infrastructure:**
- 🔐 Email/password authentication with OAuth (Google, GitHub)
- 👤 User profiles with role-based access (5 levels)
- 🛡️ Row-Level Security on all 30+ tables
- 🔒 Protected routes with middleware
- 📱 Responsive UI with dark mode

**Learning Management System:**
- 📚 Course creation CMS with modules and lessons
- 🎬 Video upload & streaming (Cloudflare Stream)
- 📊 Progress tracking and completion status
- 📝 Quiz system with assessments
- 🏆 Certificate generation
- 📧 Email notifications (Resend)

**E-commerce & Events:**
- 💳 Stripe checkout and subscriptions
- 🎫 Event management with capacity tracking
- 📅 Event calendar and registration

**B2B Features:**
- 🏢 Multi-organization support
- 👥 Team management with roles
- 💰 Credits system for API usage
- 🔑 API keys and webhooks
- 🔐 SSO (SAML, OAuth, OIDC)
- 📈 Analytics and audit logging

**Tech Stack:**
- Next.js 16 (App Router) | React 19 | TypeScript (strict)
- Supabase (Auth + Database + RLS)
- Tailwind CSS 4 | Radix UI components
- Stripe | Cloudflare (R2, Stream) | Resend

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for the complete technical architecture.

---

## 📁 Project Structure

```
app/
├── auth/                    # Authentication pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── forgot-password/    # Password reset
│   └── callback/           # OAuth callback
│
├── dashboard/              # Protected dashboards
│   ├── page.tsx           # Dashboard router
│   ├── student/           # Student dashboard
│   ├── instructor/        # Instructor dashboard
│   ├── business/          # Business dashboard
│   └── admin/             # Admin dashboard
│
├── assessment/            # Free assessment (existing)
├── results/              # Results page (existing)
└── [other pages]/        # Ethics, framework, etc.

components/
├── auth/                  # Auth components
│   ├── auth-provider.tsx # Global auth context
│   ├── login-form.tsx    # Login form
│   └── signup-form.tsx   # Signup form
└── ui/                   # Radix UI components

lib/
└── auth/
    └── supabase.ts       # Supabase client & functions

hooks/
├── use-user.ts           # User auth hook
└── use-role.ts           # Role permission hook

supabase/
└── migrations/           # Database migrations
    ├── 001_initial_schema.sql
    └── 002_rls_policies.sql
```

---

## 🔑 Environment Variables

Already configured in `.env`:

```bash
# Supabase (✅ Configured)
NEXT_PUBLIC_SUPABASE_URL=https://ieqvhgqubvfruqfjggqf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_key

# Future Phase Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=     # Phase 4
STRIPE_SECRET_KEY=                       # Phase 4
CLOUDFLARE_R2_ACCESS_KEY_ID=            # Phase 2
CLOUDFLARE_STREAM_API_TOKEN=            # Phase 2
RESEND_API_KEY=                         # Phase 2
```

---

## 🎯 User Roles & Permissions

### Role Hierarchy

```
Admin (full access)
  ├── Instructor (teaching + student features)
  ├── Business/School (team management)
  └── Student (course access)
      └── Registered (basic profile)
```

### What Each Role Can Do

**Registered (Free)**
- Take assessment
- Save results
- Access free resources

**Student (Paid)**
- Enroll in courses
- Track progress
- Earn certificates
- Register for events

**Instructor (Certified)**
- Access teaching resources
- Download materials
- Use branding assets
- Get listed in directory

**Business/School (Enterprise)**
- Team management
- Run diagnostics
- View team analytics
- Custom workshops

**Admin (Staff)**
- Full CMS access
- User management
- Content creation
- Analytics
- Approve certifications

---

## 🔐 Authentication Flow

```
User visits /dashboard
       ↓
   Middleware checks session
       ↓
   No session? → /auth/login
       ↓
   Login successful
       ↓
   Check user role
       ↓
   Route to appropriate dashboard
```

### Protected Routes

- `/dashboard` → All authenticated users
- `/dashboard/student` → Students, Instructors, Admins
- `/dashboard/instructor` → Instructors, Admins only
- `/dashboard/business` → Business/School, Admins
- `/dashboard/admin` → Admins only

---

## 🗄️ Database Schema

### Core Tables

**Users & Authentication**
- `profiles` - User profiles with roles
- `instructor_profiles` - Instructor data
- `organizations` - Business/school accounts
- `organization_members` - Team membership

**Learning Management**
- `courses` - Course catalog
- `course_modules` - Course sections
- `course_lessons` - Lesson content
- `course_enrollments` - Student enrollments
- `certificates` - Earned certificates

**Events & Commerce**
- `events` - Event calendar
- `event_registrations` - Event signups
- `products` - Product catalog
- `orders` - Purchase history

**Diagnostics & Content**
- `diagnostic_templates` - Assessment templates
- `instructor_resources` - Teaching materials
- `blog_posts` - Blog content

See `supabase/migrations/001_initial_schema.sql` for complete schema.

---

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript check
```

### Database Management

```bash
# Generate types from Supabase
npx supabase gen types typescript --project-id ieqvhgqubvfruqfjggqf > lib/types/supabase.ts

# Create new migration
supabase migration new migration_name

# Reset database (caution!)
supabase db reset
```

### Testing Authentication

1. **Create test user:**
   - Go to `/auth/signup`
   - Create account
   - Verify in Supabase → Table Editor → profiles

2. **Test role switching:**
   - Change role in Supabase
   - Refresh browser
   - Verify redirect to correct dashboard

3. **Test permissions:**
   - Try accessing admin routes as student
   - Verify redirect to appropriate dashboard

---

## 📚 Documentation

### 📖 Complete Documentation Hub
**[View Full Documentation →](./docs/README.md)**

The platform documentation is organized into focused areas. Key resources:

### Core Guides
- **[Platform Consolidation Plan ⭐](./docs/architecture/consolidation-plan.md)** - 10-phase standardization roadmap
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture and tech stack
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Development best practices
- **Last Updated:** 2025-11-27

---

## 🐛 Troubleshooting

### Authentication Issues

**Problem:** Can't login after creating account

**Solution:**
```bash
# Clear browser cookies
# Check .env has correct credentials
# Restart dev server
npm run dev
```

**Problem:** "Invalid API key" error

**Solution:**
```bash
# Verify .env file exists
cat .env

# Make sure values are correct
# Restart dev server
```

### Database Issues

**Problem:** Tables don't exist

**Solution:**
- Run migrations via Supabase SQL Editor
- See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

**Problem:** Permission denied errors

**Solution:**
- Verify RLS policies are applied (002_rls_policies.sql)
- Check user is logged in
- Clear cookies and try again

### Middleware Issues

**Problem:** Stuck in redirect loop

**Solution:**
- Clear browser cookies
- Check middleware.ts for correct role mappings
- Verify user has valid role in profiles table

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### Important: Update next.config.js

Before deploying, you need to **disable static export** in `next.config.js`:

```js
// Remove or comment out:
// output: 'export'

// The platform needs server-side features:
// - API routes (for webhooks)
// - Middleware (for authentication)
// - Dynamic rendering (for protected routes)
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change all default passwords
- [ ] Never commit `.env` to git (it's in .gitignore)
- [ ] Use service_role key only on server
- [ ] RLS enabled on all tables
- [ ] Test all permission scenarios
- [ ] Enable 2FA on Supabase account
- [ ] Set up SSL (automatic with Vercel)
- [ ] Configure CORS properly
- [ ] Set up monitoring

---

## 📈 What's Next?

### Getting Started

1. ✅ Run database migrations
2. ✅ Test authentication
3. ✅ Create your admin account
4. ✅ Explore all dashboards

### Current Focus: Production Readiness

The platform is **100% feature complete**. Current focus areas:

- **Performance optimization** - Bundle analysis and Core Web Vitals
- **Test coverage expansion** - Target 80%+ on critical paths
- **Documentation maintenance** - Keep guides up to date
- **Security audit** - Final security review before launch

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for detailed specifications and **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** for development standards.

---

## 🤝 Contributing

This is a private project, but if you have suggestions:

1. Review the architecture plan
2. Check Phase specifications
3. Ensure changes align with the roadmap
4. Test thoroughly before committing

---

## 📝 License

Private - All rights reserved

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [TypeScript](https://www.typescriptlang.org/)

---

## 📞 Support

**Quick Links:**
- Database: https://supabase.com/dashboard/project/ieqvhgqubvfruqfjggqf
- SQL Editor: https://supabase.com/dashboard/project/ieqvhgqubvfruqfjggqf/sql/new
- Table Editor: https://supabase.com/dashboard/project/ieqvhgqubvfruqfjggqf/editor

**Documentation:**
- Supabase: https://supabase.com/docs
- Next.js: https://nextjs.org/docs

---

**Ready to get started?** Run the migrations and start building! 🚀
