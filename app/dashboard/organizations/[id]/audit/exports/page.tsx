'use client'

/**
 * Audit Export Dashboard Page
 * Manage audit log exports and schedules
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Download,
  Trash2,
  Plus,
  FileText,
  Calendar,
  ChevronDown,
  ChevronRight,
  FileJson,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react'

interface ExportJob {
  id: string
  export_format: 'csv' | 'json' | 'xlsx'
  date_from: string
  date_to: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  total_records: number
  file_size_bytes?: number
  created_at: string
  error_message?: string
}

interface ExportSchedule {
  id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'monthly'
  day_of_week?: number
  day_of_month?: number
  time_of_day: string
  export_format: 'csv' | 'json' | 'xlsx'
  lookback_days: number
  is_active: boolean
  last_run_at?: string
  next_run_at?: string
  created_at: string
}

const ACTION_TYPES = [
  'member.invited',
  'member.joined',
  'member.removed',
  'member.role_changed',
  'credits.purchased',
  'credits.allocated',
  'credits.consumed',
  'organization.created',
  'organization.updated',
  'settings.updated',
]

const ENTITY_TYPES = [
  'organization',
  'member',
  'credits',
  'invitation',
  'settings',
  'api_key',
  'webhook',
]

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function AuditExportsPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [jobs, setJobs] = useState<ExportJob[]>([])
  const [schedules, setSchedules] = useState<ExportSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Create export dialog state
  const [createExportOpen, setCreateExportOpen] = useState(false)
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'xlsx'>('csv')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([])
  const [selectedEntityTypes, setSelectedEntityTypes] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  // Create schedule dialog state
  const [createScheduleOpen, setCreateScheduleOpen] = useState(false)
  const [scheduleName, setScheduleName] = useState('')
  const [scheduleDescription, setScheduleDescription] = useState('')
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState(0)
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState(1)
  const [scheduleTime, setScheduleTime] = useState('09:00')
  const [scheduleLookback, setScheduleLookback] = useState(30)
  const [scheduleFormat, setScheduleFormat] = useState<'csv' | 'json' | 'xlsx'>('csv')
  const [scheduleEmails, setScheduleEmails] = useState('')
  const [scheduleAdvancedFilters, setScheduleAdvancedFilters] = useState(false)
  const [scheduleEventTypes, setScheduleEventTypes] = useState<string[]>([])
  const [scheduleEntityTypes, setScheduleEntityTypes] = useState<string[]>([])
  const [creatingSchedule, setCreatingSchedule] = useState(false)

  useEffect(() => {
    fetchData()
    // Set default dates (last 30 days)
    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - 30)
    setDateTo(to.toISOString().split('T')[0])
    setDateFrom(from.toISOString().split('T')[0])
  }, [orgId])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch jobs
      const jobsUrl = new URL(`/api/organizations/${orgId}/audit/export`, window.location.origin)
      if (statusFilter !== 'all') {
        jobsUrl.searchParams.set('status', statusFilter)
      }

      const jobsRes = await fetch(jobsUrl.toString())
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData.jobs || [])
      }

      // Fetch schedules
      const schedulesRes = await fetch(`/api/organizations/${orgId}/audit/schedules`)
      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData.schedules || [])
      }
    } catch (_err) {
      toast.error('Failed to load export data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateExport = async () => {
    try {
      setCreating(true)

      // Validate dates
      const from = new Date(dateFrom)
      const to = new Date(dateTo)

      if (to < from) {
        toast.error('End date must be after start date')
        return
      }

      const daysDiff = (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)
      if (daysDiff > 365) {
        toast.error('Date range cannot exceed 1 year')
        return
      }

      const res = await fetch(`/api/organizations/${orgId}/audit/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          export_format: exportFormat,
          date_from: dateFrom,
          date_to: dateTo,
          event_types: selectedEventTypes.length > 0 ? selectedEventTypes : undefined,
          entity_types: selectedEntityTypes.length > 0 ? selectedEntityTypes : undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create export')
      }

      toast.success('Your export job has been queued for processing')

      setCreateExportOpen(false)
      resetExportForm()
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleCreateSchedule = async () => {
    try {
      setCreatingSchedule(true)

      if (!scheduleName.trim()) {
        toast.error('Schedule name is required')
        return
      }

      const res = await fetch(`/api/organizations/${orgId}/audit/schedules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: scheduleName,
          description: scheduleDescription || undefined,
          frequency: scheduleFrequency,
          day_of_week: scheduleFrequency === 'weekly' ? scheduleDayOfWeek : undefined,
          day_of_month: scheduleFrequency === 'monthly' ? scheduleDayOfMonth : undefined,
          time_of_day: scheduleTime,
          export_format: scheduleFormat,
          lookback_days: scheduleLookback,
          notify_emails: scheduleEmails ? scheduleEmails.split(',').map((e) => e.trim()) : undefined,
          event_types: scheduleEventTypes.length > 0 ? scheduleEventTypes : undefined,
          entity_types: scheduleEntityTypes.length > 0 ? scheduleEntityTypes : undefined,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to create schedule')
      }

      toast.success('Export schedule has been created successfully')

      setCreateScheduleOpen(false)
      resetScheduleForm()
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreatingSchedule(false)
    }
  }

  const handleDownload = async (jobId: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/audit/export/${jobId}/download`)

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to download export')
      }

      // Get filename from content-disposition header or use default
      const contentDisposition = res.headers.get('content-disposition')
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch ? filenameMatch[1] : 'audit-export.csv'

      // Download file
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Downloading ${filename}`)
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this export job?')) return

    try {
      const res = await fetch(`/api/organizations/${orgId}/audit/export/${jobId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete export job')
      }

      toast.success('Export job has been deleted')

      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleToggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/audit/schedules/${scheduleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      })

      if (!res.ok) {
        throw new Error('Failed to update schedule')
      }

      toast.success(`Schedule has been ${isActive ? 'paused' : 'activated'}`)

      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return

    try {
      const res = await fetch(`/api/organizations/${orgId}/audit/schedules/${scheduleId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete schedule')
      }

      toast.success('Export schedule has been deleted')

      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const resetExportForm = () => {
    setExportFormat('csv')
    setShowAdvancedFilters(false)
    setSelectedEventTypes([])
    setSelectedEntityTypes([])
  }

  const resetScheduleForm = () => {
    setScheduleName('')
    setScheduleDescription('')
    setScheduleFrequency('daily')
    setScheduleDayOfWeek(0)
    setScheduleDayOfMonth(1)
    setScheduleTime('09:00')
    setScheduleLookback(30)
    setScheduleFormat('csv')
    setScheduleEmails('')
    setScheduleAdvancedFilters(false)
    setScheduleEventTypes([])
    setScheduleEntityTypes([])
  }


  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-gray-50">Pending</Badge>
      case 'processing':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className="h-4 w-4" />
      case 'json':
        return <FileJson className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
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
              <h1 className="text-3xl font-bold tracking-tight">Audit Exports</h1>
              <p className="text-muted-foreground">
                Export and schedule audit log exports for compliance
              </p>
            </div>
          </div>
        </div>

        {/* Export Jobs Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export Jobs</CardTitle>
                <CardDescription>
                  Create and download audit log exports
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); fetchData(); }}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setCreateExportOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No export jobs found</p>
                <Button variant="link" onClick={() => setCreateExportOpen(true)} className="mt-2">
                  Create your first export
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created</TableHead>
                      <TableHead>Format</TableHead>
                      <TableHead>Date Range</TableHead>
                      <TableHead>Records</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDateTime(job.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getFormatIcon(job.export_format)}
                            <span className="uppercase text-xs font-mono">{job.export_format}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(job.date_from)} - {formatDate(job.date_to)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {job.total_records.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(job.file_size_bytes)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(job.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {job.status === 'completed' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(job.id)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                            {job.status === 'failed' && job.error_message && (
                              <span className="text-xs text-red-600" title={job.error_message}>
                                Error
                              </span>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteJob(job.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Schedules Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Export Schedules</CardTitle>
                <CardDescription>
                  Automate regular audit log exports
                </CardDescription>
              </div>
              <Button onClick={() => setCreateScheduleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Schedule
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {schedules.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No export schedules configured</p>
                <Button variant="link" onClick={() => setCreateScheduleOpen(true)} className="mt-2">
                  Create a schedule
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead>Next Run</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules.map((schedule) => (
                      <TableRow key={schedule.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{schedule.name}</div>
                            {schedule.description && (
                              <div className="text-xs text-muted-foreground">
                                {schedule.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="capitalize">{schedule.frequency}</div>
                            <div className="text-xs text-muted-foreground">
                              {schedule.frequency === 'weekly' && schedule.day_of_week !== undefined && (
                                <>on {DAY_NAMES[schedule.day_of_week]}</>
                              )}
                              {schedule.frequency === 'monthly' && schedule.day_of_month && (
                                <>on day {schedule.day_of_month}</>
                              )}
                              {' at '}{schedule.time_of_day.slice(0, 5)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {schedule.last_run_at ? formatDateTime(schedule.last_run_at) : 'Never'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {schedule.next_run_at ? formatDateTime(schedule.next_run_at) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={schedule.is_active}
                            onCheckedChange={() => handleToggleSchedule(schedule.id, schedule.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSchedule(schedule.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Export Dialog */}
        <Dialog open={createExportOpen} onOpenChange={setCreateExportOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Audit Export</DialogTitle>
              <DialogDescription>
                Export audit logs for a specific date range
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Export Format</Label>
                  <Select value={exportFormat} onValueChange={(val: any) => setExportFormat(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Maximum date range: 1 year (365 days)
              </div>

              <Separator />

              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="mb-2"
                >
                  {showAdvancedFilters ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  Advanced Filters
                </Button>

                {showAdvancedFilters && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <div className="space-y-2">
                      <Label>Event Types</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                        {ACTION_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`event-${type}`}
                              checked={selectedEventTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEventTypes([...selectedEventTypes, type])
                                } else {
                                  setSelectedEventTypes(selectedEventTypes.filter((t) => t !== type))
                                }
                              }}
                            />
                            <label
                              htmlFor={`event-${type}`}
                              className="text-xs cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entity Types</Label>
                      <div className="grid grid-cols-2 gap-2 p-2 border rounded">
                        {ENTITY_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`entity-${type}`}
                              checked={selectedEntityTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedEntityTypes([...selectedEntityTypes, type])
                                } else {
                                  setSelectedEntityTypes(selectedEntityTypes.filter((t) => t !== type))
                                }
                              }}
                            />
                            <label
                              htmlFor={`entity-${type}`}
                              className="text-xs cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateExportOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateExport} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Export
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Schedule Dialog */}
        <Dialog open={createScheduleOpen} onOpenChange={setCreateScheduleOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Export Schedule</DialogTitle>
              <DialogDescription>
                Schedule automatic audit log exports
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Schedule Name *</Label>
                <Input
                  placeholder="e.g., Monthly Compliance Export"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Optional description"
                  value={scheduleDescription}
                  onChange={(e) => setScheduleDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequency *</Label>
                  <Select value={scheduleFrequency} onValueChange={(val: any) => setScheduleFrequency(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time *</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              {scheduleFrequency === 'weekly' && (
                <div className="space-y-2">
                  <Label>Day of Week *</Label>
                  <Select value={String(scheduleDayOfWeek)} onValueChange={(val) => setScheduleDayOfWeek(parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAY_NAMES.map((day, idx) => (
                        <SelectItem key={idx} value={String(idx)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {scheduleFrequency === 'monthly' && (
                <div className="space-y-2">
                  <Label>Day of Month *</Label>
                  <Select value={String(scheduleDayOfMonth)} onValueChange={(val) => setScheduleDayOfMonth(parseInt(val))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                        <SelectItem key={day} value={String(day)}>{day}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Lookback Days *</Label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={scheduleLookback}
                    onChange={(e) => setScheduleLookback(parseInt(e.target.value))}
                  />
                  <div className="text-xs text-muted-foreground">
                    Export logs from the last N days
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Export Format *</Label>
                  <Select value={scheduleFormat} onValueChange={(val: any) => setScheduleFormat(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notify Emails</Label>
                <Input
                  placeholder="email1@example.com, email2@example.com"
                  value={scheduleEmails}
                  onChange={(e) => setScheduleEmails(e.target.value)}
                />
                <div className="text-xs text-muted-foreground">
                  Comma-separated email addresses to notify when export is ready
                </div>
              </div>

              <Separator />

              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setScheduleAdvancedFilters(!scheduleAdvancedFilters)}
                  className="mb-2"
                >
                  {scheduleAdvancedFilters ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  Advanced Filters
                </Button>

                {scheduleAdvancedFilters && (
                  <div className="space-y-4 pl-6 border-l-2">
                    <div className="space-y-2">
                      <Label>Event Types</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
                        {ACTION_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`schedule-event-${type}`}
                              checked={scheduleEventTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setScheduleEventTypes([...scheduleEventTypes, type])
                                } else {
                                  setScheduleEventTypes(scheduleEventTypes.filter((t) => t !== type))
                                }
                              }}
                            />
                            <label
                              htmlFor={`schedule-event-${type}`}
                              className="text-xs cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Entity Types</Label>
                      <div className="grid grid-cols-2 gap-2 p-2 border rounded">
                        {ENTITY_TYPES.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`schedule-entity-${type}`}
                              checked={scheduleEntityTypes.includes(type)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setScheduleEntityTypes([...scheduleEntityTypes, type])
                                } else {
                                  setScheduleEntityTypes(scheduleEntityTypes.filter((t) => t !== type))
                                }
                              }}
                            />
                            <label
                              htmlFor={`schedule-entity-${type}`}
                              className="text-xs cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateScheduleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSchedule} disabled={creatingSchedule}>
                {creatingSchedule && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Create Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
