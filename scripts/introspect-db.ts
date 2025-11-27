/**
 * Introspect Supabase database and generate TypeScript types
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

interface ColumnInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  udt_name: string;
}

// Map PostgreSQL types to TypeScript
function pgToTs(dataType: string, udtName: string, isNullable: boolean): string {
  const map: Record<string, string> = {
    'uuid': 'string',
    'text': 'string',
    'character varying': 'string',
    'varchar': 'string',
    'integer': 'number',
    'bigint': 'number',
    'smallint': 'number',
    'numeric': 'number',
    'real': 'number',
    'double precision': 'number',
    'boolean': 'boolean',
    'timestamp with time zone': 'string',
    'timestamp without time zone': 'string',
    'date': 'string',
    'time with time zone': 'string',
    'time without time zone': 'string',
    'json': 'Json',
    'jsonb': 'Json',
    'ARRAY': 'string[]',
    '_text': 'string[]',
    '_uuid': 'string[]',
    '_int4': 'number[]',
    '_varchar': 'string[]',
  };

  // Array types
  if (udtName.startsWith('_')) {
    const baseUdt = udtName.slice(1);
    const baseType = map[baseUdt] || 'string';
    return isNullable ? `${baseType}[] | null` : `${baseType}[]`;
  }

  const tsType = map[dataType] || map[udtName] || 'unknown';
  return isNullable ? `${tsType} | null` : tsType;
}

async function getTableColumns(): Promise<ColumnInfo[]> {
  // Use RPC to query information_schema
  const { data, error } = await supabase.rpc('get_schema_info');

  if (error) {
    console.log('RPC not available, using direct query approach...');

    // Query directly via PostgREST - this won't work but let's try
    // We'll have to generate types based on what we know from the codebase
    return [];
  }

  return data || [];
}

async function getAllTables(): Promise<string[]> {
  // Get list of tables by trying to access them
  const knownTables = [
    'profiles', 'organizations', 'organization_members', 'organization_invitations',
    'courses', 'course_modules', 'course_lessons', 'course_enrollments', 'enrollments',
    'course_progress', 'course_reviews', 'lesson_completions',
    'events', 'event_registrations',
    'sessions', 'session_bookings',
    'products', 'coupons', 'orders', 'order_items',
    'api_keys', 'webhooks', 'webhook_deliveries',
    'credit_balances', 'credit_transactions', 'credit_warnings',
    'waitlist', 'notifications', 'activity_logs',
    'assessment_results', 'assignment_submissions',
    'scheduled_emails', 'email_preferences', 'logs',
    'audit_export_jobs', 'audit_export_schedules', 'audit_export_access_log',
    'organization_roles', 'permissions', 'role_assignment_history',
    'subscriptions', 'subscription_items',
  ];

  const existingTables: string[] = [];

  for (const table of knownTables) {
    const { error } = await supabase.from(table).select('id').limit(0);
    if (!error || !error.message.includes('does not exist')) {
      existingTables.push(table);
    }
  }

  return existingTables;
}

async function main() {
  console.log('Introspecting database schema...\n');

  const tables = await getAllTables();
  console.log(`Found ${tables.length} tables:\n${tables.join(', ')}\n`);

  // For each table, get a sample row to infer types
  console.log('\n=== Table Schemas ===\n');

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);

    if (error) {
      console.log(`${table}: Error - ${error.message}`);
      continue;
    }

    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log(`${table}: ${columns.join(', ')}`);
    } else {
      console.log(`${table}: (empty table)`);
    }
  }
}

main().catch(console.error);
