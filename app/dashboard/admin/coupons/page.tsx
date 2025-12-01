"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  RowActions,
  RowActionSeparator,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  Calendar,
  CheckCircle2,
  Coins,
  DollarSign,
  Pencil,
  Percent,
  Plus,
  Power,
  PowerOff,
  Ticket,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  uses_count: number;
  applicable_to: string | null;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CouponStats {
  total: number;
  active: number;
}

interface CouponsData {
  coupons: Coupon[];
  stats: CouponStats;
}

const defaultData: CouponsData = {
  coupons: [],
  stats: {
    total: 0,
    active: 0,
  },
};

const discountTypeConfig: Record<
  string,
  { icon: typeof Percent; className: string }
> = {
  percentage: {
    icon: Percent,
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  fixed_amount: {
    icon: DollarSign,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  credits: {
    icon: Coins,
    className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  },
};

export default function AdminCouponsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedCoupons, setSelectedCoupons] = useState<Coupon[]>([]);
  const { data: couponsData, loading, execute } = useAsync<CouponsData>();
  const { confirm, dialogProps } = useConfirmDialog();
  const [saving, setSaving] = useState(false);

  const data = couponsData || defaultData;
  const coupons = data.coupons;
  const stats = data.stats;

  // Filter coupons
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        coupon.discount_type
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (coupon.applicable_to?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "active" && coupon.active) ||
        (statusFilter === "inactive" && !coupon.active);
      const matchesType = !typeFilter || coupon.discount_type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchQuery, statusFilter, typeFilter]);

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCoupons.slice(start, start + pageSize);
  }, [filteredCoupons, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCoupons([]);
  }, [searchQuery, statusFilter, typeFilter]);

  // Fetch coupons
  const fetchCoupons = useCallback(() => {
    execute(async () => {
      const [couponsRes, statsRes] = await Promise.all([
        fetch("/api/admin/coupons"),
        fetch("/api/admin/stats"),
      ]);

      if (!couponsRes.ok) {
        logger.error(
          "Failed to fetch coupons:",
          new Error(`Status: ${couponsRes.status}`)
        );
        return defaultData;
      }

      const couponsResult = await couponsRes.json();
      let statsData = { total: 0, active: 0 };

      if (statsRes.ok) {
        const statsResult = await statsRes.json();
        statsData = statsResult.coupons || { total: 0, active: 0 };
      }

      return {
        coupons: couponsResult.coupons || [],
        stats: statsData,
      };
    });
  }, [execute]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // Format helpers
  const formatDiscountValue = (type: string, value: number) => {
    if (type === "percentage") return `${value}%`;
    if (type === "fixed_amount") return `$${value}`;
    if (type === "credits") return `${value} credits`;
    return value.toString();
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  // Actions
  const handleToggleStatus = async (coupon: Coupon) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !coupon.active }),
      });

      if (!res.ok) throw new Error("Failed to update coupon status");

      toast.success(coupon.active ? "Coupon Deactivated" : "Coupon Activated", {
        description: `${coupon.code} has been ${coupon.active ? "deactivated" : "activated"}.`,
      });
      fetchCoupons();
    } catch (error) {
      logger.error("Error toggling coupon status", error as Error);
      toast.error("Failed to update coupon status");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (coupon: Coupon) => {
    confirm({
      title: "Delete Coupon",
      description: `Are you sure you want to delete the coupon "${coupon.code}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        setSaving(true);
        try {
          const res = await fetch(`/api/admin/coupons/${coupon.id}`, {
            method: "DELETE",
          });

          if (!res.ok) throw new Error("Failed to delete coupon");

          toast.success("Coupon Deleted", {
            description: `${coupon.code} has been removed.`,
          });
          fetchCoupons();
        } catch (error) {
          logger.error("Error deleting coupon", error as Error);
          toast.error("Failed to delete coupon");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleBulkActivate = async (coupons: Coupon[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        coupons.map((coupon) =>
          fetch(`/api/admin/coupons/${coupon.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: true }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Activated ${successful} coupons, ${failed} failed`);
      } else {
        toast.success(`Activated ${successful} coupons`);
      }

      setSelectedCoupons([]);
      fetchCoupons();
    } catch (error) {
      logger.error("Error bulk activating coupons:", error as Error);
      toast.error("Failed to activate coupons");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDeactivate = async (coupons: Coupon[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        coupons.map((coupon) =>
          fetch(`/api/admin/coupons/${coupon.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: false }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deactivated ${successful} coupons, ${failed} failed`);
      } else {
        toast.success(`Deactivated ${successful} coupons`);
      }

      setSelectedCoupons([]);
      fetchCoupons();
    } catch (error) {
      logger.error("Error bulk deactivating coupons:", error as Error);
      toast.error("Failed to deactivate coupons");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData = selectedCoupons.length > 0 ? selectedCoupons : coupons;

      if (format === "csv") {
        const headers = [
          "Code",
          "Type",
          "Value",
          "Uses",
          "Max Uses",
          "Status",
          "Expires",
          "Created",
        ];
        const rows = exportData.map((coupon) => [
          coupon.code,
          coupon.discount_type,
          coupon.discount_value.toString(),
          coupon.uses_count.toString(),
          coupon.max_uses?.toString() || "Unlimited",
          coupon.active ? "Active" : "Inactive",
          coupon.expires_at ? formatDate(coupon.expires_at) : "No expiration",
          formatDate(coupon.created_at),
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
        link.download = `coupons_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `coupons_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} coupons to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting coupons:", error as Error);
      toast.error("Failed to export coupons. Please try again.");
    }
  };

  // Table columns
  const columns: Column<Coupon>[] = [
    {
      id: "code",
      header: "Code",
      cell: (coupon) => (
        <span className="font-mono font-bold">{coupon.code}</span>
      ),
      sortable: true,
    },
    {
      id: "discount",
      header: "Discount",
      cell: (coupon) => {
        const config = discountTypeConfig[coupon.discount_type] || {
          icon: Percent,
          className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
        };
        const Icon = config.icon;
        return (
          <Badge className={`gap-1 ${config.className}`}>
            <Icon className="h-3 w-3" />
            {formatDiscountValue(coupon.discount_type, coupon.discount_value)}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      id: "usage",
      header: "Usage",
      cell: (coupon) => {
        const usagePercent = coupon.max_uses
          ? ((coupon.uses_count / coupon.max_uses) * 100).toFixed(0)
          : null;
        return (
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium">
              {coupon.uses_count}
              {coupon.max_uses ? ` / ${coupon.max_uses}` : ""}
            </span>
            {usagePercent && (
              <span className="text-xs text-muted-foreground">
                ({usagePercent}%)
              </span>
            )}
          </div>
        );
      },
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "applicable_to",
      header: "Applicable To",
      cell: (coupon) => (
        <Badge
          variant={coupon.applicable_to === "all" ? "default" : "secondary"}
        >
          {coupon.applicable_to || "all"}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "expires",
      header: "Expires",
      cell: (coupon) => {
        if (!coupon.expires_at) {
          return <span className="text-muted-foreground">No expiration</span>;
        }
        const expired = isExpired(coupon.expires_at);
        return (
          <div
            className={`flex items-center gap-1 text-sm ${expired ? "text-destructive" : ""}`}
          >
            <Calendar className="h-3 w-3" />
            <DateCell date={coupon.expires_at} format="date" />
            {expired && <span>(Expired)</span>}
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (coupon) =>
        coupon.active ? (
          <CheckCircle2 className="h-5 w-5 text-green-500 mx-auto" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500 mx-auto" />
        ),
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Coupon>[] = [
    {
      id: "activate",
      label: "Activate",
      icon: <Power className="h-3 w-3" />,
      onAction: handleBulkActivate,
    },
    {
      id: "deactivate",
      label: "Deactivate",
      icon: <PowerOff className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkDeactivate,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to deactivate the selected coupons?",
    },
  ];

  // Filters
  const filters: FilterConfig[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      placeholder: "All statuses",
      options: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
    },
    {
      id: "type",
      label: "Type",
      type: "select",
      placeholder: "All types",
      options: [
        { label: "Percentage", value: "percentage" },
        { label: "Fixed Amount", value: "fixed_amount" },
        { label: "Credits", value: "credits" },
      ],
    },
  ];

  // Row actions
  const renderRowActions = (coupon: Coupon) => (
    <RowActions>
      <RowActionItem
        onClick={() =>
          router.push(`/dashboard/admin/coupons/${coupon.id}/edit`)
        }
      >
        <Pencil className="mr-2 h-4 w-4" />
        Edit Coupon
      </RowActionItem>
      <RowActionItem
        onClick={() => handleToggleStatus(coupon)}
        disabled={saving}
      >
        {coupon.active ? (
          <>
            <PowerOff className="mr-2 h-4 w-4" />
            Deactivate
          </>
        ) : (
          <>
            <Power className="mr-2 h-4 w-4" />
            Activate
          </>
        )}
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(coupon)}
        disabled={saving}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  const activeRate =
    stats.total > 0 ? ((stats.active / stats.total) * 100).toFixed(0) : "0";

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Coupons</h1>
          <p className="text-muted-foreground">
            Manage promotional codes and discount coupons
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/admin/coupons/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={2}>
        <StatsCard
          title="Total Coupons"
          value={stats.total}
          description={`${stats.active} active coupons`}
          icon={<Ticket className="h-5 w-5" />}
          accent="purple"
          loading={loading && !couponsData}
        />
        <StatsCard
          title="Active Rate"
          value={`${activeRate}%`}
          description="Percentage of active coupons"
          icon={<TrendingUp className="h-5 w-5" />}
          accent="green"
          trend={
            stats.active > 0
              ? {
                  direction: "up",
                  value: `${stats.active}`,
                  label: "active",
                }
              : undefined
          }
          loading={loading && !couponsData}
        />
      </StatsCardGrid>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Coupons</CardTitle>
          <CardDescription>
            {filteredCoupons.length} coupons found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedCoupons}
            columns={columns}
            keyField="id"
            selectable
            selectedRows={selectedCoupons}
            onSelectionChange={setSelectedCoupons}
            bulkActions={bulkActions}
            searchable
            searchPlaceholder="Search by code, type, or applicability..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            filterValues={{ status: statusFilter, type: typeFilter }}
            onFilterChange={(id, value) => {
              if (id === "status") setStatusFilter((value as string) || "");
              if (id === "type") setTypeFilter((value as string) || "");
            }}
            onClearFilters={() => {
              setStatusFilter("");
              setTypeFilter("");
            }}
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredCoupons.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            rowActions={renderRowActions}
            exportable
            onExport={handleExport}
            loading={loading && !couponsData}
            emptyTitle="No coupons found"
            emptyDescription="Create your first coupon to get started"
            striped
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
