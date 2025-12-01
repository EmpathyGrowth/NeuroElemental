/**
 * GDPR Data Export & Deletion Management
 * Implements GDPR Article 20 (Right to Data Portability) and Article 17 (Right to Erasure)
 */

import { getSupabaseServer } from "@/lib/db/supabase-server";
import { logger } from "@/lib/logging/logger";

export interface DataExportRequest {
  id: string;
  user_id: string;
  organization_id?: string;
  export_type: "personal" | "organization";
  export_format: "json" | "csv_zip";
  include_profile: boolean;
  include_activity: boolean;
  include_memberships: boolean;
  include_api_keys: boolean;
  include_webhooks: boolean;
  include_billing: boolean;
  include_content: boolean;
  status: "pending" | "processing" | "completed" | "failed";
  file_size_bytes?: number;
  file_url?: string;
  file_path?: string;
  expires_at?: string;
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  requested_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface DataDeletionRequest {
  id: string;
  user_id: string;
  organization_id?: string;
  deletion_type: "account" | "organization_data";
  retention_reason?: string;
  confirmed_at?: string;
  confirmation_token?: string;
  confirmation_expires_at?: string;
  status:
    | "pending_confirmation"
    | "confirmed"
    | "processing"
    | "completed"
    | "rejected";
  started_at?: string;
  completed_at?: string;
  error_message?: string;
  items_to_delete?: Record<string, any>;
  requested_reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

export interface DataAccessLog {
  id: string;
  accessed_user_id: string;
  accessed_by_user_id: string;
  organization_id?: string;
  access_type: "view" | "export" | "modify" | "delete";
  resource_type: string;
  resource_id?: string;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

/**
 * Create data export request
 */
export async function createDataExportRequest(
  userId: string,
  config: {
    organization_id?: string;
    export_type: "personal" | "organization";
    export_format?: "json" | "csv_zip";
    include_profile?: boolean;
    include_activity?: boolean;
    include_memberships?: boolean;
    include_api_keys?: boolean;
    include_webhooks?: boolean;
    include_billing?: boolean;
    include_content?: boolean;
    requested_reason?: string;
    ip_address?: string;
    user_agent?: string;
  }
): Promise<{ success: boolean; request?: DataExportRequest; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("data_export_requests")
      .insert({
        user_id: userId,
        organization_id: config.organization_id,
        export_type: config.export_type,
        export_format: config.export_format || "json",
        include_profile: config.include_profile ?? true,
        include_activity: config.include_activity ?? true,
        include_memberships: config.include_memberships ?? true,
        include_api_keys: config.include_api_keys ?? true,
        include_webhooks: config.include_webhooks ?? true,
        include_billing: config.include_billing ?? true,
        include_content: config.include_content ?? true,
        requested_reason: config.requested_reason,
        ip_address: config.ip_address,
        user_agent: config.user_agent,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating data export request", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, request: data as DataExportRequest };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in createDataExportRequest",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get user's export requests
 */
export async function getUserExportRequests(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  requests: DataExportRequest[];
  total: number;
}> {
  try {
    const supabase = getSupabaseServer();
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await supabase
      .from("data_export_requests")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error fetching export requests", error as Error);
      return { requests: [], total: 0 };
    }

    return {
      requests: (data as DataExportRequest[]) || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      "Error in getUserExportRequests",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { requests: [], total: 0 };
  }
}

/**
 * Get export request by ID
 */
export async function getExportRequest(
  requestId: string
): Promise<DataExportRequest | null> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("data_export_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as DataExportRequest;
  } catch (error) {
    logger.error(
      "Error in getExportRequest",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return null;
  }
}

/**
 * Update export request status
 */
export async function updateExportRequestStatus(
  requestId: string,
  status: "processing" | "completed" | "failed",
  updates?: {
    file_size_bytes?: number;
    file_url?: string;
    file_path?: string;
    expires_at?: string;
    error_message?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const updateData: any = {
      status,
      ...updates,
    };

    if (status === "processing") {
      updateData.started_at = new Date().toISOString();
    } else if (status === "completed" || status === "failed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("data_export_requests")
      .update(updateData)
      .eq("id", requestId);

    if (error) {
      logger.error("Error updating export request", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in updateExportRequestStatus",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Create data deletion request
 */
export async function createDataDeletionRequest(
  userId: string,
  config: {
    organization_id?: string;
    deletion_type: "account" | "organization_data";
    requested_reason?: string;
    ip_address?: string;
    user_agent?: string;
  }
): Promise<{
  success: boolean;
  request?: DataDeletionRequest;
  error?: string;
}> {
  try {
    const supabase = getSupabaseServer();

    // Generate confirmation token
    const { data: tokenData } = await supabase.rpc(
      "generate_deletion_confirmation_token"
    );
    const confirmationToken = tokenData;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

    const { data, error } = await supabase
      .from("data_deletion_requests")
      .insert({
        user_id: userId,
        organization_id: config.organization_id,
        deletion_type: config.deletion_type,
        requested_reason: config.requested_reason,
        ip_address: config.ip_address,
        user_agent: config.user_agent,
        confirmation_token: confirmationToken,
        confirmation_expires_at: expiresAt.toISOString(),
        status: "pending_confirmation",
      })
      .select()
      .single();

    if (error) {
      logger.error("Error creating deletion request", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, request: data as DataDeletionRequest };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in createDataDeletionRequest",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Confirm data deletion request
 */
export async function confirmDataDeletionRequest(
  confirmationToken: string
): Promise<{
  success: boolean;
  request?: DataDeletionRequest;
  error?: string;
}> {
  try {
    const supabase = getSupabaseServer();

    // Find request by token
    const { data: request, error: fetchError } = await supabase
      .from("data_deletion_requests")
      .select("*")
      .eq("confirmation_token", confirmationToken)
      .single();

    if (fetchError || !request) {
      return { success: false, error: "Invalid or expired confirmation token" };
    }

    // Check if token expired
    if (new Date(request.confirmation_expires_at!) < new Date()) {
      return { success: false, error: "Confirmation token has expired" };
    }

    // Check if already confirmed
    if (request.status !== "pending_confirmation") {
      return { success: false, error: "Request already processed" };
    }

    // Confirm the request
    const { data, error } = await supabase
      .from("data_deletion_requests")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", request.id)
      .select()
      .single();

    if (error) {
      logger.error("Error confirming deletion request", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, request: data as DataDeletionRequest };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in confirmDataDeletionRequest",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get user's deletion requests
 */
export async function getUserDeletionRequests(
  userId: string
): Promise<DataDeletionRequest[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase
      .from("data_deletion_requests")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Error fetching deletion requests", error as Error);
      return [];
    }

    return (data as DataDeletionRequest[]) || [];
  } catch (error) {
    logger.error(
      "Error in getUserDeletionRequests",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return [];
  }
}

/**
 * Log data access
 */
export async function logDataAccess(
  accessedUserId: string,
  accessedByUserId: string,
  access: {
    organization_id?: string;
    access_type: "view" | "export" | "modify" | "delete";
    resource_type: string;
    resource_id?: string;
    reason?: string;
    ip_address?: string;
    user_agent?: string;
  }
): Promise<{ success: boolean; logId?: string; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase.rpc("log_data_access", {
      p_accessed_user_id: accessedUserId,
      p_accessed_by_user_id: accessedByUserId,
      p_organization_id: access.organization_id || null,
      p_access_type: access.access_type,
      p_resource_type: access.resource_type,
      p_resource_id: access.resource_id || null,
      p_reason: access.reason || null,
      p_ip_address: access.ip_address || null,
      p_user_agent: access.user_agent || null,
    });

    if (error) {
      logger.error("Error logging data access", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, logId: data };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in logDataAccess",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get data access logs for user
 */
export async function getDataAccessLogs(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
  }
): Promise<{
  logs: DataAccessLog[];
  total: number;
}> {
  try {
    const supabase = getSupabaseServer();
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    const { data, error, count } = await supabase
      .from("data_access_log")
      .select("*", { count: "exact" })
      .eq("accessed_user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      logger.error("Error fetching data access logs", error as Error);
      return { logs: [], total: 0 };
    }

    return {
      logs: (data as DataAccessLog[]) || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      "Error in getDataAccessLogs",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { logs: [], total: 0 };
  }
}

/**
 * Get user data summary
 */
export async function getUserDataSummary(userId: string): Promise<any> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await supabase.rpc("get_user_data_summary", {
      p_user_id: userId,
    });

    if (error) {
      logger.error("Error getting user data summary", error as Error);
      return null;
    }

    return data;
  } catch (error) {
    logger.error(
      "Error in getUserDataSummary",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return null;
  }
}
