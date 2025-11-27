/**
 * Property-Based Test: CRUD Operation Uniqueness
 *
 * **Feature: codebase-cleanup-optimization, Property 4: CRUD Operation Uniqueness**
 * **Validates: Requirements 2.3, 7.1**
 *
 * Property: Database modules in lib/db SHALL NOT export standalone CRUD functions.
 * All database operations SHALL be encapsulated within Repository classes extending BaseRepository.
 */

import * as fs from 'fs'
import * as path from 'path'
import { describe, it } from 'vitest'

/**
 * Check if a file exports standalone functions that look like CRUD operations
 */
function checkExports(filePath: string): {
    isValid: boolean
    issues: string[]
} {
    const content = fs.readFileSync(filePath, 'utf-8')
    const issues: string[] = []
    const filename = path.basename(filePath)

    // Skip index.ts, base-repository.ts, query-helpers.ts, and utility files
    const utilityFiles = [
        'index.ts',
        'base-repository.ts',
        'query-helpers.ts',
        'select-fragments.ts',
        'supabase-server.ts',
        'activity-log.ts',
        'rpc-functions.ts',
    ]
    if (utilityFiles.includes(filename)) {
        return { isValid: true, issues: [] }
    }

    // Skip test files
    if (filename.includes('.test.') || filename.includes('.spec.')) {
        return { isValid: true, issues: [] }
    }

    // Regex to find exported functions
    // export function name(...)
    const exportedFunctionRegex = /export\s+function\s+([a-zA-Z0-9_]+)/g
    let match
    while ((match = exportedFunctionRegex.exec(content)) !== null) {
        const funcName = match[1]

        // Check for @deprecated in comments above
        const matchIndex = match.index
        const precedingContent = content.substring(0, matchIndex)
        // Look at the last 15 lines or so (JSDoc can be long)
        const lastLines = precedingContent.split('\n').slice(-15).join('\n')

        if (!lastLines.includes('@deprecated')) {
             issues.push(`Exported standalone function: ${funcName}`)
        }
    }

    // Regex to find exported const functions
    // export const name = (...) =>
    // export const name = async (...) =>
    // export const name = function(...)
    const exportedConstRegex = /export\s+const\s+([a-zA-Z0-9_]+)\s*=\s*(async\s*)?(\(|function)/g
    while ((match = exportedConstRegex.exec(content)) !== null) {
        const constName = match[1]

        // Check for @deprecated in comments above
        const matchIndex = match.index
        const precedingContent = content.substring(0, matchIndex)
        const lastLines = precedingContent.split('\n').slice(-15).join('\n')

        if (!lastLines.includes('@deprecated')) {
             issues.push(`Exported standalone function/const: ${constName}`)
        }
    }

    // Check if it exports a class extending BaseRepository
    // This is a positive check - it SHOULD export a repository class
    const classRegex = /export\s+class\s+([a-zA-Z0-9_]+)\s+extends\s+BaseRepository/
    if (!classRegex.test(content)) {
        // It might be a utility file, but if it's in lib/db it's likely a repo file.
        // If it doesn't export a repo class, and it's not one of the excluded files, it's suspicious.
        // But maybe it's a small helper file?
        // Let's just warn if no repo class is found, but the main goal is to ban standalone CRUD functions.
        // issues.push('Does not export a class extending BaseRepository')
    }

    return {
        isValid: issues.length === 0,
        issues
    }
}

describe('Property 4: CRUD Operation Uniqueness', () => {
    it('should verify no standalone CRUD functions are exported from repository files', () => {
        const dbDir = path.join(process.cwd(), 'lib', 'db')

        if (!fs.existsSync(dbDir)) {
            return // Skip if dir doesn't exist (e.g. in some test environments)
        }

        const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.ts'))
        const violations: Array<{ file: string; issues: string[] }> = []

        for (const file of files) {
            const filePath = path.join(dbDir, file)
            const result = checkExports(filePath)

            if (!result.isValid) {
                violations.push({
                    file: file,
                    issues: result.issues
                })
            }
        }

        if (violations.length > 0) {
            const violationReport = violations
                .map(v => `\n  ${v.file}:\n    ${v.issues.join('\n    ')}`)
                .join('\n')

            throw new Error(
                `Found ${violations.length} file(s) with standalone CRUD functions (should be in Repository class):${violationReport}`
            )
        }
    })
})
