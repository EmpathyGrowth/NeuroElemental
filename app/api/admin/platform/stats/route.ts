/**
 * Admin Platform Stats API
 * Aggregated platform metrics for admin overview
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/** Credit transaction record */
interface CreditTransaction {
  id: string;
  organization_id: string;
  amount: number;
  transaction_type: 'add' | 'subtract';
  metadata?: { price?: number } | null;
  created_at: string;
}

/** Organization record */
interface OrganizationRecord {
  id: string;
  name: string;
  created_at: string;
}

/** Credit transaction with organization */
interface CreditTransactionWithOrg {
  id: string;
  amount: number;
  created_at: string;
  organization: { name: string } | null;
}

/**
 * GET /api/admin/platform/stats
 * Get aggregated platform statistics
 */
export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const supabase = getSupabaseServer()

  // Calculate date ranges
  const now = new Date()
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  // Fetch organizations
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, created_at')

  const totalOrgs = organizations?.length || 0
  const orgsLastMonth = organizations?.filter(
    (o) => o.created_at && new Date(o.created_at) < thisMonth
  ).length || 0
  const orgGrowth = orgsLastMonth > 0
    ? Math.round(((totalOrgs - orgsLastMonth) / orgsLastMonth) * 100)
    : 0

  // Count active organizations (with credits)
  const { data: creditBalances } = await supabase
    .from('credit_balances')
    .select('organization_id, balance')
    .gt('balance', 0)

  // Get unique org IDs with credits
  const orgsWithCredits = new Set(creditBalances?.map((cb) => cb.organization_id) || [])
  const activeOrgsCount = orgsWithCredits.size

  // Fetch users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  const { count: usersThisMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thisMonth.toISOString())

  const { count: usersLastMonth } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', lastMonth.toISOString())
    .lt('created_at', thisMonth.toISOString())

  const userGrowth = (usersLastMonth || 0) > 0
    ? Math.round((((usersThisMonth || 0) - (usersLastMonth || 0)) / (usersLastMonth || 1)) * 100)
    : 0

  // Fetch credit transactions
  const { data: allTransactions } = await supabase
    .from('credit_transactions')
    .select('*') as { data: CreditTransaction[] | null }

  const totalPurchased = allTransactions
    ?.filter((t) => t.transaction_type === 'add')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const totalUsed = allTransactions
    ?.filter((t) => t.transaction_type === 'subtract')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  // Calculate revenue from metadata
  const totalRevenue = allTransactions
    ?.filter((t) => t.transaction_type === 'add' && t.metadata?.price)
    .reduce((sum, t) => sum + ((t.metadata?.price || 0) * 100), 0) || 0

  // Count remaining credits across all organizations
  const { data: allCredits } = await supabase
    .from('credit_balances')
    .select('balance')

  const totalRemaining = allCredits?.reduce((sum, cb) => sum + (cb.balance || 0), 0) || 0

  // Today's activity
  const { count: transactionsToday } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Pending invitations
  const { count: pendingInvitations } = await supabase
    .from('organization_invitations')
    .select('*', { count: 'exact', head: true })
    .gte('expires_at', now.toISOString())

  // Waitlist signups
  const { count: waitlistCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  // Active coupons
  const { count: activeCoupons } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gte.${now.toISOString()}`)

  // Recent activity (last 10 events)
  const recentActivity: Array<{
    id: string
    type: 'organization' | 'credit' | 'invitation' | 'coupon'
    message: string
    timestamp: string
  }> = []

  // Add recent organizations
  const { data: recentOrgsData } = await supabase
    .from('organizations')
    .select('id, name, created_at')
    .order('created_at', { ascending: false })
    .limit(3)

  const recentOrgs = recentOrgsData as OrganizationRecord[] | null
  recentOrgs?.forEach((org) => {
    recentActivity.push({
      id: `org-${org.id}`,
      type: 'organization',
      message: `New organization "${org.name}" created`,
      timestamp: org.created_at,
    })
  })

  // Add recent credit purchases
  const { data: recentCreditsData } = await supabase
    .from('credit_transactions')
    .select(`
        id,
        amount,
        created_at,
        organization:organizations(name)
      `)
    .eq('transaction_type', 'add')
    .order('created_at', { ascending: false })
    .limit(3)

  const recentCredits = recentCreditsData as CreditTransactionWithOrg[] | null
  recentCredits?.forEach((credit) => {
    recentActivity.push({
      id: `credit-${credit.id}`,
      type: 'credit',
      message: `${credit.organization?.name || 'An organization'} purchased ${credit.amount} credits`,
      timestamp: credit.created_at,
    })
  })

  // Sort by timestamp and limit to 10
  recentActivity.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  recentActivity.splice(10)

  // System alerts
  const alerts: Array<{
    id: string
    severity: 'info' | 'warning' | 'error'
    message: string
    timestamp: string
  }> = []

  // Check for low credit organizations (balance > 0 but < 10)
  const { data: lowCreditBalances } = await supabase
    .from('credit_balances')
    .select('organization_id, balance')
    .gt('balance', 0)
    .lt('balance', 10)

  // Count unique organizations with low credits
  const lowCreditOrgIds = new Set(lowCreditBalances?.map((cb) => cb.organization_id) || [])

  if (lowCreditOrgIds.size > 0) {
    alerts.push({
      id: 'low-credits',
      severity: 'warning',
      message: `${lowCreditOrgIds.size} organization(s) have less than 10 credits remaining`,
      timestamp: now.toISOString(),
    })
  }

  // Check for expiring invitations
  const expiringInvitations = new Date(now)
  expiringInvitations.setHours(expiringInvitations.getHours() + 24)

  const { count: expiringInvites } = await supabase
    .from('organization_invitations')
    .select('*', { count: 'exact', head: true })
    .gte('expires_at', now.toISOString())
    .lte('expires_at', expiringInvitations.toISOString())

  if ((expiringInvites || 0) > 0) {
    alerts.push({
      id: 'expiring-invites',
      severity: 'info',
      message: `${expiringInvites} invitation(s) will expire in the next 24 hours`,
      timestamp: now.toISOString(),
    })
  }

  // Check for inactive organizations
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: inactiveOrgs } = await supabase
    .from('organizations')
    .select(`
        id,
        name,
        created_at
      `)
    .lte('created_at', thirtyDaysAgo.toISOString())

  if (inactiveOrgs) {
    // Check for organizations with no recent transactions
    const inactiveCount = await Promise.all(
      (inactiveOrgs as OrganizationRecord[]).map(async (org) => {
        const { count } = await supabase
          .from('credit_transactions')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', org.id)
          .gte('created_at', thirtyDaysAgo.toISOString())

        return count === 0
      })
    )

    const totalInactive = inactiveCount.filter(Boolean).length

    if (totalInactive > 5) {
      alerts.push({
        id: 'inactive-orgs',
        severity: 'warning',
        message: `${totalInactive} organizations have been inactive for over 30 days`,
        timestamp: now.toISOString(),
      })
    }
  }

  const stats = {
    organizations: {
      total: totalOrgs,
      active: activeOrgsCount,
      growth: orgGrowth,
    },
    users: {
      total: totalUsers || 0,
      new_this_month: usersThisMonth || 0,
      growth: userGrowth,
    },
    credits: {
      total_purchased: totalPurchased,
      total_used: totalUsed,
      total_remaining: totalRemaining,
      revenue: totalRevenue,
    },
    activity: {
      transactions_today: transactionsToday || 0,
      invitations_pending: pendingInvitations || 0,
      waitlist_signups: waitlistCount || 0,
      active_coupons: activeCoupons || 0,
    },
    recentActivity,
    alerts,
  }

  return successResponse({ stats })
})

