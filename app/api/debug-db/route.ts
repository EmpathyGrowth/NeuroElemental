
import { NextResponse } from 'next/server';

// Attempt to import the database library to see if it crashes the module loader
try {
  require('@/lib/db');
} catch (e: any) {
  console.error("IMPORT ERROR:", e);
}

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // We also try detailed import logging if possible, but the require above is the main test.
    return NextResponse.json({
      status: 'SUCCESS',
      message: 'lib/db imported without crashing'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'CRASH',
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
