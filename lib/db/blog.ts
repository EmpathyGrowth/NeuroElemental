/**
 * Blog Repository
 * Manages blog post data and operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for blog management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import type { Database } from "@/lib/types/supabase";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BaseRepository } from "./base-repository";

type BlogPost = Database["public"]["Tables"]["blog_posts"]["Row"];
type BlogPostInsert = Database["public"]["Tables"]["blog_posts"]["Insert"];
type BlogPostUpdate = Database["public"]["Tables"]["blog_posts"]["Update"];

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
export class BlogRepository extends BaseRepository<"blog_posts"> {
  constructor(supabase?: SupabaseClient<Database>) {
    super("blog_posts", supabase);
  }

  /**
   * Get a single blog post by ID with author information
   */
  async getBlogPostWithAuthor(id: string): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching blog post with author", error as Error);
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get blog post by slug with author information
   */
  async getBlogPostBySlug(slug: string): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching blog post by slug", error as Error);
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get published blog post by slug (for public access)
   */
  async getPublishedBlogPostBySlug(
    slug: string
  ): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching published blog post by slug",
        error as Error
      );
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get featured blog post (most recent published post)
   */
  async getFeaturedPost(): Promise<BlogPostWithAuthor | null> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error("Error fetching featured blog post", error as Error);
      return null;
    }

    return data as BlogPostWithAuthor | null;
  }

  /**
   * Get blog posts by category
   */
  async getBlogPostsByCategory(
    category: string,
    options?: { limit?: number; offset?: number; excludeSlug?: string }
  ): Promise<BlogPostWithAuthor[]> {
    let query = this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("is_published", true)
      .eq("category", category)
      .order("published_at", { ascending: false });

    if (options?.excludeSlug) {
      query = query.neq("slug", options.excludeSlug);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      logger.error("Error fetching blog posts by category", error as Error);
      return [];
    }

    return (data as unknown as BlogPostWithAuthor[]) || [];
  }

  /**
   * Get related posts (same category, excluding current post)
   */
  async getRelatedPosts(
    currentSlug: string,
    category: string,
    limit: number = 3
  ): Promise<BlogPostWithAuthor[]> {
    return this.getBlogPostsByCategory(category, {
      limit,
      excludeSlug: currentSlug,
    });
  }

  /**
   * Get all distinct categories from published posts
   */
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from("blog_posts")
      .select("category")
      .eq("is_published", true)
      .not("category", "is", null);

    if (error) {
      logger.error("Error fetching blog categories", error as Error);
      return [];
    }

    const categories = [
      ...new Set(data?.map((d) => d.category).filter(Boolean) || []),
    ];
    return categories as string[];
  }

  /**
   * Get all published blog posts with optional category filter and search
   */
  async getPublishedPosts(options?: {
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ posts: BlogPostWithAuthor[]; count: number }> {
    let query = this.supabase
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)",
        { count: "exact" }
      )
      .eq("is_published", true)
      .order("published_at", { ascending: false });

    if (options?.category) {
      query = query.eq("category", options.category);
    }

    if (options?.search) {
      query = query.or(
        `title.ilike.%${options.search}%,excerpt.ilike.%${options.search}%`
      );
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(
        options.offset,
        options.offset + (options.limit || 10) - 1
      );
    }

    const { data, error, count } = await query;

    if (error) {
      logger.error("Error fetching published blog posts", error as Error);
      return { posts: [], count: 0 };
    }

    return {
      posts: (data as unknown as BlogPostWithAuthor[]) || [],
      count: count || 0,
    };
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
        .from("blog_posts")
        .select(
          "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)",
          { count: "exact" }
        );

      if (filters?.published !== undefined) {
        query = query.eq("is_published", filters.published);
      }

      if (filters?.author_id) {
        query = query.eq("author_id", filters.author_id);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        logger.error("Error fetching blog posts", error as Error);
        throw internalError("Failed to fetch blog posts");
      }

      return {
        posts: (data as unknown as BlogPostWithAuthor[]) || [],
        count: count || 0,
      };
    } catch (err) {
      logger.error("Exception in getAllBlogPosts", err as Error);
      throw err;
    }
  }

  /**
   * Publish a blog post
   */
  async publishBlogPost(id: string): Promise<BlogPost> {
    return this.update(id, {
      is_published: true,
      published_at: new Date().toISOString(),
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
  async toggleBlogPostPublish(
    id: string,
    published: boolean
  ): Promise<BlogPost> {
    if (published) {
      return this.publishBlogPost(id);
    } else {
      return this.unpublishBlogPost(id);
    }
  }

  /**
   * Increment view count for a blog post
   */
  async incrementViewCount(id: string): Promise<void> {
    try {
      const post = await this.findById(id);
      const currentCount =
        ((post as Record<string, unknown>).view_count as number) || 0;

      await (this.supabase as any)
        .from("blog_posts")
        .update({ view_count: currentCount + 1 })
        .eq("id", id);
    } catch (err) {
      logger.error("Error incrementing view count", err as Error);
    }
  }

  /**
   * Calculate and set reading time for a blog post
   * Assumes average reading speed of 200 words per minute
   */
  calculateReadingTime(content: string): number {
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    return Math.max(1, readingTime); // Minimum 1 minute
  }

  /**
   * Update reading time for a blog post
   */
  async updateReadingTime(id: string, content: string): Promise<void> {
    const readingTime = this.calculateReadingTime(content);

    await (this.supabase as any)
      .from("blog_posts")
      .update({ reading_time_minutes: readingTime })
      .eq("id", id);
  }

  /**
   * Get popular posts by view count
   */
  async getPopularPosts(limit: number = 5): Promise<BlogPostWithAuthor[]> {
    const { data, error } = await (this.supabase as any)
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("is_published", true)
      .order("view_count", { ascending: false })
      .limit(limit);

    if (error) {
      logger.error("Error fetching popular posts", error as Error);
      return [];
    }

    return (data || []) as unknown as BlogPostWithAuthor[];
  }

  /**
   * Schedule a post for future publishing
   */
  async schedulePost(id: string, publishAt: Date): Promise<BlogPost> {
    const { data, error } = await (this.supabase as any)
      .from("blog_posts")
      .update({
        scheduled_publish_at: publishAt.toISOString(),
        is_published: false,
      })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error scheduling post", error as Error);
      throw internalError("Failed to schedule post");
    }

    return data as BlogPost;
  }

  /**
   * Get posts scheduled for publishing
   */
  async getScheduledPosts(): Promise<BlogPostWithAuthor[]> {
    const now = new Date().toISOString();

    const { data, error } = await (this.supabase as any)
      .from("blog_posts")
      .select(
        "*, author:profiles!blog_posts_author_id_fkey(id, full_name, avatar_url)"
      )
      .eq("is_published", false)
      .not("scheduled_publish_at", "is", null)
      .gte("scheduled_publish_at", now)
      .order("scheduled_publish_at", { ascending: true });

    if (error) {
      logger.error("Error fetching scheduled posts", error as Error);
      return [];
    }

    return (data || []) as unknown as BlogPostWithAuthor[];
  }

  /**
   * Publish scheduled posts that are due
   * Call this from a cron job
   */
  async publishScheduledPosts(): Promise<number> {
    const now = new Date().toISOString();

    const { data, error } = await (this.supabase as any)
      .from("blog_posts")
      .update({
        is_published: true,
        published_at: now,
        scheduled_publish_at: null,
      })
      .eq("is_published", false)
      .not("scheduled_publish_at", "is", null)
      .lte("scheduled_publish_at", now)
      .select("id");

    if (error) {
      logger.error("Error publishing scheduled posts", error as Error);
      return 0;
    }

    return data?.length || 0;
  }

  /**
   * Update SEO fields for a blog post
   */
  async updateSeoFields(
    id: string,
    seo: {
      meta_title?: string;
      meta_description?: string;
      og_image_url?: string;
    }
  ): Promise<BlogPost> {
    const { data, error } = await (this.supabase as any)
      .from("blog_posts")
      .update(seo)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating SEO fields", error as Error);
      throw internalError("Failed to update SEO fields");
    }

    return data as BlogPost;
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
export async function createBlogPost(
  post: Omit<BlogPostInsert, "id" | "created_at" | "updated_at">
) {
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
export async function updateBlogPost(
  id: string,
  updates: Partial<BlogPostUpdate>
) {
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
