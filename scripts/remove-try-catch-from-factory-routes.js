/**
 * Script to remove redundant try-catch blocks from factory-wrapped routes
 * 
 * The factory pattern (createAuthenticatedRoute, createPublicRoute, createAdminRoute)
 * already handles errors automatically, so manual try-catch blocks are redundant.
 */

const fs = require('fs');
const path = require('path');

// List of files with try-catch violations
const filesToFix = [
    'app/api/assessment/submit/route.ts',
    'app/api/cron/check-low-credits/route.ts',
    'app/api/cron/process-audit-exports/route.ts',
    'app/api/cron/process-data-exports/route.ts',
    'app/api/dashboard/instructor/route.ts',
    'app/api/dashboard/student/route.ts',
    'app/api/export/analytics/route.ts',
    'app/api/export/certificates/route.ts',
    'app/api/export/user-data/route.ts',
    'app/api/payments/history/route.ts',
    'app/api/products/route.ts',
    'app/api/resources/route.ts',
    'app/api/reviews/route.ts',
    'app/api/stripe/webhook/route.ts',
    'app/api/uploads/route.ts',
];

function removeTryCatchFromHandler(content, method) {
    // Pattern to match the entire handler function
    const handlerPattern = new RegExp(
        `(export\\s+const\\s+${method}\\s*=\\s*create(?:Authenticated|Public|Admin)Route\\s*\\(\\s*async\\s*\\([^)]*\\)\\s*=>\\s*{)\\s*try\\s*{([\\s\\S]*?)}\\s*catch\\s*\\([^)]*\\)\\s*{[\\s\\S]*?return\\s+errorResponse\\([^)]*\\);?\\s*}(\\s*}\\s*\\);?)`,
        'g'
    );

    return content.replace(handlerPattern, (match, prefix, body, suffix) => {
        // Remove one level of indentation from the body
        const unindentedBody = body.split('\\n').map(line => {
            // Remove 2 spaces or 1 tab from the beginning of each line
            if (line.startsWith('  ')) {
                return line.substring(2);
            } else if (line.startsWith('\\t')) {
                return line.substring(1);
            }
            return line;
        }).join('\\n');

        return `${prefix}${unindentedBody}${suffix}`;
    });
}

function fixFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  File not found: ${filePath}`);
        return false;
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;

    // Try to remove try-catch for each HTTP method
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    for (const method of methods) {
        content = removeTryCatchFromHandler(content, method);
    }

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf-8');
        console.log(`✅ Fixed: ${filePath}`);
        return true;
    } else {
        console.log(`ℹ️  No changes needed: ${filePath}`);
        return false;
    }
}

console.log('Removing redundant try-catch blocks from factory-wrapped routes...\\n');

let fixedCount = 0;
for (const file of filesToFix) {
    if (fixFile(file)) {
        fixedCount++;
    }
}

console.log(`\\n✨ Fixed ${fixedCount} out of ${filesToFix.length} files`);
