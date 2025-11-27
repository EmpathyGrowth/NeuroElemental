-- Create webhooks table for real-time event notifications
-- Allows organizations to receive HTTP callbacks when events occur

CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create webhook_deliveries table to track delivery attempts
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  response_status_code INTEGER,
  response_body TEXT,
  response_headers JSONB,
  attempts INTEGER NOT NULL DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_webhooks_org ON webhooks(organization_id);
CREATE INDEX idx_webhooks_active ON webhooks(is_active);
CREATE INDEX idx_webhook_deliveries_webhook ON webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status);
CREATE INDEX idx_webhook_deliveries_next_retry ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
CREATE INDEX idx_webhook_deliveries_created ON webhook_deliveries(created_at DESC);

-- Add RLS policies
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Super admins can view all webhooks
CREATE POLICY "Super admins can view all webhooks"
  ON webhooks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_super_admin = true
    )
  );

-- Organization admins can manage their webhooks
CREATE POLICY "Organization admins can view their webhooks"
  ON webhooks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = webhooks.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can create webhooks"
  ON webhooks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = webhooks.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can update their webhooks"
  ON webhooks
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = webhooks.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can delete their webhooks"
  ON webhooks
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organization_memberships
      WHERE organization_memberships.organization_id = webhooks.organization_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

-- Webhook deliveries - admins can view their webhook deliveries
CREATE POLICY "Organization admins can view webhook deliveries"
  ON webhook_deliveries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM webhooks
      JOIN organization_memberships ON organization_memberships.organization_id = webhooks.organization_id
      WHERE webhooks.id = webhook_deliveries.webhook_id
      AND organization_memberships.user_id = auth.uid()
      AND organization_memberships.role IN ('owner', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_webhook_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_webhook_timestamp
  BEFORE UPDATE ON webhooks
  FOR EACH ROW
  EXECUTE FUNCTION update_webhook_updated_at();

COMMENT ON TABLE webhooks IS 'Webhook endpoints for receiving real-time event notifications';
COMMENT ON COLUMN webhooks.url IS 'HTTP endpoint to POST events to';
COMMENT ON COLUMN webhooks.events IS 'Array of event types to subscribe to (e.g., ["member.invited", "credits.purchased"])';
COMMENT ON COLUMN webhooks.secret IS 'Secret key for signing webhook payloads';

COMMENT ON TABLE webhook_deliveries IS 'Track webhook delivery attempts and responses';
COMMENT ON COLUMN webhook_deliveries.status IS 'Delivery status: pending, success, failed';
COMMENT ON COLUMN webhook_deliveries.attempts IS 'Number of delivery attempts';
COMMENT ON COLUMN webhook_deliveries.next_retry_at IS 'When to retry if failed';
