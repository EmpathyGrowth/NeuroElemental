const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = 'C:\\Users\\Jannik\\Documents\\GitHub\\NeuroElemental';

// Get all TypeScript files excluding node_modules
function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

let asAnyCount = 0;
let filesModified = new Set();

console.log('Scanning for "as any" in Supabase operations...\n');

const files = getAllTsFiles(baseDir);

files.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;
    let fileModified = false;

    // Pattern 1: .insert(data as any)
    const insertPattern = /\.insert\(([^)]+)\s+as\s+any\)/g;
    if (insertPattern.test(content)) {
      content = content.replace(/\.insert\(([^)]+)\s+as\s+any\)/g, '.insert($1)');
      fileModified = true;
    }

    // Pattern 2: .update(data as any)
    const updatePattern = /\.update\(([^)]+)\s+as\s+any\)/g;
    if (updatePattern.test(content)) {
      content = content.replace(/\.update\(([^)]+)\s+as\s+any\)/g, '.update($1)');
      fileModified = true;
    }

    // Pattern 3: .upsert(data as any)
    const upsertPattern = /\.upsert\(([^)]+)\s+as\s+any\)/g;
    if (upsertPattern.test(content)) {
      content = content.replace(/\.upsert\(([^)]+)\s+as\s+any\)/g, '.upsert($1)');
      fileModified = true;
    }

    // Pattern 4: (supabase.from('table') as any)
    const fromAsAnyPattern = /\(supabase\.from\([^)]+\)\s+as\s+any\)/g;
    if (fromAsAnyPattern.test(content)) {
      content = content.replace(/\(supabase\.from\(([^)]+)\)\s+as\s+any\)/g, 'supabase.from($1)');
      fileModified = true;
    }

    // Pattern 5: (table as any).select/update/insert
    const tableAsAnyPattern = /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)\s*\.(select|update|insert|upsert|delete)/g;
    if (tableAsAnyPattern.test(content)) {
      content = content.replace(/\(([a-zA-Z_$][a-zA-Z0-9_$]*)\s+as\s+any\)\s*\.(select|update|insert|upsert|delete)/g, '$1.$2');
      fileModified = true;
    }

    if (fileModified && content !== originalContent) {
      // Count the number of "as any" removed in this file
      const originalCount = (originalContent.match(/\bas\s+any\b/g) || []).length;
      const newCount = (content.match(/\bas\s+any\b/g) || []).length;
      const removed = originalCount - newCount;

      if (removed > 0) {
        fs.writeFileSync(filePath, content, 'utf8');
        asAnyCount += removed;
        filesModified.add(filePath.replace(baseDir + '\\', ''));
        console.log(`✓ Removed ${removed} 'as any' from: ${filePath.replace(baseDir + '\\', '')}`);
      }
    }
  } catch (err) {
    console.error(`✗ Error processing ${filePath}: ${err.message}`);
  }
});

console.log(`\n${asAnyCount} 'as any' assertions removed from ${filesModified.size} files\n`);
