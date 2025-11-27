const fs = require('fs');
const path = require('path');

// Function to fix route handler files
function fixRouteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Check if it's already fixed
  if (content.includes('RouteContext')) {
    console.log(`Already fixed: ${filePath}`);
    return;
  }

  // Check if file has route handlers with params
  if (content.includes('{ params }: { params: {')) {
    // Add import for RouteContext
    if (!content.includes("import { RouteContext }")) {
      content = content.replace(
        "import { NextRequest, NextResponse } from 'next/server';",
        "import { NextRequest, NextResponse } from 'next/server';\nimport { RouteContext } from '@/lib/types/api';"
      );
      modified = true;
    }

    // Fix GET function
    content = content.replace(
      /export async function GET\(\s*request: NextRequest,\s*{ params }: { params: ({[^}]+}) }\s*\)/g,
      'export async function GET(\n  request: NextRequest,\n  context: RouteContext<$1>\n)'
    );

    // Fix POST function
    content = content.replace(
      /export async function POST\(\s*request: NextRequest,\s*{ params }: { params: ({[^}]+}) }\s*\)/g,
      'export async function POST(\n  request: NextRequest,\n  context: RouteContext<$1>\n)'
    );

    // Fix PUT function
    content = content.replace(
      /export async function PUT\(\s*request: NextRequest,\s*{ params }: { params: ({[^}]+}) }\s*\)/g,
      'export async function PUT(\n  request: NextRequest,\n  context: RouteContext<$1>\n)'
    );

    // Fix DELETE function
    content = content.replace(
      /export async function DELETE\(\s*request: NextRequest,\s*{ params }: { params: ({[^}]+}) }\s*\)/g,
      'export async function DELETE(\n  request: NextRequest,\n  context: RouteContext<$1>\n)'
    );

    // Fix PATCH function
    content = content.replace(
      /export async function PATCH\(\s*request: NextRequest,\s*{ params }: { params: ({[^}]+}) }\s*\)/g,
      'export async function PATCH(\n  request: NextRequest,\n  context: RouteContext<$1>\n)'
    );

    // Add await for params usage after function definitions
    const functionRegex = /export async function (GET|POST|PUT|DELETE|PATCH)\([^)]+\)\s*{/g;
    let match;
    const positions = [];

    while ((match = functionRegex.exec(content)) !== null) {
      positions.push(match.index + match[0].length);
    }

    // Insert await params line after each function opening
    for (let i = positions.length - 1; i >= 0; i--) {
      const pos = positions[i];
      const beforeBrace = content.substring(0, pos);
      const afterBrace = content.substring(pos);

      // Check if params is used in this function
      const nextFunctionIndex = content.indexOf('export async function', pos);
      const functionBody = nextFunctionIndex === -1
        ? afterBrace
        : afterBrace.substring(0, nextFunctionIndex - pos);

      if (functionBody.includes('params.')) {
        // Add await params line if not already there
        if (!functionBody.includes('const params = await context.params')) {
          content = beforeBrace + '\n  try {\n    const params = await context.params;' + afterBrace;

          // Fix the closing of try block
          const tryIndex = beforeBrace.length;
          let braceCount = 0;
          let inTry = false;
          let catchIndex = -1;

          for (let j = tryIndex; j < content.length; j++) {
            if (content.substring(j, j + 5) === 'try {') {
              inTry = true;
              continue;
            }
            if (inTry) {
              if (content[j] === '{') braceCount++;
              if (content[j] === '}') braceCount--;
              if (content.substring(j, j + 8) === '} catch ') {
                catchIndex = j;
                break;
              }
            }
          }

          modified = true;
        }
      }
    }

    if (modified) {
      // Clean up extra try blocks if needed
      content = content.replace(/try {\s+try {/g, 'try {');

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Fixed: ${filePath}`);
    } else {
      console.log(`No changes needed: ${filePath}`);
    }
  }
}

// Find all route.ts files in api directory
function findRouteFiles(dir) {
  const files = [];
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

  return files;
}

// Main execution
const apiDir = path.join(__dirname, '..', 'app', 'api');
const routeFiles = findRouteFiles(apiDir);

console.log(`Found ${routeFiles.length} route files to check...`);

for (const file of routeFiles) {
  try {
    fixRouteFile(file);
  } catch (error) {
    console.error(`Error fixing ${file}:`, error.message);
  }
}

console.log('Done!');