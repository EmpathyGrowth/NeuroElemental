/**
 * Orphaned Code Detector
 * 
 * Identifies unused exports and components by tracking
 * import/export relationships across the codebase.
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * Orphaned code report
 */
export interface OrphanedCodeReport {
  /** Unused exports */
  unusedExports: UnusedExport[];
  /** Unused files (no imports found) */
  unusedFiles: string[];
  /** Total exports analyzed */
  totalExports: number;
  /** Total files analyzed */
  totalFiles: number;
  /** Orphan percentage */
  orphanPercentage: number;
}

/**
 * Unused export information
 */
export interface UnusedExport {
  /** File containing the export */
  file: string;
  /** Export name */
  exportName: string;
  /** Whether it's a default export */
  isDefault: boolean;
}

/**
 * Import reference
 */
interface ImportRef {
  /** File that imports */
  importer: string;
  /** What is imported */
  imported: string;
  /** Source module */
  source: string;
}

/**
 * Export definition
 */
interface ExportDef {
  /** File containing export */
  file: string;
  /** Export name */
  name: string;
  /** Is default export */
  isDefault: boolean;
}

/**
 * Extract all imports from a file
 */
export function extractAllImports(content: string, filePath: string): ImportRef[] {
  const imports: ImportRef[] = [];

  // Named imports: import { foo, bar } from 'module'
  const namedImportPattern = /import\s*{\s*([^}]+)\s*}\s*from\s*['"]([^'"]+)['"]/g;
  let match;

  while ((match = namedImportPattern.exec(content)) !== null) {
    const names = match[1].split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[0].trim();
    });
    const source = match[2];

    for (const name of names) {
      if (name) {
        imports.push({ importer: filePath, imported: name, source });
      }
    }
  }

  // Default imports: import Foo from 'module'
  const defaultImportPattern = /import\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;
  while ((match = defaultImportPattern.exec(content)) !== null) {
    imports.push({
      importer: filePath,
      imported: 'default',
      source: match[2],
    });
  }

  // Namespace imports: import * as foo from 'module'
  const namespaceImportPattern = /import\s*\*\s*as\s+(\w+)\s+from\s*['"]([^'"]+)['"]/g;
  while ((match = namespaceImportPattern.exec(content)) !== null) {
    imports.push({
      importer: filePath,
      imported: '*',
      source: match[2],
    });
  }

  return imports;
}

/**
 * Extract all exports from a file
 */
export function extractAllExports(content: string, filePath: string): ExportDef[] {
  const exports: ExportDef[] = [];

  // Named exports: export const/function/class foo
  const namedExportPatterns = [
    /export\s+(?:const|let|var)\s+(\w+)/g,
    /export\s+function\s+(\w+)/g,
    /export\s+class\s+(\w+)/g,
    /export\s+interface\s+(\w+)/g,
    /export\s+type\s+(\w+)/g,
    /export\s+enum\s+(\w+)/g,
  ];

  for (const pattern of namedExportPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      exports.push({ file: filePath, name: match[1], isDefault: false });
    }
  }

  // Re-exports: export { foo, bar } from 'module'
  const reExportPattern = /export\s*{\s*([^}]+)\s*}(?:\s*from\s*['"][^'"]+['"])?/g;
  let match;
  while ((match = reExportPattern.exec(content)) !== null) {
    const names = match[1].split(',').map((n) => {
      const parts = n.trim().split(/\s+as\s+/);
      return parts[parts.length - 1].trim(); // Use the 'as' name if present
    });

    for (const name of names) {
      if (name && name !== 'default') {
        exports.push({ file: filePath, name, isDefault: false });
      }
    }
  }

  // Default exports
  if (
    content.includes('export default') ||
    /export\s*{\s*\w+\s+as\s+default\s*}/.test(content)
  ) {
    exports.push({ file: filePath, name: 'default', isDefault: true });
  }

  return exports;
}

/**
 * Resolve import source to file path
 */
export function resolveImportSource(
  source: string,
  importerPath: string,
  baseDir: string
): string | null {
  // Skip external packages
  if (!source.startsWith('.') && !source.startsWith('@/')) {
    return null;
  }

  let resolvedPath: string;

  if (source.startsWith('@/')) {
    // Alias import - resolve from base directory
    resolvedPath = path.join(baseDir, source.slice(2));
  } else {
    // Relative import
    const importerDir = path.dirname(importerPath);
    resolvedPath = path.join(importerDir, source);
  }

  // Try different extensions
  const extensions = ['.ts', '.tsx', '.js', '.jsx', '/index.ts', '/index.tsx'];

  for (const ext of extensions) {
    const fullPath = resolvedPath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }

  // Check if it's already a full path
  if (fs.existsSync(resolvedPath)) {
    return resolvedPath;
  }

  return null;
}

/**
 * Recursively find all TypeScript/JavaScript files
 */
function findAllFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = [];

  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip certain directories
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === '__tests__' ||
          entry.name === 'out' ||
          entry.name === '.next'
        ) {
          continue;
        }

        files.push(...findAllFiles(fullPath, baseDir));
      } else if (
        (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        !entry.name.endsWith('.d.ts') &&
        !entry.name.endsWith('.test.ts') &&
        !entry.name.endsWith('.test.tsx')
      ) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error);
  }

  return files;
}

/**
 * Detect orphaned code in the codebase
 */
export function detectOrphanedCode(
  baseDir: string = '.',
  excludeDirs: string[] = ['node_modules', '.next', 'out', '__tests__']
): OrphanedCodeReport {
  const allFiles = findAllFiles(baseDir, baseDir);
  const allExports: ExportDef[] = [];
  const allImports: ImportRef[] = [];

  // Collect all exports and imports
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      allExports.push(...extractAllExports(content, file));
      allImports.push(...extractAllImports(content, file));
    } catch {
      // Skip files that can't be read
    }
  }

  // Build a map of what's imported
  const importedExports = new Map<string, Set<string>>();

  for (const imp of allImports) {
    const resolvedSource = resolveImportSource(imp.source, imp.importer, baseDir);
    if (resolvedSource) {
      if (!importedExports.has(resolvedSource)) {
        importedExports.set(resolvedSource, new Set());
      }
      importedExports.get(resolvedSource)!.add(imp.imported);
    }
  }

  // Find unused exports
  const unusedExports: UnusedExport[] = [];
  const filesWithUsedExports = new Set<string>();

  for (const exp of allExports) {
    const fileImports = importedExports.get(exp.file);
    const isUsed =
      fileImports &&
      (fileImports.has(exp.name) ||
        fileImports.has('*') ||
        (exp.isDefault && fileImports.has('default')));

    if (isUsed) {
      filesWithUsedExports.add(exp.file);
    } else {
      // Check if it's an entry point (page.tsx, route.ts, layout.tsx)
      const isEntryPoint =
        exp.file.includes('page.tsx') ||
        exp.file.includes('route.ts') ||
        exp.file.includes('layout.tsx') ||
        exp.file.includes('loading.tsx') ||
        exp.file.includes('error.tsx');

      if (!isEntryPoint) {
        unusedExports.push({
          file: exp.file,
          exportName: exp.name,
          isDefault: exp.isDefault,
        });
      }
    }
  }

  // Find completely unused files
  const unusedFiles = allFiles.filter((file) => {
    // Skip entry points
    if (
      file.includes('page.tsx') ||
      file.includes('route.ts') ||
      file.includes('layout.tsx') ||
      file.includes('loading.tsx') ||
      file.includes('error.tsx') ||
      file.includes('index.ts')
    ) {
      return false;
    }

    return !filesWithUsedExports.has(file);
  });

  const orphanPercentage =
    allExports.length > 0
      ? Math.round((unusedExports.length / allExports.length) * 100)
      : 0;

  return {
    unusedExports,
    unusedFiles,
    totalExports: allExports.length,
    totalFiles: allFiles.length,
    orphanPercentage,
  };
}

/**
 * Get high-priority orphaned exports (likely dead code)
 */
export function getHighPriorityOrphans(report: OrphanedCodeReport): UnusedExport[] {
  // Filter to exports that are likely truly unused
  return report.unusedExports.filter((exp) => {
    // Skip type exports (often used implicitly)
    if (exp.exportName.endsWith('Type') || exp.exportName.endsWith('Props')) {
      return false;
    }
    // Skip index files (barrel exports)
    if (exp.file.includes('index.ts')) {
      return false;
    }
    return true;
  });
}
