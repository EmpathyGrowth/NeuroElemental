/**
 * Reload PostgREST schema cache
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Read .env file
function loadEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.substring(0, eqIndex).trim();
      let value = line.substring(eqIndex + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      env[key] = value;
    }
  }

  return env;
}

const env = loadEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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
