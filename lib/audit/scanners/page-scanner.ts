/**
 * Page Scanner
 * 
 * Scans the app directory for page.tsx files and extracts route information
 * following Next.js App Router conventions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { PageInfo, PageInventory, UserRole } from '../types';

/**
 * Protected route configuration
 */
const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/dashboard': ['registered', 'student', 'instructor', 'business', 'admin'],
  '/dashboard/student': ['student', 'instructor', 'admin'],
  '/dashboard/instructor': ['instructor', 'admin'],
  '/dashboard/admin': ['admin'],
  '/dashboard/business': ['business', 'admin'],
  '/dashboard/school': ['business', 'admin'],
};

/**
 * Convert file path to route path following Next.js App Router conventions
 */
export function filePathToRoutePath(filePath: string): string {
  // Remove app/ prefix and page.tsx suffix
  let routePath = filePath
    .replace(/^app[\/\\]/, '')
    .replace(/[\/\\]page\.tsx$/, '')
    .replace(/\\/g, '/');

  // Handle root page
  if (routePath === '' || routePath === 'page.tsx') {
    return '/';
  }

  // Handle route groups (parentheses) - they don't affect the URL
  routePath = routePath.replace(/\([^)]+\)\//g, '');

  // Handle dynamic segments [param] -> :param for display
  routePath = routePath.replace(/\[([^\]]+)\]/g, ':$1');

  // Ensure leading slash
  if (!routePath.startsWith('/')) {
    routePath = '/' + routePath;
  }

  return routePath;
}

/**
 * Check if a route is protected based on configuration
 */
export function isRouteProtected(routePath: string): boolean {
  // Check exact match first
  if (PROTECTED_ROUTES[routePath]) {
    return true;
  }

  // Check if route starts with any protected prefix
  for (const protectedRoute of Object.keys(PROTECTED_ROUTES)) {
    if (routePath.startsWith(protectedRoute + '/')) {
      return true;
    }
  }

  return false;
}

/**
 * Get required roles for a route
 */
export function getRequiredRoles(routePath: string): UserRole[] {
  // Check exact match first
  if (PROTECTED_ROUTES[routePath]) {
    return PROTECTED_ROUTES[routePath];
  }

  // Find the most specific matching protected route
  let matchedRoute = '';
  for (const protectedRoute of Object.keys(PROTECTED_ROUTES)) {
    if (
      routePath.startsWith(protectedRoute + '/') &&
      protectedRoute.length > matchedRoute.length
    ) {
      matchedRoute = protectedRoute;
    }
  }

  return matchedRoute ? PROTECTED_ROUTES[matchedRoute] : [];
}

/**
 * Check if a directory contains a specific file
 */
function hasFile(dir: string, filename: string): boolean {
  try {
    return fs.existsSync(path.join(dir, filename));
  } catch {
    return false;
  }
}

/**
 * Recursively find all page.tsx files in a directory
 */
function findPageFiles(dir: string, baseDir: string = dir): string[] {
  const pages: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules, .next, and other non-route directories
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'api' // API routes are handled separately
        ) {
          continue;
        }

        pages.push(...findPageFiles(fullPath, baseDir));
      } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
        // Get relative path from base directory
        const relativePath = path.relative(baseDir, fullPath);
        pages.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return pages;
}

/**
 * Extract domain from route path
 */
function extractDomain(routePath: string): string {
  const segments = routePath.split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'home';
  }

  // Use first segment as domain
  const firstSegment = segments[0].replace(/^:/, '');

  // Map common segments to domains
  const domainMap: Record<string, string> = {
    dashboard: 'dashboard',
    auth: 'auth',
    courses: 'lms',
    events: 'events',
    blog: 'content',
    tools: 'tools',
    pricing: 'commerce',
    checkout: 'commerce',
    about: 'marketing',
    privacy: 'legal',
    terms: 'legal',
  };

  return domainMap[firstSegment] || firstSegment;
}

/**
 * Scan the app directory for pages
 */
export function scanPages(appDir: string = 'app'): PageInventory {
  const pageFiles = findPageFiles(appDir, appDir);
  const pages: PageInfo[] = [];
  const byDomain: Record<string, PageInfo[]> = {};

  for (const filePath of pageFiles) {
    const fullFilePath = path.join(appDir, filePath);
    const pageDir = path.dirname(fullFilePath);
    const routePath = filePathToRoutePath(path.join('app', filePath));

    const pageInfo: PageInfo = {
      path: filePath,
      routePath,
      hasLoadingState: hasFile(pageDir, 'loading.tsx'),
      hasErrorState: hasFile(pageDir, 'error.tsx'),
      isProtected: isRouteProtected(routePath),
      requiredRoles: getRequiredRoles(routePath),
    };

    pages.push(pageInfo);

    // Group by domain
    const domain = extractDomain(routePath);
    if (!byDomain[domain]) {
      byDomain[domain] = [];
    }
    byDomain[domain].push(pageInfo);
  }

  return {
    pages,
    totalCount: pages.length,
    byDomain,
  };
}

/**
 * Get pages missing loading states
 */
export function getPagesWithoutLoadingState(inventory: PageInventory): PageInfo[] {
  return inventory.pages.filter((p) => !p.hasLoadingState);
}

/**
 * Get pages missing error states
 */
export function getPagesWithoutErrorState(inventory: PageInventory): PageInfo[] {
  return inventory.pages.filter((p) => !p.hasErrorState);
}

/**
 * Get protected pages
 */
export function getProtectedPages(inventory: PageInventory): PageInfo[] {
  return inventory.pages.filter((p) => p.isProtected);
}

/**
 * Get public pages
 */
export function getPublicPages(inventory: PageInventory): PageInfo[] {
  return inventory.pages.filter((p) => !p.isProtected);
}
