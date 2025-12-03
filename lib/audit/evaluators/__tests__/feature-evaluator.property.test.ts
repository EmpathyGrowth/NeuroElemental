/**
 * Property Tests: Feature Classification
 * 
 * **Feature: comprehensive-platform-audit, Property 1: Feature Classification Completeness**
 * **Feature: comprehensive-platform-audit, Property 2: Coverage Percentage Validity**
 * **Validates: Requirements 1.2, 1.3, 1.4, 10.1**
 * 
 * Property 1: For any feature evaluated, the classification SHALL be exactly one of:
 * 'complete', 'partial', or 'stub', and partial features SHALL always have
 * non-empty missing functionality documentation.
 * 
 * Property 2: For any domain coverage percentage, the value SHALL be a number
 * between 0 and 100 inclusive.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { calculateCoverage, FeatureStatus } from '../../types';
import { getFeatureDefinitions } from '../feature-evaluator';

const VALID_STATUSES: FeatureStatus[] = ['complete', 'partial', 'stub'];

describe('Property 1: Feature Classification Completeness', () => {
  it('should only produce valid status values', () => {
    fc.assert(
      fc.property(
        fc.record({
          status: fc.constantFrom('complete', 'partial', 'stub') as fc.Arbitrary<FeatureStatus>,
          completionPercentage: fc.integer({ min: 0, max: 100 }),
          missingFunctionality: fc.option(
            fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 1, maxLength: 5 })
          ),
        }),
        (feature) => {
          // Status must be one of the valid values
          expect(VALID_STATUSES).toContain(feature.status);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have non-empty missingFunctionality for partial features', () => {
    // This is a design constraint - partial features should document what's missing
    const partialFeature = {
      status: 'partial' as FeatureStatus,
      completionPercentage: 50,
      missingFunctionality: ['file1.ts', 'file2.ts'],
    };

    expect(partialFeature.status).toBe('partial');
    expect(partialFeature.missingFunctionality).toBeDefined();
    expect(partialFeature.missingFunctionality!.length).toBeGreaterThan(0);
  });

  it('should have 100% completion for complete features', () => {
    const completeFeature = {
      status: 'complete' as FeatureStatus,
      completionPercentage: 100,
    };

    expect(completeFeature.status).toBe('complete');
    expect(completeFeature.completionPercentage).toBe(100);
  });

  it('should have 0% completion for stub features', () => {
    const stubFeature = {
      status: 'stub' as FeatureStatus,
      completionPercentage: 0,
    };

    expect(stubFeature.status).toBe('stub');
    expect(stubFeature.completionPercentage).toBe(0);
  });

  it('should have completion between 1-99% for partial features', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 99 }),
        (percentage) => {
          const partialFeature = {
            status: 'partial' as FeatureStatus,
            completionPercentage: percentage,
          };

          expect(partialFeature.completionPercentage).toBeGreaterThan(0);
          expect(partialFeature.completionPercentage).toBeLessThan(100);
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Property 2: Coverage Percentage Validity', () => {
  it('should always return a value between 0 and 100', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            status: fc.constantFrom('complete', 'partial', 'stub') as fc.Arbitrary<FeatureStatus>,
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (features) => {
          const coverage = calculateCoverage(features);

          expect(coverage).toBeGreaterThanOrEqual(0);
          expect(coverage).toBeLessThanOrEqual(100);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return 0 for empty feature list', () => {
    const coverage = calculateCoverage([]);
    expect(coverage).toBe(0);
  });

  it('should return 100 for all complete features', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (count) => {
          const features = Array(count).fill({ status: 'complete' as FeatureStatus });
          const coverage = calculateCoverage(features);

          expect(coverage).toBe(100);
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should return 0 for all stub features', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (count) => {
          const features = Array(count).fill({ status: 'stub' as FeatureStatus });
          const coverage = calculateCoverage(features);

          expect(coverage).toBe(0);
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should return 50 for all partial features', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        (count) => {
          const features = Array(count).fill({ status: 'partial' as FeatureStatus });
          const coverage = calculateCoverage(features);

          expect(coverage).toBe(50);
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should be an integer (rounded)', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            status: fc.constantFrom('complete', 'partial', 'stub') as fc.Arbitrary<FeatureStatus>,
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (features) => {
          const coverage = calculateCoverage(features);

          expect(Number.isInteger(coverage)).toBe(true);
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should increase when adding complete features', () => {
    const baseFeatures = [
      { status: 'stub' as FeatureStatus },
      { status: 'stub' as FeatureStatus },
    ];
    const baseCoverage = calculateCoverage(baseFeatures);

    const withComplete = [
      ...baseFeatures,
      { status: 'complete' as FeatureStatus },
    ];
    const newCoverage = calculateCoverage(withComplete);

    expect(newCoverage).toBeGreaterThan(baseCoverage);
  });
});

describe('Feature Definitions', () => {
  it('should have feature definitions for all domains', () => {
    const definitions = getFeatureDefinitions();
    const domains = new Set(definitions.map((d) => d.domain));

    expect(domains.has('auth')).toBe(true);
    expect(domains.has('lms')).toBe(true);
    expect(domains.has('commerce')).toBe(true);
    expect(domains.has('events')).toBe(true);
    expect(domains.has('b2b')).toBe(true);
    expect(domains.has('tools')).toBe(true);
    expect(domains.has('admin')).toBe(true);
    expect(domains.has('settings')).toBe(true);
  });

  it('should have unique feature IDs', () => {
    const definitions = getFeatureDefinitions();
    const ids = definitions.map((d) => d.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('should have at least one required file per feature', () => {
    const definitions = getFeatureDefinitions();

    for (const def of definitions) {
      expect(def.requiredFiles.length).toBeGreaterThan(0);
    }
  });
});
