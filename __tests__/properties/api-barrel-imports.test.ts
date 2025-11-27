/**
 * Property-Based Tests for API Barrel Import Usage
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for API utility imports
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('API Barrel Import Properties', () => {
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
     * Property 12: API Barrel Import Usage
     * 
     * For any import of API utilities (error handlers, route factories, helpers), 
     * the import SHALL use @/lib/api barrel export.
     * 
     * Validates: Requirements 5.1
     * 
     * Feature: codebase-cleanup-optimization, Property 12: API Barrel Import Usage
     */
    it('Property 12: For any import of API utilities, the import SHALL use @/lib/api barrel export', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from key directories
        const appFiles = getAllTypeScriptFiles(path.join(rootDir, 'app'), excludeDirs);
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);
        const componentFiles = getAllTypeScriptFiles(path.join(rootDir, 'components'), excludeDirs);

        const allFiles = [...appFiles, ...libFiles, ...componentFiles];

        const violations: Array<{
            file: string;
            line: number;
            issue: string;
            importStatement: string;
            suggestion: string;
        }> = [];

        // Files that are allowed to import directly (the barrel export itself and the source files)
        const allowedFiles = [
            'lib/api/index.ts',
            'lib/api/error-handler.ts',
            'lib/api/route-factory.ts',
            'lib/api/route-utils.ts',
            'lib/api/request-helpers.ts',
            'lib/api/with-admin.ts',
            'lib/api/constants.ts'
        ];

        // API utilities that should be imported from barrel
        const _apiUtilities = [
            // Error handling
            'ApiError',
            'errorResponse',
            'successResponse',
            'paginatedResponse',
            'unauthorizedError',
            'forbiddenError',
            'notFoundError',
            'badRequestError',
            'validationError',
            'conflictError',
            'internalError',
            'rateLimitError',
            'validateRequired',
            'validateEmail',
            'validateUrl',
            'validateEnum',
            'asyncHandler',

            // Route factories
            'createAuthenticatedRoute',
            'createPublicRoute',
            'createAdminRoute',
            'extractParams',

            // Auth wrappers
            'requireAdmin',
            'withAdmin',
            'withAuth',

            // Route utilities
            'getPaginationParams',
            'getQueryParam',
            'getIntParam',
            'getBooleanParam',
            'formatPaginationMeta',
            'requireCourseEnrollment',
            'requireOrganizationAccess',
            'validateFileType',
            'validateFileSize',

            // Request helpers
            'parseJsonBody',
            'getClientIP',
            'getUserAgent',
            'getRequestMetadata',
            'parseBodyWithValidation',

            // Constants
            'HTTP_STATUS',
            'DEFAULT_PAGE_LIMIT',
            'DEFAULT_PAGE_OFFSET',
            'MAX_PAGE_LIMIT'
        ];

        // Patterns for direct imports from API submodules (violations)
        const directImportPatterns = [
            {
                pattern: /from\s+['"]@\/lib\/api\/error-handler['"]/g,
                module: '@/lib/api/error-handler',
                suggestion: 'Import from @/lib/api instead'
            },
            {
                pattern: /from\s+['"]@\/lib\/api\/route-factory['"]/g,
                module: '@/lib/api/route-factory',
                suggestion: 'Import from @/lib/api instead'
            },
            {
                pattern: /from\s+['"]@\/lib\/api\/route-utils['"]/g,
                module: '@/lib/api/route-utils',
                suggestion: 'Import from @/lib/api instead'
            },
            {
                pattern: /from\s+['"]@\/lib\/api\/request-helpers['"]/g,
                module: '@/lib/api/request-helpers',
                suggestion: 'Import from @/lib/api instead'
            },
            {
                pattern: /from\s+['"]@\/lib\/api\/with-admin['"]/g,
                module: '@/lib/api/with-admin',
                suggestion: 'Import from @/lib/api instead'
            },
            {
                pattern: /from\s+['"]@\/lib\/api\/constants['"]/g,
                module: '@/lib/api/constants',
                suggestion: 'Import from @/lib/api instead'
            }
        ];

        for (const file of allFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Skip allowed files
            if (allowedFiles.some(allowed => normalizedPath === allowed)) {
                continue;
            }

            // Check for direct imports from API submodules
            for (const { pattern, module, suggestion: _suggestion } of directImportPatterns) {
                // Reset regex lastIndex
                pattern.lastIndex = 0;

                const matches = Array.from(content.matchAll(pattern));

                for (const match of matches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const line = lines[lineNumber - 1];

                    // Skip if this is in a comment
                    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                        continue;
                    }

                    // Check if this is in a multi-line comment
                    const contentBeforeMatch = content.substring(0, matchIndex);
                    const lastCommentStart = contentBeforeMatch.lastIndexOf('/*');
                    const lastCommentEnd = contentBeforeMatch.lastIndexOf('*/');
                    if (lastCommentStart > lastCommentEnd) {
                        continue;
                    }

                    // Extract what's being imported
                    const importMatch = line.match(/import\s+(?:type\s+)?{([^}]+)}\s+from/);
                    const importedItems = importMatch ? importMatch[1].trim() : 'unknown';

                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        issue: `Imports directly from ${module} instead of barrel export`,
                        importStatement: line.trim(),
                        suggestion: `Change to: import { ${importedItems} } from '@/lib/api'`
                    });
                }
            }

            // Check for relative imports to API utilities
            const relativeApiImportPattern = /from\s+['"](\.\.\/)+lib\/api\/[^'"]+['"]/g;
            const relativeMatches = Array.from(content.matchAll(relativeApiImportPattern));

            for (const match of relativeMatches) {
                const matchIndex = match.index!;
                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                const line = lines[lineNumber - 1];

                // Skip if this is in a comment
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                    continue;
                }

                // Extract what's being imported
                const importMatch = line.match(/import\s+(?:type\s+)?{([^}]+)}\s+from/);
                const importedItems = importMatch ? importMatch[1].trim() : 'unknown';

                violations.push({
                    file: normalizedPath,
                    line: lineNumber,
                    issue: 'Uses relative import to API utilities instead of barrel export',
                    importStatement: line.trim(),
                    suggestion: `Change to: import { ${importedItems} } from '@/lib/api'`
                });
            }

            // Check for imports from validation that should go through API barrel
            const validationImportPattern = /from\s+['"]@\/lib\/validation\/validate['"]/g;
            const validationMatches = Array.from(content.matchAll(validationImportPattern));

            for (const match of validationMatches) {
                const matchIndex = match.index!;
                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                const line = lines[lineNumber - 1];

                // Skip if this is in a comment
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                    continue;
                }

                // Check if importing validation functions that are re-exported by API barrel
                const validationFunctions = ['validateRequest', 'validateQuery', 'validateParams', 'withValidation', 'validateMultiple'];
                const importsValidationFunction = validationFunctions.some(fn => line.includes(fn));

                if (importsValidationFunction) {
                    // Extract what's being imported
                    const importMatch = line.match(/import\s+(?:type\s+)?{([^}]+)}\s+from/);
                    const importedItems = importMatch ? importMatch[1].trim() : 'unknown';

                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        issue: 'Imports validation functions directly instead of from API barrel',
                        importStatement: line.trim(),
                        suggestion: `Change to: import { ${importedItems} } from '@/lib/api'`
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 12 Violations: API Barrel Import Usage ===\n');
            console.log('All API utility imports MUST use the @/lib/api barrel export.\n');

            // Group violations by issue type
            const byIssue = violations.reduce((acc, v) => {
                if (!acc[v.issue]) {
                    acc[v.issue] = [];
                }
                acc[v.issue].push(v);
                return acc;
            }, {} as Record<string, typeof violations>);

            for (const [issue, items] of Object.entries(byIssue)) {
                console.log(`\n${issue}:`);
                items.forEach(({ file, line, importStatement, suggestion }) => {
                    console.log(`  ${file}:${line}`);
                    console.log(`    Current: ${importStatement}`);
                    console.log(`    ${suggestion}`);
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${new Set(violations.map(v => v.file)).size}`);
            console.log('\nCorrect pattern:');
            console.log('  import {');
            console.log('    createAuthenticatedRoute,');
            console.log('    successResponse,');
            console.log('    notFoundError,');
            console.log('    getPaginationParams');
            console.log('  } from \'@/lib/api\'');
            console.log('\nIncorrect patterns:');
            console.log('  ❌ import { createAuthenticatedRoute } from \'@/lib/api/route-factory\'');
            console.log('  ❌ import { successResponse } from \'@/lib/api/error-handler\'');
            console.log('  ❌ import { getPaginationParams } from \'../lib/api/route-utils\'');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
