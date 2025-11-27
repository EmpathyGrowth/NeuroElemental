#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * This script reads and executes SQL migration files against your Supabase database.
 * Run with: node scripts/run-migrations.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials in .env file');
  console.error('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

console.log('🔧 Connecting to Supabase...');
console.log(`   URL: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Migration files to run (in order)
const migrations = [
  '001_initial_schema.sql',
  '002_rls_policies.sql',
];

async function runMigrations() {
  console.log('\n📋 Starting database migrations...\n');

  for (const migrationFile of migrations) {
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', migrationFile);

    console.log(`⏳ Running migration: ${migrationFile}`);

    try {
      // Read the SQL file
      const sql = readFileSync(migrationPath, 'utf8');

      // Execute the SQL
      // Note: Supabase client doesn't have a direct SQL execution method
      // We'll need to use the REST API or Postgres connection
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
        },
        body: JSON.stringify({ query: sql }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log(`✅ Successfully applied: ${migrationFile}\n`);
    } catch (error) {
      console.error(`❌ Error applying migration ${migrationFile}:`);
      console.error(`   ${error.message}\n`);
      console.error('⚠️  Please run this migration manually in Supabase SQL Editor:');
      console.error(`   1. Open: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
      console.error(`   2. Copy contents of: supabase/migrations/${migrationFile}`);
      console.error(`   3. Paste and click "Run"\n`);
    }
  }

  console.log('✨ Migration process complete!\n');
  console.log('📝 Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Open: http://localhost:3000/auth/signup');
  console.log('   3. Create your first account!\n');
}

// Run migrations
runMigrations().catch(console.error);
