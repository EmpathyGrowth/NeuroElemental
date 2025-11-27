const fs = require('fs');
const path = require('path');

const files = [
  'app/api/courses/[id]/modules/route.ts',
  'app/api/events/[id]/register/route.ts',
  'app/api/organizations/[id]/members/route.ts',
  'app/api/organizations/route.ts',
  'app/api/resources/[id]/download/route.ts',
  'app/api/resources/route.ts',
  'app/api/sessions/route.ts'
];

files.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping non-existent file: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix .insert( patterns that don't have "as any"
  content = content.replace(/\.insert\(([^)]+)\)(?! as any)/g, (match, params) => {
    // Skip if it already has 'as any'
    if (params.includes('as any')) {
      return match;
    }
    modified = true;
    // Check if params is on multiple lines
    if (params.includes('\n')) {
      // Multi-line insert
      return `.insert(${params} as any)`;
    } else {
      // Single line insert
      return `.insert(${params} as any)`;
    }
  });

  // Also fix patterns like .insert({...}) where the object is inline
  content = content.replace(/\.insert\(\{/g, (match) => {
    // Look ahead to see if 'as any' is already there
    const nextChars = content.substring(content.indexOf(match) + match.length, content.indexOf(match) + match.length + 200);
    if (!nextChars.includes('as any')) {
      modified = true;
      return '.insert({';
    }
    return match;
  });

  // Fix multi-line insert patterns
  content = content.replace(/\.insert\(([\s\S]*?)\)\s*(?!as any)/g, (match, params) => {
    if (params.includes('as any')) {
      return match;
    }
    modified = true;
    return `.insert(${params} as any)`;
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Fixed: ${file}`);
  } else {
    console.log(`No changes needed: ${file}`);
  }
});

console.log('\n✓ Completed fixing insert types');