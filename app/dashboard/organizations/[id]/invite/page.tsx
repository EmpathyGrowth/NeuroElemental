'use client'

/**
 * Organization Invite Page
 * Invite new members to organization
 */

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Mail, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function InviteMemberPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [email, setEmail] = useState('')
  const [role, setRole] = useState<string>('member')
  const [sending, setSending] = useState(false)

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter an email address')
      return
    }

    setSending(true)

    try {
      const res = await fetch(`/api/organizations/${orgId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send invitation')
      }

      toast.success(`Invitation sent to ${email}`)

      // Reset form
      setEmail('')
      setRole('member')

      // Navigate back after a short delay
      setTimeout(() => {
        router.push(`/dashboard/organizations/${orgId}`)
      }, 1500)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send invitation')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
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
            Back to Organization
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invite Member</h1>
              <p className="text-muted-foreground">
                Send an invitation to join your organization
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/invite/bulk`)}
            >
              <Users className="h-4 w-4 mr-2" />
              Bulk Invite
            </Button>
          </div>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle>Member Invitation</CardTitle>
            <CardDescription>
              The invitee will receive an email with a link to join your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteMember} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="colleague@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter the email address of the person you'd like to invite
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Member</span>
                        <span className="text-xs text-muted-foreground">
                          Can view organization details and courses
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">Admin</span>
                        <span className="text-xs text-muted-foreground">
                          Can manage members and organization settings
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Choose the access level for this member
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={sending}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Invitation'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="text-base">About Invitations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <p>Invitations are valid for 7 days</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <p>The invitee will need to create an account if they don't have one</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <p>You can change member roles anytime from organization settings</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">•</span>
              <p>Admins can invite new members and manage existing ones</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
