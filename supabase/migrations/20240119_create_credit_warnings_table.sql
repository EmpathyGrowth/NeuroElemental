-- Create credit_warnings table to track low credit notifications
-- This table records when warnings have been sent to prevent duplicate emails

CREATE TABLE IF NOT EXISTS credit_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  credit_type TEXT NOT NULL,
  balance INTEGER NOT NULL,
  threshold INTEGER NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX idx_credit_warnings_org_type ON credit_warnings(organization_id, credit_type);
CREATE INDEX idx_credit_warnings_sent_at ON credit_warnings(sent_at);

-- Add RLS policies
ALTER TABLE credit_warnings ENABLE ROW LEVEL SECURITY;

-- Super admins can view all warnings
CREATE POLICY "Super admins can view all warnings"
  ON credit_warnings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Organization admins can view warnings for their org
CREATE POLICY "Organization admins can view their warnings"
  ON credit_warnings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = credit_warnings.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

-- System can insert warnings (service role)
-- Note: The cron job should use service role key

COMMENT ON TABLE credit_warnings IS 'Tracks when low credit warnings have been sent to organizations';
COMMENT ON COLUMN credit_warnings.organization_id IS 'Organization that received the warning';
COMMENT ON COLUMN credit_warnings.credit_type IS 'Type of credit that was low';
COMMENT ON COLUMN credit_warnings.balance IS 'Credit balance at time of warning';
COMMENT ON COLUMN credit_warnings.threshold IS 'Threshold that triggered the warning';
COMMENT ON COLUMN credit_warnings.sent_at IS 'When the warning email was sent';
