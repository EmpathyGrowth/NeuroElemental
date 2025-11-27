/**
 * Generate TypeScript types from Supabase database using pg_dump schema introspection
 */

import { execSync } from 'child_process';

const dbUrl = 'postgresql://postgres:SUPABASE_DB_PASSWORD_PLACEHOLDER@db.ieqvhgqubvfruqfjggqf.supabase.co:5432/postgres';

try {
  console.log('Generating types from database...');
  const result = execSync(`npx supabase gen types typescript --db-url "${dbUrl}"`, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
  });
  console.log(result);
} catch (error: any) {
  console.error('Error:', error.message);
  if (error.stderr) {
    console.error('Stderr:', error.stderr);
  }
}
