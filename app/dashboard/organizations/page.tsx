'use client'

/**
 * Organizations Listing Page
 * View all organizations user is a member of
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useAsync } from '@/hooks/use-async'
import {
  Building2,
  Plus,
  Users,
  Coins,
  ArrowRight,
  Crown,
  Shield,
  User,
} from 'lucide-react'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
  credits: Record<string, number> | null
  created_at: string
  member_count: number
}

export default function OrganizationsPage() {
  const router = useRouter()
  const { data: organizations, loading, error, execute } = useAsync<Organization[]>()

  useEffect(() => {
    fetchOrganizations()
  }, [])

  const fetchOrganizations = () => execute(async () => {
    const res = await fetch('/api/organizations')
    if (!res.ok) throw new Error('Failed to fetch organizations')
    const result = await res.json()
    return result.organizations || []
  })

  const getTotalCredits = (credits: Record<string, number> | null) => {
    if (!credits) return 0
    return Object.values(credits).reduce((sum, val) => sum + val, 0)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />
      case 'member':
        return <User className="h-4 w-4 text-gray-500" />
      default:
        return <User className="h-4 w-4" />
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

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
            <p className="text-muted-foreground">
              Manage your organizations and collaborate with teams
            </p>
          </div>
          <Button onClick={() => router.push('/dashboard/organizations/new')}>
            <Plus className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        </div>

        {/* Organizations Grid */}
        {error ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6 text-destructive">{error}</div>
            </CardContent>
          </Card>
        ) : (organizations?.length || 0) === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12 space-y-4">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Create your first organization to start collaborating with your team
                  </p>
                  <Button onClick={() => router.push('/dashboard/organizations/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(organizations || []).map((org) => (
              <Card
                key={org.id}
                className="hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/dashboard/organizations/${org.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xl">{org.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(org.role)}
                      <Badge variant={getRoleBadgeVariant(org.role)} className="text-xs">
                        {org.role}
                      </Badge>
                    </div>
                  </div>
                  <CardDescription className="font-mono text-xs">
                    {org.slug}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{org.member_count}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">
                          {getTotalCredits(org.credits)}
                        </div>
                        <div className="text-xs text-muted-foreground">Credits</div>
                      </div>
                    </div>
                  </div>

                  {/* View Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      router.push(`/dashboard/organizations/${org.id}`)
                    }}
                  >
                    View Dashboard
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
