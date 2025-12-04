/**
 * Organization Reports API
 * Create and manage organization reports
 */

import { createAuthenticatedRoute, internalError, notFoundError, requireOrganizationAccess, successResponse, validateRequest } from '@/lib/api';
import { getSupabaseServer } from '@/lib/db';
import type { Json } from '@/lib/types/supabase';
import { z } from 'zod';

const createReportSchema = z.object({
  report_type: z.enum(['team_composition', 'assessment_summary', 'diagnostic_results', 'usage_analytics', 'custom']),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
  data: z.record(z.string(), z.unknown()).optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

/**
 * GET /api/organizations/[id]/reports
 * List all reports for an organization
 */
export const GET = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;

  // Check if user has access to the organization
  await requireOrganizationAccess(user.id, id);

  const supabase = getSupabaseServer();
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  // Get reports for this organization
  const { data: reports, error, count } = await supabase
    .from('usage_reports')
    .select('*', { count: 'exact' })
    .eq('organization_id', id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw notFoundError('Reports');
  }

  return successResponse({
    reports: reports || [],
    pagination: {
      total: count || 0,
      limit,
      offset,
      hasMore: (offset + limit) < (count || 0),
    },
  });
});

/**
 * POST /api/organizations/[id]/reports
 * Create a new report for an organization
 */
export const POST = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;

  // Check if user has access to the organization
  await requireOrganizationAccess(user.id, id);

  // Validate request body
  const validation = await validateRequest(request, createReportSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const supabase = getSupabaseServer();
  const { report_type, start_date, end_date, data = {}, format = 'json' } = validation.data;

  // Create the report
  const { data: report, error } = await (supabase as any)
    .from('usage_reports')
    .insert({
      organization_id: id,
      report_type,
      start_date,
      end_date,
      data: data as Json,
      format,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) {
    throw internalError('Failed to create report');
  }

  return successResponse({
    success: true,
    report,
    message: 'Report created successfully',
  }, 201);
});

/**
 * DELETE /api/organizations/[id]/reports
 * Delete a report by ID (passed as query param)
 */
export const DELETE = createAuthenticatedRoute<{ id: string }>(async (request, context, user) => {
  const { id } = await context.params;

  // Check if user is an admin of the organization
  await requireOrganizationAccess(user.id, id, true);

  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('reportId');

  if (!reportId) {
    throw notFoundError('Report ID is required');
  }

  const supabase = getSupabaseServer();

  // Verify the report belongs to this organization
  const { data: report } = await supabase
    .from('usage_reports')
    .select('id')
    .eq('id', reportId)
    .eq('organization_id', id)
    .single();

  if (!report) {
    throw notFoundError('Report');
  }

  // Delete the report
  const { error } = await supabase
    .from('usage_reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    throw internalError('Failed to delete report');
  }

  return successResponse({
    success: true,
    message: 'Report deleted successfully',
  });
});
