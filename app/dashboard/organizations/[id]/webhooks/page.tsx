'use client'

/**
 * Webhooks Management Page
 * Create and manage webhook endpoints for real-time event notifications
 */

import { logger } from '@/lib/logging'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import {
  Webhook,
  Copy,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Send,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface WebhookItem {
  id: string
  name: string
  url: string
  events: string[]
  is_active: boolean
  last_triggered_at: string | null
  created_at: string
  created_by: {
    full_name: string
    email: string
  }
}

interface EventGroup {
  category: string
  events: Array<{
    event: string
    description: string
  }>
}

const EVENT_GROUPS: EventGroup[] = [
  {
    category: 'Organization',
    events: [
      { event: 'organization.created', description: 'Organization created' },
      { event: 'organization.updated', description: 'Organization updated' },
      { event: 'organization.deleted', description: 'Organization deleted' },
    ],
  },
  {
    category: 'Members',
    events: [
      { event: 'member.invited', description: 'Member invited' },
      { event: 'member.joined', description: 'Member joined' },
      { event: 'member.removed', description: 'Member removed' },
      { event: 'member.role_changed', description: 'Member role changed' },
      { event: 'member.left', description: 'Member left' },
    ],
  },
  {
    category: 'Credits',
    events: [
      { event: 'credits.added', description: 'Credits added' },
      { event: 'credits.purchased', description: 'Credits purchased' },
      { event: 'credits.used', description: 'Credits used' },
      { event: 'credits.expired', description: 'Credits expired' },
      { event: 'credits.refunded', description: 'Credits refunded' },
    ],
  },
  {
    category: 'Invitations',
    events: [
      { event: 'invitation.sent', description: 'Invitation sent' },
      { event: 'invitation.accepted', description: 'Invitation accepted' },
      { event: 'invitation.declined', description: 'Invitation declined' },
      { event: 'invitation.expired', description: 'Invitation expired' },
      { event: 'invitation.bulk_sent', description: 'Bulk invitations sent' },
    ],
  },
  {
    category: 'API Keys',
    events: [
      { event: 'api_key.created', description: 'API key created' },
      { event: 'api_key.revoked', description: 'API key revoked' },
      { event: 'api_key.deleted', description: 'API key deleted' },
    ],
  },
  {
    category: 'Courses',
    events: [
      { event: 'course.enrolled', description: 'Course enrolled' },
      { event: 'course.completed', description: 'Course completed' },
      { event: 'course.progress', description: 'Course progress' },
    ],
  },
]

export default function WebhooksPage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.id as string

  const [webhooks, setWebhooks] = useState<WebhookItem[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [expandedWebhooks, setExpandedWebhooks] = useState<Set<string>>(new Set())

  // Create webhook form state
  const [webhookName, setWebhookName] = useState('')
  const [webhookUrl, setWebhookUrl] = useState('')
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set())
  const [creating, setCreating] = useState(false)
  const [newSecret, setNewSecret] = useState<string | null>(null)

  // Test webhook state
  const [testing, setTesting] = useState<string | null>(null)

  useEffect(() => {
    fetchWebhooks()
  }, [organizationId])

  const fetchWebhooks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/organizations/${organizationId}/webhooks`)

      if (!res.ok) {
        throw new Error('Failed to fetch webhooks')
      }

      const data = await res.json()
      setWebhooks(data.webhooks || [])
    } catch (error) {
      logger.error('Error fetching webhooks', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to load webhooks',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWebhook = async () => {
    if (!webhookName.trim()) {
      toast.error('Validation Error', {
        description: 'Please provide a name for the webhook',
      })
      return
    }

    if (!webhookUrl.trim()) {
      toast.error('Validation Error', {
        description: 'Please provide a URL for the webhook',
      })
      return
    }

    if (selectedEvents.size === 0) {
      toast.error('Validation Error', {
        description: 'Please select at least one event',
      })
      return
    }

    try {
      setCreating(true)
      const res = await fetch(`/api/organizations/${organizationId}/webhooks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookName.trim(),
          url: webhookUrl.trim(),
          events: Array.from(selectedEvents),
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create webhook')
      }

      const data = await res.json()
      setNewSecret(data.secret)
      setWebhooks([data.webhook, ...webhooks])

      // Reset form
      setWebhookName('')
      setWebhookUrl('')
      setSelectedEvents(new Set())

      toast.success('Webhook Created', {
        description: 'Your webhook has been created. Make sure to copy the secret!',
      })
    } catch (error) {
      logger.error('Error creating webhook', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to create webhook',
      })
    } finally {
      setCreating(false)
    }
  }

  const handleToggleActive = async (webhookId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!res.ok) {
        throw new Error('Failed to toggle webhook')
      }

      setWebhooks(webhooks.map(wh =>
        wh.id === webhookId ? { ...wh, is_active: !isActive } : wh
      ))

      toast.success(isActive ? 'Webhook Disabled' : 'Webhook Enabled', {
        description: isActive
          ? 'This webhook will no longer receive events'
          : 'This webhook will now receive events',
      })
    } catch (error) {
      logger.error('Error toggling webhook', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to toggle webhook',
      })
    }
  }

  const handleDeleteWebhook = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/webhooks/${webhookId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete webhook')
      }

      setWebhooks(webhooks.filter(wh => wh.id !== webhookId))

      toast.success('Webhook Deleted', {
        description: 'The webhook has been permanently deleted',
      })
    } catch (error) {
      logger.error('Error deleting webhook', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to delete webhook',
      })
    }
  }

  const handleTestWebhook = async (webhookId: string) => {
    try {
      setTesting(webhookId)
      const res = await fetch(`/api/organizations/${organizationId}/webhooks/${webhookId}/test`, {
        method: 'POST',
      })

      const result = await res.json()

      if (result.success) {
        toast.success('Test Successful', {
          description: `Webhook responded with status ${result.status}`,
        })
      } else {
        toast.error('Test Failed', {
          description: result.error || 'The webhook endpoint did not respond successfully',
        })
      }
    } catch (error) {
      logger.error('Error testing webhook', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to test webhook',
      })
    } finally {
      setTesting(null)
    }
  }

  const handleRegenerateSecret = async (webhookId: string) => {
    try {
      const res = await fetch(`/api/organizations/${organizationId}/webhooks/${webhookId}/regenerate`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to regenerate secret')
      }

      const data = await res.json()
      setNewSecret(data.secret)

      toast.success('Secret Regenerated', {
        description: 'A new secret has been generated. Update your webhook endpoint!',
      })
    } catch (error) {
      logger.error('Error regenerating secret', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to regenerate secret',
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied', {
      description: 'Copied to clipboard',
    })
  }

  const toggleEvent = (event: string) => {
    const newEvents = new Set(selectedEvents)
    if (newEvents.has(event)) {
      newEvents.delete(event)
    } else {
      newEvents.add(event)
    }
    setSelectedEvents(newEvents)
  }

  const toggleWebhookExpanded = (webhookId: string) => {
    const newExpanded = new Set(expandedWebhooks)
    if (newExpanded.has(webhookId)) {
      newExpanded.delete(webhookId)
    } else {
      newExpanded.add(webhookId)
    }
    setExpandedWebhooks(newExpanded)
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Webhook className="h-8 w-8" />
            Webhooks
          </h1>
          <p className="text-muted-foreground mt-2">
            Receive real-time HTTP notifications when events occur in your organization
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Webhook className="h-4 w-4 mr-2" />
              Create Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Webhook</DialogTitle>
              <DialogDescription>
                Configure a webhook endpoint to receive real-time event notifications via HTTP POST
              </DialogDescription>
            </DialogHeader>

            {newSecret ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-green-900">Webhook Created Successfully</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Make sure to copy your webhook secret now. You won't be able to see it again!
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Your Webhook Secret</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newSecret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      onClick={() => copyToClipboard(newSecret)}
                      variant="outline"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Use this secret to verify webhook signatures (HMAC-SHA256)
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900">Security Best Practices</h3>
                      <ul className="text-sm text-amber-700 mt-1 space-y-1">
                        <li>• Verify the X-Webhook-Signature header on every request</li>
                        <li>• Use HTTPS endpoints only</li>
                        <li>• Store the secret securely (environment variables)</li>
                        <li>• Respond with 2xx status codes quickly</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={() => {
                      setNewSecret(null)
                      setCreateDialogOpen(false)
                    }}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="webhookName">Webhook Name *</Label>
                  <Input
                    id="webhookName"
                    placeholder="e.g., Production Notifications, Slack Integration"
                    value={webhookName}
                    onChange={(e) => setWebhookName(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    A descriptive name to identify this webhook
                  </p>
                </div>

                <div>
                  <Label htmlFor="webhookUrl">Endpoint URL *</Label>
                  <Input
                    id="webhookUrl"
                    type="url"
                    placeholder="https://your-app.com/webhooks/neuroelemental"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    HTTPS endpoint that will receive POST requests
                  </p>
                </div>

                <div>
                  <Label>Events to Subscribe *</Label>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">
                    Select which events should trigger this webhook
                  </p>

                  <div className="space-y-4">
                    {EVENT_GROUPS.map((group) => (
                      <div key={group.category} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">{group.category}</h3>
                        <div className="space-y-2">
                          {group.events.map((eventItem) => (
                            <div key={eventItem.event} className="flex items-start gap-2">
                              <Checkbox
                                id={eventItem.event}
                                checked={selectedEvents.has(eventItem.event)}
                                onCheckedChange={() => toggleEvent(eventItem.event)}
                              />
                              <div className="flex-1">
                                <Label
                                  htmlFor={eventItem.event}
                                  className="font-mono text-sm cursor-pointer"
                                >
                                  {eventItem.event}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  {eventItem.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateWebhook}
                    disabled={creating || !webhookName.trim() || !webhookUrl.trim() || selectedEvents.size === 0}
                  >
                    {creating ? 'Creating...' : 'Create Webhook'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading webhooks...</p>
          </CardContent>
        </Card>
      ) : webhooks.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Webhooks</h3>
              <p className="text-muted-foreground mb-4">
                Create your first webhook to start receiving real-time event notifications
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Webhook className="h-4 w-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {webhooks.map((webhook) => {
            const isExpanded = expandedWebhooks.has(webhook.id)

            return (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{webhook.name}</CardTitle>
                        <Badge variant={webhook.is_active ? 'outline' : 'secondary'} className={webhook.is_active ? 'bg-green-50 text-green-700 border-green-200' : ''}>
                          {webhook.is_active ? 'Active' : 'Disabled'}
                        </Badge>
                      </div>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <ExternalLink className="h-3 w-3" />
                        <span className="font-mono text-xs">{webhook.url}</span>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={webhook.is_active}
                        onCheckedChange={() => handleToggleActive(webhook.id, webhook.is_active)}
                      />

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleWebhookExpanded(webhook.id)}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestWebhook(webhook.id)}
                        disabled={testing === webhook.id || !webhook.is_active}
                      >
                        {testing === webhook.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the webhook. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteWebhook(webhook.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete Permanently
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Created By</Label>
                        <p className="text-sm font-medium mt-1">
                          {webhook.created_by.full_name || webhook.created_by.email}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Created At</Label>
                        <p className="text-sm font-medium mt-1">
                          {formatDistanceToNow(new Date(webhook.created_at), { addSuffix: true })}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Last Triggered</Label>
                        <p className="text-sm font-medium mt-1">
                          {webhook.last_triggered_at ? (
                            formatDistanceToNow(new Date(webhook.last_triggered_at), { addSuffix: true })
                          ) : (
                            <span className="text-muted-foreground">Never</span>
                          )}
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Subscribed Events</Label>
                        <p className="text-sm font-medium mt-1">
                          {webhook.events.length} event{webhook.events.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Events</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {webhook.events.map((event) => (
                          <Badge key={event} variant="secondary" className="font-mono text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/organizations/${organizationId}/webhooks/${webhook.id}`)}
                      >
                        View Deliveries
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRegenerateSecret(webhook.id)}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Regenerate Secret
                      </Button>
                    </div>
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
