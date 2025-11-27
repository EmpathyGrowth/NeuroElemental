/**
 * Property-Based Test: BaseRepository Consistency
 *
 * **Feature: codebase-cleanup-optimization, Property 2: BaseRepository Consistency**
 * **Validates: Requirements 2.5**
 *
 * Property: Repository methods SHALL return consistent result types (Entity, Entity[], or void)
 * and SHALL NOT return Supabase-style { data, error } objects.
 */

import * as fs from 'fs'
import * as path from 'path'
import { describe, it } from 'vitest'

describe('Property 2: BaseRepository Consistency', () => {
    it('should verify repository methods do not return { data, error } objects', () => {
        const dbDir = path.join(process.cwd(), 'lib', 'db')

        if (!fs.existsSync(dbDir)) {
            return
        }

        const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.ts'))

        for (const file of files) {
            // Skip specific files
            if (['index.ts', 'base-repository.ts', 'query-helpers.ts'].includes(file)) {
                continue
            }

            // Skip test files
            if (file.includes('.test.') || file.includes('.spec.')) {
                continue
            }

            const filePath = path.join(dbDir, file)
            const content = fs.readFileSync(filePath, 'utf-8')

            // Find class extending BaseRepository
            const classMatch = /export\s+class\s+(\w+)\s+extends\s+BaseRepository/.exec(content)
            if (!classMatch) {
                continue
            }

            const className = classMatch[1]

            // Find class end by looking for the singleton export
            const classEndMatch = /\n}\s*\n\n\/\/ Export singleton/.exec(content)
            if (!classEndMatch) {
                continue
            }

            // Extract class content only
            const classStart = classMatch.index
            const classEnd = classEndMatch.index
            const classContent = content.substring(classStart, classEnd)

            // Check for { data, error } returns in non-deprecated methods within class
            const lines = classContent.split('\n')

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i]

                // Look for return { data with error in it
                if (line.includes('return { data') && line.includes('error')) {
                    // Check if this method is deprecated
                    let isDeprecated = false
                    for (let j = i - 1; j >= Math.max(0, i - 20); j--) {
                        if (lines[j].includes('@deprecated')) {
                            isDeprecated = true
                            break
                        }
                        if (lines[j].includes('/**')) {
                            break
                        }
                    }

                    if (!isDeprecated) {
                        throw new Error(
                            `${file}: Found repository method in ${className} returning { data, error } at line ${i + classMatch.index}\n` +
                            `Repository methods should return Entity/Entity[]/void and throw errors instead.`
                        )
                    }
                }
            }
        }
    })
})
