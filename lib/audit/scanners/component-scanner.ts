/**
 * Component Scanner
 * 
 * Scans the components directory for duplication patterns
 * and identifies similar component implementations.
 */

import * as fs from 'fs';
import * as path from 'path';
import { ComponentInfo, ComponentInventory, DuplicateGroup } from '../types';

/**
 * Minimum lines for duplicate detection
 */
const MIN_DUPLICATE_LINES = 20;

/**
 * Minimum similarity percentage for duplicate detection
 */
const MIN_SIMILARITY_PERCENTAGE = 80;

/**
 * Extract component name from file path
 */
export function extractComponentName(filePath: string): string {
  const basename = path.basename(filePath, path.extname(filePath));
  // Convert kebab-case to PascalCase
  return basename
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * Extract exports from component content
 */
export function extractExports(content: string): string[] {
  const exports: string[] = [];
  
  // Match export const/function/class declarations
  const exportPatterns = [
    /export\s+(?:const|let|var)\s+(\w+)/g,
    /export\s+function\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+default\s+function\s+(\w+)/g,
    /export\s+default\s+class\s+(\w+)/g,
    /export\s+{\s*([^}]+)\s*}/g,
  ];

  for (const pattern of exportPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (match[1]) {
        // Handle named exports in braces
        if (match[1].includes(',')) {
          const names = match[1].split(',').map((n) => n.trim().split(' ')[0]);
          exports.push(...names);
        } else {
          exports.push(match[1].trim());
        }
      }
    }
  }

  return [...new Set(exports)];
}

/**
 * Extract imports from component content
 */
export function extractImports(content: string): string[] {
  const imports: string[] = [];
  
  // Match import statements
  const importPattern = /import\s+(?:{[^}]+}|[\w*]+)\s+from\s+['"]([^'"]+)['"]/g;
  
  let match;
  while ((match = importPattern.exec(content)) !== null) {
    if (match[1]) {
      imports.push(match[1]);
    }
  }

  return imports;
}

/**
 * Count lines in content (excluding empty lines and comments)
 */
export function countSignificantLines(content: string): number {
  const lines = content.split('\n');
  let count = 0;
  let inBlockComment = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Handle block comments
    if (trimmed.startsWith('/*')) {
      inBlockComment = true;
    }
    if (trimmed.endsWith('*/')) {
      inBlockComment = false;
      continue;
    }
    if (inBlockComment) {
      continue;
    }

    // Skip empty lines and single-line comments
    if (trimmed === '' || trimmed.startsWith('//')) {
      continue;
    }

    count++;
  }

  return count;
}

/**
 * Normalize content for comparison (remove whitespace, comments, etc.)
 */
export function normalizeContent(content: string): string {
  return content
    // Remove single-line comments
    .replace(/\/\/.*$/gm, '')
    // Remove multi-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '')
    // Remove import statements
    .replace(/import\s+.*?from\s+['"][^'"]+['"];?\n?/g, '')
    // Remove export keywords
    .replace(/export\s+(default\s+)?/g, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculate similarity between two strings using Jaccard similarity
 */
export function calculateSimilarity(content1: string, content2: string): number {
  const normalized1 = normalizeContent(content1);
  const normalized2 = normalizeContent(content2);

  // Split into tokens (words/identifiers)
  const tokens1 = new Set(normalized1.split(/\s+/).filter(Boolean));
  const tokens2 = new Set(normalized2.split(/\s+/).filter(Boolean));

  if (tokens1.size === 0 && tokens2.size === 0) {
    return 100;
  }

  // Calculate Jaccard similarity
  const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
  const union = new Set([...tokens1, ...tokens2]);

  return Math.round((intersection.size / union.size) * 100);
}

/**
 * Find shared lines between two contents
 */
export function findSharedLines(content1: string, content2: string): number {
  const lines1 = content1.split('\n').map((l) => l.trim()).filter(Boolean);
  const lines2 = new Set(content2.split('\n').map((l) => l.trim()).filter(Boolean));

  return lines1.filter((line) => lines2.has(line)).length;
}

/**
 * Recursively find all component files
 */
function findComponentFiles(dir: string, baseDir: string = dir): string[] {
  const components: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and test directories
        if (entry.name.startsWith('.') || entry.name === '__tests__' || entry.name === 'node_modules') {
          continue;
        }

        components.push(...findComponentFiles(fullPath, baseDir));
      } else if (
        (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) &&
        !entry.name.endsWith('.test.tsx') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.d.ts')
      ) {
        const relativePath = path.relative(baseDir, fullPath);
        components.push(relativePath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return components;
}

/**
 * Scan a single component file
 */
export function scanComponentFile(filePath: string): ComponentInfo | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    return {
      path: filePath,
      name: extractComponentName(filePath),
      lineCount: countSignificantLines(content),
      exports: extractExports(content),
      imports: extractImports(content),
    };
  } catch (error) {
    console.error(`Error reading component file ${filePath}:`, error);
    return null;
  }
}

/**
 * Find duplicate groups among components
 */
export function findDuplicateGroups(
  components: ComponentInfo[],
  componentsDir: string
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const processed = new Set<string>();

  for (let i = 0; i < components.length; i++) {
    if (processed.has(components[i].path)) {
      continue;
    }

    const group: ComponentInfo[] = [components[i]];
    let maxSimilarity = 0;
    let maxSharedLines = 0;

    try {
      const content1 = fs.readFileSync(
        path.join(componentsDir, components[i].path),
        'utf-8'
      );

      for (let j = i + 1; j < components.length; j++) {
        if (processed.has(components[j].path)) {
          continue;
        }

        try {
          const content2 = fs.readFileSync(
            path.join(componentsDir, components[j].path),
            'utf-8'
          );

          const similarity = calculateSimilarity(content1, content2);
          const sharedLines = findSharedLines(content1, content2);

          if (
            similarity >= MIN_SIMILARITY_PERCENTAGE &&
            sharedLines >= MIN_DUPLICATE_LINES
          ) {
            group.push(components[j]);
            processed.add(components[j].path);
            maxSimilarity = Math.max(maxSimilarity, similarity);
            maxSharedLines = Math.max(maxSharedLines, sharedLines);
          }
        } catch {
          // Skip files that can't be read
        }
      }
    } catch {
      // Skip files that can't be read
    }

    if (group.length > 1) {
      groups.push({
        components: group,
        similarity: maxSimilarity,
        sharedLines: maxSharedLines,
      });
      processed.add(components[i].path);
    }
  }

  return groups;
}

/**
 * Scan the components directory
 */
export function scanComponents(componentsDir: string = 'components'): ComponentInventory {
  const componentFiles = findComponentFiles(componentsDir, componentsDir);
  const components: ComponentInfo[] = [];

  for (const filePath of componentFiles) {
    const fullPath = path.join(componentsDir, filePath);
    const componentInfo = scanComponentFile(fullPath);

    if (componentInfo) {
      componentInfo.path = filePath;
      components.push(componentInfo);
    }
  }

  const duplicateGroups = findDuplicateGroups(components, componentsDir);

  return {
    components,
    duplicateGroups,
    totalCount: components.length,
  };
}

/**
 * Get large components (over a certain line count)
 */
export function getLargeComponents(
  inventory: ComponentInventory,
  threshold: number = 300
): ComponentInfo[] {
  return inventory.components.filter((c) => c.lineCount > threshold);
}

/**
 * Get components with many exports (potential barrel files or utilities)
 */
export function getComponentsWithManyExports(
  inventory: ComponentInventory,
  threshold: number = 10
): ComponentInfo[] {
  return inventory.components.filter((c) => c.exports.length > threshold);
}
