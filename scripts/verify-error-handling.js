#!/usr/bin/env node

/**
 * Script to verify error handling standardization
 * 
 * Checks:
 * 1. All errors use ApiError or error factories
 * 2. errorResponse is used for all error returns
 * 3. Validation errors use validationError
 * 4. Not-found cases use notFoundError
 */

const fs = require('fs');
const glob = require('glob');

// Find all API route files
const routeFiles = glob.sync('app/api/**/*.ts', {
    ignore: ['**/*.test.ts', '**/__tests__/**']
});

console.log(`Verifying error handling in ${routeFiles.length} route files\n`);

const issues = {
    genericErrors: [],
    directErrorResponses: [],
    missingValidationError: [],
    missingNotFoundError: []
};

routeFiles.forEach(filePath => {
    const content = fs.readFileSync(filePath, 'utf8');

    // Skip files using route factory (they handle errors automatically)
    const usesFactory = content.includes('createAuthenticatedRoute') ||
        content.includes('createPublicRoute') ||
        content.includes('createAdminRoute');

    // Check for generic throw new Error()
    if (content.match(/throw new Error\(/)) {
        issues.genericErrors.push(filePath);
    }

    // Check for direct NextResponse.json({ error: ... }) without errorResponse
    // But allow it if it's not an error response (e.g., { provider: null })
    const directErrorMatches = content.match(/NextResponse\.json\(\s*\{\s*error:\s*[^}]+\}\s*,\s*\{\s*status:/g);
    if (directErrorMatches && directErrorMatches.length > 0) {
        issues.directErrorResponses.push(filePath);
    }

    // Check for validation patterns that should use validationError
    // Look for status 400 or 422 with validation-related messages
    const validationPatterns = [
        /required/i,
        /invalid/i,
        /must be/i,
        /should be/i
    ];

    const hasValidationLogic = validationPatterns.some(pattern => pattern.test(content));
    const usesValidationError = content.includes('validationError(');

    if (hasValidationLogic && !usesValidationError && !usesFactory) {
        issues.missingValidationError.push(filePath);
    }

    // Check for not-found patterns that should use notFoundError
    const hasNotFoundLogic = /not found|Not found|NOT_FOUND/i.test(content);
    const usesNotFoundError = content.includes('notFoundError(');

    if (hasNotFoundLogic && !usesNotFoundError && !usesFactory) {
        issues.missingNotFoundError.push(filePath);
    }
});

// Report results
console.log('=== Verification Results ===\n');

if (issues.genericErrors.length > 0) {
    console.log(`❌ Files with generic throw new Error() (${issues.genericErrors.length}):`);
    issues.genericErrors.forEach(file => console.log(`   - ${file}`));
    console.log();
} else {
    console.log('✅ No generic throw new Error() found');
}

if (issues.directErrorResponses.length > 0) {
    console.log(`⚠️  Files with direct NextResponse.json error responses (${issues.directErrorResponses.length}):`);
    issues.directErrorResponses.forEach(file => console.log(`   - ${file}`));
    console.log();
} else {
    console.log('✅ All error responses use errorResponse()');
}

if (issues.missingValidationError.length > 0) {
    console.log(`⚠️  Files with validation logic not using validationError() (${issues.missingValidationError.length}):`);
    issues.missingValidationError.forEach(file => console.log(`   - ${file}`));
    console.log();
} else {
    console.log('✅ All validation errors use validationError()');
}

if (issues.missingNotFoundError.length > 0) {
    console.log(`⚠️  Files with not-found logic not using notFoundError() (${issues.missingNotFoundError.length}):`);
    issues.missingNotFoundError.forEach(file => console.log(`   - ${file}`));
    console.log();
} else {
    console.log('✅ All not-found cases use notFoundError()');
}

const totalIssues = issues.genericErrors.length +
    issues.directErrorResponses.length +
    issues.missingValidationError.length +
    issues.missingNotFoundError.length;

console.log('\n=== Summary ===');
console.log(`Total files checked: ${routeFiles.length}`);
console.log(`Files with issues: ${totalIssues}`);
console.log(`Files compliant: ${routeFiles.length - totalIssues}`);

if (totalIssues === 0) {
    console.log('\n🎉 All routes use standardized error handling!');
    process.exit(0);
} else {
    console.log('\n⚠️  Some routes need attention');
    process.exit(1);
}
