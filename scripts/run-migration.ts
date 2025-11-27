/**
 * Script to run SQL migration against Supabase database
 * Uses the Supabase Management API to execute SQL
 *
 * Usage: npx tsx scripts/run-migration.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Read .env file manually
function loadEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const eqIndex = trimmedLine.indexOf('=');
    if (eqIndex > 0) {
      const key = trimmedLine.substring(0, eqIndex).trim();
      let value = trimmedLine.substring(eqIndex + 1).trim();
      // Remove quotes if present
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
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Extract project ref from URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

async function runSqlViaManagementApi(sql: string): Promise<{ success: boolean; error?: string }> {
  // Try the SQL endpoint
  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    return { success: false, error: `HTTP ${response.status}` };
  }

  return { success: true };
}

async function main() {
  console.log('=== Supabase Database Migration ===\n');
  console.log(`Project: ${projectRef}`);
  console.log(`URL: ${supabaseUrl}\n`);

  // Read the SQL file
  const sqlPath = path.join(__dirname, 'add-missing-tables.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  console.log('Migration SQL file ready: scripts/add-missing-tables.sql\n');

  console.log('Since direct SQL execution requires a database connection,');
  console.log('please run the migration manually:\n');

  console.log('OPTION 1: Supabase Dashboard (Recommended)');
  console.log('=========================================');
  console.log(`1. Go to: https://supabase.com/dashboard/project/${projectRef}/sql/new`);
  console.log('2. Copy the SQL from: scripts/add-missing-tables.sql');
  console.log('3. Paste and click "Run"\n');

  console.log('OPTION 2: Supabase CLI with linked project');
  console.log('==========================================');
  console.log('1. npx supabase login');
  console.log(`2. npx supabase link --project-ref ${projectRef}`);
  console.log('3. npx supabase db push\n');

  console.log('OPTION 3: Direct psql connection');
  console.log('================================');
  console.log(`1. Get connection string from: https://supabase.com/dashboard/project/${projectRef}/settings/database`);
  console.log('2. psql "your-connection-string" -f scripts/add-missing-tables.sql\n');

  // Output a simplified version of the critical tables
  console.log('=== Quick Copy: Critical Tables ===\n');

  const criticalSql = `
-- Run this in Supabase SQL Editor to create missing tables

-- Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  progress_percentage NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, course_id)
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

-- Assessment Results
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  element_scores JSONB NOT NULL,
  top_element VARCHAR(50),
  personality_traits JSONB,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- Credit Warnings
CREATE TABLE IF NOT EXISTS credit_warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  warning_type VARCHAR(50) NOT NULL,
  threshold INTEGER NOT NULL,
  current_balance INTEGER NOT NULL,
  notified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE credit_warnings ENABLE ROW LEVEL SECURITY;

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Assignment Submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'submitted',
  score NUMERIC(5,2),
  feedback TEXT,
  graded_by UUID REFERENCES profiles(id),
  graded_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Event Registrations
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  ticket_type VARCHAR(100),
  ticket_price NUMERIC(10,2),
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own registrations" ON event_registrations FOR SELECT USING (auth.uid() = user_id);

-- Add enrollment_count to courses
ALTER TABLE courses ADD COLUMN IF NOT EXISTS enrollment_count INTEGER DEFAULT 0;
`;

  console.log(criticalSql);

  // Also save to a simpler file
  const simpleSqlPath = path.join(__dirname, 'quick-migration.sql');
  fs.writeFileSync(simpleSqlPath, criticalSql);
  console.log(`\nSimplified SQL saved to: scripts/quick-migration.sql`);
}

main().catch(console.error);
