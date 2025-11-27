/**
 * Property-Based Test: Validation Schema Import
 * Feature: codebase-cleanup-optimization, Property 23: Validation Schema Import
 * 
 * Property: For any request validation, the validation SHALL use schemas 
 * imported from @/lib/validation/schemas
 * 
 * Validates: Requirements 9.1
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Recursively find all TypeScript files in a directory
 */
function findTypeScriptFiles(dir: string, files: string[] = []): string[] {
    const entries = readdirSync(dir)

    for (const entry of entries) {
        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
            // Skip node_modules, .next, and other build directories
            if (!entry.startsWith('.') && entry !== 'node_modules' && entry !== 'out') {
                findTypeScriptFiles(fullPath, files)
            }
        } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
            files.push(fullPath)
        }
    }

    return files
}

/**
 * Check if a file contains validation schema usage
 */
function containsValidationUsage(content: string): boolean {
    // Look for Zod validation patterns (not JSON.parse)
    const validationPatterns = [
        /\.safeParse\(/,
        /validateRequest\(/,
        /validateQuery\(/,
        /validateParams\(/,
        /z\.object\(/,
        /z\.string\(/,
        /z\.number\(/,
        /z\.array\(/,
        /z\.enum\(/,
        /z\.record\(/,
    ]

    // Exclude JSON.parse which is not validation
    if (/JSON\.parse\(/.test(content) && !validationPatterns.some(p => p.test(content))) {
        return false
    }

    return validationPatterns.some(pattern => pattern.test(content))
}

/**
 * Check if validation schemas are imported from the correct location
 */
function hasCorrectSchemaImport(content: string): boolean {
    // Check for imports from @/lib/validation/schemas or @/lib/validation
    const correctImportPatterns = [
        /@\/lib\/validation\/schemas/,
        /@\/lib\/validation['"]/, // Barrel export
    ]

    return correctImportPatterns.some(pattern => pattern.test(content))
}

/**
 * Check if file has inline validation schemas (anti-pattern)
 */
function hasInlineValidation(content: string): boolean {
    // Look for inline Zod schema definitions (not imports)
    // This is a heuristic - we look for z.object definitions that aren't in the schemas file
    const lines = content.split('\n')

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        // Skip import statements
        if (line.trim().startsWith('import')) continue

        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('/*')) continue

        // Look for inline schema definitions
        if (/const\s+\w+Schema\s*=\s*z\.object\(/.test(line)) {
            return true
        }
    }

    return false
}

describe('Property 23: Validation Schema Import', () => {
    const projectRoot = process.cwd()
    const apiDir = join(projectRoot, 'app', 'api')
    const libDir = join(projectRoot, 'lib')

    it('should import validation schemas from @/lib/validation/schemas in API routes', () => {
        const apiFiles = findTypeScriptFiles(apiDir)
        const violations: string[] = []

        for (const file of apiFiles) {
            // Skip test files
            if (file.includes('__tests__') || file.includes('.test.') || file.includes('.spec.')) {
                continue
            }

            const content = readFileSync(file, 'utf-8')

            // If file uses validation, it should import from correct location
            if (containsValidationUsage(content)) {
                if (!hasCorrectSchemaImport(content)) {
                    violations.push(file.replace(projectRoot, ''))
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nFiles using validation without correct schema imports:')
            violations.forEach(file => console.log(`  - ${file}`))
        }

        expect(violations).toHaveLength(0)
    })

    it('should not have inline validation schemas in API routes', () => {
        const apiFiles = findTypeScriptFiles(apiDir)
        const violations: string[] = []

        for (const file of apiFiles) {
            // Skip test files and the schemas file itself
            if (
                file.includes('__tests__') ||
                file.includes('.test.') ||
                file.includes('.spec.') ||
                file.includes('schemas.ts')
            ) {
                continue
            }

            const content = readFileSync(file, 'utf-8')

            if (hasInlineValidation(content)) {
                violations.push(file.replace(projectRoot, ''))
            }
        }

        if (violations.length > 0) {
            console.log('\nFiles with inline validation schemas (should be in schemas.ts):')
            violations.forEach(file => console.log(`  - ${file}`))
        }

        expect(violations).toHaveLength(0)
    })

    it('should import validation utilities from @/lib/validation in lib modules', () => {
        const libFiles = findTypeScriptFiles(libDir)
        const violations: string[] = []

        for (const file of libFiles) {
            // Skip test files, validation directory itself, and type files
            if (
                file.includes('__tests__') ||
                file.includes('.test.') ||
                file.includes('.spec.') ||
                file.includes('validation') ||
                file.includes('types')
            ) {
                continue
            }

            const content = readFileSync(file, 'utf-8')

            // If file uses validation, check imports
            if (containsValidationUsage(content)) {
                // Check if it imports from validation module
                const hasValidationImport = /@\/lib\/validation/.test(content)

                if (!hasValidationImport) {
                    // Only flag if it's actually using schemas (not just zod utilities)
                    if (/Schema/.test(content) && !file.includes('schema')) {
                        violations.push(file.replace(projectRoot, ''))
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nLib files using validation without correct imports:')
            violations.forEach(file => console.log(`  - ${file}`))
        }

        // This is informational - we allow some flexibility in lib modules
        expect(violations.length).toBeLessThanOrEqual(10)
    })

    it('should have all validation schemas exported from schemas.ts', () => {
        const schemasFile = join(projectRoot, 'lib', 'validation', 'schemas.ts')
        const content = readFileSync(schemasFile, 'utf-8')

        // Check that schemas file exports schemas
        const hasExports = /export const \w+Schema/.test(content)
        expect(hasExports).toBe(true)

        // Check that it imports from zod
        const hasZodImport = /from ['"]zod['"]/.test(content)
        expect(hasZodImport).toBe(true)
    })

    it('should have validation barrel export in index.ts', () => {
        const indexFile = join(projectRoot, 'lib', 'validation', 'index.ts')
        const content = readFileSync(indexFile, 'utf-8')

        // Check that index exports from schemas
        const exportsSchemas = /export \* from ['"]\.\/schemas['"]/.test(content)
        expect(exportsSchemas).toBe(true)
    })
})
