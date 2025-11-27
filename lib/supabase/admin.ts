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

  if (!supabaseUrl || !supabaseKey) {
    logger.error('Missing Supabase environment variables for admin client');
    throw new Error('Supabase configuration error');
  }

  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
