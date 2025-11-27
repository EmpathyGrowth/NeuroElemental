'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDate } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import {
  Building2,
  Users,
  UserPlus,
  Settings,
  Mail,
  MoreHorizontal,
  Loader2,
  Globe,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';

interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  subscription_status?: string;
  subscription_plan?: string;
  settings?: {
    allow_invites?: boolean;
    require_approval?: boolean;
    share_progress?: boolean;
  };
}

interface Member {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function OrganizationPage() {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<string>('member');
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviting, setInviting] = useState(false);
  const [_showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [_showDeleteDialog, _setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchOrganizationData();
  }, []);

  const fetchOrganizationData = async () => {
    try {
      const res = await fetch('/api/organizations');
      const data = await res.json();

      if (data.organizations && data.organizations.length > 0) {
        const org = data.organizations[0];
        setOrganization(org.organization);
        setUserRole(org.role);

        // Fetch members
        const membersRes = await fetch(`/api/organizations/${org.organization.id}/members`);
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error fetching organization:', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreating(true);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          website: formData.get('website'),
          industry: formData.get('industry'),
          size: formData.get('size'),
        }),
      });

      const data = await res.json();
      if (data.organization) {
        setOrganization(data.organization);
        setUserRole('owner');
        setShowCreateDialog(false);
        toast.success('Organization created successfully');
        fetchOrganizationData();
      } else {
        toast.error(data.error || 'Failed to create organization');
      }
    } catch (_error) {
      toast.error('Failed to create organization');
    } finally {
      setCreating(false);
    }
  };

  const handleInviteMember = async () => {
    if (!organization || !inviteEmail) return;

    setInviting(true);
    try {
      const res = await fetch(`/api/organizations/${organization.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      const data = await res.json();
      if (data.member) {
        setMembers([...members, data.member]);
        setInviteEmail('');
        toast.success('Member invited successfully');
      } else if (data.invitation) {
        setInviteEmail('');
        toast.success('Invitation sent successfully');
      } else {
        toast.error(data.error || 'Failed to invite member');
      }
    } catch (_error) {
      toast.error('Failed to invite member');
    } finally {
      setInviting(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!organization) return;

    try {
      const res = await fetch(`/api/organizations/${organization.id}/members`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          role: newRole,
        }),
      });

      const data = await res.json();
      if (data.member) {
        setMembers(members.map(m => m.user.id === userId ? { ...m, role: newRole as Member['role'] } : m));
        toast.success('Role updated successfully');
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (_error) {
      toast.error('Failed to update role');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!organization || !confirm('Are you sure you want to remove this member?')) return;

    try {
      const res = await fetch(`/api/organizations/${organization.id}/members?user_id=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setMembers(members.filter(m => m.user.id !== userId));
        toast.success('Member removed successfully');
      } else {
        toast.error(data.error || 'Failed to remove member');
      }
    } catch (_error) {
      toast.error('Failed to remove member');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!organization) return;

    setSavingSettings(true);
    const formData = new FormData(e.currentTarget);

    try {
      const settings = {
        allow_invites: formData.get('allow_invites') === 'on',
        require_approval: formData.get('require_approval') === 'on',
        share_progress: formData.get('share_progress') === 'on',
      };

      const res = await fetch(`/api/organizations/${organization.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          website: formData.get('website') || null,
          description: formData.get('description') || null,
          industry: formData.get('industry') || null,
          size: formData.get('size') || null,
          settings,
        }),
      });

      const data = await res.json();

      if (res.ok && data.organization) {
        setOrganization(data.organization);
        toast.success('Settings updated successfully');
      } else {
        toast.error(data.error || 'Failed to update settings');
      }
    } catch (error) {
      logger.error('Error updating settings:', error as Error);
      toast.error('Failed to update settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-red-500/10 text-red-500';
      case 'admin': return 'bg-amber-500/10 text-amber-500';
      default: return 'bg-blue-500/10 text-blue-500';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card className="glass-card">
          <CardHeader className="text-center">
            <Building2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Create Your Organization</CardTitle>
            <CardDescription>
              Set up your organization to manage team members and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Organization Name*</Label>
                  <Input id="name" name="name" required placeholder="Acme Corp" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input id="website" name="website" type="url" placeholder="https://example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select name="industry">
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size">Company Size</Label>
                  <Select name="size">
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10 employees</SelectItem>
                      <SelectItem value="11-50">11-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-500">201-500 employees</SelectItem>
                      <SelectItem value="500+">500+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Tell us about your organization..."
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Organization'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold mb-2">Organization Settings</h1>
          <p className="text-muted-foreground">
            Manage your organization and team members
          </p>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Organization Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">Organization Name</Label>
                  <p className="text-lg font-medium">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Slug</Label>
                  <p className="text-lg font-mono">{organization.slug}</p>
                </div>
                {organization.website && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Globe className="w-3 h-3" /> Website
                    </Label>
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-lg text-primary hover:underline">
                      {organization.website}
                    </a>
                  </div>
                )}
                {organization.industry && (
                  <div>
                    <Label className="text-muted-foreground">Industry</Label>
                    <p className="text-lg">{organization.industry}</p>
                  </div>
                )}
                {organization.size && (
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1">
                      <Users className="w-3 h-3" /> Company Size
                    </Label>
                    <p className="text-lg">{organization.size} employees</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Your Role</Label>
                  <Badge className={getRoleBadgeColor(userRole)}>
                    {userRole}
                  </Badge>
                </div>
              </div>
              {organization.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm mt-2">{organization.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="glass-premium border-primary/20">
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your organization's subscription plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Current Plan: {organization.subscription_plan || 'Free'}</p>
                  <p className="text-sm text-muted-foreground">
                    Status: {organization.subscription_status || 'Active'}
                  </p>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage your organization's team members
                  </CardDescription>
                </div>
                {(userRole === 'owner' || userRole === 'admin') && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Send an invitation to join your organization
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="invite-email">Email Address</Label>
                          <Input
                            id="invite-email"
                            type="email"
                            placeholder="colleague@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="invite-role">Role</Label>
                          <Select value={inviteRole} onValueChange={setInviteRole}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              {userRole === 'owner' && (
                                <SelectItem value="owner">Owner</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={handleInviteMember}
                          disabled={inviting || !inviteEmail}
                          className="w-full"
                        >
                          {inviting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Sending Invitation...
                            </>
                          ) : (
                            <>
                              <Mail className="mr-2 h-4 w-4" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.user.full_name || 'Unknown'}
                      </TableCell>
                      <TableCell>{member.user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(member.role)}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatDate(member.joined_at)}
                      </TableCell>
                      <TableCell>
                        {(userRole === 'owner' || userRole === 'admin') && member.user.id !== user?.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.user.id, 'member')}>
                                Make Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateRole(member.user.id, 'admin')}>
                                Make Admin
                              </DropdownMenuItem>
                              {userRole === 'owner' && (
                                <DropdownMenuItem onClick={() => handleUpdateRole(member.user.id, 'owner')}>
                                  Make Owner
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => handleRemoveMember(member.user.id)}
                              >
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Organization Settings
              </CardTitle>
              <CardDescription>
                Update your organization's information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org-name">Organization Name</Label>
                    <Input
                      id="org-name"
                      defaultValue={organization?.name}
                      name="name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-website">Website</Label>
                    <Input
                      id="org-website"
                      type="url"
                      defaultValue={organization?.website || ''}
                      name="website"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-description">Description</Label>
                  <Textarea
                    id="org-description"
                    defaultValue={organization?.description || ''}
                    name="description"
                    rows={3}
                    placeholder="Brief description of your organization"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org-industry">Industry</Label>
                    <Select name="industry" defaultValue={organization?.industry}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="org-size">Organization Size</Label>
                    <Select name="size" defaultValue={organization?.size}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Preferences</h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Allow member invitations</Label>
                      <div className="text-sm text-muted-foreground">
                        Members can invite new users to the organization
                      </div>
                    </div>
                    <Switch
                      name="allow_invites"
                      defaultChecked={organization?.settings?.allow_invites !== false}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Require approval for new members</Label>
                      <div className="text-sm text-muted-foreground">
                        Admin approval required before members can join
                      </div>
                    </div>
                    <Switch
                      name="require_approval"
                      defaultChecked={organization?.settings?.require_approval === true}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Share progress across organization</Label>
                      <div className="text-sm text-muted-foreground">
                        Members can view each other's course progress
                      </div>
                    </div>
                    <Switch
                      name="share_progress"
                      defaultChecked={organization?.settings?.share_progress === true}
                    />
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingSettings}>
                    {savingSettings ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}