/**
 * Generate TypeScript types from Supabase database using pg_dump schema introspection
 *
 * REQUIRES: SUPABASE_DB_URL environment variable
 * Usage: SUPABASE_DB_URL=postgresql://... npx ts-node scripts/gen-types.ts
 */

import { execSync } from 'child_process';

const dbUrl = process.env.SUPABASE_DB_URL;

if (!dbUrl) {
  console.error('❌ Error: Missing required environment variable');
  console.error('');
  console.error('Required:');
  console.error('  - SUPABASE_DB_URL (PostgreSQL connection string)');
  console.error('');
  console.error('Usage:');
  console.error('  SUPABASE_DB_URL=postgresql://... npx ts-node scripts/gen-types.ts');
  console.error('');
  console.error('Or use the Supabase CLI with access token:');
  console.error('  SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id <project-id>');
  process.exit(1);
}

try {
  console.log('Generating types from database...');
  const result = execSync(`npx supabase gen types typescript --db-url "${dbUrl}"`, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
  console.log(result);
} catch (error: unknown) {
  const err = error as { message?: string; stderr?: string };
  console.error('Error:', err.message);
  if (err.stderr) {
    console.error('Stderr:', err.stderr);
  }
}
