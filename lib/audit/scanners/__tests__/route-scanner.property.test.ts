/**
 * Property Test: Factory Pattern Detection Accuracy
 * 
 * **Feature: comprehensive-platform-audit, Property 4: Factory Pattern Detection Accuracy**
 * **Validates: Requirements 2.3**
 * 
 * For any API route file, the Audit_System SHALL correctly identify whether it
 * imports and uses createAuthenticatedRoute, createPublicRoute, createAdminRoute,
 * or similar factory functions.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  detectFactoryPattern,
  detectHttpMethods,
  detectValidation,
} from '../route-scanner';

describe('Property 4: Factory Pattern Detection Accuracy', () => {
  it('should detect createAuthenticatedRoute as factory pattern with authenticated auth', () => {
    const content = `
      import { createAuthenticatedRoute } from '@/lib/api';
      
      export const GET = createAuthenticatedRoute(async (request, context, user) => {
        return successResponse({ user });
      });
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(true);
    expect(result.authType).toBe('authenticated');
    expect(result.factoryName).toBe('createAuthenticatedRoute');
  });

  it('should detect createPublicRoute as factory pattern with public auth', () => {
    const content = `
      import { createPublicRoute } from '@/lib/api';
      
      export const GET = createPublicRoute(async (request) => {
        return successResponse({ data: [] });
      });
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(true);
    expect(result.authType).toBe('public');
    expect(result.factoryName).toBe('createPublicRoute');
  });

  it('should detect createAdminRoute as factory pattern with admin auth', () => {
    const content = `
      import { createAdminRoute } from '@/lib/api';
      
      export const GET = createAdminRoute(async (request, context, user) => {
        return successResponse({ users: [] });
      });
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(true);
    expect(result.authType).toBe('admin');
    expect(result.factoryName).toBe('createAdminRoute');
  });

  it('should detect createCronRoute as factory pattern', () => {
    const content = `
      import { createCronRoute } from '@/lib/api';
      
      export const GET = createCronRoute(async (request) => {
        return successResponse({ processed: true });
      });
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(true);
    expect(result.authType).toBe('authenticated');
    expect(result.factoryName).toBe('createCronRoute');
  });

  it('should detect createOptionalAuthRoute as factory pattern', () => {
    const content = `
      import { createOptionalAuthRoute } from '@/lib/api';
      
      export const GET = createOptionalAuthRoute(async (request, context, user) => {
        return successResponse({ data: [] });
      });
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(true);
    expect(result.authType).toBe('public');
    expect(result.factoryName).toBe('createOptionalAuthRoute');
  });

  it('should detect legacy patterns without factory', () => {
    const content = `
      import { NextResponse } from 'next/server';
      
      export async function GET(request: Request) {
        return NextResponse.json({ data: [] });
      }
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(false);
    expect(result.authType).toBe('none');
  });

  it('should detect legacy patterns with manual auth', () => {
    const content = `
      import { NextResponse } from 'next/server';
      import { getCurrentUser } from '@/lib/auth';
      
      export async function GET(request: Request) {
        const user = await getCurrentUser();
        return NextResponse.json({ user });
      }
    `;

    const result = detectFactoryPattern(content);
    
    expect(result.usesFactory).toBe(false);
    expect(result.authType).toBe('authenticated');
  });

  it('should always return a valid auth type', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 1000 }),
        (content) => {
          const result = detectFactoryPattern(content);
          
          // Auth type must be one of the valid values
          expect(['public', 'authenticated', 'admin', 'none']).toContain(result.authType);
          
          // usesFactory must be boolean
          expect(typeof result.usesFactory).toBe('boolean');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be deterministic - same content always produces same result', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (content) => {
          const result1 = detectFactoryPattern(content);
          const result2 = detectFactoryPattern(content);
          
          expect(result1.usesFactory).toBe(result2.usesFactory);
          expect(result1.authType).toBe(result2.authType);
          expect(result1.factoryName).toBe(result2.factoryName);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('HTTP Method Detection', () => {
  it('should detect GET method', () => {
    const content = `export const GET = createPublicRoute(async () => {});`;
    expect(detectHttpMethods(content)).toContain('GET');
  });

  it('should detect POST method', () => {
    const content = `export const POST = createAuthenticatedRoute(async () => {});`;
    expect(detectHttpMethods(content)).toContain('POST');
  });

  it('should detect multiple methods', () => {
    const content = `
      export const GET = createPublicRoute(async () => {});
      export const POST = createAuthenticatedRoute(async () => {});
      export const DELETE = createAdminRoute(async () => {});
    `;
    const methods = detectHttpMethods(content);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('DELETE');
  });

  it('should detect async function exports', () => {
    const content = `export async function GET(request: Request) {}`;
    expect(detectHttpMethods(content)).toContain('GET');
  });

  it('should return empty array for no methods', () => {
    const content = `// Just a comment`;
    expect(detectHttpMethods(content)).toEqual([]);
  });
});

describe('Validation Detection', () => {
  it('should detect safeParse usage', () => {
    const content = `const result = schema.safeParse(body);`;
    expect(detectValidation(content)).toBe(true);
  });

  it('should detect parse usage', () => {
    const content = `const data = schema.parse(body);`;
    expect(detectValidation(content)).toBe(true);
  });

  it('should detect validateRequest usage', () => {
    const content = `const data = await validateRequest(request, schema);`;
    expect(detectValidation(content)).toBe(true);
  });

  it('should detect z.object usage', () => {
    const content = `const schema = z.object({ name: z.string() });`;
    expect(detectValidation(content)).toBe(true);
  });

  it('should return false for no validation', () => {
    const content = `const data = await request.json();`;
    expect(detectValidation(content)).toBe(false);
  });
});
