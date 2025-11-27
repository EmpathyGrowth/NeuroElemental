const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Fix pattern 1: Double try at function start
    content = content.replace(
      /\) \{\n  try \{\n    const params = await context\.params;\n  try \{/g,
      ') {\n  try {\n    const params = await context.params;'
    );

    // Fix pattern 2: Alternative spacing
    content = content.replace(
      /\) \{\s*\n\s*try \{\s*\n\s*const params = await context\.params;\s*\n\s*try \{/g,
      ') {\n  try {\n    const params = await context.params;'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

function findRouteFiles(dir) {
  const files = [];
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        files.push(...findRouteFiles(fullPath));
      } else if (item === 'route.ts') {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories we can't read
  }
  return files;
}

// Main execution
const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Checking ${routeFiles.length} route files...`);

let fixedCount = 0;
for (const file of routeFiles) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files.`);