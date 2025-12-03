/**
 * MCP Client Wrappers
 * 
 * Barrel export for all MCP client modules.
 */

// Supabase MCP
export {
  SupabaseMCPClient,
  hasRLSEnabled,
  getTablesWithoutRLS,
  getTablesWithMissingIndexes,
  validateMigrationSync,
} from './supabase-client';
export type {
  TableInfo,
  ColumnInfo,
  MigrationInfo,
  RLSPolicy,
  IndexInfo,
  Advisory,
  QueryResult,
} from './supabase-client';

// Playwright MCP
export {
  PlaywrightMCPClient,
  evaluatePage,
  isNavigationWorking,
} from './playwright-client';
export type {
  AccessibilityElement,
  ConsoleMessage,
  NetworkRequest,
  PageEvaluationResult,
  AccessibilityIssue,
  NavigationTestResult,
  FormField,
} from './playwright-client';

// DeepWiki MCP
export {
  DeepWikiMCPClient,
  FRAMEWORK_REPOS,
  BEST_PRACTICE_QUESTIONS,
  PATTERNS_TO_CHECK,
  getPatternsToCheck,
  usesModernPatterns,
} from './deepwiki-client';
export type {
  BestPractice,
  PatternValidation,
  Framework,
} from './deepwiki-client';
