/**
 * Audit Log Export Tables Migration
 * Export activity logs for compliance and data portability
 */

-- Export jobs tracking
CREATE TABLE IF NOT EXISTS audit_export_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Export configuration
  export_format TEXT NOT NULL, -- 'csv', 'json', 'xlsx'

  -- Filters
  date_from TIMESTAMPTZ NOT NULL,
  date_to TIMESTAMPTZ NOT NULL,
  event_types TEXT[], -- Filter by action types
  user_ids UUID[], -- Filter by specific users
  entity_types TEXT[], -- Filter by entity types

  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'

  -- Results
  total_records INT DEFAULT 0,
  file_size_bytes BIGINT,
  file_url TEXT, -- Signed URL to download file
  file_path TEXT, -- Storage path
  expires_at TIMESTAMPTZ, -- URL expiration

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled export configurations
CREATE TABLE IF NOT EXISTS audit_export_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Schedule configuration
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  day_of_week INT, -- 0-6 for weekly (0 = Sunday)
  day_of_month INT, -- 1-31 for monthly
  time_of_day TIME NOT NULL DEFAULT '00:00:00', -- HH:MM:SS

  -- Export configuration
  export_format TEXT NOT NULL, -- 'csv', 'json', 'xlsx'

  -- Filters
  lookback_days INT NOT NULL DEFAULT 30, -- How many days back to export
  event_types TEXT[], -- Filter by action types
  user_ids UUID[], -- Filter by specific users
  entity_types TEXT[], -- Filter by entity types

  -- Notification
  notify_emails TEXT[], -- Email addresses to notify when export is ready

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMPTZ,
  next_run_at TIMESTAMPTZ,

  -- Metadata
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Export access log (who downloaded what)
CREATE TABLE IF NOT EXISTS audit_export_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  export_job_id UUID NOT NULL REFERENCES audit_export_jobs(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Access details
  accessed_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_export_jobs_org ON audit_export_jobs(organization_id, created_at DESC);
CREATE INDEX idx_export_jobs_status ON audit_export_jobs(status, created_at DESC);
CREATE INDEX idx_export_jobs_created_by ON audit_export_jobs(created_by, created_at DESC);
CREATE INDEX idx_export_schedules_org ON audit_export_schedules(organization_id, is_active);
CREATE INDEX idx_export_schedules_next_run ON audit_export_schedules(next_run_at, is_active) WHERE is_active = true;
CREATE INDEX idx_export_access_log_export ON audit_export_access_log(export_job_id, created_at DESC);

-- RLS Policies
ALTER TABLE audit_export_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_export_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_export_access_log ENABLE ROW LEVEL SECURITY;

-- Organization admins can manage export jobs
CREATE POLICY "Organization admins can manage export jobs"
  ON audit_export_jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audit_export_jobs.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can manage export schedules
CREATE POLICY "Organization admins can manage export schedules"
  ON audit_export_schedules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audit_export_schedules.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Organization admins can view export access logs
CREATE POLICY "Organization admins can view export access logs"
  ON audit_export_access_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_members.organization_id = audit_export_access_log.organization_id
        AND organization_members.user_id = auth.uid()
        AND organization_members.role IN ('owner', 'admin')
    )
  );

-- Function to calculate next run time for scheduled exports
CREATE OR REPLACE FUNCTION calculate_next_export_run(
  p_frequency TEXT,
  p_day_of_week INT,
  p_day_of_month INT,
  p_time_of_day TIME,
  p_from_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  v_next_run TIMESTAMPTZ;
  v_target_time TIMESTAMPTZ;
BEGIN
  -- Start from the provided date
  v_target_time := p_from_date;

  CASE p_frequency
    WHEN 'daily' THEN
      -- Next occurrence of time_of_day
      v_target_time := DATE_TRUNC('day', v_target_time) + p_time_of_day;
      IF v_target_time <= p_from_date THEN
        v_target_time := v_target_time + INTERVAL '1 day';
      END IF;
      v_next_run := v_target_time;

    WHEN 'weekly' THEN
      -- Next occurrence of day_of_week at time_of_day
      v_target_time := DATE_TRUNC('week', v_target_time) + (p_day_of_week || ' days')::INTERVAL + p_time_of_day;
      WHILE v_target_time <= p_from_date LOOP
        v_target_time := v_target_time + INTERVAL '1 week';
      END LOOP;
      v_next_run := v_target_time;

    WHEN 'monthly' THEN
      -- Next occurrence of day_of_month at time_of_day
      v_target_time := DATE_TRUNC('month', v_target_time) + ((p_day_of_month - 1) || ' days')::INTERVAL + p_time_of_day;
      WHILE v_target_time <= p_from_date LOOP
        v_target_time := v_target_time + INTERVAL '1 month';
      END LOOP;
      v_next_run := v_target_time;

    ELSE
      RAISE EXCEPTION 'Invalid frequency: %', p_frequency;
  END CASE;

  RETURN v_next_run;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger to calculate next_run_at on insert/update
CREATE OR REPLACE FUNCTION update_export_schedule_next_run()
RETURNS TRIGGER AS $$
BEGIN
  NEW.next_run_at := calculate_next_export_run(
    NEW.frequency,
    NEW.day_of_week,
    NEW.day_of_month,
    NEW.time_of_day,
    COALESCE(NEW.last_run_at, NOW())
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_export_schedule_next_run
  BEFORE INSERT OR UPDATE ON audit_export_schedules
  FOR EACH ROW
  WHEN (NEW.is_active = true)
  EXECUTE FUNCTION update_export_schedule_next_run();

-- Function to get audit log records for export
CREATE OR REPLACE FUNCTION get_audit_log_for_export(
  p_organization_id UUID,
  p_date_from TIMESTAMPTZ,
  p_date_to TIMESTAMPTZ,
  p_event_types TEXT[] DEFAULT NULL,
  p_user_ids UUID[] DEFAULT NULL,
  p_entity_types TEXT[] DEFAULT NULL,
  p_limit INT DEFAULT NULL,
  p_offset INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  organization_id UUID,
  user_id UUID,
  user_email TEXT,
  user_name TEXT,
  action_type TEXT,
  entity_type TEXT,
  entity_id TEXT,
  description TEXT,
  metadata JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    oal.id,
    oal.organization_id,
    oal.user_id,
    u.email as user_email,
    u.full_name as user_name,
    oal.action_type,
    oal.entity_type,
    oal.entity_id,
    oal.description,
    oal.metadata,
    oal.ip_address,
    oal.user_agent,
    oal.created_at
  FROM organization_activity_log oal
  LEFT JOIN users u ON u.id = oal.user_id
  WHERE oal.organization_id = p_organization_id
    AND oal.created_at >= p_date_from
    AND oal.created_at <= p_date_to
    AND (p_event_types IS NULL OR oal.action_type = ANY(p_event_types))
    AND (p_user_ids IS NULL OR oal.user_id = ANY(p_user_ids))
    AND (p_entity_types IS NULL OR oal.entity_type = ANY(p_entity_types))
  ORDER BY oal.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for updated_at
CREATE TRIGGER update_audit_export_jobs_updated_at
  BEFORE UPDATE ON audit_export_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_export_schedules_updated_at
  BEFORE UPDATE ON audit_export_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE audit_export_jobs IS 'Export jobs for audit logs (compliance and data portability)';
COMMENT ON TABLE audit_export_schedules IS 'Scheduled audit log exports';
COMMENT ON TABLE audit_export_access_log IS 'Track who accessed/downloaded exported audit logs';
COMMENT ON FUNCTION get_audit_log_for_export IS 'Fetch audit log records with filters for export';
COMMENT ON FUNCTION calculate_next_export_run IS 'Calculate next scheduled export run time';
