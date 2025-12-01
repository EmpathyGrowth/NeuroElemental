'use client'

/**
 * Create Organization Page
 * Create a new organization
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Building2, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [creating, setCreating] = useState(false)

  const generateSlug = (orgName: string) => {
    return orgName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !slug) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      })
      return
    }

    setCreating(true)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create organization')
      }

      const data = await res.json()

      toast({
        title: 'Success',
        description: `${name} has been created`,
      })

      // Redirect to organization dashboard
      setTimeout(() => {
        router.push(`/dashboard/organizations/${data.organization.id}`)
      }, 1000)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create organization',
        variant: 'destructive',
      })
      setCreating(false)
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
            onClick={() => router.push('/dashboard/organizations')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Organizations
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Create Organization</h1>
          <p className="text-muted-foreground">
            Create a new organization to collaborate with your team
          </p>
        </div>

        {/* Create Form */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Details</CardTitle>
            <CardDescription>
              Basic information about your new organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Organization Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Acme Inc"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  The name of your organization as it will appear throughout the platform
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="acme-inc"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Used in URLs. Only lowercase letters, numbers, and hyphens. Must be unique.
                </p>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={creating}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  {creating ? 'Creating...' : 'Create Organization'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/organizations')}
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
            <CardTitle className="text-base">What happens next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-muted-foreground">1.</span>
              <p>You'll be set as the owner of the organization</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">2.</span>
              <p>You can invite team members to join your organization</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">3.</span>
              <p>Manage credits and access courses as a team</p>
            </div>
            <div className="flex gap-2">
              <span className="text-muted-foreground">4.</span>
              <p>Admins can manage members and organization settings</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
