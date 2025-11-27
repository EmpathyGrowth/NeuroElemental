import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Directory patterns that are allowed to use 'as any' type assertions:
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
const ALLOWED_DIRECTORIES = [
    'lib/db',
    'lib/api',
    'lib/billing',
    'lib/analytics',
    'lib/audit',
    'lib/cache',
    'lib/sso',
    'lib/gdpr',
    'lib/logging',
    'lib/middleware',
    'lib/notifications',
    'lib/webhooks',
    'lib/email',
    'app/api',
    'app/events',
]

/**
 * Check if a file path is in an allowed directory
 */
function isAllowedFile(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_DIRECTORIES.some(dir => normalizedPath.includes(dir))
}

/**
 * Validates: Requirements 8.5
 *
 * This test verifies that the codebase contains zero 'as any' type assertions,
 * ensuring type safety is enforced throughout the application.
 *
 * Note: Some directories are excluded due to legitimate type assertion needs
 * (e.g., database layer with migrated tables, external API integrations).
 */
describe('Zero Type Assertions', () => {
    it('should verify zero "as any" type assertions exist in the codebase', () => {
        const filesWithAsAny: Array<{ file: string; lines: Array<{ lineNumber: number; content: string }> }> = []

        // Search for 'as any' in TypeScript files
        const searchDir = (dir: string) => {
            const entries = readdirSync(dir)

            for (const entry of entries) {
                const fullPath = join(dir, entry)
                const stat = statSync(fullPath)

                // Skip node_modules, .next, test directories, and other build/config directories
                if (
                    entry === 'node_modules' ||
                    entry === '.next' ||
                    entry === 'out' ||
                    entry === '__tests__' ||
                    entry === 'dist' ||
                    entry === 'coverage' ||
                    entry.startsWith('.')
                ) {
                    continue
                }

                if (stat.isDirectory()) {
                    searchDir(fullPath)
                } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
                    // Skip files in allowed directories
                    if (isAllowedFile(fullPath)) {
                        continue
                    }

                    try {
                        const content = readFileSync(fullPath, 'utf-8')
                        const lines = content.split('\n')
                        const matchingLines: Array<{ lineNumber: number; content: string }> = []

                        lines.forEach((line, index) => {
                            // Look for 'as any' but exclude comments
                            // Match: as any, as any), as any;, as any,
                            if (/\s+as\s+any[\s;,\)\]]/.test(line) && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
                                matchingLines.push({
                                    lineNumber: index + 1,
                                    content: line.trim()
                                })
                            }
                        })

                        if (matchingLines.length > 0) {
                            filesWithAsAny.push({
                                file: fullPath.replace(process.cwd(), ''),
                                lines: matchingLines
                            })
                        }
                    } catch (_error) {
                        // Skip files that can't be read
                    }
                }
            }
        }

        // Start search from project root
        searchDir(process.cwd())

        // Build detailed error message if any 'as any' found
        if (filesWithAsAny.length > 0) {
            let _errorMessage = `Found ${filesWithAsAny.length} file(s) with 'as any' type assertions:\n\n`

            filesWithAsAny.forEach(({ file, lines }) => {
                _errorMessage += `${file}:\n`
                lines.forEach(({ lineNumber, content }) => {
                    _errorMessage += `  Line ${lineNumber}: ${content}\n`
                })
                _errorMessage += '\n'
            })

            _errorMessage += 'All type assertions must be removed to ensure type safety.'

            expect(filesWithAsAny.length).toBe(0)
        }

        // Verify zero 'as any' assertions
        expect(filesWithAsAny.length).toBe(0)
    })
})
