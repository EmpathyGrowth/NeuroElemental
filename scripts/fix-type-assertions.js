const fs = require('fs');
const path = require('path');

const apiDir = path.join(process.cwd(), 'app', 'api');

// Supabase table to type mappings
const tableTypeMap = {
  'profiles': 'profiles',
  'courses': 'courses',
  'course_lessons': 'course_lessons',
  'course_modules': 'course_modules',
  'lesson_completions': 'lesson_completions',
  'enrollments': 'enrollments',
  'events': 'events',
  'event_registrations': 'event_registrations',
  'payments': 'payments',
  'invoices': 'invoices',
  'organizations': 'organizations',
  'organization_members': 'organization_members',
  'resources': 'resources',
  'resource_downloads': 'resource_downloads',
  'resource_purchases': 'resource_purchases',
  'notifications': 'notifications',
  'assessments': 'assessments',
  'assessment_results': 'assessment_results',
  'reviews': 'reviews',
  'certifications': 'certifications',
  'sessions': 'sessions',
  'subscriptions': 'subscriptions',
  'scheduled_emails': 'scheduled_emails',
  'email_preferences': 'email_preferences',
  'logs': 'logs',
  'course_progress': 'course_progress',
};

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

    // Fix destructured data assignments with proper type assertion
    // Pattern: const { data: varName } = await supabase.from('table')...
    content = content.replace(
      /const { data: (\w+)(.*?) } = await supabase\s*\n?\s*\.from\('([^']+)'\)/gm,
      (match, varName, rest, tableName) => {
        if (tableTypeMap[tableName]) {
          return `const { data: ${varName}${rest} } = await supabase
      .from('${tableName}')`;
        }
        return match;
      }
    );

    // Add type assertion after queries
    content = content.replace(
      /const { data(: \w+)?, error(: \w+)? } = await supabase\s*\n?\s*\.from\('([^']+)'\)([\s\S]*?)(?=\n\s*(if|const|let|return|\/\/|\}|$))/gm,
      (match, dataVar, errorVar, tableName, queryChain) => {
        if (tableTypeMap[tableName]) {
          const varName = dataVar ? dataVar.replace(':', '').trim() : '';
          const errorName = errorVar ? errorVar.replace(':', '').trim() : '';

          // Check if it's a single() query
          const isSingle = queryChain.includes('.single()');

          // Build the replacement
          let replacement = `const { data${dataVar || ''}, error${errorVar || ''} } = await supabase
      .from('${tableName}')${queryChain}`;

          // Add type assertion comment if needed
          if (varName) {
            replacement += ` as { data: Tables<'${tableName}'>${isSingle ? ' | null' : '[] | null'}, error: any }`;
          }

          return replacement;
        }
        return match;
      }
    );

    // Fix specific patterns where property access on 'never' occurs
    Object.keys(tableTypeMap).forEach(table => {
      // Fix patterns like: data?.map(item => item.property)
      const mapPattern = new RegExp(`(\\w+)\\?\\.map\\(\\(?(\\w+)\\)?\\s*=>\\s*\\2\\.`, 'g');
      content = content.replace(mapPattern, (match, dataVar, itemVar) => {
        // Check if this data variable comes from the table
        if (content.includes(`.from('${table}')`)) {
          return `(${dataVar} as Tables<'${table}'>[] | null)?.map((${itemVar}: Tables<'${table}'>) => ${itemVar}.`;
        }
        return match;
      });

      // Fix direct property access: data.property
      const propPattern = new RegExp(`(\\w+)\\.(\\w+)`, 'g');
      content = content.replace(propPattern, (match, obj, prop) => {
        // Only fix if it's likely a database result object
        if (content.includes(`const { data: ${obj}`) && content.includes(`.from('${table}')`)) {
          return `(${obj} as Tables<'${table}'>).${prop}`;
        }
        return match;
      });
    });

    // Save if modified
    const before = content;
    if (before !== content) {
      fs.writeFileSync(filePath, content, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      console.log(`✓ Fixed: ${relativePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

console.log('Fixing type assertions in API files...\n');

const apiFiles = getAllApiFiles(apiDir);
let fixedCount = 0;

apiFiles.forEach(file => {
  if (fixFile(file)) {
    fixedCount++;
  }
});

console.log(`\n✓ Fixed ${fixedCount} files`);