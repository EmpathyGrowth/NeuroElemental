"use client";

/**
 * Admin Waitlist Page
 * View and export waitlist entries
 * Uses modern DataTable pattern with StatsCardGrid
 */

import { Badge } from "@/components/ui/badge";
import {
  Column,
  DataTable,
  DateCell,
  FilterConfig,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { Mail, TrendingUp, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  course_id: string | null;
  created_at: string;
}

export default function AdminWaitlistPage() {
  const {
    data: entries,
    loading,
    error,
    execute: fetchWaitlist,
  } = useAsync<WaitlistEntry[]>();
  const [stats, setStats] = useState({
    total: 0,
    recentWeek: 0,
  });

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
    loadWaitlist();
    fetchStats();
  }, []);

  const loadWaitlist = () =>
    fetchWaitlist(async () => {
      const res = await fetch("/api/waitlist");
      if (!res.ok) throw new Error("Failed to fetch waitlist");
      const data = await res.json();
      return data.entries;
    });

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data.waitlist);
    } catch (err) {
      const e = err instanceof Error ? err : new Error(String(err));
      logger.error("Error fetching stats", e);
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    const data = entries ?? [];
    let result = [...data];

    // Apply search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (e) =>
          e.email.toLowerCase().includes(query) ||
          (e.name?.toLowerCase().includes(query) ?? false) ||
          (e.course_id?.toLowerCase().includes(query) ?? false)
      );
    }

    // Apply filters
    const typeFilter = filterValues["course_type"] as string;
    if (typeFilter === "general") {
      result = result.filter((e) => !e.course_id);
    } else if (typeFilter === "course") {
      result = result.filter((e) => !!e.course_id);
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal: unknown = a[sortColumn as keyof WaitlistEntry];
      const bVal: unknown = b[sortColumn as keyof WaitlistEntry];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });

    return result;
  }, [entries, searchValue, filterValues, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Define columns for DataTable
  const columns: Column<WaitlistEntry>[] = useMemo(
    () => [
      {
        id: "email",
        header: "Email",
        sortable: true,
        cell: (entry: WaitlistEntry) => (
          <div className="flex items-center gap-2">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{entry.email}</span>
          </div>
        ),
      },
      {
        id: "name",
        header: "Name",
        sortable: true,
        cell: (entry: WaitlistEntry) =>
          entry.name ? (
            <span>{entry.name}</span>
          ) : (
            <span className="text-muted-foreground italic">Not provided</span>
          ),
      },
      {
        id: "course_id",
        header: "Course",
        sortable: true,
        cell: (entry: WaitlistEntry) =>
          entry.course_id ? (
            <Badge variant="outline">{entry.course_id.slice(0, 8)}</Badge>
          ) : (
            <Badge>General</Badge>
          ),
      },
      {
        id: "created_at",
        header: "Joined Date",
        sortable: true,
        cell: (entry: WaitlistEntry) => (
          <DateCell date={entry.created_at} format="date" />
        ),
      },
    ],
    []
  );

  // Filter configuration
  const filters: FilterConfig[] = useMemo(
    () => [
      {
        id: "course_type",
        label: "Type",
        type: "select",
        options: [
          { value: "general", label: "General" },
          { value: "course", label: "Course-specific" },
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
      const dataToExport = filteredData.map((e) => ({
        email: e.email,
        name: e.name || "",
        course_id: e.course_id || "",
        created_at: e.created_at,
      }));

      if (format === "json") {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `waitlist-${new Date().toISOString().split("T")[0]}.json`;
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
        a.download = `waitlist-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [filteredData]
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Waitlist
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage course waitlist signups
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={2}>
        <StatsCard
          title="Total Signups"
          value={stats.total}
          description="All-time waitlist signups"
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <StatsCard
          title="Recent Signups"
          value={stats.recentWeek}
          description="Last 7 days"
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          accent="green"
        />
      </StatsCardGrid>

      {/* Waitlist DataTable */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">All Entries</h2>
          <p className="text-sm text-muted-foreground">
            {filteredData.length} waitlist entries found
          </p>
        </div>
        <div className="p-6">
          <DataTable
            data={paginatedData}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyTitle={error || "No waitlist entries found"}
            emptyDescription={
              error
                ? "Please try again later"
                : "Waitlist entries will appear here"
            }
            searchable
            searchPlaceholder="Search by email, name, or course..."
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
        </div>
      </div>
    </div>
  );
}
