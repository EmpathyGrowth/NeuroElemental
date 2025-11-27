/**
 * Blog Repository
 * Manages blog post data and operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for blog management.
 */

import { internalError } from '@/lib/api';
import { logger } from '@/lib/logging';
import type { Database } from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];
type BlogPostInsert = Database['public']['Tables']['blog_posts']['Insert'];
type BlogPostUpdate = Database['public']['Tables']['blog_posts']['Update'];

/**
 * Blog post with author information
 */
export interface BlogPostWithAuthor extends BlogPost {
  author?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
}

/**
 * Blog Repository
 */
export class BlogRepository extends BaseRepository<'blog_posts'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('blog_posts', supabase);
  }

  /**
   * Get a single blog post by ID with author information
   */
  async getBlogPostWithAuthor(id: string): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select('*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching blog post with author', error as Error);
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get blog post by slug with author information
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from('blog_posts')
      .select('*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      logger.error('Error fetching blog post by slug', error as Error);
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get all blog posts with optional filters
   */
  async getAllBlogPosts(filters?: {
    published?: boolean;
    author_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ posts: BlogPostWithAuthor[]; count: number }> {
    try {
      let query = this.supabase
        .from('blog_posts')
        .select('*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)', { count: 'exact' });

      if (filters?.published !== undefined) {
        query = query.eq('is_published', filters.published);
      }

      if (filters?.author_id) {
        query = query.eq('author_id', filters.author_id);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error('Error fetching blog posts', error as Error);
        throw internalError('Failed to fetch blog posts');
      }

      return { posts: (data as unknown as BlogPostWithAuthor[]) || [], count: count || 0 };
    } catch (err) {
      logger.error('Exception in getAllBlogPosts', err as Error);
      throw err;
    }
  }

  /**
   * Publish a blog post
   */
  async publishBlogPost(id: string): Promise<BlogPost> {
    return this.update(id, {
      is_published: true,
      published_at: new Date().toISOString()
    } as BlogPostUpdate);
  }

  /**
   * Unpublish a blog post
   */
  async unpublishBlogPost(id: string): Promise<BlogPost> {
    return this.update(id, { is_published: false } as BlogPostUpdate);
  }

  /**
   * Toggle blog post publish status
   */
  async toggleBlogPostPublish(id: string, published: boolean): Promise<BlogPost> {
    if (published) {
      return this.publishBlogPost(id);
    } else {
      return this.unpublishBlogPost(id);
    }
  }
}

// Export singleton instance
export const blogRepository = new BlogRepository();

// Backward compatibility exports
/**
 * Get a blog post by ID (backward compatibility wrapper)
 * @deprecated Use blogRepository.findById() instead
 * @param id - Blog post ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getBlogPost('post-123');
 */
export async function getBlogPost(id: string) {
  try {
    const data = await blogRepository.findById(id);
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

/**
 * Get all blog posts with optional filters (backward compatibility wrapper)
 * @deprecated Use blogRepository.getAllBlogPosts() instead
 * @param filters - Optional filters for published status and author
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getAllBlogPosts({ published: true });
 */
export async function getAllBlogPosts(filters?: {
  published?: boolean;
  author_id?: string;
  limit?: number;
  offset?: number;
}) {
  try {
    const { posts, count } = await blogRepository.getAllBlogPosts(filters);
    return { data: posts, error: null, count };
  } catch (err) {
    return { data: null, error: err, count: 0 };
  }
}

/**
 * Create a new blog post (backward compatibility wrapper)
 * @deprecated Use blogRepository.create() instead
 * @param post - Blog post data to insert
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await createBlogPost({ title: 'My Post', slug: 'my-post', content: 'Content here' });
 */
export async function createBlogPost(post: Omit<BlogPostInsert, 'id' | 'created_at' | 'updated_at'>) {
  try {
    const data = await blogRepository.create(post as BlogPostInsert);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Update a blog post (backward compatibility wrapper)
 * @deprecated Use blogRepository.update() instead
 * @param id - Blog post ID
 * @param updates - Blog post fields to update
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await updateBlogPost('post-123', { title: 'Updated Title' });
 */
export async function updateBlogPost(id: string, updates: Partial<BlogPostUpdate>) {
  try {
    const data = await blogRepository.update(id, updates);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Delete a blog post (backward compatibility wrapper)
 * @deprecated Use blogRepository.delete() instead
 * @param id - Blog post ID
 * @returns Object with error property
 * @example
 * const { error } = await deleteBlogPost('post-123');
 */
export async function deleteBlogPost(id: string) {
  try {
    await blogRepository.delete(id);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Publish a blog post (backward compatibility wrapper)
 * @deprecated Use blogRepository.publishBlogPost() instead
 * @param id - Blog post ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await publishBlogPost('post-123');
 */
export async function publishBlogPost(id: string) {
  try {
    const data = await blogRepository.publishBlogPost(id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Unpublish a blog post (backward compatibility wrapper)
 * @deprecated Use blogRepository.unpublishBlogPost() instead
 * @param id - Blog post ID
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await unpublishBlogPost('post-123');
 */
export async function unpublishBlogPost(id: string) {
  try {
    const data = await blogRepository.unpublishBlogPost(id);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Toggle blog post publish status (backward compatibility wrapper)
 * @deprecated Use blogRepository.toggleBlogPostPublish() instead
 * @param id - Blog post ID
 * @param published - New published status
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await toggleBlogPostPublish('post-123', true);
 */
export async function toggleBlogPostPublish(id: string, published: boolean) {
  try {
    const data = await blogRepository.toggleBlogPostPublish(id, published);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get a blog post by slug (backward compatibility wrapper)
 * @deprecated Use blogRepository.getBlogPostBySlug() instead
 * @param slug - Blog post slug
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getBlogPostBySlug('my-blog-post');
 */
export async function getBlogPostBySlug(slug: string) {
  try {
    const data = await blogRepository.getBlogPostBySlug(slug);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}
