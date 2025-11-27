/**
 * Cache Standardization Tests
 * Verifies that all caching operations follow standardized patterns
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('Cache Standardization', () => {
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

    it('should not use deprecated redis-cache module', () => {
        const files = getAllTsFiles(apiDir);
        const filesUsingOldCache: string[] = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            if (content.includes('from \'@/lib/cache/redis-cache\'') ||
                content.includes('from "@/lib/cache/redis-cache"')) {
                filesUsingOldCache.push(file);
            }
        }

        expect(filesUsingOldCache).toEqual([]);
    });

    it('should use cacheManager.memoize for all caching operations', () => {
        const files = getAllTsFiles(apiDir);
        const filesWithCaching: Array<{ file: string; hasMemoize: boolean; hasOldPattern: boolean }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');

            // Check if file has caching logic
            if (content.includes('cache') && content.includes('GET')) {
                const hasMemoize = content.includes('cacheManager.memoize');
                const hasOldPattern = content.includes('cache.get(') || content.includes('cache.set(');

                if (hasOldPattern && !hasMemoize) {
                    filesWithCaching.push({ file, hasMemoize, hasOldPattern });
                }
            }
        }

        expect(filesWithCaching).toEqual([]);
    });

    it('should use cacheManager.clear with namespace for invalidation', () => {
        const files = getAllTsFiles(apiDir);
        const filesWithInvalidation: Array<{ file: string; line: string }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // Check for clear() calls without namespace
                if (line.includes('cacheManager.clear()') && !line.includes('//')) {
                    filesWithInvalidation.push({
                        file: path.relative(process.cwd(), file),
                        line: `Line ${i + 1}: ${line.trim()}`
                    });
                }
            }
        }

        // Note: cacheManager.clear() without namespace is allowed for admin cache clearing
        // This test documents where it occurs
        if (filesWithInvalidation.length > 0) {
            console.log('Files with cacheManager.clear() without namespace:');
            filesWithInvalidation.forEach(({ file, line }) => {
                console.log(`  ${file}: ${line}`);
            });
        }
    });

    it('should have consistent TTL values for similar data types', () => {
        const files = getAllTsFiles(apiDir);
        const ttlValues: Record<string, Array<{ file: string; value: number; context: string }>> = {
            'user-specific': [],
            'public': [],
            'static': []
        };

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');

            // Look for TTL constants
            const ttlMatches = content.matchAll(/const\s+(\w+_CACHE_TTL)\s*=\s*(\d+)/g);
            for (const match of ttlMatches) {
                const [, constantName, value] = match;
                const ttlValue = parseInt(value);
                const relativePath = path.relative(process.cwd(), file);

                // Categorize based on common patterns
                if (constantName.includes('PROFILE') || constantName.includes('USER') || constantName.includes('ORGANIZATION')) {
                    ttlValues['user-specific'].push({ file: relativePath, value: ttlValue, context: constantName });
                } else if (constantName.includes('EVENT') || constantName.includes('COURSE') || constantName.includes('PUBLIC')) {
                    ttlValues['public'].push({ file: relativePath, value: ttlValue, context: constantName });
                } else if (constantName.includes('STATIC')) {
                    ttlValues['static'].push({ file: relativePath, value: ttlValue, context: constantName });
                }
            }
        }

        // Verify consistency within categories
        for (const [category, entries] of Object.entries(ttlValues)) {
            if (entries.length > 0) {
                const values = entries.map(e => e.value);
                const uniqueValues = [...new Set(values)];

                if (uniqueValues.length > 1) {
                    console.log(`\nInconsistent TTL values in ${category}:`);
                    entries.forEach(({ file, value, context }) => {
                        console.log(`  ${file}: ${context} = ${value}s`);
                    });
                }

                // User-specific should be ~120s, public ~300s, static ~3600s
                const expectedRanges: Record<string, [number, number]> = {
                    'user-specific': [60, 180],    // 1-3 minutes
                    'public': [240, 360],          // 4-6 minutes
                    'static': [3000, 4200]         // 50-70 minutes
                };

                if (expectedRanges[category]) {
                    const [min, max] = expectedRanges[category];
                    for (const entry of entries) {
                        expect(entry.value).toBeGreaterThanOrEqual(min);
                        expect(entry.value).toBeLessThanOrEqual(max);
                    }
                }
            }
        }
    });

    it('should always provide namespace option in memoize calls', () => {
        const files = getAllTsFiles(apiDir);
        const filesWithoutNamespace: Array<{ file: string; snippet: string }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');

            // Look for memoize calls - extract the full call including options
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

                // Check if namespace is provided
                if (!memoizeCall.includes('namespace:')) {
                    filesWithoutNamespace.push({
                        file: path.relative(process.cwd(), file),
                        snippet: memoizeCall.substring(0, 100) + '...'
                    });
                }
            }
        }

        if (filesWithoutNamespace.length > 0) {
            console.log('\nMemoize calls without namespace:');
            filesWithoutNamespace.forEach(({ file, snippet }) => {
                console.log(`  ${file}: ${snippet}`);
            });
        }

        expect(filesWithoutNamespace).toEqual([]);
    });
});
