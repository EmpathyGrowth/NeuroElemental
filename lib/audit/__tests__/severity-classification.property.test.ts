/**
 * Property Test: Security Severity Classification
 * 
 * **Feature: comprehensive-platform-audit, Property 15: Security Severity Classification**
 * **Validates: Requirements 8.5**
 * 
 * For any security vulnerability identified, the Audit_System SHALL classify it
 * as exactly one of: 'critical', 'high', 'medium', or 'low'.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { classifySeverity, Severity } from '../types';

const VALID_SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];

describe('Property 15: Security Severity Classification', () => {
  it('should always return exactly one valid severity level for any vulnerability', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string({ minLength: 0, maxLength: 100 }),
          description: fc.string({ minLength: 0, maxLength: 500 }),
          impact: fc.string({ minLength: 0, maxLength: 500 }),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          
          // Must be exactly one of the valid severities
          expect(VALID_SEVERITIES).toContain(severity);
          
          // Must be a string
          expect(typeof severity).toBe('string');
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should classify data breach impacts as critical', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.string(),
          impact: fc.constant('data breach possible'),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('critical');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify authentication bypass as critical', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.string(),
          impact: fc.constant('authentication bypass'),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('critical');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify SQL injection as critical', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constant('SQL injection'),
          description: fc.string(),
          impact: fc.string(),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('critical');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify XSS as high severity', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constant('XSS'),
          description: fc.string(),
          impact: fc.string(),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('high');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify CSRF as high severity', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constant('CSRF'),
          description: fc.string(),
          impact: fc.string(),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('high');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify privilege escalation as high severity', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.string(),
          impact: fc.constant('privilege escalation'),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('high');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify information disclosure as medium severity', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.string(),
          impact: fc.constant('information disclosure'),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('medium');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should classify missing security headers as medium severity', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.constant('missing security header'),
          impact: fc.string(),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('medium');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should default to low severity for unrecognized patterns', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.constant('unknown'),
          description: fc.constant('some issue'),
          impact: fc.constant('minor'),
        }),
        (vulnerability) => {
          const severity = classifySeverity(vulnerability);
          expect(severity).toBe('low');
          return true;
        }
      ),
      { numRuns: 10 }
    );
  });

  it('should be deterministic - same input always produces same output', () => {
    fc.assert(
      fc.property(
        fc.record({
          type: fc.string(),
          description: fc.string(),
          impact: fc.string(),
        }),
        (vulnerability) => {
          const severity1 = classifySeverity(vulnerability);
          const severity2 = classifySeverity(vulnerability);
          const severity3 = classifySeverity({ ...vulnerability });
          
          expect(severity1).toBe(severity2);
          expect(severity2).toBe(severity3);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
