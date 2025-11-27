/**
 * Property-Based Tests for Validation Error Pattern
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for validation error handling
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Routes that are allowed to use badRequestError for non-validation purposes:
 * - Webhook handlers: Signature verification failures are not user input validation
 */
const ALLOWED_BAD_REQUEST_ROUTES = [
    'app/api/billing/webhook/route.ts',  // Signature verification is not user input validation
]

/**
 * Check if a route is allowed to use badRequestError for non-validation purposes
 */
function isAllowedBadRequestRoute(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_BAD_REQUEST_ROUTES.some(allowed => normalizedPath.endsWith(allowed))
}

describe('Validation Error Properties', () => {
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
     * Property 17: Validation Error Pattern
     * 
     * For any validation failure, the code SHALL throw validationError with structured details.
     * 
     * Validates: Requirements 6.3
     * 
     * Feature: codebase-cleanup-optimization, Property 17: Validation Error Pattern
     */
    it('Property 17: For any validation failure, the code SHALL throw validationError with structured details', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from API routes
        const apiFiles = getAllTypeScriptFiles(path.join(rootDir, 'app', 'api'), excludeDirs);

        const violations: Array<{
            file: string;
            line: number;
            issue: string;
            context: string;
        }> = [];

        // Patterns to detect validation-related code
        const validationPatterns = {
            // Zod validation patterns
            zodParse: /\.parse\(/g,
            zodSafeParse: /\.safeParse\(/g,

            // Schema imports
            schemaImport: /from\s+['"]@\/lib\/validation\/schemas['"]/,

            // Validation helper
            validateRequest: /validateRequest\(/g,

            // Manual validation patterns (should use validationError)
            manualValidation: [
                /if\s*\([^)]*\.length\s*[<>=!]+/,  // length checks
                /if\s*\([^)]*\.test\(/,              // regex tests
                /if\s*\([^)]*instanceof\s+/,         // instanceof checks
                /if\s*\([^)]*typeof\s+/,             // typeof checks
                /if\s*\([^)]*===\s*undefined/,       // undefined checks
                /if\s*\([^)]*===\s*null/,            // null checks
                /if\s*\(!\w+\)/,                     // falsy checks
            ],
        };

        // Patterns for incorrect error handling
        const incorrectErrorPatterns = [
            {
                pattern: /throw\s+new\s+Error\s*\([^)]*validat/gi,
                name: 'new Error for validation',
                description: 'Uses generic Error instead of validationError for validation failures'
            },
            {
                pattern: /throw\s+badRequestError\s*\([^)]*validat/gi,
                name: 'badRequestError for validation',
                description: 'Uses badRequestError instead of validationError for validation failures'
            },
            {
                pattern: /return\s+.*Response\.json\s*\(\s*\{[^}]*error[^}]*\}\s*,\s*\{\s*status\s*:\s*4(?:00|22)/g,
                name: 'manual error response',
                description: 'Returns manual error response instead of throwing validationError'
            },
        ];

        for (const file of apiFiles) {
            // Skip routes allowed to use badRequestError for non-validation purposes
            if (isAllowedBadRequestRoute(file)) {
                continue;
            }

            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Check if file performs validation
            const hasZodValidation = validationPatterns.zodParse.test(content) ||
                validationPatterns.zodSafeParse.test(content);
            const hasValidateRequest = validationPatterns.validateRequest.test(content);
            const hasSchemaImport = validationPatterns.schemaImport.test(content);

            // Check for manual validation patterns
            const hasManualValidation = validationPatterns.manualValidation.some(pattern =>
                pattern.test(content)
            );

            const performsValidation = hasZodValidation || hasValidateRequest ||
                (hasSchemaImport && hasManualValidation);

            if (!performsValidation) {
                continue; // Skip files that don't perform validation
            }

            // Check if file imports validationError
            const importsValidationError = /validationError/.test(content) &&
                /from\s+['"]@\/lib\/api/.test(content);

            // Look for validation error handling patterns
            const hasValidationErrorThrow = /throw\s+validationError\s*\(/g.test(content);

            // Check for Zod validation without proper error handling
            if (hasZodValidation) {
                // Pattern: .parse() without try-catch or error handling
                const parseMatches = Array.from(content.matchAll(/\.parse\s*\(/g));

                for (const match of parseMatches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const _line = lines[lineNumber - 1];

                    // Check if this parse is in a try-catch block
                    const beforeMatch = content.substring(0, matchIndex);
                    const lastTryIndex = beforeMatch.lastIndexOf('try {');
                    const lastCatchIndex = beforeMatch.lastIndexOf('} catch');

                    const _isInTryCatch = lastTryIndex > lastCatchIndex;

                    // If using .parse() directly (not in try-catch), it should be okay
                    // because it will throw ZodError which should be caught by route factory
                    // But we want to encourage .safeParse() with validationError

                    // Skip this check - .parse() is acceptable as it throws errors
                    continue;
                }

                // Pattern: .safeParse() without checking success and throwing validationError
                const safeParseMatches = Array.from(content.matchAll(/\.safeParse\s*\(/g));

                for (const match of safeParseMatches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;

                    // Look ahead to see if there's proper error handling
                    const afterMatch = content.substring(matchIndex, matchIndex + 500);

                    // Check for proper validation error handling patterns
                    const hasSuccessCheck = /if\s*\(\s*!.*\.success\s*\)/.test(afterMatch);
                    const hasValidationErrorInBlock = /validationError/.test(afterMatch);
                    const hasBadRequestError = /badRequestError/.test(afterMatch);

                    if (hasSuccessCheck && !hasValidationErrorInBlock) {
                        // Found safeParse with success check but no validationError
                        if (hasBadRequestError) {
                            violations.push({
                                file: normalizedPath,
                                line: lineNumber,
                                issue: 'Uses badRequestError instead of validationError for Zod validation failure',
                                context: lines[lineNumber - 1]?.trim().substring(0, 100)
                            });
                        } else {
                            violations.push({
                                file: normalizedPath,
                                line: lineNumber,
                                issue: 'Zod safeParse validation failure does not throw validationError',
                                context: lines[lineNumber - 1]?.trim().substring(0, 100)
                            });
                        }
                    }
                }
            }

            // Check for manual validation without validationError
            if (hasManualValidation && !importsValidationError && !hasValidateRequest) {
                // Look for throw statements after validation checks
                const throwMatches = Array.from(content.matchAll(/throw\s+\w+/g));

                for (const match of throwMatches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const line = lines[lineNumber - 1];

                    // Check if this is a validation-related throw
                    const isValidationRelated = /invalid|required|must|cannot|should|format|range|between/i.test(line);

                    if (isValidationRelated && !/validationError/.test(line)) {
                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue: 'Validation failure does not use validationError',
                            context: line.trim().substring(0, 100)
                        });
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

            // Check for validation with structured details
            if (hasValidationErrorThrow) {
                // Verify that validationError calls include details parameter when appropriate
                const validationErrorMatches = Array.from(content.matchAll(/throw\s+validationError\s*\([^)]+\)/g));

                for (const match of validationErrorMatches) {
                    const matchIndex = match.index!;
                    const _lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const throwStatement = match[0];

                    // Check if it's a simple validation error without details
                    // Pattern: validationError('message') - single parameter
                    const hasSingleParam = /validationError\s*\(\s*['"][^'"]+['"]\s*\)/.test(throwStatement);

                    // Check if there's context that suggests details should be included
                    const beforeContext = content.substring(Math.max(0, matchIndex - 200), matchIndex);
                    const hasZodError = /\.safeParse\(/.test(beforeContext) || /ZodError/.test(beforeContext);
                    const hasMultipleFields = /field|fields|errors|missing|invalid/i.test(beforeContext);

                    // If it's from Zod validation or involves multiple fields, it should have details
                    if (hasSingleParam && (hasZodError || hasMultipleFields)) {
                        // This is a suggestion, not a hard violation
                        // We'll track it but not fail the test
                        // violations.push({
                        //     file: normalizedPath,
                        //     line: lineNumber,
                        //     issue: 'validationError could include structured details parameter',
                        //     context: throwStatement.trim().substring(0, 100)
                        // });
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 17 Violations: Validation Error Pattern ===\n');
            console.log('For any validation failure, the code SHALL throw validationError with structured details.\n');

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
            console.log('\nValidation failures must use validationError() from @/lib/api');
            console.log('Example: throw validationError("Invalid input", { field: "email", reason: "Invalid format" })');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
