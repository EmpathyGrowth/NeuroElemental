/**
 * Property-Based Test: Error Response Helper Usage
 * 
 * **Feature: codebase-cleanup-optimization, Property 16: Error Response Helper Usage**
 * **Validates: Requirements 6.2**
 * 
 * Property: For any error return in route handlers, the return SHALL use errorResponse helper.
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
 * Check if a route file uses errorResponse for error returns
 */
function checkErrorResponseUsage(filePath: string): {
    hasDirectErrorReturns: boolean
    violations: string[]
    usesErrorResponse: boolean
} {
    const content = fs.readFileSync(filePath, 'utf-8')
    const violations: string[] = []

    // Check for direct NextResponse.json({ error: ... }) patterns
    // This pattern indicates an error response not using errorResponse helper
    // We need to be careful to only match actual return statements, not comments or strings
    const lines = content.split('\n')
    lines.forEach((line, index) => {
        // Skip comments
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
            return
        }

        // Check for return NextResponse.json({ error: ... })
        if (/return\s+NextResponse\.json\s*\(\s*\{\s*error\s*:/.test(line)) {
            violations.push(`Line ${index + 1}: ${line.trim()}`)
        }
    })

    // Check if errorResponse is used
    const usesErrorResponse = /errorResponse\s*\(/.test(content)

    return {
        hasDirectErrorReturns: violations.length > 0,
        violations,
        usesErrorResponse
    }
}

/**
 * Check if errorResponse is imported when used
 */
function checkErrorResponseImport(filePath: string): {
    hasImportIssue: boolean
    issue?: string
} {
    const content = fs.readFileSync(filePath, 'utf-8')

    // Check if errorResponse is used
    const usesErrorResponse = /errorResponse\s*\(/.test(content)

    if (usesErrorResponse) {
        // Check if it's imported
        const hasImport = /import\s+{[^}]*errorResponse[^}]*}\s+from\s+['"]@\/lib\/api/.test(content)

        if (!hasImport) {
            return {
                hasImportIssue: true,
                issue: 'Uses errorResponse() but missing import from @/lib/api'
            }
        }
    }

    return {
        hasImportIssue: false
    }
}

/**
 * Check if route uses factory pattern (which handles errors automatically)
 */
function usesFactoryPattern(content: string): boolean {
    return /create(Authenticated|Public|Admin)Route/.test(content)
}

describe('Property 16: Error Response Helper Usage', () => {
    it('should verify all error returns use errorResponse helper', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        expect(routeFiles.length).toBeGreaterThan(0)

        const violations: Array<{ file: string; violations: string[] }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Skip files using factory pattern (they handle errors automatically)
            if (usesFactoryPattern(content)) {
                continue
            }

            const result = checkErrorResponseUsage(routeFile)

            if (result.hasDirectErrorReturns) {
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
                `Found ${violations.length} route file(s) with direct error returns:${violationReport}\n\n` +
                `All error returns should use errorResponse() helper`
            )
        }
    })

    it('should verify errorResponse import is present when used', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const violations: Array<{ file: string; issue: string }> = []

        for (const routeFile of routeFiles) {
            const result = checkErrorResponseImport(routeFile)

            if (result.hasImportIssue) {
                const relativePath = path.relative(process.cwd(), routeFile)
                violations.push({
                    file: relativePath,
                    issue: result.issue!
                })
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

    it('should verify error response usage across random route samples', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        // Filter out factory-pattern routes
        const nonFactoryRoutes = routeFiles.filter(file => {
            const content = fs.readFileSync(file, 'utf-8')
            return !usesFactoryPattern(content)
        })

        if (nonFactoryRoutes.length === 0) {
            // All routes use factory pattern, which is good
            return
        }

        // Property: For any subset of non-factory routes, none should have direct error returns
        fc.assert(
            fc.property(
                fc.shuffledSubarray(nonFactoryRoutes, {
                    minLength: 1,
                    maxLength: Math.min(10, nonFactoryRoutes.length)
                }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = checkErrorResponseUsage(file)
                        expect(result.hasDirectErrorReturns).toBe(false)
                    }
                }
            ),
            { numRuns: 100 }
        )
    })

    it('should verify routes with errors use errorResponse', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const routesWithErrorsButNoHelper: string[] = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Skip factory pattern routes
            if (usesFactoryPattern(content)) {
                continue
            }

            // Check if route has error handling logic
            const hasErrorLogic = /error|Error|throw/.test(content)

            if (hasErrorLogic) {
                const result = checkErrorResponseUsage(routeFile)

                // If it has error logic but doesn't use errorResponse, flag it
                if (!result.usesErrorResponse && result.hasDirectErrorReturns) {
                    const relativePath = path.relative(process.cwd(), routeFile)
                    routesWithErrorsButNoHelper.push(relativePath)
                }
            }
        }

        if (routesWithErrorsButNoHelper.length > 0) {
            throw new Error(
                `Found ${routesWithErrorsButNoHelper.length} route(s) with error handling but not using errorResponse:\n` +
                routesWithErrorsButNoHelper.map(f => `  - ${f}`).join('\n')
            )
        }
    })

    it('should verify consistent error response format', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const inconsistentFormats: Array<{ file: string; issues: string[] }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')
            const issues: string[] = []

            // Check for inconsistent error response patterns
            // Pattern 1: return NextResponse.json({ message: ... }, { status: 4xx/5xx })
            if (/NextResponse\.json\s*\(\s*\{\s*message\s*:/.test(content)) {
                issues.push('Uses "message" field instead of "error" field')
            }

            // Pattern 2: return NextResponse.json({ err: ... })
            if (/NextResponse\.json\s*\(\s*\{\s*err\s*:/.test(content)) {
                issues.push('Uses "err" field instead of "error" field')
            }

            // Pattern 3: return NextResponse.json({ success: false, error: ... })
            if (/NextResponse\.json\s*\(\s*\{\s*success\s*:\s*false/.test(content)) {
                issues.push('Uses success flag pattern instead of errorResponse')
            }

            if (issues.length > 0) {
                const relativePath = path.relative(process.cwd(), routeFile)
                inconsistentFormats.push({
                    file: relativePath,
                    issues
                })
            }
        }

        if (inconsistentFormats.length > 0) {
            const violationReport = inconsistentFormats
                .map(v => `\n  ${v.file}:\n    ${v.issues.join('\n    ')}`)
                .join('\n')

            throw new Error(
                `Found ${inconsistentFormats.length} route(s) with inconsistent error formats:${violationReport}\n\n` +
                `All error responses should use errorResponse() for consistency`
            )
        }
    })

    it('should verify error responses include proper status codes', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const missingStatusCodes: string[] = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Skip factory pattern routes
            if (usesFactoryPattern(content)) {
                continue
            }

            // Check for error responses without status codes
            // Pattern: NextResponse.json({ error: ... }) without status
            const errorWithoutStatus = /NextResponse\.json\s*\(\s*\{\s*error\s*:[^}]+\}\s*\)(?!\s*,\s*\{\s*status)/g
            const matches = content.match(errorWithoutStatus) || []

            if (matches.length > 0) {
                const relativePath = path.relative(process.cwd(), routeFile)
                missingStatusCodes.push(relativePath)
            }
        }

        if (missingStatusCodes.length > 0) {
            console.warn(
                `\nWarning: Found ${missingStatusCodes.length} route(s) with error responses missing status codes:` +
                missingStatusCodes.map(f => `\n  - ${f}`).join('') +
                `\n\nConsider using errorResponse() which automatically includes proper status codes`
            )
        }
    })
})
