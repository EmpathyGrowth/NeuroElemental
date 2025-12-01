/**
 * Audit Export Job Details API
 * Get and delete specific export jobs
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  internalError,
  requireOrganizationAccess,
} from '@/lib/api'
import { getAuditExportJob } from '@/lib/audit/export'
import { getSupabaseServer } from '@/lib/db/supabase-server'
import { logger } from '@/lib/logging/logger'

/**
 * Get job and verify it belongs to organization
 */
async function getJobOrThrow(jobId: string, orgId: string) {
  const job = await getAuditExportJob(jobId)

  if (!job || job.organization_id !== orgId) {
    throw notFoundError('Export job')
  }

  return job
}

/**
 * GET /api/organizations/[id]/audit/export/[jobId]
 * Get export job details
 */
export const GET = createAuthenticatedRoute<{ id: string; jobId: string }>(
  async (_request, context, user) => {
    const { id, jobId } = await context.params

    // Require admin access
    await requireOrganizationAccess(user.id, id, true)

    // Get job details (throws if not found or wrong org)
    const job = await getJobOrThrow(jobId, id)

    return successResponse({ job })
  }
)

/**
 * DELETE /api/organizations/[id]/audit/export/[jobId]
 * Delete export job
 */
export const DELETE = createAuthenticatedRoute<{ id: string; jobId: string }>(
  async (_request, context, user) => {
    const { id, jobId } = await context.params

    // Require admin access
    await requireOrganizationAccess(user.id, id, true)

    // Verify job exists and belongs to org
    await getJobOrThrow(jobId, id)

    // Delete the job
    const supabase = getSupabaseServer()
    const { error } = await supabase
      .from('audit_export_jobs')
      .delete()
      .eq('id', jobId)

    if (error) {
      logger.error('Error deleting export job', error)
      throw internalError('Failed to delete export job')
    }

    return successResponse({ success: true })
  }
)
