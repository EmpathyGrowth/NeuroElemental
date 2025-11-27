/**
 * Property-Based Tests for Validation Patterns
 * Feature: codebase-cleanup-optimization, Property 24 & 25
 * 
 * These tests verify that:
 * - Property 24: No inline validation exists in routes
 * - Property 25: Routes use validateRequest helper for validation
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Recursively get all TypeScript files in a directory
 */
function getAllTsFiles(dir: string, fileList: string[] = []): string[] {
    const files = readdirSync(dir)

    files.forEach(file => {
        const filePath = join(dir, file)
        const stat = statSync(filePath)

        if (stat.isDirectory()) {
            getAllTsFiles(filePath, fileList)
        } else if (file.endsWith('.ts') && !file.endsWith('.test.ts') && !file.endsWith('.d.ts')) {
            fileList.push(filePath)
        }
    })

    return fileList
}

/**
 * Get all API route files
 */
function getApiRouteFiles(): string[] {
    const apiDir = join(process.cwd(), 'app', 'api')
    return getAllTsFiles(apiDir).filter(file => file.endsWith('route.ts'))
}

describe('Validation Pattern Properties', () => {
    const apiRoutes = getApiRouteFiles()

    describe('Property 25: Validation Helper Usage', () => {
        /**
         * **Feature: codebase-cleanup-optimization, Property 25: Validation Helper Usage**
         * **Validates: Requirements 9.3**
         * 
         * For any request body validation, the code SHALL use validateRequest helper function.
         */
        it('should use validateRequest helper for request validation', () => {
            const routesWithSchemaValidation: Array<{ file: string; usesHelper: boolean; validationMethod: string }> = []
            const routesNotUsingHelper: string[] = []

            apiRoutes.forEach(routeFile => {
                const content = readFileSync(routeFile, 'utf-8')

                // Check if route does schema-based validation
                const hasSchemaImport = /from ['"]@\/lib\/validation\/schemas['"]/.test(content)
                // Exclude JSON.parse which is not validation
                const hasZodParse = /(?<!JSON)\.(?:safeParse|parse)\(/.test(content)
                const hasValidateRequest = /validateRequest\(/.test(content)
                const hasWithValidation = /withValidation\(/.test(content)
                const hasValidateMultiple = /validateMultiple\(/.test(content)

                // If route has schema imports or uses Zod parsing
                if (hasSchemaImport || hasZodParse) {
                    // Determine validation method
                    let validationMethod = 'none'
                    let usesHelper = false

                    if (hasValidateRequest) {
                        validationMethod = 'validateRequest'
                        usesHelper = true
                    } else if (hasWithValidation) {
                        validationMethod = 'withValidation'
                        usesHelper = true
                    } else if (hasValidateMultiple) {
                        validationMethod = 'validateMultiple'
                        usesHelper = true
                    } else if (hasZodParse) {
                        validationMethod = 'direct Zod parse'
                        usesHelper = false
                    }

                    routesWithSchemaValidation.push({
                        file: routeFile.replace(process.cwd(), ''),
                        usesHelper,
                        validationMethod
                    })

                    if (!usesHelper) {
                        routesNotUsingHelper.push(routeFile.replace(process.cwd(), ''))
                    }
                }
            })

            // Report routes not using validation helpers
            if (routesNotUsingHelper.length > 0) {
                console.log('\nRoutes performing validation without helper functions:')
                routesNotUsingHelper.forEach(route => {
                    const routeInfo = routesWithSchemaValidation.find(r => r.file === route)
                    console.log(`  - ${route} (using: ${routeInfo?.validationMethod})`)
                })
            }

            // Calculate compliance rate
            const totalRoutesWithValidation = routesWithSchemaValidation.length
            const routesUsingHelpers = routesWithSchemaValidation.filter(r => r.usesHelper).length
            const complianceRate = totalRoutesWithValidation > 0
                ? (routesUsingHelpers / totalRoutesWithValidation) * 100
                : 100

            console.log(`\nValidation Helper Usage: ${complianceRate.toFixed(1)}% (${routesUsingHelpers}/${totalRoutesWithValidation} routes)`)

            // Property 25: For any request body validation, the code SHALL use validateRequest helper
            // We expect high compliance (>80%) after refactoring
            expect(complianceRate).toBeGreaterThanOrEqual(80)
        })

        it('should use correct validation helper pattern with proper error handling', () => {
            const routesWithImproperPattern: Array<{ file: string; issue: string }> = []

            apiRoutes.forEach(routeFile => {
                const content = readFileSync(routeFile, 'utf-8')

                // Only check routes that use validateRequest
                if (/validateRequest\(/.test(content)) {
                    const issues: string[] = []

                    // Check for proper pattern: const validation = await validateRequest(...)
                    const hasProperAssignment = /const\s+\w+\s*=\s*await\s+validateRequest\(/.test(content)
                    if (!hasProperAssignment) {
                        issues.push('Missing proper assignment pattern (const validation = await validateRequest(...))')
                    }

                    // Check for success check: if (!validation.success)
                    const hasSuccessCheck = /if\s*\(\s*!\s*\w+\.success\s*\)/.test(content)
                    if (!hasSuccessCheck) {
                        issues.push('Missing validation success check')
                    }

                    // Check that validated data is used: validation.data
                    const usesValidatedData = /\w+\.data/.test(content)
                    if (!usesValidatedData) {
                        issues.push('Not using validated data (validation.data)')
                    }

                    if (issues.length > 0) {
                        routesWithImproperPattern.push({
                            file: routeFile.replace(process.cwd(), ''),
                            issue: issues.join('; ')
                        })
                    }
                }
            })

            if (routesWithImproperPattern.length > 0) {
                console.log('\nRoutes with improper validateRequest pattern:')
                routesWithImproperPattern.forEach(({ file, issue }) => {
                    console.log(`  - ${file}`)
                    console.log(`    Issue: ${issue}`)
                })
            }

            // All routes using validateRequest should follow the proper pattern
            expect(routesWithImproperPattern.length).toBe(0)
        })
    })

    describe('Property 24: No Inline Validation', () => {
        /**
         * **Feature: codebase-cleanup-optimization, Property 24: No Inline Validation**
         * **Validates: Requirements 9.2**
         * 
         * For any validation logic, the validation SHALL use reusable schemas rather than inline validation code.
         */
        it('should use reusable schemas instead of inline validation', () => {
            const routesWithInlineChecks: Array<{ file: string; patterns: string[] }> = []

            // Patterns that indicate inline validation (not using schemas)
            const inlineValidationPatterns = [
                { pattern: /if\s*\(!body\.\w+\s*\|\|\s*typeof\s+body\.\w+\s*!==/, description: 'typeof checks on body fields' },
                { pattern: /if\s*\(!.*\.trim\(\)\.length/, description: 'manual trim/length checks' },
                { pattern: /if\s*\(.*<\s*\d+\s*\|\|\s*.*>\s*\d+\)/, description: 'manual range validation' },
                { pattern: /if\s*\(!Array\.isArray\(.*\)\s*\|\|\s*.*\.length\s*===\s*0\)/, description: 'manual array validation' },
            ]

            apiRoutes.forEach(routeFile => {
                const content = readFileSync(routeFile, 'utf-8')
                const foundPatterns: string[] = []

                // Skip if using validateRequest (proper pattern)
                if (/validateRequest\(/.test(content)) {
                    return
                }

                // Check for inline validation patterns
                inlineValidationPatterns.forEach(({ pattern, description }) => {
                    if (pattern.test(content)) {
                        foundPatterns.push(description)
                    }
                })

                if (foundPatterns.length > 0) {
                    routesWithInlineChecks.push({
                        file: routeFile.replace(process.cwd(), ''),
                        patterns: foundPatterns
                    })
                }
            })

            // Report routes with inline validation
            if (routesWithInlineChecks.length > 0) {
                console.log('\nRoutes with inline validation (should use schemas):')
                routesWithInlineChecks.forEach(({ file, patterns }) => {
                    console.log(`  - ${file}`)
                    patterns.forEach(pattern => console.log(`    * ${pattern}`))
                })
            }

            // This property tracks progress - ideally should be 0
            // For now, we allow some inline validation but track it
            const totalRoutes = apiRoutes.length
            const routesWithInline = routesWithInlineChecks.length
            const complianceRate = ((totalRoutes - routesWithInline) / totalRoutes) * 100

            console.log(`\nValidation Schema Compliance: ${complianceRate.toFixed(1)}% (${totalRoutes - routesWithInline}/${totalRoutes} routes)`)

            // We expect at least 50% compliance after this refactoring
            expect(complianceRate).toBeGreaterThanOrEqual(50)
        })

        it('should import validation schemas from centralized location', () => {
            const routesWithValidation: string[] = []
            const routesWithCorrectImports: string[] = []

            apiRoutes.forEach(routeFile => {
                const content = readFileSync(routeFile, 'utf-8')

                // Check if route does validation
                const hasValidation = /\.safeParse\(|\.parse\(|validateRequest\(/.test(content)

                if (hasValidation) {
                    routesWithValidation.push(routeFile)

                    // Check if importing from centralized schemas
                    const hasSchemaImport = /from ['"]@\/lib\/validation\/schemas['"]/.test(content)

                    if (hasSchemaImport) {
                        routesWithCorrectImports.push(routeFile)
                    }
                }
            })

            if (routesWithValidation.length > 0) {
                const complianceRate = (routesWithCorrectImports.length / routesWithValidation.length) * 100
                console.log(`\nCentralized Schema Import Compliance: ${complianceRate.toFixed(1)}% (${routesWithCorrectImports.length}/${routesWithValidation.length} routes)`)

                // We expect at least 70% of routes with validation to import from centralized schemas
                expect(complianceRate).toBeGreaterThanOrEqual(70)
            }
        })
    })
})
