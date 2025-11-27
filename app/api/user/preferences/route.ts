/**
 * User Email Preferences API
 * Get and update user notification preferences
 */

import { createAuthenticatedRoute, successResponse, internalError, validationError } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'
import { logger } from '@/lib/logging'
import { emailPreferencesUpdateSchema } from '@/lib/validation/schemas'
import { getTimestampFields, getUpdateTimestamp } from '@/lib/utils'

interface EmailPreferences {
  id: string
  user_id: string
  course_updates: boolean | null
  session_reminders: boolean | null
  marketing: boolean | null
  payment_receipts: boolean | null
  created_at: string | null
  updated_at: string | null
}

/**
 * GET /api/user/preferences
 * Get current user's email preferences
 */
export const GET = createAuthenticatedRoute(async (_request, _context, user) => {
  const supabase = getSupabaseServer()

  const { data: preferences, error } = await supabase
    .from('email_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single() as { data: EmailPreferences | null; error: unknown }

  if (error) {
    // If no preferences exist, return defaults
    return successResponse({
      preferences: {
        course_updates: true,
        session_reminders: true,
        marketing: false,
        payment_receipts: true,
      },
    })
  }

  return successResponse({
    preferences: {
      course_updates: preferences?.course_updates ?? true,
      session_reminders: preferences?.session_reminders ?? true,
      marketing: preferences?.marketing ?? false,
      payment_receipts: preferences?.payment_receipts ?? true,
    },
  })
})

/**
 * PUT /api/user/preferences
 * Update current user's email preferences
 */
export const PUT = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer()
  const body = await request.json()

  // Validate request body
  const parseResult = emailPreferencesUpdateSchema.safeParse(body)
  if (!parseResult.success) {
    throw validationError('Invalid preferences data', parseResult.error.errors)
  }

  const {
    course_updates,
    session_reminders,
    marketing,
    payment_receipts,
  } = parseResult.data

  try {
    // Check if preferences exist
    const { data: existing } = await supabase
      .from('email_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single() as { data: { id: string } | null; error: unknown }

    const preferencesData = {
      course_updates: course_updates ?? true,
      session_reminders: session_reminders ?? true,
      marketing: marketing ?? false,
      payment_receipts: payment_receipts ?? true,
      ...getUpdateTimestamp(),
    }

    if (existing) {
      // Update existing preferences
      const { error: updateError } = await supabase
        .from('email_preferences')
        .update(preferencesData)
        .eq('user_id', user.id)

      if (updateError) {
        logger.error('Error updating email preferences:', updateError as Error)
        throw internalError('Failed to update preferences')
      }
    } else {
      // Create new preferences
      const { error: insertError } = await supabase
        .from('email_preferences')
        .insert({
          user_id: user.id,
          ...preferencesData,
          ...getTimestampFields(),
        })

      if (insertError) {
        logger.error('Error creating email preferences:', insertError as Error)
        throw internalError('Failed to create preferences')
      }
    }

    return successResponse({
      success: true,
      message: 'Preferences updated successfully',
    })
  } catch (error) {
    logger.error('Error in preferences API:', error as Error)
    throw internalError('Failed to save preferences')
  }
})
