'use client'

/**
 * Invitation Acceptance Page
 * Accept invitations to join organizations
 */

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Building2, CheckCircle2, XCircle, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'

/** Delay in ms before redirecting after accept/decline */
const REDIRECT_DELAY = 1500

interface InvitationDetails {
  id: string
  email: string
  role: string
  expires_at: string
  organization: {
    name: string
    slug: string
  }
  inviter: {
    email: string
    full_name: string | null
  } | null
}

export default function InvitationPage() {
  const params = useParams()
  const router = useRouter()
  const inviteId = params.id as string
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  const [invitation, setInvitation] = useState<InvitationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInvitation()
  }, [inviteId])

  const fetchInvitation = async () => {
    try {
      const res = await fetch(`/api/invitations/${inviteId}`)
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to fetch invitation')
      }
      const data = await res.json()
      setInvitation(data.invitation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async () => {
    setAccepting(true)

    try {
      const res = await fetch(`/api/invitations/${inviteId}/accept`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to accept invitation')
      }

      const data = await res.json()

      toast.success(`You've joined ${invitation?.organization.name}`)

      // Redirect to organization dashboard
      redirectTimeoutRef.current = setTimeout(() => {
        router.push(`/dashboard/organizations/${data.organizationId}`)
      }, REDIRECT_DELAY)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation')
      setAccepting(false)
    }
  }

  const handleDeclineInvitation = async () => {
    setDeclining(true)

    try {
      const res = await fetch(`/api/invitations/${inviteId}/decline`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to decline invitation')
      }

      toast.info('You have declined the invitation')

      redirectTimeoutRef.current = setTimeout(() => {
        router.push('/dashboard')
      }, REDIRECT_DELAY)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to decline invitation')
      setDeclining(false)
    }
  }

  const isExpired = () => {
    if (!invitation) return false
    return new Date(invitation.expires_at) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container max-w-2xl p-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container max-w-2xl p-6">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Invitation Not Found</CardTitle>
              </div>
              <CardDescription>
                {error || 'This invitation link is invalid or has been removed'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isExpired()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="container max-w-2xl p-6">
          <Card className="border-destructive">
            <CardHeader>
              <div className="flex items-center gap-2">
                <XCircle className="h-6 w-6 text-destructive" />
                <CardTitle>Invitation Expired</CardTitle>
              </div>
              <CardDescription>
                This invitation has expired. Please contact the organization administrator
                for a new invitation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3 mb-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{invitation.organization.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Invited as {invitation.role} by{' '}
                    {invitation.inviter?.full_name || invitation.inviter?.email || 'Unknown'}
                  </div>
                  <div className="text-xs text-destructive mt-2">
                    Expired on {formatDate(invitation.expires_at)}
                  </div>
                </div>

                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="container max-w-2xl p-6">
        <Card>
          <CardHeader>
            <CardTitle>Organization Invitation</CardTitle>
            <CardDescription>
              You've been invited to join an organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="p-6 border rounded-lg bg-muted/50 space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-6 w-6 text-primary mt-1" />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">
                    {invitation.organization.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {invitation.organization.slug}
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Invited by:</span>
                  <span className="font-medium">
                    {invitation.inviter?.full_name || invitation.inviter?.email || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Your role:</span>
                  <span className="font-medium capitalize">{invitation.role}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Invited email:</span>
                  <span className="font-medium flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {invitation.email}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Expires:</span>
                  <span className="font-medium">
                    {formatDate(invitation.expires_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Role Information */}
            <div className="p-4 border rounded-lg bg-blue-500/5">
              <h4 className="font-medium mb-2">As a {invitation.role}, you can:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {invitation.role === 'member' ? (
                  <>
                    <li>• View organization details and courses</li>
                    <li>• Access courses with organization credits</li>
                    <li>• Collaborate with other members</li>
                  </>
                ) : (
                  <>
                    <li>• Everything a member can do</li>
                    <li>• Invite and manage members</li>
                    <li>• Update organization settings</li>
                    <li>• Manage credits and subscriptions</li>
                  </>
                )}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleAcceptInvitation}
                disabled={accepting || declining}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {accepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
              <Button
                onClick={handleDeclineInvitation}
                disabled={accepting || declining}
                variant="outline"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {declining ? 'Declining...' : 'Decline'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
