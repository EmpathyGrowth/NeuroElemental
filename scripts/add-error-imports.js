#!/usr/bin/env node

/**
 * Script to add missing error handling imports
 */

const fs = require('fs');
const glob = require('glob');

// Find all API route files
const routeFiles = glob.sync('app/api/**/*.ts', {
    ignore: ['**/*.test.ts', '**/__tests__/**']
});

console.log(`Found ${routeFiles.length} route files to check\n`);

let filesModified = 0;

routeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');

    // Check which error functions are used but not imported
    const usedFunctions = [];
    if (content.includes('errorResponse(') && !content.match(/import.*errorResponse.*from/)) {
        usedFunctions.push('errorResponse');
    }
    if (content.includes('unauthorizedError(') && !content.match(/import.*unauthorizedError.*from/)) {
        usedFunctions.push('unauthorizedError');
    }
    if (content.includes('forbiddenError(') && !content.match(/import.*forbiddenError.*from/)) {
        usedFunctions.push('forbiddenError');
    }
    if (content.includes('notFoundError(') && !content.match(/import.*notFoundError.*from/)) {
        usedFunctions.push('notFoundError');
    }
    if (content.includes('validationError(') && !content.match(/import.*validationError.*from/)) {
        usedFunctions.push('validationError');
    }
    if (content.includes('badRequestError(') && !content.match(/import.*badRequestError.*from/)) {
        usedFunctions.push('badRequestError');
    }
    if (content.includes('internalError(') && !content.match(/import.*internalError.*from/)) {
        usedFunctions.push('internalError');
    }

    if (usedFunctions.length > 0) {
        let newContent = content;

        // Check if there's already an import from @/lib/api
        const apiImportMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/api['"]/);

        if (apiImportMatch) {
            // Add to existing import
            const existingImports = apiImportMatch[1].split(',').map(s => s.trim());
            const allImports = [...new Set([...existingImports, ...usedFunctions])].sort();
            newContent = content.replace(
                /import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/api['"]/,
                `import { ${allImports.join(', ')} } from '@/lib/api'`
            );
        } else {
            // Add new import after the last import
            const imports = content.match(/^import\s+.*?from\s+['"][^'"]+['"]/gm);
            if (imports && imports.length > 0) {
                const lastImport = imports[imports.length - 1];
                const insertPos = content.indexOf(lastImport) + lastImport.length;
                newContent = content.slice(0, insertPos) +
                    `\nimport { ${usedFunctions.join(', ')} } from '@/lib/api'` +
                    content.slice(insertPos);
            } else {
                // No imports yet, add at the very top
                newContent = `import { ${usedFunctions.join(', ')} } from '@/lib/api'\n\n` + content;
            }
        }

        fs.writeFileSync(filePath, newContent, 'utf8');
        filesModified++;
        console.log(`✓ ${filePath} - Added: ${usedFunctions.join(', ')}`);
    }
});

console.log(`\n✅ Complete! Files modified: ${filesModified}`);
