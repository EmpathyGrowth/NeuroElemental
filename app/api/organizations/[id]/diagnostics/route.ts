/**
 * Organization Diagnostics API
 * Manage diagnostic tools for business teams
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  forbiddenError,
} from '@/lib/api';
import { diagnosticsRepository, isUserOrgMember, isUserOrgAdmin, getOrganizationMembers } from '@/lib/db';
import { validateRequest } from '@/lib/validation';
import { createDiagnosticSchema } from '@/lib/validation/schemas';
import { NextRequest } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

// GET - List organization diagnostics
export const GET = createAuthenticatedRoute(async (request: NextRequest, context: RouteContext, user) => {
  const { id: organizationId } = await context.params;

  // Check membership
  const isMember = await isUserOrgMember(user.id, organizationId);
  if (!isMember) {
    throw forbiddenError('You must be a member of this organization');
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as 'draft' | 'active' | 'in_progress' | 'completed' | 'archived' | null;

  const diagnostics = await diagnosticsRepository.getOrganizationDiagnostics(
    organizationId,
    { status: status || undefined }
  );

  // Also get available templates
  const templates = await diagnosticsRepository.getTemplates({ isActive: true });

  // Get stats
  const stats = await diagnosticsRepository.getOrganizationStats(organizationId);

  // Get member count
  const membersResult = await getOrganizationMembers(organizationId);
  const memberCount = membersResult.data?.length || 0;

  return successResponse({
    diagnostics,
    templates,
    stats,
    memberCount,
  });
});

// POST - Create new diagnostic
export const POST = createAuthenticatedRoute(async (request: NextRequest, context: RouteContext, user) => {
  const { id: organizationId } = await context.params;

  // Check admin access
  const isAdmin = await isUserOrgAdmin(user.id, organizationId);
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can create diagnostics');
  }

  const validation = await validateRequest(request, createDiagnosticSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const data = validation.data;

  // Verify template exists
  const template = await diagnosticsRepository.getTemplateById(data.template_id);
  if (!template) {
    throw notFoundError('Diagnostic template');
  }

  const diagnostic = await diagnosticsRepository.createDiagnostic({
    organization_id: organizationId,
    template_id: data.template_id,
    name: data.name,
    description: data.description,
    target_user_ids: data.target_user_ids,
    target_department: data.target_department,
    include_all_members: data.include_all_members,
    anonymous_results: data.anonymous_results,
    deadline_at: data.deadline_at,
    created_by: user.id,
  });

  return successResponse({ diagnostic }, 201);
});
