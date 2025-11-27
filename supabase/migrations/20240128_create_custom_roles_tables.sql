/**
 * Custom Roles & Permissions Tables Migration
 * Advanced RBAC system for enterprise organizations
 */

-- Permission definitions (system-wide available permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Permission identity
  code TEXT UNIQUE NOT NULL, -- 'credits.read', 'members.write', 'billing.manage'
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'organization', 'members', 'credits', 'billing', 'analytics', 'api', 'webhooks'

  -- Danger level (for UI warnings)
  is_dangerous BOOLEAN DEFAULT false, -- True for destructive actions

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom roles per organization
CREATE TABLE IF NOT EXISTS organization_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Role details
  name TEXT NOT NULL,
  description TEXT,
  color TEXT, -- Hex color for UI display

  -- Type
  is_system BOOLEAN DEFAULT false, -- True for built-in roles (owner, admin, member)
  is_default BOOLEAN DEFAULT false, -- True for default role for new members

  -- Permissions (array of permission codes)
  permissions TEXT[] NOT NULL DEFAULT '{}',

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id, name)
);

-- Role assignments history (audit trail)
CREATE TABLE IF NOT EXISTS role_assignment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Assignment details
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES organization_roles(id) ON DELETE SET NULL,
  old_role_id UUID REFERENCES organization_roles(id) ON DELETE SET NULL,

  -- Change tracking
  action TEXT NOT NULL, -- 'assigned', 'removed', 'changed'
  changed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_permissions_category ON permissions(category);
CREATE INDEX idx_permissions_code ON permissions(code);
CREATE INDEX idx_org_roles_organization ON organization_roles(organization_id);
CREATE INDEX idx_org_roles_system ON organization_roles(organization_id, is_system);
CREATE INDEX idx_role_history_user ON role_assignment_history(user_id, created_at DESC);
CREATE INDEX idx_role_history_org ON role_assignment_history(organization_id, created_at DESC);

-- RLS Policies
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_assignment_history ENABLE ROW LEVEL SECURITY;

-- Anyone can view available permissions (for role creation UI)
CREATE POLICY "Anyone authenticated can view permissions"
  ON permissions FOR SELECT
  TO authenticated
  USING (true);

-- Organization members can view roles
CREATE POLICY "Organization members can view roles"
  ON organization_roles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_roles.organization_id
        AND organization_members.user_id = auth.uid()
    )
  );

-- Organization owners can manage roles
CREATE POLICY "Organization owners can manage roles"
  ON organization_roles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = organization_roles.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role = 'owner'
    )
  );

-- Organization admins can view role history
CREATE POLICY "Organization admins can view role history"
  ON role_assignment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = role_assignment_history.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Seed system permissions
INSERT INTO permissions (code, name, description, category, is_dangerous) VALUES
  -- Organization
  ('org.read', 'View Organization', 'View organization details and settings', 'organization', false),
  ('org.update', 'Update Organization', 'Update organization settings', 'organization', false),
  ('org.delete', 'Delete Organization', 'Delete the entire organization', 'organization', true),

  -- Members
  ('members.read', 'View Members', 'View organization members', 'members', false),
  ('members.invite', 'Invite Members', 'Invite new members to organization', 'members', false),
  ('members.update', 'Update Members', 'Update member roles and permissions', 'members', false),
  ('members.remove', 'Remove Members', 'Remove members from organization', 'members', true),

  -- Roles
  ('roles.read', 'View Roles', 'View custom roles', 'members', false),
  ('roles.create', 'Create Roles', 'Create custom roles', 'members', false),
  ('roles.update', 'Update Roles', 'Update role permissions', 'members', false),
  ('roles.delete', 'Delete Roles', 'Delete custom roles', 'members', true),

  -- Credits
  ('credits.read', 'View Credits', 'View credit balances and transactions', 'credits', false),
  ('credits.purchase', 'Purchase Credits', 'Purchase credits for the organization', 'credits', false),
  ('credits.manage', 'Manage Credits', 'Add or subtract credits manually', 'credits', false),

  -- API Keys
  ('api_keys.read', 'View API Keys', 'View API keys', 'api', false),
  ('api_keys.create', 'Create API Keys', 'Create new API keys', 'api', false),
  ('api_keys.revoke', 'Revoke API Keys', 'Revoke API keys', 'api', true),

  -- Webhooks
  ('webhooks.read', 'View Webhooks', 'View webhook endpoints', 'webhooks', false),
  ('webhooks.create', 'Create Webhooks', 'Create webhook endpoints', 'webhooks', false),
  ('webhooks.update', 'Update Webhooks', 'Update webhook configuration', 'webhooks', false),
  ('webhooks.delete', 'Delete Webhooks', 'Delete webhook endpoints', 'webhooks', true),
  ('webhooks.test', 'Test Webhooks', 'Send test webhook events', 'webhooks', false),

  -- Analytics
  ('analytics.read', 'View Analytics', 'View analytics and usage metrics', 'analytics', false),
  ('reports.read', 'View Reports', 'View generated reports', 'analytics', false),
  ('reports.create', 'Create Reports', 'Generate custom reports', 'analytics', false),
  ('reports.export', 'Export Reports', 'Export reports to CSV/JSON', 'analytics', false),

  -- Billing
  ('billing.read', 'View Billing', 'View billing and subscription information', 'billing', false),
  ('billing.manage', 'Manage Billing', 'Manage subscriptions and payment methods', 'billing', false),
  ('invoices.read', 'View Invoices', 'View invoice history', 'billing', false),

  -- SSO
  ('sso.read', 'View SSO', 'View SSO configuration', 'sso', false),
  ('sso.manage', 'Manage SSO', 'Configure SSO providers', 'sso', false),

  -- Audit
  ('audit.read', 'View Audit Log', 'View activity audit log', 'audit', false),
  ('audit.export', 'Export Audit Log', 'Export audit logs for compliance', 'audit', false),

  -- Rate Limits
  ('rate_limits.read', 'View Rate Limits', 'View rate limit configuration', 'api', false),
  ('rate_limits.manage', 'Manage Rate Limits', 'Update rate limit tier', 'api', false)
ON CONFLICT (code) DO NOTHING;

-- Function to get user permissions in an organization
CREATE OR REPLACE FUNCTION get_user_permissions(
  p_user_id UUID,
  p_organization_id UUID
)
RETURNS TEXT[] AS $$
DECLARE
  v_role TEXT;
  v_role_id UUID;
  v_permissions TEXT[];
BEGIN
  -- Get user's role in organization
  SELECT om.role, om.role_id
  INTO v_role, v_role_id
  FROM organization_members om
  WHERE om.user_id = p_user_id
    AND om.organization_id = p_organization_id;

  -- If not a member, return empty
  IF v_role IS NULL THEN
    RETURN '{}';
  END IF;

  -- If using custom role, return role's permissions
  IF v_role_id IS NOT NULL THEN
    SELECT permissions
    INTO v_permissions
    FROM organization_roles
    WHERE id = v_role_id;

    RETURN COALESCE(v_permissions, '{}');
  END IF;

  -- Otherwise return system role permissions
  CASE v_role
    WHEN 'owner' THEN
      -- Owners have all permissions
      RETURN ARRAY(SELECT code FROM permissions);

    WHEN 'admin' THEN
      -- Admins have most permissions except dangerous org operations
      RETURN ARRAY(
        SELECT code FROM permissions
        WHERE code NOT IN ('org.delete', 'roles.delete')
      );

    WHEN 'member' THEN
      -- Members have read-only permissions
      RETURN ARRAY(
        SELECT code FROM permissions
        WHERE code LIKE '%.read'
      );

    ELSE
      RETURN '{}';
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
  p_user_id UUID,
  p_organization_id UUID,
  p_permission_code TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_permissions TEXT[];
BEGIN
  v_permissions := get_user_permissions(p_user_id, p_organization_id);
  RETURN p_permission_code = ANY(v_permissions);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add role_id column to organization_members (for custom roles)
ALTER TABLE organization_members
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES organization_roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_org_members_role_id ON organization_members(role_id);

-- Trigger to log role changes
CREATE OR REPLACE FUNCTION log_role_assignment()
RETURNS TRIGGER AS $$
BEGIN
  -- On INSERT
  IF TG_OP = 'INSERT' THEN
    INSERT INTO role_assignment_history (
      organization_id,
      user_id,
      role_id,
      action,
      changed_by
    ) VALUES (
      NEW.organization_id,
      NEW.user_id,
      NEW.role_id,
      'assigned',
      NEW.user_id -- On initial insert, user assigns themselves (via invitation acceptance)
    );
    RETURN NEW;
  END IF;

  -- On UPDATE (role change)
  IF TG_OP = 'UPDATE' AND (OLD.role IS DISTINCT FROM NEW.role OR OLD.role_id IS DISTINCT FROM NEW.role_id) THEN
    INSERT INTO role_assignment_history (
      organization_id,
      user_id,
      role_id,
      old_role_id,
      action,
      changed_by
    ) VALUES (
      NEW.organization_id,
      NEW.user_id,
      NEW.role_id,
      OLD.role_id,
      'changed',
      auth.uid() -- Current user making the change
    );
    RETURN NEW;
  END IF;

  -- On DELETE
  IF TG_OP = 'DELETE' THEN
    INSERT INTO role_assignment_history (
      organization_id,
      user_id,
      old_role_id,
      action,
      changed_by
    ) VALUES (
      OLD.organization_id,
      OLD.user_id,
      OLD.role_id,
      'removed',
      auth.uid() -- Current user making the change
    );
    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_log_role_assignment ON organization_members;
CREATE TRIGGER trigger_log_role_assignment
  AFTER INSERT OR UPDATE OR DELETE ON organization_members
  FOR EACH ROW
  EXECUTE FUNCTION log_role_assignment();

-- Trigger for updated_at
CREATE TRIGGER update_organization_roles_updated_at
  BEFORE UPDATE ON organization_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE permissions IS 'System-wide permission definitions';
COMMENT ON TABLE organization_roles IS 'Custom roles per organization with permission sets';
COMMENT ON TABLE role_assignment_history IS 'Audit trail of role assignments and changes';
COMMENT ON FUNCTION get_user_permissions IS 'Get all permissions for a user in an organization';
COMMENT ON FUNCTION user_has_permission IS 'Check if user has specific permission';
