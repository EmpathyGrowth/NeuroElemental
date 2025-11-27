#!/usr/bin/env node

/**
 * Script to standardize error handling across all API routes
 * 
 * This script:
 * 1. Replaces `throw new Error()` with appropriate ApiError factories
 * 2. Replaces direct `NextResponse.json({ error: ... })` with errorResponse()
 * 3. Ensures validation errors use validationError()
 * 4. Ensures not-found cases use notFoundError()
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all API route files
const routeFiles = glob.sync('app/api/**/*.ts', {
    ignore: ['**/*.test.ts', '**/__tests__/**']
});

console.log(`Found ${routeFiles.length} route files to process\n`);

let filesModified = 0;
let changesCount = 0;

routeFiles.forEach(filePath => {
    const originalContent = fs.readFileSync(filePath, 'utf8');
    let content = originalContent;
    let fileChanges = 0;
    const neededImports = new Set();

    // 1. Replace throw new Error() with appropriate error factories

    // Failed to save/create/update/delete patterns -> internalError
    content = content.replace(/throw new Error\(['"]Failed to (save|create|update|delete|process|remove) ([^'"]+)['"]\)/g, (match, action, resource) => {
        fileChanges++;
        neededImports.add('internalError');
        return `throw internalError('Failed to ${action} ${resource}')`;
    });

    // Generic throw new Error -> internalError
    content = content.replace(/throw new Error\(([^)]+)\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('internalError');
        return `throw internalError(${message})`;
    });

    // 2. Replace NextResponse.json({ error: ... }, { status: 401 }) with errorResponse(unauthorizedError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*401\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('unauthorizedError');
        neededImports.add('errorResponse');
        return `errorResponse(unauthorizedError('${message}'))`;
    });

    // 3. Replace NextResponse.json({ error: ... }, { status: 403 }) with errorResponse(forbiddenError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*403\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('forbiddenError');
        neededImports.add('errorResponse');
        return `errorResponse(forbiddenError('${message}'))`;
    });

    // 4. Replace NextResponse.json({ error: ... }, { status: 404 }) with errorResponse(notFoundError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*404\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('notFoundError');
        neededImports.add('errorResponse');
        // Extract resource name from message
        const resourceMatch = message.match(/^(.+?)\s+not found$/i);
        const resource = resourceMatch ? resourceMatch[1] : message;
        return `errorResponse(notFoundError('${resource}'))`;
    });

    // 5. Replace NextResponse.json({ error: ... }, { status: 400 }) with errorResponse(badRequestError() or validationError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*400\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        // Check if it's a validation error
        const isValidation = message.toLowerCase().includes('required') ||
            message.toLowerCase().includes('invalid') ||
            message.toLowerCase().includes('must be');

        if (isValidation) {
            neededImports.add('validationError');
            neededImports.add('errorResponse');
            return `errorResponse(validationError('${message}'))`;
        } else {
            neededImports.add('badRequestError');
            neededImports.add('errorResponse');
            return `errorResponse(badRequestError('${message}'))`;
        }
    });

    // 6. Replace NextResponse.json({ error: ... }, { status: 422 }) with errorResponse(validationError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*422\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('validationError');
        neededImports.add('errorResponse');
        return `errorResponse(validationError('${message}'))`;
    });

    // 7. Replace NextResponse.json({ error: ... }, { status: 500 }) with errorResponse(internalError())
    content = content.replace(/NextResponse\.json\(\s*\{\s*error:\s*['"]([^'"]+)['"]\s*\}\s*,\s*\{\s*status:\s*500\s*\}\s*\)/g, (match, message) => {
        fileChanges++;
        neededImports.add('internalError');
        neededImports.add('errorResponse');
        return `errorResponse(internalError('${message}'))`;
    });

    // Add needed imports
    if (neededImports.size > 0) {
        content = addImports(content, Array.from(neededImports));
    }

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesModified++;
        changesCount += fileChanges;
        console.log(`✓ ${filePath} (${fileChanges} changes)`);
    }
});

console.log(`\n✅ Complete!`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Total changes: ${changesCount}`);

function addImports(content, functionNames) {
    // Check if there's already an import from @/lib/api
    const apiImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/api['"]/);

    if (apiImportMatch) {
        // Add to existing import
        const existingImports = apiImportMatch[1].split(',').map(s => s.trim());
        const newImports = [...new Set([...existingImports, ...functionNames])];
        content = content.replace(
            /import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/api['"]/,
            `import { ${newImports.join(', ')} } from '@/lib/api'`
        );
    } else {
        // Add new import after the first import or at the top
        const firstImportMatch = content.match(/^import\s+.*?from\s+['"][^'"]+['"]/m);
        if (firstImportMatch) {
            const insertPos = content.indexOf(firstImportMatch[0]) + firstImportMatch[0].length;
            content = content.slice(0, insertPos) +
                `\nimport { ${functionNames.join(', ')} } from '@/lib/api'` +
                content.slice(insertPos);
        } else {
            // No imports yet, add at the very top
            content = `import { ${functionNames.join(', ')} } from '@/lib/api'\n\n` + content;
        }
    }

    return content;
}
