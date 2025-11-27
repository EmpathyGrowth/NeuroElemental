'use client'

/**
 * Webhook Deliveries Page
 * View delivery history and status for a specific webhook
 */

import { logger } from '@/lib/logging'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import {
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Delivery {
  id: string
  event_type: string
  status: 'pending' | 'success' | 'failed'
  response_status_code: number | null
  response_body: string | null
  attempts: number
  next_retry_at: string | null
  delivered_at: string | null
  created_at: string
  payload: Record<string, unknown>
}

export default function WebhookDeliveriesPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string
  const webhookId = params.webhookId as string

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchDeliveries()
  }, [webhookId, statusFilter])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const url = new URL(`/api/organizations/${organizationId}/webhooks/${webhookId}/deliveries`, window.location.origin)
      if (statusFilter !== 'all') {
        url.searchParams.set('status', statusFilter)
      }

      const res = await fetch(url)

      if (!res.ok) {
        throw new Error('Failed to fetch deliveries')
      }

      const data = await res.json()
      setDeliveries(data.deliveries || [])
    } catch (error) {
      logger.error('Error fetching deliveries', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Failed to load webhook deliveries')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Success</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const toggleDeliveryExpanded = (deliveryId: string) => {
    const newExpanded = new Set(expandedDeliveries)
    if (newExpanded.has(deliveryId)) {
      newExpanded.delete(deliveryId)
    } else {
      newExpanded.add(deliveryId)
    }
    setExpandedDeliveries(newExpanded)
  }

  // Calculate stats
  const successCount = deliveries.filter(d => d.status === 'success').length
  const failedCount = deliveries.filter(d => d.status === 'failed').length
  const pendingCount = deliveries.filter(d => d.status === 'pending').length
  const totalCount = deliveries.length
  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : '0'

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/dashboard/organizations/${organizationId}/webhooks`)}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Webhooks
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Webhook Deliveries</h1>
        <p className="text-muted-foreground mt-2">
          View delivery history and troubleshoot failed requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <p className="text-xs text-muted-foreground">
              {successRate}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchDeliveries}
          disabled={loading}
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Deliveries List */}
      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading deliveries...</p>
          </CardContent>
        </Card>
      ) : deliveries.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Deliveries Yet</h3>
              <p className="text-muted-foreground">
                Webhook deliveries will appear here once events are triggered
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {deliveries.map((delivery) => {
            const isExpanded = expandedDeliveries.has(delivery.id)

            return (
              <Card key={delivery.id}>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getStatusIcon(delivery.status)}

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium">
                            {delivery.event_type}
                          </span>
                          {getStatusBadge(delivery.status)}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {delivery.delivered_at
                            ? `Delivered ${formatDistanceToNow(new Date(delivery.delivered_at), { addSuffix: true })}`
                            : delivery.next_retry_at
                            ? `Next retry ${formatDistanceToNow(new Date(delivery.next_retry_at), { addSuffix: true })}`
                            : `Created ${formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}`}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {delivery.response_status_code && (
                          <Badge variant="outline" className="font-mono">
                            HTTP {delivery.response_status_code}
                          </Badge>
                        )}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {delivery.attempts > 1 && (
                          <span className="text-xs">
                            {delivery.attempts} attempt{delivery.attempts !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDeliveryExpanded(delivery.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="border-t pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Delivery ID</p>
                        <p className="text-sm font-mono mt-1">{delivery.id}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Event Type</p>
                        <p className="text-sm font-mono mt-1">{delivery.event_type}</p>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Status</p>
                        <div className="mt-1">{getStatusBadge(delivery.status)}</div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-muted-foreground">Attempts</p>
                        <p className="text-sm mt-1">{delivery.attempts} / 3</p>
                      </div>

                      {delivery.response_status_code && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Response Code</p>
                          <p className="text-sm font-mono mt-1">HTTP {delivery.response_status_code}</p>
                        </div>
                      )}

                      {delivery.delivered_at && (
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">Delivered At</p>
                          <p className="text-sm mt-1">
                            {new Date(delivery.delivered_at).toLocaleString()}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">Payload</p>
                      <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto">
                        {JSON.stringify(delivery.payload, null, 2)}
                      </pre>
                    </div>

                    {delivery.response_body && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Response Body</p>
                        <pre className="bg-gray-50 rounded-lg p-4 text-xs font-mono overflow-x-auto max-h-64">
                          {delivery.response_body}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
