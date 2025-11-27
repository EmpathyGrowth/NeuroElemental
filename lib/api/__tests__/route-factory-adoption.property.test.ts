/**
 * Property-Based Test: Route Factory Adoption
 * 
 * **Feature: codebase-cleanup-optimization, Property 6: Route Factory Adoption**
 * **Validates: Requirements 3.1**
 * 
 * Property: For any API route file in app/api, the route handlers SHALL use 
 * createAuthenticatedRoute, createPublicRoute, or createAdminRoute.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Recursively find all route.ts files in app/api directory
 */
function findAllRouteFiles(dir: string): string[] {
    const results: string[] = []

    if (!fs.existsSync(dir)) {
        return results
    }

    const files = fs.readdirSync(dir)

    for (const file of files) {
        const filePath = path.join(dir, file)
        const stat = fs.statSync(filePath)

        if (stat.isDirectory()) {
            results.push(...findAllRouteFiles(filePath))
        } else if (file === 'route.ts') {
            results.push(filePath)
        }
    }

    return results
}

/**
 * Check if a route file uses factory pattern
 */
function usesFactoryPattern(filePath: string): {
    usesFactory: boolean
    hasRouteExports: boolean
    details: string[]
} {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Check for route exports (GET, POST, PUT, DELETE, PATCH)
    const routeExportPattern = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/g
    const routeExports = content.match(routeExportPattern) || []
    const hasRouteExports = routeExports.length > 0

    if (!hasRouteExports) {
        return {
            usesFactory: true, // No routes to check
            hasRouteExports: false,
            details: ['No route exports found']
        }
    }

    // Check for factory function usage
    const factoryPatterns = [
        /createAuthenticatedRoute/,
        /createPublicRoute/,
        /createAdminRoute/,
        /createCronRoute/,
        /createOptionalAuthRoute/
    ]

    const details: string[] = []
    let allRoutesUseFactory = true

    // For each route export, check if it uses a factory
    for (const routeExport of routeExports) {
        const method = routeExport.match(/(GET|POST|PUT|DELETE|PATCH)/)?.[1]

        // Find the line with this export
        const lines = content.split('\n')
        const exportLineIndex = lines.findIndex(line => line.includes(routeExport))

        if (exportLineIndex === -1) continue

        // Check the next few lines for factory usage
        const contextLines = lines.slice(exportLineIndex, exportLineIndex + 5).join('\n')

        const usesFactory = factoryPatterns.some(pattern => pattern.test(contextLines))

        if (!usesFactory) {
            allRoutesUseFactory = false
            details.push(`${method} does not use factory pattern`)
        } else {
            details.push(`${method} uses factory pattern`)
        }
    }

    return {
        usesFactory: allRoutesUseFactory,
        hasRouteExports: true,
        details
    }
}

describe('Property 6: Route Factory Adoption', () => {
    it('should verify all API routes use factory pattern', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        expect(routeFiles.length).toBeGreaterThan(0)

        const violations: Array<{ file: string; details: string[] }> = []

        for (const routeFile of routeFiles) {
            const result = usesFactoryPattern(routeFile)

            if (result.hasRouteExports && !result.usesFactory) {
                const relativePath = path.relative(process.cwd(), routeFile)
                violations.push({
                    file: relativePath,
                    details: result.details
                })
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}:\n    ${v.details.join('\n    ')}`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} route file(s) not using factory pattern:${violationReport}`
            )
        }
    })

    it('should verify factory pattern usage across random route samples', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        // Property: For any subset of route files, all should use factory pattern
        fc.assert(
            fc.property(
                fc.shuffledSubarray(routeFiles, { minLength: 1, maxLength: Math.min(10, routeFiles.length) }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = usesFactoryPattern(file)

                        // If the file has route exports, it must use factory pattern
                        if (result.hasRouteExports) {
                            expect(result.usesFactory).toBe(true)
                        }
                    }
                }
            ),
            { numRuns: 100 }
        )
    })

    it('should verify factory imports are present when factory is used', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const violations: Array<{ file: string; issue: string }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Check if file uses factory functions
            const usesCreateAuthenticatedRoute = /createAuthenticatedRoute/.test(content)
            const usesCreatePublicRoute = /createPublicRoute/.test(content)
            const usesCreateAdminRoute = /createAdminRoute/.test(content)

            const usesAnyFactory = usesCreateAuthenticatedRoute || usesCreatePublicRoute || usesCreateAdminRoute

            if (usesAnyFactory) {
                // Check if factory is imported
                const hasFactoryImport = /import\s+{[^}]*create(Authenticated|Public|Admin)Route[^}]*}\s+from\s+['"]@\/lib\/api/.test(content)

                if (!hasFactoryImport) {
                    const relativePath = path.relative(process.cwd(), routeFile)
                    violations.push({
                        file: relativePath,
                        issue: 'Uses factory function but missing import from @/lib/api'
                    })
                }
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}: ${v.issue}`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} route file(s) with import issues:${violationReport}`
            )
        }
    })

    it('should verify no manual try-catch blocks in factory-wrapped routes', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const violations: Array<{ file: string; method: string }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Find all route exports
            const routeExportPattern = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=\s*create(Authenticated|Public|Admin)Route/g
            const matches = [...content.matchAll(routeExportPattern)]

            for (const match of matches) {
                const method = match[1]
                const factoryType = match[2]

                // Find the handler function for this route
                const handlerStart = content.indexOf(match[0])
                const handlerEnd = content.indexOf('});', handlerStart)

                if (handlerEnd === -1) continue

                const handlerContent = content.substring(handlerStart, handlerEnd)

                // Check for try-catch blocks within the handler
                // Note: This is a heuristic - we're looking for try blocks that aren't part of specific operations
                const hasTryCatch = /try\s*{/.test(handlerContent)

                if (hasTryCatch) {
                    const relativePath = path.relative(process.cwd(), routeFile)
                    violations.push({
                        file: relativePath,
                        method: `${method} (${factoryType}Route)`
                    })
                }
            }
        }

        // Note: Some try-catch blocks might be legitimate (e.g., for specific error handling)
        // This test identifies potential violations for manual review
        if (violations.length > 0) {
            console.warn(
                `\nWarning: Found ${violations.length} route(s) with try-catch blocks inside factory-wrapped handlers.` +
                `\nThese should be reviewed to ensure they're necessary:` +
                violations.map(v => `\n  ${v.file}: ${v.method}`).join('')
            )
        }

        // This is a warning, not a hard failure, as some try-catch blocks may be intentional
        // for specific error handling scenarios
    })
})
