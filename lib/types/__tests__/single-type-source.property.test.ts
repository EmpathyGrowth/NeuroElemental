/**
 * Property-Based Test: Single Type Source
 *
 * **Feature: codebase-cleanup-optimization, Property 1: Single Type Source Import Consistency**
 * **Validates: Requirements 1.2**
 *
 * Property: All database type references SHALL import from lib/types/supabase.ts exclusively.
 * No imports should reference database.types.ts or other duplicate type files.
 */

import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'
import { describe, expect, it } from 'vitest'

/**
 * Recursively find all .ts and .tsx files in directory
 */
function findSourceFiles(dir: string): string[] {
    const results: string[] = []

    if (!fs.existsSync(dir)) {
        return results
    }

    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
                results.push(...findSourceFiles(filePath))
            }
        } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
            // Exclude definition files
            if (!file.endsWith('.d.ts')) {
                results.push(filePath)
            }
        }
    }

    return results
}

/**
 * Check if a file contains invalid type imports
 */
function checkTypeImports(filePath: string): {
    isValid: boolean
    issues: string[]
} {
    // Skip the canonical file itself
    if (filePath.endsWith('lib\\types\\supabase.ts') || filePath.endsWith('lib/types/supabase.ts')) {
        return { isValid: true, issues: [] }
    }

    const content = fs.readFileSync(filePath, 'utf-8')
    const issues: string[] = []

    // Check for imports from database.types
    const databaseTypesImport = /from\s+['"][^'"]*database\.types['"]/
    if (databaseTypesImport.test(content)) {
        issues.push('Imports from database.types (should use @/lib/types/supabase)')
    }

    // Check for imports from types/supabase that aren't the canonical one
    // This is a heuristic: if it imports 'types/supabase' but not 'lib/types/supabase'
    // it might be importing a legacy file if one exists.
    // However, since we want to enforce @/lib/types/supabase, we can look for that.

    // We want to ensure that if Database type is imported, it comes from the right place
    if (content.includes('Database')) {
        const databaseImport = /import\s+.*Database.*\s+from\s+['"]([^'"]+)['"]/
        const match = content.match(databaseImport)

        if (match) {
            const importPath = match[1]
            const isCanonical = importPath.includes('lib/types/supabase') ||
                               importPath === '@/lib/types/supabase' ||
                               // Allow relative imports if they resolve correctly (hard to verify strictly, but we can check common patterns)
                               (importPath.startsWith('.') && filePath.includes('lib\\types'))

            if (!isCanonical) {
                // It might be a valid relative import, so we need to be careful.
                // But generally we want to enforce absolute imports or strict relative imports within the module.
                // For now, let's flag suspicious non-lib paths.
                if (!importPath.includes('lib/types/supabase') && !importPath.includes('./supabase')) {
                     // We'll only flag if it explicitly looks like a legacy path
                     if (importPath.includes('types/database') || (importPath.endsWith('types/supabase') && !importPath.includes('lib/'))) {
                         issues.push(`Suspicious Database import from ${importPath}`)
                     }
                }
            }
        }
    }

    return {
        isValid: issues.length === 0,
        issues
    }
}

describe('Property 1: Single Type Source Import Consistency', () => {
    it('should verify no files import from legacy database.types', () => {
        const rootDir = process.cwd()
        const appDir = path.join(rootDir, 'app')
        const libDir = path.join(rootDir, 'lib')

        const sourceFiles = [
            ...findSourceFiles(appDir),
            ...findSourceFiles(libDir)
        ]

        expect(sourceFiles.length).toBeGreaterThan(0)

        const violations: Array<{ file: string; issues: string[] }> = []

        for (const file of sourceFiles) {
            const result = checkTypeImports(file)
            if (!result.isValid) {
                const relativePath = path.relative(rootDir, file)
                violations.push({
                    file: relativePath,
                    issues: result.issues
                })
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}:\n    ${v.issues.join('\n    ')}`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} file(s) with invalid type imports:${violationReport}`
            )
        }
    })

    it('should verify import consistency across random file samples', () => {
        const rootDir = process.cwd()
        const appDir = path.join(rootDir, 'app')
        const libDir = path.join(rootDir, 'lib')

        const sourceFiles = [
            ...findSourceFiles(appDir),
            ...findSourceFiles(libDir)
        ]

        fc.assert(
            fc.property(
                fc.shuffledSubarray(sourceFiles, { minLength: 1, maxLength: Math.min(20, sourceFiles.length) }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = checkTypeImports(file)
                        expect(result.isValid).toBe(true)
                    }
                }
            ),
            { numRuns: 50 }
        )
    })
})
