// Comprehensive error-wrapping fix for all API routes
const fs = require('fs');
const path = require('path');
const glob = require('glob');

const basePath = process.cwd();
const apiPath = path.join(basePath, 'app', 'api');

console.log('Finding all route files...');

// Find all route.ts files
const routeFiles = glob.sync('**/route.ts', { cwd: apiPath, absolute: false });

console.log(`Found ${routeFiles.length} route files`);

let fixedCount = 0;
let skippedCount = 0;

routeFiles.forEach(file => {
  const filePath = path.join(apiPath, file);

  if (!fs.existsSync(filePath)) {
    skippedCount++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern 1: Fix unwrapped error returns with various error types
  const errorFunctions = [
    'unauthorizedError',
    'forbiddenError',
    'notFoundError',
    'badRequestError',
    'conflictError',
    'internalError',
    'validationError',
    'rateLimitError'
  ];

  errorFunctions.forEach(errorFunc => {
    // Match: return errorFunc(...) but not already wrapped with errorResponse
    const pattern = new RegExp(
      `return\\s+(${errorFunc}\\([^)]*\\));?(?!.*errorResponse)`,
      'g'
    );

    const newContent = content.replace(pattern, (match, errorCall) => {
      changed = true;
      return `return errorResponse(${errorCall});`;
    });

    if (newContent !== content) {
      content = newContent;
    }
  });

  // Pattern 2: Fix Request → NextRequest
  if (content.includes('request: Request') && !content.includes('request: NextRequest')) {
    content = content.replace(
      /export async function (GET|POST|PUT|PATCH|DELETE)\(\s*request:\s*Request\b/g,
      (match, method) => {
        changed = true;
        return `export async function ${method}(request: NextRequest`;
      }
    );
  }

  // Pattern 3: Ensure NextRequest is imported if used
  if (content.includes(': NextRequest') && !content.includes("import { NextRequest }") && !content.includes("import type { NextRequest }")) {
    // Check if there's already an import from 'next/server'
    if (content.includes("from 'next/server'")) {
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+['"]next\/server['"]/,
        (match, imports) => {
          if (!imports.includes('NextRequest')) {
            changed = true;
            return `import { ${imports.trim()}, NextRequest } from 'next/server'`;
          }
          return match;
        }
      );
    } else {
      // Add new import at the top
      const firstImport = content.indexOf('import');
      if (firstImport !== -1) {
        changed = true;
        content = content.slice(0, firstImport) +
                  `import { NextRequest } from 'next/server';\n` +
                  content.slice(firstImport);
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    fixedCount++;
    console.log(`✓ Fixed ${file}`);
  } else {
    skippedCount++;
  }
});

console.log(`\n✅ Fixed: ${fixedCount} files`);
console.log(`⏭️  Skipped: ${skippedCount} files (no changes needed)`);
console.log('\nScript complete!');
