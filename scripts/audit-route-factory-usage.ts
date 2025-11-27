/**
 * Audit Script: API Route Factory Pattern Usage
 * 
 * This script analyzes all API route files to determine which ones
 * use the factory pattern (createAuthenticatedRoute, createPublicRoute, createAdminRoute)
 * and which ones need migration.
 */

import * as fs from 'fs';
import * as path from 'path';

interface RouteAnalysis {
    path: string;
    usesFactory: boolean;
    factoryTypes: string[];
    httpMethods: string[];
    hasManualTryCatch: boolean;
    hasManualAuth: boolean;
    needsMigration: boolean;
    notes: string[];
}

const FACTORY_PATTERNS = [
    'createAuthenticatedRoute',
    'createPublicRoute',
    'createAdminRoute'
];

function analyzeRouteFile(filePath: string): RouteAnalysis {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = filePath.replace(process.cwd() + path.sep, '').replace(/\\/g, '/');

    const analysis: RouteAnalysis = {
        path: relativePath,
        usesFactory: false,
        factoryTypes: [],
        httpMethods: [],
        hasManualTryCatch: false,
        hasManualAuth: false,
        needsMigration: false,
        notes: []
    };

    // Check for factory pattern usage
    FACTORY_PATTERNS.forEach(pattern => {
        if (content.includes(pattern)) {
            analysis.usesFactory = true;
            analysis.factoryTypes.push(pattern);
        }
    });

    // Check for HTTP method exports
    const methodRegex = /export\s+(?:const|async\s+function)\s+(GET|POST|PUT|PATCH|DELETE)\s*=/g;
    let match;
    while ((match = methodRegex.exec(content)) !== null) {
        analysis.httpMethods.push(match[1]);
    }

    // Check for manual try-catch blocks
    const tryCatchRegex = /export\s+(?:const|async\s+function)\s+(?:GET|POST|PUT|PATCH|DELETE)\s*=\s*async[^{]*{[^}]*try\s*{/;
    if (tryCatchRegex.test(content)) {
        analysis.hasManualTryCatch = true;
        analysis.notes.push('Contains manual try-catch blocks');
    }

    // Check for manual authentication
    const authPatterns = [
        'getCurrentUser()',
        'getUser()',
        'requireAdmin()',
        'cookies().get',
        'headers().get(\'authorization\')'
    ];

    authPatterns.forEach(pattern => {
        if (content.includes(pattern) && !analysis.usesFactory) {
            analysis.hasManualAuth = true;
        }
    });

    if (analysis.hasManualAuth) {
        analysis.notes.push('Contains manual authentication');
    }

    // Determine if migration is needed
    if (!analysis.usesFactory && analysis.httpMethods.length > 0) {
        analysis.needsMigration = true;
    }

    // Check for response helpers
    const responseHelpers = ['successResponse', 'errorResponse', 'paginatedResponse'];
    const usesResponseHelpers = responseHelpers.some(helper => content.includes(helper));

    if (!usesResponseHelpers && analysis.httpMethods.length > 0) {
        analysis.notes.push('Does not use response helpers');
    }

    // Check for NextResponse.json usage (manual response)
    if (content.includes('NextResponse.json') && !analysis.usesFactory) {
        analysis.notes.push('Uses manual NextResponse.json');
    }

    return analysis;
}

function getAllRouteFiles(dir: string): string[] {
    const files: string[] = [];

    function traverse(currentPath: string) {
        const entries = fs.readdirSync(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);

            if (entry.isDirectory()) {
                traverse(fullPath);
            } else if (entry.name === 'route.ts') {
                files.push(fullPath);
            }
        }
    }

    traverse(dir);
    return files;
}

function generateReport(analyses: RouteAnalysis[]): void {
    const needsMigration = analyses.filter(a => a.needsMigration);
    const usesFactory = analyses.filter(a => a.usesFactory);
    const noMethods = analyses.filter(a => a.httpMethods.length === 0);

    console.log('='.repeat(80));
    console.log('API ROUTE FACTORY PATTERN AUDIT REPORT');
    console.log('='.repeat(80));
    console.log();

    console.log('SUMMARY');
    console.log('-'.repeat(80));
    console.log(`Total route files: ${analyses.length}`);
    console.log(`Using factory pattern: ${usesFactory.length} (${Math.round(usesFactory.length / analyses.length * 100)}%)`);
    console.log(`Needs migration: ${needsMigration.length} (${Math.round(needsMigration.length / analyses.length * 100)}%)`);
    console.log(`No HTTP methods: ${noMethods.length}`);
    console.log();

    console.log('FACTORY PATTERN USAGE BREAKDOWN');
    console.log('-'.repeat(80));
    const factoryTypeCounts = {
        createAuthenticatedRoute: 0,
        createPublicRoute: 0,
        createAdminRoute: 0
    };

    usesFactory.forEach(a => {
        a.factoryTypes.forEach(type => {
            factoryTypeCounts[type as keyof typeof factoryTypeCounts]++;
        });
    });

    console.log(`createAuthenticatedRoute: ${factoryTypeCounts.createAuthenticatedRoute}`);
    console.log(`createPublicRoute: ${factoryTypeCounts.createPublicRoute}`);
    console.log(`createAdminRoute: ${factoryTypeCounts.createAdminRoute}`);
    console.log();

    if (needsMigration.length > 0) {
        console.log('ROUTES NEEDING MIGRATION');
        console.log('-'.repeat(80));

        // Group by directory for better organization
        const byDirectory: { [key: string]: RouteAnalysis[] } = {};
        needsMigration.forEach(route => {
            const dir = path.dirname(route.path);
            if (!byDirectory[dir]) {
                byDirectory[dir] = [];
            }
            byDirectory[dir].push(route);
        });

        Object.keys(byDirectory).sort().forEach(dir => {
            console.log(`\n${dir}/`);
            byDirectory[dir].forEach(route => {
                console.log(`  - ${path.basename(route.path)}`);
                console.log(`    Methods: ${route.httpMethods.join(', ')}`);
                if (route.notes.length > 0) {
                    console.log(`    Notes: ${route.notes.join(', ')}`);
                }
            });
        });
        console.log();
    }

    console.log('ROUTES USING FACTORY PATTERN');
    console.log('-'.repeat(80));
    usesFactory.forEach(route => {
        console.log(`✓ ${route.path}`);
        console.log(`  Factory: ${route.factoryTypes.join(', ')}`);
        console.log(`  Methods: ${route.httpMethods.join(', ')}`);
    });
    console.log();

    // Generate migration checklist
    console.log('MIGRATION CHECKLIST');
    console.log('-'.repeat(80));
    console.log('Priority groups for migration:');
    console.log();

    const adminRoutes = needsMigration.filter(r => r.path.includes('/admin/'));
    const orgRoutes = needsMigration.filter(r => r.path.includes('/organizations/'));
    const courseRoutes = needsMigration.filter(r => r.path.includes('/courses/'));
    const eventRoutes = needsMigration.filter(r => r.path.includes('/events/'));
    const blogRoutes = needsMigration.filter(r => r.path.includes('/blog/'));
    const otherRoutes = needsMigration.filter(r =>
        !r.path.includes('/admin/') &&
        !r.path.includes('/organizations/') &&
        !r.path.includes('/courses/') &&
        !r.path.includes('/events/') &&
        !r.path.includes('/blog/')
    );

    if (adminRoutes.length > 0) {
        console.log(`\n1. Admin Routes (${adminRoutes.length} files)`);
        adminRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    if (courseRoutes.length > 0) {
        console.log(`\n2. Course Routes (${courseRoutes.length} files)`);
        courseRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    if (orgRoutes.length > 0) {
        console.log(`\n3. Organization Routes (${orgRoutes.length} files)`);
        orgRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    if (eventRoutes.length > 0) {
        console.log(`\n4. Event Routes (${eventRoutes.length} files)`);
        eventRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    if (blogRoutes.length > 0) {
        console.log(`\n5. Blog Routes (${blogRoutes.length} files)`);
        blogRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    if (otherRoutes.length > 0) {
        console.log(`\n6. Other Routes (${otherRoutes.length} files)`);
        otherRoutes.forEach(r => console.log(`   [ ] ${r.path}`));
    }

    console.log();
    console.log('='.repeat(80));
}

// Main execution
const apiDir = path.join(process.cwd(), 'app', 'api');
const routeFiles = getAllRouteFiles(apiDir);
const analyses = routeFiles.map(analyzeRouteFile);

generateReport(analyses);

// Write detailed JSON report
const reportPath = path.join(process.cwd(), 'route-factory-audit-report.json');
fs.writeFileSync(reportPath, JSON.stringify(analyses, null, 2));
console.log(`\nDetailed JSON report written to: route-factory-audit-report.json`);
