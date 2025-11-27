/**
 * Rate Limiting Tables Migration
 * Track API usage and enforce rate limits per organization
 */

-- Rate limit configurations per organization
CREATE TABLE IF NOT EXISTS rate_limit_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Limit tiers
  tier TEXT NOT NULL DEFAULT 'free', -- free, starter, pro, enterprise, custom

  -- Request limits
  requests_per_minute INT DEFAULT 60,
  requests_per_hour INT DEFAULT 1000,
  requests_per_day INT DEFAULT 10000,

  -- Burst allowance (temporary spike tolerance)
  burst_allowance INT DEFAULT 10,

  -- Webhook limits
  webhooks_per_minute INT DEFAULT 10,
  webhooks_per_hour INT DEFAULT 100,

  -- Concurrent request limits
  max_concurrent_requests INT DEFAULT 10,

  -- Custom limits for enterprise
  custom_limits JSONB,

  -- Soft vs hard limits
  enforce_hard_limits BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

-- Rate limit usage tracking (sliding window)
CREATE TABLE IF NOT EXISTS rate_limit_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,

  -- Window tracking
  window_start TIMESTAMPTZ NOT NULL,
  window_type TEXT NOT NULL, -- 'minute', 'hour', 'day'

  -- Counters
  request_count INT DEFAULT 0,
  webhook_count INT DEFAULT 0,

  -- Limit violations
  throttled_count INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, window_type, window_start)
);

-- Rate limit violations log
CREATE TABLE IF NOT EXISTS rate_limit_violations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Violation details
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  limit_type TEXT NOT NULL, -- 'per_minute', 'per_hour', 'per_day', 'concurrent'
  current_count INT NOT NULL,
  limit_value INT NOT NULL,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,

  -- Response
  response_status INT DEFAULT 429,
  retry_after INT, -- seconds

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Default rate limit tiers
CREATE TABLE IF NOT EXISTS rate_limit_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,

  -- Limits
  requests_per_minute INT NOT NULL,
  requests_per_hour INT NOT NULL,
  requests_per_day INT NOT NULL,
  burst_allowance INT NOT NULL,
  webhooks_per_minute INT NOT NULL,
  webhooks_per_hour INT NOT NULL,
  max_concurrent_requests INT NOT NULL,

  -- Pricing (optional)
  monthly_price_cents INT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default tiers
INSERT INTO rate_limit_tiers (tier_name, display_name, description, requests_per_minute, requests_per_hour, requests_per_day, burst_allowance, webhooks_per_minute, webhooks_per_hour, max_concurrent_requests, monthly_price_cents)
VALUES
  ('free', 'Free', 'Basic rate limits for free tier', 10, 100, 1000, 5, 5, 50, 3, 0),
  ('starter', 'Starter', 'Increased limits for growing teams', 30, 500, 5000, 10, 10, 100, 5, 2900),
  ('pro', 'Professional', 'Higher limits for production workloads', 100, 2000, 20000, 20, 20, 200, 10, 9900),
  ('enterprise', 'Enterprise', 'Custom limits for large organizations', 500, 10000, 100000, 50, 50, 500, 50, NULL)
ON CONFLICT (tier_name) DO NOTHING;

-- Indexes for performance
CREATE INDEX idx_rate_limit_configs_org ON rate_limit_configs(organization_id);
CREATE INDEX idx_rate_limit_usage_org_window ON rate_limit_usage(organization_id, window_type, window_start DESC);
CREATE INDEX idx_rate_limit_violations_org_created ON rate_limit_violations(organization_id, created_at DESC);
CREATE INDEX idx_rate_limit_violations_endpoint ON rate_limit_violations(endpoint, created_at DESC);

-- RLS Policies
ALTER TABLE rate_limit_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limit_tiers ENABLE ROW LEVEL SECURITY;

-- Organization admins can view their rate limit config
CREATE POLICY "Organization admins can view rate limit config"
  ON rate_limit_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = rate_limit_configs.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view their usage
CREATE POLICY "Organization admins can view usage"
  ON rate_limit_usage FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = rate_limit_usage.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view violations
CREATE POLICY "Organization admins can view violations"
  ON rate_limit_violations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = rate_limit_violations.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Everyone can view rate limit tiers
CREATE POLICY "Anyone can view tiers"
  ON rate_limit_tiers FOR SELECT
  USING (is_active = true);

-- Function to initialize default rate limit config for new organizations
CREATE OR REPLACE FUNCTION initialize_rate_limit_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Get default free tier limits
  INSERT INTO rate_limit_configs (
    organization_id,
    tier,
    requests_per_minute,
    requests_per_hour,
    requests_per_day,
    burst_allowance,
    webhooks_per_minute,
    webhooks_per_hour,
    max_concurrent_requests
  )
  SELECT
    NEW.id,
    'free',
    requests_per_minute,
    requests_per_hour,
    requests_per_day,
    burst_allowance,
    webhooks_per_minute,
    webhooks_per_hour,
    max_concurrent_requests
  FROM rate_limit_tiers
  WHERE tier_name = 'free'
  LIMIT 1;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default rate limit config for new organizations
CREATE TRIGGER create_default_rate_limit_config
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION initialize_rate_limit_config();

-- Function to check rate limit
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_organization_id UUID,
  p_api_key_id UUID DEFAULT NULL,
  p_window_type TEXT DEFAULT 'minute'
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_count INT,
  limit_value INT,
  retry_after INT
) AS $$
DECLARE
  v_config RECORD;
  v_window_start TIMESTAMPTZ;
  v_current_count INT;
  v_limit INT;
BEGIN
  -- Get rate limit config
  SELECT * INTO v_config
  FROM rate_limit_configs
  WHERE organization_id = p_organization_id;

  IF NOT FOUND THEN
    -- No config, use default free tier
    SELECT * INTO v_config
    FROM rate_limit_tiers
    WHERE tier_name = 'free';
  END IF;

  -- Calculate window start based on type
  CASE p_window_type
    WHEN 'minute' THEN
      v_window_start := date_trunc('minute', NOW());
      v_limit := v_config.requests_per_minute;
    WHEN 'hour' THEN
      v_window_start := date_trunc('hour', NOW());
      v_limit := v_config.requests_per_hour;
    WHEN 'day' THEN
      v_window_start := date_trunc('day', NOW());
      v_limit := v_config.requests_per_day;
    ELSE
      v_window_start := date_trunc('minute', NOW());
      v_limit := v_config.requests_per_minute;
  END CASE;

  -- Get current count for this window
  SELECT COALESCE(request_count, 0) INTO v_current_count
  FROM rate_limit_usage
  WHERE rate_limit_usage.organization_id = p_organization_id
    AND window_type = p_window_type
    AND window_start = v_window_start;

  -- Check if limit exceeded
  IF v_current_count >= v_limit THEN
    RETURN QUERY SELECT
      false::BOOLEAN,
      v_current_count::INT,
      v_limit::INT,
      EXTRACT(EPOCH FROM (v_window_start + INTERVAL '1 ' || p_window_type - NOW()))::INT;
  ELSE
    RETURN QUERY SELECT
      true::BOOLEAN,
      v_current_count::INT,
      v_limit::INT,
      0::INT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage counter
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_organization_id UUID,
  p_api_key_id UUID DEFAULT NULL,
  p_window_type TEXT DEFAULT 'minute',
  p_is_webhook BOOLEAN DEFAULT false
)
RETURNS void AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
BEGIN
  -- Calculate window start
  CASE p_window_type
    WHEN 'minute' THEN
      v_window_start := date_trunc('minute', NOW());
    WHEN 'hour' THEN
      v_window_start := date_trunc('hour', NOW());
    WHEN 'day' THEN
      v_window_start := date_trunc('day', NOW());
    ELSE
      v_window_start := date_trunc('minute', NOW());
  END CASE;

  -- Upsert usage record
  INSERT INTO rate_limit_usage (
    organization_id,
    api_key_id,
    window_start,
    window_type,
    request_count,
    webhook_count
  )
  VALUES (
    p_organization_id,
    p_api_key_id,
    v_window_start,
    p_window_type,
    CASE WHEN p_is_webhook THEN 0 ELSE 1 END,
    CASE WHEN p_is_webhook THEN 1 ELSE 0 END
  )
  ON CONFLICT (organization_id, window_type, window_start)
  DO UPDATE SET
    request_count = rate_limit_usage.request_count + CASE WHEN p_is_webhook THEN 0 ELSE 1 END,
    webhook_count = rate_limit_usage.webhook_count + CASE WHEN p_is_webhook THEN 1 ELSE 0 END,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_rate_limit_configs_updated_at
  BEFORE UPDATE ON rate_limit_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limit_usage_updated_at
  BEFORE UPDATE ON rate_limit_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_limit_tiers_updated_at
  BEFORE UPDATE ON rate_limit_tiers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE rate_limit_configs IS 'Rate limiting configuration per organization';
COMMENT ON TABLE rate_limit_usage IS 'Sliding window usage tracking for rate limiting';
COMMENT ON TABLE rate_limit_violations IS 'Log of rate limit violations for monitoring';
COMMENT ON TABLE rate_limit_tiers IS 'Predefined rate limit tiers (free, starter, pro, enterprise)';
COMMENT ON FUNCTION check_rate_limit IS 'Check if organization has exceeded rate limit for given window';
COMMENT ON FUNCTION increment_rate_limit IS 'Increment usage counter for organization';
