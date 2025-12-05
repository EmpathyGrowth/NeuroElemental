import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with Service Role privileges
 * BYPASSES RLS - USE WITH CAUTION
 * Only for use in secure server-side contexts (API routes, Server Actions)
 */
export function createAdminClient(): SupabaseClient<Database> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      logger.error('Missing NEXT_PUBLIC_SUPABASE_URL in createAdminClient');
      // Return a non-functional client rather than crashing the app modules
      // This allows the app to start, and calls will fail gracefully later
      return createClient<Database>('https://placeholder.supabase.co', 'placeholder', {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
    }

    // Fallback to anon key if service role key is missing
    const keyToUse = supabaseKey || supabaseAnonKey;

    if (!keyToUse) {
      logger.error('Missing both SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_ANON_KEY');
      return createClient<Database>(supabaseUrl, 'placeholder', {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
      });
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
  } catch (error) {
    logger.error('CRITICAL: createAdminClient failed initialization', error as Error);
    // Return a dummy client to prevent module crash
    return createClient<Database>('https://placeholder.supabase.co', 'placeholder', {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    });
  }
}
