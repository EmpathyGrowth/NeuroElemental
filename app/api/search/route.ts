/**
 * Global Search API
 * Search across courses, users, events, blog posts, etc.
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";

interface SearchResult {
  id: string;
  type: "course" | "user" | "event" | "blog" | "quiz";
  title: string;
  description?: string;
  url: string;
  image?: string;
  meta?: Record<string, unknown>;
}

/**
 * GET /api/search?q=query&type=course|user|event|blog&limit=10
 * Global search across multiple entities
 */
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const type = searchParams.get("type"); // Optional filter
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

  if (!query || query.length < 2) {
    throw badRequestError("Search query must be at least 2 characters");
  }

  const supabase = getSupabaseServer();
  const results: SearchResult[] = [];
  const searchPattern = `%${query}%`;

  // Search courses (public or enrolled)
  if (!type || type === "course") {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title, description, thumbnail_url, slug, is_published")
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .eq("is_published", true)
      .limit(limit);

    if (courses) {
      results.push(
        ...courses.map((course) => ({
          id: course.id,
          type: "course" as const,
          title: course.title,
          description: course.description || undefined,
          url: `/courses/${course.slug}`,
          image: course.thumbnail_url || undefined,
        }))
      );
    }
  }

  // Search events
  if (!type || type === "event") {
    const { data: events } = await supabase
      .from("events")
      .select("id, title, description, thumbnail_url, slug, is_published")
      .or(`title.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .eq("is_published", true)
      .limit(limit);

    if (events) {
      results.push(
        ...events.map((event) => ({
          id: event.id,
          type: "event" as const,
          title: event.title,
          description: event.description || undefined,
          url: `/events/${event.slug}`,
          image: event.thumbnail_url || undefined,
        }))
      );
    }
  }

  // Search blog posts
  if (!type || type === "blog") {
    const { data: posts } = await supabase
      .from("blog_posts")
      .select("id, title, excerpt, featured_image_url, slug, is_published")
      .or(`title.ilike.${searchPattern},excerpt.ilike.${searchPattern}`)
      .eq("is_published", true)
      .limit(limit);

    if (posts) {
      results.push(
        ...posts.map((post) => ({
          id: post.id,
          type: "blog" as const,
          title: post.title,
          description: post.excerpt || undefined,
          url: `/blog/${post.slug}`,
          image: post.featured_image_url || undefined,
        }))
      );
    }
  }

  // Search users (admins/instructors can search all, others can't search users)
  if (
    (!type || type === "user") &&
    (user.role === "admin" || user.role === "instructor")
  ) {
    const { data: users } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role")
      .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern}`)
      .limit(limit);

    if (users) {
      results.push(
        ...users.map((u) => ({
          id: u.id,
          type: "user" as const,
          title: u.full_name || u.email,
          description: u.role,
          url: `/dashboard/admin/users?search=${encodeURIComponent(u.email)}`,
          image: u.avatar_url || undefined,
          meta: { email: u.email, role: u.role },
        }))
      );
    }
  }

  // Search quizzes (if admin)
  if ((!type || type === "quiz") && user.role === "admin") {
    const { data: quizzes } = await supabase
      .from("quizzes")
      .select("id, title")
      .ilike("title", searchPattern)
      .limit(limit);

    if (quizzes) {
      results.push(
        ...quizzes.map((quiz) => ({
          id: quiz.id,
          type: "quiz" as const,
          title: quiz.title,
          url: `/dashboard/admin/quizzes/${quiz.id}/edit`,
        }))
      );
    }
  }

  // Sort by relevance (exact title match first)
  const lowerQuery = query.toLowerCase();
  results.sort((a, b) => {
    const aExact = a.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
    const bExact = b.title.toLowerCase().includes(lowerQuery) ? 0 : 1;
    return aExact - bExact;
  });

  return successResponse({
    query,
    results: results.slice(0, limit),
    total: results.length,
  });
});
