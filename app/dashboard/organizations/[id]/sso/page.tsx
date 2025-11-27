'use client'

/**
 * SSO Configuration Dashboard
 * Manage Single Sign-On settings for organization
 */

import { logger } from '@/lib/logging'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatDateTime } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import {
  Shield,
  Settings,
  Trash2,
  TestTube,
  Plus,
  X,
  Download,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SSOProvider {
  id: string
  organization_id: string
  provider_type: 'saml' | 'oauth' | 'oidc'
  provider_name: string
  domains: string[]
  enforce_sso: boolean
  auto_provision_users: boolean
  default_role: string
  is_active: boolean
  created_at: string
  updated_at: string

  // SAML fields
  saml_entity_id?: string
  saml_sso_url?: string
  saml_certificate?: string
  saml_sign_requests?: boolean

  // OAuth fields
  oauth_client_id?: string
  oauth_client_secret?: string
  oauth_authorize_url?: string
  oauth_token_url?: string
  oauth_userinfo_url?: string
  oauth_scopes?: string[]

  // Attribute mapping
  attribute_mapping: Record<string, string>
}

interface SSOAuthAttempt {
  id: string
  email: string
  status: 'success' | 'failed' | 'error'
  error_message?: string
  duration_ms?: number
  created_at: string
}

export default function SSOPage() {
  const params = useParams()
  const router = useRouter()
  const orgId = params.id as string

  const [provider, setProvider] = useState<SSOProvider | null>(null)
  const [attempts, setAttempts] = useState<SSOAuthAttempt[]>([])
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [loading, setLoading] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  // Pagination state
  const [page, setPage] = useState(0)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const pageSize = 10

  // Form state
  const [formData, setFormData] = useState({
    provider_type: 'saml' as 'saml' | 'oauth' | 'oidc',
    provider_name: '',
    domains: [] as string[],
    enforce_sso: false,
    auto_provision_users: true,
    default_role: 'member',

    // SAML
    saml_entity_id: '',
    saml_sso_url: '',
    saml_certificate: '',
    saml_sign_requests: false,

    // OAuth
    oauth_client_id: '',
    oauth_client_secret: '',
    oauth_authorize_url: '',
    oauth_token_url: '',
    oauth_userinfo_url: '',
    oauth_scopes: [] as string[],

    // Attribute mapping
    attribute_mapping: {
      email: 'email',
      first_name: 'firstName',
      last_name: 'lastName',
      user_id: 'nameID',
    } as Record<string, string>,
  })

  const [domainInput, setDomainInput] = useState('')
  const [scopeInput, setScopeInput] = useState('')

  useEffect(() => {
    fetchData()
  }, [orgId, page, statusFilter])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Fetch provider
      const providerRes = await fetch(`/api/organizations/${orgId}/sso`)
      if (providerRes.ok) {
        const data = await providerRes.json()
        setProvider(data.provider)
      }

      // Fetch attempts
      const offset = page * pageSize
      const statusParam = statusFilter !== 'all' ? `&status=${statusFilter}` : ''
      const attemptsRes = await fetch(
        `/api/organizations/${orgId}/sso/attempts?limit=${pageSize}&offset=${offset}${statusParam}`
      )
      if (attemptsRes.ok) {
        const data = await attemptsRes.json()
        setAttempts(data.attempts || [])
        setTotalAttempts(data.total || 0)
      }
    } catch (error) {
      logger.error('Error fetching SSO data', error instanceof Error ? error : undefined, { errorMsg: String(error) })
      toast.error('Error', {
        description: 'Failed to load SSO configuration',
      })
    } finally {
      setLoading(false)
    }
  }

  const openConfigDialog = (isEdit: boolean) => {
    if (isEdit && provider) {
      setFormData({
        provider_type: provider.provider_type,
        provider_name: provider.provider_name,
        domains: provider.domains,
        enforce_sso: provider.enforce_sso,
        auto_provision_users: provider.auto_provision_users,
        default_role: provider.default_role,
        saml_entity_id: provider.saml_entity_id || '',
        saml_sso_url: provider.saml_sso_url || '',
        saml_certificate: provider.saml_certificate === '***' ? '' : (provider.saml_certificate || ''),
        saml_sign_requests: provider.saml_sign_requests || false,
        oauth_client_id: provider.oauth_client_id || '',
        oauth_client_secret: provider.oauth_client_secret === '***' ? '' : (provider.oauth_client_secret || ''),
        oauth_authorize_url: provider.oauth_authorize_url || '',
        oauth_token_url: provider.oauth_token_url || '',
        oauth_userinfo_url: provider.oauth_userinfo_url || '',
        oauth_scopes: provider.oauth_scopes || [],
        attribute_mapping: provider.attribute_mapping || {
          email: 'email',
          first_name: 'firstName',
          last_name: 'lastName',
          user_id: 'nameID',
        },
      })
    } else {
      // Reset for new config
      setFormData({
        provider_type: 'saml',
        provider_name: '',
        domains: [],
        enforce_sso: false,
        auto_provision_users: true,
        default_role: 'member',
        saml_entity_id: '',
        saml_sso_url: '',
        saml_certificate: '',
        saml_sign_requests: false,
        oauth_client_id: '',
        oauth_client_secret: '',
        oauth_authorize_url: '',
        oauth_token_url: '',
        oauth_userinfo_url: '',
        oauth_scopes: ['openid', 'profile', 'email'],
        attribute_mapping: {
          email: 'email',
          first_name: 'firstName',
          last_name: 'lastName',
          user_id: 'nameID',
        },
      })
    }
    setConfigDialogOpen(true)
  }

  const handleSaveConfig = async () => {
    try {
      setSaving(true)

      const method = provider ? 'PATCH' : 'POST'
      const res = await fetch(`/api/organizations/${orgId}/sso`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save configuration')
      }

      toast.success('Success', {
        description: provider ? 'SSO configuration updated' : 'SSO configuration created',
      })

      setConfigDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to save configuration',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleTestConfig = async () => {
    try {
      setTesting(true)

      const res = await fetch(`/api/organizations/${orgId}/sso/test`, {
        method: 'POST',
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Configuration test failed')
      }

      toast.success('Success', {
        description: data.message || 'SSO configuration is valid',
      })
    } catch (error) {
      toast.error('Test Failed', {
        description: error instanceof Error ? error.message : 'Configuration test failed',
      })
    } finally {
      setTesting(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/sso`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to delete configuration')
      }

      toast.success('Success', {
        description: 'SSO configuration deleted',
      })

      setDeleteDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error('Error', {
        description: error instanceof Error ? error.message : 'Failed to delete configuration',
      })
    }
  }

  const handleDownloadMetadata = () => {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.neuroelemental.com'
    const metadataUrl = `${baseUrl}/api/sso/saml/metadata/${orgId}`
    window.open(metadataUrl, '_blank')
  }

  const addDomain = () => {
    if (domainInput.trim() && !formData.domains.includes(domainInput.trim())) {
      setFormData({
        ...formData,
        domains: [...formData.domains, domainInput.trim()],
      })
      setDomainInput('')
    }
  }

  const removeDomain = (domain: string) => {
    setFormData({
      ...formData,
      domains: formData.domains.filter(d => d !== domain),
    })
  }

  const addScope = () => {
    if (scopeInput.trim() && !formData.oauth_scopes.includes(scopeInput.trim())) {
      setFormData({
        ...formData,
        oauth_scopes: [...formData.oauth_scopes, scopeInput.trim()],
      })
      setScopeInput('')
    }
  }

  const removeScope = (scope: string) => {
    setFormData({
      ...formData,
      oauth_scopes: formData.oauth_scopes.filter(s => s !== scope),
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>
      case 'failed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'error':
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }


  if (loading && !provider) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Skeleton className="h-12 w-64 mb-6" />
        <Skeleton className="h-64" />
      </div>
    )
  }

  const totalPages = Math.ceil(totalAttempts / pageSize)

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">Single Sign-On (SSO)</h1>
            </div>
            <p className="text-muted-foreground">
              Configure enterprise SSO for your organization
            </p>
          </div>
        </div>

        {/* SSO Provider Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSO Provider Configuration
                </CardTitle>
                <CardDescription>
                  {provider ? 'Manage your SSO provider settings' : 'Configure SSO for your organization'}
                </CardDescription>
              </div>
              {provider && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestConfig}
                    disabled={testing}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testing ? 'Testing...' : 'Test Connection'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openConfigDialog(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Configuration
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {provider ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Provider Type</div>
                    <Badge className="mt-1">{provider.provider_type.toUpperCase()}</Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Provider Name</div>
                    <div className="text-sm font-semibold mt-1">{provider.provider_name}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Domains</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {provider.domains.map(domain => (
                        <Badge key={domain} variant="outline">{domain}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <Badge variant={provider.is_active ? 'default' : 'secondary'} className="mt-1">
                      {provider.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Enforce SSO</div>
                    <div className="text-sm mt-1">{provider.enforce_sso ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Auto-provision Users</div>
                    <div className="text-sm mt-1">{provider.auto_provision_users ? 'Yes' : 'No'}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Default Role</div>
                    <Badge variant="outline" className="mt-1">{provider.default_role}</Badge>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No SSO Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Configure Single Sign-On to allow users to authenticate with your corporate identity provider
                </p>
                <Button onClick={() => openConfigDialog(false)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Configure SSO
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* SAML Service Provider Details */}
        {provider && provider.provider_type === 'saml' && (
          <Card>
            <CardHeader>
              <CardTitle>Service Provider Details</CardTitle>
              <CardDescription>
                Provide these details to your SAML Identity Provider administrator
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Entity ID (SP)</Label>
                <Input
                  readOnly
                  value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.neuroelemental.com'}/api/sso/saml/sp/${orgId}`}
                  className="font-mono text-xs"
                />
              </div>
              <div>
                <Label>Assertion Consumer Service (ACS) URL</Label>
                <Input
                  readOnly
                  value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://app.neuroelemental.com'}/api/sso/saml/acs`}
                  className="font-mono text-xs"
                />
              </div>
              <Button variant="outline" onClick={handleDownloadMetadata}>
                <Download className="h-4 w-4 mr-2" />
                Download SP Metadata XML
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Authentication Attempts Log */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Authentication Attempts</CardTitle>
                <CardDescription>Recent SSO login attempts</CardDescription>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No authentication attempts yet
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        <TableHead>Error</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDateTime(attempt.created_at)}
                          </TableCell>
                          <TableCell className="font-mono text-sm">
                            {attempt.email}
                          </TableCell>
                          <TableCell>{getStatusBadge(attempt.status)}</TableCell>
                          <TableCell className="text-right text-sm">
                            {attempt.duration_ms ? `${attempt.duration_ms}ms` : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {attempt.error_message || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Showing {page * pageSize + 1} to {Math.min((page + 1) * pageSize, totalAttempts)} of {totalAttempts}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{provider ? 'Edit' : 'Configure'} SSO Provider</DialogTitle>
            <DialogDescription>
              Set up Single Sign-On authentication for your organization
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Provider Type */}
            <div className="space-y-2">
              <Label>Provider Type</Label>
              <Select
                value={formData.provider_type}
                onValueChange={(value) => setFormData({ ...formData, provider_type: value as 'saml' | 'oauth' | 'oidc' })}
                disabled={!!provider}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saml">SAML 2.0</SelectItem>
                  <SelectItem value="oauth">OAuth 2.0</SelectItem>
                  <SelectItem value="oidc">OpenID Connect (OIDC)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Provider Name */}
            <div className="space-y-2">
              <Label>Provider Name</Label>
              <Input
                placeholder="e.g., Okta, Azure AD, Google Workspace"
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
              />
            </div>

            {/* Domains */}
            <div className="space-y-2">
              <Label>Email Domains</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., company.com"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                />
                <Button type="button" onClick={addDomain}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.domains.map(domain => (
                  <Badge key={domain} variant="secondary">
                    {domain}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeDomain(domain)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* SAML Fields */}
            {formData.provider_type === 'saml' && (
              <>
                <div className="space-y-2">
                  <Label>IdP Entity ID</Label>
                  <Input
                    placeholder="https://idp.example.com/entityid"
                    value={formData.saml_entity_id}
                    onChange={(e) => setFormData({ ...formData, saml_entity_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IdP SSO URL</Label>
                  <Input
                    placeholder="https://idp.example.com/sso"
                    value={formData.saml_sso_url}
                    onChange={(e) => setFormData({ ...formData, saml_sso_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>IdP Certificate (PEM format)</Label>
                  <Textarea
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                    value={formData.saml_certificate}
                    onChange={(e) => setFormData({ ...formData, saml_certificate: e.target.value })}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sign_requests"
                    checked={formData.saml_sign_requests}
                    onCheckedChange={(checked) => setFormData({ ...formData, saml_sign_requests: !!checked })}
                  />
                  <Label htmlFor="sign_requests" className="cursor-pointer">Sign SAML requests</Label>
                </div>
              </>
            )}

            {/* OAuth/OIDC Fields */}
            {(formData.provider_type === 'oauth' || formData.provider_type === 'oidc') && (
              <>
                <div className="space-y-2">
                  <Label>Client ID</Label>
                  <Input
                    placeholder="your-client-id"
                    value={formData.oauth_client_id}
                    onChange={(e) => setFormData({ ...formData, oauth_client_id: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Client Secret</Label>
                  <Input
                    type="password"
                    placeholder="your-client-secret"
                    value={formData.oauth_client_secret}
                    onChange={(e) => setFormData({ ...formData, oauth_client_secret: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Authorize URL</Label>
                  <Input
                    placeholder="https://idp.example.com/oauth/authorize"
                    value={formData.oauth_authorize_url}
                    onChange={(e) => setFormData({ ...formData, oauth_authorize_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Token URL</Label>
                  <Input
                    placeholder="https://idp.example.com/oauth/token"
                    value={formData.oauth_token_url}
                    onChange={(e) => setFormData({ ...formData, oauth_token_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>UserInfo URL</Label>
                  <Input
                    placeholder="https://idp.example.com/oauth/userinfo"
                    value={formData.oauth_userinfo_url}
                    onChange={(e) => setFormData({ ...formData, oauth_userinfo_url: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., openid, profile, email"
                      value={scopeInput}
                      onChange={(e) => setScopeInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addScope())}
                    />
                    <Button type="button" onClick={addScope}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.oauth_scopes.map(scope => (
                      <Badge key={scope} variant="secondary">
                        {scope}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeScope(scope)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Attribute Mapping */}
            <div className="space-y-2">
              <Label>Attribute Mapping</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Email Attribute</Label>
                  <Input
                    placeholder="email"
                    value={formData.attribute_mapping.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      attribute_mapping: { ...formData.attribute_mapping, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-xs">First Name Attribute</Label>
                  <Input
                    placeholder="firstName"
                    value={formData.attribute_mapping.first_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      attribute_mapping: { ...formData.attribute_mapping, first_name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Last Name Attribute</Label>
                  <Input
                    placeholder="lastName"
                    value={formData.attribute_mapping.last_name}
                    onChange={(e) => setFormData({
                      ...formData,
                      attribute_mapping: { ...formData.attribute_mapping, last_name: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label className="text-xs">User ID Attribute</Label>
                  <Input
                    placeholder="nameID"
                    value={formData.attribute_mapping.user_id}
                    onChange={(e) => setFormData({
                      ...formData,
                      attribute_mapping: { ...formData.attribute_mapping, user_id: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enforce_sso"
                  checked={formData.enforce_sso}
                  onCheckedChange={(checked) => setFormData({ ...formData, enforce_sso: !!checked })}
                />
                <Label htmlFor="enforce_sso" className="cursor-pointer">
                  Enforce SSO (require SSO for all users in configured domains)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="auto_provision"
                  checked={formData.auto_provision_users}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_provision_users: !!checked })}
                />
                <Label htmlFor="auto_provision" className="cursor-pointer">
                  Auto-provision users (automatically create accounts for new users)
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Default Role for New Users</Label>
                <Select
                  value={formData.default_role}
                  onValueChange={(value) => setFormData({ ...formData, default_role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfigDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfig} disabled={saving}>
              {saving ? 'Saving...' : 'Save Configuration'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete your SSO configuration. Users will no longer be able to sign in with SSO.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
