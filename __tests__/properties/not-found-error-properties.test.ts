/**
 * Property-Based Tests for Not Found Error Pattern
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for not found error handling
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Not Found Error Properties', () => {
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
     * Property 18: Not Found Error Pattern
     * 
     * For any resource lookup that fails, the code SHALL throw notFoundError with resource name.
     * 
     * Validates: Requirements 6.4
     * 
     * Feature: codebase-cleanup-optimization, Property 18: Not Found Error Pattern
     */
    it('Property 18: For any resource lookup that fails, the code SHALL throw notFoundError with resource name', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from API routes and lib/db (repositories)
        const apiFiles = getAllTypeScriptFiles(path.join(rootDir, 'app', 'api'), excludeDirs);
        const dbFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib', 'db'), excludeDirs);
        const allFiles = [...apiFiles, ...dbFiles];

        const violations: Array<{
            file: string;
            line: number;
            issue: string;
            context: string;
        }> = [];

        // Patterns that indicate resource lookup operations
        const resourceLookupPatterns = [
            // Database queries that might return null/undefined
            /\.findById\(/g,
            /\.findByIdOrNull\(/g,
            /\.findOne\(/g,
            /\.single\(\)/g,
            /\.maybeSingle\(\)/g,

            // Repository methods
            /Repository\.find/g,
            /Repository\.get/g,

            // Direct Supabase queries with single result
            /from\([^)]+\)\.select\([^)]*\).*\.eq\([^)]*\).*\.single\(/g,
        ];

        // Patterns for incorrect error handling
        const incorrectErrorPatterns = [
            {
                pattern: /throw\s+new\s+Error\s*\([^)]*not\s+found/gi,
                name: 'new Error for not found',
                description: 'Uses generic Error instead of notFoundError for resource not found'
            },
            {
                pattern: /throw\s+badRequestError\s*\([^)]*not\s+found/gi,
                name: 'badRequestError for not found',
                description: 'Uses badRequestError instead of notFoundError for resource not found'
            },
            {
                pattern: /return\s+.*Response\.json\s*\(\s*\{[^}]*error[^}]*not\s+found[^}]*\}\s*,\s*\{\s*status\s*:\s*404/gi,
                name: 'manual 404 response',
                description: 'Returns manual 404 response instead of throwing notFoundError'
            },
            {
                pattern: /return\s+NextResponse\.json\s*\(\s*\{[^}]*error[^}]*\}\s*,\s*\{\s*status\s*:\s*404/g,
                name: 'manual NextResponse 404',
                description: 'Returns manual NextResponse with 404 instead of throwing notFoundError'
            },
        ];

        for (const file of allFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Skip the error-handler.ts file itself as it implements the error handling
            if (normalizedPath.includes('lib/api/error-handler.ts')) {
                continue;
            }

            // Check if file performs resource lookups
            const hasResourceLookup = resourceLookupPatterns.some(pattern => {
                pattern.lastIndex = 0;
                return pattern.test(content);
            });

            if (!hasResourceLookup) {
                continue; // Skip files that don't perform resource lookups
            }

            // Check if file imports notFoundError
            const _importsNotFoundError = /notFoundError/.test(content) &&
                /from\s+['"]@\/lib\/api/.test(content);

            // Look for resource lookup patterns followed by null/undefined checks
            const lookupChecks = [
                // Pattern: if (!resource) or if (resource === null)
                /if\s*\(\s*!(\w+)\s*\)/g,
                /if\s*\(\s*(\w+)\s*===\s*null\s*\)/g,
                /if\s*\(\s*(\w+)\s*===\s*undefined\s*\)/g,
                /if\s*\(\s*error\s*\|\|\s*!(\w+)\s*\)/g,
                /if\s*\(\s*(\w+Error)\s*\|\|\s*!(\w+)\s*\)/g,
            ];

            for (const checkPattern of lookupChecks) {
                checkPattern.lastIndex = 0;
                const matches = Array.from(content.matchAll(checkPattern));

                for (const match of matches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const line = lines[lineNumber - 1];

                    // Skip if in a comment
                    const lineBeforeMatch = line.substring(0, line.indexOf(match[0]));
                    if (lineBeforeMatch.includes('//')) {
                        continue;
                    }

                    // Look ahead to see what happens in the if block
                    const afterMatch = content.substring(matchIndex, matchIndex + 300);

                    // Check if this is a not-found scenario
                    const isNotFoundScenario =
                        /not\s+found/i.test(afterMatch) ||
                        /does\s+not\s+exist/i.test(afterMatch) ||
                        /doesn't\s+exist/i.test(afterMatch) ||
                        /404/.test(afterMatch);

                    if (!isNotFoundScenario) {
                        continue; // Not a not-found scenario
                    }

                    // Skip if this is checking for permissions/authorization rather than resource existence
                    const isAuthCheck =
                        /isAdmin/i.test(line) ||
                        /isModerator/i.test(line) ||
                        /hasPermission/i.test(line) ||
                        /canAccess/i.test(line) ||
                        /role/i.test(line) ||  // getUserOrgRole returns null if not a member
                        /isMember/i.test(line);

                    if (isAuthCheck) {
                        continue; // This is an authorization check, not a resource lookup
                    }

                    // Skip if the error message indicates authorization/membership, not resource existence
                    const isAuthError =
                        /not a member/i.test(afterMatch) ||
                        /not\s+authorized/i.test(afterMatch) ||
                        /access\s+denied/i.test(afterMatch) ||
                        /permission/i.test(afterMatch);

                    if (isAuthError && /forbiddenError/.test(afterMatch)) {
                        continue; // This is correctly using forbiddenError for authorization
                    }

                    // Check if notFoundError is used
                    const usesNotFoundError = /notFoundError\s*\(/.test(afterMatch);

                    if (!usesNotFoundError) {
                        // Check what error handling is used instead
                        const usesGenericError = /throw\s+new\s+Error/.test(afterMatch);
                        const usesBadRequest = /badRequestError/.test(afterMatch);
                        const usesManualResponse = /return\s+.*Response\.json/.test(afterMatch);
                        const returnsErrorObject =
                            /return\s+\{\s*success\s*:\s*false/.test(afterMatch) ||
                            /return\s+\{\s*valid\s*:\s*false/.test(afterMatch) ||
                            /return\s+\{\s*error\s*:/.test(afterMatch);

                        // Skip if this returns an error object (success/error/valid pattern) - common in lib functions
                        if (returnsErrorObject && !normalizedPath.includes('app/api')) {
                            continue;
                        }

                        let issue = 'Resource not found check does not use notFoundError';
                        if (usesGenericError) {
                            issue = 'Uses generic Error instead of notFoundError for resource not found';
                        } else if (usesBadRequest) {
                            issue = 'Uses badRequestError instead of notFoundError for resource not found';
                        } else if (usesManualResponse) {
                            issue = 'Returns manual response instead of throwing notFoundError';
                        }

                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue,
                            context: line.trim().substring(0, 100)
                        });
                    } else {
                        // Verify notFoundError is called with a resource name parameter
                        const notFoundMatch = /notFoundError\s*\(\s*([^)]*)\s*\)/.exec(afterMatch);
                        if (notFoundMatch) {
                            const param = notFoundMatch[1].trim();

                            // Check if parameter is empty or just whitespace
                            if (!param || param === '') {
                                violations.push({
                                    file: normalizedPath,
                                    line: lineNumber,
                                    issue: 'notFoundError called without resource name parameter',
                                    context: line.trim().substring(0, 100)
                                });
                            }
                            // Check if parameter is a generic string like 'Resource'
                            else if (param === "'Resource'" || param === '"Resource"') {
                                // This is acceptable but not ideal - it's the default
                                // We won't flag this as a violation since it's technically correct
                            }
                        }
                    }
                }
            }

            // Check for incorrect error patterns
            for (const { pattern, name: _name, description } of incorrectErrorPatterns) {
                pattern.lastIndex = 0;
                const matches = Array.from(content.matchAll(pattern));

                for (const match of matches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const line = lines[lineNumber - 1];

                    // Skip if in a comment
                    const lineBeforeMatch = line.substring(0, line.indexOf(match[0]));
                    if (lineBeforeMatch.includes('//')) {
                        continue;
                    }

                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        issue: description,
                        context: line.trim().substring(0, 100)
                    });
                }
            }

            // Check for Supabase error handling patterns
            // Pattern: if (error || !data) without notFoundError
            const supabaseErrorPattern = /if\s*\(\s*(\w*[Ee]rror)\s*\|\|\s*!(\w+)\s*\)/g;
            supabaseErrorPattern.lastIndex = 0;
            const supabaseMatches = Array.from(content.matchAll(supabaseErrorPattern));

            for (const match of supabaseMatches) {
                const matchIndex = match.index!;
                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                const line = lines[lineNumber - 1];

                // Look ahead to see what happens
                const afterMatch = content.substring(matchIndex, matchIndex + 200);

                // Check if this looks like a not-found scenario
                const hasNotFoundKeywords =
                    /not\s+found/i.test(afterMatch) ||
                    /404/.test(afterMatch);

                if (hasNotFoundKeywords) {
                    const usesNotFoundError = /notFoundError\s*\(/.test(afterMatch);

                    if (!usesNotFoundError) {
                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue: 'Supabase error check for not found does not use notFoundError',
                            context: line.trim().substring(0, 100)
                        });
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 18 Violations: Not Found Error Pattern ===\n');
            console.log('For any resource lookup that fails, the code SHALL throw notFoundError with resource name.\n');

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
                items.forEach(({ file, line, context }) => {
                    console.log(`  ${file}:${line}`);
                    console.log(`    ${context}`);
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${new Set(violations.map(v => v.file)).size}`);
            console.log('\nResource not found errors must use notFoundError() from @/lib/api');
            console.log('Example: throw notFoundError("Course")');
            console.log('Example: if (!user) throw notFoundError("User")');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
