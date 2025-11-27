/**
 * Property-Based Test: Try-Catch Absence in Routes
 * 
 * **Feature: codebase-cleanup-optimization, Property 8: Try-Catch Absence in Routes**
 * **Validates: Requirements 3.5**
 * 
 * Property: For any route handler using factory pattern, the handler SHALL not 
 * contain manual try-catch blocks.
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Routes that are allowed to have try-catch blocks for legitimate reasons:
 * - Webhook handlers: Need to control retry behavior
 * - Admin dashboard: Defensive coding for partial data availability
 * - Analytics export: Complex file operations with cleanup requirements
 * - Coupon redemption: Complex transaction logic with rollback
 */
const ALLOWED_TRY_CATCH_ROUTES = [
    'app/api/billing/webhook/route.ts',
    'app/api/stripe/webhook/route.ts',  // Webhook signature validation requires try-catch
    'app/api/dashboard/admin/route.ts',
    'app/api/dashboard/admin/analytics/route.ts',
    'app/api/dashboard/admin/analytics/export/route.ts',
    'app/api/dashboard/admin/resources/route.ts',
    'app/api/dashboard/admin/users/route.ts',
    'app/api/admin/coupons/route.ts',
    'app/api/coupons/redeem/route.ts',
    'app/api/user/preferences/route.ts',
]

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
 * Check if a route is in the allowed list for try-catch
 */
function isAllowedTryCatchRoute(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_TRY_CATCH_ROUTES.some(allowed => normalizedPath.endsWith(allowed))
}

/**
 * Check if a route file contains try-catch blocks in factory-wrapped handlers
 */
function hasTryCatchInFactoryRoutes(filePath: string): {
    hasTryCatch: boolean
    hasFactoryRoutes: boolean
    violations: Array<{ method: string; line: number; factoryType: string }>
} {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // Find all route exports that use factory pattern
    const factoryRoutePattern = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=\s*create(Authenticated|Public|Admin)Route/g
    const matches = [...content.matchAll(factoryRoutePattern)]

    const hasFactoryRoutes = matches.length > 0

    if (!hasFactoryRoutes) {
        return {
            hasTryCatch: false,
            hasFactoryRoutes: false,
            violations: []
        }
    }

    const violations: Array<{ method: string; line: number; factoryType: string }> = []

    for (const match of matches) {
        const method = match[1]
        const factoryType = match[2]

        // Find the handler function boundaries
        const exportLineIndex = lines.findIndex(line => line.includes(match[0]))
        if (exportLineIndex === -1) continue

        // Track braces to find handler boundaries
        let braceCount = 0
        let inHandler = false
        let handlerStartLine = -1
        let handlerEndLine = -1

        for (let i = exportLineIndex; i < lines.length; i++) {
            const line = lines[i]

            for (const char of line) {
                if (char === '{') {
                    braceCount++
                    if (!inHandler && braceCount === 1) {
                        inHandler = true
                        handlerStartLine = i
                    }
                } else if (char === '}') {
                    braceCount--
                    if (inHandler && braceCount === 0) {
                        handlerEndLine = i
                        break
                    }
                }
            }

            if (handlerEndLine !== -1) break
        }

        if (handlerStartLine === -1 || handlerEndLine === -1) continue

        // Check for try-catch blocks within the handler
        for (let i = handlerStartLine; i <= handlerEndLine; i++) {
            const line = lines[i]

            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                continue
            }

            // Look for try blocks
            if (/\btry\s*{/.test(line)) {
                violations.push({
                    method: method,
                    line: i + 1,
                    factoryType: `${factoryType}Route`
                })
            }
        }
    }

    return {
        hasTryCatch: violations.length > 0,
        hasFactoryRoutes: true,
        violations
    }
}

describe('Property 8: Try-Catch Absence in Routes', () => {
    it('should verify no manual try-catch blocks in factory-wrapped routes (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        expect(routeFiles.length).toBeGreaterThan(0)

        const allViolations: Array<{
            file: string
            violations: Array<{ method: string; line: number; factoryType: string }>
        }> = []

        for (const routeFile of routeFiles) {
            // Skip routes that are explicitly allowed to have try-catch
            if (isAllowedTryCatchRoute(routeFile)) {
                continue
            }

            const result = hasTryCatchInFactoryRoutes(routeFile)

            if (result.hasFactoryRoutes && result.hasTryCatch) {
                const relativePath = path.relative(process.cwd(), routeFile)
                allViolations.push({
                    file: relativePath,
                    violations: result.violations
                })
            }
        }

        if (allViolations.length > 0) {
            const violationReport = allViolations
                .map(v =>
                    `\n  ${v.file}:` +
                    v.violations.map(viol =>
                        `\n    Line ${viol.line} (${viol.method} in ${viol.factoryType}): Contains try-catch block`
                    ).join('')
                )
                .join('\n')

            throw new Error(
                `Found ${allViolations.length} route file(s) with manual try-catch blocks in factory-wrapped handlers:${violationReport}\n\n` +
                `Factory pattern provides automatic error handling. Manual try-catch blocks should be removed.\n` +
                `If this route has a legitimate reason for try-catch, add it to ALLOWED_TRY_CATCH_ROUTES.`
            )
        }
    })

    it('should verify try-catch absence across random route samples (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)
            .filter(file => !isAllowedTryCatchRoute(file))

        // Property: For any subset of route files using factory pattern, none should have try-catch
        fc.assert(
            fc.property(
                fc.shuffledSubarray(routeFiles, {
                    minLength: 1,
                    maxLength: Math.min(10, routeFiles.length)
                }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = hasTryCatchInFactoryRoutes(file)

                        // If the file has factory routes, it must not have try-catch blocks
                        if (result.hasFactoryRoutes) {
                            expect(result.hasTryCatch).toBe(false)
                        }
                    }
                }
            ),
            { numRuns: 100 }
        )
    })

    it('should verify factory pattern provides error handling (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)
            .filter(file => !isAllowedTryCatchRoute(file))

        // Count routes using factory pattern
        let factoryRouteCount = 0
        let routesWithTryCatch = 0
        let allowedCount = 0

        for (const routeFile of routeFiles) {
            const result = hasTryCatchInFactoryRoutes(routeFile)

            if (result.hasFactoryRoutes) {
                factoryRouteCount++

                if (result.hasTryCatch) {
                    routesWithTryCatch++
                }
            }
        }

        // Count allowed routes for reporting
        for (const routeFile of findAllRouteFiles(apiDir)) {
            if (isAllowedTryCatchRoute(routeFile)) {
                allowedCount++
            }
        }

        // If we have factory routes, verify the pattern is being used correctly
        if (factoryRouteCount > 0) {
            const complianceRate = ((factoryRouteCount - routesWithTryCatch) / factoryRouteCount) * 100

            // Log compliance for visibility
            console.log(`\nFactory Pattern Compliance:`)
            console.log(`  Total factory-wrapped routes: ${factoryRouteCount}`)
            console.log(`  Routes without try-catch: ${factoryRouteCount - routesWithTryCatch}`)
            console.log(`  Routes with try-catch (violations): ${routesWithTryCatch}`)
            console.log(`  Routes with allowed try-catch: ${allowedCount}`)
            console.log(`  Compliance rate: ${complianceRate.toFixed(1)}%`)

            // All non-exempted factory routes should not have try-catch blocks
            expect(routesWithTryCatch).toBe(0)
        }
    })

    it('should verify consistent error handling pattern across all factory routes (excluding allowed exceptions)', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)
            .filter(file => !isAllowedTryCatchRoute(file))

        // Property: For any two factory-wrapped routes, both should have the same error handling pattern
        // (i.e., neither should have manual try-catch)
        const routesWithFactories = routeFiles.filter(file => {
            const result = hasTryCatchInFactoryRoutes(file)
            return result.hasFactoryRoutes
        })

        if (routesWithFactories.length < 2) {
            // Not enough routes to compare
            return
        }

        fc.assert(
            fc.property(
                fc.tuple(
                    fc.integer({ min: 0, max: routesWithFactories.length - 1 }),
                    fc.integer({ min: 0, max: routesWithFactories.length - 1 })
                ),
                ([index1, index2]) => {
                    const file1 = routesWithFactories[index1]
                    const file2 = routesWithFactories[index2]

                    const result1 = hasTryCatchInFactoryRoutes(file1)
                    const result2 = hasTryCatchInFactoryRoutes(file2)

                    // Both should not have try-catch blocks (consistent pattern)
                    expect(result1.hasTryCatch).toBe(false)
                    expect(result2.hasTryCatch).toBe(false)
                }
            ),
            { numRuns: 50 }
        )
    })
})
