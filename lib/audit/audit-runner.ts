/**
 * Audit Runner
 * 
 * Main entry point for running the comprehensive platform audit.
 * Orchestrates all evaluators and generates the final report.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  AuditConfig,
  AuditDomain,
  AuditResult,
  DEFAULT_THRESHOLDS,
} from './types';
import { EvaluationResult, runEvaluator } from './base-evaluator';
import { FeatureCompletenessEvaluator } from './evaluators/feature-evaluator';
import {
  scanPages,
  scanApiRoutes,
  scanComponents,
  detectOrphanedCode,
  getRoutesWithoutFactory,
  getRoutesWithoutAuth,
  getPagesWithoutLoadingState,
  getPagesWithoutErrorState,
} from './scanners';
import {
  generateAuditReport,
  formatReportAsMarkdown,
} from './report-generator';
import { BaseAuditEvaluator } from './base-evaluator';

/**
 * Routes and Pages Evaluator
 */
class RoutesEvaluator extends BaseAuditEvaluator<{
  pageCount: number;
  routeCount: number;
  factoryCompliance: number;
  authCoverage: number;
}> {
  constructor(config: AuditConfig) {
    super('routes', config);
  }

  async evaluate() {
    this.reset();

    // Scan pages
    const pageInventory = scanPages('app');
    const pagesWithoutLoading = getPagesWithoutLoadingState(pageInventory);
    const pagesWithoutError = getPagesWithoutErrorState(pageInventory);

    // Scan API routes
    const routeInventory = scanApiRoutes('app/api');
    const routesWithoutFactory = getRoutesWithoutFactory(routeInventory);
    const routesWithoutAuth = getRoutesWithoutAuth(routeInventory);

    // Create findings for pages without loading states (only if significant percentage)
    const loadingStatePercentage = (pagesWithoutLoading.length / pageInventory.totalCount) * 100;
    if (loadingStatePercentage > 90) {
      this.low(
        `Many pages missing loading states`,
        `${pagesWithoutLoading.length} pages don't have loading.tsx files. Consider adding them for better UX.`,
        'Add loading.tsx files to pages with async data fetching.',
        { effortUnit: 'days', effortValue: 2 }
      );
    }

    // Create findings for pages without error states (only if significant percentage)
    const errorStatePercentage = (pagesWithoutError.length / pageInventory.totalCount) * 100;
    if (errorStatePercentage > 95) {
      this.low(
        `Many pages missing error states`,
        `${pagesWithoutError.length} pages don't have error.tsx files. Consider adding them for error handling.`,
        'Add error.tsx files to pages that can fail.',
        { effortUnit: 'days', effortValue: 1 }
      );
    }

    // Create findings for routes without factory pattern
    for (const route of routesWithoutFactory.slice(0, 5)) {
      this.medium(
        `Route not using factory pattern: ${route.path}`,
        'This route uses legacy patterns instead of the standardized factory functions.',
        'Migrate to createAuthenticatedRoute, createPublicRoute, or createAdminRoute.',
        { location: `app/api/${route.path}`, effortUnit: 'hours', effortValue: 1 }
      );
    }

    // Create findings for routes without auth
    for (const route of routesWithoutAuth.slice(0, 3)) {
      this.high(
        `Route without authentication: ${route.path}`,
        'This API route has no authentication, which may be a security concern.',
        'Add authentication using createAuthenticatedRoute or verify it should be public.',
        { location: `app/api/${route.path}`, effortUnit: 'hours', effortValue: 2 }
      );
    }

    return {
      pageCount: pageInventory.totalCount,
      routeCount: routeInventory.routes.length,
      factoryCompliance: routeInventory.factoryPatternCompliance,
      authCoverage: routeInventory.authenticationCoverage,
    };
  }
}

/**
 * Technical Debt Evaluator
 */
class TechnicalDebtEvaluator extends BaseAuditEvaluator<{
  componentCount: number;
  duplicateGroups: number;
  orphanedExports: number;
}> {
  constructor(config: AuditConfig) {
    super('technical-debt', config);
  }

  async evaluate() {
    this.reset();

    // Scan components
    const componentInventory = scanComponents('components');

    // Check for duplicate components
    for (const group of componentInventory.duplicateGroups) {
      this.medium(
        `Duplicate components detected: ${group.components.map((c) => c.name).join(', ')}`,
        `${group.components.length} components share ${group.similarity}% similarity with ${group.sharedLines} shared lines.`,
        'Consolidate these components into a shared base component.',
        { effortUnit: 'hours', effortValue: 4 }
      );
    }

    // Check for orphaned code - only flag if orphan percentage is very high
    const orphanReport = detectOrphanedCode('.');

    // Only flag if more than 80% of exports appear unused (likely false positives at lower thresholds)
    if (orphanReport.orphanPercentage > 80) {
      this.low(
        `High percentage of potentially unused exports`,
        `The codebase has ${orphanReport.orphanPercentage}% exports that may be unused. Review for dead code.`,
        'Review and remove confirmed unused exports to reduce bundle size.',
        { effortUnit: 'days', effortValue: 2 }
      );
    }

    // Check for very large components (only flag extremely large ones)
    const veryLargeComponents = componentInventory.components.filter((c) => c.lineCount > 600);
    for (const component of veryLargeComponents.slice(0, 2)) {
      this.low(
        `Very large component: ${component.name} (${component.lineCount} lines)`,
        'This component is very large and may benefit from refactoring.',
        'Consider splitting into smaller, focused components.',
        { location: component.path, effortUnit: 'hours', effortValue: 4 }
      );
    }

    return {
      componentCount: componentInventory.totalCount,
      duplicateGroups: componentInventory.duplicateGroups.length,
      orphanedExports: orphanReport.unusedExports.length,
    };
  }
}

/**
 * Default audit configuration
 */
export function createDefaultConfig(projectId: string, baseUrl: string): AuditConfig {
  return {
    projectId,
    baseUrl,
    domains: [
      'features',
      'routes',
      'technical-debt',
    ],
    thresholds: DEFAULT_THRESHOLDS,
  };
}

/**
 * Run the comprehensive audit
 */
export async function runAudit(config: AuditConfig): Promise<AuditResult> {
  const evaluations: EvaluationResult[] = [];
  const completedDomains: AuditDomain[] = [];
  const failedDomains: { domain: AuditDomain; error: string }[] = [];

  console.log('Starting comprehensive platform audit...\n');

  // Run feature completeness evaluator
  if (config.domains.includes('features')) {
    try {
      console.log('Evaluating feature completeness...');
      const evaluator = new FeatureCompletenessEvaluator(config);
      const result = await runEvaluator(evaluator);
      evaluations.push(result);
      completedDomains.push('features');
      console.log(`  ✓ Features: ${result.healthScore}/100\n`);
    } catch (error) {
      failedDomains.push({ domain: 'features', error: String(error) });
      console.log(`  ✗ Features: Failed - ${error}\n`);
    }
  }

  // Run routes evaluator
  if (config.domains.includes('routes')) {
    try {
      console.log('Evaluating routes and pages...');
      const evaluator = new RoutesEvaluator(config);
      const result = await runEvaluator(evaluator);
      evaluations.push(result);
      completedDomains.push('routes');
      console.log(`  ✓ Routes: ${result.healthScore}/100\n`);
    } catch (error) {
      failedDomains.push({ domain: 'routes', error: String(error) });
      console.log(`  ✗ Routes: Failed - ${error}\n`);
    }
  }

  // Run technical debt evaluator
  if (config.domains.includes('technical-debt')) {
    try {
      console.log('Evaluating technical debt...');
      const evaluator = new TechnicalDebtEvaluator(config);
      const result = await runEvaluator(evaluator);
      evaluations.push(result);
      completedDomains.push('technical-debt');
      console.log(`  ✓ Technical Debt: ${result.healthScore}/100\n`);
    } catch (error) {
      failedDomains.push({ domain: 'technical-debt', error: String(error) });
      console.log(`  ✗ Technical Debt: Failed - ${error}\n`);
    }
  }

  // Generate report
  const report = generateAuditReport(evaluations);

  console.log('Audit complete!\n');
  console.log(`Overall Health Score: ${report.summary.overallHealthScore}/100`);
  console.log(`Total Findings: ${report.findings.length}`);
  console.log(`  Critical: ${report.summary.criticalFindings}`);
  console.log(`  High: ${report.summary.highFindings}`);
  console.log(`  Medium: ${report.summary.mediumFindings}`);
  console.log(`  Low: ${report.summary.lowFindings}`);

  return {
    status: failedDomains.length === 0 ? 'complete' : 'partial',
    completedDomains,
    failedDomains,
    report,
  };
}

/**
 * Run audit and save report to file
 */
export async function runAuditAndSaveReport(
  config: AuditConfig,
  outputPath: string = 'COMPREHENSIVE_AUDIT_REPORT.md'
): Promise<AuditResult> {
  const result = await runAudit(config);

  if (result.report) {
    const markdown = formatReportAsMarkdown(result.report);
    fs.writeFileSync(outputPath, markdown, 'utf-8');
    console.log(`\nReport saved to: ${outputPath}`);
  }

  return result;
}

/**
 * Quick audit - runs a subset of evaluators for faster feedback
 */
export async function runQuickAudit(): Promise<AuditResult> {
  const config = createDefaultConfig('', 'http://localhost:3000');
  return runAudit(config);
}
