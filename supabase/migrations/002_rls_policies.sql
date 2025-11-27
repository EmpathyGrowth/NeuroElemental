-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- Migration: 002_rls_policies
-- Created: 2025-11-20
-- ============================================

-- ============================================
-- PROFILES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ASSESSMENTS
-- ============================================

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Users can view their own assessments
CREATE POLICY "Users can view their own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create assessments
CREATE POLICY "Users can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Organization admins can view their org assessments
CREATE POLICY "Org admins can view org assessments"
  ON assessments FOR SELECT
  USING (
    is_organizational = true AND
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COURSES
-- ============================================

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Anyone can view published courses
CREATE POLICY "Anyone can view published courses"
  ON courses FOR SELECT
  USING (is_published = true);

-- Admins can view all courses
CREATE POLICY "Admins can view all courses"
  ON courses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can create/update/delete courses
CREATE POLICY "Admins can manage courses"
  ON courses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- COURSE ENROLLMENTS
-- ============================================

ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;

-- Users can view their own enrollments
CREATE POLICY "Users can view their own enrollments"
  ON course_enrollments FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create enrollments (after payment)
CREATE POLICY "Users can create enrollments"
  ON course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own enrollments (progress)
CREATE POLICY "Users can update their own enrollments"
  ON course_enrollments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all enrollments
CREATE POLICY "Admins can view all enrollments"
  ON course_enrollments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EVENTS
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Anyone can view published events
CREATE POLICY "Anyone can view published events"
  ON events FOR SELECT
  USING (is_published = true);

-- Admins can manage all events
CREATE POLICY "Admins can manage events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Users can view their own registrations
CREATE POLICY "Users can view their own registrations"
  ON event_registrations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create registrations
CREATE POLICY "Users can create registrations"
  ON event_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all registrations
CREATE POLICY "Admins can view all registrations"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ORDERS
-- ============================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- INSTRUCTOR RESOURCES
-- ============================================

ALTER TABLE instructor_resources ENABLE ROW LEVEL SECURITY;

-- Instructors can view resources
CREATE POLICY "Instructors can view resources"
  ON instructor_resources FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('instructor', 'admin')
    )
  );

-- Admins can manage resources
CREATE POLICY "Admins can manage resources"
  ON instructor_resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- ORGANIZATIONS
-- ============================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Org members can view their organization
CREATE POLICY "Members can view their organization"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

-- Org owners can update their organization
CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  USING (auth.uid() = owner_id);

-- Admins can view all organizations
CREATE POLICY "Admins can view all organizations"
  ON organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- CERTIFICATES
-- ============================================

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Users can view their own certificates
CREATE POLICY "Users can view their own certificates"
  ON certificates FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can verify certificates by code (for employer verification)
CREATE POLICY "Anyone can verify certificates"
  ON certificates FOR SELECT
  USING (true);

-- ============================================
-- BLOG POSTS
-- ============================================

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
  ON blog_posts FOR SELECT
  USING (is_published = true);

-- Admins can manage all posts
CREATE POLICY "Admins can manage posts"
  ON blog_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
