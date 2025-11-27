#!/usr/bin/env node

/**
 * Script to fix import syntax errors (leading commas, etc.)
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
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Fix leading commas in imports
    content = content.replace(/import\s+\{\s*,\s*/g, 'import { ');

    // Fix trailing commas before closing brace
    content = content.replace(/,\s*\}\s*from/g, ' } from');

    // Fix multiple consecutive commas
    content = content.replace(/,\s*,+/g, ',');

    // Fix spaces around commas in imports
    content = content.replace(/import\s+\{([^}]+)\}\s+from/g, (match, imports) => {
        const cleanImports = imports
            .split(',')
            .map(s => s.trim())
            .filter(s => s.length > 0)
            .join(', ');
        return `import { ${cleanImports} } from`;
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        filesModified++;
        console.log(`✓ ${filePath}`);
    }
});

console.log(`\n✅ Complete! Files modified: ${filesModified}`);
