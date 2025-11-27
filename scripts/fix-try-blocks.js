const fs = require('fs');
const path = require('path');

// Function to fix double try blocks
function fixDoubleTryBlocks(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix double try blocks
  if (content.includes('try {\n    const params = await context.params;\n  try {')) {
    content = content.replace(
      /try \{\n    const params = await context\.params;\n  try \{/g,
      'try {\n    const params = await context.params;'
    );
    modified = true;
  }

  // Also fix any unclosed try blocks by looking for missing catch blocks
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Fixed double try blocks in: ${filePath}`);
  }
}

// Find all route files that were modified
const routeFiles = [
  'app/api/courses/[id]/modules/route.ts',
  'app/api/events/[id]/register/route.ts',
  'app/api/lessons/[id]/complete/route.ts',
  'app/api/organizations/[id]/members/route.ts',
  'app/api/payments/invoices/[id]/route.ts',
  'app/api/resources/[id]/download/route.ts',
  'app/api/resources/[id]/route.ts',
];

const baseDir = path.join(__dirname, '..');

for (const file of routeFiles) {
  const fullPath = path.join(baseDir, file);
  try {
    fixDoubleTryBlocks(fullPath);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

console.log('Done fixing try blocks!');