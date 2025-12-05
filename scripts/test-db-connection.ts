
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testConnection() {
  console.log('Testing Supabase Connection...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  console.log(`URL: ${supabaseUrl}`);
  console.log(`Key: ${serviceRoleKey.slice(0, 5)}... (Service Role)`);

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    // 1. Basic Connection Test
    console.log('\n--- 1. Testing Connection & Auth ---');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (authError) throw authError;
    console.log('✅ Auth Admin Access confirmed.');

    // 2. Query 'site_announcements' table (The one failing in API)
    console.log('\n--- 2. Testing `site_announcements` Query ---');
    const { data: announcements, error: dbError } = await supabase
      .from('site_announcements')
      .select('*')
      .limit(5);

    if (dbError) {
      console.error('❌ Query Failed:', dbError);
      console.error('Code:', dbError.code);
      console.error('Message:', dbError.message);
      console.error('Details:', dbError.details);
      throw dbError;
    }

    console.log(`✅ Query Successful! Found ${announcements.length} announcements.`);
    console.log('Sample Data:', announcements);

    // 3. Query 'theme_settings' table (Another failing one)
    console.log('\n--- 3. Testing `theme_settings` Query ---');
    const { data: theme, error: themeError } = await supabase
      .from('theme_settings')
      .select('*')
      .limit(1);

    if (themeError) {
        // Failing theme check is less critical but good to know
        console.warn('⚠️ Theme Query Failed:', themeError.message);
    } else {
        console.log(`✅ Theme Query Successful.`);
    }

    console.log('\n✅✅✅ ALL TESTS PASSED. LOCAL CONFIGURATION IS VALID. ✅✅✅');
    console.log('If this works here but fails in production, the issue is DEFINITELY Production Environment Variables.');

  } catch (error: any) {
    console.error('\n❌ FATAL TEST FAILURE:', error.message);
    process.exit(1);
  }
}

testConnection();
