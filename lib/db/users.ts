import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { subDays } from "date-fns";
import { BaseRepository, PaginatedResult } from "./base-repository";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

/**
 * User/Profile Repository
 * Manages user profile data and authentication-related operations
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for user management.
 */
export class UserRepository extends BaseRepository<"profiles"> {
  constructor() {
    super("profiles");
  }

  /**
   * Find a user by email address
   *
   * @param email - The email address to search for
   * @returns The user profile or null if not found
   */
  async findByEmail(email: string): Promise<Profile | null> {
    return this.findBy("email", email);
  }

  /**
   * Update a user's role
   *
   * @param userId - The ID of the user to update
   * @param role - The new role to assign
   * @returns The updated user profile
   * @throws {ApiError} If the update fails
   */
  async updateRole(userId: string, role: string): Promise<Profile> {
    return this.update(userId, { role } as ProfileUpdate);
  }

  /**
   * Get all users with a specific role
   *
   * @param role - The role to filter by
   * @returns Array of user profiles with the specified role
   */
  async getUsersByRole(role: string): Promise<Profile[]> {
    return this.findAll({ role } as Partial<Profile>, {
      orderBy: { column: "created_at", ascending: false },
    });
  }

  /**
   * Search users by name or email using case-insensitive pattern matching
   *
   * @param query - The search query string
   * @param limit - Maximum number of results to return (default: 20)
   * @returns Array of matching user profiles
   */
  async searchUsers(query: string, limit: number = 20): Promise<Profile[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*")
      .or(`full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(limit);

    if (error) {
      logger.error(
        "Error searching users",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to search users");
    }

    return data || [];
  }

  /**
   * Update user profile information
   * Uses the base repository's update method with automatic timestamp handling
   *
   * @param userId - The ID of the user to update
   * @param updates - Partial profile data to update
   * @returns The updated user profile
   * @throws {ApiError} If the update fails
   */
  async updateProfile(
    userId: string,
    updates: Partial<ProfileUpdate>
  ): Promise<Profile> {
    return this.update(userId, updates);
  }

  /**
   * Get users with pagination and optional filters
   *
   * @param page - Page number (1-indexed)
   * @param limit - Number of results per page
   * @param filters - Optional filters for role and search query
   * @returns Paginated result with user profiles
   */
  async getPaginated(
    page: number = 1,
    limit: number = 20,
    filters?: {
      role?: string;
      search?: string;
    }
  ): Promise<PaginatedResult<Profile>> {
    // If there's a search query, we need custom logic for the OR condition
    if (filters?.search) {
      const offset = (page - 1) * limit;
      let query = this.supabase
        .from("profiles")
        .select("*", { count: "exact" });

      // Apply role filter if present
      if (filters.role) {
        query = query.eq("role", filters.role);
      }

      // Apply search filter
      query = query.or(
        `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      );

      // Apply pagination and ordering
      query = query
        .range(offset, offset + limit - 1)
        .order("created_at", { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        logger.error(
          "Error fetching paginated users",
          error instanceof Error ? error : new Error(String(error))
        );
        throw internalError("Failed to fetch paginated users");
      }

      return {
        data: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      };
    }

    // Use base repository's paginate method for simple role filtering
    const paginationFilters = filters?.role
      ? { role: filters.role }
      : undefined;
    return this.paginate({
      page,
      limit,
      filters: paginationFilters,
      orderBy: { column: "created_at", ascending: false },
    });
  }

  /**
   * Check if an email address is already registered
   *
   * @param email - The email address to check
   * @returns True if the email is taken, false otherwise
   */
  async isEmailTaken(email: string): Promise<boolean> {
    const count = await this.count({ email } as Partial<Profile>);
    return count > 0;
  }

  /**
   * Get recently registered users
   *
   * @param limit - Maximum number of users to return (default: 10)
   * @returns Array of recently registered user profiles
   */
  async getRecentUsers(limit: number = 10): Promise<Profile[]> {
    return this.findAll(undefined, {
      orderBy: { column: "created_at", ascending: false },
      limit,
    });
  }

  /**
   * Soft delete a user by anonymizing their data
   * Updates email and name to indicate deletion
   * Note: The profiles table does not have a deleted_at field
   *
   * @param userId - The ID of the user to soft delete
   * @throws {ApiError} If the soft delete fails
   */
  async softDelete(userId: string): Promise<void> {
    const updates: ProfileUpdate = {
      email: `deleted_${userId}@deleted.com`,
      full_name: "Deleted User",
    };

    await this.update(userId, updates);
  }

  // ==========================================
  // Onboarding State Management
  // ==========================================

  /**
   * Update the user's current onboarding step
   * Allows users to resume onboarding from where they left off
   *
   * @param userId - The ID of the user
   * @param step - The current step ID (e.g., 'welcome', 'role', 'profile', 'assessment', 'complete')
   * @returns The updated profile
   */
  async updateOnboardingStep(userId: string, step: string): Promise<Profile> {
    return this.update(userId, {
      onboarding_current_step: step,
    } as ProfileUpdate);
  }

  /**
   * Mark onboarding as completed for a user
   * Sets the completion timestamp and clears the current step
   *
   * @param userId - The ID of the user
   * @returns The updated profile
   */
  async completeOnboarding(userId: string): Promise<Profile> {
    return this.update(userId, {
      onboarding_current_step: null,
      onboarding_completed_at: new Date().toISOString(),
    } as ProfileUpdate);
  }

  /**
   * Get the onboarding status for a user
   *
   * @param userId - The ID of the user
   * @returns Object with current step and completion status
   */
  async getOnboardingStatus(userId: string): Promise<{
    currentStep: string | null;
    completedAt: string | null;
    isCompleted: boolean;
  }> {
    const profile = await this.findById(userId);
    if (!profile) {
      return { currentStep: null, completedAt: null, isCompleted: false };
    }

    return {
      currentStep: profile.onboarding_current_step ?? null,
      completedAt: profile.onboarding_completed_at ?? null,
      isCompleted: !!profile.onboarding_completed_at,
    };
  }

  // ==========================================
  // Profile Relations
  // ==========================================

  /**
   * Get full profile with related data (enrollments, certifications, reviews, organization)
   *
   * @param userId - The user ID
   * @returns The profile with all relations
   */
  async getProfileWithRelations(userId: string): Promise<any> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select(
        `
        *,
        enrollments:course_enrollments(
          course:courses(
            id,
            title,
            slug,
            thumbnail_url
          ),
          progress,
          completed_at
        ),
        certifications:certifications(
          id,
          course:courses(title),
          issued_at,
          certificate_url
        ),
        reviews:reviews(
          id,
          course:courses(title),
          rating,
          content,
          created_at
        ),
        organization:organization_members!inner(
          organization:organizations(
            id,
            name,
            logo_url
          ),
          role
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) {
      logger.error(
        "Error fetching profile with relations",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch profile");
    }

    return data;
  }

  /**
   * Get statistics for the admin dashboard
   *
   * @returns Object with user statistics
   */
  async getAdminStats() {
    const weekAgo = subDays(new Date(), 7).toISOString();

    // We use Promise.all to run these in parallel
    const [totalUsers, activeUsers, instructors, pendingInstructors] =
      await Promise.all([
        // Total users
        this.count(),
        // Active users (last 7 days)
        this.supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("updated_at", weekAgo)
          .then((res) => res.count || 0),
        // Instructors
        this.count({ role: "instructor" } as Partial<Profile>),
        // Pending instructors
        this.count({ instructor_status: "pending" } as Partial<Profile>),
      ]);

    return {
      totalUsers,
      activeUsers,
      instructors,
      pendingInstructors,
    };
  }

  /**
   * Get related counts (enrollments, certificates) for a list of users
   *
   * @param userIds - Array of user IDs
   * @returns Object mapping user IDs to counts
   */
  async getUserRelatedCounts(userIds: string[]) {
    if (userIds.length === 0) {
      return { enrollments: {}, certificates: {} };
    }

    const [enrollmentsRes, certificatesRes] = await Promise.all([
      this.supabase
        .from("course_enrollments")
        .select("user_id")
        .in("user_id", userIds),
      this.supabase
        .from("certificates")
        .select("user_id")
        .in("user_id", userIds),
    ]);

    const enrollmentCounts: Record<string, number> = {};
    enrollmentsRes.data?.forEach((e) => {
      if (e.user_id) {
        enrollmentCounts[e.user_id] = (enrollmentCounts[e.user_id] || 0) + 1;
      }
    });

    const certificateCounts: Record<string, number> = {};
    certificatesRes.data?.forEach((c) => {
      if (c.user_id) {
        certificateCounts[c.user_id] = (certificateCounts[c.user_id] || 0) + 1;
      }
    });

    return {
      enrollments: enrollmentCounts,
      certificates: certificateCounts,
    };
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
