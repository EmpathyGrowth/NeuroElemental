// This is a one-time migration script to fix all route handlers with async params
const fs = require('fs');
const path = require('path');

const routeFiles = [
  'app/api/organizations/[id]/webhooks/route.ts',
  'app/api/organizations/[id]/sso/route.ts',
  'app/api/organizations/[id]/sso/test/route.ts',
  'app/api/organizations/[id]/sso/attempts/route.ts',
  'app/api/organizations/[id]/reports/route.ts',
  'app/api/organizations/[id]/rate-limits/violations/route.ts',
  'app/api/organizations/[id]/rate-limits/route.ts',
  'app/api/organizations/[id]/rate-limits/usage/route.ts',
  'app/api/organizations/[id]/billing/checkout/route.ts',
  'app/api/organizations/[id]/billing/route.ts',
  'app/api/organizations/[id]/billing/reactivate/route.ts',
  'app/api/organizations/[id]/billing/portal/route.ts',
  'app/api/organizations/[id]/billing/invoices/route.ts',
  'app/api/organizations/[id]/billing/change-plan/route.ts',
  'app/api/organizations/[id]/billing/cancel/route.ts',
  'app/api/organizations/[id]/api-keys/route.ts',
];

const basePath = process.cwd();

routeFiles.forEach(file => {
  const filePath = path.join(basePath, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace params type declaration
  content = content.replace(
    /\{ params \}: \{ params: \{ id: string \} \}/g,
    '{ params }: { params: Promise<{ id: string }> }'
  );

  // Add await params destructuring after function opening
  // Match function signature and add await after the opening brace
  content = content.replace(
    /(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^)]*\) \{)\n(\s*try \{)?/gm,
    (match, funcOpen, tryBlock) => {
      if (tryBlock) {
        return `${funcOpen}\n${tryBlock}\n    const { id } = await params;`;
      } else {
        return `${funcOpen}\n  const { id } = await params;`;
      }
    }
  );

  // Replace all params.id with just id
  content = content.replace(/params\.id/g, 'id');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\nScript complete!');
