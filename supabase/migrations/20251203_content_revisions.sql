-- Content Revisions System
-- Tracks revision history for CMS content types

-- Create content_revisions table
CREATE TABLE IF NOT EXISTS content_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL, -- 'blog_post', 'faq', 'course', 'email_template', etc.
  entity_id UUID NOT NULL,
  content_snapshot JSONB NOT NULL,
  changed_fields TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure unique revision per entity at a given time
  CONSTRAINT unique_revision_timestamp UNIQUE (entity_type, entity_id, created_at)
);

-- Create indexes for efficient lookups
CREATE INDEX idx_revisions_entity_lookup ON content_revisions(entity_type, entity_id);
CREATE INDEX idx_revisions_created_by ON content_revisions(created_by);
CREATE INDEX idx_revisions_created_at ON content_revisions(created_at DESC);

-- Create scheduled_content table for content scheduling
CREATE TABLE IF NOT EXISTS scheduled_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  action VARCHAR(20) NOT NULL DEFAULT 'publish', -- 'publish', 'unpublish'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'cancelled'
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT unique_scheduled_action UNIQUE (entity_type, entity_id, scheduled_at)
);

-- Create index for pending scheduled content
CREATE INDEX idx_scheduled_pending ON scheduled_content(scheduled_at) 
  WHERE status = 'pending';

-- Enable RLS
ALTER TABLE content_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_revisions (admin only)
CREATE POLICY "Admins can view all revisions"
  ON content_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can create revisions"
  ON content_revisions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can delete revisions"
  ON content_revisions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- RLS Policies for scheduled_content (admin only)
CREATE POLICY "Admins can view scheduled content"
  ON scheduled_content FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Admins can manage scheduled content"
  ON scheduled_content FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

-- Add comment for documentation
COMMENT ON TABLE content_revisions IS 'Stores revision history for CMS content types';
COMMENT ON TABLE scheduled_content IS 'Stores scheduled publish/unpublish actions for content';
