'use client'

/**
 * Bulk Member Invitation Page
 * Invite multiple members to an organization at once
 */

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, UserPlus, CheckCircle2, XCircle, AlertCircle, Upload } from 'lucide-react'
import { toast } from 'sonner'

interface InviteResult {
  email: string
  status: 'success' | 'error' | 'duplicate'
  message: string
}

export default function BulkInvitePage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [emails, setEmails] = useState('')
  const [role, setRole] = useState<'admin' | 'member'>('member')
  const [sending, setSending] = useState(false)
  const [results, setResults] = useState<InviteResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const parseEmails = (text: string): string[] => {
    // Split by newlines, commas, or semicolons
    const emailList = text
      .split(/[\n,;]/)
      .map(email => email.trim())
      .filter(email => email.length > 0)

    // Remove duplicates
    return [...new Set(emailList)]
  }

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSendInvites = async () => {
    const emailList = parseEmails(emails)

    if (emailList.length === 0) {
      toast.error('No emails provided', {
        description: 'Please enter at least one email address',
      })
      return
    }

    // Validate all emails
    const invalidEmails = emailList.filter(email => !validateEmail(email))
    if (invalidEmails.length > 0) {
      toast.error('Invalid email addresses', {
        description: `${invalidEmails.length} email(s) are invalid. Please check and try again.`,
      })
      return
    }

    setSending(true)
    setShowResults(false)

    try {
      const res = await fetch(`/api/organizations/${orgId}/invite/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          role,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to send invitations')
      }

      const data = await res.json()
      setResults(data.results)
      setShowResults(true)

      const successCount = data.results.filter((r: InviteResult) => r.status === 'success').length
      const errorCount = data.results.filter((r: InviteResult) => r.status === 'error').length

      toast.success('Invitations sent', {
        description: `${successCount} invitation(s) sent successfully. ${errorCount} failed.`,
      })

      // Clear emails on success
      if (successCount > 0) {
        setEmails('')
      }
    } catch (err) {
      toast.error('Error', {
        description: err instanceof Error ? err.message : 'Failed to send invitations',
      })
    } finally {
      setSending(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setEmails(text)
    }
    reader.readAsText(file)
  }

  const emailList = parseEmails(emails)
  const validCount = emailList.filter(validateEmail).length
  const invalidCount = emailList.length - validCount

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'duplicate':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">Sent</Badge>
      case 'error':
        return <Badge variant="destructive">Failed</Badge>
      case 'duplicate':
        return <Badge variant="secondary">Duplicate</Badge>
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
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
          <h1 className="text-3xl font-bold tracking-tight">Bulk Invite Members</h1>
          <p className="text-muted-foreground">
            Invite multiple members to your organization at once
          </p>
        </div>

        {/* Invite Form */}
        <Card>
          <CardHeader>
            <CardTitle>Member Details</CardTitle>
            <CardDescription>
              Enter email addresses (one per line, or comma/semicolon separated)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="emails">Email Addresses</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    id="file-upload"
                    accept=".txt,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import from file
                  </Button>
                </div>
              </div>
              <Textarea
                id="emails"
                placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
                value={emails}
                onChange={(e) => setEmails(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
              {emailList.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {emailList.length} email(s) detected
                  </span>
                  {validCount > 0 && (
                    <span className="text-green-600">
                      {validCount} valid
                    </span>
                  )}
                  {invalidCount > 0 && (
                    <span className="text-red-600">
                      {invalidCount} invalid
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value: any) => setRole(value)}>
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                All invited members will be assigned the same role
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendInvites}
              disabled={sending || emailList.length === 0 || invalidCount > 0}
              size="lg"
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {sending ? 'Sending invitations...' : `Send ${emailList.length} invitation(s)`}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {showResults && results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Invitation Results</CardTitle>
              <CardDescription>
                Summary of sent invitations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {results.map((result, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(result.status)}
                      <div>
                        <div className="font-medium">{result.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {result.message}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(result.status)}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {results.filter(r => r.status === 'success').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">
                      {results.filter(r => r.status === 'error').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">
                      {results.filter(r => r.status === 'duplicate').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicates</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base text-blue-900 dark:text-blue-100">
                Bulk Invitation Tips
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
            <ul className="list-disc list-inside space-y-1">
              <li>Each email address should be on a new line or separated by commas/semicolons</li>
              <li>Invalid email addresses will be rejected before sending</li>
              <li>Duplicate invitations to existing members will be skipped</li>
              <li>You can import emails from a .txt or .csv file</li>
              <li>All invitations will expire in 7 days</li>
              <li>Invited members will receive an email with an invitation link</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
