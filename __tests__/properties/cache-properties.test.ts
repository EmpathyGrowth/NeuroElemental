/**
 * Property-Based Tests for Cache Operations
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for caching operations
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Cache Operations Properties', () => {
    const apiDir = path.join(process.cwd(), 'app', 'api');

    // Helper to recursively get all .ts files
    function getAllTsFiles(dir: string): string[] {
        const files: string[] = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory() && !item.name.startsWith('__')) {
                files.push(...getAllTsFiles(fullPath));
            } else if (item.isFile() && item.name.endsWith('.ts') && !item.name.endsWith('.test.ts')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Property 26: Cache Manager Usage
     * 
     * For any caching operation, the code SHALL use cacheManager.memoize for reads 
     * and cacheManager.clear for invalidation.
     * 
     * Validates: Requirements 10.1
     */
    it('Property 26: For any caching operation, the code SHALL use cacheManager.memoize and cacheManager.clear', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; issue: string }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);

            // Check for old cache patterns that should not exist
            const oldPatterns = [
                { pattern: /cache\.get\(/g, name: 'cache.get()' },
                { pattern: /cache\.set\(/g, name: 'cache.set()' },
                { pattern: /getCached\(/g, name: 'getCached()' },
            ];

            for (const { pattern, name } of oldPatterns) {
                const matches = content.match(pattern);
                if (matches) {
                    // Exclude test files and the old redis-cache.ts itself
                    if (!relativePath.includes('__tests__') &&
                        !relativePath.includes('redis-cache.ts') &&
                        !relativePath.includes('.test.ts')) {
                        violations.push({
                            file: relativePath,
                            issue: `Uses deprecated ${name} instead of cacheManager.memoize`
                        });
                    }
                }
            }

            // If file has caching logic, verify it uses cacheManager
            if (content.includes('cache') &&
                (content.includes('memoize') || content.includes('clear'))) {

                // Check that cacheManager is imported if used
                if ((content.includes('cacheManager.memoize') || content.includes('cacheManager.clear')) &&
                    !content.includes('from \'@/lib/cache/cache-manager\'') &&
                    !content.includes('from "@/lib/cache/cache-manager"')) {
                    violations.push({
                        file: relativePath,
                        issue: 'Uses cacheManager but does not import it from @/lib/cache/cache-manager'
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nProperty 26 violations:');
            violations.forEach(({ file, issue }) => {
                console.log(`  ${file}: ${issue}`);
            });
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 28: Cache Namespace Usage
     * 
     * For any cache invalidation, the clear call SHALL include a namespace parameter.
     * 
     * Validates: Requirements 10.3, 10.5
     */
    it('Property 28: For any cache invalidation, the clear call SHALL include a namespace parameter', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; line: number; context: string }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for clear() calls without namespace
                // Exception: admin cache route can clear all
                const normalizedPath = relativePath.replace(/\\/g, '/');
                if (line.includes('cacheManager.clear()') &&
                    !line.includes('//') &&
                    !normalizedPath.includes('api/cache/route.ts')) {

                    violations.push({
                        file: relativePath,
                        line: i + 1,
                        context: line.trim()
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nProperty 28 violations (clear without namespace):');
            violations.forEach(({ file, line, context }) => {
                console.log(`  ${file}:${line} - ${context}`);
            });
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 29: TTL Consistency
     * 
     * For any two caching operations on the same data type, the TTL values SHALL be identical.
     * 
     * Validates: Requirements 10.4
     */
    it('Property 29: For any two caching operations on the same data type, the TTL values SHALL be identical', () => {
        const files = getAllTsFiles(apiDir);

        // Collect TTL values by category
        const ttlByCategory: Record<string, Array<{ file: string; constant: string; value: number }>> = {
            'user-specific': [],
            'public': [],
            'static': [],
            'stats': []
        };

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);

            // Find TTL constants
            const ttlMatches = content.matchAll(/const\s+(\w+_CACHE_TTL)\s*=\s*(\d+)/g);

            for (const match of ttlMatches) {
                const [, constantName, value] = match;
                const ttlValue = parseInt(value);

                // Categorize based on naming patterns
                const lowerName = constantName.toLowerCase();

                if (lowerName.includes('profile') ||
                    lowerName.includes('user') ||
                    lowerName.includes('organization') ||
                    lowerName.includes('member')) {
                    ttlByCategory['user-specific'].push({
                        file: relativePath,
                        constant: constantName,
                        value: ttlValue
                    });
                } else if (lowerName.includes('event') ||
                    lowerName.includes('course') ||
                    lowerName.includes('public') ||
                    lowerName.includes('resource')) {
                    ttlByCategory['public'].push({
                        file: relativePath,
                        constant: constantName,
                        value: ttlValue
                    });
                } else if (lowerName.includes('static')) {
                    ttlByCategory['static'].push({
                        file: relativePath,
                        constant: constantName,
                        value: ttlValue
                    });
                } else if (lowerName.includes('stat') || lowerName.includes('analytics')) {
                    ttlByCategory['stats'].push({
                        file: relativePath,
                        constant: constantName,
                        value: ttlValue
                    });
                }
            }
        }

        const inconsistencies: string[] = [];

        // Check consistency within each category
        for (const [category, entries] of Object.entries(ttlByCategory)) {
            if (entries.length > 1) {
                const values = entries.map(e => e.value);
                const uniqueValues = [...new Set(values)];

                if (uniqueValues.length > 1) {
                    inconsistencies.push(`\n${category} data has inconsistent TTL values:`);
                    entries.forEach(({ file, constant, value }) => {
                        inconsistencies.push(`  ${file}: ${constant} = ${value}s`);
                    });
                }
            }
        }

        // Verify expected ranges
        const expectedRanges: Record<string, { min: number; max: number; expected: number }> = {
            'user-specific': { min: 60, max: 180, expected: 120 },    // 2 minutes
            'public': { min: 240, max: 360, expected: 300 },          // 5 minutes
            'static': { min: 3000, max: 4200, expected: 3600 },       // 1 hour
            'stats': { min: 540, max: 660, expected: 600 }            // 10 minutes
        };

        for (const [category, entries] of Object.entries(ttlByCategory)) {
            const range = expectedRanges[category];
            if (range && entries.length > 0) {
                for (const entry of entries) {
                    if (entry.value < range.min || entry.value > range.max) {
                        inconsistencies.push(
                            `\n${entry.file}: ${entry.constant} = ${entry.value}s is outside expected range for ${category} (${range.min}-${range.max}s, expected ${range.expected}s)`
                        );
                    }
                }
            }
        }

        if (inconsistencies.length > 0) {
            console.log('\nProperty 29 violations (TTL inconsistency):');
            inconsistencies.forEach(msg => console.log(msg));
        }

        expect(inconsistencies).toEqual([]);
    });

    /**
     * Additional verification: All memoize calls should have both ttl and namespace
     */
    it('All memoize calls should provide both ttl and namespace options', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; missing: string[] }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);

            // Find all memoize calls
            const memoizeMatches = content.matchAll(/cacheManager\.memoize\s*\(/g);

            for (const match of memoizeMatches) {
                const startIndex = match.index!;
                let parenCount = 1;
                let endIndex = startIndex + match[0].length;

                // Find the matching closing parenthesis
                while (parenCount > 0 && endIndex < content.length) {
                    if (content[endIndex] === '(') parenCount++;
                    if (content[endIndex] === ')') parenCount--;
                    endIndex++;
                }

                const memoizeCall = content.substring(startIndex, endIndex);
                const missing: string[] = [];

                if (!memoizeCall.includes('ttl:')) {
                    missing.push('ttl');
                }
                if (!memoizeCall.includes('namespace:')) {
                    missing.push('namespace');
                }

                if (missing.length > 0) {
                    violations.push({
                        file: relativePath,
                        missing
                    });
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nMemoize calls missing options:');
            violations.forEach(({ file, missing }) => {
                console.log(`  ${file}: missing ${missing.join(', ')}`);
            });
        }

        expect(violations).toEqual([]);
    });
});
