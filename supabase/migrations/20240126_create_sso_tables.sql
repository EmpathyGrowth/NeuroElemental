/**
 * Single Sign-On (SSO) Tables Migration
 * Support for SAML 2.0 and OAuth enterprise authentication
 */

-- SSO providers configuration per organization
CREATE TABLE IF NOT EXISTS sso_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Provider details
  provider_type TEXT NOT NULL, -- 'saml', 'oauth', 'oidc'
  provider_name TEXT NOT NULL, -- 'Okta', 'Azure AD', 'Google Workspace', etc.

  -- SAML Configuration
  saml_entity_id TEXT, -- IdP Entity ID
  saml_sso_url TEXT, -- IdP Single Sign-On URL
  saml_certificate TEXT, -- X.509 certificate (PEM format)
  saml_sign_requests BOOLEAN DEFAULT false,

  -- OAuth/OIDC Configuration
  oauth_client_id TEXT,
  oauth_client_secret TEXT, -- Encrypted
  oauth_authorize_url TEXT,
  oauth_token_url TEXT,
  oauth_userinfo_url TEXT,
  oauth_scopes TEXT[], -- ['openid', 'profile', 'email']

  -- Attribute Mapping (map IdP attributes to user fields)
  attribute_mapping JSONB DEFAULT '{
    "email": "email",
    "first_name": "firstName",
    "last_name": "lastName",
    "user_id": "nameID"
  }'::jsonb,

  -- Domain enforcement
  domains TEXT[] NOT NULL, -- ['acme.com', 'acme.co.uk']
  enforce_sso BOOLEAN DEFAULT false, -- Require SSO for these domains

  -- Auto-provisioning
  auto_provision_users BOOLEAN DEFAULT true, -- Create user on first SSO login
  default_role TEXT DEFAULT 'member', -- Default role for auto-provisioned users

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, provider_type)
);

-- SSO authentication attempts log
CREATE TABLE IF NOT EXISTS sso_auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,

  -- User info
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,

  -- Attempt details
  status TEXT NOT NULL, -- 'success', 'failed', 'error'
  error_code TEXT, -- 'invalid_assertion', 'user_not_found', 'domain_mismatch', etc.
  error_message TEXT,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,

  -- SAML/OAuth specific data
  saml_request_id TEXT, -- SAML RequestID
  saml_assertion TEXT, -- Full SAML assertion (for debugging)
  oauth_state TEXT, -- OAuth state parameter

  -- Timing
  duration_ms INT, -- How long the SSO flow took

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SSO user mappings (link SSO identities to users)
CREATE TABLE IF NOT EXISTS sso_user_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- IdP user identifier
  idp_user_id TEXT NOT NULL, -- NameID (SAML) or sub (OAuth)
  idp_email TEXT NOT NULL,

  -- User attributes from IdP
  idp_attributes JSONB, -- Store all attributes from IdP

  -- Timestamps
  first_login_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(provider_id, idp_user_id),
  UNIQUE(organization_id, user_id, provider_id)
);

-- SSO sessions (track active SSO sessions)
CREATE TABLE IF NOT EXISTS sso_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES sso_providers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Session details
  session_index TEXT, -- SAML SessionIndex for SLO (Single Logout)
  name_id TEXT NOT NULL, -- User identifier from IdP

  -- Session lifecycle
  expires_at TIMESTAMPTZ NOT NULL,
  logged_out_at TIMESTAMPTZ,

  -- Request metadata
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sso_providers_org ON sso_providers(organization_id, is_active);
CREATE INDEX idx_sso_providers_domains ON sso_providers USING gin(domains);
CREATE INDEX idx_sso_auth_attempts_org ON sso_auth_attempts(organization_id, created_at DESC);
CREATE INDEX idx_sso_auth_attempts_user ON sso_auth_attempts(user_id, created_at DESC);
CREATE INDEX idx_sso_auth_attempts_status ON sso_auth_attempts(status, created_at DESC);
CREATE INDEX idx_sso_user_mappings_org ON sso_user_mappings(organization_id, user_id);
CREATE INDEX idx_sso_user_mappings_provider ON sso_user_mappings(provider_id, idp_user_id);
CREATE INDEX idx_sso_sessions_user ON sso_sessions(user_id, expires_at DESC);
CREATE INDEX idx_sso_sessions_org ON sso_sessions(organization_id, expires_at DESC);

-- RLS Policies
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_auth_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_user_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;

-- Organization owners/admins can manage SSO providers
CREATE POLICY "Organization admins can manage SSO providers"
  ON sso_providers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = sso_providers.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view SSO auth attempts
CREATE POLICY "Organization admins can view SSO attempts"
  ON sso_auth_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = sso_auth_attempts.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Users can view their own SSO mappings
CREATE POLICY "Users can view their SSO mappings"
  ON sso_user_mappings FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = sso_user_mappings.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Users can view their own SSO sessions
CREATE POLICY "Users can view their SSO sessions"
  ON sso_sessions FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = sso_sessions.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Function to check if email domain requires SSO
CREATE OR REPLACE FUNCTION check_sso_required(user_email TEXT)
RETURNS TABLE(
  required BOOLEAN,
  provider_id UUID,
  organization_id UUID,
  provider_type TEXT,
  provider_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.enforce_sso as required,
    sp.id as provider_id,
    sp.organization_id,
    sp.provider_type,
    sp.provider_name
  FROM sso_providers sp
  WHERE sp.is_active = true
    AND sp.enforce_sso = true
    AND EXISTS (
      SELECT 1 FROM unnest(sp.domains) as domain
      WHERE user_email ILIKE '%@' || domain
    )
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-provision user from SSO
CREATE OR REPLACE FUNCTION auto_provision_sso_user(
  p_organization_id UUID,
  p_provider_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_idp_user_id TEXT,
  p_idp_attributes JSONB
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_default_role TEXT;
BEGIN
  -- Get default role for auto-provisioned users
  SELECT default_role INTO v_default_role
  FROM sso_providers
  WHERE id = p_provider_id;

  -- Check if user already exists
  SELECT id INTO v_user_id
  FROM users
  WHERE email = p_email;

  -- If user doesn't exist, create them
  IF v_user_id IS NULL THEN
    INSERT INTO users (email, full_name, email_confirmed)
    VALUES (p_email, CONCAT(p_first_name, ' ', p_last_name), true)
    RETURNING id INTO v_user_id;
  END IF;

  -- Check if user is already a member of the organization
  IF NOT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = p_organization_id
      AND user_id = v_user_id
  ) THEN
    -- Add user to organization
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (p_organization_id, v_user_id, v_default_role);
  END IF;

  -- Create or update SSO user mapping
  INSERT INTO sso_user_mappings (
    organization_id,
    provider_id,
    user_id,
    idp_user_id,
    idp_email,
    idp_attributes,
    last_login_at
  )
  VALUES (
    p_organization_id,
    p_provider_id,
    v_user_id,
    p_idp_user_id,
    p_email,
    p_idp_attributes,
    NOW()
  )
  ON CONFLICT (provider_id, idp_user_id)
  DO UPDATE SET
    last_login_at = NOW(),
    idp_attributes = EXCLUDED.idp_attributes;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_sso_providers_updated_at
  BEFORE UPDATE ON sso_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sso_user_mappings_updated_at
  BEFORE UPDATE ON sso_user_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE sso_providers IS 'SSO provider configurations per organization (SAML, OAuth, OIDC)';
COMMENT ON TABLE sso_auth_attempts IS 'Audit log of SSO authentication attempts';
COMMENT ON TABLE sso_user_mappings IS 'Map IdP user identifiers to platform users';
COMMENT ON TABLE sso_sessions IS 'Active SSO sessions for Single Logout support';
COMMENT ON FUNCTION check_sso_required IS 'Check if email domain requires SSO authentication';
COMMENT ON FUNCTION auto_provision_sso_user IS 'Auto-create user and organization membership from SSO login';
