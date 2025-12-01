-- Migration: Full CMS Tables
-- Creates all CMS-related tables: FAQs, Navigation, Media, Email Templates, etc.

-- ============================================================================
-- FAQS
-- Frequently Asked Questions management
-- ============================================================================
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON faqs(is_published) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON faqs(sort_order);

-- ============================================================================
-- NAVIGATION MENUS
-- Site navigation menu management
-- ============================================================================
CREATE TABLE IF NOT EXISTS navigation_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  location TEXT NOT NULL CHECK (location IN ('header', 'footer', 'sidebar', 'mobile')),
  items JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_navigation_menus_location ON navigation_menus(location);
CREATE INDEX IF NOT EXISTS idx_navigation_menus_active ON navigation_menus(is_active) WHERE is_active = TRUE;

-- Seed default navigation menus
INSERT INTO navigation_menus (name, location, items) VALUES
  ('Main Navigation', 'header', '[
    {"label": "Home", "href": "/", "order": 1},
    {"label": "Framework", "href": "/framework", "order": 2},
    {"label": "Assessment", "href": "/assessment", "order": 3},
    {"label": "Courses", "href": "/courses", "order": 4},
    {"label": "Blog", "href": "/blog", "order": 5}
  ]'),
  ('Footer Navigation', 'footer', '[
    {"label": "About", "href": "/about", "order": 1},
    {"label": "Contact", "href": "/contact", "order": 2},
    {"label": "Privacy", "href": "/privacy", "order": 3},
    {"label": "Terms", "href": "/terms", "order": 4}
  ]'),
  ('Mobile Navigation', 'mobile', '[]')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FOOTER CONTENT
-- Footer sections and content
-- ============================================================================
CREATE TABLE IF NOT EXISTS footer_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- MEDIA LIBRARY
-- Uploaded files and images
-- ============================================================================
CREATE TABLE IF NOT EXISTS media_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  folder TEXT DEFAULT 'uploads',
  tags TEXT[] DEFAULT '{}',
  width INTEGER,
  height INTEGER,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_library_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_library_mime ON media_library(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON media_library USING GIN(tags);

-- ============================================================================
-- EMAIL TEMPLATES
-- Customizable email templates
-- ============================================================================
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  html_content TEXT NOT NULL,
  text_content TEXT,
  variables JSONB DEFAULT '[]',
  category TEXT DEFAULT 'transactional' CHECK (category IN ('transactional', 'marketing', 'notification', 'system')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_email_templates_slug ON email_templates(slug);
CREATE INDEX IF NOT EXISTS idx_email_templates_category ON email_templates(category);

-- Seed default email templates
INSERT INTO email_templates (name, slug, subject, html_content, variables, category) VALUES
  ('Welcome Email', 'welcome', 'Welcome to NeuroElemental!',
   '<h1>Welcome, {{name}}!</h1><p>Thank you for joining NeuroElemental.</p>',
   '["name", "email"]', 'transactional'),
  ('Password Reset', 'password-reset', 'Reset Your Password',
   '<h1>Password Reset</h1><p>Click <a href="{{reset_link}}">here</a> to reset your password.</p>',
   '["name", "reset_link"]', 'system'),
  ('Course Enrollment', 'course-enrollment', 'You''re enrolled in {{course_name}}!',
   '<h1>Welcome to {{course_name}}!</h1><p>You can start learning now.</p>',
   '["name", "course_name", "course_link"]', 'transactional')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CONTACT FORMS
-- Contact form definitions
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  fields JSONB NOT NULL DEFAULT '[]',
  recipient_emails TEXT[] DEFAULT '{}',
  success_message TEXT DEFAULT 'Thank you for your message!',
  auto_reply_template_id UUID REFERENCES email_templates(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- CONTACT FORM SUBMISSIONS
-- Submitted form data
-- ============================================================================
CREATE TABLE IF NOT EXISTS contact_form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID REFERENCES contact_forms(id) ON DELETE CASCADE NOT NULL,
  data JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  is_spam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_submissions_form_id ON contact_form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_unread ON contact_form_submissions(is_read) WHERE is_read = FALSE;

-- Seed default contact form
INSERT INTO contact_forms (name, slug, fields, recipient_emails) VALUES
  ('Contact Us', 'contact', '[
    {"name": "name", "type": "text", "label": "Name", "required": true},
    {"name": "email", "type": "email", "label": "Email", "required": true},
    {"name": "subject", "type": "text", "label": "Subject", "required": true},
    {"name": "message", "type": "textarea", "label": "Message", "required": true}
  ]', ARRAY['support@neuroelemental.com'])
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- CONTENT BLOCKS
-- Reusable content components
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  block_type TEXT NOT NULL CHECK (block_type IN ('text', 'html', 'cta', 'feature', 'testimonial', 'stats', 'gallery', 'video', 'code', 'custom')),
  content JSONB NOT NULL DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  description TEXT,
  is_global BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_content_blocks_type ON content_blocks(block_type);
CREATE INDEX IF NOT EXISTS idx_content_blocks_slug ON content_blocks(slug);

-- ============================================================================
-- CONTENT REVISIONS
-- Version history for content
-- ============================================================================
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  change_summary TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_entity ON content_revisions(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_revisions_version ON content_revisions(entity_id, version DESC);

-- ============================================================================
-- URL REDIRECTS
-- URL redirect management for SEO
-- ============================================================================
CREATE TABLE IF NOT EXISTS url_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path TEXT NOT NULL UNIQUE,
  destination_path TEXT NOT NULL,
  redirect_type INTEGER DEFAULT 301 CHECK (redirect_type IN (301, 302, 307, 308)),
  is_active BOOLEAN DEFAULT TRUE,
  hit_count INTEGER DEFAULT 0,
  last_hit_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_redirects_source ON url_redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON url_redirects(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- SEO SETTINGS
-- Per-page SEO metadata
-- ============================================================================
CREATE TABLE IF NOT EXISTS seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  title TEXT,
  description TEXT,
  keywords TEXT[],
  og_title TEXT,
  og_description TEXT,
  og_image TEXT,
  twitter_card TEXT DEFAULT 'summary_large_image',
  canonical_url TEXT,
  robots TEXT DEFAULT 'index, follow',
  structured_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seo_page_path ON seo_settings(page_path);

-- ============================================================================
-- SITE ANNOUNCEMENTS
-- Site-wide banners and notifications
-- ============================================================================
CREATE TABLE IF NOT EXISTS site_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'promo')),
  link_text TEXT,
  link_url TEXT,
  background_color TEXT,
  text_color TEXT,
  is_dismissible BOOLEAN DEFAULT TRUE,
  show_on_pages TEXT[] DEFAULT ARRAY['*'],
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON site_announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_announcements_dates ON site_announcements(starts_at, ends_at);

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- FAQs RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published FAQs"
  ON faqs FOR SELECT USING (is_published = TRUE);

CREATE POLICY "Admins can manage FAQs"
  ON faqs FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Navigation Menus RLS
ALTER TABLE navigation_menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active navigation"
  ON navigation_menus FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage navigation"
  ON navigation_menus FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Footer Content RLS
ALTER TABLE footer_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active footer content"
  ON footer_content FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage footer content"
  ON footer_content FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Media Library RLS
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read media"
  ON media_library FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage media"
  ON media_library FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Email Templates RLS
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
  ON email_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Contact Forms RLS
ALTER TABLE contact_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active forms"
  ON contact_forms FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage forms"
  ON contact_forms FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Contact Form Submissions RLS
ALTER TABLE contact_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view submissions"
  ON contact_form_submissions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

CREATE POLICY "Public can submit forms"
  ON contact_form_submissions FOR INSERT WITH CHECK (TRUE);

-- Content Blocks RLS
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active blocks"
  ON content_blocks FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage blocks"
  ON content_blocks FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Content Revisions RLS
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view revisions"
  ON content_revisions FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- URL Redirects RLS
ALTER TABLE url_redirects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active redirects"
  ON url_redirects FOR SELECT USING (is_active = TRUE);

CREATE POLICY "Admins can manage redirects"
  ON url_redirects FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- SEO Settings RLS
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read SEO settings"
  ON seo_settings FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage SEO settings"
  ON seo_settings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- Site Announcements RLS
ALTER TABLE site_announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active announcements"
  ON site_announcements FOR SELECT USING (
    is_active = TRUE
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (ends_at IS NULL OR ends_at >= NOW())
  );

CREATE POLICY "Admins can manage announcements"
  ON site_announcements FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
