-- Fix PostgREST schema cache - Step by Step
-- Run each section separately in Supabase SQL Editor

-- ============================================
-- STEP 1: First, let's check what tables exist
-- ============================================
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================
-- STEP 2: Check RLS status of tables
-- ============================================
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================
-- STEP 3: Enable RLS on tables that need it
-- (Run these one at a time if you get errors)
-- ============================================

-- First batch
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Second batch
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Third batch
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_export_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sso_auth_attempts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: Add service_role policies
-- ============================================

CREATE POLICY "service_role_all" ON organization_invitations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON course_progress FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON course_reviews FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON session_bookings FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON coupons FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON api_keys FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON webhooks FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON webhook_deliveries FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON credit_balances FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON credit_transactions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON waitlist FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON activity_logs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON audit_export_access_log FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON subscription_items FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sso_providers FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sso_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_all" ON sso_auth_attempts FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================
-- STEP 5: Reload schema cache
-- ============================================
NOTIFY pgrst, 'reload schema';
