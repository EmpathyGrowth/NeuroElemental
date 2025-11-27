/**
 * Select Fragments
 *
 * Reusable select clause fragments for common database joins.
 * Reduces duplication in repository queries and API routes.
 */

/**
 * Common select fragments for Supabase queries
 * Use with template literals in .select() calls
 *
 * @example
 * ```typescript
 * const { data } = await supabase
 *   .from('courses')
 *   .select(`*, ${selectFragments.instructor}`)
 * ```
 */
export const selectFragments = {
  /**
   * Author profile fields (for blog posts, resources, etc.)
   * Expects foreign key: author_id -> profiles
   */
  author: `
    author:profiles!author_id(
      id,
      full_name,
      avatar_url
    )
  `.trim(),

  /**
   * Full author profile with bio
   */
  authorFull: `
    author:profiles!author_id(
      id,
      full_name,
      avatar_url,
      bio
    )
  `.trim(),

  /**
   * Instructor profile fields (for courses)
   * Expects foreign key: instructor_id -> profiles
   */
  instructor: `
    instructor:profiles!instructor_id(
      id,
      full_name,
      avatar_url,
      bio
    )
  `.trim(),

  /**
   * Basic instructor info (lighter weight)
   */
  instructorBasic: `
    instructor:profiles!instructor_id(
      id,
      full_name,
      avatar_url
    )
  `.trim(),

  /**
   * Organization info
   * Expects foreign key: organization_id -> organizations
   */
  organization: `
    organization:organizations(
      id,
      name,
      logo_url,
      slug
    )
  `.trim(),

  /**
   * User profile (generic)
   * Expects foreign key: user_id -> profiles
   */
  user: `
    user:profiles!user_id(
      id,
      full_name,
      avatar_url,
      email
    )
  `.trim(),

  /**
   * Category junction table
   * For tables with resource_categories pattern
   */
  categories: `
    categories:resource_categories(
      category:categories(*)
    )
  `.trim(),

  /**
   * Tags junction table
   * For tables with resource_tags pattern
   */
  tags: `
    tags:resource_tags(
      tag:tags(*)
    )
  `.trim(),

  /**
   * Course with all relations
   */
  courseWithRelations: `
    *,
    instructor:profiles!instructor_id(
      id,
      full_name,
      avatar_url,
      bio
    ),
    modules:course_modules(
      id,
      title,
      order_index,
      lessons:lessons(
        id,
        title,
        order_index,
        duration_minutes
      )
    )
  `.trim(),

  /**
   * Blog post with author
   */
  blogPostWithAuthor: `
    *,
    author:profiles!author_id(
      id,
      full_name,
      avatar_url
    )
  `.trim(),

  /**
   * Event with organizer
   */
  eventWithOrganizer: `
    *,
    organizer:profiles!organizer_id(
      id,
      full_name,
      avatar_url
    )
  `.trim(),

  /**
   * Review with user
   */
  reviewWithUser: `
    *,
    user:profiles!user_id(
      id,
      full_name,
      avatar_url
    )
  `.trim(),
} as const;

/**
 * Build a custom select fragment with specified fields
 *
 * @param relation - The relation name (e.g., 'author', 'instructor')
 * @param table - The related table name
 * @param foreignKey - The foreign key field name
 * @param fields - Array of field names to select
 * @returns Formatted select fragment string
 *
 * @example
 * ```typescript
 * const fragment = buildSelectFragment('creator', 'profiles', 'creator_id', ['id', 'full_name']);
 * // Returns: "creator:profiles!creator_id(id, full_name)"
 * ```
 */
export function buildSelectFragment(
  relation: string,
  table: string,
  foreignKey: string,
  fields: string[]
): string {
  return `${relation}:${table}!${foreignKey}(${fields.join(', ')})`;
}

/**
 * Combine multiple select fragments with base fields
 *
 * @param baseFields - Base fields to select (e.g., '*' or 'id, title')
 * @param fragments - Array of fragment keys from selectFragments
 * @returns Combined select string
 *
 * @example
 * ```typescript
 * const select = combineFragments('*', ['author', 'categories']);
 * ```
 */
export function combineFragments(
  baseFields: string,
  fragments: (keyof typeof selectFragments)[]
): string {
  const fragmentStrings = fragments.map((key) => selectFragments[key]);
  return [baseFields, ...fragmentStrings].join(', ');
}
