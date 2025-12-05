/**
 * Supabase Admin Client for Scripts
 * 
 * This module provides a standardized way to create Supabase admin clients
 * in scripts that run outside the Next.js context.
 * 
 * Usage:
 *   import { createScriptAdminClient } from './lib/supabase-admin';
 *   const supabase = createScriptAdminClient();
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables from .env file
function loadEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found at project root');
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env: Record<string, string> = {};

  for (const line of envContent.split('\n')) {
    const eqIndex = line.indexOf('=');
    if (eqIndex > 0) {
      const key = line.substring(0, eqIndex).trim();
      let value = line.substring(eqIndex + 1).trim();
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

let cachedEnv: Record<string, string> | null = null;

function getEnv(): Record<string, string> {
  if (!cachedEnv) {
    cachedEnv = loadEnv();
  }
  return cachedEnv;
}

/**
 * Creates a Supabase admin client for use in scripts.
 * Uses service role key to bypass RLS.
 * 
 * @returns SupabaseClient with admin privileges
 */
export function createScriptAdminClient(): SupabaseClient {
  const env = getEnv();
  
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
      'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env'
    );
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Gets an environment variable value.
 * Useful for scripts that need other env vars.
 */
export function getEnvVar(key: string): string | undefined {
  return getEnv()[key];
}
