/**
 * Comprehensive Platform Audit - Type Definitions
 * 
 * This module defines all types and interfaces for the audit framework.
 */

// =============================================================================
// Audit Domain Types
// =============================================================================

/**
 * All audit domains that can be evaluated
 */
export type AuditDomain =
  | 'features'
  | 'routes'
  | 'dashboards'
  | 'settings'
  | 'ui-consistency'
  | 'ux-quality'
  | 'performance'
  | 'security'
  | 'technical-debt'
  | 'testing'
  | 'documentation'
  | 'best-practices'
  | 'database';

/**
 * Feature domains for categorization
 */
export type FeatureDomain =
  | 'auth'
  | 'lms'
  | 'commerce'
  | 'events'
  | 'b2b'
  | 'tools'
  | 'admin'
  | 'settings';

/**
 * Severity levels for findings
 */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Effort estimate units
 */
export type EffortUnit = 'hours' | 'days' | 'weeks';

/**
 * Feature implementation status
 */
export type FeatureStatus = 'complete' | 'partial' | 'stub';

/**
 * User roles in the system
 */
export type UserRole = 'student' | 'instructor' | 'business' | 'admin' | 'registered';

/**
 * API route authentication types
 */
export type AuthType = 'public' | 'authenticated' | 'admin' | 'none';

/**
 * HTTP methods for API routes
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Audit configuration
 */
export interface AuditConfig {
  /** Supabase project ID */
  projectId: string;
  /** Application base URL for Playwright testing */
  baseUrl: string;
  /** Which domains to audit */
  domains: AuditDomain[];
  /** Threshold configuration */
  thresholds: AuditThresholds;
}

/**
 * Threshold configuration for audit evaluations
 */
export interface AuditThresholds {
  // Performance thresholds
  /** Maximum Largest Contentful Paint in milliseconds */
  maxLCP: number;
  /** Maximum First Input Delay in milliseconds */
  maxFID: number;
  /** Maximum Cumulative Layout Shift score */
  maxCLS: number;
  /** Maximum API response time in milliseconds */
  maxApiResponseTime: number;

  // Code quality thresholds
  /** Minimum test coverage percentage */
  minTestCoverage: number;
  /** Maximum duplicate lines before flagging */
  maxDuplicateLines: number;

  // Security thresholds
  /** Require RLS on all tables */
  requireRLSOnAllTables: boolean;
  /** Require authentication on API routes */
  requireAuthOnApiRoutes: boolean;
}

/**
 * Default audit thresholds
 */
export const DEFAULT_THRESHOLDS: AuditThresholds = {
  maxLCP: 2500,
  maxFID: 100,
  maxCLS: 0.1,
  maxApiResponseTime: 500,
  minTestCoverage: 80,
  maxDuplicateLines: 20,
  requireRLSOnAllTables: true,
  requireAuthOnApiRoutes: true,
};

// =============================================================================
// Finding Types
// =============================================================================

/**
 * An audit finding representing an issue or observation
 */
export interface Finding {
  /** Unique identifier for the finding */
  id: string;
  /** Which audit domain this finding belongs to */
  domain: AuditDomain;
  /** Severity level */
  severity: Severity;
  /** Short title describing the finding */
  title: string;
  /** Detailed description of the finding */
  description: string;
  /** File path or URL where the issue was found */
  location?: string;
  /** Recommended action to resolve the finding */
  recommendation: string;
  /** Effort estimate unit */
  effortUnit: EffortUnit;
  /** Effort estimate value */
  effortValue: number;
  /** Related requirement IDs */
  relatedRequirements?: string[];
}

/**
 * Classifies a vulnerability into a severity level
 */
export function classifySeverity(vulnerability: {
  type: string;
  description: string;
  impact: string;
}): Severity {
  const impactLower = vulnerability.impact.toLowerCase();
  const typeLower = vulnerability.type.toLowerCase();
  const descLower = vulnerability.description.toLowerCase();

  // Critical: Data breach, authentication bypass, RCE
  if (
    impactLower.includes('data breach') ||
    impactLower.includes('authentication bypass') ||
    impactLower.includes('remote code execution') ||
    typeLower.includes('sql injection') ||
    typeLower.includes('rce')
  ) {
    return 'critical';
  }

  // High: Privilege escalation, sensitive data exposure
  if (
    impactLower.includes('privilege escalation') ||
    impactLower.includes('sensitive data') ||
    impactLower.includes('unauthorized access') ||
    typeLower.includes('xss') ||
    typeLower.includes('csrf')
  ) {
    return 'high';
  }

  // Medium: Information disclosure, missing security headers
  if (
    impactLower.includes('information disclosure') ||
    impactLower.includes('missing') ||
    descLower.includes('security header') ||
    descLower.includes('rate limit')
  ) {
    return 'medium';
  }

  // Low: Best practice violations, minor issues
  return 'low';
}

// =============================================================================
// Inventory Types
// =============================================================================

/**
 * Page information from scanning
 */
export interface PageInfo {
  /** File path relative to app directory */
  path: string;
  /** Route path for the page */
  routePath: string;
  /** Whether the page has a loading.tsx */
  hasLoadingState: boolean;
  /** Whether the page has an error.tsx */
  hasErrorState: boolean;
  /** Whether the route is protected */
  isProtected: boolean;
  /** Required roles for access */
  requiredRoles: UserRole[];
}

/**
 * Page inventory from scanning
 */
export interface PageInventory {
  /** All pages found */
  pages: PageInfo[];
  /** Total count */
  totalCount: number;
  /** Pages grouped by domain */
  byDomain: Record<string, PageInfo[]>;
}

/**
 * API route information
 */
export interface RouteInfo {
  /** File path relative to app/api directory */
  path: string;
  /** HTTP methods supported */
  methods: HttpMethod[];
  /** Whether the route uses factory pattern */
  usesFactoryPattern: boolean;
  /** Authentication type */
  authType: AuthType;
  /** Whether the route has validation */
  hasValidation: boolean;
}

/**
 * Route inventory from scanning
 */
export interface RouteInventory {
  /** All routes found */
  routes: RouteInfo[];
  /** Factory pattern compliance percentage */
  factoryPatternCompliance: number;
  /** Authentication coverage percentage */
  authenticationCoverage: number;
}

/**
 * Component information
 */
export interface ComponentInfo {
  /** File path */
  path: string;
  /** Component name */
  name: string;
  /** Lines of code */
  lineCount: number;
  /** Exports from the component */
  exports: string[];
  /** Imports used */
  imports: string[];
}

/**
 * Component inventory
 */
export interface ComponentInventory {
  /** All components found */
  components: ComponentInfo[];
  /** Duplicate groups */
  duplicateGroups: DuplicateGroup[];
  /** Total component count */
  totalCount: number;
}

/**
 * Group of duplicate components
 */
export interface DuplicateGroup {
  /** Components in this group */
  components: ComponentInfo[];
  /** Similarity percentage */
  similarity: number;
  /** Shared lines count */
  sharedLines: number;
}

// =============================================================================
// Feature Types
// =============================================================================

/**
 * Feature classification result
 */
export interface FeatureClassification {
  /** Unique feature identifier */
  featureId: string;
  /** Feature name */
  name: string;
  /** Domain the feature belongs to */
  domain: FeatureDomain;
  /** Implementation status */
  status: FeatureStatus;
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Missing functionality for partial features */
  missingFunctionality?: string[];
  /** Related implementation files */
  relatedFiles: string[];
}

/**
 * Calculate coverage percentage from features
 */
export function calculateCoverage(
  features: { status: FeatureStatus }[]
): number {
  if (features.length === 0) return 0;

  const weights: Record<FeatureStatus, number> = {
    complete: 1,
    partial: 0.5,
    stub: 0,
  };

  const totalWeight = features.reduce(
    (sum, f) => sum + weights[f.status],
    0
  );

  return Math.round((totalWeight / features.length) * 100);
}

// =============================================================================
// Dashboard Types
// =============================================================================

/**
 * Navigation item status
 */
export interface NavigationItemStatus {
  /** Display label */
  label: string;
  /** Link href */
  href: string;
  /** Whether the link works */
  isWorking: boolean;
  /** Error message if not working */
  error?: string;
}

/**
 * Widget status
 */
export interface WidgetStatus {
  /** Widget name */
  name: string;
  /** Whether it displays real data */
  hasRealData: boolean;
  /** Data source (table/query) */
  dataSource?: string;
  /** Whether it's a placeholder */
  isPlaceholder: boolean;
}

/**
 * Placeholder information
 */
export interface PlaceholderInfo {
  /** Component or element name */
  name: string;
  /** Location in the dashboard */
  location: string;
  /** Description of what's missing */
  description: string;
}

/**
 * Permission violation
 */
export interface PermissionViolation {
  /** Role that shouldn't have access */
  role: UserRole;
  /** Resource that was accessed */
  resource: string;
  /** Expected behavior */
  expected: string;
  /** Actual behavior */
  actual: string;
}

/**
 * Dashboard evaluation result
 */
export interface DashboardEvaluation {
  /** Role this dashboard is for */
  role: UserRole;
  /** Completeness score (0-100) */
  completenessScore: number;
  /** Navigation item statuses */
  navigationItems: NavigationItemStatus[];
  /** Widget statuses */
  widgets: WidgetStatus[];
  /** Placeholder information */
  placeholders: PlaceholderInfo[];
  /** Permission violations found */
  permissionViolations: PermissionViolation[];
}

// =============================================================================
// Report Types
// =============================================================================

/**
 * Executive summary for the audit report
 */
export interface ExecutiveSummary {
  /** Overall health score (0-100) */
  overallHealthScore: number;
  /** Health scores by domain */
  domainScores: Record<AuditDomain, number>;
  /** Count of critical findings */
  criticalFindings: number;
  /** Count of high findings */
  highFindings: number;
  /** Count of medium findings */
  mediumFindings: number;
  /** Count of low findings */
  lowFindings: number;
  /** Estimated total remediation effort */
  estimatedRemediationEffort: string;
}

/**
 * Domain-specific report
 */
export interface DomainReport {
  /** Domain name */
  domain: AuditDomain;
  /** Health score for this domain */
  healthScore: number;
  /** Findings for this domain */
  findings: Finding[];
  /** Summary of the domain evaluation */
  summary: string;
}

/**
 * Sprint plan for remediation
 */
export interface SprintPlan {
  /** Sprint number */
  sprintNumber: number;
  /** Focus area for this sprint */
  focus: string;
  /** Findings to address */
  findings: Finding[];
  /** Estimated effort for this sprint */
  estimatedEffort: string;
}

/**
 * Remediation roadmap
 */
export interface RemediationRoadmap {
  /** Sprint plans */
  sprints: SprintPlan[];
  /** Total effort in weeks */
  totalEffortWeeks: number;
}

/**
 * Complete audit report
 */
export interface AuditReport {
  /** When the report was generated */
  generatedAt: Date;
  /** Executive summary */
  summary: ExecutiveSummary;
  /** Reports by domain */
  domainReports: DomainReport[];
  /** All findings */
  findings: Finding[];
  /** Remediation roadmap */
  roadmap: RemediationRoadmap;
}

/**
 * Audit result with status
 */
export interface AuditResult {
  /** Overall status */
  status: 'complete' | 'partial' | 'failed';
  /** Domains that completed successfully */
  completedDomains: AuditDomain[];
  /** Domains that failed with errors */
  failedDomains: { domain: AuditDomain; error: string }[];
  /** The audit report if available */
  report?: AuditReport;
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Generate a unique finding ID
 */
export function generateFindingId(domain: AuditDomain, index: number): string {
  return `${domain}-${Date.now()}-${index}`;
}

/**
 * Calculate effort in hours from unit and value
 */
export function calculateEffortHours(unit: EffortUnit, value: number): number {
  const multipliers: Record<EffortUnit, number> = {
    hours: 1,
    days: 8,
    weeks: 40,
  };
  return value * multipliers[unit];
}

/**
 * Format effort for display
 */
export function formatEffort(unit: EffortUnit, value: number): string {
  if (value === 1) {
    return `${value} ${unit.slice(0, -1)}`; // Remove 's' for singular
  }
  return `${value} ${unit}`;
}
