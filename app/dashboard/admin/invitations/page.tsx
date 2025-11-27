'use client'

/**
 * Admin Invitations Page
 * View and manage all organization invitations
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { useAsync } from '@/hooks/use-async'
import { logger } from '@/lib/logging'
import { formatDateTime } from '@/lib/utils'
import { Calendar, CheckCircle2, Clock, Mail, XCircle } from 'lucide-react'
import { useEffect } from 'react'

interface Invitation {
  id: string
  organization_id: string
  email: string
  role: string
  invited_by: string | null
  expires_at: string
  created_at: string
  organization: {
    name: string
    slug: string
  }
  inviter: {
    email: string
  } | null
}

interface InvitationStats {
  activeInvites: number
}

export default function AdminInvitationsPage() {
  const { data: invitations, loading, error, execute: executeInvitations } = useAsync<Invitation[]>()
  const { execute: executeStats } = useAsync<InvitationStats>()

  useEffect(() => {
    fetchInvitations()
    fetchStats()
  }, [])

  const fetchInvitations = () => executeInvitations(async () => {
    const res = await fetch('/api/admin/invitations')
    if (!res.ok) throw new Error('Failed to fetch invitations')
    const data = await res.json()
    return data.invitations
  })

  const fetchStats = () => executeStats(async () => {
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      return { activeInvites: data.organizations.activeInvites }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error fetching stats', err as Error)
      return { activeInvites: 0 }
    }
  })


  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const getExpirationStatus = (expiresAt: string) => {
    const expired = isExpired(expiresAt)
    const expiresIn = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    )

    if (expired) {
      return {
        label: 'Expired',
        variant: 'destructive' as const,
        icon: <XCircle className="h-3 w-3" />,
      }
    }

    if (expiresIn <= 1) {
      return {
        label: `Expires today`,
        variant: 'secondary' as const,
        icon: <Clock className="h-3 w-3" />,
      }
    }

    return {
      label: `${expiresIn}d left`,
      variant: 'default' as const,
      icon: <CheckCircle2 className="h-3 w-3" />,
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'member':
        return 'outline'
      default:
        return 'outline'
    }
  }

  const activeInvitations = invitations?.filter((inv) => !isExpired(inv.expires_at)) ?? []
  const expiredInvitations = invitations?.filter((inv) => isExpired(inv.expires_at)) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          View and manage all organization invitations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invitations</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">All-time invitations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Invitations</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvitations?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Not yet expired</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Invitations</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredInvitations?.length ?? 0}</div>
            <p className="text-xs text-muted-foreground">Past expiration date</p>
          </CardContent>
        </Card>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
          <CardDescription>
            Complete list of organization invitations and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-6 text-destructive">{error}</div>
          ) : !invitations || invitations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No invitations found
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Organization</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Invited By</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expires</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((invitation) => {
                    const status = getExpirationStatus(invitation.expires_at)

                    return (
                      <TableRow key={invitation.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {invitation.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {invitation.organization.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {invitation.organization.slug}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(invitation.role)}>
                            {invitation.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {invitation.inviter ? (
                            <span className="text-sm text-muted-foreground">
                              {invitation.inviter.email}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground italic">
                              Unknown
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {formatDateTime(invitation.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {status.icon}
                            <Badge variant={status.variant}>{status.label}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-sm ${
                              isExpired(invitation.expires_at)
                                ? 'text-destructive'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {formatDateTime(invitation.expires_at)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
