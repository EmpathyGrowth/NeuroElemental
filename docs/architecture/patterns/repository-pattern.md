# Repository Pattern Guide

**Last Updated**: 2025-11-25
**Pattern Type**: Data Access
**Status**: ✅ Active

## Overview

The Repository Pattern provides a centralized, consistent interface for all database interactions. All repositories extend `BaseRepository`, which provides standard CRUD operations and common query patterns.

### Benefits
- **Consistency**: Uniform API across all data access
- **Type Safety**: Full TypeScript support with auto-completion
- **Testability**: Easy to mock for unit tests
- **Maintainability**: Single source of truth for queries
- **Performance**: Built-in caching and optimization

---

## BaseRepository

### Standard Methods

All repositories inherit these methods from `BaseRepository`:

```typescript
// Single record operations
async findById(id: string): Promise<T>
async findByIdOrNull(id: string): Promise<T | null>
async findOne(filters: Partial<T>): Promise<T>
async findBy(column: string, value: any): Promise<T | null>

// Multiple record operations
async findAll(filters?: Partial<T>, options?: QueryOptions): Promise<T[]>
async findMany(filters: Partial<T>): Promise<T[]>

// Create operations
async create(data: InsertType<T>): Promise<T>
async createMany(data: InsertType<T>[]): Promise<T[]>

// Update operations
async update(id: string, data: UpdateType<T>): Promise<T>
async updateMany(filters: Partial<T>, data: UpdateType<T>): Promise<number>

// Delete operations
async delete(id: string): Promise<void>
async deleteMany(filters: Partial<T>): Promise<number>

// Utility operations
async count(filters?: Partial<T>): Promise<number>
async exists(filters: Partial<T>): Promise<boolean>
async paginate(options: PaginationOptions): Promise<PaginatedResult<T>>
```

---

## Creating a Custom Repository

### Basic Structure

```typescript
import { BaseRepository } from './base-repository';
import type { Database } from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

type Course = Database['public']['Tables']['courses']['Row'];
type CourseInsert = Database['public']['Tables']['courses']['Insert'];
type CourseUpdate = Database['public']['Tables']['courses']['Update'];

export class CourseRepository extends BaseRepository<'courses'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('courses', supabase);
  }

  // Domain-specific methods below
}

// Export singleton instance
export const courseRepository = new CourseRepository();
```

### Adding Custom Methods

```typescript
export class CourseRepository extends BaseRepository<'courses'> {
  // ... constructor

  /**
   * Get course by slug
   */
  async getCourseBySlug(slug: string): Promise<Course | null> {
    return this.findBy('slug', slug);
  }

  /**
   * Get all published courses
   */
  async getPublishedCourses(): Promise<Course[]> {
    return this.findAll({ is_published: true } as Partial<Course>);
  }

  /**
   * Get courses with enrollments (join)
   */
  async getCoursesWithEnrollments(): Promise<CourseWithEnrollments[]> {
    const { data, error } = await this.supabase
      .from('courses')
      .select(`
        *,
        enrollments:course_enrollments(count)
      `)
      .eq('is_published', true);

    if (error) {
      this.handleError(error, 'getCoursesWithEnrollments');
    }

    return data as CourseWithEnrollments[];
  }
}
```

---

## Usage Examples

### Basic CRUD

```typescript
import { courseRepository } from '@/lib/db/courses';

// Create
const course = await courseRepository.create({
  title: 'TypeScript for Neurodivergent Developers',
  slug: 'typescript-nd',
  is_published: false
});

// Read
const course = await courseRepository.findById('course-123');
const courses = await courseRepository.findAll();
const published = await courseRepository.getPublishedCourses();

// Update
await courseRepository.update('course-123', {
  is_published: true
});

// Delete
await courseRepository.delete('course-123');
```

### Pagination

```typescript
const result = await courseRepository.paginate({
  page: 1,
  limit: 20,
  filters: { is_published: true },
  orderBy: { column: 'created_at', direction: 'desc' }
});

console.log(result.data);       // Course[]
console.log(result.meta.total); // Total count
console.log(result.meta.pages); // Total pages
```

### Error Handling

Repositories throw errors instead of returning `{ data, error }`:

```typescript
try {
  const course = await courseRepository.findById('invalid-id');
} catch (error) {
  if (error instanceof NotFoundError) {
    // Handle not found
  }
}
```

---

## Testing Repositories

### Unit Tests

```typescript
import { CourseRepository } from '@/lib/db/courses';
import { createMockSupabaseClient } from '@/__tests__/utils/supabase-mock';

describe('CourseRepository', () => {
  let repository: CourseRepository;
  let mockSupabase: ReturnType<typeof createMockSupabaseClient>;

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    repository = new CourseRepository(mockSupabase);
  });

  it('should find course by slug', async () => {
    mockSupabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({
        data: { id: '1', slug: 'test-course' },
        error: null
      })
    });

    const course = await repository.getCourseBySlug('test-course');
    expect(course).toBeDefined();
    expect(course?.slug).toBe('test-course');
  });
});
```

---

## Migration from Standalone Functions

### ❌ Old Pattern (Deprecated)

```typescript
// Standalone function - DEPRECATED
export async function getCourseBySlug(slug: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  return { data, error };
}
```

### ✅ New Pattern (Repository)

```typescript
// Repository method
export class CourseRepository extends BaseRepository<'courses'> {
  async getCourseBySlug(slug: string): Promise<Course | null> {
    return this.findBy('slug', slug);
  }
}

// Usage
const course = await courseRepository.getCourseBySlug('test-course');
```

### Migration Steps

1. **Add method to repository class**
2. **Mark standalone function as `@deprecated`**
3. **Update consuming code** to use repository
4. **Remove deprecated function** (Phase 6)

Example deprecated wrapper:

```typescript
/**
 * @deprecated Use courseRepository.getCourseBySlug() instead
 */
export async function getCourseBySlug(slug: string) {
  return courseRepository.getCourseBySlug(slug);
}
```

---

## Best Practices

### ✅ DO

- **Extend BaseRepository** for all data access
- **Use singleton instances** for repositories
- **Throw errors** instead of returning `{ data, error }`
- **Add explicit return types** to all methods
- **Document with JSDoc** including examples
- **Test custom methods** with unit tests

### ❌ DON'T

- **Don't create standalone query functions**
- **Don't return `{ data, error }` from repository methods**
- **Don't instantiate repositories multiple times**
- **Don't add business logic** to repositories (keep in services)
- **Don't bypass repositories** with direct Supabase calls

---

## Advanced Patterns

### Complex Joins

```typescript
async getUserWithOrganizations(userId: string) {
  const { data, error } = await this.supabase
    .from('profiles')
    .select(`
      *,
      organizations:organization_members(
        organization:organizations(*)
      )
    `)
    .eq('id', userId)
    .maybeSingle();

  if (error) this.handleError(error, 'getUserWithOrganizations');
  return data;
}
```

### Transactions

```typescript
async enrollInCourse(userId: string, courseId: string) {
  const { data, error } = await this.supabase.rpc('enroll_in_course', {
    p_user_id: userId,
    p_course_id: courseId
  });

  if (error) this.handleError(error, 'enrollInCourse');
  return data;
}
```

### Caching

```typescript
import { cacheManager, cacheKeys } from '@/lib/cache/cache-manager';

async getPublishedCourses(): Promise<Course[]> {
  return cacheManager.memoize(
    cacheKeys.courseList({ published: true }),
    async () => {
      return this.findAll({ is_published: true } as Partial<Course>);
    },
    { ttl: 300, namespace: 'courses' }
  );
}
```

---

## Related Documentation

- [BaseRepository Source](../../../lib/db/base-repository.ts)
- [Database Guide](../../database/schema.md)
- [Query Optimization](../../database/querying.md)
- [Testing Guide](../../testing/unit-testing.md)
- [Caching Pattern](./caching.md)

---

## ADRs

- [ADR-001: Repository Pattern Adoption](../adr/001-repository-pattern.md)
