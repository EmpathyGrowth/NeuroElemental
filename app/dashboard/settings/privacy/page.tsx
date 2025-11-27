'use client'

import { useState, useEffect } from 'react'
import { useAsync } from '@/hooks/use-async'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { logger } from '@/lib/logging'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'
import {
  Shield,
  Download,
  Trash2,
  Eye,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  Database,
} from 'lucide-react'

interface DataSummary {
  profile_count: number
  memberships_count: number
  activity_count: number
  api_keys_count: number
  webhooks_count: number
  last_updated: string
}

interface ExportRequest {
  id: string
  export_type: string
  export_format: string
  status: string
  file_size_bytes?: number
  created_at: string
  completed_at?: string
  expires_at?: string
}

interface DeletionRequest {
  id: string
  deletion_type: string
  status: string
  created_at: string
  confirmed_at?: string
  confirmation_token?: string
}

interface AccessLog {
  id: string
  access_type: string
  resource_type: string
  reason?: string
  created_at: string
  accessed_by_user: {
    full_name: string
    email: string
  }
}

export default function PrivacyPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Async data fetching
  const { data: dataSummary, execute: executeDataSummary } = useAsync<DataSummary>()
  const { data: exportRequests, execute: executeExportRequests } = useAsync<ExportRequest[]>()
  const { data: deletionRequests, execute: executeDeletionRequests } = useAsync<DeletionRequest[]>()
  const { data: accessLogs, execute: executeAccessLogs } = useAsync<AccessLog[]>()
  const [loading, setLoading] = useState(true)
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false)
  const [fullSummary, setFullSummary] = useState<Record<string, unknown> | null>(null)

  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)
  const [exportType, setExportType] = useState<'personal' | 'organization'>('personal')
  const [exportFormat, setExportFormat] = useState<'json' | 'csv_zip'>('json')
  const [exportOrgId, setExportOrgId] = useState('')
  const [includeProfile, setIncludeProfile] = useState(true)
  const [includeActivity, setIncludeActivity] = useState(true)
  const [includeMemberships, setIncludeMemberships] = useState(true)
  const [includeApiKeys, setIncludeApiKeys] = useState(true)
  const [includeWebhooks, setIncludeWebhooks] = useState(true)
  const [includeBilling, setIncludeBilling] = useState(true)
  const [includeContent, setIncludeContent] = useState(true)
  const [exportReason, setExportReason] = useState('')

  // Deletion dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deletionType, setDeletionType] = useState<'account' | 'organization_data'>('account')
  const [deleteOrgId, setDeleteOrgId] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteChecklist, setDeleteChecklist] = useState({
    permanent: false,
    exported: false,
    allData: false,
  })

  // Fetch data on mount
  useEffect(() => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    fetchAllData()
  }, [user])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchDataSummary(),
        fetchExportRequests(),
        fetchDeletionRequests(),
        fetchAccessLogs(),
      ])
    } catch (error) {
      logger.error('Error fetching data', error as Error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataSummary = () => executeDataSummary(async () => {
    try {
      const response = await fetch('/api/user/data-summary')
      if (response.ok) {
        const data = await response.json()
        setFullSummary(data.summary)
        return {
          profile_count: 1,
          memberships_count: data.summary?.memberships?.length || 0,
          activity_count: data.summary?.activity_logs?.length || 0,
          api_keys_count: data.summary?.api_keys?.length || 0,
          webhooks_count: data.summary?.webhooks?.length || 0,
          last_updated: data.generated_at,
        }
      }
      throw new Error('Failed to fetch data summary')
    } catch (error) {
      logger.error('Error fetching data summary', error as Error)
      throw error
    }
  })

  const fetchExportRequests = () => executeExportRequests(async () => {
    try {
      const response = await fetch('/api/user/data-export')
      if (response.ok) {
        const data = await response.json()
        return data.requests
      }
      throw new Error('Failed to fetch export requests')
    } catch (error) {
      logger.error('Error fetching export requests', error as Error)
      return []
    }
  })

  const fetchDeletionRequests = () => executeDeletionRequests(async () => {
    try {
      const response = await fetch('/api/user/data-deletion')
      if (response.ok) {
        const data = await response.json()
        return data.requests
      }
      throw new Error('Failed to fetch deletion requests')
    } catch (error) {
      logger.error('Error fetching deletion requests', error as Error)
      return []
    }
  })

  const fetchAccessLogs = () => executeAccessLogs(async () => {
    try {
      const response = await fetch('/api/user/data-access-log?limit=10')
      if (response.ok) {
        const data = await response.json()
        return data.logs
      }
      throw new Error('Failed to fetch access logs')
    } catch (error) {
      logger.error('Error fetching access logs', error as Error)
      return []
    }
  })

  const handleRequestExport = async () => {
    setExportLoading(true)
    try {
      const response = await fetch('/api/user/data-export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          export_type: exportType,
          export_format: exportFormat,
          organization_id: exportType === 'organization' ? exportOrgId : undefined,
          include_profile: includeProfile,
          include_activity: includeActivity,
          include_memberships: includeMemberships,
          include_api_keys: includeApiKeys,
          include_webhooks: includeWebhooks,
          include_billing: includeBilling,
          include_content: includeContent,
          requested_reason: exportReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Export Requested', {
          description: 'Your data export request has been created. Processing will begin shortly.',
        })
        setExportDialogOpen(false)
        fetchExportRequests()
        // Reset form
        setExportReason('')
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to create export request',
        })
      }
    } catch (_error) {
      toast.error('Error', {
        description: 'Failed to create export request',
      })
    } finally {
      setExportLoading(false)
    }
  }

  const handleRequestDeletion = async () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Confirmation Required', {
        description: 'Please type DELETE to confirm',
      })
      return
    }

    if (!deleteChecklist.permanent || !deleteChecklist.exported || !deleteChecklist.allData) {
      toast.error('Confirmation Required', {
        description: 'Please check all confirmation boxes',
      })
      return
    }

    setDeleteLoading(true)
    try {
      const response = await fetch('/api/user/data-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deletion_type: deletionType,
          organization_id: deletionType === 'organization_data' ? deleteOrgId : undefined,
          requested_reason: deleteReason,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Deletion Requested', {
          description: 'Confirmation email sent. Please check your email to complete the deletion.',
        })
        setDeleteDialogOpen(false)
        fetchDeletionRequests()
        // Reset form
        setDeleteReason('')
        setDeleteConfirmText('')
        setDeleteChecklist({ permanent: false, exported: false, allData: false })
      } else {
        toast.error('Error', {
          description: data.error || 'Failed to create deletion request',
        })
      }
    } catch (_error) {
      toast.error('Error', {
        description: 'Failed to create deletion request',
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleDownloadExport = async (requestId: string) => {
    try {
      const response = await fetch(`/api/user/data-export/${requestId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `data-export-${requestId}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        toast.success('Download Started', {
          description: 'Your data export is being downloaded',
        })
      } else {
        const data = await response.json()
        toast.error('Error', {
          description: data.error || 'Failed to download export',
        })
      }
    } catch (_error) {
      toast.error('Error', {
        description: 'Failed to download export',
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
      pending: { variant: 'secondary', icon: Clock },
      processing: { variant: 'default', icon: Loader2 },
      completed: { variant: 'default', icon: CheckCircle2 },
      failed: { variant: 'destructive', icon: XCircle },
      pending_confirmation: { variant: 'secondary', icon: Clock },
      confirmed: { variant: 'default', icon: CheckCircle2 },
    }

    const config = variants[status] || { variant: 'secondary' as const, icon: Clock }
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    )
  }

  const getAccessTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      view: 'bg-blue-500/10 text-blue-500',
      export: 'bg-green-500/10 text-green-500',
      modify: 'bg-yellow-500/10 text-yellow-500',
      delete: 'bg-red-500/10 text-red-500',
    }

    return (
      <Badge className={colors[type] || 'bg-gray-500/10 text-gray-500'}>
        {type}
      </Badge>
    )
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    if (kb < 1024) return `${kb.toFixed(2)} KB`
    const mb = kb / 1024
    return `${mb.toFixed(2)} MB`
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="w-8 h-8 text-primary" />
          Privacy & Data Management
        </h1>
        <p className="text-muted-foreground">
          Manage your personal data, export your information, and control your privacy settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Data Summary Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Your Data Summary</CardTitle>
                  <CardDescription>Overview of your stored data</CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSummaryDialogOpen(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Full Summary
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dataSummary ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{dataSummary?.profile_count ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Profile</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{dataSummary?.memberships_count ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Memberships</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{dataSummary?.activity_count ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Activity Logs</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{dataSummary?.api_keys_count ?? 0}</div>
                  <div className="text-sm text-muted-foreground">API Keys</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{dataSummary?.webhooks_count ?? 0}</div>
                  <div className="text-sm text-muted-foreground">Webhooks</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="text-xs">{dataSummary?.last_updated ? formatDate(dataSummary.last_updated) : 'N/A'}</div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Data Export Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <CardTitle>Export Your Data</CardTitle>
                  <CardDescription>
                    Download a copy of all your data in machine-readable format (GDPR Article 20)
                  </CardDescription>
                </div>
              </div>
              <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Download className="w-4 h-4 mr-2" />
                    Request Export
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Request Data Export</DialogTitle>
                    <DialogDescription>
                      Choose what data to export. The export will be available for 30 days.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Export Type</Label>
                      <Select
                        value={exportType}
                        onValueChange={(value: 'personal' | 'organization') => setExportType(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="personal">Personal Data (All Your Data)</SelectItem>
                          <SelectItem value="organization">Organization Data</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {exportType === 'organization' && (
                      <div className="space-y-2">
                        <Label>Organization ID</Label>
                        <Input
                          placeholder="Enter organization ID"
                          value={exportOrgId}
                          onChange={(e) => setExportOrgId(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Format</Label>
                      <Select
                        value={exportFormat}
                        onValueChange={(value: 'json' | 'csv_zip') => setExportFormat(value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="json">JSON</SelectItem>
                          <SelectItem value="csv_zip">CSV (ZIP)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Data Categories to Include</Label>
                      <div className="space-y-3 border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="profile"
                            checked={includeProfile}
                            onCheckedChange={(checked) => setIncludeProfile(checked as boolean)}
                          />
                          <label htmlFor="profile" className="text-sm cursor-pointer">
                            Profile Information
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="activity"
                            checked={includeActivity}
                            onCheckedChange={(checked) => setIncludeActivity(checked as boolean)}
                          />
                          <label htmlFor="activity" className="text-sm cursor-pointer">
                            Activity History
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="memberships"
                            checked={includeMemberships}
                            onCheckedChange={(checked) => setIncludeMemberships(checked as boolean)}
                          />
                          <label htmlFor="memberships" className="text-sm cursor-pointer">
                            Organization Memberships
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="apikeys"
                            checked={includeApiKeys}
                            onCheckedChange={(checked) => setIncludeApiKeys(checked as boolean)}
                          />
                          <label htmlFor="apikeys" className="text-sm cursor-pointer">
                            API Keys
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="webhooks"
                            checked={includeWebhooks}
                            onCheckedChange={(checked) => setIncludeWebhooks(checked as boolean)}
                          />
                          <label htmlFor="webhooks" className="text-sm cursor-pointer">
                            Webhooks
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="billing"
                            checked={includeBilling}
                            onCheckedChange={(checked) => setIncludeBilling(checked as boolean)}
                          />
                          <label htmlFor="billing" className="text-sm cursor-pointer">
                            Billing Information
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="content"
                            checked={includeContent}
                            onCheckedChange={(checked) => setIncludeContent(checked as boolean)}
                          />
                          <label htmlFor="content" className="text-sm cursor-pointer">
                            User-Generated Content
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Reason (Optional)</Label>
                      <Textarea
                        placeholder="Why are you requesting this export?"
                        value={exportReason}
                        onChange={(e) => setExportReason(e.target.value)}
                        rows={3}
                      />
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Export will be available for 30 days after completion
                      </AlertDescription>
                    </Alert>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setExportDialogOpen(false)}
                      disabled={exportLoading}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleRequestExport} disabled={exportLoading}>
                      {exportLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Request Export
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {exportRequests && exportRequests.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exportRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell className="capitalize">{request.export_type}</TableCell>
                        <TableCell className="uppercase">{request.export_format}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>{formatFileSize(request.file_size_bytes)}</TableCell>
                        <TableCell>
                          {request.expires_at ? (
                            new Date(request.expires_at) > new Date() ? (
                              formatDate(request.expires_at)
                            ) : (
                              <span className="text-destructive">Expired</span>
                            )
                          ) : (
                            'N/A'
                          )}
                        </TableCell>
                        <TableCell>
                          {request.status === 'completed' &&
                            request.expires_at &&
                            new Date(request.expires_at) > new Date() && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownloadExport(request.id)}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No export requests yet. Click &quot;Request Export&quot; to create one.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Data Access Log Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Who Accessed Your Data</CardTitle>
                <CardDescription>
                  See who has accessed your personal data for transparency
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {accessLogs && accessLogs.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Accessed By</TableHead>
                      <TableHead>Access Type</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accessLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDate(log.created_at)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {log.accessed_by_user.full_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {log.accessed_by_user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getAccessTypeBadge(log.access_type)}</TableCell>
                        <TableCell className="capitalize">{log.resource_type}</TableCell>
                        <TableCell>{log.reason || 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No data access logs yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Account Deletion Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Delete Your Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data (GDPR Article 17)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">This action is permanent and cannot be undone</p>
                  <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                    <li>All your data will be permanently deleted</li>
                    <li>You will lose access to all organizations</li>
                    <li>Active subscriptions will be canceled</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>

            {deletionRequests && deletionRequests.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Confirmed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deletionRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.created_at)}</TableCell>
                        <TableCell className="capitalize">
                          {request.deletion_type.replace('_', ' ')}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          {request.confirmed_at ? formatDate(request.confirmed_at) : 'Pending'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="w-full">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Request Account Deletion
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-destructive">
                    Are you absolutely sure?
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account and
                    remove all your data from our servers.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Deletion Type</Label>
                    <Select
                      value={deletionType}
                      onValueChange={(value: 'account' | 'organization_data') => setDeletionType(value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account">Full Account Deletion</SelectItem>
                        <SelectItem value="organization_data">
                          Organization Data Only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {deletionType === 'organization_data' && (
                    <div className="space-y-2">
                      <Label>Organization ID</Label>
                      <Input
                        placeholder="Enter organization ID"
                        value={deleteOrgId}
                        onChange={(e) => setDeleteOrgId(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Reason (Required)</Label>
                    <Textarea
                      placeholder="Please tell us why you want to delete your data"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-3 border rounded-lg p-4">
                    <Label>Confirmation Checklist</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permanent"
                        checked={deleteChecklist.permanent}
                        onCheckedChange={(checked) =>
                          setDeleteChecklist({ ...deleteChecklist, permanent: checked as boolean })
                        }
                      />
                      <label htmlFor="permanent" className="text-sm cursor-pointer">
                        I understand this action is permanent
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="exported"
                        checked={deleteChecklist.exported}
                        onCheckedChange={(checked) =>
                          setDeleteChecklist({ ...deleteChecklist, exported: checked as boolean })
                        }
                      />
                      <label htmlFor="exported" className="text-sm cursor-pointer">
                        I have exported any data I need
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="alldata"
                        checked={deleteChecklist.allData}
                        onCheckedChange={(checked) =>
                          setDeleteChecklist({ ...deleteChecklist, allData: checked as boolean })
                        }
                      />
                      <label htmlFor="alldata" className="text-sm cursor-pointer">
                        I understand all my data will be deleted
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Type &quot;DELETE&quot; to confirm</Label>
                    <Input
                      placeholder="DELETE"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      After submission, you will receive a confirmation email. You must click the
                      link in the email to complete the deletion.
                    </AlertDescription>
                  </Alert>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDeleteDialogOpen(false)}
                    disabled={deleteLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleRequestDeletion}
                    disabled={deleteLoading || deleteConfirmText !== 'DELETE'}
                  >
                    {deleteLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Request Deletion
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Full Summary Dialog */}
      <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete Data Summary</DialogTitle>
            <DialogDescription>
              Full overview of all your data stored in our system
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify(fullSummary, null, 2)}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
