/**
 * Analytics Tables Migration
 * Tracks usage metrics and generates insights for organizations
 */

-- Organization usage metrics (aggregated daily)
CREATE TABLE IF NOT EXISTS organization_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity metrics
  total_activities INT DEFAULT 0,
  active_members INT DEFAULT 0,

  -- Credit metrics
  credits_used INT DEFAULT 0,
  credits_added INT DEFAULT 0,

  -- API metrics
  api_calls INT DEFAULT 0,
  api_errors INT DEFAULT 0,

  -- Webhook metrics
  webhooks_sent INT DEFAULT 0,
  webhooks_failed INT DEFAULT 0,

  -- Course metrics
  courses_enrolled INT DEFAULT 0,
  courses_completed INT DEFAULT 0,

  -- Member metrics
  members_added INT DEFAULT 0,
  members_removed INT DEFAULT 0,
  invitations_sent INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, date)
);

-- User activity metrics (aggregated daily per user)
CREATE TABLE IF NOT EXISTS user_activity_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- Activity counts
  total_actions INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  api_calls INT DEFAULT 0,

  -- Last activity
  last_active_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, user_id, date)
);

-- Real-time API usage tracking (for rate limiting and monitoring)
CREATE TABLE IF NOT EXISTS api_usage_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Request details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT,
  response_time_ms INT,

  -- Error tracking
  error_message TEXT,

  -- Metadata
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate usage reports
CREATE TABLE IF NOT EXISTS usage_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  generated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Report configuration
  report_type TEXT NOT NULL, -- 'activity', 'usage', 'members', 'credits', 'api', 'custom'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,

  -- Report data (JSON)
  data JSONB NOT NULL,

  -- Metadata
  file_url TEXT, -- S3 URL if exported
  format TEXT DEFAULT 'json', -- 'json', 'csv', 'pdf'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ -- Optional expiration for cleanup
);

-- Indexes for performance
CREATE INDEX idx_org_usage_metrics_org_date ON organization_usage_metrics(organization_id, date DESC);
CREATE INDEX idx_user_activity_metrics_org_date ON user_activity_metrics(organization_id, date DESC);
CREATE INDEX idx_user_activity_metrics_user_date ON user_activity_metrics(user_id, date DESC);
CREATE INDEX idx_api_usage_log_org_created ON api_usage_log(organization_id, created_at DESC);
CREATE INDEX idx_api_usage_log_endpoint ON api_usage_log(endpoint, created_at DESC);
CREATE INDEX idx_usage_reports_org_created ON usage_reports(organization_id, created_at DESC);

-- RLS Policies
ALTER TABLE organization_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_reports ENABLE ROW LEVEL SECURITY;

-- Organization admins can view their organization's metrics
CREATE POLICY "Organization admins can view usage metrics"
  ON organization_usage_metrics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_usage_metrics.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization members can view their own activity metrics
CREATE POLICY "Members can view own activity metrics"
  ON user_activity_metrics FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = user_activity_metrics.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view API usage logs
CREATE POLICY "Organization admins can view API logs"
  ON api_usage_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = api_usage_log.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view and create reports
CREATE POLICY "Organization admins can view reports"
  ON usage_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = usage_reports.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Organization admins can create reports"
  ON usage_reports FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = usage_reports.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_org_usage_metrics_updated_at
  BEFORE UPDATE ON organization_usage_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_metrics_updated_at
  BEFORE UPDATE ON user_activity_metrics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to aggregate daily metrics from activity log
CREATE OR REPLACE FUNCTION aggregate_daily_metrics(target_date DATE DEFAULT CURRENT_DATE)
RETURNS void AS $$
DECLARE
  metric_record RECORD;
BEGIN
  -- Aggregate organization usage metrics
  INSERT INTO organization_usage_metrics (
    organization_id,
    date,
    total_activities,
    active_members,
    credits_used,
    credits_added,
    members_added,
    members_removed,
    invitations_sent
  )
  SELECT
    organization_id,
    target_date,
    COUNT(*) as total_activities,
    COUNT(DISTINCT user_id) as active_members,
    SUM(CASE WHEN action_type LIKE 'credits.used%' THEN 1 ELSE 0 END) as credits_used,
    SUM(CASE WHEN action_type LIKE 'credits.added%' OR action_type LIKE 'credits.purchased%' THEN 1 ELSE 0 END) as credits_added,
    SUM(CASE WHEN action_type = 'member.joined' THEN 1 ELSE 0 END) as members_added,
    SUM(CASE WHEN action_type = 'member.removed' OR action_type = 'member.left' THEN 1 ELSE 0 END) as members_removed,
    SUM(CASE WHEN action_type LIKE 'invitation.%' THEN 1 ELSE 0 END) as invitations_sent
  FROM organization_activity_log
  WHERE DATE(created_at) = target_date
  GROUP BY organization_id
  ON CONFLICT (organization_id, date)
  DO UPDATE SET
    total_activities = EXCLUDED.total_activities,
    active_members = EXCLUDED.active_members,
    credits_used = EXCLUDED.credits_used,
    credits_added = EXCLUDED.credits_added,
    members_added = EXCLUDED.members_added,
    members_removed = EXCLUDED.members_removed,
    invitations_sent = EXCLUDED.invitations_sent,
    updated_at = NOW();

  -- Aggregate user activity metrics
  INSERT INTO user_activity_metrics (
    organization_id,
    user_id,
    date,
    total_actions,
    credits_used,
    last_active_at
  )
  SELECT
    organization_id,
    user_id,
    target_date,
    COUNT(*) as total_actions,
    SUM(CASE WHEN action_type LIKE 'credits.used%' THEN 1 ELSE 0 END) as credits_used,
    MAX(created_at) as last_active_at
  FROM organization_activity_log
  WHERE DATE(created_at) = target_date
    AND user_id IS NOT NULL
  GROUP BY organization_id, user_id
  ON CONFLICT (organization_id, user_id, date)
  DO UPDATE SET
    total_actions = EXCLUDED.total_actions,
    credits_used = EXCLUDED.credits_used,
    last_active_at = EXCLUDED.last_active_at,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE organization_usage_metrics IS 'Daily aggregated usage metrics per organization';
COMMENT ON TABLE user_activity_metrics IS 'Daily aggregated activity metrics per user';
COMMENT ON TABLE api_usage_log IS 'Real-time API usage tracking for monitoring and rate limiting';
COMMENT ON TABLE usage_reports IS 'Generated usage reports for organizations';
COMMENT ON FUNCTION aggregate_daily_metrics IS 'Aggregates daily metrics from activity log (run via cron)';
