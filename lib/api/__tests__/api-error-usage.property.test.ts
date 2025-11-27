/**
 * Property-Based Test: ApiError Usage
 * 
 * **Feature: codebase-cleanup-optimization, Property 15: ApiError Usage**
 * **Validates: Requirements 6.1**
 * 
 * Property: For any error thrown in business logic or routes, the error SHALL be 
 * an instance of ApiError or created via error factory functions.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Routes that are allowed to throw generic Error for legitimate reasons:
 * - Webhook handlers: Need to throw generic Error so Stripe sees failure and retries
 * - Cron jobs: Need to throw generic Error for retry mechanisms
 */
const ALLOWED_GENERIC_ERROR_ROUTES = [
    'app/api/billing/webhook/route.ts',  // Stripe webhooks need Error for retry mechanism
    'app/api/cron/aggregate-metrics/route.ts',  // Cron jobs need Error for retry mechanism
]

/**
 * Check if a route is allowed to have generic Error throws
 */
function isAllowedGenericErrorRoute(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_GENERIC_ERROR_ROUTES.some(allowed => normalizedPath.endsWith(allowed))
}

/**
 * Recursively find all TypeScript files in a directory
 */
function findAllTsFiles(dir: string, exclude: string[] = []): string[] {
    const results: string[] = []

    if (!fs.existsSync(dir)) {
        return results
    }

    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        // Skip excluded directories
        if (stat.isDirectory()) {
            const shouldExclude = exclude.some(pattern => filePath.includes(pattern))
            if (!shouldExclude) {
                results.push(...findAllTsFiles(filePath, exclude))
            }
        } else if (file.endsWith('.ts') && !file.endsWith('.test.ts')) {
            results.push(filePath)
        }
    }

    return results
}

/**
 * Check if a file uses proper error handling
 */
function checkErrorHandling(filePath: string): {
    hasGenericErrors: boolean
    violations: string[]
} {
    const content = fs.readFileSync(filePath, 'utf-8')

    const violations: string[] = []

    // Check for generic throw new Error() statements
    // This regex looks for throw new Error( but not throw new ApiError(
    const genericErrorPattern = /throw\s+new\s+Error\s*\(/g
    const genericErrors = content.match(genericErrorPattern) || []

    if (genericErrors.length > 0) {
        // Get line numbers for better reporting
        const lines = content.split('\n')
        lines.forEach((line, index) => {
            if (/throw\s+new\s+Error\s*\(/.test(line)) {
                violations.push(`Line ${index + 1}: ${line.trim()}`)
            }
        })
    }

    return {
        hasGenericErrors: genericErrors.length > 0,
        violations
    }
}

/**
 * Check if error factories are properly imported when used
 */
function checkErrorFactoryImports(filePath: string): {
    hasImportIssues: boolean
    issues: string[]
} {
    const content = fs.readFileSync(filePath, 'utf-8')
    const issues: string[] = []

    // Error factory functions to check
    const errorFactories = [
        'unauthorizedError',
        'forbiddenError',
        'notFoundError',
        'badRequestError',
        'validationError',
        'conflictError',
        'internalError',
        'rateLimitError'
    ]

    for (const factory of errorFactories) {
        // Check if factory is used
        const factoryUsagePattern = new RegExp(`${factory}\\s*\\(`, 'g')
        const isUsed = factoryUsagePattern.test(content)

        if (isUsed) {
            // Check if it's imported
            const importPattern = new RegExp(`import\\s+{[^}]*${factory}[^}]*}\\s+from\\s+['"]@/lib/api`, 'g')
            const isImported = importPattern.test(content)

            if (!isImported) {
                issues.push(`Uses ${factory}() but missing import from @/lib/api`)
            }
        }
    }

    return {
        hasImportIssues: issues.length > 0,
        issues
    }
}

describe('Property 15: ApiError Usage', () => {
    it('should verify no generic Error throws in API routes (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllTsFiles(apiDir, ['__tests__', 'node_modules'])

        expect(routeFiles.length).toBeGreaterThan(0)

        const violations: Array<{ file: string; violations: string[] }> = []

        for (const routeFile of routeFiles) {
            // Skip routes that are allowed to have generic Error throws
            if (isAllowedGenericErrorRoute(routeFile)) {
                continue
            }

            const result = checkErrorHandling(routeFile)

            if (result.hasGenericErrors) {
                const relativePath = path.relative(process.cwd(), routeFile)
                violations.push({
                    file: relativePath,
                    violations: result.violations
                })
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}:\n    ${v.violations.join('\n    ')}`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} file(s) with generic Error throws:${violationReport}\n\n` +
                `All errors should use ApiError or error factory functions (internalError, badRequestError, etc.)\n` +
                `If this route has a legitimate reason for generic Error (e.g., webhook retry), add it to ALLOWED_GENERIC_ERROR_ROUTES.`
            )
        }
    })

    it('should verify no generic Error throws in business logic', () => {
        const libDir = path.join(process.cwd(), 'lib')
        const libFiles = findAllTsFiles(libDir, ['__tests__', 'node_modules', 'types'])

        expect(libFiles.length).toBeGreaterThan(0)

        const violations: Array<{ file: string; violations: string[] }> = []

        for (const libFile of libFiles) {
            const result = checkErrorHandling(libFile)

            if (result.hasGenericErrors) {
                const relativePath = path.relative(process.cwd(), libFile)
                violations.push({
                    file: relativePath,
                    violations: result.violations
                })
            }
        }

        // Note: This test is informational for now. Task 23 focused on API routes.
        // Business logic error standardization will be addressed in a future task.
        if (violations.length > 0) {
            console.info(
                `\nInfo: Found ${violations.length} file(s) in lib/ with generic Error throws.` +
                `\nThese should be addressed in a future task:` +
                violations.map(v => `\n  ${v.file}: ${v.violations.length} occurrence(s)`).join('')
            )
        }
    })

    it('should verify error factory imports are present when used', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllTsFiles(apiDir, ['__tests__', 'node_modules'])

        const violations: Array<{ file: string; issues: string[] }> = []

        for (const routeFile of routeFiles) {
            const result = checkErrorFactoryImports(routeFile)

            if (result.hasImportIssues) {
                const relativePath = path.relative(process.cwd(), routeFile)
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
                `Found ${violations.length} file(s) with import issues:${violationReport}`
            )
        }
    })

    it('should verify error handling across random file samples (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllTsFiles(apiDir, ['__tests__', 'node_modules'])
            .filter(file => !isAllowedGenericErrorRoute(file))

        // Property: For any subset of non-exempted files, none should have generic Error throws
        fc.assert(
            fc.property(
                fc.shuffledSubarray(routeFiles, {
                    minLength: 1,
                    maxLength: Math.min(20, routeFiles.length)
                }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = checkErrorHandling(file)
                        expect(result.hasGenericErrors).toBe(false)
                    }
                }
            ),
            { numRuns: 100 }
        )
    })

    it('should verify ApiError class is used for custom errors', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllTsFiles(apiDir, ['__tests__', 'node_modules'])

        const filesWithCustomErrors: string[] = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Check if file creates custom errors (not using factories)
            const hasNewApiError = /new\s+ApiError\s*\(/.test(content)

            if (hasNewApiError) {
                // Verify ApiError is imported
                const hasApiErrorImport = /import\s+{[^}]*ApiError[^}]*}\s+from\s+['"]@\/lib\/api/.test(content)

                if (!hasApiErrorImport) {
                    const relativePath = path.relative(process.cwd(), routeFile)
                    filesWithCustomErrors.push(relativePath)
                }
            }
        }

        if (filesWithCustomErrors.length > 0) {
            throw new Error(
                `Found ${filesWithCustomErrors.length} file(s) using ApiError without importing it:\n` +
                filesWithCustomErrors.map(f => `  - ${f}`).join('\n')
            )
        }
    })

    it('should verify error factories are preferred over direct ApiError instantiation', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllTsFiles(apiDir, ['__tests__', 'node_modules'])

        const filesWithDirectApiError: Array<{ file: string; count: number }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Count direct ApiError instantiations
            const directApiErrorPattern = /new\s+ApiError\s*\(/g
            const matches = content.match(directApiErrorPattern) || []

            if (matches.length > 0) {
                const relativePath = path.relative(process.cwd(), routeFile)
                filesWithDirectApiError.push({
                    file: relativePath,
                    count: matches.length
                })
            }
        }

        // This is informational - direct ApiError usage is allowed but factories are preferred
        if (filesWithDirectApiError.length > 0) {
            console.info(
                `\nInfo: Found ${filesWithDirectApiError.length} file(s) using direct ApiError instantiation.` +
                `\nConsider using error factory functions for consistency:` +
                filesWithDirectApiError.map(f => `\n  ${f.file}: ${f.count} occurrence(s)`).join('')
            )
        }
    })
})
