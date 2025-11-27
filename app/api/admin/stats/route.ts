/**
 * Admin Stats API
 * Aggregate statistics for admin dashboard
 */

import { createAdminRoute, successResponse } from '@/lib/api'
import { getSupabaseServer } from '@/lib/db'

/**
 * GET /api/admin/stats
 * Get platform-wide statistics (admin only)
 */
export const GET = createAdminRoute(async (_request, _context, _admin) => {
  const supabase = getSupabaseServer()

  // Get organization stats
  const { count: orgCount } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })

  // Get total members across all orgs
  const { count: memberCount } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })

  // Get active invitations
  const { count: activeInvites } = await supabase
    .from('organization_invitations')
    .select('*', { count: 'exact', head: true })
    .gte('expires_at', new Date().toISOString())

  // Get waitlist stats
  const { count: waitlistCount } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })

  // Get recent waitlist signups (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { count: recentWaitlist } = await supabase
    .from('waitlist')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', sevenDaysAgo.toISOString())

  // Get coupon stats
  const { count: totalCoupons } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })

  const { count: activeCoupons } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('active', true)

  // Get total credit transactions
  const { count: totalTransactions } = await supabase
    .from('credit_transactions')
    .select('*', { count: 'exact', head: true })

  // Get recent organizations (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { count: recentOrgs } = await supabase
    .from('organizations')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', thirtyDaysAgo.toISOString())

  // Get most used coupons
  const { data: topCoupons } = await supabase
    .from('coupons')
    .select('code, uses_count, discount_type, discount_value')
    .order('uses_count', { ascending: false })
    .limit(5)

  // Get recent organizations with details
  const { data: recentOrganizations } = await supabase
    .from('organizations')
    .select(`
      id,
      name,
      slug,
      created_at,
      member_count:organization_members(count)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  return successResponse({
    organizations: {
      total: orgCount || 0,
      recentMonth: recentOrgs || 0,
      totalMembers: memberCount || 0,
      activeInvites: activeInvites || 0,
    },
    waitlist: {
      total: waitlistCount || 0,
      recentWeek: recentWaitlist || 0,
    },
    coupons: {
      total: totalCoupons || 0,
      active: activeCoupons || 0,
      topUsed: topCoupons || [],
    },
    credits: {
      totalTransactions: totalTransactions || 0,
    },
    recent: {
      organizations: recentOrganizations || [],
    },
  })
})

