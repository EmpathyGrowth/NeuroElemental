/**
 * GDPR Data Export Processing API (Internal)
 * Process pending export request and generate data file
 * Requires CRON_SECRET for authentication (via x-cron-secret header)
 */

import { logger } from '@/lib/logging';
import { getSupabaseServer } from '@/lib/db'
import { badRequestError, createCronRoute, internalError, notFoundError, successResponse } from '@/lib/api'
import { getExportRequest, updateExportRequestStatus } from '@/lib/gdpr'
import { getCurrentTimestamp } from '@/lib/utils'
import type { Database } from '@/lib/types/supabase';

/** Profile data for export */
type ProfileRow = Database['public']['Tables']['profiles']['Row'];

/** Organization membership with nested organization */
interface MembershipWithOrg {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  created_at: string;
  updated_at: string;
  organization: {
    id: string;
    name: string;
    slug: string;
    type: string;
  } | null;
}

/** Audit log entry */
interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/** API key entry (safe fields only) */
interface ApiKeyEntry {
  id: string;
  name: string;
  key_prefix: string;
  permissions: string[];
  status: string;
  created_at: string;
  last_used_at: string | null;
  expires_at: string | null;
}

/** Webhook entry (safe fields only) */
interface WebhookEntry {
  id: string;
  name: string;
  url: string;
  events: string[];
  status: string;
  created_at: string;
}

/** Subscription entry */
interface SubscriptionEntry {
  id: string;
  organization_id: string;
  stripe_subscription_id: string;
  status: string;
  plan: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
}

/** Invoice entry */
interface InvoiceEntry {
  id: string;
  organization_id: string;
  stripe_invoice_id: string;
  amount_paid: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
}

/** Enrollment with course info */
interface EnrollmentWithCourse {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  course: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

/** Review entry */
interface ReviewEntry {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

/** Certification entry */
interface CertificationEntry {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  issued_at: string;
}

/** Export data structure */
interface ExportDataStructure {
  export_date: string;
  user_id: string;
  request_id: string;
  export_type: string;
  data: {
    profile?: ProfileRow | null;
    memberships?: MembershipWithOrg[] | null;
    activity?: AuditLogEntry[];
    api_keys?: ApiKeyEntry[];
    webhooks?: WebhookEntry[];
    billing?: {
      subscriptions: SubscriptionEntry[];
      invoices: InvoiceEntry[];
    };
    content?: {
      enrollments: EnrollmentWithCourse[];
      reviews: ReviewEntry[];
      certifications: CertificationEntry[];
    };
  };
}

/**
 * POST /api/user/data-export/[requestId]/process
 * Process export request (internal - requires CRON_SECRET via x-cron-secret header)
 */
export const POST = createCronRoute<{ requestId: string }>(async (request, context) => {
  const { requestId } = await context.params

  if (!requestId) {
    throw badRequestError('Request ID is required')
  }

  // Get export request
  const exportRequest = await getExportRequest(requestId)

  if (!exportRequest) {
    throw notFoundError('Export request')
  }

  // Check if already processed
  if (exportRequest.status !== 'pending') {
    throw badRequestError(`Export request is already ${exportRequest.status}`)
  }

  // Update status to processing
  await updateExportRequestStatus(requestId, 'processing')

  const supabase = await getSupabaseServer()
  const userId = exportRequest.user_id

  // Fetch user data based on include flags
  const exportData: ExportDataStructure = {
    export_date: getCurrentTimestamp(),
    user_id: userId,
    request_id: requestId,
    export_type: exportRequest.export_type,
    data: {},
  }

  try {
    // Fetch profile data
    if (exportRequest.include_profile) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single() as { data: ProfileRow | null; error: unknown }

      exportData.data.profile = profile
    }

    // Fetch memberships
    if (exportRequest.include_memberships) {
      const { data: memberships } = await supabase
        .from('organization_members')
        .select(`
          *,
          organization:organizations(id, name, slug, type)
        `)
        .eq('user_id', userId) as { data: MembershipWithOrg[] | null; error: unknown }

      exportData.data.memberships = memberships
    }

    // Fetch activity/audit logs
    if (exportRequest.include_activity) {
      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000) as { data: AuditLogEntry[] | null; error: unknown }

      exportData.data.activity = activity || []
    }

    // Fetch API keys (if organization export and user has access)
    if (exportRequest.include_api_keys && exportRequest.organization_id) {
      const { data: apiKeys } = await supabase
        .from('api_keys')
        .select('id, name, key_prefix, permissions, status, created_at, last_used_at, expires_at')
        .eq('organization_id', exportRequest.organization_id)
        .eq('created_by', userId) as { data: ApiKeyEntry[] | null; error: unknown }

      exportData.data.api_keys = apiKeys || []
    }

    // Fetch webhooks
    if (exportRequest.include_webhooks && exportRequest.organization_id) {
      const { data: webhooks } = await supabase
        .from('webhooks')
        .select('id, name, url, events, status, created_at')
        .eq('organization_id', exportRequest.organization_id) as { data: WebhookEntry[] | null; error: unknown }

      exportData.data.webhooks = webhooks || []
    }

    // Fetch billing data
    if (exportRequest.include_billing && exportRequest.organization_id) {
      const { data: billing } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('organization_id', exportRequest.organization_id) as { data: SubscriptionEntry[] | null; error: unknown }

      const { data: invoices } = await supabase
        .from('invoices')
        .select('*')
        .eq('organization_id', exportRequest.organization_id) as { data: InvoiceEntry[] | null; error: unknown }

      exportData.data.billing = {
        subscriptions: billing || [],
        invoices: invoices || [],
      }
    }

    // Fetch user-generated content
    if (exportRequest.include_content) {
      const { data: courses } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          course:courses(id, title, slug)
        `)
        .eq('user_id', userId) as { data: EnrollmentWithCourse[] | null; error: unknown }

      const { data: reviews } = await supabase
        .from('course_reviews')
        .select('*')
        .eq('user_id', userId) as { data: ReviewEntry[] | null; error: unknown }

      const { data: certifications } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId) as { data: CertificationEntry[] | null; error: unknown }

      exportData.data.content = {
        enrollments: courses || [],
        reviews: reviews || [],
        certifications: certifications || [],
      }
    }

    // Store export data as JSON string in file_path
    const exportJson = JSON.stringify(exportData)
    const fileSizeBytes = Buffer.byteLength(exportJson, 'utf8')

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Update request with completed status
    const updateResult = await updateExportRequestStatus(requestId, 'completed', {
      file_path: exportJson,
      file_size_bytes: fileSizeBytes,
      expires_at: expiresAt.toISOString(),
    })

    if (!updateResult.success) {
      throw internalError('Failed to update export request status')
    }

    return successResponse({
      success: true,
      message: 'Export processed successfully',
      request_id: requestId,
      file_size_bytes: fileSizeBytes,
      expires_at: expiresAt.toISOString(),
    })
  } catch (processingError) {
    const err = processingError instanceof Error ? processingError : new Error(String(processingError));
    logger.error('Error processing export:', err)

    // Update status to failed
    await updateExportRequestStatus(requestId, 'failed', {
      error_message: err.message,
    })

    throw internalError('Failed to process export')
  }
});
