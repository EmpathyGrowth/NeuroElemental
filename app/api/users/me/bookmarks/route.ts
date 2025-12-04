/**
 * User Bookmarks API
 * GET - List user's bookmarked lessons
 * POST - Add a bookmark
 * DELETE - Remove a bookmark
 *
 * NOTE: Table 'lesson_bookmarks' is defined in migration
 * 20250127_ui_ux_improvements.sql. Regenerate Supabase types to remove ts-expect-error comments.
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  formatPaginationMeta,
  getPaginationParams,
  internalError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { logger } from "@/lib/logging";
import { getCurrentTimestamp } from "@/lib/utils";

interface BookmarkRecord {
  id: string;
  user_id: string;
  lesson_id: string;
  note: string | null;
  created_at: string;
  lesson?: {
    id: string;
    title: string;
    slug: string;
    module?: {
      id: string;
      title: string;
      course?: {
        id: string;
        title: string;
        slug: string;
      };
    };
  };
}

// GET - Get user's bookmarks
export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = await getSupabaseServer();
  const { limit, offset } = getPaginationParams(request, { limit: 20 });

  const {
    data: bookmarks,
    error,
    count,
  } = (await supabase
    .from("lesson_bookmarks")
    .select(
      `
      *,
      lesson:lessons(
        id,
        title,
        slug,
        module:modules(
          id,
          title,
          course:courses(
            id,
            title,
            slug
          )
        )
      )
    `,
      { count: "exact" }
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)) as {
    data: BookmarkRecord[] | null;
    error: { message: string } | null;
    count: number | null;
  };

  if (error) {
    logger.error("Error fetching bookmarks", undefined, {
      errorMsg: error.message,
    });
    throw internalError("Failed to fetch bookmarks");
  }

  return successResponse({
    bookmarks: bookmarks || [],
    pagination: formatPaginationMeta(count || 0, limit, offset),
  });
});

// POST - Add a bookmark
export const POST = createAuthenticatedRoute(
  async (request, _context, user) => {
    const supabase = await getSupabaseServer();
    const body = await request.json();

    const { lesson_id, note } = body;

    if (!lesson_id) {
      throw badRequestError("lesson_id is required");
    }

    // Verify lesson exists

    const { data: lesson, error: lessonError } = await supabase
      .from("course_lessons")
      .select("id")
      .eq("id", lesson_id)
      .single();

    if (lessonError || !lesson) {
      throw badRequestError("Lesson not found");
    }

    // Create bookmark (upsert to handle duplicates gracefully)

    const { data: bookmark, error } = (await (supabase as any)
      .from("lesson_bookmarks")
      .upsert(
        {
          user_id: user.id,
          lesson_id,
          note: note || null,
          created_at: getCurrentTimestamp(),
        },
        {
          onConflict: "user_id,lesson_id",
        }
      )
      .select(
        `
      *,
      lesson:lessons(
        id,
        title,
        slug,
        module:modules(
          id,
          title,
          course:courses(
            id,
            title,
            slug
          )
        )
      )
    `
      )
      .single()) as {
      data: BookmarkRecord | null;
      error: { message: string } | null;
    };

    if (error) {
      logger.error("Error creating bookmark", undefined, {
        errorMsg: error.message,
      });
      throw internalError("Failed to create bookmark");
    }

    return successResponse({ bookmark }, 201);
  }
);

// DELETE - Remove a bookmark
export const DELETE = createAuthenticatedRoute(
  async (request, _context, user) => {
    const supabase = await getSupabaseServer();
    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lesson_id");

    if (!lessonId) {
      throw badRequestError("lesson_id is required");
    }

    const { error } = (await supabase
      .from("lesson_bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)) as { error: { message: string } | null };

    if (error) {
      logger.error("Error deleting bookmark", undefined, {
        errorMsg: error.message,
      });
      throw internalError("Failed to delete bookmark");
    }

    return successResponse({ deleted: true });
  }
);
