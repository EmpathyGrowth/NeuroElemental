
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, string> = {};

  // List of critical DB files to test individually
  // Explicitly test key modules with static strings to ensure bundling
  const modulesToTest = {
    'supabase-server': () => import('@/lib/db/supabase-server'),
    'base-repository': () => import('@/lib/db/base-repository'),
    'activity-log': () => import('@/lib/db/activity-log'),
    'theme-settings': () => import('@/lib/db/theme-settings'),
    'site-announcements': () => import('@/lib/db/site-announcements'),
    'users': () => import('@/lib/db/users'),
    'email-service': () => import('@/lib/email/email-service'),
    'api-error-handler': () => import('@/lib/api/error-handler'),
  };

  for (const [name, importFn] of Object.entries(modulesToTest)) {
    try {
      await importFn();
      results[name] = "SUCCESS";
    } catch (error: any) {
      results[name] = `FAIL: ${error.message}`;
    }
  }

  return NextResponse.json({
    status: 'COMPLETED',
    results
  });
}
