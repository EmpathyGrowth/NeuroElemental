/**
 * Property Tests: Supabase MCP Client
 * 
 * **Feature: comprehensive-platform-audit, Property 14: RLS Policy Coverage**
 * **Feature: comprehensive-platform-audit, Property 20: Migration Synchronization**
 * **Validates: Requirements 8.2, 13.4**
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  SupabaseMCPClient,
  hasRLSEnabled,
  getTablesWithoutRLS,
  validateMigrationSync,
  TableInfo,
  MigrationInfo,
} from '../supabase-client';

describe('Property 14: RLS Policy Coverage', () => {
  it('should correctly identify tables with RLS enabled', () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        (rlsEnabled) => {
          const table: TableInfo = {
            name: 'test_table',
            schema: 'public',
            hasRLS: rlsEnabled,
            columns: [],
          };

          expect(hasRLSEnabled(table)).toBe(rlsEnabled);
          return true;
        }
      ),
      { numRuns: 20 }
    );
  });

  it('should return only tables without RLS', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 30 }),
            schema: fc.constant('public'),
            hasRLS: fc.boolean(),
            columns: fc.constant([]),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        (tables) => {
          const tablesWithoutRLS = getTablesWithoutRLS(tables as unknown as TableInfo[]);

          // All returned tables should have RLS disabled
          for (const table of tablesWithoutRLS) {
            expect(table.hasRLS).toBe(false);
          }

          // Count should match
          const expectedCount = tables.filter((t) => !t.hasRLS).length;
          expect(tablesWithoutRLS.length).toBe(expectedCount);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return empty array when all tables have RLS', () => {
    const tables: TableInfo[] = [
      { name: 'users', schema: 'public', hasRLS: true, columns: [] },
      { name: 'posts', schema: 'public', hasRLS: true, columns: [] },
      { name: 'comments', schema: 'public', hasRLS: true, columns: [] },
    ];

    const result = getTablesWithoutRLS(tables);
    expect(result).toEqual([]);
  });

  it('should return all tables when none have RLS', () => {
    const tables: TableInfo[] = [
      { name: 'users', schema: 'public', hasRLS: false, columns: [] },
      { name: 'posts', schema: 'public', hasRLS: false, columns: [] },
    ];

    const result = getTablesWithoutRLS(tables);
    expect(result.length).toBe(2);
  });
});

describe('Property 20: Migration Synchronization', () => {
  it('should report in sync when migrations match', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 0, maxLength: 10 }),
        (versions) => {
          const uniqueVersions = [...new Set(versions)];
          const appliedMigrations: MigrationInfo[] = uniqueVersions.map((v) => ({
            version: v,
            name: `migration_${v}`,
            isApplied: true,
            appliedAt: new Date(),
          }));

          const result = validateMigrationSync(uniqueVersions, appliedMigrations);

          expect(result.inSync).toBe(true);
          expect(result.missingInDb).toEqual([]);
          expect(result.extraInDb).toEqual([]);

          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  it('should detect missing migrations in database', () => {
    const localMigrations = ['001', '002', '003'];
    const appliedMigrations: MigrationInfo[] = [
      { version: '001', name: 'init', isApplied: true },
    ];

    const result = validateMigrationSync(localMigrations, appliedMigrations);

    expect(result.inSync).toBe(false);
    expect(result.missingInDb).toContain('002');
    expect(result.missingInDb).toContain('003');
    expect(result.extraInDb).toEqual([]);
  });

  it('should detect extra migrations in database', () => {
    const localMigrations = ['001'];
    const appliedMigrations: MigrationInfo[] = [
      { version: '001', name: 'init', isApplied: true },
      { version: '002', name: 'extra', isApplied: true },
    ];

    const result = validateMigrationSync(localMigrations, appliedMigrations);

    expect(result.inSync).toBe(false);
    expect(result.missingInDb).toEqual([]);
    expect(result.extraInDb).toContain('002');
  });

  it('should handle empty migrations', () => {
    const result = validateMigrationSync([], []);

    expect(result.inSync).toBe(true);
    expect(result.missingInDb).toEqual([]);
    expect(result.extraInDb).toEqual([]);
  });

  it('should always return arrays for missing and extra', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 0, maxLength: 5 }),
        fc.array(
          fc.record({
            version: fc.string({ minLength: 1, maxLength: 10 }),
            name: fc.string(),
            isApplied: fc.constant(true),
          }),
          { minLength: 0, maxLength: 5 }
        ),
        (local, applied) => {
          const result = validateMigrationSync(local, applied as MigrationInfo[]);

          expect(Array.isArray(result.missingInDb)).toBe(true);
          expect(Array.isArray(result.extraInDb)).toBe(true);
          expect(typeof result.inSync).toBe('boolean');

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Supabase MCP Client Parsing', () => {
  it('should parse table list response', () => {
    const response = [
      {
        name: 'users',
        schema: 'public',
        rls_enabled: true,
        columns: [
          { name: 'id', type: 'uuid', is_nullable: false, is_primary_key: true },
          { name: 'email', type: 'text', is_nullable: false },
        ],
      },
    ];

    const tables = SupabaseMCPClient.parseTableList(response);

    expect(tables.length).toBe(1);
    expect(tables[0].name).toBe('users');
    expect(tables[0].hasRLS).toBe(true);
    expect(tables[0].columns.length).toBe(2);
  });

  it('should handle invalid table list response', () => {
    expect(SupabaseMCPClient.parseTableList(null)).toEqual([]);
    expect(SupabaseMCPClient.parseTableList(undefined)).toEqual([]);
    expect(SupabaseMCPClient.parseTableList('invalid')).toEqual([]);
    expect(SupabaseMCPClient.parseTableList({})).toEqual([]);
  });

  it('should parse migration list response', () => {
    const response = [
      { version: '001', name: 'init', applied_at: '2024-01-01T00:00:00Z' },
      { version: '002', name: 'add_users' },
    ];

    const migrations = SupabaseMCPClient.parseMigrationList(response);

    expect(migrations.length).toBe(2);
    expect(migrations[0].version).toBe('001');
    expect(migrations[0].isApplied).toBe(true);
    expect(migrations[1].isApplied).toBe(false);
  });

  it('should parse advisory response', () => {
    const response = [
      {
        type: 'security',
        severity: 'high',
        title: 'Missing RLS',
        description: 'Table has no RLS policies',
      },
    ];

    const advisories = SupabaseMCPClient.parseAdvisories(response);

    expect(advisories.length).toBe(1);
    expect(advisories[0].type).toBe('security');
    expect(advisories[0].severity).toBe('high');
  });

  it('should parse query result', () => {
    const response = {
      data: [{ id: 1, name: 'test' }],
    };

    const result = SupabaseMCPClient.parseQueryResult(response);

    expect(result.data.length).toBe(1);
    expect(result.rowCount).toBe(1);
    expect(result.error).toBeUndefined();
  });

  it('should handle query error', () => {
    const response = {
      error: 'Query failed',
      data: [],
    };

    const result = SupabaseMCPClient.parseQueryResult(response);

    expect(result.error).toBe('Query failed');
    expect(result.data).toEqual([]);
  });
});

describe('SQL Query Builders', () => {
  it('should build valid RLS check query', () => {
    const query = SupabaseMCPClient.buildRLSCheckQuery();

    expect(query).toContain('pg_tables');
    expect(query).toContain('rowsecurity');
    expect(query).toContain('public');
  });

  it('should build valid index query', () => {
    const query = SupabaseMCPClient.buildIndexQuery();

    expect(query).toContain('pg_index');
    expect(query).toContain('indisunique');
  });

  it('should build index query with table filter', () => {
    const query = SupabaseMCPClient.buildIndexQuery('users');

    expect(query).toContain("t.relname = 'users'");
  });

  it('should build valid foreign key query', () => {
    const query = SupabaseMCPClient.buildForeignKeyQuery();

    expect(query).toContain('FOREIGN KEY');
    expect(query).toContain('information_schema');
  });

  it('should build valid RLS policies query', () => {
    const query = SupabaseMCPClient.buildRLSPoliciesQuery();

    expect(query).toContain('pg_policies');
    expect(query).toContain('policyname');
  });
});
