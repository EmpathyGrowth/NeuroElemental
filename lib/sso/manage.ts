/**
 * Single Sign-On Management
 * Core functions for SSO provider configuration and authentication
 */

import { getSupabaseServer } from "@/lib/db/supabase-server";
import { logger } from "@/lib/logging/logger";

export interface SSOProvider {
  id: string;
  organization_id: string;
  provider_type: "saml" | "oauth" | "oidc";
  provider_name: string;

  // SAML config
  saml_entity_id?: string;
  saml_sso_url?: string;
  saml_certificate?: string;
  saml_sign_requests?: boolean;

  // OAuth config
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_authorize_url?: string;
  oauth_token_url?: string;
  oauth_userinfo_url?: string;
  oauth_scopes?: string[];

  // Attribute mapping
  attribute_mapping: Record<string, string>;

  // Domain enforcement
  domains: string[];
  enforce_sso: boolean;

  // Auto-provisioning
  auto_provision_users: boolean;
  default_role: string;

  is_active: boolean;
  metadata?: Record<string, any>;

  created_at: string;
  updated_at: string;
}

export interface SSOAuthAttempt {
  id: string;
  organization_id: string;
  provider_id: string;
  user_id?: string;
  email: string;
  status: "success" | "failed" | "error";
  error_code?: string;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
  created_at: string;
}

export interface SSOUserMapping {
  id: string;
  organization_id: string;
  provider_id: string;
  user_id: string;
  idp_user_id: string;
  idp_email: string;
  idp_attributes?: Record<string, any>;
  first_login_at: string;
  last_login_at: string;
}

/**
 * Get SSO provider for organization
 */
export async function getSSOProvider(
  organizationId: string
): Promise<SSOProvider | null> {
  const supabase = getSupabaseServer();

  const { data, error } = await (supabase as any)
    .from("sso_providers")
    .select("*")
    .eq("organization_id", organizationId)
    .eq("is_active", true)
    .single() as { data: SSOProvider | null; error: Error | null };

  if (error || !data) {
    return null;
  }

  return data;
}

/**
 * Create SSO provider configuration
 */
export async function createSSOProvider(
  organizationId: string,
  config: {
    provider_type: "saml" | "oauth" | "oidc";
    provider_name: string;
    domains: string[];
    enforce_sso?: boolean;
    auto_provision_users?: boolean;
    default_role?: string;

    // SAML specific
    saml_entity_id?: string;
    saml_sso_url?: string;
    saml_certificate?: string;
    saml_sign_requests?: boolean;

    // OAuth specific
    oauth_client_id?: string;
    oauth_client_secret?: string;
    oauth_authorize_url?: string;
    oauth_token_url?: string;
    oauth_userinfo_url?: string;
    oauth_scopes?: string[];

    attribute_mapping?: Record<string, string>;
    metadata?: Record<string, any>;
  }
): Promise<{ success: boolean; provider?: SSOProvider; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("sso_providers")
      .insert({
        organization_id: organizationId,
        provider_type: config.provider_type,
        provider_name: config.provider_name,
        domains: config.domains,
        enforce_sso: config.enforce_sso ?? false,
        auto_provision_users: config.auto_provision_users ?? true,
        default_role: config.default_role ?? "member",

        // SAML
        saml_entity_id: config.saml_entity_id,
        saml_sso_url: config.saml_sso_url,
        saml_certificate: config.saml_certificate,
        saml_sign_requests: config.saml_sign_requests ?? false,

        // OAuth
        oauth_client_id: config.oauth_client_id,
        oauth_client_secret: config.oauth_client_secret,
        oauth_authorize_url: config.oauth_authorize_url,
        oauth_token_url: config.oauth_token_url,
        oauth_userinfo_url: config.oauth_userinfo_url,
        oauth_scopes: config.oauth_scopes,

        attribute_mapping: config.attribute_mapping ?? {
          email: "email",
          first_name: "firstName",
          last_name: "lastName",
          user_id: "nameID",
        },
        metadata: config.metadata,
        is_active: true,
      })
      .select()
      .single() as { data: SSOProvider | null; error: { message: string } | null };

    if (error) {
      logger.error("Error creating SSO provider", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, provider: data as SSOProvider };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in createSSOProvider",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Update SSO provider configuration
 */
export async function updateSSOProvider(
  providerId: string,
  updates: Partial<
    Omit<SSOProvider, "id" | "organization_id" | "created_at" | "updated_at">
  >
): Promise<{ success: boolean; provider?: SSOProvider; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("sso_providers")
      .update(updates)
      .eq("id", providerId)
      .select()
      .single() as { data: SSOProvider | null; error: { message: string } | null };

    if (error) {
      logger.error("Error updating SSO provider", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, provider: data as SSOProvider };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in updateSSOProvider",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Delete SSO provider (soft delete - deactivate)
 */
export async function deleteSSOProvider(
  providerId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { error } = await (supabase as any)
      .from("sso_providers")
      .update({ is_active: false })
      .eq("id", providerId) as { error: { message: string } | null };

    if (error) {
      logger.error("Error deleting SSO provider", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in deleteSSOProvider",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Check if email domain requires SSO
 */
export async function checkSSORequired(email: string): Promise<{
  required: boolean;
  provider?: {
    id: string;
    organization_id: string;
    provider_type: string;
    provider_name: string;
  };
}> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase.rpc as any)("check_sso_required", {
      user_email: email,
    });

    if (error || !data || !Array.isArray(data) || data.length === 0) {
      return { required: false };
    }

    const result = data[0] as {
      required: boolean;
      provider_id: string;
      organization_id: string;
      provider_type: string;
      provider_name: string;
    };
    return {
      required: result.required,
      provider: {
        id: result.provider_id,
        organization_id: result.organization_id,
        provider_type: result.provider_type,
        provider_name: result.provider_name,
      },
    };
  } catch (error) {
    logger.error(
      "Error checking SSO required",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { required: false };
  }
}

/**
 * Log SSO authentication attempt
 */
export async function logSSOAuthAttempt(attempt: {
  organization_id: string;
  provider_id: string;
  user_id?: string;
  email: string;
  status: "success" | "failed" | "error";
  error_code?: string;
  error_message?: string;
  ip_address?: string;
  user_agent?: string;
  duration_ms?: number;
  saml_request_id?: string;
  saml_assertion?: string;
  oauth_state?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { error } = await (supabase as any).from("sso_auth_attempts").insert(attempt) as { error: { message: string } | null };

    if (error) {
      logger.error("Error logging SSO auth attempt", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in logSSOAuthAttempt",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get SSO authentication attempts for organization
 */
export async function getSSOAuthAttempts(
  organizationId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: "success" | "failed" | "error";
  }
): Promise<{
  attempts: SSOAuthAttempt[];
  total: number;
}> {
  try {
    const supabase = getSupabaseServer();
    const limit = options?.limit ?? 50;
    const offset = options?.offset ?? 0;

    let query = (supabase as any)
      .from("sso_auth_attempts")
      .select("*", { count: "exact" })
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (options?.status) {
      query = query.eq("status", options.status);
    }

    const { data, error, count } = await query as { data: SSOAuthAttempt[] | null; error: Error | null; count: number | null };

    if (error) {
      logger.error("Error fetching SSO auth attempts", error as Error);
      return { attempts: [], total: 0 };
    }

    return {
      attempts: (data as SSOAuthAttempt[]) || [],
      total: count || 0,
    };
  } catch (error) {
    logger.error(
      "Error in getSSOAuthAttempts",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { attempts: [], total: 0 };
  }
}

/**
 * Get SSO user mapping
 */
export async function getSSOUserMapping(
  providerId: string,
  idpUserId: string
): Promise<SSOUserMapping | null> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("sso_user_mappings")
      .select("*")
      .eq("provider_id", providerId)
      .eq("idp_user_id", idpUserId)
      .single() as { data: any; error: Error | null };

    if (error || !data) {
      return null;
    }

    // Map database fields to SSOUserMapping interface
    const mapping = data as any;
    return {
      id: mapping.id,
      organization_id: mapping.organization_id || "",
      provider_id: mapping.provider_id,
      user_id: mapping.user_id,
      idp_user_id: mapping.idp_user_id || mapping.external_id,
      idp_email: mapping.email,
      idp_attributes: mapping.attributes || {},
      first_login_at: mapping.first_login_at || mapping.created_at,
      last_login_at: mapping.last_login_at || mapping.updated_at,
    } as SSOUserMapping;
  } catch (error) {
    logger.error(
      "Error in getSSOUserMapping",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return null;
  }
}

/**
 * Auto-provision user from SSO
 * Uses database function for atomic user creation and organization membership
 */
export async function autoProvisionSSOUser(
  organizationId: string,
  providerId: string,
  userData: {
    email: string;
    first_name: string;
    last_name: string;
    idp_user_id: string;
    idp_attributes: Record<string, any>;
  }
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase.rpc as any)(
      "auto_provision_sso_user",
      {
        p_organization_id: organizationId,
        p_provider_id: providerId,
        p_email: userData.email,
        p_first_name: userData.first_name,
        p_last_name: userData.last_name,
        p_idp_user_id: userData.idp_user_id,
        p_idp_attributes: userData.idp_attributes,
      }
    );

    if (error) {
      logger.error("Error auto-provisioning SSO user", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, userId: data as string | undefined };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in autoProvisionSSOUser",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Create SSO session
 */
export async function createSSOSession(session: {
  organization_id: string;
  provider_id: string;
  user_id: string;
  session_index?: string;
  name_id: string;
  expires_at: string;
  ip_address?: string;
  user_agent?: string;
}): Promise<{ success: boolean; sessionId?: string; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("sso_sessions")
      .insert(session)
      .select("id")
      .single() as { data: { id: string } | null; error: { message: string } | null };

    if (error) {
      logger.error("Error creating SSO session", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true, sessionId: data?.id };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in createSSOSession",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Get active SSO sessions for user
 */
export async function getUserSSOSessions(userId: string): Promise<any[]> {
  try {
    const supabase = getSupabaseServer();

    const { data, error } = await (supabase as any)
      .from("sso_sessions")
      .select("*, sso_providers(provider_name, provider_type)")
      .eq("user_id", userId)
      .is("logged_out_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }) as { data: any[] | null; error: Error | null };

    if (error) {
      logger.error("Error fetching user SSO sessions", error as Error);
      return [];
    }

    return data || [];
  } catch (error) {
    logger.error(
      "Error in getUserSSOSessions",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return [];
  }
}

/**
 * Logout SSO session (for Single Logout)
 */
export async function logoutSSOSession(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { error } = await (supabase as any)
      .from("sso_sessions")
      .update({ logged_out_at: new Date().toISOString() })
      .eq("id", sessionId) as { error: { message: string } | null };

    if (error) {
      logger.error("Error logging out SSO session", error as Error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error in logoutSSOSession",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}

/**
 * Test SSO provider configuration
 */
export async function testSSOProvider(
  providerId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const supabase = getSupabaseServer();

    const { data: provider, error } = await (supabase as any)
      .from("sso_providers")
      .select("*")
      .eq("id", providerId)
      .single() as { data: SSOProvider | null; error: Error | null };

    if (error || !provider) {
      return { success: false, error: "Provider not found" };
    }

    // Validate configuration based on provider type
    if (provider.provider_type === "saml") {
      if (
        !provider.saml_entity_id ||
        !provider.saml_sso_url ||
        !provider.saml_certificate
      ) {
        return {
          success: false,
          error:
            "Missing required SAML configuration (Entity ID, SSO URL, or Certificate)",
        };
      }

      // Validate certificate format (basic check)
      if (!provider.saml_certificate.includes("BEGIN CERTIFICATE")) {
        return {
          success: false,
          error: "Invalid certificate format. Must be PEM encoded.",
        };
      }
    } else if (
      provider.provider_type === "oauth" ||
      provider.provider_type === "oidc"
    ) {
      if (
        !provider.oauth_client_id ||
        !provider.oauth_authorize_url ||
        !provider.oauth_token_url
      ) {
        return {
          success: false,
          error:
            "Missing required OAuth configuration (Client ID, Authorize URL, or Token URL)",
        };
      }
    }

    // Validate domains
    if (!provider.domains || provider.domains.length === 0) {
      return {
        success: false,
        error: "At least one domain must be configured",
      };
    }

    return {
      success: true,
      message: "SSO provider configuration is valid",
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";
    logger.error(
      "Error testing SSO provider",
      error instanceof Error ? error : undefined,
      { errorMsg: String(error) }
    );
    return { success: false, error: message };
  }
}
