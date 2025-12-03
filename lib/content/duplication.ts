/**
 * Content Duplication Service
 * Provides utilities for duplicating content across different content types
 *
 * Implements Requirements 16.2, 16.3, 16.5:
 * - Copy content with "(Copy)" suffix
 * - Set status to draft
 * - Generate unique slug
 */

import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logging";
import { internalError } from "@/lib/api";
import type { Database } from "@/lib/types/supabase";

type SupabaseClient = ReturnType<typeof createAdminClient>;

/**
 * Supported content types for duplication
 */
export type DuplicatableContentType =
  | "blog_post"
  | "course"
  | "email_template";

/**
 * Result of a duplication operation
 */
export interface DuplicationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Generate a unique slug by appending a suffix
 * Checks database to ensure uniqueness
 */
export async function generateUniqueSlug(
  supabase: SupabaseClient,
  tableName: string,
  baseSlug: string
): Promise<string> {
  let slug = `${baseSlug}-copy`;
  let counter = 1;
  let isUnique = false;

  while (!isUnique) {
    const { data } = await (supabase as any)
      .from(tableName)
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (!data) {
      isUnique = true;
    } else {
      counter++;
      slug = `${baseSlug}-copy-${counter}`;
    }
  }

  return slug;
}

/**
 * Append "(Copy)" suffix to a title
 * If title already ends with "(Copy)" or "(Copy N)", increment the number
 */
export function generateCopyTitle(originalTitle: string): string {
  // Check if title already has a copy suffix
  const copyPattern = /\s*\(Copy(?:\s+(\d+))?\)$/;
  const match = originalTitle.match(copyPattern);

  if (match) {
    const currentNum = match[1] ? parseInt(match[1], 10) : 1;
    return originalTitle.replace(copyPattern, ` (Copy ${currentNum + 1})`);
  }

  return `${originalTitle} (Copy)`;
}

/**
 * Duplicate a blog post
 * Creates a copy with "(Copy)" suffix, draft status, and unique slug
 */
export async function duplicateBlogPost(
  postId: string,
  userId?: string
): Promise<DuplicationResult<Database["public"]["Tables"]["blog_posts"]["Row"]>> {
  const supabase = createAdminClient();

  try {
    // Fetch original post
    const { data: original, error: fetchError } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("id", postId)
      .single();

    if (fetchError || !original) {
      logger.error("Failed to fetch blog post for duplication", fetchError);
      return { success: false, error: "Blog post not found" };
    }

    // Generate unique slug and title
    const newSlug = await generateUniqueSlug(supabase, "blog_posts", original.slug);
    const newTitle = generateCopyTitle(original.title);

    // Create duplicate with draft status
    const { data: duplicate, error: createError } = await supabase
      .from("blog_posts")
      .insert({
        title: newTitle,
        slug: newSlug,
        content: original.content,
        excerpt: original.excerpt,
        category: original.category,
        tags: original.tags,
        featured_image_url: original.featured_image_url,
        author_id: userId || original.author_id,
        is_published: false, // Always draft
        published_at: null,
      })
      .select()
      .single();

    if (createError || !duplicate) {
      logger.error("Failed to create blog post duplicate", createError);
      return { success: false, error: "Failed to create duplicate" };
    }

    return { success: true, data: duplicate };
  } catch (error) {
    logger.error("Error duplicating blog post", error as Error);
    return { success: false, error: "Unexpected error during duplication" };
  }
}

/**
 * Duplicate an email template
 * Creates a copy with "(Copy)" suffix, inactive status, and unique slug
 */
export async function duplicateEmailTemplate(
  templateId: string
): Promise<DuplicationResult<Database["public"]["Tables"]["email_templates"]["Row"]>> {
  const supabase = createAdminClient();

  try {
    // Fetch original template
    const { data: original, error: fetchError } = await (supabase as any)
      .from("email_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (fetchError || !original) {
      logger.error("Failed to fetch email template for duplication", fetchError);
      return { success: false, error: "Email template not found" };
    }

    // Generate unique slug and name
    const newSlug = await generateUniqueSlug(supabase, "email_templates", original.slug);
    const newName = generateCopyTitle(original.name);

    // Create duplicate with inactive status
    const { data: duplicate, error: createError } = await (supabase as any)
      .from("email_templates")
      .insert({
        name: newName,
        slug: newSlug,
        subject: original.subject,
        html_content: original.html_content,
        text_content: original.text_content,
        variables: original.variables,
        category: original.category,
        description: original.description,
        preview_text: original.preview_text,
        is_active: false, // Always inactive
      })
      .select()
      .single();

    if (createError || !duplicate) {
      logger.error("Failed to create email template duplicate", createError);
      return { success: false, error: "Failed to create duplicate" };
    }

    return { success: true, data: duplicate };
  } catch (error) {
    logger.error("Error duplicating email template", error as Error);
    return { success: false, error: "Unexpected error during duplication" };
  }
}

/**
 * Generic content duplication dispatcher
 */
export async function duplicateContent(
  contentType: DuplicatableContentType,
  contentId: string,
  userId?: string
): Promise<DuplicationResult> {
  switch (contentType) {
    case "blog_post":
      return duplicateBlogPost(contentId, userId);
    case "email_template":
      return duplicateEmailTemplate(contentId);
    case "course":
      // Course duplication is handled separately due to nested content
      return { success: false, error: "Use duplicateCourse for course duplication" };
    default:
      return { success: false, error: `Unsupported content type: ${contentType}` };
  }
}


/**
 * Course duplication result with nested content info
 */
export interface CourseDuplicationResult {
  success: boolean;
  data?: {
    course: Database["public"]["Tables"]["courses"]["Row"];
    modulesCount: number;
    lessonsCount: number;
  };
  error?: string;
}

/**
 * Duplicate a course with all its modules and lessons
 * Preserves order and relationships
 * Requirements: 16.4
 */
export async function duplicateCourse(
  courseId: string,
  userId?: string
): Promise<CourseDuplicationResult> {
  const supabase = createAdminClient();

  try {
    // Fetch original course
    const { data: originalCourse, error: courseError } = await supabase
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .single();

    if (courseError || !originalCourse) {
      logger.error("Failed to fetch course for duplication", courseError);
      return { success: false, error: "Course not found" };
    }

    // Generate unique slug and title
    const newSlug = await generateUniqueSlug(supabase, "courses", originalCourse.slug);
    const newTitle = generateCopyTitle(originalCourse.title);

    // Create duplicate course with draft status
    const { data: newCourse, error: createCourseError } = await supabase
      .from("courses")
      .insert({
        title: newTitle,
        slug: newSlug,
        subtitle: originalCourse.subtitle,
        description: originalCourse.description,
        long_description: originalCourse.long_description,
        category: originalCourse.category,
        difficulty_level: originalCourse.difficulty_level,
        duration_hours: originalCourse.duration_hours,
        price_usd: originalCourse.price_usd,
        thumbnail_url: originalCourse.thumbnail_url,
        preview_video_url: originalCourse.preview_video_url,
        tags: originalCourse.tags,
        instructor_name: originalCourse.instructor_name,
        created_by: userId || originalCourse.created_by,
        is_published: false, // Always draft
        enrollment_count: 0, // Reset enrollment count
      })
      .select()
      .single();

    if (createCourseError || !newCourse) {
      logger.error("Failed to create course duplicate", createCourseError);
      return { success: false, error: "Failed to create course duplicate" };
    }

    // Fetch original modules
    const { data: originalModules, error: modulesError } = await supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (modulesError) {
      logger.error("Failed to fetch modules for duplication", modulesError);
      // Course created but modules failed - return partial success
      return {
        success: true,
        data: { course: newCourse, modulesCount: 0, lessonsCount: 0 },
      };
    }

    let totalLessonsCount = 0;
    const moduleIdMap = new Map<string, string>(); // old ID -> new ID

    // Duplicate modules
    for (const originalModule of originalModules || []) {
      const { data: newModule, error: createModuleError } = await supabase
        .from("course_modules")
        .insert({
          course_id: newCourse.id,
          title: originalModule.title,
          description: originalModule.description,
          order_index: originalModule.order_index,
        })
        .select()
        .single();

      if (createModuleError || !newModule) {
        logger.error("Failed to create module duplicate", createModuleError);
        continue;
      }

      moduleIdMap.set(originalModule.id, newModule.id);

      // Fetch and duplicate lessons for this module
      const { data: originalLessons, error: lessonsError } = await supabase
        .from("course_lessons")
        .select("*")
        .eq("module_id", originalModule.id)
        .order("order_index", { ascending: true });

      if (lessonsError) {
        logger.error("Failed to fetch lessons for duplication", lessonsError);
        continue;
      }

      for (const originalLesson of originalLessons || []) {
        const { error: createLessonError } = await supabase
          .from("course_lessons")
          .insert({
            module_id: newModule.id,
            title: originalLesson.title,
            content_type: originalLesson.content_type,
            content_text: originalLesson.content_text,
            content_url: originalLesson.content_url,
            duration_minutes: originalLesson.duration_minutes,
            order_index: originalLesson.order_index,
            is_preview: originalLesson.is_preview,
          });

        if (createLessonError) {
          logger.error("Failed to create lesson duplicate", createLessonError);
          continue;
        }

        totalLessonsCount++;
      }
    }

    return {
      success: true,
      data: {
        course: newCourse,
        modulesCount: moduleIdMap.size,
        lessonsCount: totalLessonsCount,
      },
    };
  } catch (error) {
    logger.error("Error duplicating course", error as Error);
    return { success: false, error: "Unexpected error during course duplication" };
  }
}
