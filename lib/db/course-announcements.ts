/**
 * Course Announcements Repository
 * Manages instructor announcements for courses
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 */

import { forbiddenError, internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type CourseAnnouncement =
  Database["public"]["Tables"]["course_announcements"]["Row"];
type CourseAnnouncementInsert =
  Database["public"]["Tables"]["course_announcements"]["Insert"];
type CourseAnnouncementUpdate =
  Database["public"]["Tables"]["course_announcements"]["Update"];

/** Announcement with instructor info */
export interface AnnouncementWithInstructor extends CourseAnnouncement {
  instructor: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/** Announcement with course info */
export interface AnnouncementWithCourse extends CourseAnnouncement {
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
  instructor: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

/**
 * Course Announcements Repository
 */
export class CourseAnnouncementsRepository extends BaseRepository<"course_announcements"> {
  constructor() {
    super("course_announcements");
  }

  /**
   * Get announcements for a course
   */
  async getCourseAnnouncements(
    courseId: string
  ): Promise<AnnouncementWithInstructor[]> {
    const { data, error } = await this.supabase
      .from("course_announcements")
      .select(
        `
        *,
        instructor:profiles(id, full_name, avatar_url)
      `
      )
      .eq("course_id", courseId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching course announcements", error);
      return [];
    }

    return (data || []) as unknown as AnnouncementWithInstructor[];
  }

  /**
   * Get pinned announcements for a course
   */
  async getPinnedAnnouncements(
    courseId: string
  ): Promise<AnnouncementWithInstructor[]> {
    const { data, error } = await this.supabase
      .from("course_announcements")
      .select(
        `
        *,
        instructor:profiles(id, full_name, avatar_url)
      `
      )
      .eq("course_id", courseId)
      .eq("is_pinned", true)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching pinned announcements", error);
      return [];
    }

    return (data || []) as unknown as AnnouncementWithInstructor[];
  }

  /**
   * Get all announcements for courses a user is enrolled in
   */
  async getUserCourseAnnouncements(
    userId: string
  ): Promise<AnnouncementWithCourse[]> {
    // First get user's enrolled courses
    const { data: enrollments, error: enrollError } = await this.supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", userId);

    if (enrollError || !enrollments || enrollments.length === 0) {
      return [];
    }

    const courseIds = enrollments
      .map((e) => e.course_id)
      .filter((id): id is string => id !== null);
    if (courseIds.length === 0) return [];

    // Get announcements for those courses
    const { data, error } = await this.supabase
      .from("course_announcements")
      .select(
        `
        *,
        course:courses(id, title, slug),
        instructor:profiles(id, full_name, avatar_url)
      `
      )
      .in("course_id", courseIds)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      logger.error("Error fetching user course announcements", error);
      return [];
    }

    return (data || []) as unknown as AnnouncementWithCourse[];
  }

  /**
   * Get recent announcements for a user (last 7 days)
   */
  async getRecentAnnouncements(
    userId: string
  ): Promise<AnnouncementWithCourse[]> {
    const sevenDaysAgo = new Date(
      Date.now() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    // First get user's enrolled courses
    const { data: enrollments, error: enrollError } = await this.supabase
      .from("course_enrollments")
      .select("course_id")
      .eq("user_id", userId);

    if (enrollError || !enrollments || enrollments.length === 0) {
      return [];
    }

    const courseIds = enrollments
      .map((e) => e.course_id)
      .filter((id): id is string => id !== null);
    if (courseIds.length === 0) return [];

    const { data, error } = await this.supabase
      .from("course_announcements")
      .select(
        `
        *,
        course:courses(id, title, slug),
        instructor:profiles(id, full_name, avatar_url)
      `
      )
      .in("course_id", courseIds)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching recent announcements", error);
      return [];
    }

    return (data || []) as unknown as AnnouncementWithCourse[];
  }

  /**
   * Create an announcement
   */
  async createAnnouncement(
    courseId: string,
    instructorId: string,
    title: string,
    content: string,
    isPinned: boolean = false
  ): Promise<CourseAnnouncement> {
    const insertData: CourseAnnouncementInsert = {
      course_id: courseId,
      instructor_id: instructorId,
      title,
      content,
      is_pinned: isPinned,
    };

    const { data, error } = await this.supabase
      .from("course_announcements")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error creating announcement", error);
      throw internalError("Failed to create announcement");
    }

    return data;
  }

  /**
   * Update an announcement
   */
  async updateAnnouncement(
    announcementId: string,
    instructorId: string,
    updates: { title?: string; content?: string; is_pinned?: boolean }
  ): Promise<CourseAnnouncement> {
    // Verify ownership
    const existing = await this.findById(announcementId);
    if (existing.instructor_id !== instructorId) {
      throw forbiddenError("Not authorized to edit this announcement");
    }

    const updateData: CourseAnnouncementUpdate = {
      ...updates,
    };

    const { data, error } = await this.supabase
      .from("course_announcements")
      .update(updateData)
      .eq("id", announcementId)
      .select()
      .single();

    if (error || !data) {
      logger.error("Error updating announcement", error);
      throw internalError("Failed to update announcement");
    }

    return data;
  }

  /**
   * Delete an announcement
   */
  async deleteAnnouncement(
    announcementId: string,
    instructorId: string
  ): Promise<void> {
    // Verify ownership
    const existing = await this.findById(announcementId);
    if (existing.instructor_id !== instructorId) {
      throw forbiddenError("Not authorized to delete this announcement");
    }

    const { error } = await this.supabase
      .from("course_announcements")
      .delete()
      .eq("id", announcementId);

    if (error) {
      logger.error("Error deleting announcement", error);
      throw internalError("Failed to delete announcement");
    }
  }

  /**
   * Toggle pin status
   */
  async togglePin(
    announcementId: string,
    instructorId: string
  ): Promise<CourseAnnouncement> {
    const existing = await this.findById(announcementId);
    if (existing.instructor_id !== instructorId) {
      throw forbiddenError("Not authorized to pin this announcement");
    }

    return this.updateAnnouncement(announcementId, instructorId, {
      is_pinned: !existing.is_pinned,
    });
  }

  /**
   * Get announcement count for course
   */
  async getCourseAnnouncementCount(courseId: string): Promise<number> {
    return this.count({ course_id: courseId });
  }
}

/** Singleton instance */
export const courseAnnouncementsRepository =
  new CourseAnnouncementsRepository();
