import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with Service Role privileges
 * BYPASSES RLS - USE WITH CAUTION
 * Only for use in secure server-side contexts (API routes, Server Actions)
 */
export function createAdminClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    logger.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    throw new Error('Supabase configuration error: Missing NEXT_PUBLIC_SUPABASE_URL');
  }

  // Fallback to anon key if service role key is missing
  // This allows public read operations to work, but admin writes will fail with RLS error
  const keyToUse = supabaseKey || supabaseAnonKey;

  if (!keyToUse) {
    logger.error('Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    throw new Error('Supabase configuration error: Missing API keys');
  }

  if (!supabaseKey) {
    logger.warn('Missing SUPABASE_SERVICE_ROLE_KEY, falling back to ANON key. Admin operations may fail.');
  }

  return createClient<Database>(supabaseUrl, keyToUse, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
