'use client'

/**
 * Rate Limits Management Page
 * View and manage API rate limits for the organization
 */

import { logger } from '@/lib/logging'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  ChevronLeft,
  Clock,
  CheckCircle,
  Activity,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'

interface RateLimitConfig {
  tier: string
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_allowance: number
  enforce_hard_limits: boolean
}

interface RateLimitStatus {
  minute: { allowed: boolean; limit: number; remaining: number; reset: number }
  hour: { allowed: boolean; limit: number; remaining: number; reset: number }
  day: { allowed: boolean; limit: number; remaining: number; reset: number }
}

interface RateLimitTier {
  id: string
  tier_name: string
  display_name: string
  description: string
  requests_per_minute: number
  requests_per_hour: number
  requests_per_day: number
  burst_allowance: number
  webhooks_per_minute: number
  webhooks_per_hour: number
  max_concurrent_requests: number
  monthly_price_cents: number | null
}

interface RateLimitViolation {
  id: string
  endpoint: string
  method: string
  created_at: string
  retry_after: number
  current_count: number
  limit_value: number
  limit_type: string
  api_keys?: {
    name: string
    key_prefix: string
  }
  profiles?: {
    full_name: string
    email: string
  }
}

interface UsageData {
  summary: {
    total_requests: number
    total_webhooks: number
    total_calls: number
    days: number
    peak_day: string
    peak_requests: number
    avg_daily_requests: number
  }
  daily: Array<{
    date: string
    requests: number
    webhooks: number
    total: number
  }>
}

export default function RateLimitsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const [config, setConfig] = useState<RateLimitConfig | null>(null)
  const [status, setStatus] = useState<RateLimitStatus | null>(null)
  const [tiers, setTiers] = useState<RateLimitTier[]>([])
  const [violations, setViolations] = useState<RateLimitViolation[]>([])
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [_selectedTier, setSelectedTier] = useState<string>('')
  const [usageDays, setUsageDays] = useState<string>('7')

  useEffect(() => {
    fetchRateLimitData()
    fetchViolations()
    fetchUsageData()
    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      fetchRateLimitData()
    }, 30000)
    return () => clearInterval(interval)
  }, [organizationId])

  useEffect(() => {
    if (usageDays) {
      fetchUsageData()
    }
  }, [usageDays])

  const fetchRateLimitData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/organizations/${organizationId}/rate-limits`)

      if (!res.ok) {
        throw new Error('Failed to fetch rate limit data')
      }

      const data = await res.json()
      setConfig(data.config)
      setStatus(data.status)
      setTiers(data.tiers || [])
      setSelectedTier(data.config.tier)
    } catch (error) {
      logger.error('Error fetching rate limit data', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to load rate limit configuration',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchViolations = async () => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/rate-limits/violations?limit=10`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch violations')
      }

      const data = await res.json()
      setViolations(data.violations || [])
    } catch (error) {
      logger.error('Error fetching violations', error instanceof Error ? error : undefined, { errorMsg: String(error) })
    }
  }

  const fetchUsageData = async () => {
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/rate-limits/usage?days=${usageDays}`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const data = await res.json()
      setUsageData(data)
    } catch (error) {
      logger.error('Error fetching usage data', error instanceof Error ? error : undefined, { errorMsg: String(error) })
    }
  }

  const handleUpdateTier = async (newTier: string) => {
    if (newTier === config?.tier) {
      toast.info('No Change', {
        description: 'This is already your current tier',
      })
      return
    }

    try {
      setUpdating(true)
      const res = await fetch(`/api/organizations/${organizationId}/rate-limits`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to update tier')
      }

      const data = await res.json()
      setConfig(data.config)
      setSelectedTier(newTier)

      toast.success('Tier Updated', {
        description: `Successfully updated to ${newTier} tier`,
      })

      // Refresh data
      await fetchRateLimitData()
    } catch (error: any) {
      logger.error('Error updating tier', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: error.message || 'Failed to update tier',
      })
    } finally {
      setUpdating(false)
    }
  }

  const getTierBadgeVariant = (tierName: string) => {
    switch (tierName) {
      case 'free':
        return 'secondary'
      case 'starter':
        return 'default'
      case 'pro':
        return 'default'
      case 'enterprise':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getTierColor = (tierName: string) => {
    switch (tierName) {
      case 'free':
        return 'text-gray-600'
      case 'starter':
        return 'text-blue-600'
      case 'pro':
        return 'text-purple-600'
      case 'enterprise':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const formatPrice = (cents: number | null) => {
    if (cents === null) return 'Contact Sales'
    if (cents === 0) return 'Free'
    return `$${(cents / 100).toFixed(2)}/mo`
  }

  const calculatePercentage = (remaining: number, limit: number) => {
    const used = limit - remaining
    return (used / limit) * 100
  }

  const _getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-amber-500'
    return 'bg-green-500'
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading rate limit data...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!config || !status) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">
              Failed to load rate limit configuration
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/organizations/${organizationId}`)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" />
              Rate Limits
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage API rate limits and monitor usage
            </p>
          </div>
        </div>

        <Badge variant={getTierBadgeVariant(config.tier)} className="text-lg px-4 py-2">
          {config.tier.toUpperCase()} Tier
        </Badge>
      </div>

      {/* Usage Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Minute Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              This Minute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {status.minute.limit - status.minute.remaining}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {status.minute.limit} requests
                </span>
              </div>
              <Progress
                value={calculatePercentage(status.minute.remaining, status.minute.limit)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {status.minute.remaining} remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Hour Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              This Hour
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {status.hour.limit - status.hour.remaining}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {status.hour.limit} requests
                </span>
              </div>
              <Progress
                value={calculatePercentage(status.hour.remaining, status.hour.limit)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {status.hour.remaining} remaining
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Day Usage */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold">
                  {status.day.limit - status.day.remaining}
                </span>
                <span className="text-sm text-muted-foreground">
                  / {status.day.limit} requests
                </span>
              </div>
              <Progress
                value={calculatePercentage(status.day.remaining, status.day.limit)}
                className="h-2"
              />
              <p className="text-xs text-muted-foreground">
                {status.day.remaining} remaining
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Chart */}
      {usageData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Trend
                </CardTitle>
                <CardDescription>
                  Request volume over the last {usageDays} days
                </CardDescription>
              </div>
              <Select value={usageDays} onValueChange={setUsageDays}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {usageData.daily.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={usageData.daily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return `${date.getMonth() + 1}/${date.getDate()}`
                      }}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#8884d8"
                      strokeWidth={2}
                      name="API Requests"
                    />
                    <Line
                      type="monotone"
                      dataKey="webhooks"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      name="Webhooks"
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Requests</p>
                    <p className="text-2xl font-bold">{usageData.summary.total_requests.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total Webhooks</p>
                    <p className="text-2xl font-bold">{usageData.summary.total_webhooks.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Peak Day</p>
                    <p className="text-2xl font-bold">{usageData.summary.peak_requests.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{usageData.summary.peak_day}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Average</p>
                    <p className="text-2xl font-bold">{usageData.summary.avg_daily_requests.toLocaleString()}</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No usage data available yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tier Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Available Tiers
          </CardTitle>
          <CardDescription>
            Compare rate limit tiers and upgrade your plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Per Minute</TableHead>
                  <TableHead>Per Hour</TableHead>
                  <TableHead>Per Day</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers.map((tier) => (
                  <TableRow
                    key={tier.id}
                    className={
                      tier.tier_name === config.tier ? 'bg-muted/50' : ''
                    }
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${getTierColor(tier.tier_name)}`}>
                          {tier.display_name}
                        </span>
                        {tier.tier_name === config.tier && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tier.description}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono">
                      {tier.requests_per_minute.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {tier.requests_per_hour.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {tier.requests_per_day.toLocaleString()}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {formatPrice(tier.monthly_price_cents)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        onClick={() => handleUpdateTier(tier.tier_name)}
                        disabled={tier.tier_name === config.tier || updating}
                      >
                        {tier.tier_name === config.tier ? 'Current' : 'Select'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Recent Violations
          </CardTitle>
          <CardDescription>
            Rate limit violations in the last 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          {violations.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <p className="text-muted-foreground">No rate limit violations</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your API usage is within limits
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Limit Type</TableHead>
                    <TableHead>Count</TableHead>
                    <TableHead>Retry After</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {violations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="text-sm">
                        {formatDistanceToNow(new Date(violation.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {violation.endpoint}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{violation.method}</Badge>
                      </TableCell>
                      <TableCell>{violation.limit_type}</TableCell>
                      <TableCell>
                        <span className="text-red-600 font-semibold">
                          {violation.current_count}
                        </span>
                        <span className="text-muted-foreground">
                          {' '}
                          / {violation.limit_value}
                        </span>
                      </TableCell>
                      <TableCell>{violation.retry_after}s</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
