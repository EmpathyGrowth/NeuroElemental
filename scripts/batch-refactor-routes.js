/**
 * BATCH ROUTE REFACTORING SCRIPT - ENHANCED
 *
 * Automatically refactors routes to use createAuthenticatedRoute/createPublicRoute/createAdminRoute
 * Handles complex patterns including multiple handlers, validation, and admin checks.
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const basePath = process.cwd();
const apiPath = path.join(basePath, 'app', 'api');

console.log('🚀 Starting enhanced batch route refactoring...\n');

// Find all route files
const routeFiles = glob.sync('**/route.ts', { cwd: apiPath, absolute: false });
console.log(`Found ${routeFiles.length} route files\n`);

let refactoredCount = 0;
let skippedCount = 0;
let alreadyRefactoredCount = 0;

routeFiles.forEach(file => {
  const filePath = path.join(apiPath, file);

  if (!fs.existsSync(filePath)) {
    skippedCount++;
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already using factory pattern
  if (content.includes('createAuthenticatedRoute') ||
      content.includes('createAdminRoute') ||
      content.includes('createPublicRoute')) {
    console.log (`⏭️  Already refactored: ${file}`);
    alreadyRefactoredCount++;
    return;
  }

  let originalContent = content;
  let hasChanges = false;

  // Helper to add imports
  const addImport = (importName, fromPath) => {
    if (!content.includes(importName)) {
      if (content.includes(`from '${fromPath}';`)) {
        content = content.replace(
          `from '${fromPath}';`,
          `, ${importName} } from '${fromPath}';`
        );
      } else {
        // Add new import at the top
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].startsWith('import ')) lastImportIndex = i;
        }
        lines.splice(lastImportIndex + 1, 0, `import { ${importName} } from '${fromPath}';`);
        content = lines.join('\n');
      }
    }
  };

  // 1. Refactor Admin Routes (requireAdmin pattern)
  const adminPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest[^)]*\) \{([^]*?)(const auth = await requireAdmin\(\);[^]*?if \(auth\.error\) return errorResponse\(auth\.error\);)([^]*?)\}/g;

  content = content.replace(adminPattern, (match, method, beforeAuth, authCheck, body) => {
    hasChanges = true;
    addImport('createAdminRoute', '@/lib/api');

    // Clean up body
    let cleanBody = body.trim();
    // Remove the final closing brace of the try/catch if it exists
    cleanBody = cleanBody.replace(/\} catch \(error\) \{[^]*?return errorResponse\(error\);?[^]*?\}$/, '');
    cleanBody = cleanBody.replace(/^\s*try\s*\{/, '');

    return `export const ${method} = createAdminRoute(async (request, context, { userId, user }) => {
      ${beforeAuth.trim()}
      ${cleanBody.trim()}
    });`;
  });

  // 2. Refactor Authenticated Routes (getCurrentUser pattern)
  const authPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest[^)]*\) \{([^]*?)(const user = await getCurrentUser\(\);[^]*?if \(!user\) return [^;]+;)([^]*?)\}/g;

  content = content.replace(authPattern, (match, method, beforeAuth, authCheck, body) => {
    hasChanges = true;
    addImport('createAuthenticatedRoute', '@/lib/api');

    // Clean up body
    let cleanBody = body.trim();
    cleanBody = cleanBody.replace(/\} catch \(error\) \{[^]*?return (errorResponse|NextResponse\.json)\([^)]+\);?[^]*?\}$/, '');
    cleanBody = cleanBody.replace(/^\s*try\s*\{/, '');

    return `export const ${method} = createAuthenticatedRoute(async (request, context, user) => {
      ${beforeAuth.trim()}
      ${cleanBody.trim()}
    });`;
  });

  // 3. Refactor Public Routes (simple try/catch wrapper)
  // Only matches if not already matched by admin/auth patterns
  const publicPattern = /export async function (GET|POST|PUT|PATCH|DELETE)\(request: NextRequest[^)]*\) \{([^]*?)\}/g;

  content = content.replace(publicPattern, (match, method, body) => {
    // Skip if it looks like it was already refactored (safety check)
    if (match.includes('createAuthenticatedRoute') || match.includes('createAdminRoute')) return match;

    // Check if it has a try/catch block
    if (!body.includes('try {') || !body.includes('catch (error)')) return match;

    hasChanges = true;
    addImport('createPublicRoute', '@/lib/api');

    let cleanBody = body.trim();
    cleanBody = cleanBody.replace(/\} catch \(error\) \{[^]*?return (errorResponse|NextResponse\.json)\([^)]+\);?[^]*?\}$/, '');
    cleanBody = cleanBody.replace(/^\s*try\s*\{/, '');

    return `export const ${method} = createPublicRoute(async (request, context) => {
      ${cleanBody.trim()}
    });`;
  });

  // 4. Replace NextResponse.json with successResponse/errorResponse
  if (hasChanges) {
    if (content.includes('NextResponse.json')) {
      addImport('successResponse', '@/lib/api');
      // Replace success responses
      content = content.replace(/return NextResponse\.json\(\s*\{([^]*?)\}\s*(,\s*\{[^}]*status:\s*20[01][^}]*\})?\s*\)/g, 'return successResponse({$1})');
      content = content.replace(/return NextResponse\.json\(([^,]+)(,\s*\{[^}]*status:\s*20[01][^}]*\})?\)/g, 'return successResponse($1)');
    }
  }

  if (hasChanges) {
    fs.writeFileSync(filePath, content, 'utf8');
    refactoredCount++;
    console.log(`✅ Refactored: ${file}`);
  } else {
    skippedCount++;
    console.log(`⚠️  Skipped (no pattern match): ${file}`);
  }
});

console.log(`\n📊 Results:`);
console.log(`   ✅ Refactored: ${refactoredCount}`);
console.log(`   ⏭️  Already done: ${alreadyRefactoredCount}`);
console.log(`   ⚠️  Skipped: ${skippedCount}`);
console.log(`\n✨ Enhanced batch refactoring complete!`);
