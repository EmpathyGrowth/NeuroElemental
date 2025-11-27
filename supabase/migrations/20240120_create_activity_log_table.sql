-- Create organization_activity_log table to track all organization actions
-- This provides an audit trail of all organization-related activities

CREATE TABLE IF NOT EXISTS organization_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  description TEXT NOT NULL,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for faster lookups
CREATE INDEX idx_activity_log_org ON organization_activity_log(organization_id);
CREATE INDEX idx_activity_log_user ON organization_activity_log(user_id);
CREATE INDEX idx_activity_log_action ON organization_activity_log(action_type);
CREATE INDEX idx_activity_log_created ON organization_activity_log(created_at);
CREATE INDEX idx_activity_log_entity ON organization_activity_log(entity_type, entity_id);

-- Add RLS policies
ALTER TABLE organization_activity_log ENABLE ROW LEVEL SECURITY;

-- Super admins can view all activity
CREATE POLICY "Super admins can view all activity"
  ON organization_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Organization members can view activity for their org
CREATE POLICY "Organization members can view their activity"
  ON organization_activity_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = organization_activity_log.organization_id
      AND organization_memberships.user_id = auth.uid()
    )
  );

-- System can insert activity (service role)
-- Note: Activity logging should use service role key

COMMENT ON TABLE organization_activity_log IS 'Audit log for all organization activities';
COMMENT ON COLUMN organization_activity_log.action_type IS 'Type of action (create, update, delete, invite, etc.)';
COMMENT ON COLUMN organization_activity_log.entity_type IS 'Type of entity (organization, member, credit, invitation, etc.)';
COMMENT ON COLUMN organization_activity_log.entity_id IS 'ID of the affected entity';
COMMENT ON COLUMN organization_activity_log.description IS 'Human-readable description of the action';
COMMENT ON COLUMN organization_activity_log.metadata IS 'Additional context about the action';
