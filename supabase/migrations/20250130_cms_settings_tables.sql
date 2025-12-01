-- Migration: CMS Settings Tables
-- Creates platform_settings, site_content, and theme_settings tables

-- ============================================================================
-- PLATFORM SETTINGS
-- Global platform configuration (feature flags, branding, security, etc.)
-- ============================================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general', 'email', 'payment', 'security', 'branding', 'features')),
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_platform_settings_key ON platform_settings(key);
CREATE INDEX IF NOT EXISTS idx_platform_settings_category ON platform_settings(category);

-- Seed default platform settings
INSERT INTO platform_settings (key, value, category, description) VALUES
  -- General
  ('site_name', '"NeuroElemental"', 'general', 'Platform name displayed across the site'),
  ('site_description', '"Energy management for neurodivergent brains"', 'general', 'Site tagline and meta description'),
  ('contact_email', '"support@neuroelemental.com"', 'general', 'Primary contact email'),
  ('support_url', '"https://neuroelemental.com/support"', 'general', 'Support page URL'),
  -- Email
  ('notifications_enabled', 'true', 'email', 'Master toggle for email notifications'),
  ('from_email', '"noreply@neuroelemental.com"', 'email', 'Default sender email address'),
  ('from_name', '"NeuroElemental"', 'email', 'Default sender name'),
  ('reply_to', '"support@neuroelemental.com"', 'email', 'Reply-to email address'),
  -- Security
  ('maintenance_mode', 'false', 'security', 'Enable maintenance mode to block public access'),
  ('allow_registrations', 'true', 'security', 'Allow new user registrations'),
  ('require_email_verification', 'true', 'security', 'Require email verification for new accounts'),
  ('session_timeout_minutes', '1440', 'security', 'Session timeout in minutes (default: 24 hours)'),
  ('max_login_attempts', '5', 'security', 'Max failed login attempts before lockout'),
  -- Branding
  ('logo_url', '"/logo.svg"', 'branding', 'Site logo URL'),
  ('favicon_url', '"/favicon.ico"', 'branding', 'Favicon URL'),
  ('primary_color', '"#667eea"', 'branding', 'Primary brand color'),
  ('secondary_color', '"#764BA2"', 'branding', 'Secondary brand color'),
  -- Features
  ('enable_courses', 'true', 'features', 'Enable course functionality'),
  ('enable_events', 'true', 'features', 'Enable events functionality'),
  ('enable_assessments', 'true', 'features', 'Enable assessment functionality'),
  ('enable_certificates', 'true', 'features', 'Enable certificate generation'),
  ('enable_gamification', 'true', 'features', 'Enable achievements and gamification'),
  ('enable_organizations', 'true', 'features', 'Enable B2B organization features')
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- SITE CONTENT
-- Editable content for pages and sections (CMS)
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  section TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  is_published BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  UNIQUE(page, section)
);

CREATE INDEX IF NOT EXISTS idx_site_content_page ON site_content(page);
CREATE INDEX IF NOT EXISTS idx_site_content_page_section ON site_content(page, section);
CREATE INDEX IF NOT EXISTS idx_site_content_published ON site_content(is_published) WHERE is_published = TRUE;

-- Seed default landing page content (matches lib/content/landing.ts structure)
INSERT INTO site_content (page, section, content, is_published) VALUES
  ('landing', 'hero', '{
    "badge": "🧠 Celebrating Brain Diversity & Neurodivergent Minds",
    "title": {
      "prefix": "Work With Your Brain,",
      "highlight": "Not Against It."
    },
    "description": "The first personality framework designed for how diverse brains actually work—especially those who''ve felt misunderstood by traditional systems. Whether you''re neurodivergent, highly sensitive, or simply wired differently, discover your unique energy blueprint.",
    "cta": {
      "primary": {
        "text": "Take Free Assessment",
        "subtext": "5 min • Instant results",
        "href": "/assessment"
      },
      "secondary": {
        "text": "Learn More",
        "href": "/framework"
      }
    },
    "trust": ["100% Free Forever", "No Credit Card", "12,000+ Profiles Created"]
  }', true),
  ('landing', 'symptoms', '{
    "title": "Sound Familiar?",
    "highlight": "Familiar?",
    "description": "Ever felt exhausted despite getting \"enough\" sleep? Like traditional advice just makes you feel worse? You''re not broken—you might just be wired differently.",
    "quote": {
      "text": "\"You don''t need another system to fix you. ",
      "highlight": "You need a framework that works with how you''re actually wired.\""
    }
  }', true),
  ('landing', 'miniAssessment', '{
    "title": "Curious About Your ",
    "highlight": "Energy Type?",
    "description": "Take a quick preview to discover your dominant element. Just 3 questions to get started!"
  }', true),
  ('landing', 'problems', '{
    "title": "Why Traditional Personality Tests ",
    "highlight": "Don''t Work for Everyone",
    "description": "Boxed in by static labels? It''s time for a framework that moves as fast as you do."
  }', true),
  ('landing', 'benefits', '{
    "title": "Meet the",
    "highlight": "NeuroElemental System",
    "description": "A dynamic, energy-based system that adapts to your needs and honors your natural rhythm."
  }', true),
  ('landing', 'steps', '{
    "title": "Discover Your ",
    "highlight": "Unique Mix",
    "description": "Uncover your unique elemental combination. Design a life that flows with your natural energy, not against it."
  }', true),
  ('landing', 'professionals', '{
    "title": "For ",
    "highlight": "Professionals",
    "description": "Are you a coach, therapist, or HR professional working with diverse minds? Join our growing community of certified instructors and add a powerful, neurodiversity-informed tool to your practice.",
    "cta": "Explore Certification"
  }', true),
  ('landing', 'finalCta', '{
    "title": "Reclaim Your Energy.",
    "highlight": "Rediscover Yourself.",
    "description": "Get your personalized Elemental Profile in just 5 minutes. Start understanding your energy patterns and building a life that works with your brain, not against it.",
    "cta": {
      "text": "Start Free Assessment",
      "subtext": "5 min • 12,000+ completed",
      "href": "/assessment"
    },
    "badges": [
      {"text": "Instant Results", "color": "green"},
      {"text": "No Credit Card", "color": "blue"},
      {"text": "100% Free Forever", "color": "purple"}
    ]
  }', true),
  ('about', 'mission', '{
    "title": "Our Mission",
    "content": "Making neurodiversity understood and celebrated."
  }', true),
  ('framework', 'intro', '{
    "title": "The NeuroElemental Framework",
    "description": "Understanding your unique energy patterns."
  }', true)
ON CONFLICT (page, section) DO NOTHING;

-- ============================================================================
-- THEME SETTINGS
-- Site theme and appearance customization
-- ============================================================================
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Default Theme',
  is_active BOOLEAN DEFAULT FALSE,
  colors JSONB NOT NULL DEFAULT '{
    "primary": "#667eea",
    "secondary": "#764BA2",
    "accent": "#38bdf8",
    "background": "#0a0a0f",
    "foreground": "#fafafa",
    "muted": "#27272a",
    "mutedForeground": "#a1a1aa",
    "card": "#18181b",
    "cardForeground": "#fafafa",
    "border": "#27272a"
  }',
  dark_colors JSONB NOT NULL DEFAULT '{
    "primary": "#667eea",
    "secondary": "#764BA2",
    "accent": "#38bdf8",
    "background": "#0a0a0f",
    "foreground": "#fafafa",
    "muted": "#27272a",
    "mutedForeground": "#a1a1aa",
    "card": "#18181b",
    "cardForeground": "#fafafa",
    "border": "#27272a"
  }',
  typography JSONB NOT NULL DEFAULT '{
    "fontFamily": "Inter, system-ui, sans-serif",
    "headingFamily": "Inter, system-ui, sans-serif",
    "baseFontSize": "16px",
    "lineHeight": "1.6",
    "headingWeight": "700",
    "bodyWeight": "400"
  }',
  layout JSONB NOT NULL DEFAULT '{
    "maxWidth": "1280px",
    "containerPadding": "1.5rem",
    "sectionSpacing": "4rem",
    "borderRadius": "0.75rem",
    "cardPadding": "1.5rem"
  }',
  components JSONB NOT NULL DEFAULT '{
    "buttonStyle": "rounded",
    "inputStyle": "bordered",
    "cardStyle": "elevated",
    "navStyle": "sticky"
  }',
  custom_css TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Seed default active theme
INSERT INTO theme_settings (name, is_active) VALUES ('Default Theme', true)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Platform Settings RLS
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read non-sensitive platform settings"
  ON platform_settings FOR SELECT
  USING (is_sensitive = FALSE);

CREATE POLICY "Admins can read all platform settings"
  ON platform_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update platform settings"
  ON platform_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Site Content RLS
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published site content"
  ON site_content FOR SELECT
  USING (is_published = TRUE);

CREATE POLICY "Admins can manage all site content"
  ON site_content FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Theme Settings RLS
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active theme"
  ON theme_settings FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage all themes"
  ON theme_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get a platform setting value
CREATE OR REPLACE FUNCTION get_platform_setting(setting_key TEXT)
RETURNS JSONB AS $$
  SELECT value FROM platform_settings WHERE key = setting_key;
$$ LANGUAGE SQL STABLE;

-- Function to check if a feature is enabled
CREATE OR REPLACE FUNCTION is_feature_enabled(feature_name TEXT)
RETURNS BOOLEAN AS $$
  SELECT COALESCE((value)::BOOLEAN, FALSE)
  FROM platform_settings
  WHERE key = feature_name;
$$ LANGUAGE SQL STABLE;

-- Function to check maintenance mode
CREATE OR REPLACE FUNCTION is_maintenance_mode()
RETURNS BOOLEAN AS $$
  SELECT COALESCE((value)::BOOLEAN, FALSE)
  FROM platform_settings
  WHERE key = 'maintenance_mode';
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_site_content_updated ON site_content(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_theme_settings_active ON theme_settings(is_active) WHERE is_active = TRUE;
