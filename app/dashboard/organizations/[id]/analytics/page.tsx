'use client'

/**
 * Analytics Dashboard Page
 * Display organization usage statistics and charts
 */

import { logger } from '@/lib/logging'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import {
  Activity,
  TrendingUp,
  Users,
  Zap,
  AlertCircle,
  BarChart3,
  ChevronLeft,
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

interface AnalyticsData {
  metrics: {
    total_activities: number
    api_calls: number
    webhooks_sent: number
    credits_used: number
  }
  activity_trend: Array<{
    date: string
    activities: number
    api_calls: number
  }>
  most_active_users: Array<{
    user_id: string
    full_name: string
    email: string
    activity_count: number
    last_active: string
  }>
  system_health: {
    error_rate: number
    avg_response_time: number
    uptime_percentage: number
  }
}

export default function AnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<string>('7')

  useEffect(() => {
    fetchAnalytics()
  }, [organizationId, period])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await fetch(
        `/api/organizations/${organizationId}/analytics?days=${period}&view=overview`
      )

      if (!res.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await res.json()
      setAnalyticsData(data)
    } catch (error) {
      logger.error('Error fetching analytics', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
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
              <BarChart3 className="h-8 w-8" />
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor your organization's activity and performance metrics
            </p>
          </div>
        </div>

        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading analytics...</p>
          </CardContent>
        </Card>
      ) : !analyticsData ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
              <p className="text-muted-foreground">
                Analytics data could not be loaded. Please try again later.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key Metrics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analyticsData.metrics.total_activities)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  User actions in the last {period} days
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analyticsData.metrics.api_calls)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  API requests processed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Webhooks Sent</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analyticsData.metrics.webhooks_sent)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Event notifications delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatNumber(analyticsData.metrics.credits_used)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Credits consumed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Activity Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Trend</CardTitle>
              <CardDescription>
                Daily activities and API calls over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analyticsData.activity_trend}>
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
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString()
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="activities"
                    stroke="#8884d8"
                    strokeWidth={2}
                    name="Activities"
                  />
                  <Line
                    type="monotone"
                    dataKey="api_calls"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    name="API Calls"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Most Active Users */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Most Active Users
              </CardTitle>
              <CardDescription>
                Top users by activity count in the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analyticsData.most_active_users.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No user activity data available
                </p>
              ) : (
                <div className="space-y-4">
                  {analyticsData.most_active_users.map((user, index) => (
                    <div
                      key={user.user_id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || user.email}</p>
                          {user.full_name && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Last active{' '}
                            {formatDistanceToNow(new Date(user.last_active), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatNumber(user.activity_count)}</p>
                        <p className="text-xs text-muted-foreground">activities</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>
                Performance and reliability metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Error Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.system_health.error_rate.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={analyticsData.system_health.error_rate}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.system_health.error_rate < 1
                    ? 'Excellent'
                    : analyticsData.system_health.error_rate < 5
                    ? 'Good'
                    : 'Needs attention'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Average Response Time</span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.system_health.avg_response_time.toFixed(0)}ms
                  </span>
                </div>
                <Progress
                  value={Math.min(
                    (analyticsData.system_health.avg_response_time / 1000) * 100,
                    100
                  )}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.system_health.avg_response_time < 200
                    ? 'Excellent'
                    : analyticsData.system_health.avg_response_time < 500
                    ? 'Good'
                    : 'Needs improvement'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground">
                    {analyticsData.system_health.uptime_percentage.toFixed(2)}%
                  </span>
                </div>
                <Progress
                  value={analyticsData.system_health.uptime_percentage}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {analyticsData.system_health.uptime_percentage > 99.9
                    ? 'Excellent'
                    : analyticsData.system_health.uptime_percentage > 99
                    ? 'Good'
                    : 'Needs attention'}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
