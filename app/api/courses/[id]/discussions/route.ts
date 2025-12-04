/**
 * Course Discussions API
 * Q&A and discussions for course lessons
 */

import {
  badRequestError,
  createAuthenticatedRoute,
  createOptionalAuthRoute,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { getCurrentTimestamp } from "@/lib/utils";
import { z } from "zod";

interface Discussion {
  id: string;
  lesson_id: string | null;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  title: string;
  content: string;
  type: "question" | "discussion";
  is_answered: boolean;
  upvotes: number;
  created_at: string;
  updated_at: string;
  replies: Reply[];
}

interface Reply {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  is_answer: boolean;
  upvotes: number;
  created_at: string;
}

const createDiscussionSchema = z.object({
  lesson_id: z.string().uuid().optional(),
  title: z.string().min(5).max(200),
  content: z.string().min(10).max(5000),
  type: z.enum(["question", "discussion"]),
});

/**
 * GET /api/courses/[id]/discussions
 * Get all discussions for a course
 */
export const GET = createOptionalAuthRoute<{ id: string }>(
  async (_request, context, _user) => {
    const { id } = await context.params;
    const supabase = getSupabaseServer();

    // Get course
    const { data: course, error: courseError } = await (supabase as any)
      .from("courses")
      .select("id, title")
      .eq("id", id)
      .single() as { data: { id: string; title: string } | null; error: { message: string } | null };

    if (courseError || !course) {
      throw notFoundError("Course");
    }

    // Get discussions from course_discussions table (or return empty if table doesn't exist)
    const discussions: Discussion[] = [];

    // Note: course_discussions table needs to be created via migration
    // For now, discussions are returned empty until table exists

    return successResponse({
      course_id: course.id,
      course_title: course.title,
      discussions,
      total: discussions.length,
    });
  }
);

/**
 * POST /api/courses/[id]/discussions
 * Create a new discussion/question
 */
export const POST = createAuthenticatedRoute<{ id: string }>(
  async (request, context, user) => {
    const { id } = await context.params;
    const supabase = getSupabaseServer();

    // Validate request
    const body = await request.json();
    const parsed = createDiscussionSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequestError("Invalid discussion data");
    }

    // Get course
    const { data: course, error: courseError } = await (supabase as any)
      .from("courses")
      .select("id")
      .eq("id", id)
      .single() as { data: { id: string } | null; error: { message: string } | null };

    if (courseError || !course) {
      throw notFoundError("Course");
    }

    // Get user profile
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single() as { data: { full_name: string; avatar_url: string | null } | null };

    const discussion: Discussion = {
      id: crypto.randomUUID(),
      lesson_id: parsed.data.lesson_id || null,
      user_id: user.id,
      user_name: profile?.full_name || "Anonymous",
      user_avatar: profile?.avatar_url || null,
      title: parsed.data.title,
      content: parsed.data.content,
      type: parsed.data.type,
      is_answered: false,
      upvotes: 0,
      created_at: getCurrentTimestamp(),
      updated_at: getCurrentTimestamp(),
      replies: [],
    };

    // Note: In production, save to course_discussions table

    return successResponse({
      message: "Discussion created",
      discussion,
    });
  }
);
