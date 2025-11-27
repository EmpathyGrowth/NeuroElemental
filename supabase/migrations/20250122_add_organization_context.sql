/**
 * Add Organization Context to Existing Tables
 * Enables multi-tenant organization support for courses, events, and certificates
 */

-- ============================================
-- 1. ADD ORGANIZATION_ID TO EXISTING TABLES
-- ============================================

-- Add organization_id to course_enrollments
ALTER TABLE IF EXISTS public.course_enrollments
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_course_enrollments_organization_id
  ON public.course_enrollments(organization_id);

-- Add organization_id to certificates
ALTER TABLE IF EXISTS public.certificates
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_certificates_organization_id
  ON public.certificates(organization_id);

-- Add organization_id to events
ALTER TABLE IF EXISTS public.events
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_events_organization_id
  ON public.events(organization_id);

-- Add organization_id to event_registrations if it exists
ALTER TABLE IF EXISTS public.event_registrations
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_event_registrations_organization_id
  ON public.event_registrations(organization_id);

-- Add organization_id to quiz_attempts
ALTER TABLE IF EXISTS public.quiz_attempts
  ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_organization_id
  ON public.quiz_attempts(organization_id);

-- ============================================
-- 2. UPDATE RLS POLICIES FOR ORGANIZATION CONTEXT
-- ============================================

-- Drop existing policies and recreate with organization context

-- Course Enrollments: Users can see their own enrollments or org enrollments
DROP POLICY IF EXISTS "course_enrollments_select" ON public.course_enrollments;
CREATE POLICY "course_enrollments_select" ON public.course_enrollments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = course_enrollments.organization_id
    )
  );

-- Certificates: Users can see their own certificates or org certificates
DROP POLICY IF EXISTS "certificates_select" ON public.certificates;
CREATE POLICY "certificates_select" ON public.certificates
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = certificates.organization_id
    )
  );

-- Events: Public events or org events for members
DROP POLICY IF EXISTS "events_select" ON public.events;
CREATE POLICY "events_select" ON public.events
  FOR SELECT
  USING (
    organization_id IS NULL -- Public events
    OR
    EXISTS (
      SELECT 1 FROM public.organization_memberships om
      WHERE om.user_id = auth.uid()
        AND om.organization_id = events.organization_id
    )
  );

-- ============================================
-- 3. ADD HELPER FUNCTIONS
-- ============================================

-- Function to check if user is member of organization
CREATE OR REPLACE FUNCTION public.is_organization_member(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_memberships
    WHERE organization_id = org_id
      AND organization_memberships.user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin/owner of organization
CREATE OR REPLACE FUNCTION public.is_organization_admin(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.organization_memberships
    WHERE organization_id = org_id
      AND organization_memberships.user_id = user_id
      AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_id UUID)
RETURNS SETOF UUID AS $$
BEGIN
  RETURN QUERY
    SELECT organization_id
    FROM public.organization_memberships
    WHERE organization_memberships.user_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. ADD COMMENTS
-- ============================================

COMMENT ON COLUMN public.course_enrollments.organization_id IS
  'Organization context for enrollment. NULL for individual enrollments, populated for org enrollments using credits.';

COMMENT ON COLUMN public.certificates.organization_id IS
  'Organization that issued/sponsored this certificate. NULL for individual certificates.';

COMMENT ON COLUMN public.events.organization_id IS
  'Organization hosting this event. NULL for public events.';

-- ============================================
-- 5. MIGRATION COMPLETE
-- ============================================
