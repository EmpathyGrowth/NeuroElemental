'use client'

/**
 * Organization Dashboard Page
 * View organization details, members, and credits
 */

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAsync } from '@/hooks/use-async'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Coins, Settings, UserPlus, Crown, Shield, User, Calendar, Mail, BarChart3, FileText, Activity, Key, Zap, ShieldCheck } from 'lucide-react'
import { OrganizationSwitcher } from '@/components/organizations/organization-switcher'

interface Organization {
  id: string
  name: string
  slug: string
  credits: Record<string, number> | null
  created_at: string
}

interface Member {
  user_id: string
  role: string
  joined_at: string
  user: {
    email: string
    full_name: string | null
  }
}

interface CreditTransaction {
  id: string
  credit_type: string
  amount: number
  transaction_type: 'add' | 'subtract' | 'expire'
  created_at: string
  metadata: Record<string, any> | null
}

export default function OrganizationPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  interface OrgData {
    organization: Organization;
    userRole: string;
    members: Member[];
    transactions: CreditTransaction[];
  }

  const { data, loading, error, execute } = useAsync<OrgData>()

  const organization = data?.organization || null
  const members = data?.members || []
  const transactions = data?.transactions || []
  const userRole = data?.userRole || ''

  useEffect(() => {
    fetchOrganizationData()
  }, [orgId])

  const fetchOrganizationData = () => execute(async () => {
    // Fetch organization details
    const orgRes = await fetch(`/api/organizations/${orgId}`)
    if (!orgRes.ok) throw new Error('Failed to fetch organization')
    const orgData = await orgRes.json()

    // Fetch members
    let membersData: Member[] = []
    const membersRes = await fetch(`/api/organizations/${orgId}/members`)
    if (membersRes.ok) {
      const membersResult = await membersRes.json()
      membersData = membersResult.members || []
    }

    // Fetch credit transactions
    let transactionsData: CreditTransaction[] = []
    const transactionsRes = await fetch(`/api/organizations/${orgId}/credits`)
    if (transactionsRes.ok) {
      const transactionsResult = await transactionsRes.json()
      transactionsData = transactionsResult.transactions || []
    }

    return {
      organization: orgData.organization,
      userRole: orgData.userRole,
      members: membersData,
      transactions: transactionsData,
    }
  })

  const getTotalCredits = (credits: Record<string, number> | null) => {
    if (!credits) return 0
    return Object.values(credits).reduce((sum: any, val: any) => sum + val, 0)
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

  const isAdmin = userRole === 'owner' || userRole === 'admin'

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">
              {error || 'Organization not found'}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">{organization.name}</h1>
            <p className="text-muted-foreground">
              Organization Dashboard · {userRole}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <OrganizationSwitcher currentOrgId={orgId} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/analytics`)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/reports`)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/dashboard/organizations/${orgId}/audit/exports`)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Audit & Export
            </Button>
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/api-keys`)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  API Keys
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/webhooks`)}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Webhooks
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/sso`)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  SSO
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/roles`)}
                >
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  Roles
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/settings`)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
              <p className="text-xs text-muted-foreground">
                Active organization members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <Coins className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {getTotalCredits(organization.credits)}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Available course credits
              </p>
              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/organizations/${orgId}/credits/purchase`)}
                  className="w-full"
                >
                  <Coins className="h-3 w-3 mr-2" />
                  Buy Credits
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Member Since</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDate(organization.created_at)}
              </div>
              <p className="text-xs text-muted-foreground">
                Organization created
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="credits">Credits</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Organization Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Information</CardTitle>
                  <CardDescription>
                    Basic details about your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Organization Name
                    </div>
                    <div className="text-lg font-semibold">{organization.name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Slug
                    </div>
                    <div className="text-lg font-mono">{organization.slug}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      Your Role
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleIcon(userRole)}
                      <Badge variant={getRoleBadgeVariant(userRole)}>
                        {userRole}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credits Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Credits Breakdown</CardTitle>
                  <CardDescription>
                    Available credits by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {organization.credits && Object.keys(organization.credits).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(organization.credits).map(([type, amount]) => (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Coins className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{type}</span>
                          </div>
                          <span className="text-lg font-bold">{amount}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No credits available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>
                      People who have access to this organization
                    </CardDescription>
                  </div>
                  {isAdmin && (
                    <Button
                      size="sm"
                      onClick={() =>
                        router.push(`/dashboard/organizations/${orgId}/invite`)
                      }
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {members.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No members found
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Member</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member: any) => (
                          <TableRow key={member.user_id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3 w-3 text-muted-foreground" />
                                <div>
                                  <div className="font-medium">
                                    {member.user.full_name || member.user.email}
                                  </div>
                                  {member.user.full_name && (
                                    <div className="text-xs text-muted-foreground">
                                      {member.user.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getRoleIcon(member.role)}
                                <Badge variant={getRoleBadgeVariant(member.role)}>
                                  {member.role}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(member.joined_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Credit History</CardTitle>
                    <CardDescription>
                      Recent credit transactions for this organization
                    </CardDescription>
                  </div>
                  {transactions.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/dashboard/organizations/${orgId}/credits/history`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Full History
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No transactions yet
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Credit Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transactions.slice(0, 10).map((transaction: any) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <Badge
                                variant={
                                  transaction.transaction_type === 'add'
                                    ? 'default'
                                    : 'destructive'
                                }
                              >
                                {transaction.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {transaction.credit_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={`font-mono font-bold ${
                                  transaction.transaction_type === 'add'
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }`}
                              >
                                {transaction.transaction_type === 'add' ? '+' : '-'}
                                {transaction.amount}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {transactions.length > 10 && (
                      <div className="text-center py-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/dashboard/organizations/${orgId}/credits/history`)}
                        >
                          View all {transactions.length} transactions
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
