import { Database } from '@/lib/types/supabase';
import { createBrowserClient } from '@supabase/ssr';

/**
 * Client-side Supabase client for Browser
 * Singleton instance to prevent multiple clients
 */
let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createClient() {
  if (client) return client;

  client = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return client;
}
