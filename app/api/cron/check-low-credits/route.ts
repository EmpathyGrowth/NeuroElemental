/**
 * Cron Job: Check Low Credits
 * Periodically check organizations with low credits and send warning emails
 *
 * This endpoint should be called by a cron service (e.g., Vercel Cron, GitHub Actions)
 * Example: Run daily at 9 AM
 */

import { logger } from '@/lib/logging';
import { getSupabaseServer } from '@/lib/db'
import { sendLowCreditsWarning } from '@/lib/email'
import { createCronRoute, successResponse, CREDIT_THRESHOLDS, LOW_CREDIT_WARNING_COOLDOWN_DAYS } from '@/lib/api'
import { getCurrentTimestamp } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/** Organization admin with user profile */
interface OrgAdmin {
  user_id: string
  role: string
  user: { email: string; full_name: string } | null
}

/**
 * GET /api/cron/check-low-credits
 * Check for organizations with low credits and send warnings (requires CRON_SECRET)
 */
export const GET = createCronRoute(async () => {
  const supabase = getSupabaseServer()

  // Track warnings sent
  const warningsSent: Array<{
    organization: string
    creditType: string
    balance: number
  }> = []

  // Fetch credit balances
  const { data: creditBalances } = await supabase
    .from('credit_balances')
    .select('id, organization_id, credit_type, balance')
    .gt('balance', 0)

  if (!creditBalances || creditBalances.length === 0) {
    return successResponse({
      message: 'No credit balances found',
      warnings_sent: 0
    })
  }

  // Check each credit balance against threshold
  for (const cb of creditBalances) {
    const creditType = cb.credit_type || 'default'
    const threshold = CREDIT_THRESHOLDS[creditType] || CREDIT_THRESHOLDS.default || 10
    const balance = cb.balance
    const orgId = cb.organization_id

    if (!orgId) continue

    // Fetch organization name
    const { data: org } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', orgId)
      .single()

    if (!org) continue

    // If balance is below threshold, send warning
    if (balance <= threshold) {
      // Check if warning was already sent recently
      const cooldownDate = new Date()
      cooldownDate.setDate(cooldownDate.getDate() - LOW_CREDIT_WARNING_COOLDOWN_DAYS)

      const { data: recentWarnings } = await supabase
        .from('credit_warnings')
        .select('id')
        .eq('organization_id', org.id)
        .eq('warning_type', `low_credits_${creditType}`)
        .gte('notified_at', cooldownDate.toISOString())
        .limit(1)

      if (recentWarnings && recentWarnings.length > 0) {
        // Warning already sent recently, skip
        continue
      }

      // Get organization admins to send email
      const { data: admins } = await supabase
        .from('organization_members')
        .select(`
          user_id,
          role,
          user:profiles(email, full_name)
        `)
        .eq('organization_id', org.id)
        .in('role', ['owner', 'admin']) as { data: OrgAdmin[] | null }

      if (!admins || admins.length === 0) continue

      // Send warning email to all admins
      for (const admin of admins) {
        if (!admin.user?.email) continue

        await sendLowCreditsWarning({
          to: admin.user.email,
          organizationName: org.name,
          organizationId: org.id,
          creditType,
          currentBalance: balance,
          threshold,
        }).catch((emailError: unknown) => {
          logger.error('Error sending warning email', emailError instanceof Error ? emailError : undefined, { error: String(emailError) })
        })

        warningsSent.push({
          organization: org.name,
          creditType,
          balance,
        })
      }

      // Record warning in database
      const { error: insertError } = await supabase.from('credit_warnings').insert({
        organization_id: org.id,
        warning_type: `low_credits_${creditType}`,
        current_balance: balance,
        threshold,
        notified_at: getCurrentTimestamp(),
      })
      if (insertError) {
        logger.error('Error recording warning', undefined, { error: insertError.message })
      }
    }
  }

  return successResponse({
    success: true,
    message: 'Credit check completed',
    credit_balances_checked: creditBalances.length,
    warnings_sent: warningsSent.length,
    warnings: warningsSent,
    timestamp: getCurrentTimestamp(),
  })
})
