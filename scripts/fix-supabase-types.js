const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

// List of API files that need fixing
const filesToFix = [
  'courses/[id]/modules/route.ts',
  'dashboard/admin/route.ts',
  'dashboard/instructor/route.ts',
  'dashboard/student/route.ts',
  'events/[id]/register/route.ts',
  'events/[id]/route.ts',
  'invoices/[id]/route.ts',
  'organizations/[id]/members/route.ts',
  'organizations/[id]/route.ts',
  'payments/[id]/route.ts',
  'resources/[id]/route.ts',
  'resources/[id]/download/route.ts',
  'resources/[id]/purchase/route.ts',
  'sessions/[id]/complete/route.ts',
  'sessions/[id]/route.ts',
  'courses/[id]/route.ts',
  'courses/[id]/enroll/route.ts',
  'courses/[id]/reviews/route.ts',
  'notifications/[id]/route.ts',
  'notifications/route.ts',
  'payments/route.ts',
  'resources/route.ts',
  'invoices/route.ts',
  'sessions/route.ts',
  'events/route.ts',
  'courses/route.ts',
  'organizations/route.ts',
  'webhooks/stripe/route.ts',
];

function fixFile(filePath) {
  const fullPath = path.join(apiDir, filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping non-existent file: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace the import statement
  if (content.includes("import { createClient } from '@/lib/auth/supabase-server';")) {
    content = content.replace(
      "import { createClient } from '@/lib/auth/supabase-server';",
      "import { createTypedClient, Tables, InsertTables, UpdateTables } from '@/lib/auth/supabase-typed';"
    );
  } else if (!content.includes("from '@/lib/auth/supabase-typed'")) {
    // Add the import if not present
    if (content.includes("from 'next/server'")) {
      content = content.replace(
        "from 'next/server';",
        `from 'next/server';
import { createTypedClient, Tables, InsertTables, UpdateTables } from '@/lib/auth/supabase-typed';`
      );
    }
  }

  // Replace createClient() with createTypedClient()
  content = content.replace(/const supabase = createClient\(\)/g, 'const supabase = createTypedClient()');

  // Add type annotations for common patterns
  // Profile queries
  content = content.replace(
    /const { data: profile }/g,
    'const { data: profile }: { data: Tables<\'profiles\'> | null }'
  );

  // For patterns like profile?.role
  content = content.replace(
    /if \(profile\?\.role ([!=]+)/g,
    'if ((profile as Tables<\'profiles\'> | null)?.role $1'
  );

  // Save the updated file
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✓ Fixed: ${filePath}`);
}

console.log('Starting to fix Supabase types in API routes...\n');

filesToFix.forEach(file => {
  try {
    fixFile(file);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
});

console.log('\n✓ Completed fixing Supabase types');