/**
 * Supabase MCP Client Wrapper
 * 
 * Wraps Supabase MCP server functions for audit operations.
 * Provides table inspection, RLS verification, and migration analysis.
 */

/**
 * Table information from Supabase
 */
export interface TableInfo {
  name: string;
  schema: string;
  rowCount?: number;
  hasRLS: boolean;
  columns: ColumnInfo[];
}

/**
 * Column information
 */
export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: string;
}

/**
 * Migration information
 */
export interface MigrationInfo {
  version: string;
  name: string;
  appliedAt?: Date;
  isApplied: boolean;
}

/**
 * RLS Policy information
 */
export interface RLSPolicy {
  tableName: string;
  policyName: string;
  command: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL';
  roles: string[];
  using?: string;
  withCheck?: string;
}

/**
 * Index information
 */
export interface IndexInfo {
  name: string;
  tableName: string;
  columns: string[];
  isUnique: boolean;
  isPrimary: boolean;
}

/**
 * Advisory notice from Supabase
 */
export interface Advisory {
  type: 'security' | 'performance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  remediationUrl?: string;
}

/**
 * Query result
 */
export interface QueryResult<T = Record<string, unknown>> {
  data: T[];
  error?: string;
  rowCount: number;
}

/**
 * Supabase MCP Client
 * 
 * Note: This client is designed to work with the Supabase MCP server.
 * In actual usage, the MCP functions are called directly by the agent.
 * This wrapper provides type definitions and helper utilities.
 */
export class SupabaseMCPClient {
  constructor(private projectId: string) {}

  /**
   * Get project ID
   */
  getProjectId(): string {
    return this.projectId;
  }

  /**
   * Parse table list response from MCP
   */
  static parseTableList(response: unknown): TableInfo[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((table: Record<string, unknown>) => ({
      name: String(table.name || ''),
      schema: String(table.schema || 'public'),
      rowCount: typeof table.row_count === 'number' ? table.row_count : undefined,
      hasRLS: Boolean(table.rls_enabled),
      columns: Array.isArray(table.columns)
        ? table.columns.map((col: Record<string, unknown>) => ({
            name: String(col.name || ''),
            type: String(col.type || ''),
            nullable: Boolean(col.is_nullable),
            defaultValue: col.default_value ? String(col.default_value) : undefined,
            isPrimaryKey: Boolean(col.is_primary_key),
            isForeignKey: Boolean(col.is_foreign_key),
            references: col.references ? String(col.references) : undefined,
          }))
        : [],
    }));
  }

  /**
   * Parse migration list response from MCP
   */
  static parseMigrationList(response: unknown): MigrationInfo[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((migration: Record<string, unknown>) => ({
      version: String(migration.version || ''),
      name: String(migration.name || ''),
      appliedAt: migration.applied_at ? new Date(String(migration.applied_at)) : undefined,
      isApplied: Boolean(migration.applied_at),
    }));
  }

  /**
   * Parse advisory response from MCP
   */
  static parseAdvisories(response: unknown): Advisory[] {
    if (!Array.isArray(response)) {
      return [];
    }

    return response.map((advisory: Record<string, unknown>) => ({
      type: advisory.type === 'performance' ? 'performance' : 'security',
      severity: (['critical', 'high', 'medium', 'low'].includes(String(advisory.severity))
        ? String(advisory.severity)
        : 'medium') as Advisory['severity'],
      title: String(advisory.title || ''),
      description: String(advisory.description || ''),
      remediationUrl: advisory.remediation_url ? String(advisory.remediation_url) : undefined,
    }));
  }

  /**
   * Parse query result from MCP
   */
  static parseQueryResult<T = Record<string, unknown>>(response: unknown): QueryResult<T> {
    if (typeof response !== 'object' || response === null) {
      return { data: [], rowCount: 0, error: 'Invalid response' };
    }

    const result = response as Record<string, unknown>;

    if (result.error) {
      return {
        data: [],
        rowCount: 0,
        error: String(result.error),
      };
    }

    const data = Array.isArray(result.data) ? result.data : [];

    return {
      data: data as T[],
      rowCount: data.length,
    };
  }

  /**
   * Build SQL query to check RLS status for all tables
   */
  static buildRLSCheckQuery(): string {
    return `
      SELECT 
        schemaname as schema,
        tablename as name,
        rowsecurity as rls_enabled
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
  }

  /**
   * Build SQL query to get table indexes
   */
  static buildIndexQuery(tableName?: string): string {
    const whereClause = tableName
      ? `AND t.relname = '${tableName}'`
      : '';

    return `
      SELECT
        i.relname as index_name,
        t.relname as table_name,
        array_agg(a.attname ORDER BY array_position(ix.indkey, a.attnum)) as columns,
        ix.indisunique as is_unique,
        ix.indisprimary as is_primary
      FROM pg_index ix
      JOIN pg_class t ON t.oid = ix.indrelid
      JOIN pg_class i ON i.oid = ix.indexrelid
      JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
      JOIN pg_namespace n ON n.oid = t.relnamespace
      WHERE n.nspname = 'public'
      ${whereClause}
      GROUP BY i.relname, t.relname, ix.indisunique, ix.indisprimary
      ORDER BY t.relname, i.relname;
    `;
  }

  /**
   * Build SQL query to find orphaned records
   */
  static buildOrphanedRecordsQuery(
    tableName: string,
    foreignKeyColumn: string,
    referencedTable: string
  ): string {
    return `
      SELECT COUNT(*) as orphan_count
      FROM ${tableName} t
      LEFT JOIN ${referencedTable} r ON t.${foreignKeyColumn} = r.id
      WHERE t.${foreignKeyColumn} IS NOT NULL
      AND r.id IS NULL;
    `;
  }

  /**
   * Build SQL query to get foreign key relationships
   */
  static buildForeignKeyQuery(): string {
    return `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      ORDER BY tc.table_name;
    `;
  }

  /**
   * Build SQL query to get RLS policies
   */
  static buildRLSPoliciesQuery(): string {
    return `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `;
  }
}

/**
 * Check if a table has RLS enabled
 */
export function hasRLSEnabled(table: TableInfo): boolean {
  return table.hasRLS;
}

/**
 * Get tables without RLS
 */
export function getTablesWithoutRLS(tables: TableInfo[]): TableInfo[] {
  return tables.filter((t) => !t.hasRLS);
}

/**
 * Get tables with missing indexes for common query patterns
 */
export function getTablesWithMissingIndexes(
  tables: TableInfo[],
  indexes: IndexInfo[]
): { table: string; suggestedIndexes: string[] }[] {
  const results: { table: string; suggestedIndexes: string[] }[] = [];

  for (const table of tables) {
    const tableIndexes = indexes.filter((i) => i.tableName === table.name);
    const indexedColumns = new Set(tableIndexes.flatMap((i) => i.columns));
    const suggestions: string[] = [];

    // Check for common patterns that should have indexes
    for (const column of table.columns) {
      // Foreign keys should have indexes
      if (column.isForeignKey && !indexedColumns.has(column.name)) {
        suggestions.push(`Index on ${column.name} (foreign key)`);
      }

      // Common query columns
      if (
        ['created_at', 'updated_at', 'email', 'user_id', 'organization_id'].includes(
          column.name
        ) &&
        !indexedColumns.has(column.name)
      ) {
        suggestions.push(`Index on ${column.name} (common query column)`);
      }
    }

    if (suggestions.length > 0) {
      results.push({ table: table.name, suggestedIndexes: suggestions });
    }
  }

  return results;
}

/**
 * Validate migration synchronization
 */
export function validateMigrationSync(
  localMigrations: string[],
  appliedMigrations: MigrationInfo[]
): {
  missingInDb: string[];
  extraInDb: string[];
  inSync: boolean;
} {
  const appliedVersions = new Set(appliedMigrations.map((m) => m.version));
  const localVersions = new Set(localMigrations);

  const missingInDb = localMigrations.filter((v) => !appliedVersions.has(v));
  const extraInDb = appliedMigrations
    .filter((m) => !localVersions.has(m.version))
    .map((m) => m.version);

  return {
    missingInDb,
    extraInDb,
    inSync: missingInDb.length === 0 && extraInDb.length === 0,
  };
}
