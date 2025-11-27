/**
 * Single Diagnostic API
 * Manage individual diagnostic operations
 */

import {
  createAuthenticatedRoute,
  successResponse,
  notFoundError,
  forbiddenError,
} from '@/lib/api';
import { diagnosticsRepository, isUserOrgMember, isUserOrgAdmin } from '@/lib/db';
import { validateRequest } from '@/lib/validation';
import { updateDiagnosticSchema } from '@/lib/validation/schemas';
import { NextRequest } from 'next/server';

type RouteContext = { params: Promise<{ id: string; diagnosticId: string }> };

// GET - Get single diagnostic with responses
export const GET = createAuthenticatedRoute(async (_request: NextRequest, context: RouteContext, user) => {
  const { id: organizationId, diagnosticId } = await context.params;

  // Check membership
  const isMember = await isUserOrgMember(user.id, organizationId);
  if (!isMember) {
    throw forbiddenError('You must be a member of this organization');
  }

  const diagnostic = await diagnosticsRepository.getDiagnosticById(diagnosticId);
  if (!diagnostic || diagnostic.organization_id !== organizationId) {
    throw notFoundError('Diagnostic');
  }

  // Get responses (only for admins, or own response)
  const isAdmin = await isUserOrgAdmin(user.id, organizationId);
  let responses: Awaited<ReturnType<typeof diagnosticsRepository.getDiagnosticResponses>> = [];

  if (isAdmin) {
    responses = await diagnosticsRepository.getDiagnosticResponses(diagnosticId);
  } else {
    const userResponse = await diagnosticsRepository.getUserResponse(diagnosticId, user.id);
    if (userResponse) {
      responses = [userResponse];
    }
  }

  return successResponse({
    diagnostic,
    responses,
    userCanRespond: diagnostic.status === 'active' && (
      diagnostic.include_all_members ||
      diagnostic.target_user_ids.includes(user.id)
    ),
  });
});

// PATCH - Update diagnostic
export const PATCH = createAuthenticatedRoute(async (request: NextRequest, context: RouteContext, user) => {
  const { id: organizationId, diagnosticId } = await context.params;

  // Check admin access
  const isAdmin = await isUserOrgAdmin(user.id, organizationId);
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can update diagnostics');
  }

  const diagnostic = await diagnosticsRepository.getDiagnosticById(diagnosticId);
  if (!diagnostic || diagnostic.organization_id !== organizationId) {
    throw notFoundError('Diagnostic');
  }

  const validation = await validateRequest(request, updateDiagnosticSchema);
  if (!validation.success) {
    throw validation.error;
  }

  const updated = await diagnosticsRepository.updateDiagnostic(diagnosticId, validation.data);

  return successResponse({ diagnostic: updated });
});

// DELETE - Delete diagnostic
export const DELETE = createAuthenticatedRoute(async (_request: NextRequest, context: RouteContext, user) => {
  const { id: organizationId, diagnosticId } = await context.params;

  // Check admin access
  const isAdmin = await isUserOrgAdmin(user.id, organizationId);
  if (!isAdmin) {
    throw forbiddenError('Only organization admins can delete diagnostics');
  }

  const diagnostic = await diagnosticsRepository.getDiagnosticById(diagnosticId);
  if (!diagnostic || diagnostic.organization_id !== organizationId) {
    throw notFoundError('Diagnostic');
  }

  await diagnosticsRepository.deleteDiagnostic(diagnosticId);

  return successResponse({ success: true });
});
