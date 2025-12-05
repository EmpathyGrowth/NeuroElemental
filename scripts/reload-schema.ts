/**
 * Reload PostgREST schema cache
 */

import { createScriptAdminClient } from './lib/supabase-admin';

const supabase = createScriptAdminClient();

async function reloadSchema() {
  console.log('Attempting to reload PostgREST schema cache...\n');

  // Try using RPC to execute the notify command
  const { error: rpcError } = await supabase.rpc('reload_schema_cache');

  if (rpcError) {
    console.log('RPC reload_schema_cache not available:', rpcError.message);
    console.log('\nTrying alternative approach via SQL...\n');

    // Try executing raw SQL via a function
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: "NOTIFY pgrst, 'reload schema'"
    });

    if (error) {
      console.log('exec_sql not available either:', error.message);
      console.log('\nThe schema reload needs to be done via:');
      console.log('1. Supabase Dashboard -> Database -> SQL Editor');
      console.log("2. Run: NOTIFY pgrst, 'reload schema'");
      console.log('\nOr restart the PostgREST service from the Supabase dashboard.');
      return;
    }

    console.log('Schema reload executed via exec_sql:', data);
  } else {
    console.log('Schema cache reload initiated successfully!');
  }

  // Verify by checking a few tables
  console.log('\nVerifying table access...\n');

  const tablesToCheck = [
    'scheduled_emails',
    'email_preferences',
    'webhooks',
    'webhook_deliveries',
    'api_keys',
    'credit_balances',
    'sso_providers'
  ];

  for (const table of tablesToCheck) {
    const { error } = await supabase.from(table).select('id').limit(0);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: accessible`);
    }
  }
}

reloadSchema().catch(console.error);
