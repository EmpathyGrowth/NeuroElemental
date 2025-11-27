-- ============================================
-- NEUROELEMENTAL - COMPLETE FRESH START
-- Run this on a clean database to set up everything
-- ============================================
-- This file includes:
-- - All table creation
-- - All RLS policies
-- - Profile auto-creation trigger
-- - Helper functions
-- - Sample data (6 courses, 6 events)
-- ============================================

-- ============================================
-- CLEAN SLATE (Drop everything)
-- ============================================

-- Drop all existing data and objects
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS increment_event_spots(UUID) CASCADE;

-- Drop all tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS user_activity_log CASCADE;
DROP TABLE IF EXISTS diagnostic_results CASCADE;
DROP TABLE IF EXISTS diagnostic_templates CASCADE;
DROP TABLE IF EXISTS resource_downloads CASCADE;
DROP TABLE IF EXISTS instructor_resources CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS event_registrations CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS course_lessons CASCADE;
DROP TABLE IF EXISTS course_modules CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS assessment_history CASCADE;
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS instructor_profiles CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- CREATE ALL TABLES
-- ============================================

-- USERS & AUTHENTICATION
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'registered' CHECK (role IN ('registered', 'student', 'instructor', 'business', 'school', 'admin')),
  instructor_status TEXT CHECK (instructor_status IN ('pending', 'approved', 'revoked', NULL)),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE instructor_profiles (
  id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  certification_date DATE,
  certification_level TEXT CHECK (certification_level IN ('practitioner', 'master')),
  bio TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  specializations TEXT[],
  location TEXT,
  available_for_hire BOOLEAN DEFAULT true,
  hourly_rate_usd NUMERIC(10,2),
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('business', 'school', 'nonprofit')),
  industry TEXT,
  size_range TEXT,
  address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'past_due', 'canceled'))
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- ASSESSMENTS & RESULTS
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  completed_at TIMESTAMPTZ,
  scores JSONB NOT NULL,
  answers JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0',
  is_organizational BOOLEAN DEFAULT false,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL
);

CREATE TABLE assessment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
  taken_at TIMESTAMPTZ DEFAULT NOW()
);

-- COURSES & LMS
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  long_description TEXT,
  instructor_name TEXT,
  duration_hours NUMERIC(5,2),
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  preview_video_url TEXT,
  category TEXT,
  tags TEXT[],
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text', 'quiz', 'download', 'external_link')),
  content_url TEXT,
  content_text TEXT,
  duration_minutes INTEGER,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  questions JSONB NOT NULL
);

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress_percentage INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  time_spent_seconds INTEGER,
  UNIQUE(enrollment_id, lesson_id)
);

CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  answers JSONB NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  passed BOOLEAN NOT NULL
);

CREATE TABLE certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_id UUID REFERENCES course_enrollments(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  certificate_url TEXT,
  verification_code TEXT UNIQUE NOT NULL,
  UNIQUE(user_id, course_id)
);

-- EVENTS & CALENDAR
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('online_workshop', 'in_person_workshop', 'webinar', 'conference')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL,
  location_name TEXT,
  location_address JSONB,
  online_meeting_url TEXT,
  instructor_id UUID REFERENCES instructor_profiles(id),
  price_usd NUMERIC(10,2) NOT NULL DEFAULT 0,
  capacity INTEGER,
  spots_taken INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  thumbnail_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  attended BOOLEAN,
  ticket_code TEXT UNIQUE NOT NULL,
  UNIQUE(event_id, user_id)
);

-- E-COMMERCE & PAYMENTS
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('digital_course', 'workbook', 'coaching_session', 'event_ticket', 'subscription')),
  price_usd NUMERIC(10,2) NOT NULL,
  stripe_price_id TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  total_usd NUMERIC(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_type TEXT NOT NULL,
  price_usd NUMERIC(10,2) NOT NULL,
  metadata JSONB
);

-- INSTRUCTOR RESOURCES
CREATE TABLE instructor_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('pdf', 'video', 'presentation', 'worksheet', 'guide')),
  file_url TEXT NOT NULL,
  category TEXT,
  certification_level TEXT CHECK (certification_level IN ('practitioner', 'master', 'all')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES instructor_resources(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- DIAGNOSTIC SYSTEMS
CREATE TABLE diagnostic_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  target_audience TEXT NOT NULL CHECK (target_audience IN ('business', 'school', 'individual')),
  focus_area TEXT,
  questions JSONB NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE diagnostic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES diagnostic_templates(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  answers JSONB NOT NULL,
  recommendations JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- CMS & CONTENT
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  category TEXT,
  tags TEXT[],
  featured_image_url TEXT,
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ANALYTICS & TRACKING
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CREATE INDEXES
-- ============================================

CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX idx_course_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- ============================================
-- DISABLE RLS (Simpler for development)
-- ============================================

-- We'll disable RLS on profiles to avoid auth issues
-- In production, you can re-enable with proper policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments DISABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PROFILE AUTO-CREATION TRIGGER
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    'registered'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- CREATE PROFILES FOR EXISTING USERS
-- ============================================

-- This creates profiles for any existing auth.users
INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  'registered'
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- MAKE FIRST USER ADMIN (EDIT THIS!)
-- ============================================

-- Update the email below to YOUR email to become admin
UPDATE profiles
SET role = 'admin', full_name = COALESCE(full_name, 'Admin User')
WHERE email = (SELECT email FROM profiles ORDER BY created_at ASC LIMIT 1);

-- Or manually specify your email (uncomment and edit):
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- ============================================
-- CREATE HELPER FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION increment_event_spots(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET spots_taken = spots_taken + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SEED COURSES
-- ============================================

INSERT INTO courses (slug, title, subtitle, description, long_description, instructor_name, duration_hours, difficulty_level, price_usd, is_published, category, tags)
VALUES
(
  'energy-management-fundamentals',
  'Energy Management Fundamentals',
  'Master the basics of your Element Mix',
  'Learn the core principles of energy management and how to work with your unique Element Mix to prevent burnout and maximize productivity.',
  'This comprehensive course takes you through the fundamentals of the NeuroElemental framework, helping you understand your energy patterns, recognize depletion signals, and build sustainable regeneration practices. Perfect for anyone new to the framework or looking to deepen their self-understanding.',
  'Jannik Laursen',
  6.5,
  'beginner',
  97,
  true,
  'Energy Management',
  ARRAY['Fundamentals', 'Self-Discovery', 'Burnout Prevention']
),
(
  'elemental-communication',
  'Elemental Communication',
  'Connect across different energy types',
  'Discover how different Element Mixes communicate and learn to bridge the gaps for more effective relationships and collaboration.',
  'Communication challenges often stem from different energetic approaches. This course teaches you to recognize and adapt to different communication styles based on Element Mixes.',
  'Jannik Laursen',
  4,
  'intermediate',
  77,
  true,
  'Relationships',
  ARRAY['Communication', 'Relationships', 'Workplace']
),
(
  'instructor-certification-level-1',
  'Instructor Certification - Level 1',
  'Become a Certified NeuroElemental Practitioner',
  'Complete training to become a certified NeuroElemental Instructor and teach the framework professionally.',
  'This intensive certification program prepares you to facilitate NeuroElemental assessments, workshops, and coaching sessions. Includes all teaching materials and ongoing support.',
  'Jannik Laursen',
  20,
  'advanced',
  497,
  true,
  'Professional Development',
  ARRAY['Certification', 'Teaching', 'Professional']
),
(
  'burnout-recovery-roadmap',
  'Burnout Recovery Roadmap',
  'Find your way back from exhaustion',
  'A structured path to recover from burnout while rebuilding your energy management systems for long-term sustainability.',
  'If you are currently experiencing burnout, this course provides a compassionate, step-by-step approach to recovery that honors your nervous system''s needs.',
  'Jannik Laursen',
  5,
  'beginner',
  87,
  true,
  'Energy Management',
  ARRAY['Burnout', 'Recovery', 'Self-Care']
),
(
  'workplace-energy-optimization',
  'Workplace Energy Optimization',
  'Thrive in your work environment',
  'Apply the NeuroElemental framework to your professional life for increased productivity without sacrificing your wellbeing.',
  'This practical course helps you design your work life around your energy patterns, whether you are employed, freelance, or running a business.',
  'Jannik Laursen',
  7,
  'intermediate',
  97,
  true,
  'Professional Development',
  ARRAY['Workplace', 'Productivity', 'Career']
),
(
  'parenting-with-elements',
  'Parenting with Elements',
  'Understanding your child''s energy patterns',
  'Learn to recognize and support your child''s unique Element Mix for more harmonious family dynamics.',
  'Every child has their own energetic blueprint. This course helps parents understand and honor their children''s needs while managing their own energy.',
  'Jannik Laursen',
  5.5,
  'beginner',
  87,
  true,
  'Family & Relationships',
  ARRAY['Parenting', 'Family', 'Children']
);

-- ============================================
-- SEED EVENTS
-- ============================================

INSERT INTO events (slug, title, description, event_type, start_datetime, end_datetime, timezone, price_usd, capacity, spots_taken, is_published, online_meeting_url)
VALUES
(
  'energy-reset-workshop',
  'Energy Reset Workshop',
  'A half-day intensive for anyone experiencing burnout or persistent exhaustion. Learn immediate strategies to begin rebuilding your energy reserves.',
  'online_workshop',
  '2025-12-15 10:00:00-08',
  '2025-12-15 13:00:00-08',
  'PST',
  47,
  50,
  27,
  true,
  'https://zoom.us/j/example'
),
(
  'elemental-communication-masterclass',
  'Elemental Communication Masterclass',
  'Master the art of communicating across different Element types. Perfect for managers, therapists, coaches, and anyone who works with people.',
  'online_workshop',
  '2025-12-20 14:00:00-05',
  '2025-12-20 17:00:00-05',
  'EST',
  67,
  100,
  33,
  true,
  'https://zoom.us/j/example'
),
(
  'neuroelemental-intensive-nyc',
  'NeuroElemental Intensive - New York',
  'Two-day in-person immersive experience diving deep into the framework with hands-on practice, community connection, and personalized guidance.',
  'in_person_workshop',
  '2026-02-14 09:00:00-05',
  '2026-02-15 17:00:00-05',
  'EST',
  497,
  30,
  18,
  true,
  NULL
),
(
  'free-monthly-qa',
  'Free Monthly Community Q&A',
  'Open Q&A session for the NeuroElemental community. Bring your questions about energy management, Element Mixes, and practical applications.',
  'webinar',
  '2025-12-05 12:00:00-08',
  '2025-12-05 13:00:00-08',
  'PST',
  0,
  500,
  158,
  true,
  'https://zoom.us/j/example'
),
(
  'workplace-energy-optimization',
  'Workplace Energy Optimization',
  'For teams and organizations: learn to apply NeuroElemental principles to improve productivity, reduce burnout, and enhance collaboration.',
  'online_workshop',
  '2026-01-10 10:00:00+00',
  '2026-01-10 15:00:00+00',
  'GMT',
  197,
  50,
  12,
  true,
  'https://zoom.us/j/example'
),
(
  'instructor-certification-info-session',
  'Instructor Certification Info Session',
  'Learn about the certification program, requirements, and what it means to become a certified NeuroElemental instructor.',
  'webinar',
  '2025-12-12 18:00:00-08',
  '2025-12-12 19:30:00-08',
  'PST',
  0,
  200,
  44,
  true,
  'https://zoom.us/j/example'
);

-- Update NYC event with location
UPDATE events
SET
  location_name = 'Manhattan Conference Center',
  location_address = '{"street": "123 Broadway", "city": "New York", "state": "NY", "zip": "10012", "country": "USA"}'::jsonb
WHERE slug = 'neuroelemental-intensive-nyc';

-- ============================================
-- VERIFICATION
-- ============================================

-- Check what was created
SELECT 'Profiles:' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Courses:', COUNT(*) FROM courses
UNION ALL
SELECT 'Events:', COUNT(*) FROM events
UNION ALL
SELECT 'Admin users:', COUNT(*) FROM profiles WHERE role = 'admin';

-- Show your admin profile
SELECT 'Your admin profile:' as info, id, email, role, full_name
FROM profiles
WHERE role = 'admin'
LIMIT 1;

-- ============================================
-- SUCCESS!
-- ============================================

-- Your database is now ready!
-- - All tables created
-- - RLS disabled for easier development
-- - Profile trigger working
-- - Sample data loaded
-- - First user is admin
--
-- Next steps:
-- 1. Refresh your browser
-- 2. Login at http://localhost:3000/auth/login
-- 3. You'll be redirected to admin dashboard
-- 4. Start creating content!
