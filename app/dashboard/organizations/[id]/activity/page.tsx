'use client'

/**
 * Organization Activity Log Page
 * View audit trail of all organization activities
 */

import { useEffect, useState } from 'react'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  Activity,
  UserPlus,
  UserMinus,
  Coins,
  Settings,
  Mail,
  Building2,
  Shield,
  Clock,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTime, formatRelativeTime } from '@/lib/utils'

interface ActivityLog {
  id: string
  action_type: string
  entity_type: string
  entity_id: string | null
  description: string
  created_at: string
  metadata: Record<string, any> | null
  user: {
    full_name: string | null
    email: string
  } | null
}

export default function OrganizationActivityPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchActivities()
  }, [orgId, filter])

  const fetchActivities = async () => {
    try {
      const url = new URL(`/api/organizations/${orgId}/activity`, window.location.origin)
      if (filter !== 'all') {
        url.searchParams.set('action_type', filter)
      }

      const res = await fetch(url.toString())
      if (!res.ok) throw new Error('Failed to fetch activities')

      const data = await res.json()
      setActivities(data.activities || [])
    } catch (err) {
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to load activities',
      })
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (actionType: string) => {
    if (actionType.startsWith('member.')) {
      if (actionType.includes('invited') || actionType.includes('joined')) {
        return <UserPlus className="h-4 w-4 text-green-600" />
      }
      return <UserMinus className="h-4 w-4 text-red-600" />
    }
    if (actionType.startsWith('credits.')) {
      return <Coins className="h-4 w-4 text-yellow-600" />
    }
    if (actionType.startsWith('invitation.')) {
      return <Mail className="h-4 w-4 text-blue-600" />
    }
    if (actionType.startsWith('organization.')) {
      return <Building2 className="h-4 w-4 text-purple-600" />
    }
    if (actionType.startsWith('settings.')) {
      return <Settings className="h-4 w-4 text-gray-600" />
    }
    return <Activity className="h-4 w-4 text-muted-foreground" />
  }

  const getActivityColor = (actionType: string) => {
    if (actionType.includes('created') || actionType.includes('added') || actionType.includes('joined')) {
      return 'text-green-600'
    }
    if (actionType.includes('deleted') || actionType.includes('removed') || actionType.includes('declined')) {
      return 'text-red-600'
    }
    if (actionType.includes('updated') || actionType.includes('changed')) {
      return 'text-blue-600'
    }
    return 'text-muted-foreground'
  }

  const formatTimestamp = (timestamp: string) => {
    return formatRelativeTime(timestamp)
  }

  const formatFullTimestamp = (timestamp: string) => {
    return formatDateTime(timestamp)
  }

  const getUserName = (activity: ActivityLog) => {
    if (!activity.user) return 'System'
    return activity.user.full_name || activity.user.email || 'Unknown'
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Activity Log</h1>
              <p className="text-muted-foreground">
                Audit trail of all organization activities
              </p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filter Activities</CardTitle>
                <CardDescription>
                  View specific types of activities
                </CardDescription>
              </div>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Activities</SelectItem>
                  <SelectItem value="member">Member Actions</SelectItem>
                  <SelectItem value="credits">Credit Actions</SelectItem>
                  <SelectItem value="invitation">Invitations</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                  <SelectItem value="settings">Settings</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Timeline</CardTitle>
            <CardDescription>
              {activities.length} activities recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No activities found</p>
                {filter !== 'all' && (
                  <Button
                    variant="link"
                    onClick={() => setFilter('all')}
                    className="mt-2"
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-1">
                      {getActivityIcon(activity.action_type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className={`font-medium ${getActivityColor(activity.action_type)}`}>
                        {activity.description}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getUserName(activity)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span title={formatFullTimestamp(activity.created_at)}>
                            {formatTimestamp(activity.created_at)}
                          </span>
                        </div>
                      </div>
                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="mt-2">
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              View details
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                              {JSON.stringify(activity.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.entity_type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Activity Log Information</p>
                <p>
                  This audit trail records all actions performed within your organization,
                  including member changes, credit transactions, and settings updates.
                  Activities are retained for compliance and security purposes.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
