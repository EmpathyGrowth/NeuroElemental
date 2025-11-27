// Fix all remaining auth.error returns and Request type issues
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/api/products/route.ts',
  'app/api/products/[id]/route.ts',
  'app/api/events/[id]/route.ts',
  'app/api/events/route.ts',
  'app/api/dashboard/admin/route.ts',
  'app/api/courses/route.ts',
  'app/api/courses/[id]/route.ts',
  'app/api/cache/route.ts',
  'app/api/blog/route.ts',
  'app/api/admin/coupons/route.ts',
  'app/api/blog/[id]/route.ts',
  'app/api/blog/[id]/publish/route.ts',
];

const basePath = process.cwd();

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix 1: Wrap auth.error returns with errorResponse
  content = content.replace(
    /if \(auth\.error\) return auth\.error;?/g,
    'if (auth.error) return errorResponse(auth.error);'
  );

  // Fix 2: Replace Request with NextRequest in function signatures
  content = content.replace(
    /export async function (GET|POST|PUT|PATCH|DELETE)\(\s*request: Request/g,
    'export async function $1(request: NextRequest'
  );

  // Fix 3: Add NextRequest import if it's not there
  if (content.includes('NextRequest') && !content.includes('import') && !content.includes('NextRequest')) {
    content = `import { NextRequest } from 'next/server';\n` + content;
  } else if (content.includes('NextRequest') && content.includes("from 'next/server'")) {
    // Update existing import to include NextRequest if missing
    content = content.replace(
      /import \{ ([^}]*) \} from 'next\/server'/,
      (match, imports) => {
        if (!imports.includes('NextRequest')) {
          const updatedImports = imports.trim() ? `${imports.trim()}, NextRequest` : 'NextRequest';
          return `import { ${updatedImports} } from 'next/server'`;
        }
        return match;
      }
    );
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Fixed ${file}`);
});

console.log('\nScript complete!');
