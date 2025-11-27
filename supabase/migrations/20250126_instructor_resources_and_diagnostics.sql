-- ============================================================================
-- Migration: Instructor Resources & Business Diagnostics Tables
-- Created: 2025-01-26
-- Description: Adds tables for instructor teaching resources and business
--              diagnostic tools to replace hardcoded mock data
-- ============================================================================

-- ============================================================================
-- INSTRUCTOR RESOURCES
-- Teaching materials, videos, and marketing assets for certified instructors
-- ============================================================================

-- Resource categories enum
CREATE TYPE instructor_resource_category AS ENUM (
  'workshop_materials',
  'training_videos',
  'marketing',
  'community',
  'templates',
  'guides'
);

-- Resource type enum
CREATE TYPE instructor_resource_type AS ENUM (
  'pdf',
  'video',
  'presentation',
  'image',
  'link',
  'document',
  'audio'
);

-- Certification level required to access resource
CREATE TYPE certification_level AS ENUM (
  'practitioner',
  'instructor',
  'all'
);

-- Instructor resources table
CREATE TABLE IF NOT EXISTS instructor_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category instructor_resource_category NOT NULL,
  type instructor_resource_type NOT NULL,
  cert_level certification_level NOT NULL DEFAULT 'practitioner',

  -- File/link information
  file_url TEXT,
  file_path TEXT,
  file_size_bytes BIGINT,
  duration_seconds INTEGER, -- For videos/audio
  external_url TEXT, -- For link type resources

  -- Metadata
  thumbnail_url TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,

  -- Tracking
  download_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Resource downloads tracking
CREATE TABLE IF NOT EXISTS instructor_resource_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES instructor_resources(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  downloaded_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address VARCHAR(45),
  user_agent TEXT,

  UNIQUE(resource_id, user_id, downloaded_at)
);

-- ============================================================================
-- BUSINESS DIAGNOSTICS
-- Team assessment and diagnostic tools for organizations
-- ============================================================================

-- Diagnostic types enum
CREATE TYPE diagnostic_type AS ENUM (
  'leadership',
  'communication',
  'conflict_resolution',
  'motivation_engagement',
  'sales_optimization',
  'team_composition',
  'custom'
);

-- Diagnostic status enum
CREATE TYPE diagnostic_status AS ENUM (
  'draft',
  'active',
  'in_progress',
  'completed',
  'archived'
);

-- Diagnostic templates (admin-defined diagnostic types)
CREATE TABLE IF NOT EXISTS diagnostic_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type diagnostic_type NOT NULL,

  -- Configuration
  questions JSONB NOT NULL DEFAULT '[]',
  scoring_config JSONB DEFAULT '{}',
  report_template JSONB DEFAULT '{}',

  -- Settings
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT true, -- System templates can't be deleted
  min_participants INTEGER DEFAULT 1,
  max_participants INTEGER,
  estimated_time_minutes INTEGER DEFAULT 15,

  -- Metadata
  icon VARCHAR(50),
  color VARCHAR(20),
  tags TEXT[] DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Organization diagnostic runs (instances of running a diagnostic)
CREATE TABLE IF NOT EXISTS organization_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES diagnostic_templates(id) ON DELETE RESTRICT,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  status diagnostic_status DEFAULT 'draft',

  -- Configuration
  target_user_ids UUID[] DEFAULT '{}', -- Specific users to include
  target_department VARCHAR(255), -- Or filter by department
  include_all_members BOOLEAN DEFAULT false,
  anonymous_results BOOLEAN DEFAULT false,

  -- Progress tracking
  total_participants INTEGER DEFAULT 0,
  completed_participants INTEGER DEFAULT 0,

  -- Results (aggregated)
  results JSONB DEFAULT '{}',
  insights JSONB DEFAULT '[]',

  -- Timing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  deadline_at TIMESTAMPTZ,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Individual diagnostic responses
CREATE TABLE IF NOT EXISTS diagnostic_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnostic_id UUID NOT NULL REFERENCES organization_diagnostics(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Response data
  answers JSONB NOT NULL DEFAULT '{}',
  scores JSONB DEFAULT '{}',

  -- Status
  is_complete BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  time_spent_seconds INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(diagnostic_id, user_id)
);

-- ============================================================================
-- CERTIFICATION APPLICATIONS
-- Track instructor certification applications and approvals
-- ============================================================================

-- Application status
CREATE TYPE certification_application_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'waitlist'
);

-- Certification applications table
CREATE TABLE IF NOT EXISTS certification_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Application details
  certification_level certification_level NOT NULL DEFAULT 'practitioner',
  status certification_application_status DEFAULT 'pending',

  -- Applicant information
  professional_background TEXT,
  motivation TEXT,
  experience_years INTEGER,
  specializations TEXT[] DEFAULT '{}',
  certifications_held TEXT[] DEFAULT '{}',
  linkedin_url TEXT,
  website_url TEXT,

  -- Review process
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  rejection_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, certification_level)
);

-- ============================================================================
-- PRICING PLANS
-- Centralized pricing configuration for courses, events, and subscriptions
-- ============================================================================

CREATE TYPE pricing_tier AS ENUM (
  'free',
  'basic',
  'professional',
  'enterprise'
);

CREATE TYPE pricing_type AS ENUM (
  'one_time',
  'subscription_monthly',
  'subscription_yearly',
  'per_seat'
);

CREATE TABLE IF NOT EXISTS pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tier pricing_tier NOT NULL,
  type pricing_type NOT NULL DEFAULT 'one_time',

  -- Pricing
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',

  -- For per-seat pricing
  price_per_seat_cents INTEGER,
  min_seats INTEGER DEFAULT 1,
  max_seats INTEGER,

  -- Features included
  features JSONB DEFAULT '[]',
  limits JSONB DEFAULT '{}', -- e.g., { "assessments": 100, "team_members": 10 }

  -- Display
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  badge_text VARCHAR(50), -- e.g., "Most Popular", "Best Value"

  -- Stripe integration
  stripe_price_id VARCHAR(255),
  stripe_product_id VARCHAR(255),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Instructor resources
CREATE INDEX idx_instructor_resources_category ON instructor_resources(category);
CREATE INDEX idx_instructor_resources_type ON instructor_resources(type);
CREATE INDEX idx_instructor_resources_cert_level ON instructor_resources(cert_level);
CREATE INDEX idx_instructor_resources_active ON instructor_resources(is_active);
CREATE INDEX idx_instructor_resource_downloads_resource ON instructor_resource_downloads(resource_id);
CREATE INDEX idx_instructor_resource_downloads_user ON instructor_resource_downloads(user_id);

-- Diagnostics
CREATE INDEX idx_diagnostic_templates_type ON diagnostic_templates(type);
CREATE INDEX idx_diagnostic_templates_active ON diagnostic_templates(is_active);
CREATE INDEX idx_organization_diagnostics_org ON organization_diagnostics(organization_id);
CREATE INDEX idx_organization_diagnostics_status ON organization_diagnostics(status);
CREATE INDEX idx_diagnostic_responses_diagnostic ON diagnostic_responses(diagnostic_id);
CREATE INDEX idx_diagnostic_responses_user ON diagnostic_responses(user_id);

-- Certification applications
CREATE INDEX idx_certification_applications_user ON certification_applications(user_id);
CREATE INDEX idx_certification_applications_status ON certification_applications(status);

-- Pricing
CREATE INDEX idx_pricing_plans_tier ON pricing_plans(tier);
CREATE INDEX idx_pricing_plans_active ON pricing_plans(is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE instructor_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_resource_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnostic_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE certification_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;

-- Instructor resources: Visible to instructors, editable by admins
CREATE POLICY "Instructors can view active resources"
  ON instructor_resources FOR SELECT
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role IN ('instructor', 'admin') OR profiles.instructor_status = 'approved')
    )
  );

CREATE POLICY "Admins can manage resources"
  ON instructor_resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Resource downloads: Users can track their own downloads
CREATE POLICY "Users can view own downloads"
  ON instructor_resource_downloads FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own downloads"
  ON instructor_resource_downloads FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Diagnostic templates: Visible to all authenticated, editable by admins
CREATE POLICY "Anyone can view active diagnostic templates"
  ON diagnostic_templates FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage diagnostic templates"
  ON diagnostic_templates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Organization diagnostics: Visible to org members, editable by org admins
CREATE POLICY "Org members can view diagnostics"
  ON organization_diagnostics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_diagnostics.organization_id
      AND organization_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Org admins can manage diagnostics"
  ON organization_diagnostics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_diagnostics.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Diagnostic responses: Users can manage own responses
CREATE POLICY "Users can view own diagnostic responses"
  ON diagnostic_responses FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own diagnostic responses"
  ON diagnostic_responses FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own diagnostic responses"
  ON diagnostic_responses FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Org admins can view all responses for their diagnostics
CREATE POLICY "Org admins can view diagnostic responses"
  ON diagnostic_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_diagnostics od
      JOIN organization_members om ON om.organization_id = od.organization_id
      WHERE od.id = diagnostic_responses.diagnostic_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Certification applications: Users can manage own, admins can view all
CREATE POLICY "Users can view own applications"
  ON certification_applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own applications"
  ON certification_applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all applications"
  ON certification_applications FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Pricing plans: Visible to all
CREATE POLICY "Anyone can view active pricing plans"
  ON pricing_plans FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage pricing plans"
  ON pricing_plans FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- SEED DATA: Default Diagnostic Templates
-- ============================================================================

INSERT INTO diagnostic_templates (name, description, type, questions, is_system, icon, color, estimated_time_minutes) VALUES
(
  'Leadership Assessment',
  'Identify leadership styles and energy patterns across your team. Understand how different elements contribute to leadership effectiveness.',
  'leadership',
  '[
    {"id": 1, "text": "How do you typically make important decisions?", "type": "scale", "options": ["Quickly and intuitively", "After careful analysis", "After consulting with others", "Based on past experience"]},
    {"id": 2, "text": "When faced with conflict in your team, you tend to:", "type": "scale", "options": ["Address it directly", "Mediate calmly", "Seek compromise", "Avoid until necessary"]},
    {"id": 3, "text": "Your communication style is best described as:", "type": "scale", "options": ["Direct and energetic", "Thoughtful and detailed", "Warm and empathetic", "Structured and clear"]}
  ]'::jsonb,
  true,
  'Briefcase',
  'blue',
  15
),
(
  'Communication Audit',
  'Analyze communication preferences and identify potential misalignments. Improve team collaboration through better understanding.',
  'communication',
  '[
    {"id": 1, "text": "When sharing important information, I prefer to:", "type": "scale", "options": ["Send a detailed email", "Have a quick call", "Schedule a meeting", "Use instant messaging"]},
    {"id": 2, "text": "I process information best when it is:", "type": "scale", "options": ["Visual (charts, diagrams)", "Written (detailed documents)", "Verbal (discussions)", "Hands-on (examples)"]},
    {"id": 3, "text": "In team meetings, I typically:", "type": "scale", "options": ["Lead the discussion", "Listen and analyze", "Support others", "Take notes"]}
  ]'::jsonb,
  true,
  'MessageSquare',
  'green',
  10
),
(
  'Conflict Resolution',
  'Map conflict triggers and provide mediation strategies. Build a more harmonious workplace through understanding.',
  'conflict_resolution',
  '[
    {"id": 1, "text": "When disagreements arise, my first instinct is to:", "type": "scale", "options": ["Defend my position", "Seek to understand", "Find middle ground", "Step back and observe"]},
    {"id": 2, "text": "I find conflict most stressful when:", "type": "scale", "options": ["It involves emotions", "Facts are disputed", "Relationships are at risk", "Progress is blocked"]},
    {"id": 3, "text": "The best resolution approach for me is:", "type": "scale", "options": ["Direct conversation", "Written communication", "Third-party mediation", "Time to cool off"]}
  ]'::jsonb,
  true,
  'Shield',
  'red',
  12
),
(
  'Motivation & Engagement',
  'Identify what energizes team members and track engagement levels. Create an environment where everyone thrives.',
  'motivation_engagement',
  '[
    {"id": 1, "text": "I feel most motivated when:", "type": "scale", "options": ["Tackling new challenges", "Achieving goals", "Helping others", "Learning new things"]},
    {"id": 2, "text": "Recognition I value most:", "type": "scale", "options": ["Public acknowledgment", "Private appreciation", "Financial rewards", "Growth opportunities"]},
    {"id": 3, "text": "My energy is drained by:", "type": "scale", "options": ["Routine tasks", "Unclear expectations", "Conflict", "Lack of autonomy"]}
  ]'::jsonb,
  true,
  'Target',
  'amber',
  10
),
(
  'Sales Team Optimization',
  'Map sales team elements and optimize role assignments. Improve performance by aligning strengths with responsibilities.',
  'sales_optimization',
  '[
    {"id": 1, "text": "In the sales process, I excel at:", "type": "scale", "options": ["Prospecting/outreach", "Building relationships", "Closing deals", "Account management"]},
    {"id": 2, "text": "I handle rejection by:", "type": "scale", "options": ["Moving on quickly", "Analyzing what went wrong", "Seeking support", "Adjusting my approach"]},
    {"id": 3, "text": "My ideal sales environment is:", "type": "scale", "options": ["High-energy, competitive", "Collaborative, supportive", "Independent, self-directed", "Structured, process-driven"]}
  ]'::jsonb,
  true,
  'TrendingUp',
  'purple',
  12
);

-- ============================================================================
-- SEED DATA: Default Instructor Resources
-- ============================================================================

INSERT INTO instructor_resources (title, description, category, type, cert_level, file_size_bytes, is_featured, sort_order) VALUES
-- Workshop Materials
('Facilitation Guide - Complete Workshop', '42-page comprehensive guide for facilitating the NeuroElemental assessment workshop', 'workshop_materials', 'pdf', 'practitioner', 2516582, true, 1),
('Participant Workbook', 'Printable workbook for workshop participants with exercises and reflection prompts', 'workshop_materials', 'pdf', 'practitioner', 1887437, false, 2),
('Workshop Slide Deck (PowerPoint)', 'Fully customizable presentation slides for 3-hour workshop', 'workshop_materials', 'presentation', 'practitioner', 8912896, true, 3),
('Assessment Administration Guide', 'Step-by-step instructions for administering the NeuroElemental assessment', 'workshop_materials', 'pdf', 'practitioner', 1258291, false, 4),

-- Training Videos
('Introduction to Teaching NeuroElemental', 'Welcome video covering the philosophy and approach to teaching this framework', 'training_videos', 'video', 'practitioner', NULL, true, 1),
('Facilitating Group Assessments', 'How to effectively guide groups through the assessment process', 'training_videos', 'video', 'practitioner', NULL, false, 2),
('Handling Difficult Questions', 'Navigate challenging questions and resistance with grace', 'training_videos', 'video', 'practitioner', NULL, false, 3),
('Ethics and Boundaries', 'Maintaining professional ethics when teaching the framework', 'training_videos', 'video', 'practitioner', NULL, true, 4),

-- Marketing Materials
('Certified Instructor Badge', 'Official badge files (PNG, SVG) for use on your website and marketing', 'marketing', 'image', 'practitioner', 460800, true, 1),
('Email Templates Pack', '10 customizable email templates for outreach and client communication', 'marketing', 'document', 'practitioner', 911360, false, 2),
('Social Media Graphics Bundle', 'Ready-to-use graphics for Instagram, Facebook, and LinkedIn', 'marketing', 'image', 'practitioner', 12582912, false, 3),
('Workshop Flyer Templates', 'Customizable flyer designs for promoting your workshops', 'marketing', 'pdf', 'practitioner', 3355443, false, 4);

-- ============================================================================
-- SEED DATA: Default Pricing Plans
-- ============================================================================

INSERT INTO pricing_plans (name, description, tier, type, price_cents, features, is_featured, badge_text, sort_order) VALUES
(
  'Free',
  'Get started with NeuroElemental basics',
  'free',
  'one_time',
  0,
  '["Free personality assessment", "Basic results overview", "Element introduction guide", "Community access"]'::jsonb,
  false,
  NULL,
  1
),
(
  'Individual',
  'Complete access for personal growth',
  'basic',
  'one_time',
  9700,
  '["Full assessment with detailed results", "All 4 states analysis", "Regeneration strategies", "Downloadable PDF report", "Course discounts"]'::jsonb,
  true,
  'Most Popular',
  2
),
(
  'Team',
  'Perfect for small teams and departments',
  'professional',
  'per_seat',
  4900,
  '["Everything in Individual", "Team composition analysis", "Communication insights", "Diagnostic tools", "Priority support", "Monthly Q&A access"]'::jsonb,
  false,
  NULL,
  3
),
(
  'Enterprise',
  'Full platform access for organizations',
  'enterprise',
  'subscription_yearly',
  0,
  '["Everything in Team", "Custom diagnostics", "SSO integration", "API access", "Dedicated success manager", "Custom training", "SLA guarantee"]'::jsonb,
  false,
  'Contact Us',
  4
);
