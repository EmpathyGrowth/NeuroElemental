"use client";

/**
 * Admin Invitations Page
 * View and manage all organization invitations
 * Uses modern DataTable pattern with StatsCardGrid
 */

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Column,
  DataTable,
  DateCell,
  FilterConfig,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { CheckCircle2, Clock, Mail, XCircle } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface Invitation {
  id: string;
  organization_id: string;
  email: string;
  role: string;
  invited_by: string | null;
  expires_at: string;
  created_at: string;
  organization: {
    name: string;
    slug: string;
  };
  inviter: {
    email: string;
  } | null;
}

export default function AdminInvitationsPage() {
  const {
    data: invitations,
    loading,
    error,
    execute: executeInvitations,
  } = useAsync<Invitation[]>();

  // Search and filter state
  const [searchValue, setSearchValue] = useState("");
  const [filterValues, setFilterValues] = useState<
    Record<string, string | string[]>
  >({});

  // Sorting state
  const [sortColumn, setSortColumn] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = () =>
    executeInvitations(async () => {
      const res = await fetch("/api/admin/invitations");
      if (!res.ok) throw new Error("Failed to fetch invitations");
      const data = await res.json();
      return data.invitations;
    });

  // Check if invitation is expired
  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  // Get expiration status for display
  const getExpirationStatus = (expiresAt: string) => {
    const expired = isExpired(expiresAt);
    const expiresIn = Math.ceil(
      (new Date(expiresAt).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (expired) {
      return {
        label: "Expired",
        variant: "destructive" as const,
        icon: <XCircle className="h-3 w-3" />,
      };
    }

    if (expiresIn <= 1) {
      return {
        label: "Expires today",
        variant: "secondary" as const,
        icon: <Clock className="h-3 w-3" />,
      };
    }

    return {
      label: `${expiresIn}d left`,
      variant: "default" as const,
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  };

  // Get role badge variant
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

  // Calculate stats
  const activeInvitations = useMemo(
    () => invitations?.filter((inv) => !isExpired(inv.expires_at)) ?? [],
    [invitations]
  );

  const expiredInvitations = useMemo(
    () => invitations?.filter((inv) => isExpired(inv.expires_at)) ?? [],
    [invitations]
  );

  // Filter and search data
  const filteredData = useMemo(() => {
    const data = invitations ?? [];
    let result = [...data];

    // Apply search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.email.toLowerCase().includes(query) ||
          inv.organization.name.toLowerCase().includes(query) ||
          inv.organization.slug.toLowerCase().includes(query) ||
          (inv.inviter?.email.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply filters
    const statusFilter = filterValues["status"] as string;
    if (statusFilter === "active") {
      result = result.filter((inv) => !isExpired(inv.expires_at));
    } else if (statusFilter === "expired") {
      result = result.filter((inv) => isExpired(inv.expires_at));
    }

    const roleFilter = filterValues["role"] as string;
    if (roleFilter) {
      result = result.filter((inv) => inv.role === roleFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: unknown = a[sortColumn as keyof Invitation];
      let bVal: unknown = b[sortColumn as keyof Invitation];

      if (sortColumn === "organization") {
        aVal = a.organization.name;
        bVal = b.organization.name;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return result;
  }, [invitations, searchValue, filterValues, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Define columns for DataTable
  const columns: Column<Invitation>[] = useMemo(
    () => [
      {
        id: "email",
        header: "Email",
        sortable: true,
        cell: (invitation: Invitation) => (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{invitation.email}</span>
          </div>
        ),
      },
      {
        id: "organization",
        header: "Organization",
        sortable: true,
        cell: (invitation: Invitation) => (
          <div className="flex flex-col">
            <span className="font-medium">{invitation.organization.name}</span>
            <span className="text-xs text-muted-foreground">
              {invitation.organization.slug}
            </span>
          </div>
        ),
      },
      {
        id: "role",
        header: "Role",
        sortable: true,
        cell: (invitation: Invitation) => (
          <Badge variant={getRoleBadgeVariant(invitation.role)}>
            {invitation.role}
          </Badge>
        ),
      },
      {
        id: "inviter",
        header: "Invited By",
        cell: (invitation: Invitation) =>
          invitation.inviter ? (
            <span className="text-sm text-muted-foreground">
              {invitation.inviter.email}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              Unknown
            </span>
          ),
      },
      {
        id: "created_at",
        header: "Created",
        sortable: true,
        cell: (invitation: Invitation) => (
          <DateCell date={invitation.created_at} format="datetime" />
        ),
      },
      {
        id: "status",
        header: "Status",
        cell: (invitation: Invitation) => {
          const status = getExpirationStatus(invitation.expires_at);
          return (
            <div className="flex items-center gap-1">
              {status.icon}
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
          );
        },
      },
      {
        id: "expires_at",
        header: "Expires",
        sortable: true,
        cell: (invitation: Invitation) => (
          <span
            className={`text-sm ${
              isExpired(invitation.expires_at)
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            <DateCell date={invitation.expires_at} format="datetime" />
          </span>
        ),
      },
    ],
    []
  );

  // Filter configuration
  const filters: FilterConfig[] = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        type: "select",
        options: [
          { value: "active", label: "Active" },
          { value: "expired", label: "Expired" },
        ],
      },
      {
        id: "role",
        label: "Role",
        type: "select",
        options: [
          { value: "owner", label: "Owner" },
          { value: "admin", label: "Admin" },
          { value: "member", label: "Member" },
        ],
      },
    ],
    []
  );

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(1);
  }, []);

  const handleFilterChange = useCallback(
    (filterId: string, value: string | string[] | null) => {
      setFilterValues((prev) => {
        const newFilters = { ...prev };
        if (value === null) {
          delete newFilters[filterId];
        } else {
          newFilters[filterId] = value;
        }
        return newFilters;
      });
      setPage(1);
    },
    []
  );

  const handleClearFilters = useCallback(() => {
    setFilterValues({});
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (column: string, direction: "asc" | "desc") => {
      setSortColumn(column);
      setSortDirection(direction);
    },
    []
  );

  const handleExport = useCallback(
    (format: "csv" | "json") => {
      const dataToExport = filteredData.map((inv) => ({
        email: inv.email,
        organization: inv.organization.name,
        slug: inv.organization.slug,
        role: inv.role,
        invited_by: inv.inviter?.email || "",
        created_at: inv.created_at,
        expires_at: inv.expires_at,
      }));

      if (format === "json") {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invitations-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const headers = Object.keys(dataToExport[0] || {}).join(",");
        const rows = dataToExport
          .map((row) => Object.values(row).join(","))
          .join("\n");
        const csv = `${headers}\n${rows}`;
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invitations-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [filteredData]
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Invitations</h1>
        <p className="text-muted-foreground">
          View and manage all organization invitations
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={3}>
        <StatsCard
          title="Total Invitations"
          value={invitations?.length ?? 0}
          description="All-time invitations"
          icon={<Mail className="h-5 w-5" />}
          accent="purple"
        />
        <StatsCard
          title="Active Invitations"
          value={activeInvitations.length}
          description="Not yet expired"
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
          accent="green"
        />
        <StatsCard
          title="Expired Invitations"
          value={expiredInvitations.length}
          description="Past expiration date"
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          accent="red"
        />
      </StatsCardGrid>

      {/* Invitations DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>All Invitations</CardTitle>
          <CardDescription>
            {filteredData.length} invitations found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyTitle={error || "No invitations found"}
            emptyDescription={
              error ? "Please try again later" : "Invitations will appear here"
            }
            searchable
            searchPlaceholder="Search by email, organization, or inviter..."
            searchValue={searchValue}
            onSearchChange={handleSearchChange}
            filters={filters}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            totalItems={filteredData.length}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            exportable
            onExport={handleExport}
          />
        </CardContent>
      </Card>
    </div>
  );
}
