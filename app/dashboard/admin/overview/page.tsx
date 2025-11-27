'use client'

/**
 * Admin Platform Overview Dashboard
 * High-level platform metrics and health monitoring
 */

import { useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAsync } from '@/hooks/use-async'
import {
  Building2,
  Users,
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { toast } from 'sonner'

interface PlatformStats {
  organizations: {
    total: number
    active: number
    growth: number
  }
  users: {
    total: number
    new_this_month: number
    growth: number
  }
  credits: {
    total_purchased: number
    total_used: number
    total_remaining: number
    revenue: number
  }
  activity: {
    transactions_today: number
    invitations_pending: number
    waitlist_signups: number
    active_coupons: number
  }
  recentActivity: Array<{
    id: string
    type: 'organization' | 'credit' | 'invitation' | 'coupon'
    message: string
    timestamp: string
  }>
  alerts: Array<{
    id: string
    severity: 'info' | 'warning' | 'error'
    message: string
    timestamp: string
  }>
}

export default function AdminOverviewPage() {
  const { data: stats, loading, error, execute } = useAsync<PlatformStats>()

  useEffect(() => {
    fetchPlatformStats()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const fetchPlatformStats = () => execute(async () => {
    const res = await fetch('/api/admin/platform/stats')
    if (!res.ok) throw new Error('Failed to fetch stats')

    const result = await res.json()
    return result.stats
  })

  const formatTrend = (value: number) => {
    const isPositive = value >= 0
    return (
      <span className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(value)}%
      </span>
    )
  }

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'organization':
        return <Building2 className="h-4 w-4 text-blue-600" />
      case 'credit':
        return <Coins className="h-4 w-4 text-green-600" />
      case 'invitation':
        return <UserPlus className="h-4 w-4 text-purple-600" />
      case 'coupon':
        return <DollarSign className="h-4 w-4 text-orange-600" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">
              Failed to load platform statistics
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
          <p className="text-muted-foreground">
            Monitor platform health and key metrics
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organizations</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.organizations.total}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  {stats.organizations.active} active
                </p>
                {formatTrend(stats.organizations.growth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.total}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">
                  +{stats.users.new_this_month} this month
                </p>
                {formatTrend(stats.users.growth)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(stats.credits.revenue / 100).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From credit purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Remaining</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.credits.total_remaining.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all organizations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credit Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.credits.total_purchased.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime purchases
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.credits.total_used.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Lifetime consumption
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usage Rate</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.credits.total_purchased > 0
                  ? Math.round((stats.credits.total_used / stats.credits.total_purchased) * 100)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Credits consumed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Activity */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activity.transactions_today}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invitations</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activity.invitations_pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waitlist Signups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activity.waitlist_signups}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activity.active_coupons}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{activity.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.alerts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>All systems operational</p>
                  </div>
                ) : (
                  stats.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.severity === 'error'
                          ? 'bg-red-50 border-red-200 dark:bg-red-950/20'
                          : alert.severity === 'warning'
                          ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/20'
                          : 'bg-blue-50 border-blue-200 dark:bg-blue-950/20'
                      }`}
                    >
                      {getAlertIcon(alert.severity)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </div>
                      <Badge
                        variant={
                          alert.severity === 'error'
                            ? 'destructive'
                            : alert.severity === 'warning'
                            ? 'secondary'
                            : 'default'
                        }
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
