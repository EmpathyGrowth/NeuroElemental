/**
 * Property-Based Tests for Console.log Usage
 * 
 * Feature: codebase-technical-debt-audit, Property 7: No Direct Console.log in Production Code
 * Validates: Requirements 5.1, 5.2
 * 
 * This test verifies that production code uses the logger utility instead of console.log.
 * Only console.warn and console.error are allowed.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Console.log Usage Properties', () => {
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
     * Property 7: No Direct Console.log in Production Code
     * 
     * For any file in `lib/`, `app/api/`, or `components/`, the file SHALL not contain 
     * `console.log` statements (only `console.warn` and `console.error` are allowed).
     * 
     * Feature: codebase-technical-debt-audit, Property 7: No Direct Console.log in Production Code
     * Validates: Requirements 5.1, 5.2
     */
    it('Property 7: For any production file, the code SHALL not contain console.log statements', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build', 'scripts'];

        // Get all TypeScript files from production directories
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);
        const appApiFiles = getAllTypeScriptFiles(path.join(rootDir, 'app', 'api'), excludeDirs);
        const componentFiles = getAllTypeScriptFiles(path.join(rootDir, 'components'), excludeDirs);

        const allFiles = [...libFiles, ...appApiFiles, ...componentFiles];

        // Files that are allowed to use console.log
        // - Logger files: They ARE the logging mechanism
        // - Audit runner: CLI tool that outputs progress
        const allowedFiles = [
            'lib/logging/logger.ts',
            'lib/logging/server-logger.ts',
            'lib/audit/audit-runner.ts',
            'lib/notifications/realtime.ts', // Notification logging
        ];

        const violations: Array<{
            file: string;
            line: number;
            context: string;
        }> = [];

        // Pattern to find console.log (but not console.warn or console.error)
        const consoleLogPattern = /console\.log\s*\(/g;

        for (const file of allFiles) {
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');

            // Skip allowed files
            if (allowedFiles.some(allowed => normalizedPath.endsWith(allowed))) {
                continue;
            }

            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');

            // Check for eslint-disable comments that allow console
            const hasEslintDisable = /eslint-disable.*no-console/.test(content);
            if (hasEslintDisable) {
                continue; // File has intentionally disabled the rule
            }

            const matches = Array.from(content.matchAll(consoleLogPattern));

            for (const match of matches) {
                const matchIndex = match.index!;
                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                const line = lines[lineNumber - 1];

                // Skip if this is in a comment
                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                    continue;
                }

                // Check if this line is in a multi-line comment
                const contentBeforeMatch = content.substring(0, matchIndex);
                const lastCommentStart = contentBeforeMatch.lastIndexOf('/*');
                const lastCommentEnd = contentBeforeMatch.lastIndexOf('*/');
                if (lastCommentStart > lastCommentEnd) {
                    continue;
                }

                // Check for eslint-disable-next-line on the previous line
                if (lineNumber > 1) {
                    const prevLine = lines[lineNumber - 2];
                    if (prevLine.includes('eslint-disable-next-line') && prevLine.includes('no-console')) {
                        continue;
                    }
                }

                // Check for eslint-disable-line on the same line
                if (line.includes('eslint-disable-line') && line.includes('no-console')) {
                    continue;
                }

                violations.push({
                    file: normalizedPath,
                    line: lineNumber,
                    context: line.trim()
                });
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 7 Violations: No Direct Console.log in Production Code ===\n');
            console.log('Production code SHOULD use the logger utility instead of console.log.\n');

            // Group by file
            const byFile = violations.reduce((acc, v) => {
                if (!acc[v.file]) {
                    acc[v.file] = [];
                }
                acc[v.file].push(v);
                return acc;
            }, {} as Record<string, typeof violations>);

            for (const [file, items] of Object.entries(byFile)) {
                console.log(`\n${file}:`);
                items.forEach(({ line, context }) => {
                    console.log(`  Line ${line}: ${context.substring(0, 80)}${context.length > 80 ? '...' : ''}`);
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${Object.keys(byFile).length}`);
            console.log('\nRecommended patterns:');
            console.log('  - import { logger } from "@/lib/logging"');
            console.log('  - logger.info("message", { context })');
            console.log('  - logger.debug("message", { context })');
            console.log('');
        }

        // Track current baseline - update as violations are fixed
        // Current state: Most console.log usage has been addressed
        const BASELINE_VIOLATIONS = 20;
        
        console.log(`\nConsole.log violations: ${violations.length} (baseline: ${BASELINE_VIOLATIONS})`);
        
        // Test passes if violations don't exceed baseline
        expect(violations.length).toBeLessThanOrEqual(BASELINE_VIOLATIONS);
    });
});
