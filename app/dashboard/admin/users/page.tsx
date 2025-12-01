"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import {
  BulkAction,
  Column,
  DataTable,
  DateCell,
  FilterConfig,
  RowActionItem,
  RowActionSeparator,
  RowActions,
  UserCell,
} from "@/components/ui/data-table";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  Award,
  Ban,
  Briefcase,
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  Mail,
  Shield,
  UserCog,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  instructorStatus: string | null;
  enrolledCourses: number;
  certificates: number;
  createdAt: string | null;
  lastActive: string | null;
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  instructors: number;
  pendingInstructors: number;
}

interface UsersData {
  users: User[];
  stats: Stats;
  total: number;
  page: number;
  limit: number;
}

const defaultData: UsersData = {
  users: [],
  stats: {
    totalUsers: 0,
    activeUsers: 0,
    instructors: 0,
    pendingInstructors: 0,
  },
  total: 0,
  page: 1,
  limit: 50,
};

const roleLabels: Record<
  string,
  { label: string; icon: typeof Shield; className: string }
> = {
  admin: {
    label: "Admin",
    icon: Shield,
    className: "bg-red-500/10 text-red-500",
  },
  instructor: {
    label: "Instructor",
    icon: Award,
    className: "bg-purple-500/10 text-purple-500",
  },
  student: {
    label: "Student",
    icon: Users,
    className: "bg-blue-500/10 text-blue-500",
  },
  business: {
    label: "Business",
    icon: Briefcase,
    className: "bg-green-500/10 text-green-500",
  },
  school: {
    label: "School",
    icon: Briefcase,
    className: "bg-cyan-500/10 text-cyan-500",
  },
  registered: {
    label: "Registered",
    icon: Users,
    className: "bg-gray-500/10 text-gray-500",
  },
};

const VALID_ROLES = [
  "registered",
  "student",
  "instructor",
  "business",
  "school",
  "admin",
] as const;

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const { data: usersData, loading, execute } = useAsync<UsersData>();

  // Dialog states
  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });
  const [roleDialog, setRoleDialog] = useState<{
    open: boolean;
    user: User | null;
    newRole: string;
  }>({
    open: false,
    user: null,
    newRole: "",
  });
  const [emailDialog, setEmailDialog] = useState<{
    open: boolean;
    user: User | null;
  }>({
    open: false,
    user: null,
  });
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();

  const data = usersData || defaultData;
  const users = data.users;
  const stats = data.stats;

  // Filter and paginate users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedUsers([]);
  }, [searchQuery, roleFilter]);

  // Fetch users
  const fetchUsers = useCallback(() => {
    execute(async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (roleFilter) params.set("role", roleFilter);

      const res = await fetch(
        `/api/dashboard/admin/users?${params.toString()}`
      );
      if (!res.ok) {
        logger.error(
          "Failed to fetch users:",
          new Error(`Status: ${res.status}`)
        );
        return defaultData;
      }
      const result = await res.json();
      if (result.error) {
        logger.error("Error fetching users:", new Error(result.error));
        return defaultData;
      }
      return result;
    });
  }, [execute, searchQuery, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // User actions
  const handleViewProfile = (user: User) => {
    setViewDialog({ open: true, user });
  };

  const handleOpenEdit = (user: User) => {
    setEditFormData({
      fullName: user.fullName,
      email: user.email,
    });
    setEditDialog({ open: true, user });
  };

  const handleSaveEdit = async () => {
    if (!editDialog.user) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/users/${editDialog.user.id}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            full_name: editFormData.fullName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      toast.success("User Updated", {
        description: `${editFormData.fullName}'s profile has been updated.`,
      });

      setEditDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      logger.error("Error updating user:", error as Error);
      toast.error("Failed to update user. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChangeRole = (user: User) => {
    setRoleDialog({ open: true, user, newRole: user.role });
  };

  const handleChangeRole = async () => {
    if (!roleDialog.user || !roleDialog.newRole) return;

    setSaving(true);
    try {
      const response = await fetch(
        `/api/admin/users/${roleDialog.user.id}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: roleDialog.newRole }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to change role");
      }

      toast.success("Role Changed", {
        description: `${roleDialog.user.fullName}'s role has been changed to ${roleDialog.newRole}.`,
      });

      setRoleDialog({ open: false, user: null, newRole: "" });
      fetchUsers();
    } catch (error) {
      logger.error("Error changing role:", error as Error);
      toast.error("Failed to change role. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = (user: User) => {
    setEmailDialog({ open: true, user });
  };

  const handleOpenMailClient = () => {
    if (emailDialog.user) {
      window.open(`mailto:${emailDialog.user.email}`, "_blank");
      setEmailDialog({ open: false, user: null });
    }
  };

  const handleApproveInstructor = (user: User) => {
    confirm({
      title: "Approve Instructor",
      description: `Are you sure you want to approve ${user.fullName} as an instructor? They will gain access to instructor features.`,
      confirmLabel: "Approve",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await fetch(`/api/admin/users/${user.id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              role: "instructor",
              instructor_status: "approved",
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to approve instructor");
          }

          toast.success("Instructor Approved", {
            description: `${user.fullName} has been approved as an instructor.`,
          });

          fetchUsers();
        } catch (error) {
          logger.error("Error approving instructor:", error as Error);
          toast.error("Failed to approve instructor. Please try again.");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleSuspendUser = (user: User) => {
    confirm({
      title: "Suspend User",
      description: `Are you sure you want to suspend ${user.fullName}? They will lose access to the platform and all their courses.`,
      confirmLabel: "Suspend",
      variant: "destructive",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await fetch(`/api/admin/users/${user.id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: "registered" }),
          });

          if (!response.ok) {
            throw new Error("Failed to suspend user");
          }

          toast.success("User Suspended", {
            description: `${user.fullName} has been suspended.`,
          });

          fetchUsers();
        } catch (error) {
          logger.error("Error suspending user:", error as Error);
          toast.error("Failed to suspend user. Please try again.");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  // Bulk actions
  const handleBulkChangeRole = async (users: User[], newRole: string) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        users.map((user) =>
          fetch(`/api/admin/users/${user.id}/role`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Updated ${successful} users, ${failed} failed`);
      } else {
        toast.success(`Updated ${successful} users to ${newRole}`);
      }

      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      logger.error("Error bulk changing roles:", error as Error);
      toast.error("Failed to update users");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkSuspend = async (users: User[]) => {
    await handleBulkChangeRole(users, "registered");
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData = selectedUsers.length > 0 ? selectedUsers : users;

      if (format === "csv") {
        const headers = [
          "Name",
          "Email",
          "Role",
          "Enrolled Courses",
          "Certificates",
          "Joined",
          "Last Active",
        ];
        const rows = exportData.map((user) => [
          user.fullName,
          user.email,
          user.role,
          user.enrolledCourses.toString(),
          user.certificates.toString(),
          user.createdAt ? formatDate(user.createdAt) : "",
          user.lastActive ? formatDate(user.lastActive) : "",
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} users to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting users:", error as Error);
      toast.error("Failed to export users. Please try again.");
    }
  };

  // Table columns
  const columns: Column<User>[] = [
    {
      id: "user",
      header: "User",
      cell: (user) => <UserCell name={user.fullName} email={user.email} />,
      sortable: true,
    },
    {
      id: "role",
      header: "Role",
      cell: (user) => {
        const roleConfig = roleLabels[user.role] || roleLabels.registered;
        const RoleIcon = roleConfig.icon;
        return (
          <div className="space-y-1">
            <Badge className={roleConfig.className}>
              <RoleIcon className="w-3 h-3 mr-1" />
              {roleConfig.label}
            </Badge>
            {user.instructorStatus === "pending" && (
              <Badge
                variant="secondary"
                className="block w-fit bg-orange-500/10 text-orange-500"
              >
                Pending Approval
              </Badge>
            )}
            {user.instructorStatus === "approved" && (
              <Badge
                variant="secondary"
                className="block w-fit bg-green-500/10 text-green-500"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "courses",
      header: "Courses",
      accessorKey: "enrolledCourses",
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "certificates",
      header: "Certs",
      accessorKey: "certificates",
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "joined",
      header: "Joined",
      cell: (user) =>
        user.createdAt ? (
          <DateCell date={user.createdAt} format="relative" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      sortable: true,
    },
    {
      id: "lastActive",
      header: "Last Active",
      cell: (user) =>
        user.lastActive ? (
          <DateCell date={user.lastActive} format="relative" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      sortable: true,
    },
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction<User>[] = [
    {
      id: "promote-student",
      label: "Promote to Student",
      icon: <UserPlus className="h-3 w-3" />,
      onAction: (users) => handleBulkChangeRole(users, "student"),
    },
    {
      id: "suspend",
      label: "Suspend",
      icon: <UserX className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkSuspend,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to suspend the selected users? They will lose access to the platform.",
    },
  ];

  // Filters configuration
  const filters: FilterConfig[] = [
    {
      id: "role",
      label: "Role",
      type: "select",
      placeholder: "All roles",
      options: VALID_ROLES.map((role) => ({
        label: roleLabels[role]?.label || role,
        value: role,
      })),
    },
  ];

  // Row actions renderer
  const renderRowActions = (user: User) => (
    <RowActions>
      <RowActionItem onClick={() => handleViewProfile(user)}>
        <Eye className="mr-2 h-4 w-4" />
        View Profile
      </RowActionItem>
      <RowActionItem onClick={() => handleOpenEdit(user)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit User
      </RowActionItem>
      <RowActionItem onClick={() => handleOpenChangeRole(user)}>
        <Shield className="mr-2 h-4 w-4" />
        Change Role
      </RowActionItem>
      <RowActionItem onClick={() => handleSendEmail(user)}>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </RowActionItem>
      {user.instructorStatus === "pending" && (
        <>
          <RowActionSeparator />
          <RowActionItem
            className="text-green-600"
            onClick={() => handleApproveInstructor(user)}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve Instructor
          </RowActionItem>
        </>
      )}
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleSuspendUser(user)}
      >
        <Ban className="mr-2 h-4 w-4" />
        Suspend User
      </RowActionItem>
    </RowActions>
  );

  // Invite user state
  const [inviteDialog, setInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    full_name: "",
    role: "student" as string,
  });
  const [inviting, setInviting] = useState(false);

  const handleInviteUser = async () => {
    if (!inviteData.email) {
      toast.error("Email is required");
      return;
    }

    setInviting(true);
    try {
      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inviteData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to invite user");
      }

      toast.success("Invitation Sent", {
        description: `An invitation has been sent to ${inviteData.email}`,
      });
      setInviteDialog(false);
      setInviteData({ email: "", full_name: "", role: "student" });
      fetchUsers();
    } catch (error) {
      logger.error("Error inviting user:", error as Error);
      toast.error((error as Error).message || "Failed to invite user");
    } finally {
      setInviting(false);
    }
  };

  return (
    <AdminPageShell>
      <div className="space-y-8">
        {/* Header */}
        <AdminPageHeader
          title="User Management"
          description="Manage user accounts, roles, and permissions"
          actions={
            <Button onClick={() => setInviteDialog(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          }
        />

        {/* Stats Cards */}
        <StatsCardGrid columns={4}>
          <StatsCard
            title="Total Users"
            value={stats.totalUsers}
            description="All time registrations"
            icon={<Users className="h-5 w-5" />}
            accent="blue"
            loading={loading && !usersData}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers}
            description="Active in last 7 days"
            icon={<CheckCircle className="h-5 w-5" />}
            accent="green"
            trend={
              stats.activeUsers > 0
                ? {
                    direction: "up",
                    value: `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`,
                    label: "active rate",
                  }
                : undefined
            }
            loading={loading && !usersData}
          />
          <StatsCard
            title="Instructors"
            value={stats.instructors}
            description="Certified instructors"
            icon={<Award className="h-5 w-5" />}
            accent="purple"
            loading={loading && !usersData}
          />
          <StatsCard
            title="Pending Approvals"
            value={stats.pendingInstructors}
            description="Instructor applications"
            icon={<UserCog className="h-5 w-5" />}
            accent="amber"
            trend={
              stats.pendingInstructors > 0
                ? {
                    direction: "neutral",
                    value: `${stats.pendingInstructors}`,
                    label: "awaiting review",
                  }
                : undefined
            }
            loading={loading && !usersData}
          />
        </StatsCardGrid>

        {/* Users Table with DataTable */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">All Users</h2>
            <p className="text-sm text-muted-foreground">
              {filteredUsers.length} users found
            </p>
          </div>
          <div className="p-6">
            <DataTable
              data={paginatedUsers}
              columns={columns}
              keyField="id"
              selectable
              selectedRows={selectedUsers}
              onSelectionChange={setSelectedUsers}
              bulkActions={bulkActions}
              searchable
              searchPlaceholder="Search by name or email..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              filterValues={{ role: roleFilter }}
              onFilterChange={(id, value) => {
                if (id === "role") setRoleFilter((value as string) || "");
              }}
              onClearFilters={() => setRoleFilter("")}
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredUsers.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              rowActions={renderRowActions}
              exportable
              onExport={handleExport}
              loading={loading && !usersData}
              emptyTitle="No users found"
              emptyDescription="Try adjusting your search or filters"
              striped
            />
          </div>
        </div>
      </div>

      {/* View Profile Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) =>
          setViewDialog({ open, user: open ? viewDialog.user : null })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>
              View user information and statistics
            </DialogDescription>
          </DialogHeader>
          {viewDialog.user && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Full Name</Label>
                  <p className="font-medium">{viewDialog.user.fullName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-mono text-sm">{viewDialog.user.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Role</Label>
                  <p className="capitalize">{viewDialog.user.role}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Instructor Status
                  </Label>
                  <p className="capitalize">
                    {viewDialog.user.instructorStatus || "N/A"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">
                    Enrolled Courses
                  </Label>
                  <p className="font-medium">
                    {viewDialog.user.enrolledCourses}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Certificates</Label>
                  <p className="font-medium">{viewDialog.user.certificates}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Joined</Label>
                  <p>
                    {viewDialog.user.createdAt
                      ? formatDate(viewDialog.user.createdAt)
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Last Active</Label>
                  <p>
                    {viewDialog.user.lastActive
                      ? formatDate(viewDialog.user.lastActive)
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, user: null })}
            >
              Close
            </Button>
            {viewDialog.user && (
              <Button
                onClick={() => {
                  setViewDialog({ open: false, user: null });
                  handleOpenEdit(viewDialog.user!);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit User
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, user: open ? editDialog.user : null })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user profile information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFullName">Full Name</Label>
              <Input
                id="editFullName"
                value={editFormData.fullName}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fullName: e.target.value })
                }
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="editEmail">Email</Label>
              <Input
                id="editEmail"
                value={editFormData.email}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Email cannot be changed from admin panel
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, user: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) =>
          setRoleDialog({
            open,
            user: open ? roleDialog.user : null,
            newRole: open ? roleDialog.newRole : "",
          })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {roleDialog.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newRole">New Role</Label>
              <Select
                value={roleDialog.newRole}
                onValueChange={(value) =>
                  setRoleDialog({ ...roleDialog, newRole: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Current role:{" "}
              <span className="font-medium capitalize">
                {roleDialog.user?.role}
              </span>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRoleDialog({ open: false, user: null, newRole: "" })
              }
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={saving || roleDialog.newRole === roleDialog.user?.role}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Change Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog
        open={emailDialog.open}
        onOpenChange={(open) =>
          setEmailDialog({ open, user: open ? emailDialog.user : null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>
              Contact {emailDialog.user?.fullName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Email Address</Label>
              <p className="font-mono">{emailDialog.user?.email}</p>
            </div>
            <p className="text-sm text-muted-foreground">
              This will open your default email client to compose an email to
              this user.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEmailDialog({ open: false, user: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleOpenMailClient}>
              <Mail className="w-4 h-4 mr-2" />
              Open Email Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invite User Dialog */}
      <Dialog open={inviteDialog} onOpenChange={setInviteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invite New User</DialogTitle>
            <DialogDescription>
              Send an invitation email to add a new user to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email Address *</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteData.email}
                onChange={(e) =>
                  setInviteData({ ...inviteData, email: e.target.value })
                }
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label htmlFor="inviteName">Full Name (optional)</Label>
              <Input
                id="inviteName"
                value={inviteData.full_name}
                onChange={(e) =>
                  setInviteData({ ...inviteData, full_name: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="inviteRole">Role</Label>
              <Select
                value={inviteData.role}
                onValueChange={(value) =>
                  setInviteData({ ...inviteData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {VALID_ROLES.map((role) => (
                    <SelectItem key={role} value={role} className="capitalize">
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setInviteDialog(false)}
              disabled={inviting}
            >
              Cancel
            </Button>
            <Button onClick={handleInviteUser} disabled={inviting}>
              {inviting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </AdminPageShell>
  );
}
