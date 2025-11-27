/**
 * Data Export Tables Migration
 * GDPR-compliant user data export (Right to Data Portability)
 */

-- Data export requests
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Requester
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for personal data export

  -- Export configuration
  export_type TEXT NOT NULL, -- 'personal', 'organization'
  export_format TEXT NOT NULL DEFAULT 'json', -- 'json', 'csv_zip'

  -- Data categories to include
  include_profile BOOLEAN DEFAULT true,
  include_activity BOOLEAN DEFAULT true,
  include_memberships BOOLEAN DEFAULT true,
  include_api_keys BOOLEAN DEFAULT true,
  include_webhooks BOOLEAN DEFAULT true,
  include_billing BOOLEAN DEFAULT true,
  include_content BOOLEAN DEFAULT true, -- User-generated content (courses, etc.)

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- Results
  file_size_bytes BIGINT,
  file_url TEXT, -- Signed URL to download
  file_path TEXT, -- Storage path
  expires_at TIMESTAMPTZ, -- URL expiration (30 days from completion)

  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- GDPR compliance
  requested_reason TEXT, -- Why the export was requested
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data deletion requests (GDPR Right to Erasure)
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Requester
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- NULL for full account deletion

  -- Deletion scope
  deletion_type TEXT NOT NULL, -- 'account', 'organization_data'
  retention_reason TEXT, -- If data must be retained (legal, financial)

  -- Confirmation
  confirmed_at TIMESTAMPTZ, -- User must confirm deletion
  confirmation_token TEXT UNIQUE,
  confirmation_expires_at TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending_confirmation', 'confirmed', 'processing', 'completed', 'rejected'

  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  -- Data to delete/anonymize
  items_to_delete JSONB, -- List of data categories and items

  -- GDPR compliance
  requested_reason TEXT,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data access log (track who accessed user data)
CREATE TABLE IF NOT EXISTS data_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Access details
  accessed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Whose data was accessed
  accessed_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- Who accessed it
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

  -- Access context
  access_type TEXT NOT NULL, -- 'view', 'export', 'modify', 'delete'
  resource_type TEXT NOT NULL, -- 'profile', 'activity', 'billing', etc.
  resource_id TEXT,

  -- Metadata
  reason TEXT, -- Why the access occurred
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_export_requests_user ON data_export_requests(user_id, created_at DESC);
CREATE INDEX idx_export_requests_status ON data_export_requests(status, created_at DESC);
CREATE INDEX idx_deletion_requests_user ON data_deletion_requests(user_id, created_at DESC);
CREATE INDEX idx_deletion_requests_status ON data_deletion_requests(status, created_at DESC);
CREATE INDEX idx_deletion_requests_token ON data_deletion_requests(confirmation_token) WHERE confirmation_token IS NOT NULL;
CREATE INDEX idx_data_access_log_accessed_user ON data_access_log(accessed_user_id, created_at DESC);
CREATE INDEX idx_data_access_log_accessed_by ON data_access_log(accessed_by_user_id, created_at DESC);

-- RLS Policies
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_access_log ENABLE ROW LEVEL SECURITY;

-- Users can manage their own export requests
CREATE POLICY "Users can manage their own export requests"
  ON data_export_requests FOR ALL
  USING (user_id = auth.uid());

-- Users can manage their own deletion requests
CREATE POLICY "Users can manage their own deletion requests"
  ON data_deletion_requests FOR ALL
  USING (user_id = auth.uid());

-- Users can view access to their data
CREATE POLICY "Users can view access to their data"
  ON data_access_log FOR SELECT
  USING (accessed_user_id = auth.uid());

-- Organization admins can view data access logs for their org
CREATE POLICY "Organization admins can view org data access logs"
  ON data_access_log FOR SELECT
  USING (
    organization_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = data_access_log.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Function to log data access
CREATE OR REPLACE FUNCTION log_data_access(
  p_accessed_user_id UUID,
  p_accessed_by_user_id UUID,
  p_organization_id UUID,
  p_access_type TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_reason TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO data_access_log (
    accessed_user_id,
    accessed_by_user_id,
    organization_id,
    access_type,
    resource_type,
    resource_id,
    reason,
    ip_address,
    user_agent
  ) VALUES (
    p_accessed_user_id,
    p_accessed_by_user_id,
    p_organization_id,
    p_access_type,
    p_resource_type,
    p_resource_id,
    p_reason,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate confirmation token for deletion
CREATE OR REPLACE FUNCTION generate_deletion_confirmation_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to get user data summary (for export)
CREATE OR REPLACE FUNCTION get_user_data_summary(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_summary JSONB;
  v_profile JSONB;
  v_memberships JSONB;
  v_activity_count INT;
  v_api_keys_count INT;
BEGIN
  -- Get profile data
  SELECT jsonb_build_object(
    'id', id,
    'email', email,
    'full_name', full_name,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO v_profile
  FROM users
  WHERE id = p_user_id;

  -- Get memberships
  SELECT jsonb_agg(
    jsonb_build_object(
      'organization_id', om.organization_id,
      'organization_name', o.name,
      'role', om.role,
      'joined_at', om.joined_at
    )
  ) INTO v_memberships
  FROM organization_members om
  JOIN organizations o ON o.id = om.organization_id
  WHERE om.user_id = p_user_id;

  -- Get activity count
  SELECT COUNT(*)
  INTO v_activity_count
  FROM organization_activity_log
  WHERE user_id = p_user_id;

  -- Get API keys count
  SELECT COUNT(*)
  INTO v_api_keys_count
  FROM api_keys
  WHERE user_id = p_user_id;

  -- Build summary
  v_summary := jsonb_build_object(
    'profile', v_profile,
    'memberships', COALESCE(v_memberships, '[]'::jsonb),
    'activity_count', v_activity_count,
    'api_keys_count', v_api_keys_count,
    'generated_at', NOW()
  );

  RETURN v_summary;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_data_export_requests_updated_at
  BEFORE UPDATE ON data_export_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_deletion_requests_updated_at
  BEFORE UPDATE ON data_deletion_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE data_export_requests IS 'GDPR-compliant user data export requests (Article 20)';
COMMENT ON TABLE data_deletion_requests IS 'GDPR-compliant data deletion requests (Article 17 - Right to Erasure)';
COMMENT ON TABLE data_access_log IS 'Audit log of who accessed user data (GDPR transparency)';
COMMENT ON FUNCTION log_data_access IS 'Log access to user data for GDPR compliance';
COMMENT ON FUNCTION get_user_data_summary IS 'Get summary of user data for export preview';
