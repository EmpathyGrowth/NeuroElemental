// Fix all remaining unauthorizedError, forbiddenError, and other non-wrapped error returns
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const basePath = process.cwd();

// Find all files with unwrapped error returns
console.log('Searching for unwrapped error returns...');

const errorPatterns = [
  'return unauthorizedError',
  'return forbiddenError',
  'return notFoundError',
  'return badRequestError',
];

const filesToFix = new Set();

errorPatterns.forEach(pattern => {
  try {
    const result = execSync(
      `findstr /S /I /C:"${pattern}" "${path.join(basePath, 'app', 'api')}\\*.ts"`,
      { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
    ).toString();

    result.split('\n').forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        const filePath = match[1].trim();
        if (filePath.endsWith('.ts')) {
          filesToFix.add(path.relative(basePath, filePath));
        }
      }
    });
  } catch (e) {
    // No matches found for this pattern
  }
});

console.log(`Found ${filesToFix.size} files to fix`);

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix unwrapped error returns
  const patterns = [
    { find: /return (unauthorizedError\([^)]*\));?/g, replace: 'return errorResponse($1);' },
    { find: /return (forbiddenError\([^)]*\));?/g, replace: 'return errorResponse($1);' },
    { find: /return (notFoundError\([^)]*\));?/g, replace: 'return errorResponse($1);' },
    { find: /return (badRequestError\([^)]*\) );?/g, replace: 'return errorResponse($1);' },
  ];

  patterns.forEach(({ find, replace }) => {
    if (content.match(find)) {
      content = content.replace(find, replace);
      changed = true;
    }
  });

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed ${file}`);
  }
});

console.log('\nScript complete!');
