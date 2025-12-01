"use client";

/**
 * Admin Credit Transactions Page
 * View all credit transactions across the platform
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
import { ArrowDownCircle, ArrowUpCircle, Clock, Coins } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

interface CreditTransaction {
  id: string;
  organization_id: string;
  credit_type: string;
  amount: number;
  transaction_type: "add" | "subtract" | "expire";
  user_id: string | null;
  payment_id: string | null;
  expires_at: string | null;
  created_at: string;
  metadata: Record<string, unknown> | null;
  organization: {
    name: string;
    slug: string;
  };
}

export default function AdminCreditsPage() {
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
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
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchTransactions = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/credits");
      if (!res.ok) throw new Error("Failed to fetch transactions");
      const data = await res.json();
      setTransactions(data.transactions);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load transactions";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data.credits);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load stats";
      setStatsError(message);
    }
  };

  // Calculate derived stats
  const creditsAdded = useMemo(
    () =>
      transactions
        .filter((t) => t.transaction_type === "add")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const creditsUsed = useMemo(
    () =>
      transactions
        .filter((t) => t.transaction_type === "subtract")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  const creditsExpired = useMemo(
    () =>
      transactions
        .filter((t) => t.transaction_type === "expire")
        .reduce((sum, t) => sum + t.amount, 0),
    [transactions]
  );

  // Transaction type badge variant
  const getTransactionBadgeVariant = (type: string) => {
    switch (type) {
      case "add":
        return "default";
      case "subtract":
        return "destructive";
      case "expire":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Transaction type icon
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "add":
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />;
      case "subtract":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />;
      case "expire":
        return <ArrowDownCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  // Filter and search data
  const filteredData = useMemo(() => {
    let result = [...transactions];

    // Apply search
    if (searchValue.trim()) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (t) =>
          t.organization.name.toLowerCase().includes(query) ||
          t.organization.slug.toLowerCase().includes(query) ||
          t.credit_type.toLowerCase().includes(query)
      );
    }

    // Apply filters
    const typeFilter = filterValues["transaction_type"] as string;
    if (typeFilter) {
      result = result.filter((t) => t.transaction_type === typeFilter);
    }

    const creditTypeFilter = filterValues["credit_type"] as string;
    if (creditTypeFilter) {
      result = result.filter((t) => t.credit_type === creditTypeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let aVal: unknown = a[sortColumn as keyof CreditTransaction];
      let bVal: unknown = b[sortColumn as keyof CreditTransaction];

      if (sortColumn === "organization") {
        aVal = a.organization.name;
        bVal = b.organization.name;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return result;
  }, [transactions, searchValue, filterValues, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Define columns for DataTable
  const columns: Column<CreditTransaction>[] = useMemo(
    () => [
      {
        id: "organization",
        header: "Organization",
        sortable: true,
        cell: (transaction: CreditTransaction) => (
          <div className="flex flex-col">
            <span className="font-medium">{transaction.organization.name}</span>
            <span className="text-xs text-muted-foreground">
              {transaction.organization.slug}
            </span>
          </div>
        ),
      },
      {
        id: "transaction_type",
        header: "Type",
        sortable: true,
        cell: (transaction: CreditTransaction) => (
          <div className="flex items-center gap-2">
            {getTransactionIcon(transaction.transaction_type)}
            <Badge
              variant={getTransactionBadgeVariant(transaction.transaction_type)}
            >
              {transaction.transaction_type}
            </Badge>
          </div>
        ),
      },
      {
        id: "credit_type",
        header: "Credit Type",
        sortable: true,
        cell: (transaction: CreditTransaction) => (
          <Badge variant="outline">{transaction.credit_type}</Badge>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        sortable: true,
        className: "text-right",
        cell: (transaction: CreditTransaction) => (
          <span
            className={`font-mono font-bold ${
              transaction.transaction_type === "add"
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {transaction.transaction_type === "add" ? "+" : "-"}
            {transaction.amount}
          </span>
        ),
      },
      {
        id: "payment_id",
        header: "Transaction",
        cell: (transaction: CreditTransaction) =>
          transaction.payment_id ? (
            <span className="text-xs font-mono text-muted-foreground">
              {transaction.payment_id.slice(0, 12)}...
            </span>
          ) : (
            <span className="text-xs text-muted-foreground italic">-</span>
          ),
      },
      {
        id: "created_at",
        header: "Date",
        sortable: true,
        cell: (transaction: CreditTransaction) => (
          <DateCell date={transaction.created_at} format="datetime" />
        ),
      },
      {
        id: "expires_at",
        header: "Expires",
        sortable: true,
        cell: (transaction: CreditTransaction) =>
          transaction.expires_at ? (
            <DateCell date={transaction.expires_at} format="date" />
          ) : (
            <span className="text-xs text-muted-foreground italic">Never</span>
          ),
      },
    ],
    []
  );

  // Filter configuration
  const filters: FilterConfig[] = useMemo(
    () => [
      {
        id: "transaction_type",
        label: "Type",
        type: "select",
        options: [
          { value: "add", label: "Added" },
          { value: "subtract", label: "Used" },
          { value: "expire", label: "Expired" },
        ],
      },
      {
        id: "credit_type",
        label: "Credit Type",
        type: "select",
        options: Array.from(
          new Set(transactions.map((t) => t.credit_type))
        ).map((type) => ({
          value: type,
          label: type,
        })),
      },
    ],
    [transactions]
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
      const dataToExport = filteredData.map((t) => ({
        organization: t.organization.name,
        slug: t.organization.slug,
        type: t.transaction_type,
        credit_type: t.credit_type,
        amount: t.amount,
        payment_id: t.payment_id || "",
        created_at: t.created_at,
        expires_at: t.expires_at || "",
      }));

      if (format === "json") {
        const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `credit-transactions-${new Date().toISOString().split("T")[0]}.json`;
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
        a.download = `credit-transactions-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    },
    [filteredData]
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Credit Transactions
        </h1>
        <p className="text-muted-foreground">
          View all credit transactions across all organizations
        </p>
      </div>

      {/* Stats Error */}
      {statsError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {statsError}
        </div>
      )}

      {/* Stats Cards */}
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Total Transactions"
          value={stats.totalTransactions}
          description="All-time credit transactions"
          icon={<Coins className="h-5 w-5" />}
          accent="blue"
        />
        <StatsCard
          title="Credits Added"
          value={creditsAdded.toLocaleString()}
          description="Total credits purchased"
          icon={<ArrowUpCircle className="h-5 w-5 text-green-500" />}
          accent="green"
        />
        <StatsCard
          title="Credits Used"
          value={creditsUsed.toLocaleString()}
          description="Total credits consumed"
          icon={<ArrowDownCircle className="h-5 w-5 text-red-500" />}
          accent="red"
        />
        <StatsCard
          title="Credits Expired"
          value={creditsExpired.toLocaleString()}
          description="Total credits expired"
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          accent="amber"
        />
      </StatsCardGrid>

      {/* Transactions DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
          <CardDescription>
            {filteredData.length} transactions found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedData}
            columns={columns}
            keyField="id"
            loading={loading}
            emptyTitle={error || "No transactions found"}
            emptyDescription={
              error
                ? "Please try again later"
                : "Credit transactions will appear here"
            }
            searchable
            searchPlaceholder="Search organizations..."
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
