'use client'

/**
 * Admin Waitlist Page
 * View and export waitlist entries
 */

import { useEffect, useState } from 'react'
import { formatDate, exportToCSVWithTimestamp } from '@/lib/utils'
import { useAsync } from '@/hooks/use-async'
import { logger } from '@/lib/logging'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Mail, Calendar, Download, Users } from 'lucide-react'

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  course_id: string | null
  created_at: string
}

export default function AdminWaitlistPage() {
  const { data: entries, loading, error, execute: fetchWaitlist } = useAsync<WaitlistEntry[]>()
  const [stats, setStats] = useState({
    total: 0,
    recentWeek: 0,
  })

  useEffect(() => {
    loadWaitlist()
    fetchStats()
  }, [])

  const loadWaitlist = () => fetchWaitlist(async () => {
    const res = await fetch('/api/waitlist')
    if (!res.ok) throw new Error('Failed to fetch waitlist')
    const data = await res.json()
    return data.entries
  })

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data.waitlist)
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error fetching stats', err as Error)
    }
  }

  const exportCSV = async () => {
    try {
      const res = await fetch('/api/waitlist')
      if (!res.ok) throw new Error('Failed to fetch data')
      const data = await res.json()

      exportToCSVWithTimestamp(data.entries, 'waitlist', [
        { key: 'email', label: 'Email' },
        { key: 'name', label: 'Name', format: (v) => v || '' },
        { key: 'course_id', label: 'Course ID', format: (v) => v || '' },
        { key: 'created_at', label: 'Created At' },
      ])
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Export failed', err as Error)
    }
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Waitlist</h1>
          <p className="text-muted-foreground">
            View and manage course waitlist signups
          </p>
        </div>
        <Button onClick={exportCSV} variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All-time waitlist signups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Signups</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentWeek}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Waitlist Entries</CardTitle>
          <CardDescription>
            All email addresses that have joined the waitlist
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-destructive">{error}</div>
          ) : !entries || entries.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No waitlist entries found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Joined Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries?.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {entry.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.name || (
                          <span className="text-muted-foreground italic">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {entry.course_id ? (
                          <Badge variant="outline">{entry.course_id.slice(0, 8)}</Badge>
                        ) : (
                          <Badge>General</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(entry.created_at)}
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
    </div>
  )
}
