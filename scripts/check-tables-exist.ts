/**
 * Check which tables actually exist in the database
 * by querying information_schema via a custom RPC or direct check
 */

import { createScriptAdminClient } from './lib/supabase-admin';

const supabase = createScriptAdminClient();

// Tables that showed "not in schema cache" error
const tablesToCheck = [
  'organization_invitations',
  'course_progress',
  'course_reviews',
  'sessions',
  'session_bookings',
  'coupons',
  'api_keys',
  'webhooks',
  'webhook_deliveries',
  'credit_balances',
  'credit_transactions',
  'waitlist',
  'activity_logs',
  'audit_export_access_log',
  'subscription_items',
  'sso_providers',
  'sso_sessions',
  'sso_auth_attempts',
];

async function checkTablesExist() {
  console.log('Checking if tables actually exist in the database...\n');
  console.log('(Tables in schema cache return empty result, tables NOT in DB return specific error)\n');

  const exists: string[] = [];
  const doesNotExist: string[] = [];
  const inSchemaCache: string[] = [];

  for (const table of tablesToCheck) {
    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (!error) {
      // Table exists and is in schema cache
      inSchemaCache.push(table);
    } else if (error.message.includes('does not exist') || error.message.includes('relation')) {
      // Table doesn't exist at all
      doesNotExist.push(table);
    } else if (error.message.includes('schema cache')) {
      // Table exists but not in schema cache - need to check differently
      // Try to insert and see if we get a different error
      const { error: insertError } = await supabase.from(table).insert({}).select();

      if (insertError?.message.includes('does not exist') || insertError?.message.includes('relation')) {
        doesNotExist.push(table);
      } else {
        // Table exists, just not exposed
        exists.push(table);
      }
    } else {
      console.log(`  ${table}: Unknown error - ${error.message}`);
    }
  }

  console.log(`✅ IN SCHEMA CACHE (accessible): ${inSchemaCache.length}`);
  inSchemaCache.forEach(t => console.log(`   ${t}`));

  console.log(`\n🔶 EXISTS BUT NOT IN SCHEMA CACHE: ${exists.length}`);
  exists.forEach(t => console.log(`   ${t}`));

  console.log(`\n❌ DOES NOT EXIST (need to create): ${doesNotExist.length}`);
  doesNotExist.forEach(t => console.log(`   ${t}`));

  // Generate SQL to create missing tables
  if (doesNotExist.length > 0) {
    console.log('\n\n--- SQL to create missing tables ---\n');
    console.log('Run this in Supabase SQL Editor:\n');

    for (const table of doesNotExist) {
      console.log(`-- TODO: Create ${table} table`);
    }
  }
}

checkTablesExist().catch(console.error);
