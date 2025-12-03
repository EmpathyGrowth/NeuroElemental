/**
 * Property Test: Route-Page Mapping Consistency
 * 
 * **Feature: comprehensive-platform-audit, Property 3: Route-Page Mapping Consistency**
 * **Validates: Requirements 2.1**
 * 
 * For any page.tsx file in the app directory, the Audit_System SHALL produce
 * a corresponding route path that matches Next.js App Router conventions.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { filePathToRoutePath, isRouteProtected, getRequiredRoles } from '../page-scanner';

describe('Property 3: Route-Page Mapping Consistency', () => {
  it('should always produce a route path starting with /', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.stringMatching(/^[a-z][a-z0-9-]*$/),
          { minLength: 0, maxLength: 5 }
        ),
        (segments) => {
          const filePath = segments.length === 0
            ? 'app/page.tsx'
            : `app/${segments.join('/')}/page.tsx`;
          
          const routePath = filePathToRoutePath(filePath);
          
          // Route path must start with /
          expect(routePath.startsWith('/')).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should convert root page.tsx to /', () => {
    expect(filePathToRoutePath('app/page.tsx')).toBe('/');
  });

  it('should convert simple paths correctly', () => {
    expect(filePathToRoutePath('app/about/page.tsx')).toBe('/about');
    expect(filePathToRoutePath('app/courses/page.tsx')).toBe('/courses');
    expect(filePathToRoutePath('app/dashboard/page.tsx')).toBe('/dashboard');
  });

  it('should handle nested paths', () => {
    expect(filePathToRoutePath('app/dashboard/admin/page.tsx')).toBe('/dashboard/admin');
    expect(filePathToRoutePath('app/courses/intro/lesson/page.tsx')).toBe('/courses/intro/lesson');
  });

  it('should handle dynamic segments [param]', () => {
    expect(filePathToRoutePath('app/courses/[slug]/page.tsx')).toBe('/courses/:slug');
    expect(filePathToRoutePath('app/blog/[slug]/page.tsx')).toBe('/blog/:slug');
    expect(filePathToRoutePath('app/users/[id]/profile/page.tsx')).toBe('/users/:id/profile');
  });

  it('should handle route groups (parentheses)', () => {
    expect(filePathToRoutePath('app/(auth)/login/page.tsx')).toBe('/login');
    expect(filePathToRoutePath('app/(public)/about/page.tsx')).toBe('/about');
    expect(filePathToRoutePath('app/(marketing)/pricing/page.tsx')).toBe('/pricing');
  });

  it('should handle Windows-style paths', () => {
    expect(filePathToRoutePath('app\\about\\page.tsx')).toBe('/about');
    expect(filePathToRoutePath('app\\dashboard\\admin\\page.tsx')).toBe('/dashboard/admin');
  });

  it('should never produce double slashes', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.stringMatching(/^[a-z][a-z0-9-]*$/),
          { minLength: 0, maxLength: 5 }
        ),
        (segments) => {
          const filePath = segments.length === 0
            ? 'app/page.tsx'
            : `app/${segments.join('/')}/page.tsx`;
          
          const routePath = filePathToRoutePath(filePath);
          
          // Should never have double slashes
          expect(routePath).not.toContain('//');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should produce valid URL path characters', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.stringMatching(/^[a-z][a-z0-9-]*$/),
          { minLength: 1, maxLength: 5 }
        ),
        (segments) => {
          const filePath = `app/${segments.join('/')}/page.tsx`;
          const routePath = filePathToRoutePath(filePath);
          
          // Should only contain valid URL path characters
          // (letters, numbers, hyphens, slashes, colons for params)
          expect(routePath).toMatch(/^[a-z0-9\-\/:]+$/);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Route Protection Detection', () => {
  it('should identify dashboard routes as protected', () => {
    expect(isRouteProtected('/dashboard')).toBe(true);
    expect(isRouteProtected('/dashboard/admin')).toBe(true);
    expect(isRouteProtected('/dashboard/student')).toBe(true);
    expect(isRouteProtected('/dashboard/instructor')).toBe(true);
    expect(isRouteProtected('/dashboard/business')).toBe(true);
  });

  it('should identify public routes as not protected', () => {
    expect(isRouteProtected('/')).toBe(false);
    expect(isRouteProtected('/about')).toBe(false);
    expect(isRouteProtected('/courses')).toBe(false);
    expect(isRouteProtected('/pricing')).toBe(false);
  });

  it('should return correct roles for protected routes', () => {
    expect(getRequiredRoles('/dashboard/admin')).toContain('admin');
    expect(getRequiredRoles('/dashboard/instructor')).toContain('instructor');
    expect(getRequiredRoles('/dashboard/student')).toContain('student');
  });

  it('should return empty array for public routes', () => {
    expect(getRequiredRoles('/')).toEqual([]);
    expect(getRequiredRoles('/about')).toEqual([]);
    expect(getRequiredRoles('/courses')).toEqual([]);
  });
});
