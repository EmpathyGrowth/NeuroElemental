-- ============================================
-- COMPLETE DATABASE FIX - RUN THIS ONCE
-- This fixes all common issues and sets up everything
-- ============================================

-- ============================================
-- 1. FIX PROFILE TRIGGER
-- ============================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create improved trigger function with conflict handling
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

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 2. CREATE MISSING PROFILES FOR EXISTING USERS
-- ============================================

-- This creates profiles for any auth.users who don't have one
INSERT INTO profiles (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', 'User'),
  'registered'
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL;

-- ============================================
-- 3. MAKE YOUR USER AN ADMIN
-- ============================================

-- Find your email in the list and uncomment/edit this line:
-- UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';

-- Example (replace with YOUR email):
-- UPDATE profiles SET role = 'admin' WHERE email = 'jannik@example.com';

-- ============================================
-- 4. CREATE DATABASE HELPER FUNCTIONS
-- ============================================

-- Function to increment event registration spots
CREATE OR REPLACE FUNCTION increment_event_spots(event_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE events
  SET spots_taken = spots_taken + 1
  WHERE id = event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. SEED SAMPLE DATA (COURSES)
-- ============================================

-- Clear existing seed data (optional - comment out if you want to keep existing)
-- DELETE FROM course_enrollments;
-- DELETE FROM courses WHERE slug LIKE '%-%';

-- Insert sample courses
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
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 6. SEED SAMPLE DATA (EVENTS)
-- ============================================

-- Clear existing seed data (optional)
-- DELETE FROM event_registrations;
-- DELETE FROM events WHERE slug LIKE '%-%';

-- Insert sample events
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
)
ON CONFLICT (slug) DO NOTHING;

-- Update NYC event with location
UPDATE events
SET
  location_name = 'Manhattan Conference Center',
  location_address = '{"street": "123 Broadway", "city": "New York", "state": "NY", "zip": "10012", "country": "USA"}'::jsonb
WHERE slug = 'neuroelemental-intensive-nyc';

-- ============================================
-- 7. VERIFY EVERYTHING
-- ============================================

-- Check profiles were created
SELECT 'Profiles created:' as status, COUNT(*) as count FROM profiles;

-- Check courses were seeded
SELECT 'Courses seeded:' as status, COUNT(*) as count FROM courses;

-- Check events were seeded
SELECT 'Events seeded:' as status, COUNT(*) as count FROM events;

-- Show your profile
SELECT 'Your profile:' as status, email, role FROM profiles ORDER BY created_at DESC LIMIT 1;

-- ============================================
-- DONE! Your database is ready.
-- ============================================

-- Remember to:
-- 1. Uncomment line 49 and replace with YOUR email to make yourself admin
-- 2. Refresh your browser
-- 3. Login and enjoy your platform!
