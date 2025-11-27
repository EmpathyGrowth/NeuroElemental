import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

/**
 * Validates: Requirements 4.5
 * 
 * This test verifies that only one createAdminClient implementation exists
 * in the codebase to ensure consistent admin client creation patterns.
 */
describe('Client Creation Utility Uniqueness', () => {
    it('should verify only one createAdminClient implementation exists', () => {
        const implementations: string[] = []

        // Search for createAdminClient function definitions
        const searchDir = (dir: string) => {
            const entries = readdirSync(dir)

            for (const entry of entries) {
                const fullPath = join(dir, entry)
                const stat = statSync(fullPath)

                // Skip node_modules, .next, test directories, and other build directories
                if (entry === 'node_modules' || entry === '.next' || entry === 'out' || entry === '__tests__' || entry.startsWith('.')) {
                    continue
                }

                if (stat.isDirectory()) {
                    searchDir(fullPath)
                } else if (entry.endsWith('.ts') || entry.endsWith('.tsx')) {
                    try {
                        const content = readFileSync(fullPath, 'utf-8')

                        // Look for function definitions of createAdminClient
                        // Match: export function createAdminClient, function createAdminClient, const createAdminClient = 
                        const functionDefPattern = /(?:export\s+)?(?:function\s+createAdminClient|const\s+createAdminClient\s*=)/g
                        const matches = content.match(functionDefPattern)

                        if (matches) {
                            implementations.push(fullPath)
                        }
                    } catch (_error) {
                        // Skip files that can't be read
                    }
                }
            }
        }

        // Start search from project root
        searchDir(process.cwd())

        // We expect exactly one implementation in lib/supabase/admin.ts
        expect(implementations.length).toBe(1)
        expect(implementations[0]).toContain(join('lib', 'supabase', 'admin.ts'))
    })
})
