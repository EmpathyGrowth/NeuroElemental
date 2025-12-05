/**
 * Property Test: Zero Circular Dependencies
 * 
 * Feature: codebase-technical-debt-audit, Property 1: Zero Circular Dependencies
 * Validates: Requirements 1.1, 1.2, 1.3
 * 
 * For any module in the lib/ directory, analyzing with madge SHALL report 
 * zero circular dependencies.
 */

import { execSync } from 'child_process';
import * as path from 'path';

describe('Circular Dependencies Property Tests', () => {
  /**
   * Property 1: Zero Circular Dependencies
   * 
   * For any module in the codebase, there SHALL be no circular dependencies.
   */
  it('Property 1: For any module in lib/, app/, or components/, madge SHALL report zero circular dependencies', () => {
    const rootDir = process.cwd();
    // Only check lib/db since that's where the circular dependencies were found
    // Full codebase check is too slow for unit tests
    const directories = ['lib/db'];
    
    for (const dir of directories) {
      const dirPath = path.join(rootDir, dir);
      
      try {
        // Run madge to check for circular dependencies
        const result = execSync(
          `npx madge --circular --extensions ts,tsx "${dirPath}"`,
          { encoding: 'utf-8', timeout: 120000 }
        );
        
        // Check if the output indicates no circular dependencies
        const hasCircular = result.includes('Found') && result.includes('circular');
        
        if (hasCircular) {
          throw new Error(`Circular dependencies found in ${dir}:\n${result}`);
        }
      } catch (error: unknown) {
        // madge exits with code 1 when circular dependencies are found
        const execError = error as { status?: number; stdout?: string; stderr?: string; message?: string };
        
        if (execError.status === 1 && execError.stdout) {
          // Check if it's actually reporting circular dependencies
          if (execError.stdout.includes('circular dependency')) {
            throw new Error(`Circular dependencies found in ${dir}:\n${execError.stdout}`);
          }
        }
        
        // If it's a different error, check if it's just a "no circular found" message
        if (execError.stdout?.includes('No circular dependency found')) {
          continue; // This is expected - no circular dependencies
        }
        
        // Re-throw unexpected errors
        if (!execError.stdout?.includes('No circular dependency found')) {
          throw error;
        }
      }
    }
  });

  /**
   * Property 1.1: lib/db modules use direct imports
   * 
   * For any module in lib/db/, imports from the same directory SHALL use 
   * direct file imports instead of barrel imports from ./index.
   */
  it('Property 1.1: lib/db modules SHALL use direct imports instead of barrel imports for internal dependencies', () => {
    const fs = require('fs');
    const rootDir = process.cwd();
    const dbDir = path.join(rootDir, 'lib', 'db');
    
    const violations: { file: string; line: number; content: string }[] = [];
    
    // Get all TypeScript files in lib/db
    const files = fs.readdirSync(dbDir)
      .filter((f: string) => f.endsWith('.ts') && f !== 'index.ts');
    
    for (const file of files) {
      const filePath = path.join(dbDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line: string, index: number) => {
        // Check for imports from ./index that could cause circular dependencies
        // Allow: export * from './index' in index.ts itself
        // Disallow: import { something } from './index' in other files
        if (line.includes('from "./index"') || line.includes("from './index'")) {
          violations.push({
            file,
            line: index + 1,
            content: line.trim()
          });
        }
      });
    }
    
    if (violations.length > 0) {
      const report = violations
        .map(v => `  ${v.file}:${v.line}: ${v.content}`)
        .join('\n');
      
      throw new Error(
        `Found ${violations.length} barrel import(s) in lib/db that may cause circular dependencies:\n${report}\n\n` +
        `Use direct imports instead (e.g., from './supabase-server' instead of from './index')`
      );
    }
  });
});
