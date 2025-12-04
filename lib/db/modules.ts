/**
 * Module Repository
 * Manages course modules and their lessons
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for module and lesson management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type Module = Database["public"]["Tables"]["course_modules"]["Row"];
type ModuleInsert = Database["public"]["Tables"]["course_modules"]["Insert"];
type ModuleUpdate = Database["public"]["Tables"]["course_modules"]["Update"];
type Lesson = Database["public"]["Tables"]["course_lessons"]["Row"];
type _LessonInsert = Database["public"]["Tables"]["course_lessons"]["Insert"];

/**
 * Module with its lessons
 */
export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

/**
 * Module Repository
 * Extends BaseRepository with module-specific operations
 */
export class ModuleRepository extends BaseRepository<"course_modules"> {
  constructor() {
    super("course_modules");
  }

  /**
   * Get modules for a course
   *
   * @param courseId - Course ID
   * @returns Array of modules ordered by order_index
   */
  async getByCourse(courseId: string): Promise<Module[]> {
    const { data, error } = await this.supabase
      .from("course_modules")
      .select("*")
      .eq("course_id", courseId)
      .order("order_index", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching course modules",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to fetch course modules");
    }

    return data as Module[];
  }

  /**
   * Get modules with their lessons for a course
   *
   * @param courseId - Course ID
   * @returns Array of modules with nested lessons
   */
  async getWithLessons(courseId: string): Promise<ModuleWithLessons[]> {
    // Get modules
    const modules = await this.getByCourse(courseId);

    if (modules.length === 0) {
      return [];
    }

    // Get all lessons for these modules
    const moduleIds = modules.map((m) => m.id);
    const { data: lessons, error } = await this.supabase
      .from("course_lessons")
      .select("*")
      .in("module_id", moduleIds)
      .order("order_index", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching module lessons",
        error instanceof Error ? error : new Error(String(error))
      );
      // Return modules without lessons on error
      return modules.map((module) => ({
        ...module,
        lessons: [],
      }));
    }

    // Group lessons by module
    const lessonsByModule = new Map<string, Lesson[]>();
    (lessons || []).forEach((lesson: Lesson) => {
      if (!lesson.module_id) return;

      if (!lessonsByModule.has(lesson.module_id)) {
        lessonsByModule.set(lesson.module_id, []);
      }
      lessonsByModule.get(lesson.module_id)!.push(lesson);
    });

    // Combine modules with their lessons
    return modules.map((module) => ({
      ...module,
      lessons: lessonsByModule.get(module.id) || [],
    }));
  }

  /**
   * Get module by ID with lessons
   *
   * @param moduleId - Module ID
   * @returns Module with lessons
   */
  async getByIdWithLessons(moduleId: string): Promise<ModuleWithLessons> {
    const module = await this.findById(moduleId);

    const { data: lessons, error } = await this.supabase
      .from("course_lessons")
      .select("*")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });

    if (error) {
      logger.error(
        "Error fetching module lessons",
        error instanceof Error ? error : new Error(String(error))
      );
      return {
        ...module,
        lessons: [],
      };
    }

    return {
      ...module,
      lessons: (lessons || []) as Lesson[],
    };
  }

  /**
   * Create new module
   *
   * @param data - Module data
   * @returns Created module
   */
  async createModule(data: ModuleInsert): Promise<Module> {
    const { data: module, error } = await (this.supabase as any)
      .from("course_modules")
      .insert(data)
      .select()
      .single() as { data: Module | null; error: Error | null };

    if (error || !module) {
      logger.error(
        "Error creating module",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create module");
    }

    return module;
  }

  /**
   * Update module
   *
   * @param moduleId - Module ID
   * @param data - Module update data
   * @returns Updated module
   */
  async updateModule(moduleId: string, data: ModuleUpdate): Promise<Module> {
    const { data: module, error } = await (this.supabase as any)
      .from("course_modules")
      .update(data)
      .eq("id", moduleId)
      .select()
      .single() as { data: Module | null; error: Error | null };

    if (error || !module) {
      logger.error(
        "Error updating module",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update module");
    }

    return module;
  }

  /**
   * Delete module
   *
   * @param moduleId - Module ID
   */
  async deleteModule(moduleId: string): Promise<void> {
    const { error } = await this.supabase
      .from("course_modules")
      .delete()
      .eq("id", moduleId);

    if (error) {
      logger.error(
        "Error deleting module",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to delete module");
    }
  }

  /**
   * Reorder modules
   *
   * @param moduleOrders - Array of {id, order_index} objects
   * @returns Updated modules
   */
  async reorderModules(
    moduleOrders: Array<{ id: string; order_index: number }>
  ): Promise<Module[]> {
    const updates = moduleOrders.map(({ id, order_index }) =>
      this.updateModule(id, { order_index })
    );

    const modules = await Promise.all(updates);
    return modules;
  }

  /**
   * Get lesson count for module
   *
   * @param moduleId - Module ID
   * @returns Number of lessons
   */
  async getLessonCount(moduleId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from("course_lessons")
      .select("*", { count: "exact", head: true })
      .eq("module_id", moduleId);

    if (error) {
      logger.error(
        "Error counting module lessons",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return count || 0;
  }

  /**
   * Get total duration for module
   *
   * @param moduleId - Module ID
   * @returns Total duration in minutes
   */
  async getTotalDuration(moduleId: string): Promise<number> {
    const { data: lessons, error } = await (this.supabase as any)
      .from("course_lessons")
      .select("duration_minutes")
      .eq("module_id", moduleId) as { data: { duration_minutes: number | null }[] | null; error: Error | null };

    if (error || !lessons) {
      logger.error(
        "Error fetching lesson durations",
        error instanceof Error ? error : new Error(String(error))
      );
      return 0;
    }

    return lessons.reduce(
      (total, lesson) => total + (lesson.duration_minutes || 0),
      0
    );
  }
}

/**
 * Singleton instance of ModuleRepository
 */
export const moduleRepository = new ModuleRepository();
