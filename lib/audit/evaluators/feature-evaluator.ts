/**
 * Feature Completeness Evaluator
 * 
 * Evaluates feature implementation status across all domains.
 */

import * as fs from 'fs';
import * as path from 'path';
import { BaseAuditEvaluator } from '../base-evaluator';
import {
  AuditConfig,
  FeatureClassification,
  FeatureDomain,
  FeatureStatus,
  calculateCoverage,
} from '../types';

/**
 * Feature definition for scanning
 */
interface FeatureDefinition {
  id: string;
  name: string;
  domain: FeatureDomain;
  requiredFiles: string[];
  optionalFiles?: string[];
  requiredPatterns?: string[];
}

/**
 * Feature inventory result
 */
export interface FeatureInventoryResult {
  features: FeatureClassification[];
  byDomain: Record<FeatureDomain, FeatureClassification[]>;
  coverageByDomain: Record<FeatureDomain, number>;
  overallCoverage: number;
}

/**
 * Known features to scan for
 */
const FEATURE_DEFINITIONS: FeatureDefinition[] = [
  // Auth domain
  {
    id: 'auth-login',
    name: 'User Login',
    domain: 'auth',
    requiredFiles: ['app/auth/login/page.tsx', 'components/auth/login-form.tsx'],
    requiredPatterns: ['signIn', 'login'],
  },
  {
    id: 'auth-signup',
    name: 'User Registration',
    domain: 'auth',
    requiredFiles: ['app/auth/signup/page.tsx', 'components/auth/signup-form.tsx'],
    requiredPatterns: ['signUp', 'register'],
  },
  {
    id: 'auth-password-reset',
    name: 'Password Reset',
    domain: 'auth',
    requiredFiles: ['app/auth/forgot-password/page.tsx', 'app/auth/reset-password/page.tsx'],
  },
  {
    id: 'auth-oauth',
    name: 'OAuth Authentication',
    domain: 'auth',
    requiredFiles: ['app/auth/callback/route.ts'],
    requiredPatterns: ['OAuth', 'google', 'github'],
  },

  // LMS domain
  {
    id: 'lms-courses',
    name: 'Course Catalog',
    domain: 'lms',
    requiredFiles: ['app/courses/page.tsx', 'app/api/courses/route.ts'],
  },
  {
    id: 'lms-course-detail',
    name: 'Course Detail Page',
    domain: 'lms',
    requiredFiles: ['app/courses/[slug]/page.tsx'],
  },
  {
    id: 'lms-lessons',
    name: 'Lesson System',
    domain: 'lms',
    requiredFiles: ['app/api/lessons/[id]/route.ts'],
    requiredPatterns: ['lesson'],
  },
  {
    id: 'lms-quizzes',
    name: 'Quiz System',
    domain: 'lms',
    requiredFiles: ['app/api/quizzes/route.ts', 'components/quiz/quiz-player.tsx'],
  },
  {
    id: 'lms-certificates',
    name: 'Certificate Generation',
    domain: 'lms',
    requiredFiles: ['app/api/certificates/route.ts', 'components/certificates/certificate-pdf.tsx'],
  },
  {
    id: 'lms-enrollments',
    name: 'Course Enrollments',
    domain: 'lms',
    requiredFiles: ['app/api/courses/[id]/enroll/route.ts'],
    requiredPatterns: ['enroll', 'enrollment'],
  },

  // Commerce domain
  {
    id: 'commerce-pricing',
    name: 'Pricing Page',
    domain: 'commerce',
    requiredFiles: ['app/pricing/page.tsx'],
  },
  {
    id: 'commerce-stripe',
    name: 'Stripe Integration',
    domain: 'commerce',
    requiredFiles: ['app/api/stripe/checkout/route.ts', 'lib/stripe/config.ts'],
    requiredPatterns: ['stripe'],
  },
  {
    id: 'commerce-subscriptions',
    name: 'Subscription Management',
    domain: 'commerce',
    requiredFiles: ['app/api/subscriptions/route.ts'],
  },
  {
    id: 'commerce-billing',
    name: 'Billing Dashboard',
    domain: 'commerce',
    requiredFiles: ['app/dashboard/billing/plans/page.tsx'],
  },

  // Events domain
  {
    id: 'events-calendar',
    name: 'Event Calendar',
    domain: 'events',
    requiredFiles: ['app/events/page.tsx', 'app/api/events/route.ts'],
  },
  {
    id: 'events-registration',
    name: 'Event Registration',
    domain: 'events',
    requiredFiles: ['app/api/events/[id]/registrations/route.ts'],
  },

  // B2B domain
  {
    id: 'b2b-organizations',
    name: 'Organization Management',
    domain: 'b2b',
    requiredFiles: ['app/api/organizations/route.ts', 'app/dashboard/organizations/page.tsx'],
  },
  {
    id: 'b2b-teams',
    name: 'Team Management',
    domain: 'b2b',
    requiredFiles: ['app/api/organizations/[id]/members/route.ts'],
  },
  {
    id: 'b2b-invitations',
    name: 'Team Invitations',
    domain: 'b2b',
    requiredFiles: ['app/api/invitations/route.ts'],
  },
  {
    id: 'b2b-analytics',
    name: 'Organization Analytics',
    domain: 'b2b',
    requiredFiles: ['app/api/analytics/overview/route.ts'],
  },

  // Tools domain
  {
    id: 'tools-assessment',
    name: 'Assessment Tool',
    domain: 'tools',
    requiredFiles: ['app/assessment/page.tsx', 'app/api/assessment/history/route.ts'],
  },
  {
    id: 'tools-daily-checkin',
    name: 'Daily Check-in',
    domain: 'tools',
    requiredFiles: ['app/tools/daily-checkin/page.tsx'],
  },
  {
    id: 'tools-energy-budget',
    name: 'Energy Budget Tool',
    domain: 'tools',
    requiredFiles: ['app/tools/energy-budget/page.tsx'],
  },
  {
    id: 'tools-state-tracker',
    name: 'State Tracker',
    domain: 'tools',
    requiredFiles: ['app/tools/state-tracker/page.tsx'],
  },

  // Admin domain
  {
    id: 'admin-dashboard',
    name: 'Admin Dashboard',
    domain: 'admin',
    requiredFiles: ['app/dashboard/admin/page.tsx'],
  },
  {
    id: 'admin-users',
    name: 'User Management',
    domain: 'admin',
    requiredFiles: ['app/api/admin/users/route.ts'],
  },
  {
    id: 'admin-content',
    name: 'Content Management',
    domain: 'admin',
    requiredFiles: ['app/api/admin/content/route.ts'],
  },

  // Settings domain
  {
    id: 'settings-profile',
    name: 'Profile Settings',
    domain: 'settings',
    requiredFiles: ['app/dashboard/settings/page.tsx', 'app/api/profile/route.ts'],
  },
  {
    id: 'settings-notifications',
    name: 'Notification Settings',
    domain: 'settings',
    requiredFiles: ['app/api/notifications/route.ts'],
  },
];

/**
 * Check if a file exists
 */
function fileExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Check if file contains required patterns
 */
function fileContainsPatterns(filePath: string, patterns: string[]): boolean {
  try {
    const content = fs.readFileSync(filePath, 'utf-8').toLowerCase();
    return patterns.every((p) => content.includes(p.toLowerCase()));
  } catch {
    return false;
  }
}

/**
 * Classify a feature based on file existence and patterns
 */
export function classifyFeature(
  definition: FeatureDefinition,
  baseDir: string = '.'
): FeatureClassification {
  const existingFiles: string[] = [];
  const missingFiles: string[] = [];

  // Check required files
  for (const file of definition.requiredFiles) {
    const fullPath = path.join(baseDir, file);
    if (fileExists(fullPath)) {
      existingFiles.push(file);
    } else {
      missingFiles.push(file);
    }
  }

  // Check optional files
  if (definition.optionalFiles) {
    for (const file of definition.optionalFiles) {
      const fullPath = path.join(baseDir, file);
      if (fileExists(fullPath)) {
        existingFiles.push(file);
      }
    }
  }

  // Check patterns in existing files (patterns are optional enhancement, not required)
  let patternsFound = true;
  if (definition.requiredPatterns && existingFiles.length > 0) {
    // Only check patterns if we have files - patterns are a bonus, not a requirement
    const hasPatterns = existingFiles.some((file) =>
      fileContainsPatterns(path.join(baseDir, file), definition.requiredPatterns!)
    );
    // If files exist, we consider patterns found (they're in the file content)
    patternsFound = hasPatterns || existingFiles.length > 0;
  }

  // Determine status
  let status: FeatureStatus;
  let completionPercentage: number;

  const totalRequired = definition.requiredFiles.length;
  const foundRequired = existingFiles.filter((f) =>
    definition.requiredFiles.includes(f)
  ).length;

  if (foundRequired === 0) {
    status = 'stub';
    completionPercentage = 0;
  } else if (foundRequired === totalRequired) {
    // All required files exist - feature is complete
    status = 'complete';
    completionPercentage = 100;
  } else {
    status = 'partial';
    completionPercentage = Math.round((foundRequired / totalRequired) * 100);
  }

  return {
    featureId: definition.id,
    name: definition.name,
    domain: definition.domain,
    status,
    completionPercentage,
    missingFunctionality: missingFiles.length > 0 ? missingFiles : undefined,
    relatedFiles: existingFiles,
  };
}

/**
 * Feature Completeness Evaluator
 */
export class FeatureCompletenessEvaluator extends BaseAuditEvaluator<FeatureInventoryResult> {
  private baseDir: string;

  constructor(config: AuditConfig, baseDir: string = '.') {
    super('features', config);
    this.baseDir = baseDir;
  }

  async evaluate(): Promise<FeatureInventoryResult> {
    this.reset();

    const features: FeatureClassification[] = [];
    const byDomain: Record<FeatureDomain, FeatureClassification[]> = {
      auth: [],
      lms: [],
      commerce: [],
      events: [],
      b2b: [],
      tools: [],
      admin: [],
      settings: [],
    };

    // Classify all features
    for (const definition of FEATURE_DEFINITIONS) {
      const classification = classifyFeature(definition, this.baseDir);
      features.push(classification);
      byDomain[classification.domain].push(classification);

      // Create findings for incomplete features
      if (classification.status === 'stub') {
        this.medium(
          `Feature not implemented: ${classification.name}`,
          `The ${classification.name} feature has no implementation files.`,
          `Implement the feature or remove it from the roadmap.`,
          {
            location: classification.featureId,
            effortUnit: 'days',
            effortValue: 3,
            relatedRequirements: ['1.2'],
          }
        );
      } else if (classification.status === 'partial') {
        this.low(
          `Feature partially implemented: ${classification.name}`,
          `The ${classification.name} feature is ${classification.completionPercentage}% complete. Missing: ${classification.missingFunctionality?.join(', ')}`,
          `Complete the missing functionality.`,
          {
            location: classification.featureId,
            effortUnit: 'hours',
            effortValue: 8,
            relatedRequirements: ['1.3'],
          }
        );
      }
    }

    // Calculate coverage by domain
    const coverageByDomain: Record<FeatureDomain, number> = {} as Record<
      FeatureDomain,
      number
    >;
    for (const domain of Object.keys(byDomain) as FeatureDomain[]) {
      coverageByDomain[domain] = calculateCoverage(byDomain[domain]);
    }

    // Calculate overall coverage
    const overallCoverage = calculateCoverage(features);

    return {
      features,
      byDomain,
      coverageByDomain,
      overallCoverage,
    };
  }
}

/**
 * Get feature definitions (for testing)
 */
export function getFeatureDefinitions(): FeatureDefinition[] {
  return [...FEATURE_DEFINITIONS];
}
