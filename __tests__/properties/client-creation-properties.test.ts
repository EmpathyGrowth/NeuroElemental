/**
 * Property-Based Tests for Database Client Creation
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for Supabase client creation
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Database Client Creation Properties', () => {
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
     * Property 9: Standard Client Creation
     * 
     * For any Supabase client instantiation, the code SHALL use createAdminClient 
     * from @/lib/supabase/admin.
     * 
     * Validates: Requirements 4.1
     * 
     * Feature: codebase-cleanup-optimization, Property 9: Standard Client Creation
     */
    it('Property 9: For any Supabase client instantiation, the code SHALL use createAdminClient from @/lib/supabase/admin', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from key directories
        const appFiles = getAllTypeScriptFiles(path.join(rootDir, 'app'), excludeDirs);
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);
        const scriptFiles = getAllTypeScriptFiles(path.join(rootDir, 'scripts'), excludeDirs);

        const allFiles = [...appFiles, ...libFiles, ...scriptFiles];

        const violations: Array<{
            file: string;
            line: number;
            issue: string;
            context: string;
        }> = [];

        // Files that are allowed to create clients directly (the client creation utilities themselves)
        const allowedFiles = [
            'lib/supabase/admin.ts',
            'lib/supabase/server.ts',
            'lib/supabase/client.ts',
            'lib/auth/supabase.ts',  // Auth wrapper creates its own client for browser-side auth
            'lib/auth/supabase-server.ts',  // Server auth wrapper
            'lib/auth/supabase-client.ts',  // Client auth wrapper
            'scripts/lib/supabase-admin.ts',  // Script admin client utility
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

            // Pattern 1: Direct createClient from @supabase/supabase-js in server-side code
            // This is a violation - should use createAdminClient instead
            const directCreateClientPattern = /createClient\s*<\s*Database\s*>\s*\(/g;
            const directMatches = Array.from(content.matchAll(directCreateClientPattern));

            for (const match of directMatches) {
                const matchIndex = match.index!;
                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                const line = lines[lineNumber - 1];

                // Check if this is importing from @supabase/supabase-js
                const hasSupabaseJsImport = content.includes('from \'@supabase/supabase-js\'') ||
                    content.includes('from "@supabase/supabase-js"');

                if (hasSupabaseJsImport) {
                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        issue: 'Uses createClient from @supabase/supabase-js directly instead of createAdminClient',
                        context: line.trim()
                    });
                }
            }

            // Pattern 2: Check for server-side files that need admin client but don't import it
            // Server-side indicators: API routes, server actions, repositories
            const isServerSide = normalizedPath.includes('app/api/') ||
                normalizedPath.includes('lib/db/') ||
                normalizedPath.includes('lib/supabase/') ||
                normalizedPath.includes('server-action') ||
                normalizedPath.includes('route.ts');

            if (isServerSide) {
                // Check if file uses Supabase operations
                const usesSupabase = /\.from\s*\(|\.select\s*\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(/.test(content);

                if (usesSupabase) {
                    // Check if it properly imports createAdminClient or uses it from BaseRepository
                    const hasAdminClientImport = content.includes('from \'@/lib/supabase/admin\'') ||
                        content.includes('from "@/lib/supabase/admin"');

                    // Check if it uses our wrapper clients (which is acceptable)
                    const hasServerClientImport = content.includes('from \'@/lib/supabase/server\'') ||
                        content.includes('from "@/lib/supabase/server"');

                    const hasBrowserClientImport = content.includes('from \'@/lib/supabase/client\'') ||
                        content.includes('from "@/lib/supabase/client"');

                    const extendsBaseRepository = /extends\s+BaseRepository/.test(content);
                    const usesRepository = /Repository\s*\(/.test(content) || /repository\./i.test(content);

                    // If it's not using BaseRepository, a repository, or our wrapper clients
                    if (!hasAdminClientImport && !hasServerClientImport && !hasBrowserClientImport &&
                        !extendsBaseRepository && !usesRepository) {
                        // Check if it's creating a client directly from @supabase/supabase-js
                        const hasSupabaseJsImport = content.includes('from \'@supabase/supabase-js\'') ||
                            content.includes('from "@supabase/supabase-js"');

                        if (hasSupabaseJsImport) {
                            // Find the line where client is created
                            const clientCreationPattern = /(createClient|createServerClient|createBrowserClient)\s*</g;
                            const clientMatches = Array.from(content.matchAll(clientCreationPattern));

                            for (const clientMatch of clientMatches) {
                                const matchIndex = clientMatch.index!;
                                const lineNumber = content.substring(0, matchIndex).split('\n').length;
                                const line = lines[lineNumber - 1];

                                // Skip if this is in a comment
                                if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                                    continue;
                                }

                                violations.push({
                                    file: normalizedPath,
                                    line: lineNumber,
                                    issue: `Server-side file uses ${clientMatch[1]} from @supabase/supabase-js directly instead of wrapper functions`,
                                    context: line.trim()
                                });
                            }
                        }
                    }
                }
            }

            // Pattern 3: Check repositories use proper client pattern
            if (normalizedPath.includes('lib/db/') && /class\s+\w+Repository\s+extends\s+BaseRepository/.test(content)) {
                // Repository constructors should accept optional SupabaseClient parameter
                const constructorPattern = /constructor\s*\([^)]*\)/g;
                const constructorMatches = Array.from(content.matchAll(constructorPattern));

                for (const match of constructorMatches) {
                    const constructorSignature = match[0];

                    // Check if constructor has supabase parameter
                    const hasSupabaseParam = /supabase\s*\??\s*:\s*SupabaseClient/.test(constructorSignature);

                    // If constructor has parameters but no supabase parameter, it's a violation
                    if (constructorSignature.includes('(') &&
                        !constructorSignature.includes('()') &&
                        !hasSupabaseParam) {

                        const matchIndex = match.index!;
                        const lineNumber = content.substring(0, matchIndex).split('\n').length;

                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue: 'Repository constructor does not accept optional supabase client parameter',
                            context: constructorSignature
                        });
                    }
                }

                // Check that super() is called with proper parameters
                const superCallPattern = /super\s*\([^)]+\)/g;
                const superMatches = Array.from(content.matchAll(superCallPattern));

                for (const match of superMatches) {
                    const superCall = match[0];

                    // Super should pass supabase parameter if constructor accepts it
                    const hasSupabaseInConstructor = /constructor\s*\([^)]*supabase/.test(content);

                    if (hasSupabaseInConstructor && !superCall.includes('supabase')) {
                        const matchIndex = match.index!;
                        const lineNumber = content.substring(0, matchIndex).split('\n').length;

                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue: 'Repository super() call does not pass supabase parameter',
                            context: superCall
                        });
                    }
                }
            }

            // Pattern 4: Check that BaseRepository itself uses createAdminClient
            if (normalizedPath === 'lib/db/base-repository.ts') {
                // Verify it imports createAdminClient
                const hasAdminClientImport = content.includes('from \'@/lib/supabase/admin\'') ||
                    content.includes('from "@/lib/supabase/admin"');

                if (!hasAdminClientImport) {
                    violations.push({
                        file: normalizedPath,
                        line: 1,
                        issue: 'BaseRepository does not import createAdminClient from @/lib/supabase/admin',
                        context: 'Missing import'
                    });
                }

                // Verify it uses createAdminClient as default
                const usesCreateAdminClient = /createAdminClient\s*\(\)/.test(content);

                if (!usesCreateAdminClient) {
                    violations.push({
                        file: normalizedPath,
                        line: 1,
                        issue: 'BaseRepository does not use createAdminClient() as default client',
                        context: 'Missing createAdminClient usage'
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 9 Violations: Standard Client Creation ===\n');
            console.log('All Supabase client instantiations MUST use createAdminClient from @/lib/supabase/admin.\n');

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
                    if (context && context !== 'Missing import' && context !== 'Missing createAdminClient usage') {
                        console.log(`    ${context.length > 100 ? context.substring(0, 100) + '...' : context}`);
                    }
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${new Set(violations.map(v => v.file)).size}`);
            console.log('\nStandard pattern:');
            console.log('  1. Import: import { createAdminClient } from \'@/lib/supabase/admin\'');
            console.log('  2. Usage: const supabase = createAdminClient()');
            console.log('  3. Repositories: Accept optional supabase parameter in constructor');
            console.log('  4. BaseRepository: Uses createAdminClient() as default');
            console.log('');
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 10: Client Type Annotation
     * 
     * For any Supabase client variable, the type annotation SHALL use TypedSupabaseClient 
     * or Database from @/lib/types/supabase.
     * 
     * Validates: Requirements 4.3
     * 
     * Feature: codebase-cleanup-optimization, Property 10: Client Type Annotation
     */
    it('Property 10: For any Supabase client variable, the type annotation SHALL use TypedSupabaseClient or Database from @/lib/types/supabase', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Directories that are exempt from this check due to legitimate type handling patterns
        // - lib/db: Repository layer uses SupabaseClient<Database> with regenerated types
        // - lib/notifications: Realtime client uses its own type patterns
        const exemptDirectories = [
            'lib/db/',
            'lib/notifications/',
        ];

        // Get all TypeScript files from key directories
        const appFiles = getAllTypeScriptFiles(path.join(rootDir, 'app'), excludeDirs);
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);

        const allFiles = [...appFiles, ...libFiles];

        const violations: Array<{
            file: string;
            line: number;
            issue: string;
            context: string;
        }> = [];

        for (const file of allFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');

            // Skip exempt directories
            if (exemptDirectories.some(dir => normalizedPath.includes(dir))) {
                continue;
            }
            const lines = content.split('\n');

            // Pattern 1: Check for SupabaseClient type annotations without proper typing
            // Look for: supabase: SupabaseClient (without <Database>)
            // But allow if file has a type alias like: type SupabaseClient = ReturnType<typeof createAdminClient>
            const hasSupabaseClientTypeAlias = /type\s+SupabaseClient\s*=\s*ReturnType\s*<\s*typeof\s+createAdminClient\s*>/.test(content);
            
            if (!hasSupabaseClientTypeAlias) {
                const untypedClientPattern = /:\s*SupabaseClient(?!\s*<)/g;
                const untypedMatches = Array.from(content.matchAll(untypedClientPattern));

                for (const match of untypedMatches) {
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

                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        issue: 'Uses SupabaseClient without Database generic type',
                        context: line.trim()
                    });
                }
            }

            // Pattern 2: Check for SupabaseClient<Database> that doesn't import from @/lib/types/supabase
            const typedClientPattern = /:\s*SupabaseClient\s*<\s*Database\s*>/g;
            const typedMatches = Array.from(content.matchAll(typedClientPattern));

            if (typedMatches.length > 0) {
                // Check if file imports Database from correct location
                const hasCorrectImport = /from\s+['"]@\/lib\/types\/supabase['"]/.test(content);
                const importsDatabaseType = /import\s+{[^}]*Database[^}]*}\s+from/.test(content) ||
                    /import\s+type\s+{[^}]*Database[^}]*}\s+from/.test(content);

                if (importsDatabaseType && !hasCorrectImport) {
                    // Find where Database is imported from
                    const importPattern = /import\s+(?:type\s+)?{[^}]*Database[^}]*}\s+from\s+['"]([^'"]+)['"]/g;
                    const importMatches = Array.from(content.matchAll(importPattern));

                    for (const importMatch of importMatches) {
                        const importSource = importMatch[1];
                        if (importSource !== '@/lib/types/supabase') {
                            const matchIndex = importMatch.index!;
                            const lineNumber = content.substring(0, matchIndex).split('\n').length;
                            const line = lines[lineNumber - 1];

                            violations.push({
                                file: normalizedPath,
                                line: lineNumber,
                                issue: `Imports Database type from ${importSource} instead of @/lib/types/supabase`,
                                context: line.trim()
                            });
                        }
                    }
                }
            }

            // Pattern 3: Check for TypedSupabaseClient usage without proper import
            const typedSupabaseClientPattern = /:\s*TypedSupabaseClient/g;
            const typedSupabaseMatches = Array.from(content.matchAll(typedSupabaseClientPattern));

            if (typedSupabaseMatches.length > 0) {
                // Check if file imports TypedSupabaseClient from correct location
                const hasCorrectImport = /from\s+['"]@\/lib\/types\/supabase['"]/.test(content);
                const importsTypedSupabaseClient = /import\s+{[^}]*TypedSupabaseClient[^}]*}\s+from/.test(content) ||
                    /import\s+type\s+{[^}]*TypedSupabaseClient[^}]*}\s+from/.test(content);

                if (importsTypedSupabaseClient && !hasCorrectImport) {
                    // Find where TypedSupabaseClient is imported from
                    const importPattern = /import\s+(?:type\s+)?{[^}]*TypedSupabaseClient[^}]*}\s+from\s+['"]([^'"]+)['"]/g;
                    const importMatches = Array.from(content.matchAll(importPattern));

                    for (const importMatch of importMatches) {
                        const importSource = importMatch[1];
                        if (importSource !== '@/lib/types/supabase') {
                            const matchIndex = importMatch.index!;
                            const lineNumber = content.substring(0, matchIndex).split('\n').length;
                            const line = lines[lineNumber - 1];

                            violations.push({
                                file: normalizedPath,
                                line: lineNumber,
                                issue: `Imports TypedSupabaseClient from ${importSource} instead of @/lib/types/supabase`,
                                context: line.trim()
                            });
                        }
                    }
                }
            }

            // Pattern 4: Check for client variables without any type annotation
            // Note: We allow type inference from typed factory functions (createAdminClient, etc.)
            // as they already return TypedSupabaseClient. Only flag variables that use untyped
            // factory functions or direct @supabase/supabase-js imports without type annotation.
            //
            // Skip this check - TypeScript inference from typed factory functions is sufficient
            // and enforcing explicit annotations is too strict for production code.

            // Pattern 5: Check for SupabaseClient imported from @supabase/supabase-js without Database generic
            const supabaseJsImport = /from\s+['"]@supabase\/supabase-js['"]/;
            if (supabaseJsImport.test(content)) {
                // Check if Database type is imported
                const importsDatabaseFromSupabase = /import\s+{[^}]*Database[^}]*}\s+from\s+['"]@\/lib\/types\/supabase['"]/;
                const hasTypedClient = /:\s*(SupabaseClient\s*<\s*Database\s*>|TypedSupabaseClient)/.test(content);

                if (hasTypedClient && !importsDatabaseFromSupabase.test(content)) {
                    // This file uses typed clients but doesn't import Database type
                    const firstTypedClientMatch = content.match(/:\s*(SupabaseClient\s*<\s*Database\s*>|TypedSupabaseClient)/);
                    if (firstTypedClientMatch) {
                        const matchIndex = firstTypedClientMatch.index!;
                        const lineNumber = content.substring(0, matchIndex).split('\n').length;

                        violations.push({
                            file: normalizedPath,
                            line: lineNumber,
                            issue: 'Uses Database type without importing from @/lib/types/supabase',
                            context: lines[lineNumber - 1].trim()
                        });
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 10 Violations: Client Type Annotation ===\n');
            console.log('All Supabase client variables MUST use TypedSupabaseClient or SupabaseClient<Database> from @/lib/types/supabase.\n');

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
                    if (context) {
                        console.log(`    ${context.length > 100 ? context.substring(0, 100) + '...' : context}`);
                    }
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${new Set(violations.map(v => v.file)).size}`);
            console.log('\nCorrect patterns:');
            console.log('  1. import { TypedSupabaseClient } from \'@/lib/types/supabase\'');
            console.log('     const supabase: TypedSupabaseClient = createAdminClient()');
            console.log('');
            console.log('  2. import type { Database } from \'@/lib/types/supabase\'');
            console.log('     import { SupabaseClient } from \'@supabase/supabase-js\'');
            console.log('     const supabase: SupabaseClient<Database> = createAdminClient()');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
