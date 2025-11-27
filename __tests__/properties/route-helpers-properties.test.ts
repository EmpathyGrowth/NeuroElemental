/**
 * Property-Based Tests for Route Helper Usage
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify correctness properties for route helper functions
 * as specified in the design document.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Routes that are allowed to use manual organization access checks:
 * - Organization diagnostics routes need both member and admin checks with different flows
 * - Permission routes need granular role checking beyond the helper's scope
 */
const ALLOWED_MANUAL_ORG_ACCESS_ROUTES = [
    'app/api/organizations/[id]/diagnostics/route.ts',
    'app/api/organizations/[id]/diagnostics/[diagnosticId]/route.ts',
    'app/api/organizations/[id]/members/[userId]/permissions/route.ts',
]

/**
 * Check if a route is allowed to use manual organization access checks
 */
function isAllowedManualOrgAccessRoute(filePath: string): boolean {
    const normalizedPath = filePath.replace(/\\/g, '/')
    return ALLOWED_MANUAL_ORG_ACCESS_ROUTES.some(allowed => normalizedPath.endsWith(allowed))
}

describe('Route Helper Properties', () => {
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
     * Property 19: Pagination Helper Usage
     * 
     * For any pagination logic, the code SHALL use formatPaginationMeta helper.
     * 
     * Validates: Requirements 7.3
     */
    it('Property 19: For any pagination logic, the code SHALL use formatPaginationMeta helper', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; issue: string; line?: number }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);
            const lines = content.split('\n');

            // Check for manual pagination object creation patterns
            // Pattern: { total: ..., limit: ..., offset: ..., hasMore: ... }
            const manualPaginationPattern = /pagination:\s*\{[^}]*total:[^}]*limit:[^}]*offset:[^}]*hasMore:/;

            if (manualPaginationPattern.test(content)) {
                // Find the line number
                for (let i = 0; i < lines.length; i++) {
                    if (manualPaginationPattern.test(lines[i])) {
                        violations.push({
                            file: relativePath,
                            issue: 'Uses manual pagination object instead of formatPaginationMeta helper',
                            line: i + 1
                        });
                        break;
                    }
                }
            }

            // Check for inline hasMore calculations
            const inlineHasMorePattern = /hasMore:\s*\([^)]*offset[^)]*\+[^)]*limit[^)]*\)\s*[<>]/;
            if (inlineHasMorePattern.test(content)) {
                for (let i = 0; i < lines.length; i++) {
                    if (inlineHasMorePattern.test(lines[i])) {
                        violations.push({
                            file: relativePath,
                            issue: 'Uses inline hasMore calculation instead of formatPaginationMeta helper',
                            line: i + 1
                        });
                        break;
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nProperty 19 violations:');
            violations.forEach(({ file, issue, line }) => {
                console.log(`  ${file}${line ? `:${line}` : ''}: ${issue}`);
            });
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 20: Course Enrollment Helper Usage
     * 
     * For any course enrollment verification, the code SHALL use requireCourseEnrollment helper.
     * 
     * Validates: Requirements 7.4
     */
    it('Property 20: For any course enrollment verification, the code SHALL use requireCourseEnrollment helper', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; issue: string; line?: number }> = [];

        for (const file of files) {
            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);
            const lines = content.split('\n');

            // Check for manual enrollment checks
            // Pattern: checking enrollments table with user_id and course_id
            const manualEnrollmentPattern = /from\(['"]enrollments['"]\).*\.eq\(['"](?:user_id|course_id)['"]/;

            if (manualEnrollmentPattern.test(content)) {
                // Check if it's actually an enrollment verification (not just a query)
                // Look for patterns like checking status === 'active' or throwing forbidden errors
                const enrollmentCheckContext = /enrollments.*eq.*(?:status|active)|enrollment.*forbidden|must be enrolled/i;

                if (enrollmentCheckContext.test(content)) {
                    // Make sure it's not using requireCourseEnrollment
                    if (!content.includes('requireCourseEnrollment')) {
                        for (let i = 0; i < lines.length; i++) {
                            if (manualEnrollmentPattern.test(lines[i])) {
                                violations.push({
                                    file: relativePath,
                                    issue: 'Uses manual enrollment check instead of requireCourseEnrollment helper',
                                    line: i + 1
                                });
                                break;
                            }
                        }
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nProperty 20 violations:');
            violations.forEach(({ file, issue, line }) => {
                console.log(`  ${file}${line ? `:${line}` : ''}: ${issue}`);
            });
        }

        expect(violations).toEqual([]);
    });

    /**
     * Property 21: Organization Access Helper Usage
     * 
     * For any organization access verification, the code SHALL use requireOrganizationAccess helper.
     * 
     * Validates: Requirements 7.5
     */
    it('Property 21: For any organization access verification, the code SHALL use requireOrganizationAccess helper', () => {
        const files = getAllTsFiles(apiDir);
        const violations: Array<{ file: string; issue: string; line?: number }> = [];

        for (const file of files) {
            // Skip routes allowed to use manual organization access checks
            if (isAllowedManualOrgAccessRoute(file)) {
                continue;
            }

            const content = fs.readFileSync(file, 'utf-8');
            const relativePath = path.relative(process.cwd(), file);
            const lines = content.split('\n');

            // Check for manual organization admin checks
            // Pattern: const isAdmin = await isUserOrgAdmin(...) followed by if (!isAdmin) throw
            const manualOrgCheckPattern = /const\s+isAdmin\s*=\s*await\s+isUserOrgAdmin\s*\(/;

            if (manualOrgCheckPattern.test(content)) {
                // Check if followed by a throw or return error
                const throwAfterCheckPattern = /isAdmin.*\{[^}]*throw\s+forbidden/s;

                if (throwAfterCheckPattern.test(content)) {
                    for (let i = 0; i < lines.length; i++) {
                        if (manualOrgCheckPattern.test(lines[i])) {
                            violations.push({
                                file: relativePath,
                                issue: 'Uses manual organization access check instead of requireOrganizationAccess helper',
                                line: i + 1
                            });
                            break;
                        }
                    }
                }
            }

            // Also check for manual membership queries
            const manualMembershipPattern = /from\(['"]organization_memberships['"]\).*\.eq\(['"]user_id['"]/;
            if (manualMembershipPattern.test(content)) {
                // Check if it's an access check (not just a query for data)
                const accessCheckContext = /membership.*forbidden|access.*denied|admin.*required/i;

                if (accessCheckContext.test(content) && !content.includes('requireOrganizationAccess')) {
                    for (let i = 0; i < lines.length; i++) {
                        if (manualMembershipPattern.test(lines[i])) {
                            violations.push({
                                file: relativePath,
                                issue: 'Uses manual membership check instead of requireOrganizationAccess helper',
                                line: i + 1
                            });
                            break;
                        }
                    }
                }
            }
        }

        if (violations.length > 0) {
            console.log('\nProperty 21 violations:');
            violations.forEach(({ file, issue, line }) => {
                console.log(`  ${file}${line ? `:${line}` : ''}: ${issue}`);
            });
        }

        expect(violations).toEqual([]);
    });
});
