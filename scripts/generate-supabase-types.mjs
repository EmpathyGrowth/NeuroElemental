#!/usr/bin/env node
/**
 * Generate Supabase TypeScript types from the database schema
 * Uses the Supabase client to introspect the database
 *
 * REQUIRES: Environment variables SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * Usage: SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/generate-supabase-types.mjs
 */

import { createClient } from '@supabase/supabase-js';

// Read from environment variables - NEVER hardcode secrets
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('');
  console.error('Required:');
  console.error('  - SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/generate-supabase-types.mjs');
  console.error('');
  console.error('Or use the Supabase CLI with access token:');
  console.error('  SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id <project-id>');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateTypes() {
  console.log('Fetching table schemas from Supabase...');

  // Query information_schema to get all tables and columns
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (tablesError) {
    console.error('Error fetching tables:', tablesError);
    process.exit(1);
  }

  console.log(`Found ${tables?.length || 0} tables`);

  // For now, let's use the Supabase REST API to get better type information
  // We'll call the OpenAPI spec endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/?apikey=${SUPABASE_SERVICE_KEY}`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  const spec = await response.json();
  console.log('OpenAPI spec retrieved');
  console.log('Tables found:', Object.keys(spec.definitions || {}).length);

  console.log('\nNote: Full type generation requires the Supabase CLI with access token.');
  console.log('Tables in database:', tables?.map(t => t.table_name).join(', '));
  console.log('\nTo generate types properly, you need to:');
  console.log('1. Get a Supabase access token from: https://supabase.com/dashboard/account/tokens');
  console.log('2. Run: SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id <your-project-id>');
}

generateTypes().catch(console.error);
