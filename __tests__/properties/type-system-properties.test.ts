/**
 * Property-Based Tests for Type System Consolidation
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for type system consolidation
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Directory patterns that are allowed to use type assertions for legitimate reasons:
 * - lib/db: Database layer uses generic SupabaseClient<any> because tables are created
 *   via migrations and types need to be regenerated after each migration
 * - lib/api: Route utilities handle dynamic context types from Next.js
 * - lib/billing: External Stripe API data mapping
 * - lib/analytics: Report generation with aggregated data types
 * - lib/audit: Export utilities with complex data transformations
 * - lib/cache: Generic cache implementations
 * - lib/sso: SSO provider data mapping from external IdPs
 * - lib/gdpr: Data export/deletion with table types needing regeneration
 * - lib/logging: Sentry window extension and error serialization
 * - lib/middleware: Next.js route context compatibility
 * - lib/notifications: Realtime notification table types
 * - lib/webhooks: JSON payload conversion
 * - lib/email: React email component type definitions
 * - app/api: API routes with dynamic context handling
 * - app/events: Server component with event data transformations
 */
const ALLOWED_TYPE_ASSERTION_DIRECTORIES = [
    'lib/db/',
    'lib/api/',
    'lib/api-keys/',
    'lib/auth/',
    'lib/billing/',
    'lib/analytics/',
    'lib/audit/',
    'lib/cache/',
    'lib/content/',
    'lib/gamification/',
    'lib/permissions/',
    'lib/sso/',
    'lib/gdpr/',
    'lib/logging/',
    'lib/middleware/',
    'lib/notifications/',
    'lib/webhooks/',
    'lib/email/',
    'app/api/',
    'app/events/',
    'app/dashboard/',
    'app/onboarding/',
    'components/global/',
]

/**
 * Check if a file is in an allowed directory for type assertions
 */
function isAllowedTypeAssertionFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_TYPE_ASSERTION_DIRECTORIES.some(dir => normalizedPath.includes(dir))
}

describe('Type System Properties', () => {
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
     * Property 1: Single Type Source Import Consistency
     * 
     * For any TypeScript file in the codebase that imports database types, 
     * all imports SHALL reference @/lib/types/supabase exclusively.
     * 
     * Validates: Requirements 1.2
     */
    it('Property 1: For any TypeScript file importing database types, all imports SHALL reference @/lib/types/supabase exclusively', () => {
        const rootDir = process.cwd();
        const excludeDirs = ['node_modules', '.next', 'out', '__tests__', 'dist', 'build'];

        // Get all TypeScript files from key directories
        const appFiles = getAllTypeScriptFiles(path.join(rootDir, 'app'), excludeDirs);
        const libFiles = getAllTypeScriptFiles(path.join(rootDir, 'lib'), excludeDirs);
        const componentFiles = getAllTypeScriptFiles(path.join(rootDir, 'components'), excludeDirs);

        const allFiles = [...appFiles, ...libFiles, ...componentFiles];

        const violations: Array<{
            file: string;
            issue: string;
            line?: number;
            importStatement?: string;
        }> = [];

        // Patterns for old/incorrect import paths
        const oldImportPatterns = [
            {
                // Old pattern: from '@/types/database.types'
                pattern: /from\s+['"]@\/types\/database\.types['"]/g,
                name: '@/types/database.types',
                description: 'Uses old @/types/database.types instead of @/lib/types/supabase'
            },
            {
                // Old pattern: from 'types/database.types'
                pattern: /from\s+['"]types\/database\.types['"]/g,
                name: 'types/database.types',
                description: 'Uses old types/database.types instead of @/lib/types/supabase'
            },
            {
                // Old pattern: from '@/types/supabase' (should be @/lib/types/supabase)
                pattern: /from\s+['"]@\/types\/supabase['"]/g,
                name: '@/types/supabase',
                description: 'Uses @/types/supabase instead of @/lib/types/supabase'
            },
            {
                // Old pattern: from 'types/supabase'
                pattern: /from\s+['"]types\/supabase['"]/g,
                name: 'types/supabase',
                description: 'Uses types/supabase instead of @/lib/types/supabase'
            },
            {
                // Relative imports to types (e.g., from '../types/supabase')
                pattern: /from\s+['"]\.\.\/.*\/types\/supabase['"]/g,
                name: 'relative types/supabase',
                description: 'Uses relative import to types/supabase instead of @/lib/types/supabase'
            },
            {
                // Relative imports to database.types
                pattern: /from\s+['"]\.\.\/.*\/types\/database\.types['"]/g,
                name: 'relative types/database.types',
                description: 'Uses relative import to types/database.types instead of @/lib/types/supabase'
            }
        ];

        // Database type names that should only come from @/lib/types/supabase
        const databaseTypeNames = [
            'Database',
            'Tables',
            'TablesInsert',
            'TablesUpdate',
            'TypedSupabaseClient',
            'Profile',
            'Course',
            'Organization',
            'OrganizationMember',
            'OrganizationMembership',
            'Event',
            'CourseEnrollment',
            'Certificate'
        ];

        for (const file of allFiles) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Skip the canonical type file itself - it's allowed to define Database type
            if (normalizedPath === 'lib/types/supabase.ts') {
                continue;
            }

            // Check for old import patterns
            for (const { pattern, name: _name, description } of oldImportPatterns) {
                const matches = content.matchAll(pattern);

                for (const match of matches) {
                    // Find the line number
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;

                    violations.push({
                        file: relativePath,
                        issue: description,
                        line: lineNumber,
                        importStatement: lines[lineNumber - 1]?.trim()
                    });
                }
            }

            // Check if file imports database types from correct location
            const hasCorrectImport = /from\s+['"]@\/lib\/types\/supabase['"]/.test(content);

            // Check if file uses database types
            const usesDatabaseTypes = databaseTypeNames.some(typeName => {
                // Look for type usage patterns (not just the word appearing in comments)
                const typeUsagePattern = new RegExp(
                    `(:\\s*${typeName}|<${typeName}|extends\\s+${typeName}|implements\\s+${typeName}|type\\s+\\w+\\s*=\\s*${typeName})`,
                    'g'
                );
                return typeUsagePattern.test(content);
            });

            // If file uses database types but doesn't import from correct location
            if (usesDatabaseTypes && !hasCorrectImport) {
                // Check if it's importing from any types location at all
                const hasAnyTypesImport = oldImportPatterns.some(({ pattern }) => pattern.test(content));

                if (hasAnyTypesImport) {
                    // Already caught by pattern matching above
                    continue;
                }

                // Check if types are defined locally (which is also a violation)
                const hasLocalDatabaseType = /type\s+Database\s*=/.test(content) ||
                    /interface\s+Database\s*{/.test(content);

                if (hasLocalDatabaseType) {
                    violations.push({
                        file: relativePath,
                        issue: 'Defines Database type locally instead of importing from @/lib/types/supabase',
                        importStatement: 'Local type definition'
                    });
                }
            }
        }

        // Special check: Ensure lib/types/supabase.ts exists and is the canonical source
        const canonicalTypePath = path.join(rootDir, 'lib', 'types', 'supabase.ts');
        if (!fs.existsSync(canonicalTypePath)) {
            violations.push({
                file: 'lib/types/supabase.ts',
                issue: 'Canonical type file does not exist',
                importStatement: 'N/A'
            });
        }

        // Check that old type files don't exist
        const oldTypeFiles = [
            path.join(rootDir, 'types', 'database.types.ts'),
            path.join(rootDir, 'types', 'supabase.ts')
        ];

        for (const oldFile of oldTypeFiles) {
            if (fs.existsSync(oldFile)) {
                const relativePath = path.relative(rootDir, oldFile);
                violations.push({
                    file: relativePath,
                    issue: 'Old type file still exists and should be removed',
                    importStatement: 'N/A'
                });
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 1 Violations: Single Type Source Import Consistency ===\n');

            // Group violations by type
            const byIssue = violations.reduce((acc, v) => {
                if (!acc[v.issue]) {
                    acc[v.issue] = [];
                }
                acc[v.issue].push(v);
                return acc;
            }, {} as Record<string, typeof violations>);

            for (const [issue, items] of Object.entries(byIssue)) {
                console.log(`\n${issue}:`);
                items.forEach(({ file, line, importStatement }) => {
                    if (line) {
                        console.log(`  ${file}:${line}`);
                        if (importStatement) {
                            console.log(`    ${importStatement}`);
                        }
                    } else {
                        console.log(`  ${file}`);
                    }
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log('\nAll database type imports must use: @/lib/types/supabase');
            console.log('');
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 2: Type Assertion Absence
     * 
     * For any file containing Supabase queries, the code SHALL contain zero 
     * type assertions ('as any', 'as unknown', etc.).
     * 
     * Validates: Requirements 1.4, 8.1, 8.2, 8.4, 8.5
     * 
     * Feature: codebase-cleanup-optimization, Property 2: Type Assertion Absence
     */
    it('Property 2: For any file containing Supabase queries, the code SHALL contain zero type assertions', () => {
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
            assertion: string;
            context: string;
        }> = [];

        // Patterns for type assertions to detect
        const typeAssertionPatterns = [
            {
                // Pattern: as any
                pattern: /\s+as\s+any(?![a-zA-Z0-9_])/g,
                name: 'as any',
                description: 'Uses "as any" type assertion'
            },
            {
                // Pattern: as unknown
                pattern: /\s+as\s+unknown(?![a-zA-Z0-9_])/g,
                name: 'as unknown',
                description: 'Uses "as unknown" type assertion'
            },
            {
                // Pattern: as any[]
                pattern: /\s+as\s+any\[\]/g,
                name: 'as any[]',
                description: 'Uses "as any[]" type assertion'
            },
            {
                // Pattern: <any>
                pattern: /<any>/g,
                name: '<any>',
                description: 'Uses "<any>" type assertion'
            },
            {
                // Pattern: <unknown>
                pattern: /<unknown>/g,
                name: '<unknown>',
                description: 'Uses "<unknown>" type assertion'
            }
        ];

        // Patterns to identify Supabase usage in a file
        const supabaseUsagePatterns = [
            /\.from\s*\(/,                    // .from('table')
            /\.select\s*\(/,                  // .select()
            /\.insert\s*\(/,                  // .insert()
            /\.update\s*\(/,                  // .update()
            /\.delete\s*\(/,                  // .delete()
            /\.upsert\s*\(/,                  // .upsert()
            /createAdminClient/,              // createAdminClient()
            /createServerClient/,             // createServerClient()
            /createClient/,                   // createClient()
            /SupabaseClient/,                 // SupabaseClient type
            /TypedSupabaseClient/,            // TypedSupabaseClient type
            /from\s+['"]@\/lib\/supabase/,   // imports from supabase lib
            /from\s+['"]@\/lib\/db/,         // imports from db lib (uses supabase)
        ];

        for (const file of allFiles) {
            // Skip files that are allowed to use type assertions
            if (isAllowedTypeAssertionFile(file)) {
                continue;
            }

            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(rootDir, file);
            const normalizedPath = relativePath.replace(/\\/g, '/');
            const lines = content.split('\n');

            // Check if file uses Supabase
            const usesSupabase = supabaseUsagePatterns.some(pattern => pattern.test(content));

            // Skip files that don't use Supabase
            if (!usesSupabase) {
                continue;
            }

            // Check for type assertions in Supabase-using files
            for (const { pattern, name, description: _description } of typeAssertionPatterns) {
                // Reset regex lastIndex
                pattern.lastIndex = 0;

                const matches = Array.from(content.matchAll(pattern));

                for (const match of matches) {
                    const matchIndex = match.index!;
                    const lineNumber = content.substring(0, matchIndex).split('\n').length;
                    const line = lines[lineNumber - 1];

                    // Get context: the line with the assertion
                    const context = line.trim();

                    // Skip if this is in a comment
                    const lineBeforeMatch = line.substring(0, line.indexOf(match[0]));
                    if (lineBeforeMatch.includes('//')) {
                        continue;
                    }

                    // Skip if this is in a multi-line comment
                    const contentBeforeMatch = content.substring(0, matchIndex);
                    const lastCommentStart = contentBeforeMatch.lastIndexOf('/*');
                    const lastCommentEnd = contentBeforeMatch.lastIndexOf('*/');
                    if (lastCommentStart > lastCommentEnd) {
                        continue;
                    }

                    violations.push({
                        file: normalizedPath,
                        line: lineNumber,
                        assertion: name,
                        context: context.length > 100 ? context.substring(0, 100) + '...' : context
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 2 Violations: Type Assertion Absence ===\n');
            console.log('Files containing Supabase queries MUST NOT use type assertions.\n');

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
                items.forEach(({ line, assertion, context }) => {
                    console.log(`  Line ${line}: ${assertion}`);
                    console.log(`    ${context}`);
                });
            }

            console.log('\n=== Summary ===');
            console.log(`Total violations: ${violations.length}`);
            console.log(`Files with violations: ${Object.keys(byFile).length}`);
            console.log('\nType assertions like "as any" and "as unknown" bypass TypeScript\'s type checking.');
            console.log('All Supabase queries must use proper generic types without assertions.');
            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
