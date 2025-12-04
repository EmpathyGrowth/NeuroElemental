/**
 * Certificate Repository
 * Manages course completion certificates
 *
 * Extends BaseRepository to inherit standard CRUD operations.
 * Contains domain-specific methods for certificate management.
 */

import { internalError } from "@/lib/api";
import { logger } from "@/lib/logging";
import { Database } from "@/lib/types/supabase";
import { BaseRepository } from "./base-repository";

type Certificate = Database["public"]["Tables"]["certificates"]["Row"];
type CertificateInsert = Database["public"]["Tables"]["certificates"]["Insert"];
type _CertificateUpdate =
  Database["public"]["Tables"]["certificates"]["Update"];

/**
 * Certificate Repository
 * Extends BaseRepository with certificate-specific operations
 */
export class CertificateRepository extends BaseRepository<"certificates"> {
  constructor() {
    super("certificates");
  }

  /**
   * Get certificate by verification code
   *
   * @param verificationCode - Verification code
   * @returns Certificate or null
   */
  async getByVerificationCode(
    verificationCode: string
  ): Promise<Certificate | null> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select("*")
      .eq("verification_code", verificationCode)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching certificate by verification code",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as Certificate | null;
  }

  /**
   * Get certificates by user ID
   *
   * @param userId - User ID
   * @returns Array of certificates
   */
  async getByUser(userId: string): Promise<Certificate[]> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .order("issued_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching user certificates",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as Certificate[];
  }

  /**
   * Get certificate for user and course
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns Certificate or null
   */
  async getByUserAndCourse(
    userId: string,
    courseId: string
  ): Promise<Certificate | null> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select("*")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();

    if (error) {
      logger.error(
        "Error fetching user course certificate",
        error instanceof Error ? error : new Error(String(error))
      );
      return null;
    }

    return data as Certificate | null;
  }

  /**
   * Create new certificate
   *
   * @param data - Certificate data
   * @returns Created certificate
   */
  async createCertificate(data: CertificateInsert): Promise<Certificate> {
    const { data: certificate, error } = await (this.supabase as any)
      .from("certificates")
      .insert(data)
      .select()
      .single() as { data: Certificate | null; error: Error | null };

    if (error || !certificate) {
      logger.error(
        "Error creating certificate",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to create certificate");
    }

    return certificate;
  }

  /**
   * Check if certificate exists for user and course
   *
   * @param userId - User ID
   * @param courseId - Course ID
   * @returns True if certificate exists
   */
  async hasCertificate(userId: string, courseId: string): Promise<boolean> {
    const certificate = await this.getByUserAndCourse(userId, courseId);
    return !!certificate;
  }

  /**
   * Get certificates by course
   *
   * @param courseId - Course ID
   * @returns Array of certificates
   */
  async getByCourse(courseId: string): Promise<Certificate[]> {
    const { data, error } = await this.supabase
      .from("certificates")
      .select("*")
      .eq("course_id", courseId)
      .order("issued_at", { ascending: false });

    if (error) {
      logger.error(
        "Error fetching course certificates",
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }

    return data as Certificate[];
  }

  /**
   * Update certificate URL
   *
   * @param certificateId - Certificate ID
   * @param certificateUrl - Certificate PDF URL
   * @returns Updated certificate
   */
  async updateCertificateUrl(
    certificateId: string,
    certificateUrl: string
  ): Promise<Certificate> {
    const { data, error } = await (this.supabase as any)
      .from("certificates")
      .update({ certificate_url: certificateUrl })
      .eq("id", certificateId)
      .select()
      .single() as { data: Certificate | null; error: Error | null };

    if (error || !data) {
      logger.error(
        "Error updating certificate URL",
        error instanceof Error ? error : new Error(String(error))
      );
      throw internalError("Failed to update certificate");
    }

    return data;
  }
}

/**
 * Singleton instance of CertificateRepository
 */
export const certificateRepository = new CertificateRepository();
