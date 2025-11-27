/**
 * Property-Based Test: Response Helper Usage
 * 
 * **Feature: codebase-cleanup-optimization, Property 7: Response Helper Usage**
 * **Validates: Requirements 3.4**
 * 
 * Property: For any route handler return statement, the response SHALL use 
 * successResponse, errorResponse, or paginatedResponse helpers.
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
 * Check if a route file uses response helpers correctly
 */
function usesResponseHelpers(filePath: string): {
    usesHelpers: boolean
    hasRouteExports: boolean
    violations: Array<{ method: string; line: number; issue: string }>
} {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n')

    // Check for route exports (GET, POST, PUT, DELETE, PATCH)
    const routeExportPattern = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/g
    const routeExports = content.match(routeExportPattern) || []
    const hasRouteExports = routeExports.length > 0

    if (!hasRouteExports) {
        return {
            usesHelpers: true, // No routes to check
            hasRouteExports: false,
            violations: []
        }
    }

    const violations: Array<{ method: string; line: number; issue: string }> = []

    // Find all return statements in route handlers
    for (const routeExport of routeExports) {
        const method = routeExport.match(/(GET|POST|PUT|DELETE|PATCH)/)?.[1]
        if (!method) continue

        // Find the export line
        const exportLineIndex = lines.findIndex(line => line.includes(routeExport))
        if (exportLineIndex === -1) continue

        // Find the handler function boundaries
        // Look for the opening of the handler and find its closing
        let braceCount = 0
        let inHandler = false
        let handlerStartLine = -1
        let handlerEndLine = -1

        for (let i = exportLineIndex; i < lines.length; i++) {
            const line = lines[i]

            // Count braces to track function scope
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

        // Track nesting level to distinguish route handler returns from nested function returns
        let nestingLevel = 0

        // Check all return statements in this handler
        for (let i = handlerStartLine; i <= handlerEndLine; i++) {
            const line = lines[i]

            // Skip comments
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                continue
            }

            // Track arrow functions and function declarations to avoid false positives
            // Count opening braces for nested functions
            const arrowFunctionMatch = line.match(/=>\s*{/)
            const functionMatch = line.match(/function\s*\w*\s*\([^)]*\)\s*{/)

            if (arrowFunctionMatch || functionMatch) {
                nestingLevel++
            }

            // Count closing braces
            const closingBraces = (line.match(/}/g) || []).length
            const openingBraces = (line.match(/{/g) || []).length
            nestingLevel += openingBraces - closingBraces

            // Ensure nestingLevel doesn't go negative
            if (nestingLevel < 0) nestingLevel = 0

            // Look for return statements - only check if we're at the top level of the handler
            if (/\breturn\s+/.test(line) && nestingLevel <= 1) {
                // Check if it uses response helpers
                const usesSuccessResponse = /successResponse\s*\(/.test(line)
                const usesErrorResponse = /errorResponse\s*\(/.test(line)
                const usesPaginatedResponse = /paginatedResponse\s*\(/.test(line)

                // Check if it uses NextResponse.json directly (violation)
                const usesNextResponseJson = /NextResponse\.json\s*\(/.test(line)

                const usesHelper = usesSuccessResponse || usesErrorResponse || usesPaginatedResponse

                if (usesNextResponseJson && !usesHelper) {
                    violations.push({
                        method: method,
                        line: i + 1,
                        issue: 'Uses NextResponse.json() instead of response helpers'
                    })
                }
            }
        }
    }

    return {
        usesHelpers: violations.length === 0,
        hasRouteExports: true,
        violations
    }
}

describe('Property 7: Response Helper Usage', () => {
    it('should verify all API routes use response helpers', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        expect(routeFiles.length).toBeGreaterThan(0)

        const allViolations: Array<{ file: string; violations: Array<{ method: string; line: number; issue: string }> }> = []

        for (const routeFile of routeFiles) {
            const result = usesResponseHelpers(routeFile)

            if (result.hasRouteExports && !result.usesHelpers) {
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
                    v.violations.map(viol => `\n    Line ${viol.line} (${viol.method}): ${viol.issue}`).join('')
                )
                .join('\n')

            throw new Error(
                `Found ${allViolations.length} route file(s) not using response helpers correctly:${violationReport}\n\n` +
                `All route handlers should use successResponse(), errorResponse(), or paginatedResponse() instead of NextResponse.json()`
            )
        }
    })

    it('should verify response helper usage across random route samples', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        // Property: For any subset of route files, all should use response helpers
        fc.assert(
            fc.property(
                fc.shuffledSubarray(routeFiles, { minLength: 1, maxLength: Math.min(10, routeFiles.length) }),
                (sampleFiles) => {
                    for (const file of sampleFiles) {
                        const result = usesResponseHelpers(file)

                        // If the file has route exports, it must use response helpers
                        if (result.hasRouteExports) {
                            expect(result.usesHelpers).toBe(true)
                        }
                    }
                }
            ),
            { numRuns: 100 }
        )
    })

    it('should verify response helper imports are present when helpers are used', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const violations: Array<{ file: string; issue: string }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')

            // Check if file uses response helpers
            const usesSuccessResponse = /successResponse\s*\(/.test(content)
            const usesErrorResponse = /errorResponse\s*\(/.test(content)
            const usesPaginatedResponse = /paginatedResponse\s*\(/.test(content)

            const usesAnyHelper = usesSuccessResponse || usesErrorResponse || usesPaginatedResponse

            if (usesAnyHelper) {
                // Check if helpers are imported from @/lib/api
                const hasHelperImport = /import\s+{[^}]*(successResponse|errorResponse|paginatedResponse)[^}]*}\s+from\s+['"]@\/lib\/api/.test(content)

                if (!hasHelperImport) {
                    const relativePath = path.relative(process.cwd(), routeFile)
                    violations.push({
                        file: relativePath,
                        issue: 'Uses response helper but missing import from @/lib/api'
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

    it('should verify no direct NextResponse.json usage in route handlers', () => {
        const apiDir = path.join(process.cwd(), 'app', 'api')
        const routeFiles = findAllRouteFiles(apiDir)

        const violations: Array<{ file: string; method: string; line: number }> = []

        for (const routeFile of routeFiles) {
            const content = fs.readFileSync(routeFile, 'utf-8')
            const lines = content.split('\n')

            // Find all route exports
            const routeExportPattern = /export\s+const\s+(GET|POST|PUT|DELETE|PATCH)\s*=/g
            const matches = [...content.matchAll(routeExportPattern)]

            for (const match of matches) {
                const method = match[1]

                // Find the export line
                const exportLineIndex = lines.findIndex(line => line.includes(match[0]))
                if (exportLineIndex === -1) continue

                // Find handler boundaries
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

                // Check for NextResponse.json usage in handler
                for (let i = handlerStartLine; i <= handlerEndLine; i++) {
                    const line = lines[i]

                    if (/return\s+NextResponse\.json\s*\(/.test(line)) {
                        const relativePath = path.relative(process.cwd(), routeFile)
                        violations.push({
                            file: relativePath,
                            method: method,
                            line: i + 1
                        })
                    }
                }
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}:${v.line} (${v.method})`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} route handler(s) using NextResponse.json() directly:${violationReport}\n\n` +
                `Use successResponse(), errorResponse(), or paginatedResponse() instead`
            )
        }
    })
})
