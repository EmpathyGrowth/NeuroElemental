/**
 * Invitation Details API
 * Get invitation details by ID
 */

import { createPublicRoute, notFoundError, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/**
 * GET /api/invitations/[id]
 * Get invitation details
 */
export const GET = createPublicRoute<{ id: string }>(async (request, context) => {
  const { id } = await context.params
  const supabase = getSupabaseServer()

  // Fetch invitation with organization and inviter details
  const { data: invitation, error } = await supabase
    .from('organization_invitations')
    .select(`
      *,
      organization:organizations (
        name,
        slug
      ),
      inviter:profiles!organization_invitations_invited_by_fkey (
        email,
        full_name
      )
    `
    )
    .eq('id', id)
    .single()

  if (error || !invitation) {
    throw notFoundError('Invitation')
  }

  return successResponse({
    invitation,
  })
})
