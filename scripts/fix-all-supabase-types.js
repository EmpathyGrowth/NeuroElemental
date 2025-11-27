const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

// Map of files and specific type fixes needed
const typeFixPatterns = [
  // Generic patterns for all files
  {
    pattern: /const supabase = createClient\(\)/g,
    replacement: 'const supabase = createTypedClient()'
  },
  {
    pattern: /from '@\/lib\/auth\/supabase-server'/g,
    replacement: "from '@/lib/auth/supabase-typed'"
  },
  {
    pattern: /import { createClient } from '@\/lib\/auth\/supabase-server';/g,
    replacement: "import { createTypedClient, Tables, InsertTables, UpdateTables } from '@/lib/auth/supabase-typed';"
  },
  // Add type assertions for common patterns
  {
    pattern: /\.from\('([^']+)'\)\s*\.select\(/g,
    replacement: (match, tableName) => {
      return `.from('${tableName}')\n      .select<'*', Tables<'${tableName}'>>(`;
    }
  },
  {
    pattern: /\.from\('([^']+)'\)\s*\.insert\(/g,
    replacement: (match, tableName) => {
      return `.from('${tableName}')\n      .insert<InsertTables<'${tableName}'>>(`;
    }
  },
  {
    pattern: /\.from\('([^']+)'\)\s*\.update\(/g,
    replacement: (match, tableName) => {
      return `.from('${tableName}')\n      .update<UpdateTables<'${tableName}'>>(`;
    }
  }
];

function getAllApiFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllApiFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && file !== 'route.test.ts') {
      fileList.push(filePath);
    }
  });

  return fileList;
}

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if file already has typed imports
    if (!content.includes("from '@/lib/auth/supabase-typed'") &&
        content.includes('supabase')) {

      // Add import if missing
      if (!content.includes("Tables, InsertTables")) {
        if (content.includes("from 'next/server'")) {
          content = content.replace(
            "from 'next/server';",
            `from 'next/server';
import { createTypedClient, Tables, InsertTables, UpdateTables } from '@/lib/auth/supabase-typed';`
          );
          modified = true;
        }
      }

      // Apply all patterns
      typeFixPatterns.forEach(({ pattern, replacement }) => {
        const before = content;
        if (typeof replacement === 'function') {
          content = content.replace(pattern, replacement);
        } else {
          content = content.replace(pattern, replacement);
        }
        if (before !== content) modified = true;
      });

      // Fix specific patterns
      content = content.replace(/const supabase = createClient\(\)/g,
                               'const supabase = createTypedClient()');

      // Add type assertions for data destructuring
      content = content.replace(
        /const { data: (\w+)(,| })/g,
        (match, varName, ending) => {
          // Try to infer table name from context
          const lines = content.split('\n');
          const lineIndex = lines.findIndex(line => line.includes(match));

          if (lineIndex > 0) {
            // Look for .from() call in previous lines
            for (let i = lineIndex - 1; i >= Math.max(0, lineIndex - 10); i--) {
              const fromMatch = lines[i].match(/\.from\('([^']+)'\)/);
              if (fromMatch) {
                const tableName = fromMatch[1];
                return `const { data: ${varName}${ending} /* Tables<'${tableName}'>[] */`;
              }
            }
          }
          return match;
        }
      );

      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        const relativePath = path.relative(process.cwd(), filePath);
        console.log(`✓ Fixed: ${relativePath}`);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('Scanning for API files to fix...\n');

const apiFiles = getAllApiFiles(apiDir);
console.log(`Found ${apiFiles.length} API files\n`);

let fixedCount = 0;
apiFiles.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);
console.log(`Total API files: ${apiFiles.length}`);