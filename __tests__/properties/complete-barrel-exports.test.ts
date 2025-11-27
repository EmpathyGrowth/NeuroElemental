/**
 * Property-Based Tests for Complete Barrel Exports
 * 
 * Feature: codebase-cleanup-optimization
 * 
 * These tests verify that all utilities from lib/api/* files are properly
 * exported through the lib/api/index.ts barrel export.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

/**
 * Exports that are intentionally not re-exported from the barrel.
 * These are typically deprecated functions that should not be used.
 */
const EXCLUDED_EXPORTS = [
    'withAdmin',  // Deprecated - use createAdminRoute instead
    'withAuth',   // Deprecated - use createAuthenticatedRoute instead
]

describe('Complete Barrel Exports Properties', () => {
    /**
     * Helper to extract exported identifiers from a TypeScript file
     */
    function extractExportedIdentifiers(filePath: string): Set<string> {
        const content = fs.readFileSync(filePath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            filePath,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        const exports = new Set<string>();

        function visit(node: ts.Node) {
            // Export declarations: export { foo, bar }
            if (ts.isExportDeclaration(node)) {
                if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(element => {
                        exports.add(element.name.text);
                    });
                }
            }

            // Function declarations: export function foo() {}
            if (ts.isFunctionDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                if (node.name) {
                    exports.add(node.name.text);
                }
            }

            // Variable declarations: export const foo = ...
            if (ts.isVariableStatement(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                node.declarationList.declarations.forEach(decl => {
                    if (ts.isIdentifier(decl.name)) {
                        exports.add(decl.name.text);
                    }
                });
            }

            // Class declarations: export class Foo {}
            if (ts.isClassDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                if (node.name) {
                    exports.add(node.name.text);
                }
            }

            // Interface declarations: export interface Foo {}
            if (ts.isInterfaceDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                exports.add(node.name.text);
            }

            // Type alias declarations: export type Foo = ...
            if (ts.isTypeAliasDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                exports.add(node.name.text);
            }

            // Enum declarations: export enum Foo {}
            if (ts.isEnumDeclaration(node) &&
                node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
                exports.add(node.name.text);
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return exports;
    }

    /**
     * Helper to extract what the barrel export re-exports
     */
    function extractBarrelExports(barrelPath: string): {
        namedExports: Set<string>;
        wildcardModules: Set<string>;
    } {
        const content = fs.readFileSync(barrelPath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            barrelPath,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        const namedExports = new Set<string>();
        const wildcardModules = new Set<string>();

        function visit(node: ts.Node) {
            if (ts.isExportDeclaration(node)) {
                // export * from './module'
                if (!node.exportClause && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                    wildcardModules.add(node.moduleSpecifier.text);
                }

                // export { foo, bar } from './module'
                if (node.exportClause && ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(element => {
                        namedExports.add(element.name.text);
                    });
                }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);
        return { namedExports, wildcardModules };
    }

    /**
     * Property 14: Complete Barrel Exports
     * 
     * For any utility file in lib/api/*, the utility SHALL be exported through lib/api/index.ts.
     * 
     * Validates: Requirements 5.3
     * 
     * Feature: codebase-cleanup-optimization, Property 14: Complete Barrel Exports
     */
    it('Property 14: For any utility file in lib/api/*, the utility SHALL be exported through lib/api/index.ts', () => {
        const rootDir = process.cwd();
        const apiDir = path.join(rootDir, 'lib', 'api');
        const barrelPath = path.join(apiDir, 'index.ts');

        // Verify barrel export exists
        if (!fs.existsSync(barrelPath)) {
            throw new Error('Barrel export lib/api/index.ts does not exist');
        }

        // Get all utility files in lib/api (excluding index.ts and test files)
        const utilityFiles = fs.readdirSync(apiDir)
            .filter(file => {
                return file.endsWith('.ts') &&
                    file !== 'index.ts' &&
                    !file.endsWith('.test.ts') &&
                    !file.endsWith('.d.ts');
            })
            .map(file => path.join(apiDir, file));

        // Extract what the barrel exports
        const { namedExports, wildcardModules } = extractBarrelExports(barrelPath);

        const violations: Array<{
            file: string;
            missingExports: string[];
        }> = [];

        // Check each utility file
        for (const utilityFile of utilityFiles) {
            const fileName = path.basename(utilityFile);
            const moduleName = './' + fileName.replace('.ts', '');

            // Get all exports from this utility file
            const utilityExports = extractExportedIdentifiers(utilityFile);

            // Check if this module is wildcard exported
            const isWildcardExported = wildcardModules.has(moduleName);

            if (isWildcardExported) {
                // If wildcard exported, all exports are automatically included
                continue;
            }

            // Check if all exports are individually named in the barrel
            const missingExports: string[] = [];
            for (const exportName of utilityExports) {
                // Skip intentionally excluded exports (deprecated, internal, etc.)
                if (EXCLUDED_EXPORTS.includes(exportName)) {
                    continue;
                }
                if (!namedExports.has(exportName)) {
                    missingExports.push(exportName);
                }
            }

            if (missingExports.length > 0) {
                violations.push({
                    file: fileName,
                    missingExports
                });
            }
        }

        if (violations.length > 0) {
            console.log('\n=== Property 14 Violations: Complete Barrel Exports ===\n');
            console.log('All utilities from lib/api/* files MUST be exported through lib/api/index.ts.\n');

            for (const { file, missingExports } of violations) {
                console.log(`\nFile: lib/api/${file}`);
                console.log(`Missing exports in barrel (${missingExports.length}):`);
                missingExports.forEach(exp => {
                    console.log(`  - ${exp}`);
                });
                console.log('\nAdd to lib/api/index.ts:');
                console.log(`  export { ${missingExports.join(', ')} } from './${file.replace('.ts', '')}'`);
                console.log('  OR');
                console.log(`  export * from './${file.replace('.ts', '')}'`);
            }

            console.log('\n=== Summary ===');
            console.log(`Total files with missing exports: ${violations.length}`);
            console.log(`Total missing exports: ${violations.reduce((sum, v) => sum + v.missingExports.length, 0)}`);
            console.log('\nBenefit: Complete barrel exports ensure all utilities are accessible through a single import path.');
            console.log('This improves discoverability and makes refactoring easier.');
            console.log('');
        }

        expect(violations).toEqual([]);
    });

    /**
     * Additional check: Verify barrel export doesn't export non-existent items
     */
    it('Barrel export should not reference non-existent exports', () => {
        const rootDir = process.cwd();
        const apiDir = path.join(rootDir, 'lib', 'api');
        const barrelPath = path.join(apiDir, 'index.ts');

        if (!fs.existsSync(barrelPath)) {
            throw new Error('Barrel export lib/api/index.ts does not exist');
        }

        const content = fs.readFileSync(barrelPath, 'utf-8');
        const sourceFile = ts.createSourceFile(
            barrelPath,
            content,
            ts.ScriptTarget.Latest,
            true
        );

        const violations: Array<{
            module: string;
            exportedNames: string[];
            missingInSource: string[];
        }> = [];

        function visit(node: ts.Node) {
            if (ts.isExportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                const modulePath = node.moduleSpecifier.text;

                // Skip external modules (not starting with ./)
                if (!modulePath.startsWith('./')) {
                    return;
                }

                // Skip wildcard exports (export * from)
                if (!node.exportClause) {
                    return;
                }

                // Get the actual file path
                const moduleFile = path.join(apiDir, modulePath + '.ts');

                // Skip if file doesn't exist (might be from a different directory)
                if (!fs.existsSync(moduleFile)) {
                    return;
                }

                // Get what's being exported from barrel
                const exportedNames: string[] = [];
                if (ts.isNamedExports(node.exportClause)) {
                    node.exportClause.elements.forEach(element => {
                        exportedNames.push(element.name.text);
                    });
                }

                // Get what actually exists in the source file
                const sourceExports = extractExportedIdentifiers(moduleFile);

                // Check for mismatches
                const missingInSource = exportedNames.filter(name => !sourceExports.has(name));

                if (missingInSource.length > 0) {
                    violations.push({
                        module: modulePath,
                        exportedNames,
                        missingInSource
                    });
                }
            }

            ts.forEachChild(node, visit);
        }

        visit(sourceFile);

        if (violations.length > 0) {
            console.log('\n=== Barrel Export Integrity Issues ===\n');
            console.log('The barrel export references items that do not exist in source files.\n');

            for (const { module, exportedNames, missingInSource } of violations) {
                console.log(`\nModule: ${module}`);
                console.log(`Barrel exports: ${exportedNames.join(', ')}`);
                console.log(`Missing in source file:`);
                missingInSource.forEach(name => {
                    console.log(`  - ${name}`);
                });
                console.log('\nAction: Remove these exports from lib/api/index.ts or add them to the source file.');
            }

            console.log('');
        }

        expect(violations).toEqual([]);
    });
});
