/**
 * Common Route Utilities
 *
 * Shared helper functions to reduce duplication across route handlers.
 * Implements DRY principles for common patterns.
 */

import { getSupabaseServer, isUserOrgAdmin, isUserOrgOwner } from '@/lib/db';
import { forbiddenError, notFoundError, internalError } from './error-handler';
import { logger } from '@/lib/logging';
import type { Organization } from '@/types/organizations';
import type { Database } from '@/lib/types/supabase';

type TableName = keyof Database['public']['Tables'];

/**
 * Generic query result type for dynamic table access
 * Provides consistent return type for Supabase queries
 */
interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * Chainable query builder for dynamic table operations
 * Mirrors Supabase's query builder but with simpler typing
 */
interface DynamicQueryBuilder<TRow> {
  select: (columns?: string) => DynamicQueryBuilder<TRow>;
  eq: (column: string, value: unknown) => DynamicQueryBuilder<TRow>;
  single: () => Promise<QueryResult<TRow>>;
  maybeSingle: () => Promise<QueryResult<TRow>>;
}

/**
 * Insert operation builder
 */
interface InsertBuilder<TRow> {
  select: () => {
    single: () => Promise<QueryResult<TRow>>;
  };
}

/**
 * Update operation builder
 */
interface UpdateBuilder<TRow> {
  eq: (column: string, value: unknown) => {
    select: () => {
      single: () => Promise<QueryResult<TRow>>;
    };
  };
}

/**
 * Type-safe Supabase client wrapper for dynamic table access
 * Uses type assertions internally but provides type safety at the API level
 */
interface DynamicSupabaseClient {
  from: (table: TableName) => {
    insert: (data: Record<string, unknown>) => InsertBuilder<Record<string, unknown>>;
    update: (data: Record<string, unknown>) => UpdateBuilder<Record<string, unknown>>;
    select: (columns?: string) => DynamicQueryBuilder<Record<string, unknown>>;
  };
}

/**
 * Generic query helper to fetch a single record or throw NotFound
 * Reduces boilerplate in route handlers
 *
 * @param table - The database table name
 * @param filters - Object with column-value pairs to filter by
 * @param resourceName - Human-readable name for error messages
 * @param select - Optional select clause (defaults to '*')
 * @returns The fetched record
 * @throws NotFoundError if record doesn't exist
 *
 * @example
 * ```typescript
 * const course = await getOneOrThrow('courses', { id: courseId }, 'Course');
 * const user = await getOneOrThrow('profiles', { email }, 'User', 'id, email, full_name');
 * ```
 */
export async function getOneOrThrow<T = Record<string, unknown>>(
  table: TableName,
  filters: Record<string, string | number | boolean>,
  resourceName: string,
  select: string = '*'
): Promise<T> {
  const supabase = getSupabaseServer();
  let query = supabase.from(table).select(select);

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    throw notFoundError(resourceName);
  }

  return data as T;
}

/**
 * Generic query helper to fetch a single record, returns null if not found
 *
 * @param table - The database table name
 * @param filters - Object with column-value pairs to filter by
 * @param select - Optional select clause (defaults to '*')
 * @returns The fetched record or null
 *
 * @example
 * ```typescript
 * const existing = await getOneOrNull('enrollments', { user_id: userId, course_id: courseId });
 * if (existing) {
 *   // Handle existing record
 * }
 * ```
 */
export async function getOneOrNull<T = Record<string, unknown>>(
  table: TableName,
  filters: Record<string, string | number | boolean>,
  select: string = '*'
): Promise<T | null> {
  const supabase = getSupabaseServer();
  let query = supabase.from(table).select(select);

  for (const [key, value] of Object.entries(filters)) {
    query = query.eq(key, value);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    logger.error(`Error fetching from ${table}`, error);
    return null;
  }

  return data as T | null;
}

/**
 * Create a record and return it, or throw an error
 *
 * @param table - The database table name
 * @param data - The record data to insert
 * @param resourceName - Human-readable name for error messages
 * @returns The created record
 * @throws InternalError if creation fails
 *
 * @example
 * ```typescript
 * const enrollment = await createRecord('enrollments', {
 *   user_id: userId,
 *   course_id: courseId,
 *   status: 'active'
 * }, 'Enrollment');
 * ```
 */
export async function createRecord<T = Record<string, unknown>>(
  table: TableName,
  data: Record<string, unknown>,
  resourceName: string
): Promise<T> {
  const supabase = getSupabaseServer();

  // Type assertion required for dynamic table access - Supabase's query builder
  // loses type information when table name is a variable. This is a known limitation.
   
  const client = supabase as unknown as DynamicSupabaseClient;
  const { data: created, error } = await client
    .from(table)
    .insert(data)
    .select()
    .single();

  if (error || !created) {
    logger.error(`Error creating ${resourceName}`, error ? new Error(error.message) : undefined);
    throw internalError(`Failed to create ${resourceName}`);
  }

  return created as T;
}

/**
 * Create or update a record based on whether an existing record is found
 *
 * @param table - The database table name
 * @param existingId - ID of existing record (null for create)
 * @param insertData - Data for insert operation
 * @param updateData - Data for update operation
 * @param resourceName - Human-readable name for error messages
 * @returns The created or updated record
 *
 * @example
 * ```typescript
 * const enrollment = await createOrUpdate(
 *   'enrollments',
 *   existingEnrollment?.id ?? null,
 *   { user_id: userId, course_id: courseId, status: 'active' },
 *   { status: 'active', reactivated_at: new Date().toISOString() },
 *   'Enrollment'
 * );
 * ```
 */
export async function createOrUpdate<T = Record<string, unknown>>(
  table: TableName,
  existingId: string | null,
  insertData: Record<string, unknown>,
  updateData: Record<string, unknown>,
  resourceName: string
): Promise<T> {
  const supabase = getSupabaseServer();

  // Type assertion required for dynamic table access - Supabase's query builder
  // loses type information when table name is a variable. This is a known limitation.
   
  const client = supabase as unknown as DynamicSupabaseClient;

  if (existingId) {
    const { data, error } = await client
      .from(table)
      .update(updateData)
      .eq('id', existingId)
      .select()
      .single();

    if (error || !data) {
      logger.error(`Error updating ${resourceName}`, error ? new Error(error.message) : undefined);
      throw internalError(`Failed to update ${resourceName}`);
    }

    return data as T;
  } else {
    const { data, error } = await client
      .from(table)
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error(`Error creating ${resourceName}`, error ? new Error(error.message) : undefined);
      throw internalError(`Failed to create ${resourceName}`);
    }

    return data as T;
  }
}

/**
 * Create a notification for a user
 *
 * @param userId - ID of the user to notify
 * @param title - Notification title
 * @param message - Notification message
 * @param type - Notification type
 * @param actionUrl - Optional URL for the notification action
 */
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: 'success' | 'info' | 'warning' | 'error' = 'info',
  actionUrl?: string
): Promise<void> {
  const supabase = getSupabaseServer();

  await (supabase as any)
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      message,
      type,
      action_url: actionUrl,
    });
}

/** Course data from database */
interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_id: string | null;
  price_usd: number;
  is_published: boolean;
  slug: string;
  thumbnail_url: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Check if user has access to an organization
 * 
 * Verifies that the user is a member of the organization.
 * Optionally verifies admin role if requireAdmin is true.
 * 
 * @param userId - ID of the user to check
 * @param organizationId - ID of the organization
 * @param requireAdmin - If true, requires user to be an admin (default: false)
 * @throws {ApiError} ForbiddenError if user doesn't have access or isn't an admin
 * 
 * @example
 * ```typescript
 * // Check basic membership
 * await requireOrganizationAccess(user.id, orgId)
 * ```
 * 
 * @example
 * ```typescript
 * // Require admin access
 * await requireOrganizationAccess(user.id, orgId, true)
 * ```
 */
export async function requireOrganizationAccess(
  userId: string,
  organizationId: string,
  requireAdmin: boolean = false
): Promise<void> {
  const supabase = getSupabaseServer();

  // Check membership
  const { data: membership, error } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .single();

  if (error || !membership) {
    throw forbiddenError('Access denied to this organization');
  }

  // If admin required, check role
  if (requireAdmin) {
    const isAdmin = await isUserOrgAdmin(userId, organizationId);
    if (!isAdmin) {
      throw forbiddenError('Organization admin access required');
    }
  }
}

/**
 * Check if user is the owner of an organization
 *
 * @param userId - ID of the user to check
 * @param organizationId - ID of the organization
 * @throws {ApiError} ForbiddenError if user is not the owner
 *
 * @example
 * ```typescript
 * await requireOrganizationOwner(user.id, orgId)
 * ```
 */
export async function requireOrganizationOwner(
  userId: string,
  organizationId: string
): Promise<void> {
  const isOwner = await isUserOrgOwner(userId, organizationId);
  if (!isOwner) {
    throw forbiddenError('Only organization owners can perform this action');
  }
}

/**
 * Fetch an organization by ID and verify it exists
 * 
 * @param organizationId - ID of the organization to fetch
 * @returns Organization object
 * @throws {ApiError} NotFoundError if organization doesn't exist
 * 
 * @example
 * ```typescript
 * const org = await getOrganizationOrThrow(orgId)
 * console.log(org.name)
 * ```
 */
export async function getOrganizationOrThrow(organizationId: string) {
  const supabase = getSupabaseServer();

  const { data: organization, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', organizationId)
    .single() as { data: Organization | null; error: { message: string } | null };

  if (error || !organization) {
    throw notFoundError('Organization');
  }

  return organization;
}

/**
 * Fetch a course by ID and verify it exists
 * 
 * @param courseId - ID of the course to fetch
 * @returns Course object
 * @throws {ApiError} NotFoundError if course doesn't exist
 * 
 * @example
 * ```typescript
 * const course = await getCourseOrThrow(courseId)
 * console.log(course.title)
 * ```
 */
export async function getCourseOrThrow(courseId: string) {
  const supabase = getSupabaseServer();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single() as { data: Course | null; error: { message: string } | null };

  if (error || !course) {
    throw notFoundError('Course');
  }

  return course;
}

/**
 * Check if a user is enrolled in a course
 * 
 * @param userId - ID of the user
 * @param courseId - ID of the course
 * @returns True if user is enrolled with active status, false otherwise
 * 
 * @example
 * ```typescript
 * const enrolled = await isUserEnrolled(user.id, courseId)
 * if (enrolled) {
 *   // Grant access to course content
 * }
 * ```
 */
export async function isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
  const supabase = getSupabaseServer();

  const { data, error } = await supabase
    .from('course_enrollments')
    .select('id')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'active')
    .single();

  return !error && !!data;
}

/**
 * Require user to be enrolled in a course
 * 
 * Verifies that the user has an active enrollment in the specified course
 * 
 * @param userId - ID of the user
 * @param courseId - ID of the course
 * @throws {ApiError} ForbiddenError if user is not enrolled
 * 
 * @example
 * ```typescript
 * // Protect course content endpoints
 * await requireCourseEnrollment(user.id, courseId)
 * // User is enrolled, proceed with request
 * ```
 */
export async function requireCourseEnrollment(userId: string, courseId: string): Promise<void> {
  const enrolled = await isUserEnrolled(userId, courseId);

  if (!enrolled) {
    throw forbiddenError('You must be enrolled in this course');
  }
}

/**
 * Format pagination metadata for API responses
 * 
 * Calculates page number, total pages, and hasMore flag from offset-based pagination
 * 
 * @param total - Total number of items across all pages
 * @param limit - Number of items per page
 * @param offset - Current offset (0-indexed)
 * @returns Pagination metadata object
 * 
 * @example
 * ```typescript
 * const meta = formatPaginationMeta(100, 20, 40)
 * // Returns: {
 * //   total: 100,
 * //   limit: 20,
 * //   offset: 40,
 * //   hasMore: true,
 * //   page: 3,
 * //   totalPages: 5
 * // }
 * ```
 */
export function formatPaginationMeta(total: number, limit: number, offset: number) {
  return {
    total,
    limit,
    offset,
    hasMore: (offset + limit) < total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  };
}

