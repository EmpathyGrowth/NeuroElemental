/**
 * Property-Based Tests for Consolidated Module Imports
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify that files importing multiple utilities from the same module
 * use a single consolidated import statement rather than multiple separate imports.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Consolidated Module Imports Properties', () => {
    // Helper to recursively get all .ts and .tsx files
    function getAllTypeScriptFiles(dir: string, excludeDirs: string[] = []): string[] {
        const files: string[] = [];

        if (!fs.existsSync(dir)) {
            return files;
        }

        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);

            if (item.isDirectory()) {
                // Skip excluded directories
                if (excludeDirs.includes(item.name) || item.name.startsWith('.')) {
                    continue;
                }
                files.push(...getAllTypeScriptFiles(fullPath, excludeDirs));
            } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
                // Skip test files and declaration files
                if (!item.name.endsWith('.test.ts') &&
                    !item.name.endsWith('.test.tsx') &&
                    !item.name.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }

    /**
     * Property 13: Consolidated Module Imports
     * 
     * For any file importing multiple utilities from the same module, 
     * the file SHALL use a single import statement.
     * 
     * Validates: Requirements 5.2
     * 
     * Feature: codebase-cleanup-optimization, Property 13: Consolidated Module Imports
     */
    it('Property 13: For any file importing multiple utilities from the same module, the file SHALL use a single import statement', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from key directories
        const appFiles = getAllTypeScriptFiles(path.join(rootDir, 'app'), excludeDirs);
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);
        const componentFiles = getAllTypeScriptFiles(path.join(rootDir, 'components'), excludeDirs);

        const allFiles = [...appFiles, ...libFiles, ...componentFiles];

        const violations: Array<{
            file: string;
            module: string;
            imports: Array<{ line: number; statement: string }>;
            suggestion: string;
        }> = [];

        for (const file of allFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Track imports by module
            const importsByModule = new Map<string, Array<{ line: number; statement: string; isTypeOnly: boolean }>>();

            // Parse import statements
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmedLine = line.trim();

                // Skip comments
                if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*')) {
                    continue;
                }

                // Match import statements
                // Patterns:
                // import { ... } from 'module'
                // import type { ... } from 'module'
                // import * as name from 'module'
                // import name from 'module'
                const importMatch = line.match(/import\s+(?:(type)\s+)?(?:{[^}]+}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/);

                if (importMatch) {
                    const isTypeOnly = importMatch[1] === 'type';
                    const modulePath = importMatch[2];
                    const lineNumber = i + 1;

                    // Normalize module path (handle both absolute and relative)
                    const normalizedModule = modulePath;

                    if (!importsByModule.has(normalizedModule)) {
                        importsByModule.set(normalizedModule, []);
                    }

                    importsByModule.get(normalizedModule)!.push({
                        line: lineNumber,
                        statement: trimmedLine,
                        isTypeOnly
                    });
                }
            }

            // Check for duplicate imports from the same module
            for (const [module, imports] of importsByModule.entries()) {
                // Group by type-only vs regular imports
                const regularImports = imports.filter(imp => !imp.isTypeOnly);
                const typeOnlyImports = imports.filter(imp => imp.isTypeOnly);

                // Check if there are multiple regular imports from the same module
                if (regularImports.length > 1) {
                    // Extract imported items from each statement
                    const importedItems: string[] = [];
                    const importStatements: Array<{ line: number; statement: string }> = [];

                    for (const imp of regularImports) {
                        importStatements.push({ line: imp.line, statement: imp.statement });

                        // Extract what's being imported
                        const match = imp.statement.match(/import\s+{([^}]+)}\s+from/);
                        if (match) {
                            const items = match[1].split(',').map(item => item.trim());
                            importedItems.push(...items);
                        } else {
                            // Handle default imports or namespace imports
                            const defaultMatch = imp.statement.match(/import\s+(\w+)\s+from/);
                            const namespaceMatch = imp.statement.match(/import\s+\*\s+as\s+(\w+)\s+from/);
                            if (defaultMatch) {
                                importedItems.push(defaultMatch[1]);
                            } else if (namespaceMatch) {
                                importedItems.push(`* as ${namespaceMatch[1]}`);
                            }
                        }
                    }

                    const consolidatedImport = importedItems.length > 0
                        ? `import { ${importedItems.join(', ')} } from '${module}'`
                        : `Consolidate ${regularImports.length} imports from '${module}'`;

                    violations.push({
                        file: normalizedPath,
                        module,
                        imports: importStatements,
                        suggestion: consolidatedImport
                    });
                }

                // Check if there are multiple type-only imports from the same module
                if (typeOnlyImports.length > 1) {
                    const importedItems: string[] = [];
                    const importStatements: Array<{ line: number; statement: string }> = [];

                    for (const imp of typeOnlyImports) {
                        importStatements.push({ line: imp.line, statement: imp.statement });

                        // Extract what's being imported
                        const match = imp.statement.match(/import\s+type\s+{([^}]+)}\s+from/);
                        if (match) {
                            const items = match[1].split(',').map(item => item.trim());
                            importedItems.push(...items);
                        }
                    }

                    const consolidatedImport = importedItems.length > 0
                        ? `import type { ${importedItems.join(', ')} } from '${module}'`
                        : `Consolidate ${typeOnlyImports.length} type imports from '${module}'`;

                    violations.push({
                        file: normalizedPath,
                        module,
                        imports: importStatements,
                        suggestion: consolidatedImport
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 13 Violations: Consolidated Module Imports ===\n');
            console.log('Files importing multiple utilities from the same module MUST use a single import statement.\n');

            // Group violations by file
            const byFile = violations.reduce((acc, v) => {
                if (!acc[v.file]) {
                    acc[v.file] = [];
                }
                acc[v.file].push(v);
                return acc;
            }, {} as Record<string, typeof violations>);

            for (const [file, items] of Object.entries(byFile)) {
                console.log(`\n${file}:`);
                items.forEach(({ module, imports, suggestion }) => {
                    console.log(`  Module: ${module}`);
                    console.log(`  Multiple imports found (${imports.length}):`);
                    imports.forEach(({ line, statement }) => {
                        console.log(`    Line ${line}: ${statement}`);
                    });
                    console.log(`  Consolidate to: ${suggestion}`);
                    console.log('');
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${new Set(violations.map(v => v.file)).size}`);
            console.log('\nCorrect pattern:');
            console.log('  ✅ import { createAuthenticatedRoute, successResponse, notFoundError } from \'@/lib/api\'');
            console.log('\nIncorrect patterns:');
            console.log('  ❌ import { createAuthenticatedRoute } from \'@/lib/api\'');
            console.log('  ❌ import { successResponse } from \'@/lib/api\'');
            console.log('  ❌ import { notFoundError } from \'@/lib/api\'');
            console.log('\nBenefit: Consolidating imports improves readability and makes refactoring easier.');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
