/**
 * Test to verify barrel export completeness
 * Validates that all repositories and utilities are properly exported
 *
 * Note: Tests have 15s timeout because importing the barrel creates
 * many Supabase client instances (one per repository singleton)
 */

import { describe, it, expect } from 'vitest';

describe('lib/db barrel export', () => {
    it('should export BaseRepository and createRepository', async () => {
        const { BaseRepository, createRepository } = await import('@/lib/db');

        expect(BaseRepository).toBeDefined();
        expect(typeof BaseRepository).toBe('function');
        expect(createRepository).toBeDefined();
        expect(typeof createRepository).toBe('function');
    }, 15000);

    it('should export all repository classes', async () => {
        const {
            UserRepository,
            CourseRepository,
            OrganizationRepository,
            BlogRepository,
            CouponRepository,
            CreditRepository,
            MembershipRepository,
            WaitlistRepository,
            EnrollmentRepository,
            PricingRepository,
            DiagnosticsRepository,
            CertificationRepository,
            InstructorResourceRepository,
        } = await import('@/lib/db');

        expect(UserRepository).toBeDefined();
        expect(CourseRepository).toBeDefined();
        expect(OrganizationRepository).toBeDefined();
        expect(BlogRepository).toBeDefined();
        expect(CouponRepository).toBeDefined();
        expect(CreditRepository).toBeDefined();
        expect(MembershipRepository).toBeDefined();
        expect(WaitlistRepository).toBeDefined();
        expect(EnrollmentRepository).toBeDefined();
        expect(PricingRepository).toBeDefined();
        expect(DiagnosticsRepository).toBeDefined();
        expect(CertificationRepository).toBeDefined();
        expect(InstructorResourceRepository).toBeDefined();
    }, 15000);

    it('should export all repository singletons', async () => {
        const {
            userRepository,
            courseRepository,
            organizationRepository,
            eventRepository,
            blogRepository,
            couponRepository,
            creditRepository,
            membershipRepository,
            waitlistRepository,
            enrollmentRepository,
            pricingRepository,
            diagnosticsRepository,
            certificationRepository,
            instructorResourceRepository,
        } = await import('@/lib/db');

        expect(userRepository).toBeDefined();
        expect(courseRepository).toBeDefined();
        expect(organizationRepository).toBeDefined();
        expect(eventRepository).toBeDefined();
        expect(blogRepository).toBeDefined();
        expect(couponRepository).toBeDefined();
        expect(creditRepository).toBeDefined();
        expect(membershipRepository).toBeDefined();
        expect(waitlistRepository).toBeDefined();
        expect(enrollmentRepository).toBeDefined();
        expect(pricingRepository).toBeDefined();
        expect(diagnosticsRepository).toBeDefined();
        expect(certificationRepository).toBeDefined();
        expect(instructorResourceRepository).toBeDefined();
    }, 15000);

    it('should export Supabase client utilities', async () => {
        const { getSupabaseServer } = await import('@/lib/db');

        // Only getSupabaseServer is exported from the barrel -
        // createAdminClient should be imported directly from @/lib/supabase/admin
        expect(getSupabaseServer).toBeDefined();
        expect(typeof getSupabaseServer).toBe('function');
    }, 15000);

    it('should export type definitions', async () => {
        // TypeScript will catch if these types are not exported
        // This test just verifies the import doesn't throw
        const module = await import('@/lib/db');

        // Verify the module has the expected exports
        expect(module).toHaveProperty('BaseRepository');
        expect(module).toHaveProperty('createRepository');
        expect(module).toHaveProperty('userRepository');
        expect(module).toHaveProperty('getSupabaseServer');
    }, 15000);
});
