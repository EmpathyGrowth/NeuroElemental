/**
 * Server-side Supabase client with Service Role
 * BYPASSES RLS - Use only in secure server contexts (API routes, Server Actions)
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/lib/types/supabase'
// PostgrestFilterBuilder imported for type documentation purposes
import type { PostgrestFilterBuilder as _PostgrestFilterBuilder } from '@supabase/postgrest-js'

// Type alias for table names
type TableName = keyof Database['public']['Tables']

// Type helpers for table operations
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row']
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert']

/**
 * Get the server-side Supabase client with service role privileges
 * This client bypasses RLS and should only be used in API routes
 * 
 * Note: Due to TypeScript limitations with large Database types, 
 * query results may need explicit type assertions.
 * 
 * @example
 * const supabase = getSupabaseServer()
 * const { data } = await supabase.from('profiles').select('*') as { data: Profile[] | null, error: any }
 */
export function getSupabaseServer() {
  return createAdminClient()
}

/**
 * Get a typed query builder for a specific table
 * This helper provides proper type inference for table operations
 * Uses 'any' cast to avoid TypeScript combinatorial explosion with Supabase types
 * 
 * @example
 * const { data } = await getTypedTable('organizations').select('id, name')
 */
export function getTypedTable<T extends TableName>(tableName: T) {
  const supabase = createAdminClient()
   
  return supabase.from(tableName) as any
}

/**
 * Execute a typed select query on a table
 * Returns properly typed results without needing manual type assertions
 * 
 * @example
 * const profiles = await typedSelect('profiles', '*', (q) => q.eq('role', 'admin'))
 */
export async function typedSelect<T extends TableName>(
  tableName: T,
  columns: string = '*',
   
  filter?: (query: any) => any
): Promise<{ data: TableRow<T>[] | null; error: Error | null }> {
  const supabase = createAdminClient()
   
  let query = (supabase.from(tableName) as any).select(columns)
  if (filter) {
    query = filter(query)
  }
  return query
}

/**
 * Execute a typed insert on a table
 * 
 * @example
 * const { data, error } = await typedInsert('profiles', { email: 'test@example.com', id: '...' })
 */
export async function typedInsert<T extends TableName>(
  tableName: T,
  data: TableInsert<T> | TableInsert<T>[]
): Promise<{ data: TableRow<T>[] | null; error: Error | null }> {
  const supabase = createAdminClient()
   
  return (supabase.from(tableName) as any).insert(data).select()
}

// Re-export for convenience
export { createAdminClient }

// Re-export type helpers
export type { TableName, TableRow, TableInsert }
