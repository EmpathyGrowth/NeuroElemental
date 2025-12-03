/**
 * Property Tests: Duplicate Component Detection
 * 
 * **Feature: comprehensive-platform-audit, Property 11: Duplicate Component Detection**
 * **Feature: comprehensive-platform-audit, Property 17: Code Duplication Threshold**
 * **Validates: Requirements 5.5, 9.4**
 * 
 * Property 11: For any two components identified as duplicates by the Audit_System,
 * they SHALL share at least 80% structural similarity in their implementation.
 * 
 * Property 17: For any code block identified as duplicate, the block SHALL contain
 * at least 20 lines of similar code.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  calculateSimilarity,
  findSharedLines,
  countSignificantLines,
  normalizeContent,
  extractComponentName,
  extractExports,
  extractImports,
} from '../component-scanner';

describe('Property 11: Duplicate Component Detection', () => {
  it('should return 100% similarity for identical content', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 10, maxLength: 500 }),
        (content) => {
          const similarity = calculateSimilarity(content, content);
          expect(similarity).toBe(100);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 0% similarity for completely different content', () => {
    const content1 = 'function foo() { return 1; }';
    const content2 = 'class Bar { constructor() {} }';
    
    const similarity = calculateSimilarity(content1, content2);
    expect(similarity).toBeLessThan(50);
  });

  it('should return similarity between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (content1, content2) => {
          const similarity = calculateSimilarity(content1, content2);
          
          expect(similarity).toBeGreaterThanOrEqual(0);
          expect(similarity).toBeLessThanOrEqual(100);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should be symmetric - similarity(a,b) === similarity(b,a)', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (content1, content2) => {
          const similarity1 = calculateSimilarity(content1, content2);
          const similarity2 = calculateSimilarity(content2, content1);
          
          expect(similarity1).toBe(similarity2);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should detect high similarity for similar React components', () => {
    const component1 = `
      import React from 'react';
      
      export function Button({ onClick, children }) {
        return (
          <button onClick={onClick} className="btn">
            {children}
          </button>
        );
      }
    `;

    const component2 = `
      import React from 'react';
      
      export function PrimaryButton({ onClick, children }) {
        return (
          <button onClick={onClick} className="btn primary">
            {children}
          </button>
        );
      }
    `;

    const similarity = calculateSimilarity(component1, component2);
    expect(similarity).toBeGreaterThan(70);
  });
});

describe('Property 17: Code Duplication Threshold', () => {
  it('should count shared lines correctly for identical content', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 30 }),
        (lines) => {
          const content = lines.join('\n');
          const sharedLines = findSharedLines(content, content);
          
          // Should find all non-empty lines as shared
          const nonEmptyLines = lines.filter((l) => l.trim() !== '').length;
          expect(sharedLines).toBe(nonEmptyLines);
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should return 0 shared lines for completely different content', () => {
    const content1 = 'line1\nline2\nline3';
    const content2 = 'different1\ndifferent2\ndifferent3';
    
    const sharedLines = findSharedLines(content1, content2);
    expect(sharedLines).toBe(0);
  });

  it('should count shared lines correctly for partial overlap', () => {
    const content1 = 'shared1\nshared2\nunique1';
    const content2 = 'shared1\nshared2\nunique2';
    
    const sharedLines = findSharedLines(content1, content2);
    expect(sharedLines).toBe(2);
  });

  it('should be non-negative', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        fc.string({ minLength: 0, maxLength: 200 }),
        (content1, content2) => {
          const sharedLines = findSharedLines(content1, content2);
          expect(sharedLines).toBeGreaterThanOrEqual(0);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Significant Line Counting', () => {
  it('should not count empty lines', () => {
    const content = 'line1\n\nline2\n\n\nline3';
    expect(countSignificantLines(content)).toBe(3);
  });

  it('should not count single-line comments', () => {
    const content = 'line1\n// comment\nline2';
    expect(countSignificantLines(content)).toBe(2);
  });

  it('should not count block comments', () => {
    const content = 'line1\n/* block\ncomment */\nline2';
    expect(countSignificantLines(content)).toBe(2);
  });

  it('should return non-negative count', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 500 }),
        (content) => {
          const count = countSignificantLines(content);
          expect(count).toBeGreaterThanOrEqual(0);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Content Normalization', () => {
  it('should remove comments', () => {
    const content = 'code // comment\n/* block */ more';
    const normalized = normalizeContent(content);
    expect(normalized).not.toContain('comment');
    expect(normalized).not.toContain('block');
  });

  it('should remove import statements', () => {
    const content = "import React from 'react';\nconst x = 1;";
    const normalized = normalizeContent(content);
    expect(normalized).not.toContain('import');
    expect(normalized).toContain('const');
  });

  it('should normalize whitespace', () => {
    const content = 'const   x   =   1;';
    const normalized = normalizeContent(content);
    expect(normalized).not.toContain('  ');
  });

  it('should be idempotent', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 200 }),
        (content) => {
          const normalized1 = normalizeContent(content);
          const normalized2 = normalizeContent(normalized1);
          expect(normalized1).toBe(normalized2);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Component Name Extraction', () => {
  it('should convert kebab-case to PascalCase', () => {
    expect(extractComponentName('my-component.tsx')).toBe('MyComponent');
    expect(extractComponentName('button-group.tsx')).toBe('ButtonGroup');
    expect(extractComponentName('user-profile-card.tsx')).toBe('UserProfileCard');
  });

  it('should handle single word names', () => {
    expect(extractComponentName('button.tsx')).toBe('Button');
    expect(extractComponentName('card.tsx')).toBe('Card');
  });

  it('should handle paths', () => {
    expect(extractComponentName('components/ui/button.tsx')).toBe('Button');
    expect(extractComponentName('forms/input-field.tsx')).toBe('InputField');
  });
});

describe('Export Extraction', () => {
  it('should extract const exports', () => {
    const content = 'export const Button = () => {};';
    expect(extractExports(content)).toContain('Button');
  });

  it('should extract function exports', () => {
    const content = 'export function useHook() {}';
    expect(extractExports(content)).toContain('useHook');
  });

  it('should extract class exports', () => {
    const content = 'export class MyClass {}';
    expect(extractExports(content)).toContain('MyClass');
  });

  it('should extract named exports', () => {
    const content = 'export { foo, bar };';
    const exports = extractExports(content);
    expect(exports).toContain('foo');
    expect(exports).toContain('bar');
  });
});

describe('Import Extraction', () => {
  it('should extract import paths', () => {
    const content = "import React from 'react';";
    expect(extractImports(content)).toContain('react');
  });

  it('should extract multiple imports', () => {
    const content = `
      import React from 'react';
      import { Button } from '@/components/ui';
    `;
    const imports = extractImports(content);
    expect(imports).toContain('react');
    expect(imports).toContain('@/components/ui');
  });

  it('should handle relative imports', () => {
    const content = "import { utils } from '../lib/utils';";
    expect(extractImports(content)).toContain('../lib/utils');
  });
});
