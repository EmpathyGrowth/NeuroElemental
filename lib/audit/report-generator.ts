/**
 * Audit Report Generator
 * 
 * Generates comprehensive audit reports with executive summaries,
 * categorized findings, and remediation roadmaps.
 */

import {
  AuditDomain,
  AuditReport,
  DomainReport,
  ExecutiveSummary,
  Finding,
  RemediationRoadmap,
  Severity,
  SprintPlan,
  calculateEffortHours,
  formatEffort,
} from './types';
import { EvaluationResult } from './base-evaluator';

/**
 * Generate executive summary from evaluation results
 */
export function generateExecutiveSummary(
  evaluations: EvaluationResult[]
): ExecutiveSummary {
  const allFindings = evaluations.flatMap((e) => e.findings);
  const domainScores: Record<AuditDomain, number> = {} as Record<AuditDomain, number>;

  // Calculate domain scores
  for (const evaluation of evaluations) {
    domainScores[evaluation.domain] = evaluation.healthScore;
  }

  // Fill in missing domains with 100 (not evaluated)
  const allDomains: AuditDomain[] = [
    'features', 'routes', 'dashboards', 'settings', 'ui-consistency',
    'ux-quality', 'performance', 'security', 'technical-debt',
    'testing', 'documentation', 'best-practices', 'database',
  ];
  for (const domain of allDomains) {
    if (!(domain in domainScores)) {
      domainScores[domain] = 100;
    }
  }

  // Calculate overall health score (weighted average)
  const scores = Object.values(domainScores);
  const overallHealthScore = Math.round(
    scores.reduce((sum, s) => sum + s, 0) / scores.length
  );

  // Count findings by severity
  const criticalFindings = allFindings.filter((f) => f.severity === 'critical').length;
  const highFindings = allFindings.filter((f) => f.severity === 'high').length;
  const mediumFindings = allFindings.filter((f) => f.severity === 'medium').length;
  const lowFindings = allFindings.filter((f) => f.severity === 'low').length;

  // Calculate total effort
  const totalHours = allFindings.reduce(
    (sum, f) => sum + calculateEffortHours(f.effortUnit, f.effortValue),
    0
  );
  const totalWeeks = Math.ceil(totalHours / 40);
  const estimatedRemediationEffort = totalWeeks === 1
    ? '1 week'
    : `${totalWeeks} weeks`;

  return {
    overallHealthScore,
    domainScores,
    criticalFindings,
    highFindings,
    mediumFindings,
    lowFindings,
    estimatedRemediationEffort,
  };
}

/**
 * Generate domain reports from evaluation results
 */
export function generateDomainReports(
  evaluations: EvaluationResult[]
): DomainReport[] {
  return evaluations.map((evaluation) => ({
    domain: evaluation.domain,
    healthScore: evaluation.healthScore,
    findings: evaluation.findings,
    summary: evaluation.summary,
  }));
}

/**
 * Generate remediation roadmap from findings
 */
export function generateRemediationRoadmap(
  findings: Finding[]
): RemediationRoadmap {
  // Sort findings by severity and effort
  const sortedFindings = [...findings].sort((a, b) => {
    const severityOrder: Record<Severity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Then by effort (smaller first)
    return calculateEffortHours(a.effortUnit, a.effortValue) -
      calculateEffortHours(b.effortUnit, b.effortValue);
  });

  // Group into sprints (roughly 40 hours per sprint)
  const sprints: SprintPlan[] = [];
  let currentSprint: Finding[] = [];
  let currentEffort = 0;
  const SPRINT_HOURS = 40;

  for (const finding of sortedFindings) {
    const findingHours = calculateEffortHours(finding.effortUnit, finding.effortValue);

    if (currentEffort + findingHours > SPRINT_HOURS && currentSprint.length > 0) {
      // Start new sprint
      sprints.push({
        sprintNumber: sprints.length + 1,
        focus: determineFocus(currentSprint),
        findings: currentSprint,
        estimatedEffort: `${currentEffort} hours`,
      });
      currentSprint = [];
      currentEffort = 0;
    }

    currentSprint.push(finding);
    currentEffort += findingHours;
  }

  // Add remaining findings
  if (currentSprint.length > 0) {
    sprints.push({
      sprintNumber: sprints.length + 1,
      focus: determineFocus(currentSprint),
      findings: currentSprint,
      estimatedEffort: `${currentEffort} hours`,
    });
  }

  const totalHours = findings.reduce(
    (sum, f) => sum + calculateEffortHours(f.effortUnit, f.effortValue),
    0
  );

  return {
    sprints,
    totalEffortWeeks: Math.ceil(totalHours / 40),
  };
}

/**
 * Determine sprint focus based on findings
 */
function determineFocus(findings: Finding[]): string {
  const domainCounts: Record<string, number> = {};

  for (const finding of findings) {
    domainCounts[finding.domain] = (domainCounts[finding.domain] || 0) + 1;
  }

  const topDomain = Object.entries(domainCounts)
    .sort((a, b) => b[1] - a[1])[0];

  if (!topDomain) return 'General improvements';

  const domainNames: Record<AuditDomain, string> = {
    features: 'Feature Completion',
    routes: 'Route & API Fixes',
    dashboards: 'Dashboard Improvements',
    settings: 'Settings Fixes',
    'ui-consistency': 'UI Consistency',
    'ux-quality': 'UX Improvements',
    performance: 'Performance Optimization',
    security: 'Security Hardening',
    'technical-debt': 'Technical Debt Reduction',
    testing: 'Test Coverage',
    documentation: 'Documentation Updates',
    'best-practices': 'Best Practices Adoption',
    database: 'Database Optimization',
  };

  return domainNames[topDomain[0] as AuditDomain] || 'General improvements';
}

/**
 * Generate full audit report
 */
export function generateAuditReport(
  evaluations: EvaluationResult[]
): AuditReport {
  const allFindings = evaluations.flatMap((e) => e.findings);

  return {
    generatedAt: new Date(),
    summary: generateExecutiveSummary(evaluations),
    domainReports: generateDomainReports(evaluations),
    findings: allFindings,
    roadmap: generateRemediationRoadmap(allFindings),
  };
}

/**
 * Format audit report as markdown
 */
export function formatReportAsMarkdown(report: AuditReport): string {
  const lines: string[] = [];

  // Header
  lines.push('# Comprehensive Platform Audit Report');
  lines.push('');
  lines.push(`**Generated:** ${report.generatedAt.toISOString()}`);
  lines.push('');

  // Executive Summary
  lines.push('## Executive Summary');
  lines.push('');
  lines.push(`**Overall Health Score:** ${report.summary.overallHealthScore}/100`);
  lines.push('');
  lines.push('### Findings by Severity');
  lines.push('');
  lines.push(`- 🔴 Critical: ${report.summary.criticalFindings}`);
  lines.push(`- 🟠 High: ${report.summary.highFindings}`);
  lines.push(`- 🟡 Medium: ${report.summary.mediumFindings}`);
  lines.push(`- 🟢 Low: ${report.summary.lowFindings}`);
  lines.push('');
  lines.push(`**Estimated Remediation Effort:** ${report.summary.estimatedRemediationEffort}`);
  lines.push('');

  // Domain Scores
  lines.push('### Health Scores by Domain');
  lines.push('');
  lines.push('| Domain | Score |');
  lines.push('|--------|-------|');
  for (const [domain, score] of Object.entries(report.summary.domainScores)) {
    const emoji = score >= 90 ? '✅' : score >= 70 ? '⚠️' : '❌';
    lines.push(`| ${domain} | ${emoji} ${score}/100 |`);
  }
  lines.push('');

  // Domain Reports
  lines.push('## Domain Reports');
  lines.push('');
  for (const domainReport of report.domainReports) {
    lines.push(`### ${domainReport.domain}`);
    lines.push('');
    lines.push(`**Health Score:** ${domainReport.healthScore}/100`);
    lines.push('');
    lines.push(domainReport.summary);
    lines.push('');

    if (domainReport.findings.length > 0) {
      lines.push('#### Findings');
      lines.push('');
      for (const finding of domainReport.findings) {
        const severityEmoji = {
          critical: '🔴',
          high: '🟠',
          medium: '🟡',
          low: '🟢',
        }[finding.severity];
        lines.push(`- ${severityEmoji} **${finding.title}**`);
        lines.push(`  - ${finding.description}`);
        lines.push(`  - Recommendation: ${finding.recommendation}`);
        lines.push(`  - Effort: ${formatEffort(finding.effortUnit, finding.effortValue)}`);
        if (finding.location) {
          lines.push(`  - Location: \`${finding.location}\``);
        }
        lines.push('');
      }
    }
  }

  // Remediation Roadmap
  lines.push('## Remediation Roadmap');
  lines.push('');
  lines.push(`**Total Effort:** ${report.roadmap.totalEffortWeeks} weeks`);
  lines.push('');

  for (const sprint of report.roadmap.sprints) {
    lines.push(`### Sprint ${sprint.sprintNumber}: ${sprint.focus}`);
    lines.push('');
    lines.push(`**Estimated Effort:** ${sprint.estimatedEffort}`);
    lines.push('');
    lines.push('| Finding | Severity | Effort |');
    lines.push('|---------|----------|--------|');
    for (const finding of sprint.findings) {
      lines.push(`| ${finding.title} | ${finding.severity} | ${formatEffort(finding.effortUnit, finding.effortValue)} |`);
    }
    lines.push('');
  }

  // All Findings (detailed)
  lines.push('## All Findings');
  lines.push('');

  const findingsBySeverity: Record<Severity, Finding[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  for (const finding of report.findings) {
    findingsBySeverity[finding.severity].push(finding);
  }

  for (const severity of ['critical', 'high', 'medium', 'low'] as Severity[]) {
    const findings = findingsBySeverity[severity];
    if (findings.length === 0) continue;

    const severityTitle = severity.charAt(0).toUpperCase() + severity.slice(1);
    lines.push(`### ${severityTitle} (${findings.length})`);
    lines.push('');

    for (const finding of findings) {
      lines.push(`#### ${finding.title}`);
      lines.push('');
      lines.push(`**Domain:** ${finding.domain}`);
      lines.push('');
      lines.push(finding.description);
      lines.push('');
      lines.push(`**Recommendation:** ${finding.recommendation}`);
      lines.push('');
      lines.push(`**Effort:** ${formatEffort(finding.effortUnit, finding.effortValue)}`);
      if (finding.location) {
        lines.push('');
        lines.push(`**Location:** \`${finding.location}\``);
      }
      if (finding.relatedRequirements?.length) {
        lines.push('');
        lines.push(`**Related Requirements:** ${finding.relatedRequirements.join(', ')}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Validate report completeness
 */
export function validateReportCompleteness(report: AuditReport): {
  isComplete: boolean;
  missingElements: string[];
} {
  const missingElements: string[] = [];

  if (!report.summary) {
    missingElements.push('Executive summary');
  } else {
    if (typeof report.summary.overallHealthScore !== 'number') {
      missingElements.push('Overall health score');
    }
    if (!report.summary.domainScores || Object.keys(report.summary.domainScores).length === 0) {
      missingElements.push('Domain scores');
    }
  }

  if (!report.domainReports || report.domainReports.length === 0) {
    missingElements.push('Domain reports');
  }

  if (!report.roadmap) {
    missingElements.push('Remediation roadmap');
  } else {
    if (!report.roadmap.sprints || report.roadmap.sprints.length === 0) {
      // Only missing if there are findings
      if (report.findings.length > 0) {
        missingElements.push('Sprint allocations');
      }
    }
  }

  return {
    isComplete: missingElements.length === 0,
    missingElements,
  };
}
