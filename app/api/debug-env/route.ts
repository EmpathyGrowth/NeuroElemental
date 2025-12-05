
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  const report: any = {
    config: {
      urlPresent: !!url,
      serviceKeyPresent: !!serviceKey,
      serviceKeyLength: serviceKey.length,
      // Check if it looks like a JWT
      serviceKeyFormat: serviceKey.startsWith('ey') ? 'JWT' : 'INVALID',
    },
    testResult: 'PENDING'
  };

  try {
    if (!url || !serviceKey) {
        throw new Error("Missing credentials in production");
    }

    const supabase = createClient(url, serviceKey, {
        auth: { persistSession: false }
    });

    // Try a simple query
    const { data, error } = await supabase.from('site_announcements').select('count').limit(1);

    if (error) {
        report.testResult = 'FAILURE';
        report.error = {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        };
    } else {
        report.testResult = 'SUCCESS';
        report.data = data;
    }

  } catch (err: any) {
    report.testResult = 'CRASH';
    report.error = {
        message: err.message,
        stack: err.stack
    };
  }

  return NextResponse.json(report);
}
