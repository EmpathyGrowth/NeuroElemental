"use client";

/**
 * Roles & Permissions Management Page
 * Manage custom roles and permissions for organization
 */

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  ArrowLeft,
  Crown,
  Edit,
  Eye,
  Plus,
  Shield,
  Trash2,
  User as UserIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Permission {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  is_dangerous: boolean;
}

interface Role {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color?: string;
  is_system: boolean;
  is_default: boolean;
  permissions: string[];
  member_count: number;
  created_at: string;
}

interface PermissionsByCategory {
  [category: string]: Permission[];
}

// Color presets for role badges
const COLOR_PRESETS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#22c55e" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Yellow", value: "#eab308" },
  { name: "Teal", value: "#14b8a6" },
];

export default function RolesPage() {
  const params = useParams();
  const router = useRouter();
  const orgId = params.id as string;

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<PermissionsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formColor, setFormColor] = useState(COLOR_PRESETS[0].value);
  const [formIsDefault, setFormIsDefault] = useState(false);
  const [formPermissions, setFormPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orgId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch roles
      const rolesRes = await fetch(`/api/organizations/${orgId}/roles`);
      if (!rolesRes.ok) throw new Error("Failed to fetch roles");
      const rolesData = await rolesRes.json();
      setRoles(rolesData.roles || []);

      // Fetch available permissions
      const permsRes = await fetch("/api/permissions");
      if (!permsRes.ok) throw new Error("Failed to fetch permissions");
      const permsData = await permsRes.json();
      setPermissions(permsData.permissions || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      toast.error("Error", {
        description: err instanceof Error ? err.message : "Failed to load data",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setFormName("");
    setFormDescription("");
    setFormColor(COLOR_PRESETS[0].value);
    setFormIsDefault(false);
    setFormPermissions([]);
    setCreateDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setFormName(role.name);
    setFormDescription(role.description || "");
    setFormColor(role.color || COLOR_PRESETS[0].value);
    setFormIsDefault(role.is_default);
    setFormPermissions(role.permissions);
    setEditDialogOpen(true);
  };

  const openViewDialog = (role: Role) => {
    setSelectedRole(role);
    setViewDialogOpen(true);
  };

  const openDeleteDialog = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleCreateRole = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/organizations/${orgId}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          description: formDescription,
          color: formColor,
          permissions: formPermissions,
          is_default: formIsDefault,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create role");
      }

      toast.success("Role created", {
        description: `${formName} has been created successfully.`,
      });

      setCreateDialogOpen(false);
      await fetchData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to create role",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      const res = await fetch(
        `/api/organizations/${orgId}/roles/${selectedRole.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            description: formDescription,
            color: formColor,
            permissions: formPermissions,
            is_default: formIsDefault,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update role");
      }

      toast.success("Role updated", {
        description: `${formName} has been updated successfully.`,
      });

      setEditDialogOpen(false);
      await fetchData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to update role",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      setSaving(true);

      const res = await fetch(
        `/api/organizations/${orgId}/roles/${selectedRole.id}`,
        {
          method: "DELETE",
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete role");
      }

      toast.success("Role deleted", {
        description: `${selectedRole.name} has been deleted.`,
      });

      setDeleteDialogOpen(false);
      await fetchData();
    } catch (err) {
      toast.error("Error", {
        description:
          err instanceof Error ? err.message : "Failed to delete role",
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (code: string) => {
    setFormPermissions((prev) =>
      prev.includes(code) ? prev.filter((p) => p !== code) : [...prev, code]
    );
  };

  const toggleCategoryPermissions = (category: string, checked: boolean) => {
    const categoryPerms = permissions[category]?.map((p) => p.code) || [];
    if (checked) {
      setFormPermissions((prev) => [...new Set([...prev, ...categoryPerms])]);
    } else {
      setFormPermissions((prev) =>
        prev.filter((p) => !categoryPerms.includes(p))
      );
    }
  };

  const getRoleIcon = (role: Role) => {
    if (role.name.toLowerCase().includes("owner")) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    } else if (role.name.toLowerCase().includes("admin")) {
      return <Shield className="h-4 w-4 text-blue-500" />;
    }
    return <UserIcon className="h-4 w-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/dashboard/organizations/${orgId}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                Roles & Permissions
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage custom roles and permissions for your organization
            </p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>

        {/* Roles Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id} className="relative">
              <div
                className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
                style={{ backgroundColor: role.color || "#6b7280" }}
              />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getRoleIcon(role)}
                      <CardTitle className="text-lg">{role.name}</CardTitle>
                    </div>
                    {role.description && (
                      <CardDescription className="text-sm">
                        {role.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  {role.is_system && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                  {role.is_default && (
                    <Badge variant="default" className="text-xs">
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Permissions</span>
                    <span className="font-semibold">
                      {role.permissions.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="font-semibold">{role.member_count}</span>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {role.is_system ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => openViewDialog(role)}
                      >
                        <Eye className="h-3 w-3 mr-2" />
                        View
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditDialog(role)}
                        >
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => openDeleteDialog(role)}
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Create Role Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Custom Role</DialogTitle>
              <DialogDescription>
                Create a new role with custom permissions for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Project Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe what this role can do..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formColor === preset.value
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setFormColor(preset.value)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_default"
                  checked={formIsDefault}
                  onCheckedChange={(checked) =>
                    setFormIsDefault(checked as boolean)
                  }
                />
                <Label
                  htmlFor="is_default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as default role for new members
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Permissions ({formPermissions.length})</Label>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(permissions).map(([category, perms]) => {
                    const categoryPerms = perms.map((p) => p.code);
                    const allSelected = categoryPerms.every((p) =>
                      formPermissions.includes(p)
                    );
                    const someSelected = categoryPerms.some((p) =>
                      formPermissions.includes(p)
                    );

                    return (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) =>
                                toggleCategoryPermissions(
                                  category,
                                  checked as boolean
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="capitalize font-semibold">
                              {category}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {perms.length}
                            </Badge>
                            {someSelected && !allSelected && (
                              <Badge variant="outline" className="text-xs">
                                Partial
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2 pl-6">
                            {perms.map((perm) => (
                              <div
                                key={perm.code}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={perm.code}
                                  checked={formPermissions.includes(perm.code)}
                                  onCheckedChange={() =>
                                    togglePermission(perm.code)
                                  }
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={perm.code}
                                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                                  >
                                    {perm.name}
                                    {perm.is_dangerous && (
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    )}
                                  </Label>
                                  {perm.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateRole} disabled={saving || !formName}>
                {saving ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Role</DialogTitle>
              <DialogDescription>
                Update role permissions and settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Role Name</Label>
                <Input
                  id="edit-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g., Project Manager"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Describe what this role can do..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex gap-2">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formColor === preset.value
                          ? "border-foreground"
                          : "border-transparent"
                      }`}
                      style={{ backgroundColor: preset.value }}
                      onClick={() => setFormColor(preset.value)}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="edit_is_default"
                  checked={formIsDefault}
                  onCheckedChange={(checked) =>
                    setFormIsDefault(checked as boolean)
                  }
                />
                <Label
                  htmlFor="edit_is_default"
                  className="text-sm font-normal cursor-pointer"
                >
                  Set as default role for new members
                </Label>
              </div>
              <div className="space-y-2">
                <Label>Permissions ({formPermissions.length})</Label>
                <Accordion type="multiple" className="w-full">
                  {Object.entries(permissions).map(([category, perms]) => {
                    const categoryPerms = perms.map((p) => p.code);
                    const allSelected = categoryPerms.every((p) =>
                      formPermissions.includes(p)
                    );
                    const someSelected = categoryPerms.some((p) =>
                      formPermissions.includes(p)
                    );

                    return (
                      <AccordionItem key={category} value={category}>
                        <AccordionTrigger>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={allSelected}
                              onCheckedChange={(checked) =>
                                toggleCategoryPermissions(
                                  category,
                                  checked as boolean
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className="capitalize font-semibold">
                              {category}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {perms.length}
                            </Badge>
                            {someSelected && !allSelected && (
                              <Badge variant="outline" className="text-xs">
                                Partial
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-3 pt-2 pl-6">
                            {perms.map((perm) => (
                              <div
                                key={perm.code}
                                className="flex items-start space-x-2"
                              >
                                <Checkbox
                                  id={`edit-${perm.code}`}
                                  checked={formPermissions.includes(perm.code)}
                                  onCheckedChange={() =>
                                    togglePermission(perm.code)
                                  }
                                />
                                <div className="flex-1">
                                  <Label
                                    htmlFor={`edit-${perm.code}`}
                                    className="flex items-center gap-2 text-sm font-normal cursor-pointer"
                                  >
                                    {perm.name}
                                    {perm.is_dangerous && (
                                      <AlertTriangle className="h-3 w-3 text-red-500" />
                                    )}
                                  </Label>
                                  {perm.description && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {perm.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdateRole} disabled={saving || !formName}>
                {saving ? "Updating..." : "Update Role"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View System Role Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>View System Role</DialogTitle>
              <DialogDescription>
                System roles cannot be edited or deleted
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-4 py-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Role Name
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedRole.name}
                  </p>
                </div>
                {selectedRole.description && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Description
                    </Label>
                    <p className="mt-1">{selectedRole.description}</p>
                  </div>
                )}
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Members with this role
                  </Label>
                  <p className="text-lg font-semibold mt-1">
                    {selectedRole.member_count}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">
                    Permissions ({selectedRole.permissions.length})
                  </Label>
                  <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {Object.entries(permissions).map(([category, perms]) => {
                      const categoryPerms = perms.filter((p) =>
                        selectedRole.permissions.includes(p.code)
                      );
                      if (categoryPerms.length === 0) return null;

                      return (
                        <div key={category} className="space-y-1">
                          <p className="text-sm font-semibold capitalize">
                            {category}
                          </p>
                          <div className="pl-4 space-y-1">
                            {categoryPerms.map((perm) => (
                              <div
                                key={perm.code}
                                className="flex items-center gap-2 text-sm"
                              >
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {perm.name}
                                {perm.is_dangerous && (
                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Role</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedRole && selectedRole.member_count > 0 ? (
                  <div className="space-y-2">
                    <p>
                      This role is currently assigned to{" "}
                      <strong>{selectedRole.member_count}</strong> member
                      {selectedRole.member_count !== 1 ? "s" : ""}.
                    </p>
                    <p className="text-destructive font-semibold">
                      You must reassign these members to another role before
                      deleting this role.
                    </p>
                  </div>
                ) : (
                  <p>
                    Are you sure you want to delete{" "}
                    <strong>{selectedRole?.name}</strong>? This action cannot be
                    undone.
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
              {selectedRole && selectedRole.member_count === 0 && (
                <AlertDialogAction
                  onClick={handleDeleteRole}
                  disabled={saving}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {saving ? "Deleting..." : "Delete Role"}
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
