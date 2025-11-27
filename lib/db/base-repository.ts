/**
 * Base Repository Pattern for Supabase
 *
 * Provides generic CRUD operations to eliminate database query duplication.
 * Implements DRY principles for common database patterns.
 * 
 * Consolidated from base-crud.ts and base-repository.ts to provide a single
 * source of truth for database operations.
 */

import { internalError, notFoundError } from '@/lib/api';
import { createAdminClient } from '@/lib/supabase/admin';
import { logger } from '@/lib/logging';
import { Database } from '@/lib/types/supabase';
import { toError, getUpdateTimestamp } from '@/lib/utils';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Type helpers for database operations
 * Using string literal type for table names to avoid TypeScript combinatorial explosion
 */
export type TableName = keyof Database['public']['Tables'];
type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

/**
 * Repository options for configuration
 */
export interface RepositoryOptions {
  includeTimestamps?: boolean;
}

/**
 * Query options for filtering and sorting
 */
export interface QueryOptions {
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
}

/**
 * Pagination options
 */
export interface PaginationOptions extends QueryOptions {
  page: number;
  limit: number;
  filters?: Record<string, unknown>;
}

/**
 * Paginated result structure
 */
export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Supabase query builder type - simplified to avoid TypeScript combinatorial explosion
 * Using any for the query builder since we cast results at boundaries anyway
 */
 
type SupabaseQueryBuilder = any;

/**
 * Generic repository for database operations
 */
export class BaseRepository<T extends TableName> {
  protected supabase: SupabaseClient<Database>;
  protected tableName: T;
  protected includeTimestamps: boolean;

  constructor(tableName: T, supabase?: SupabaseClient<Database>, options?: RepositoryOptions) {
    this.tableName = tableName;
    this.supabase = supabase || (createAdminClient() as SupabaseClient<Database>);
    this.includeTimestamps = options?.includeTimestamps ?? true;
  }

  /**
   * Get a query builder for the table
   * Centralizes the type assertion needed for dynamic table access
   */
  protected table(): SupabaseQueryBuilder {
    return this.supabase.from(this.tableName);
  }

  /**
   * Find a single record by ID
   * Throws notFoundError if not found
   */
  async findById(id: string): Promise<Row<T>> {
    const { data, error } = await this.table()
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      logger.error(`${this.tableName} not found`, toError(error));
      throw notFoundError(this.tableName as string);
    }

    return data as Row<T>;
  }

  /**
   * Find a single record by ID, returns null if not found
   */
  async findByIdOrNull(id: string): Promise<Row<T> | null> {
    const { data, error } = await this.table()
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error(`Error fetching ${this.tableName}`, toError(error));
      return null;
    }

    return (data as Row<T>) || null;
  }

  /**
   * Find all records with optional filters and query options
   */
  async findAll(filters?: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>[]> {
    let query = this.table().select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value as string | number | boolean);
      });
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true });
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      logger.error(`Error fetching ${this.tableName} list`, toError(error));
      throw internalError(`Failed to fetch ${this.tableName} list`);
    }

    return (data as Row<T>[]) || [];
  }

  /**
   * Find a single record matching filters
   * Returns null if not found
   */
  async findOne(filters: Partial<Row<T>>): Promise<Row<T> | null> {
    let query = this.table().select('*');

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value as string | number | boolean);
    });

    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error(`Error fetching ${this.tableName}`, toError(error));
      return null;
    }

    return (data as Row<T>) || null;
  }

  /**
   * Find a single record by a specific field
   * Returns null if not found
   * Convenience method for single-field lookups (e.g., by slug, email)
   */
  async findBy(field: string, value: string | number | boolean): Promise<Row<T> | null> {
    const { data, error } = await this.table()
      .select('*')
      .eq(field, value)
      .maybeSingle();

    if (error) {
      logger.error(`Error fetching ${this.tableName} by ${field}`, toError(error));
      return null;
    }

    return (data as Row<T>) || null;
  }

  /**
   * Create a new record
   */
  async create(data: Insert<T>): Promise<Row<T>> {
    const { data: created, error } = await this.table()
      .insert(data as Record<string, unknown>)
      .select()
      .single();

    if (error) {
      logger.error(`Error creating ${this.tableName}`, toError(error));
      throw internalError(`Failed to create ${this.tableName}`);
    }

    return created as Row<T>;
  }

  /**
   * Create multiple records in bulk
   */
  async createMany(data: Insert<T>[]): Promise<Row<T>[]> {
    const { data: created, error } = await this.table()
      .insert(data as Record<string, unknown>[])
      .select();

    if (error) {
      logger.error(`Error creating multiple ${this.tableName}`, toError(error));
      throw internalError(`Failed to create multiple ${this.tableName}`);
    }

    return (created as Row<T>[]) || [];
  }

  /**
   * Update a record by ID
   * Automatically adds updated_at timestamp if includeTimestamps is true
   */
  async update(id: string, data: Update<T>): Promise<Row<T>> {
    const payload = this.includeTimestamps
      ? { ...data, ...getUpdateTimestamp() }
      : data;

    const { data: updated, error } = await this.table()
      .update(payload as Record<string, unknown>)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Error updating ${this.tableName}`, toError(error));
      throw internalError(`Failed to update ${this.tableName}`);
    }

    return updated as Row<T>;
  }

  /**
   * Update multiple records matching filters
   * Automatically adds updated_at timestamp if includeTimestamps is true
   */
  async updateMany(filters: Partial<Row<T>>, data: Update<T>): Promise<Row<T>[]> {
    const payload = this.includeTimestamps
      ? { ...data, ...getUpdateTimestamp() }
      : data;

    let query = this.table().update(payload as Record<string, unknown>);

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value as string | number | boolean);
    });

    const { data: updated, error } = await query.select();

    if (error) {
      logger.error(`Error updating multiple ${this.tableName}`, toError(error));
      throw internalError(`Failed to update multiple ${this.tableName}`);
    }

    return (updated as Row<T>[]) || [];
  }

  /**
   * Delete a record by ID
   */
  async delete(id: string): Promise<void> {
    const { error } = await this.table()
      .delete()
      .eq('id', id);

    if (error) {
      logger.error(`Error deleting ${this.tableName}`, toError(error));
      throw internalError(`Failed to delete ${this.tableName}`);
    }
  }

  /**
   * Delete multiple records matching filters
   */
  async deleteMany(filters: Partial<Row<T>>): Promise<void> {
    let query = this.table().delete();

    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value as string | number | boolean);
    });

    const { error } = await query;

    if (error) {
      logger.error(`Error deleting multiple ${this.tableName}`, toError(error));
      throw internalError(`Failed to delete multiple ${this.tableName}`);
    }
  }

  /**
   * Count records with optional filters
   */
  async count(filters?: Partial<Row<T>>): Promise<number> {
    let query = this.table().select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value as string | number | boolean);
      });
    }

    const { count, error } = await query;

    if (error) {
      logger.error(`Error counting ${this.tableName}`, toError(error));
      return 0;
    }

    return count || 0;
  }

  /**
   * Check if a record exists by ID
   */
  async exists(id: string): Promise<boolean> {
    const { count } = await this.table()
      .select('*', { count: 'exact', head: true })
      .eq('id', id);

    return (count || 0) > 0;
  }

  /**
   * Paginate records with filters and sorting
   */
  async paginate(options: PaginationOptions): Promise<PaginatedResult<Row<T>>> {
    const { page, limit, filters, orderBy, offset } = options;

    // Calculate offset from page if not provided
    const calculatedOffset = offset ?? (page - 1) * limit;

    // Build count query
    let countQuery = this.table().select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        countQuery = countQuery.eq(key, value as string | number | boolean);
      });
    }

    // Build data query
    let dataQuery = this.table().select('*');

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        dataQuery = dataQuery.eq(key, value as string | number | boolean);
      });
    }

    if (orderBy) {
      dataQuery = dataQuery.order(orderBy.column, { ascending: orderBy.ascending ?? true });
    }

    dataQuery = dataQuery.range(calculatedOffset, calculatedOffset + limit - 1);

    // Execute both queries
    const [countResult, dataResult] = await Promise.all([
      countQuery,
      dataQuery
    ]);

    if (countResult.error) {
      logger.error(`Error counting ${this.tableName}`, toError(countResult.error));
      throw internalError(`Failed to count ${this.tableName}`);
    }

    if (dataResult.error) {
      logger.error(`Error fetching paginated ${this.tableName}`, toError(dataResult.error));
      throw internalError(`Failed to fetch paginated ${this.tableName}`);
    }

    const total = countResult.count || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      data: (dataResult.data as Row<T>[]) || [],
      total,
      page,
      limit,
      totalPages
    };
  }
}

/**
 * Create a repository instance for a table
 * @param tableName - Name of the database table
 * @param supabase - Optional Supabase client instance
 * @param options - Optional repository configuration
 * @returns BaseRepository instance for the specified table
 * @example
 * const postsRepo = createRepository('blog_posts');
 */
export function createRepository<T extends TableName>(
  tableName: T,
  supabase?: SupabaseClient<Database>,
  options?: RepositoryOptions
) {
  return new BaseRepository(tableName, supabase, options);
}

/**
 * Filter operator types for query builder
 */
type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in' | 'is' | 'contains' | 'containedBy';

/**
 * Filter condition for query builder
 */
interface FilterCondition {
  column: string;
  operator: FilterOperator;
  value: unknown;
}

/**
 * Order condition for query builder
 */
interface OrderCondition {
  column: string;
  ascending: boolean;
  nullsFirst?: boolean;
}

/**
 * Fluent Query Builder for complex queries
 *
 * Provides a chainable interface for building complex database queries
 * without the need for raw SQL.
 *
 * @example
 * ```typescript
 * const results = await queryBuilder('courses')
 *   .select('*, instructor:profiles!instructor_id(full_name)')
 *   .where('is_published', 'eq', true)
 *   .where('price', 'gte', 0)
 *   .whereIn('category_id', ['cat1', 'cat2'])
 *   .search(['title', 'description'], 'javascript')
 *   .orderBy('created_at', false)
 *   .limit(20)
 *   .offset(0)
 *   .execute();
 * ```
 */
export class QueryBuilder<T extends TableName> {
  private tableName: T;
  private supabase: SupabaseClient<Database>;
  private selectFields: string = '*';
  private filters: FilterCondition[] = [];
  private orFilters: string[] = [];
  private orders: OrderCondition[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private countExact: boolean = false;

  constructor(tableName: T, supabase?: SupabaseClient<Database>) {
    this.tableName = tableName;
    this.supabase = supabase || (createAdminClient() as SupabaseClient<Database>);
  }

  /**
   * Set the fields to select
   */
  select(fields: string): this {
    this.selectFields = fields;
    return this;
  }

  /**
   * Add a where condition
   */
  where(column: string, operator: FilterOperator, value: unknown): this {
    this.filters.push({ column, operator, value });
    return this;
  }

  /**
   * Add an equals condition (shorthand)
   */
  whereEq(column: string, value: unknown): this {
    return this.where(column, 'eq', value);
  }

  /**
   * Add an IN condition
   */
  whereIn(column: string, values: unknown[]): this {
    return this.where(column, 'in', values);
  }

  /**
   * Add an IS NULL condition
   */
  whereNull(column: string): this {
    return this.where(column, 'is', null);
  }

  /**
   * Add an IS NOT NULL condition
   */
  whereNotNull(column: string): this {
    return this.where(column, 'neq', null);
  }

  /**
   * Add a date range filter
   */
  whereDateRange(column: string, from?: string, to?: string): this {
    if (from) {
      this.where(column, 'gte', from);
    }
    if (to) {
      this.where(column, 'lte', to);
    }
    return this;
  }

  /**
   * Add OR conditions (uses Supabase's .or() method)
   */
  orWhere(conditions: string): this {
    this.orFilters.push(conditions);
    return this;
  }

  /**
   * Add a text search across multiple columns
   */
  search(columns: string[], term: string): this {
    if (term && term.length >= 2) {
      const searchPattern = `%${term}%`;
      const orConditions = columns.map((col) => `${col}.ilike.${searchPattern}`).join(',');
      this.orFilters.push(orConditions);
    }
    return this;
  }

  /**
   * Add an order by clause
   */
  orderBy(column: string, ascending: boolean = true, nullsFirst?: boolean): this {
    this.orders.push({ column, ascending, nullsFirst });
    return this;
  }

  /**
   * Set the limit
   */
  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  /**
   * Set the offset
   */
  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  /**
   * Set pagination (page is 1-indexed)
   */
  paginate(page: number, perPage: number): this {
    this.limitValue = perPage;
    this.offsetValue = (page - 1) * perPage;
    return this;
  }

  /**
   * Include count in the result
   */
  withCount(): this {
    this.countExact = true;
    return this;
  }

  /**
   * Build the query without executing
   */
  private buildQuery(): SupabaseQueryBuilder {
    const selectOptions = this.countExact ? { count: 'exact' as const } : undefined;
    let query: SupabaseQueryBuilder = this.supabase.from(this.tableName).select(this.selectFields, selectOptions);

    // Apply filters
    for (const filter of this.filters) {
      switch (filter.operator) {
        case 'eq':
          query = query.eq(filter.column, filter.value as any);
          break;
        case 'neq':
          query = query.neq(filter.column, filter.value as any);
          break;
        case 'gt':
          query = query.gt(filter.column, filter.value as any);
          break;
        case 'gte':
          query = query.gte(filter.column, filter.value as any);
          break;
        case 'lt':
          query = query.lt(filter.column, filter.value as any);
          break;
        case 'lte':
          query = query.lte(filter.column, filter.value as any);
          break;
        case 'like':
          query = query.like(filter.column, filter.value as string);
          break;
        case 'ilike':
          query = query.ilike(filter.column, filter.value as string);
          break;
        case 'in':
          query = query.in(filter.column, filter.value as any[]);
          break;
        case 'is':
          query = query.is(filter.column, filter.value as any);
          break;
        case 'contains':
          query = query.contains(filter.column, filter.value as any[]);
          break;
        case 'containedBy':
          query = query.containedBy(filter.column, filter.value as any[]);
          break;
      }
    }

    // Apply OR filters
    for (const orFilter of this.orFilters) {
      query = query.or(orFilter);
    }

    // Apply ordering
    for (const order of this.orders) {
      query = query.order(order.column, {
        ascending: order.ascending,
        ...(order.nullsFirst !== undefined ? { nullsFirst: order.nullsFirst } : {}),
      });
    }

    // Apply pagination
    if (this.limitValue !== undefined && this.offsetValue !== undefined) {
      query = query.range(this.offsetValue, this.offsetValue + this.limitValue - 1);
    } else if (this.limitValue !== undefined) {
      query = query.limit(this.limitValue);
    }

    return query;
  }

  /**
   * Execute the query and return results
   */
  async execute(): Promise<Row<T>[]> {
    const query = this.buildQuery();
    const { data, error } = await query;

    if (error) {
      logger.error(`Query failed for ${this.tableName}`, toError(error));
      throw internalError(`Failed to query ${this.tableName}`);
    }

    return (data as Row<T>[]) || [];
  }

  /**
   * Execute the query and return results with count
   */
  async executeWithCount(): Promise<{ data: Row<T>[]; count: number }> {
    this.countExact = true;
    const query = this.buildQuery();
    const { data, error, count } = await query;

    if (error) {
      logger.error(`Query failed for ${this.tableName}`, toError(error));
      throw internalError(`Failed to query ${this.tableName}`);
    }

    return {
      data: (data as Row<T>[]) || [],
      count: count || 0,
    };
  }

  /**
   * Execute the query and return a single result
   */
  async executeSingle(): Promise<Row<T> | null> {
    this.limitValue = 1;
    const query = this.buildQuery();
    const { data, error } = await query.maybeSingle();

    if (error) {
      logger.error(`Query failed for ${this.tableName}`, toError(error));
      throw internalError(`Failed to query ${this.tableName}`);
    }

    return (data as Row<T>) || null;
  }

  /**
   * Execute the query and return a single result, throwing if not found
   */
  async executeSingleOrFail(): Promise<Row<T>> {
    const result = await this.executeSingle();
    if (!result) {
      throw notFoundError(this.tableName as string);
    }
    return result;
  }
}

/**
 * Create a query builder for a table
 *
 * @example
 * ```typescript
 * const courses = await queryBuilder('courses')
 *   .select('*, instructor:profiles!instructor_id(full_name)')
 *   .whereEq('is_published', true)
 *   .search(['title', 'description'], searchTerm)
 *   .orderBy('created_at', false)
 *   .paginate(1, 20)
 *   .executeWithCount();
 * ```
 */
export function queryBuilder<T extends TableName>(
  tableName: T,
  supabase?: SupabaseClient<Database>
): QueryBuilder<T> {
  return new QueryBuilder(tableName, supabase);
}

