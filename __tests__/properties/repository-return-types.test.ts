/**
 * Property-Based Tests for Repository Return Type Annotations
 * 
 * Feature: codebase-cleanup-optimization, Property 22: Repository Return Type Annotations
 * 
 * These tests verify that all repository methods have explicit return type annotations
 * following consistent patterns as specified in the design document.
 * 
 * Validates: Requirements 8.3
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

describe('Repository Return Type Properties', () => {
    // Helper to recursively get all .ts files in a directory
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
            } else if (item.isFile() && item.name.endsWith('.ts')) {
                // Skip test files and declaration files
                if (!item.name.endsWith('.test.ts') && !item.name.endsWith('.d.ts')) {
                    files.push(fullPath);
                }
            }
        }

        return files;
    }

    // Helper to check if a method has an explicit return type annotation
    function hasExplicitReturnType(methodNode: ts.MethodDeclaration): boolean {
        return methodNode.type !== undefined;
    }

    // Helper to get the return type as a string
    function getReturnTypeString(methodNode: ts.MethodDeclaration, sourceFile: ts.SourceFile): string | null {
        if (!methodNode.type) {
            return null;
        }
        return methodNode.type.getText(sourceFile);
    }

    // Helper to check if return type follows expected patterns
    function isValidReturnTypePattern(returnType: string): {
        valid: boolean;
        pattern?: string;
        issue?: string;
    } {
        // The key requirement is that methods have EXPLICIT return type annotations.
        // We accept any valid TypeScript return type, including:
        // - Promise<T> for async operations
        // - Primitive types (string, number, boolean) for sync operations
        // - Complex types for domain-specific methods
        // - Generic types like Row<T>, PaginatedResult<T>

        // We only flag truly problematic patterns:
        // 1. 'any' without Promise (untyped sync methods)
        // 2. Overly broad 'any' types that should be more specific

        const problematicPatterns = [
            { pattern: /^any$/, issue: 'Return type "any" is too broad - should be more specific' },
            { pattern: /^any\s*\|\s*null$/, issue: 'Return type "any | null" is too broad - should be more specific' },
        ];

        for (const { pattern, issue } of problematicPatterns) {
            if (pattern.test(returnType)) {
                return { valid: false, issue };
            }
        }

        // All other explicit return types are valid
        return { valid: true, pattern: 'Explicit return type annotation' };
    }

    // Helper to parse TypeScript file and extract repository classes
    function parseRepositoryFile(filePath: string): {
        className: string;
        methods: Array<{
            name: string;
            hasReturnType: boolean;
            returnType: string | null;
            isValid: boolean;
            issue?: string;
            line: number;
        }>;
    }[] {
        const sourceCode = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            filePath,
            sourceCode,
            ts.ScriptTarget.Latest,
            true
        );

        const repositories: Array<{
            className: string;
            methods: Array<{
                name: string;
                hasReturnType: boolean;
                returnType: string | null;
                isValid: boolean;
                issue?: string;
                line: number;
            }>;
        }> = [];

        function visit(node: ts.Node) {
            if (ts.isClassDeclaration(node) && node.name) {
                const className = node.name.text;

                // Check if this is a repository class (extends BaseRepository or has "Repository" in name)
                const isRepository = className.includes('Repository') ||
                    (node.heritageClauses?.some(clause =>
                        clause.types.some(type => type.expression.getText(sourceFile).includes('BaseRepository'))
                    ) ?? false);

                if (isRepository) {
                    const methods: Array<{
                        name: string;
                        hasReturnType: boolean;
                        returnType: string | null;
                        isValid: boolean;
                        issue?: string;
                        line: number;
                    }> = [];

                    // Iterate through class members
                    node.members.forEach(member => {
                        if (ts.isMethodDeclaration(member) && member.name) {
                            const methodName = member.name.getText(sourceFile);

                            // Skip constructor and private methods starting with underscore
                            if (methodName === 'constructor' || methodName.startsWith('_')) {
                                return;
                            }

                            const hasReturnType = hasExplicitReturnType(member);
                            const returnType = getReturnTypeString(member, sourceFile);
                            const lineNumber = sourceFile.getLineAndCharacterOfPosition(member.getStart()).line + 1;

                            let isValid = true;
                            let issue: string | undefined;

                            if (!hasReturnType) {
                                isValid = false;
                                issue = 'Missing explicit return type annotation';
                            } else if (returnType) {
                                const validation = isValidReturnTypePattern(returnType);
                                isValid = validation.valid;
                                issue = validation.issue;
                            }

                            methods.push({
                                name: methodName,
                                hasReturnType,
                                returnType,
                                isValid,
                                issue,
                                line: lineNumber
                            });
                        }
                    });

                    if (methods.length > 0) {
                        repositories.push({
                            className,
                            methods
                        });
                    }
                }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return repositories;
    }

    /**
     * Property 22: Repository Return Type Annotations
     * 
     * For any repository method, the method SHALL have explicit return type annotations.
     * 
     * Validates: Requirements 8.3
     */
    it('Property 22: For any repository method, the method SHALL have explicit return type annotations', () => {
        const rootDir = process.cwd();
        const dbDir = path.join(rootDir, 'lib', 'db');

        // Get all TypeScript files in lib/db
        const dbFiles = getAllTypeScriptFiles(dbDir, ['__tests__']);

        const violations: Array<{
            file: string;
            className: string;
            method: string;
            issue: string;
            line: number;
            returnType?: string | null;
        }> = [];

        for (const file of dbFiles) {
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');

            try {
                const repositories = parseRepositoryFile(file);

                for (const repo of repositories) {
                    for (const method of repo.methods) {
                        if (!method.isValid) {
                            violations.push({
                                file: normalizedPath,
                                className: repo.className,
                                method: method.name,
                                issue: method.issue || 'Unknown issue',
                                line: method.line,
                                returnType: method.returnType
                            });
                        }
                    }
                }
            } catch (_error) {
                // Skip files that can't be parsed (might not be repository files)
                continue;
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 22 Violations: Repository Return Type Annotations ===\n');
            console.log('All repository methods MUST have explicit return type annotations.\n');
            console.log('Expected patterns:');
            console.log('  - Promise<T> for single items');
            console.log('  - Promise<T[]> for lists');
            console.log('  - Promise<void> for deletions');
            console.log('  - Promise<T | null> for nullable results');
            console.log('  - Promise<boolean> for existence checks');
            console.log('  - Promise<number> for counts');
            console.log('  - Promise<PaginatedResult<T>> for pagination\n');

            // Group violations by file and class
            const byFile = violations.reduce((acc, v) => {
                const key = `${v.file}::${v.className}`;
                if (!acc[key]) {
                    acc[key] = [];
                }
                acc[key].push(v);
                return acc;
            }, {} as Record<string, typeof violations>);

            for (const [key, items] of Object.entries(byFile)) {
                const [file, className] = key.split('::');
                console.log(`\n${file} - ${className}:`);
                items.forEach(({ method, issue, line, returnType }) => {
                    console.log(`  Line ${line}: ${method}()`);
                    console.log(`    Issue: ${issue}`);
                    if (returnType) {
                        console.log(`    Current: ${returnType}`);
                    }
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${Object.keys(byFile).length}`);
            console.log('\nAll repository methods must have explicit return type annotations.');
            console.log('This ensures type safety and makes the API contract clear.');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
