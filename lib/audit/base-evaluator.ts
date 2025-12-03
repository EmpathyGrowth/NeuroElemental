/**
 * Base Audit Evaluator
 * 
 * Abstract base class for all audit domain evaluators.
 * Provides common functionality for finding creation, scoring, and reporting.
 */

import {
  AuditDomain,
  Finding,
  Severity,
  EffortUnit,
  AuditConfig,
  generateFindingId,
  calculateEffortHours,
} from './types';

/**
 * Abstract base class for audit evaluators
 */
export abstract class BaseAuditEvaluator<TResult = unknown> {
  protected findings: Finding[] = [];
  protected healthScore: number = 100;
  protected findingIndex: number = 0;

  constructor(
    protected readonly domain: AuditDomain,
    protected readonly config: AuditConfig
  ) {}

  /**
   * Run the evaluation - must be implemented by subclasses
   */
  abstract evaluate(): Promise<TResult>;

  /**
   * Get all findings from this evaluation
   */
  getFindings(): Finding[] {
    return [...this.findings];
  }

  /**
   * Get the health score (0-100)
   */
  getHealthScore(): number {
    return Math.max(0, Math.min(100, this.healthScore));
  }

  /**
   * Get the domain this evaluator covers
   */
  getDomain(): AuditDomain {
    return this.domain;
  }

  /**
   * Create a new finding
   */
  protected createFinding(params: {
    severity: Severity;
    title: string;
    description: string;
    location?: string;
    recommendation: string;
    effortUnit: EffortUnit;
    effortValue: number;
    relatedRequirements?: string[];
  }): Finding {
    const finding: Finding = {
      id: generateFindingId(this.domain, this.findingIndex++),
      domain: this.domain,
      ...params,
    };

    this.findings.push(finding);
    this.adjustHealthScore(finding.severity);

    return finding;
  }

  /**
   * Adjust health score based on finding severity
   */
  protected adjustHealthScore(severity: Severity): void {
    const penalties: Record<Severity, number> = {
      critical: 20,
      high: 10,
      medium: 5,
      low: 2,
    };

    this.healthScore -= penalties[severity];
  }

  /**
   * Create a critical finding
   */
  protected critical(
    title: string,
    description: string,
    recommendation: string,
    options?: {
      location?: string;
      effortUnit?: EffortUnit;
      effortValue?: number;
      relatedRequirements?: string[];
    }
  ): Finding {
    return this.createFinding({
      severity: 'critical',
      title,
      description,
      recommendation,
      location: options?.location,
      effortUnit: options?.effortUnit ?? 'days',
      effortValue: options?.effortValue ?? 1,
      relatedRequirements: options?.relatedRequirements,
    });
  }

  /**
   * Create a high severity finding
   */
  protected high(
    title: string,
    description: string,
    recommendation: string,
    options?: {
      location?: string;
      effortUnit?: EffortUnit;
      effortValue?: number;
      relatedRequirements?: string[];
    }
  ): Finding {
    return this.createFinding({
      severity: 'high',
      title,
      description,
      recommendation,
      location: options?.location,
      effortUnit: options?.effortUnit ?? 'hours',
      effortValue: options?.effortValue ?? 4,
      relatedRequirements: options?.relatedRequirements,
    });
  }

  /**
   * Create a medium severity finding
   */
  protected medium(
    title: string,
    description: string,
    recommendation: string,
    options?: {
      location?: string;
      effortUnit?: EffortUnit;
      effortValue?: number;
      relatedRequirements?: string[];
    }
  ): Finding {
    return this.createFinding({
      severity: 'medium',
      title,
      description,
      recommendation,
      location: options?.location,
      effortUnit: options?.effortUnit ?? 'hours',
      effortValue: options?.effortValue ?? 2,
      relatedRequirements: options?.relatedRequirements,
    });
  }

  /**
   * Create a low severity finding
   */
  protected low(
    title: string,
    description: string,
    recommendation: string,
    options?: {
      location?: string;
      effortUnit?: EffortUnit;
      effortValue?: number;
      relatedRequirements?: string[];
    }
  ): Finding {
    return this.createFinding({
      severity: 'low',
      title,
      description,
      recommendation,
      location: options?.location,
      effortUnit: options?.effortUnit ?? 'hours',
      effortValue: options?.effortValue ?? 1,
      relatedRequirements: options?.relatedRequirements,
    });
  }

  /**
   * Calculate total effort in hours for all findings
   */
  getTotalEffortHours(): number {
    return this.findings.reduce(
      (total, finding) =>
        total + calculateEffortHours(finding.effortUnit, finding.effortValue),
      0
    );
  }

  /**
   * Get findings by severity
   */
  getFindingsBySeverity(severity: Severity): Finding[] {
    return this.findings.filter((f) => f.severity === severity);
  }

  /**
   * Get finding counts by severity
   */
  getFindingCounts(): Record<Severity, number> {
    return {
      critical: this.getFindingsBySeverity('critical').length,
      high: this.getFindingsBySeverity('high').length,
      medium: this.getFindingsBySeverity('medium').length,
      low: this.getFindingsBySeverity('low').length,
    };
  }

  /**
   * Reset the evaluator state
   */
  protected reset(): void {
    this.findings = [];
    this.healthScore = 100;
    this.findingIndex = 0;
  }

  /**
   * Generate a summary of the evaluation
   */
  getSummary(): string {
    const counts = this.getFindingCounts();
    const totalFindings = this.findings.length;
    const effortHours = this.getTotalEffortHours();

    if (totalFindings === 0) {
      return `${this.domain}: No issues found. Health score: ${this.healthScore}/100`;
    }

    const parts = [];
    if (counts.critical > 0) parts.push(`${counts.critical} critical`);
    if (counts.high > 0) parts.push(`${counts.high} high`);
    if (counts.medium > 0) parts.push(`${counts.medium} medium`);
    if (counts.low > 0) parts.push(`${counts.low} low`);

    return `${this.domain}: ${totalFindings} findings (${parts.join(', ')}). Health score: ${this.healthScore}/100. Estimated effort: ${effortHours}h`;
  }
}

/**
 * Interface for evaluation results
 */
export interface EvaluationResult<T = unknown> {
  domain: AuditDomain;
  result: T;
  findings: Finding[];
  healthScore: number;
  summary: string;
}

/**
 * Run an evaluator and return structured results
 */
export async function runEvaluator<T>(
  evaluator: BaseAuditEvaluator<T>
): Promise<EvaluationResult<T>> {
  const result = await evaluator.evaluate();

  return {
    domain: evaluator.getDomain(),
    result,
    findings: evaluator.getFindings(),
    healthScore: evaluator.getHealthScore(),
    summary: evaluator.getSummary(),
  };
}
