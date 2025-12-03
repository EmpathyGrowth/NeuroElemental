/**
 * API Route Scanner
 * 
 * Scans the app/api directory for route.ts files and analyzes
 * factory pattern usage and authentication types.
 */

import * as fs from 'fs';
import * as path from 'path';
import { RouteInfo, RouteInventory, AuthType, HttpMethod } from '../types';

/**
 * Factory pattern function names to detect
 */
const FACTORY_PATTERNS = [
  'createAuthenticatedRoute',
  'createPublicRoute',
  'createAdminRoute',
  'createCronRoute',
  'createOptionalAuthRoute',
];

/**
 * HTTP methods to detect in route files
 */
const HTTP_METHODS: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Detect which factory pattern is used in file content
 */
export function detectFactoryPattern(content: string): {
  usesFactory: boolean;
  authType: AuthType;
  factoryName?: string;
} {
  for (const pattern of FACTORY_PATTERNS) {
    // Check for import and usage
    if (content.includes(pattern)) {
      let authType: AuthType = 'none';

      if (pattern === 'createAuthenticatedRoute') {
        authType = 'authenticated';
      } else if (pattern === 'createAdminRoute') {
        authType = 'admin';
      } else if (pattern === 'createPublicRoute') {
        authType = 'public';
      } else if (pattern === 'createCronRoute') {
        authType = 'authenticated'; // Cron routes are authenticated via secret
      } else if (pattern === 'createOptionalAuthRoute') {
        authType = 'public'; // Optional auth means public access is allowed
      }

      return {
        usesFactory: true,
        authType,
        factoryName: pattern,
      };
    }
  }

  // Check for legacy patterns (direct NextResponse usage without factory)
  const hasLegacyPattern =
    content.includes('export async function') &&
    content.includes('NextResponse');

  if (hasLegacyPattern) {
    // Try to detect auth type from legacy patterns
    if (content.includes('getCurrentUser') || content.includes('getUser')) {
      return { usesFactory: false, authType: 'authenticated' };
    }
    return { usesFactory: false, authType: 'none' };
  }

  return { usesFactory: false, authType: 'none' };
}

/**
 * Detect HTTP methods exported from a route file
 */
export function detectHttpMethods(content: string): HttpMethod[] {
  const methods: HttpMethod[] = [];

  for (const method of HTTP_METHODS) {
    // Check for export const METHOD = or export async function METHOD
    const patterns = [
      `export const ${method}`,
      `export async function ${method}`,
      `export function ${method}`,
    ];

    if (patterns.some((p) => content.includes(p))) {
      methods.push(method);
    }
  }

  return methods;
}

/**
 * Detect if route has validation (Zod schema usage)
 */
export function detectValidation(content: string): boolean {
  const validationPatterns = [
    '.safeParse(',
    '.parse(',
    'validateRequest',
    'z.object(',
    'Schema.safeParse',
    'Schema.parse',
  ];

  return validationPatterns.some((p) => content.includes(p));
}

/**
 * Recursively find all route.ts files in a directory
 */
function findRouteFiles(dir: string, baseDir: string = dir): string[] {
  const routes: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories
        if (entry.name.startsWith('.')) {
          continue;
        }

        routes.push(...findRouteFiles(fullPath, baseDir));
      } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
        const relativePath = path.relative(baseDir, fullPath);
        routes.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return routes;
}

/**
 * Scan a single route file and extract information
 */
export function scanRouteFile(filePath: string): RouteInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { usesFactory, authType } = detectFactoryPattern(content);
    const methods = detectHttpMethods(content);
    const hasValidation = detectValidation(content);

    return {
      path: filePath,
      methods,
      usesFactoryPattern: usesFactory,
      authType,
      hasValidation,
    };
  } catch (error) {
    console.error(`Error reading route file ${filePath}:`, error);
    return null;
  }
}

/**
 * Scan the API directory for routes
 */
export function scanApiRoutes(apiDir: string = 'app/api'): RouteInventory {
  const routeFiles = findRouteFiles(apiDir, apiDir);
  const routes: RouteInfo[] = [];

  for (const filePath of routeFiles) {
    const fullPath = path.join(apiDir, filePath);
    const routeInfo = scanRouteFile(fullPath);

    if (routeInfo) {
      // Update path to be relative to api directory
      routeInfo.path = filePath;
      routes.push(routeInfo);
    }
  }

  // Calculate compliance percentages
  const factoryPatternCompliance =
    routes.length > 0
      ? Math.round(
          (routes.filter((r) => r.usesFactoryPattern).length / routes.length) *
            100
        )
      : 100;

  const authenticationCoverage =
    routes.length > 0
      ? Math.round(
          (routes.filter((r) => r.authType !== 'none').length / routes.length) *
            100
        )
      : 100;

  return {
    routes,
    factoryPatternCompliance,
    authenticationCoverage,
  };
}

/**
 * Get routes not using factory pattern
 */
export function getRoutesWithoutFactory(inventory: RouteInventory): RouteInfo[] {
  return inventory.routes.filter((r) => !r.usesFactoryPattern);
}

/**
 * Get routes without authentication
 */
export function getRoutesWithoutAuth(inventory: RouteInventory): RouteInfo[] {
  return inventory.routes.filter((r) => r.authType === 'none');
}

/**
 * Get routes without validation
 */
export function getRoutesWithoutValidation(inventory: RouteInventory): RouteInfo[] {
  return inventory.routes.filter((r) => !r.hasValidation);
}

/**
 * Get admin routes
 */
export function getAdminRoutes(inventory: RouteInventory): RouteInfo[] {
  return inventory.routes.filter((r) => r.authType === 'admin');
}

/**
 * Get public routes
 */
export function getPublicRoutes(inventory: RouteInventory): RouteInfo[] {
  return inventory.routes.filter((r) => r.authType === 'public');
}
