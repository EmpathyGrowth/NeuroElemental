// Fix remaining routes with two-param patterns  (e.g., [id]/[webhookId])
const fs = require('fs');
const path = require('path');

const routeFiles = [
  'app/api/organizations/[id]/webhooks/[webhookId]/regenerate/route.ts',
  'app/api/organizations/[id]/webhooks/[webhookId]/test/route.ts',
  'app/api/organizations/[id]/webhooks/[webhookId]/route.ts',
  'app/api/organizations/[id]/webhooks/[webhookId]/deliveries/route.ts',
  'app/api/organizations/[id]/reports/[reportId]/route.ts',
  'app/api/organizations/[id]/api-keys/[keyId]/route.ts',
];

const basePath = process.cwd();

routeFiles.forEach(file => {
  const filePath = path.join(basePath, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Detect which parameters are used (id + webhookId, id + reportId, or id + keyId)
  let secondParam = null;
  if (file.includes('webhookId')) secondParam = 'webhookId';
  else if (file.includes('reportId')) secondParam = 'reportId';
  else if (file.includes('keyId')) secondParam = 'keyId';

  if (!secondParam) {
    console.log(`Skipping ${file} - couldn't determine second param`);
    return;
  }

  // Replace params type declaration
  const oldPattern = `{ params }: { params: { id: string; ${secondParam}: string } }`;
  const newPattern = `{ params }: { params: Promise<{ id: string; ${secondParam}: string }> }`;
  content = content.replace(new RegExp(oldPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), newPattern);

  // Add await params destructuring after function opening
  content = content.replace(
    /(export async function (?:GET|POST|PUT|PATCH|DELETE)\([^)]*\) \{)\n(\s*try \{)?/gm,
    (match, funcOpen, tryBlock) => {
      if (tryBlock) {
        return `${funcOpen}\n${tryBlock}\n    const { id, ${secondParam} } = await params;`;
      } else {
        return `${funcOpen}\n  const { id, ${secondParam} } = await params;`;
      }
    }
  );

  // Replace params.id and params.[secondParam] with just the variable names
  content = content.replace(/params\.id/g, 'id');
  content = content.replace(new RegExp(`params\\.${secondParam}`, 'g'), secondParam);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\nScript complete!');
