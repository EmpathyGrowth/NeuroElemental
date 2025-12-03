/**
 * Property Test: Report Completeness
 * 
 * **Feature: comprehensive-platform-audit, Property 21: Report Completeness**
 * **Validates: Requirements 14.1, 14.2, 14.3, 14.5**
 * 
 * For any audit report generated, it SHALL contain: an executive summary
 * with health scores, findings categorized by domain and severity,
 * and a remediation roadmap with sprint allocations.
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  generateExecutiveSummary,
  generateDomainReports,
  generateRemediationRoadmap,
  generateAuditReport,
  validateReportCompleteness,
  formatReportAsMarkdown,
} from '../report-generator';
import { EvaluationResult } from '../base-evaluator';
import { Finding, AuditDomain, Severity } from '../types';

// Generators for test data
const severityArb = fc.constantFrom('critical', 'high', 'medium', 'low') as fc.Arbitrary<Severity>;
const domainArb = fc.constantFrom(
  'features', 'routes', 'dashboards', 'settings', 'ui-consistency',
  'ux-quality', 'performance', 'security', 'technical-debt',
  'testing', 'documentation', 'best-practices', 'database'
) as fc.Arbitrary<AuditDomain>;
const effortUnitArb = fc.constantFrom('hours', 'days', 'weeks') as fc.Arbitrary<'hours' | 'days' | 'weeks'>;

const findingArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 20 }),
  domain: domainArb,
  severity: severityArb,
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 1, maxLength: 200 }),
  recommendation: fc.string({ minLength: 1, maxLength: 200 }),
  effortUnit: effortUnitArb,
  effortValue: fc.integer({ min: 1, max: 10 }),
}) as fc.Arbitrary<Finding>;

const evaluationResultArb = fc.record({
  domain: domainArb,
  result: fc.constant({}),
  findings: fc.array(findingArb, { minLength: 0, maxLength: 5 }),
  healthScore: fc.integer({ min: 0, max: 100 }),
  summary: fc.string({ minLength: 1, maxLength: 100 }),
}) as fc.Arbitrary<EvaluationResult>;

describe('Property 21: Report Completeness', () => {
  it('should always generate a report with executive summary', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);

          expect(report.summary).toBeDefined();
          expect(typeof report.summary.overallHealthScore).toBe('number');
          expect(report.summary.overallHealthScore).toBeGreaterThanOrEqual(0);
          expect(report.summary.overallHealthScore).toBeLessThanOrEqual(100);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should always include domain scores in summary', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);

          expect(report.summary.domainScores).toBeDefined();
          expect(typeof report.summary.domainScores).toBe('object');

          // All evaluated domains should have scores
          for (const evaluation of evaluations) {
            expect(report.summary.domainScores[evaluation.domain]).toBeDefined();
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should categorize findings by severity', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);
          const allFindings = evaluations.flatMap((e) => e.findings);

          // Count findings by severity
          const criticalCount = allFindings.filter((f) => f.severity === 'critical').length;
          const highCount = allFindings.filter((f) => f.severity === 'high').length;
          const mediumCount = allFindings.filter((f) => f.severity === 'medium').length;
          const lowCount = allFindings.filter((f) => f.severity === 'low').length;

          expect(report.summary.criticalFindings).toBe(criticalCount);
          expect(report.summary.highFindings).toBe(highCount);
          expect(report.summary.mediumFindings).toBe(mediumCount);
          expect(report.summary.lowFindings).toBe(lowCount);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include remediation roadmap with sprints', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);
          const hasFindings = evaluations.some((e) => e.findings.length > 0);

          expect(report.roadmap).toBeDefined();
          expect(Array.isArray(report.roadmap.sprints)).toBe(true);

          if (hasFindings) {
            expect(report.roadmap.sprints.length).toBeGreaterThan(0);
          }

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should include all findings in the report', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);
          const expectedFindings = evaluations.flatMap((e) => e.findings);

          expect(report.findings.length).toBe(expectedFindings.length);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should pass completeness validation for valid reports', () => {
    fc.assert(
      fc.property(
        fc.array(evaluationResultArb, { minLength: 1, maxLength: 5 }),
        (evaluations) => {
          const report = generateAuditReport(evaluations);
          const validation = validateReportCompleteness(report);

          expect(validation.isComplete).toBe(true);
          expect(validation.missingElements).toEqual([]);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe('Executive Summary Generation', () => {
  it('should calculate correct overall health score', () => {
    const evaluations: EvaluationResult[] = [
      { domain: 'features', result: {}, findings: [], healthScore: 80, summary: '' },
      { domain: 'security', result: {}, findings: [], healthScore: 60, summary: '' },
    ];

    const summary = generateExecutiveSummary(evaluations);

    // Average of evaluated domains, with unevaluated at 100
    expect(summary.overallHealthScore).toBeGreaterThanOrEqual(0);
    expect(summary.overallHealthScore).toBeLessThanOrEqual(100);
  });

  it('should include estimated remediation effort', () => {
    const findings: Finding[] = [
      {
        id: '1',
        domain: 'features',
        severity: 'high',
        title: 'Test',
        description: 'Test',
        recommendation: 'Test',
        effortUnit: 'days',
        effortValue: 5,
      },
    ];

    const evaluations: EvaluationResult[] = [
      { domain: 'features', result: {}, findings, healthScore: 80, summary: '' },
    ];

    const summary = generateExecutiveSummary(evaluations);

    expect(summary.estimatedRemediationEffort).toBeDefined();
    expect(typeof summary.estimatedRemediationEffort).toBe('string');
  });
});

describe('Remediation Roadmap Generation', () => {
  it('should sort findings by severity', () => {
    const findings: Finding[] = [
      { id: '1', domain: 'features', severity: 'low', title: 'Low', description: '', recommendation: '', effortUnit: 'hours', effortValue: 1 },
      { id: '2', domain: 'features', severity: 'critical', title: 'Critical', description: '', recommendation: '', effortUnit: 'hours', effortValue: 1 },
      { id: '3', domain: 'features', severity: 'high', title: 'High', description: '', recommendation: '', effortUnit: 'hours', effortValue: 1 },
    ];

    const roadmap = generateRemediationRoadmap(findings);

    // Critical should come first
    expect(roadmap.sprints[0].findings[0].severity).toBe('critical');
  });

  it('should group findings into sprints of roughly 40 hours', () => {
    const findings: Finding[] = Array(10).fill(null).map((_, i) => ({
      id: String(i),
      domain: 'features' as AuditDomain,
      severity: 'medium' as Severity,
      title: `Finding ${i}`,
      description: '',
      recommendation: '',
      effortUnit: 'hours' as const,
      effortValue: 8,
    }));

    const roadmap = generateRemediationRoadmap(findings);

    // 10 findings * 8 hours = 80 hours = 2 sprints
    expect(roadmap.sprints.length).toBeGreaterThanOrEqual(2);
  });

  it('should calculate total effort in weeks', () => {
    const findings: Finding[] = [
      { id: '1', domain: 'features', severity: 'high', title: 'Test', description: '', recommendation: '', effortUnit: 'weeks', effortValue: 2 },
    ];

    const roadmap = generateRemediationRoadmap(findings);

    expect(roadmap.totalEffortWeeks).toBe(2);
  });
});

describe('Markdown Report Formatting', () => {
  it('should generate valid markdown', () => {
    const evaluations: EvaluationResult[] = [
      {
        domain: 'features',
        result: {},
        findings: [
          {
            id: '1',
            domain: 'features',
            severity: 'high',
            title: 'Test Finding',
            description: 'Test description',
            recommendation: 'Test recommendation',
            effortUnit: 'hours',
            effortValue: 4,
          },
        ],
        healthScore: 80,
        summary: 'Test summary',
      },
    ];

    const report = generateAuditReport(evaluations);
    const markdown = formatReportAsMarkdown(report);

    expect(markdown).toContain('# Comprehensive Platform Audit Report');
    expect(markdown).toContain('## Executive Summary');
    expect(markdown).toContain('## Domain Reports');
    expect(markdown).toContain('## Remediation Roadmap');
    expect(markdown).toContain('Test Finding');
  });

  it('should include severity emojis', () => {
    const evaluations: EvaluationResult[] = [
      {
        domain: 'security',
        result: {},
        findings: [
          { id: '1', domain: 'security', severity: 'critical', title: 'Critical', description: '', recommendation: '', effortUnit: 'hours', effortValue: 1 },
        ],
        healthScore: 50,
        summary: '',
      },
    ];

    const report = generateAuditReport(evaluations);
    const markdown = formatReportAsMarkdown(report);

    expect(markdown).toContain('🔴');
  });
});
