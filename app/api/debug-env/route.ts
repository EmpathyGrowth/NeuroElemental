
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: url ? `${url.substring(0, 10)}...` : 'MISSING',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: anon ? 'SET' : 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: service ? 'SET' : 'MISSING',
      NODE_ENV: process.env.NODE_ENV,
    },
    sentry: {
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN ? 'SET' : 'MISSING',
    }
  });
}
