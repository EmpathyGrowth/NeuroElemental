/**
 * Test endpoint with Supabase admin client
 */

import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ 
      status: 'ok',
      dbConnected: !error,
      error: error?.message || null,
    })
  } catch (err) {
    return NextResponse.json({ 
      status: 'error',
      message: err instanceof Error ? err.message : String(err),
    }, { status: 500 })
  }
}
