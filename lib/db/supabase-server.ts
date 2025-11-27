/**
 * Server-side Supabase client with Service Role
 * BYPASSES RLS - Use only in secure server contexts (API routes, Server Actions)
 */

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Get the server-side Supabase client with service role privileges
 * This client bypasses RLS and should only be used in API routes
 */
export function getSupabaseServer() {
  return createAdminClient()
}

// Re-export for convenience
export { createAdminClient }
