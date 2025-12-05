/**
 * Check which tables PostgREST can see via the REST API
 * This helps identify tables that need to be exposed
 */

import { createScriptAdminClient } from './lib/supabase-admin';

const supabase = createScriptAdminClient();

// All tables we expect to exist
const expectedTables = [
  'profiles',
  'organizations',
  'organization_members',
  'organization_invitations',
  'courses',
  'course_modules',
  'course_lessons',
  'course_enrollments',
  'enrollments',
  'course_progress',
  'course_reviews',
  'lesson_completions',
  'events',
  'event_registrations',
  'sessions',
  'session_bookings',
  'products',
  'coupons',
  'orders',
  'order_items',
  'api_keys',
  'webhooks',
  'webhook_deliveries',
  'credit_balances',
  'credit_transactions',
  'credit_warnings',
  'waitlist',
  'notifications',
  'activity_logs',
  'assessment_results',
  'assignment_submissions',
  'scheduled_emails',
  'email_preferences',
  'logs',
  'audit_export_jobs',
  'audit_export_schedules',
  'audit_export_access_log',
  'organization_roles',
  'permissions',
  'role_assignment_history',
  'subscriptions',
  'subscription_items',
  'sso_providers',
  'sso_sessions',
  'sso_auth_attempts',
];

async function checkTables() {
  console.log('Checking table accessibility via PostgREST API...\n');

  const accessible: string[] = [];
  const notInSchemaCache: string[] = [];
  const otherErrors: string[] = [];

  for (const table of expectedTables) {
    const { error } = await supabase.from(table).select('id').limit(0);

    if (!error) {
      accessible.push(table);
    } else if (error.message.includes('schema cache')) {
      notInSchemaCache.push(table);
    } else {
      otherErrors.push(`${table}: ${error.message}`);
    }
  }

  console.log(`✅ ACCESSIBLE TABLES (${accessible.length}):`);
  accessible.forEach(t => console.log(`   ${t}`));

  console.log(`\n❌ NOT IN SCHEMA CACHE (${notInSchemaCache.length}):`);
  notInSchemaCache.forEach(t => console.log(`   ${t}`));

  if (otherErrors.length > 0) {
    console.log(`\n⚠️  OTHER ERRORS (${otherErrors.length}):`);
    otherErrors.forEach(e => console.log(`   ${e}`));
  }

  console.log('\n--- Summary ---');
  console.log(`Total: ${expectedTables.length} tables`);
  console.log(`Accessible: ${accessible.length}`);
  console.log(`Not in schema cache: ${notInSchemaCache.length}`);

  if (notInSchemaCache.length > 0) {
    console.log('\n--- To fix ---');
    console.log('These tables exist but are not exposed via PostgREST.');
    console.log('Go to Supabase Dashboard -> Database -> Tables and ensure these tables:');
    console.log('1. Have RLS enabled (can be with permissive policies)');
    console.log('2. Are not excluded from the API in the settings');
    console.log('\nAlternatively, run this SQL in Supabase SQL Editor:');
    console.log("   NOTIFY pgrst, 'reload schema';");
  }
}

checkTables().catch(console.error);
