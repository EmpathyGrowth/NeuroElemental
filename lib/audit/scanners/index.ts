/**
 * Code Scanners
 * 
 * Barrel export for all scanner modules.
 */

// Page scanner
export {
  scanPages,
  filePathToRoutePath,
  isRouteProtected,
  getRequiredRoles,
  getPagesWithoutLoadingState,
  getPagesWithoutErrorState,
  getProtectedPages,
  getPublicPages,
} from './page-scanner';

// Route scanner
export {
  scanApiRoutes,
  scanRouteFile,
  detectFactoryPattern,
  detectHttpMethods,
  detectValidation,
  getRoutesWithoutFactory,
  getRoutesWithoutAuth,
  getRoutesWithoutValidation,
  getAdminRoutes,
  getPublicRoutes,
} from './route-scanner';

// Component scanner
export {
  scanComponents,
  scanComponentFile,
  extractComponentName,
  extractExports,
  extractImports,
  countSignificantLines,
  normalizeContent,
  calculateSimilarity,
  findSharedLines,
  findDuplicateGroups,
  getLargeComponents,
  getComponentsWithManyExports,
} from './component-scanner';

// Orphan detector
export {
  detectOrphanedCode,
  extractAllImports,
  extractAllExports,
  resolveImportSource,
  getHighPriorityOrphans,
} from './orphan-detector';
export type { OrphanedCodeReport, UnusedExport } from './orphan-detector';
