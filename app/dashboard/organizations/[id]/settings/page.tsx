"use client";

/**
 * Organization Settings Page
 * Manage organization details and members (admin only)
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Crown,
  Mail,
  Save,
  Shield,
  Trash2,
  User,
  UserMinus,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
  credits: Record<string, number> | null;
  created_at: string;
}

interface Member {
  user_id: string;
  role: string;
  joined_at: string;
  user: {
    email: string;
    full_name: string | null;
  };
}

export default function OrganizationSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");

  useEffect(() => {
    fetchOrganizationData();
  }, [orgId]);

  const fetchOrganizationData = async () => {
    try {
      const orgRes = await fetch(`/api/organizations/${orgId}`);
      if (!orgRes.ok) throw new Error("Failed to fetch organization");
      const orgData = await orgRes.json();

      setOrganization(orgData.organization);
      setUserRole(orgData.userRole);
      setOrgName(orgData.organization.name);
      setOrgSlug(orgData.organization.slug);

      // Check if user is admin
      if (orgData.userRole !== "owner" && orgData.userRole !== "admin") {
        router.push(`/dashboard/organizations/${orgId}`);
        return;
      }

      const membersRes = await fetch(`/api/organizations/${orgId}/members`);
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrganization = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName, slug: orgSlug }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update organization");
      }

      toast.success("Success", {
        description: "Organization updated successfully",
      });

      fetchOrganizationData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update organization",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMemberRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/organizations/${orgId}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, role: newRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      toast.success("Success", {
        description: "Member role updated successfully",
      });

      fetchOrganizationData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update role",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const res = await fetch(
        `/api/organizations/${orgId}/members?user_id=${userId}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to remove member");
      }

      toast.success("Success", {
        description: "Member removed successfully",
      });

      fetchOrganizationData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to remove member",
      });
    }
  };

  const handleDeleteOrganization = async () => {
    try {
      const res = await fetch(`/api/organizations/${orgId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete organization");
      }

      toast.success("Success", {
        description: "Organization deleted successfully",
      });

      router.push("/dashboard/organizations");
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete organization",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "owner":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "admin":
        return <Shield className="h-4 w-4 text-blue-500" />;
      case "member":
        return <User className="h-4 w-4 text-gray-500" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "owner":
        return "default";
      case "admin":
        return "secondary";
      case "member":
        return "outline";
      default:
        return "outline";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">
              {error || "Organization not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              Organization Settings
            </h1>
            <p className="text-muted-foreground">Manage {organization.name}</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="danger">Danger Zone</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Update your organization's basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-slug">Slug</Label>
                  <Input
                    id="org-slug"
                    value={orgSlug}
                    onChange={(e) => setOrgSlug(e.target.value)}
                    placeholder="organization-slug"
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in URLs. Only lowercase letters, numbers, and hyphens.
                  </p>
                </div>

                <Button onClick={handleUpdateOrganization} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Member Management */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>Member Management</CardTitle>
                <CardDescription>
                  Manage roles and remove members from your organization
                </CardDescription>
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
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
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
                              {userRole === "owner" &&
                              member.role !== "owner" ? (
                                <Select
                                  value={member.role}
                                  onValueChange={(value) =>
                                    handleUpdateMemberRole(
                                      member.user_id,
                                      value
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="member">
                                      Member
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <div className="flex items-center gap-2">
                                  {getRoleIcon(member.role)}
                                  <Badge
                                    variant={getRoleBadgeVariant(member.role)}
                                  >
                                    {member.role}
                                  </Badge>
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {member.role !== "owner" && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <UserMinus className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>
                                        Remove Member
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to remove{" "}
                                        {member.user.full_name ||
                                          member.user.email}{" "}
                                        from this organization? This action
                                        cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleRemoveMember(member.user_id)
                                        }
                                      >
                                        Remove
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
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

          {/* Danger Zone */}
          <TabsContent value="danger">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible and destructive actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border border-destructive rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-destructive">
                        Delete Organization
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Once you delete an organization, there is no going back.
                        Please be certain.
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Delete Organization
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {organization.name}?
                            This action cannot be undone. All data associated
                            with this organization will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDeleteOrganization}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete Organization
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
