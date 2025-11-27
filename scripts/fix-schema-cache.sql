-- Fix PostgREST schema cache for missing tables
-- Run this in Supabase Dashboard -> SQL Editor

-- Step 1: Enable RLS on all missing tables
-- (PostgREST requires RLS to be enabled for tables to be exposed)

ALTER TABLE IF EXISTS organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS session_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_export_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sso_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sso_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS sso_auth_attempts ENABLE ROW LEVEL SECURITY;

-- Step 2: Add permissive policies for service_role access
-- (These policies allow service_role full access while keeping data secure)

-- organization_invitations
DROP POLICY IF EXISTS "service_role_all_organization_invitations" ON organization_invitations;
CREATE POLICY "service_role_all_organization_invitations" ON organization_invitations
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- course_progress
DROP POLICY IF EXISTS "service_role_all_course_progress" ON course_progress;
CREATE POLICY "service_role_all_course_progress" ON course_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- course_reviews
DROP POLICY IF EXISTS "service_role_all_course_reviews" ON course_reviews;
CREATE POLICY "service_role_all_course_reviews" ON course_reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sessions
DROP POLICY IF EXISTS "service_role_all_sessions" ON sessions;
CREATE POLICY "service_role_all_sessions" ON sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- session_bookings
DROP POLICY IF EXISTS "service_role_all_session_bookings" ON session_bookings;
CREATE POLICY "service_role_all_session_bookings" ON session_bookings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- coupons
DROP POLICY IF EXISTS "service_role_all_coupons" ON coupons;
CREATE POLICY "service_role_all_coupons" ON coupons
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- api_keys
DROP POLICY IF EXISTS "service_role_all_api_keys" ON api_keys;
CREATE POLICY "service_role_all_api_keys" ON api_keys
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- webhooks
DROP POLICY IF EXISTS "service_role_all_webhooks" ON webhooks;
CREATE POLICY "service_role_all_webhooks" ON webhooks
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- webhook_deliveries
DROP POLICY IF EXISTS "service_role_all_webhook_deliveries" ON webhook_deliveries;
CREATE POLICY "service_role_all_webhook_deliveries" ON webhook_deliveries
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- credit_balances
DROP POLICY IF EXISTS "service_role_all_credit_balances" ON credit_balances;
CREATE POLICY "service_role_all_credit_balances" ON credit_balances
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- credit_transactions
DROP POLICY IF EXISTS "service_role_all_credit_transactions" ON credit_transactions;
CREATE POLICY "service_role_all_credit_transactions" ON credit_transactions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- waitlist
DROP POLICY IF EXISTS "service_role_all_waitlist" ON waitlist;
CREATE POLICY "service_role_all_waitlist" ON waitlist
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- activity_logs
DROP POLICY IF EXISTS "service_role_all_activity_logs" ON activity_logs;
CREATE POLICY "service_role_all_activity_logs" ON activity_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- audit_export_access_log
DROP POLICY IF EXISTS "service_role_all_audit_export_access_log" ON audit_export_access_log;
CREATE POLICY "service_role_all_audit_export_access_log" ON audit_export_access_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- subscription_items
DROP POLICY IF EXISTS "service_role_all_subscription_items" ON subscription_items;
CREATE POLICY "service_role_all_subscription_items" ON subscription_items
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sso_providers
DROP POLICY IF EXISTS "service_role_all_sso_providers" ON sso_providers;
CREATE POLICY "service_role_all_sso_providers" ON sso_providers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sso_sessions
DROP POLICY IF EXISTS "service_role_all_sso_sessions" ON sso_sessions;
CREATE POLICY "service_role_all_sso_sessions" ON sso_sessions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- sso_auth_attempts
DROP POLICY IF EXISTS "service_role_all_sso_auth_attempts" ON sso_auth_attempts;
CREATE POLICY "service_role_all_sso_auth_attempts" ON sso_auth_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Step 3: Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- Done! The tables should now be accessible via the API.
-- Run the check-postgrest-tables.ts script again to verify.
