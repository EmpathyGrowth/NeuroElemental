"use client";

import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Filter,
  Loader2,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";
import * as React from "react";
import { Button } from "./button";
import { Checkbox } from "./checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

// ============================================================================
// Types
// ============================================================================

export interface Column<T> {
  id: string;
  header: string | React.ReactNode;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => React.ReactNode;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  variant?: "default" | "destructive";
  onAction: (selectedRows: T[]) => void | Promise<void>;
  requireConfirm?: boolean;
  confirmMessage?: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: "select" | "multiselect" | "date" | "daterange";
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;

  // Selection
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;

  // Bulk actions
  bulkActions?: BulkAction<T>[];

  // Search
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;

  // Filters
  filters?: FilterConfig[];
  filterValues?: Record<string, string | string[]>;
  onFilterChange?: (filterId: string, value: string | string[] | null) => void;
  onClearFilters?: () => void;

  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (column: string, direction: "asc" | "desc") => void;

  // Pagination
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  // Row actions
  rowActions?: (row: T) => React.ReactNode;
  onRowClick?: (row: T) => void;

  // Export
  exportable?: boolean;
  onExport?: (format: "csv" | "json") => void;

  // Loading states
  loading?: boolean;

  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;

  // Styling
  className?: string;
  compact?: boolean;
  striped?: boolean;
  bordered?: boolean;
  wrapperClassName?: string;
}

// ============================================================================
// DataTable Component
// ============================================================================

export function DataTable<T extends object>({
  data,
  columns,
  keyField,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  bulkActions = [],
  searchable = false,
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  sortColumn,
  sortDirection,
  onSort,
  page = 1,
  pageSize = 10,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  rowActions,
  onRowClick,
  exportable = false,
  onExport,
  loading = false,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters",
  emptyAction,
  className,
  compact = false,
  striped = false,
  bordered = false,
  wrapperClassName,
}: DataTableProps<T>) {
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const [showFilters, setShowFilters] = React.useState(false);
  const [bulkActionLoading, setBulkActionLoading] = React.useState<
    string | null
  >(null);
  const searchTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Handle search with debounce
  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      onSearchChange?.(value);
    }, 300);
  };

  // Selection helpers
  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected =
    selectedRows.length > 0 && selectedRows.length < data.length;

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.([...data]);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedRows, row]);
    } else {
      onSelectionChange?.(
        selectedRows.filter((r) => r[keyField] !== row[keyField])
      );
    }
  };

  const isRowSelected = (row: T) => {
    return selectedRows.some((r) => r[keyField] === row[keyField]);
  };

  // Sorting helper
  const handleSort = (columnId: string) => {
    if (!onSort) return;

    if (sortColumn === columnId) {
      onSort(columnId, sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(columnId, "asc");
    }
  };

  // Bulk action handler
  const handleBulkAction = async (action: BulkAction<T>) => {
    if (action.requireConfirm) {
      const confirmed = window.confirm(
        action.confirmMessage ||
          `Are you sure you want to ${action.label.toLowerCase()} ${selectedRows.length} item(s)?`
      );
      if (!confirmed) return;
    }

    setBulkActionLoading(action.id);
    try {
      await action.onAction(selectedRows);
      onSelectionChange?.([]);
    } finally {
      setBulkActionLoading(null);
    }
  };

  // Pagination helpers
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 1;
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems || data.length);

  // Check if any filters are active
  const hasActiveFilters = Object.values(filterValues).some(
    (v) => v && (Array.isArray(v) ? v.length > 0 : v !== "")
  );

  // Render cell content
  const renderCell = (row: T, column: Column<T>) => {
    if (column.cell) {
      return column.cell(row);
    }
    if (column.accessorFn) {
      return column.accessorFn(row);
    }
    if (column.accessorKey) {
      return row[column.accessorKey] as React.ReactNode;
    }
    return null;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {/* Search */}
          {searchable && (
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={localSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9 pr-9"
              />
              {localSearch && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {/* Filter toggle */}
          {filters.length > 0 && (
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="ml-1 rounded-full bg-primary-foreground px-1.5 py-0.5 text-xs text-primary">
                  {
                    Object.values(filterValues).filter(
                      (v) => v && (Array.isArray(v) ? v.length > 0 : v !== "")
                    ).length
                  }
                </span>
              )}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Bulk actions */}
          {selectable && selectedRows.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-1.5">
              <span className="text-sm font-medium">
                {selectedRows.length} selected
              </span>
              <div className="h-4 w-px bg-border" />
              {bulkActions.map((action) => (
                <Button
                  key={action.id}
                  variant={
                    action.variant === "destructive" ? "destructive" : "ghost"
                  }
                  size="sm"
                  onClick={() => handleBulkAction(action)}
                  disabled={bulkActionLoading === action.id}
                >
                  {bulkActionLoading === action.id ? (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  ) : (
                    action.icon && <span className="mr-1">{action.icon}</span>
                  )}
                  {action.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectionChange?.([])}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Export */}
          {exportable && onExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onExport("csv")}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExport("json")}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-4">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filter.label}:
              </span>
              {filter.type === "select" && (
                <Select
                  value={(filterValues[filter.id] as string) || ""}
                  onValueChange={(value) =>
                    onFilterChange?.(filter.id, value || null)
                  }
                >
                  <SelectTrigger className="h-8 w-[150px]">
                    <SelectValue
                      placeholder={filter.placeholder || "Select..."}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          ))}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="ml-auto"
            >
              <X className="mr-1 h-3 w-3" />
              Clear all
            </Button>
          )}
        </div>
      )}

      {/* Table */}
      <div
        className={cn(
          "rounded-xl overflow-hidden",
          bordered && "border border-border",
          wrapperClassName
        )}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/30">
                {selectable && (
                  <th className="w-12 px-4 py-3">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th
                    key={column.id}
                    className={cn(
                      "px-4 text-left text-sm font-semibold text-foreground/80",
                      compact ? "py-2" : "py-3",
                      column.sortable &&
                        "cursor-pointer select-none hover:text-foreground",
                      column.headerClassName
                    )}
                    onClick={() => column.sortable && handleSort(column.id)}
                  >
                    <div className="flex items-center gap-2">
                      {column.header}
                      {column.sortable && (
                        <span className="text-muted-foreground/50">
                          {sortColumn === column.id ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && <th className="w-12 px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (rowActions ? 1 : 0)
                    }
                    className="py-12 text-center"
                  >
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (selectable ? 1 : 0) +
                      (rowActions ? 1 : 0)
                    }
                    className="py-12 text-center"
                  >
                    <div className="space-y-2">
                      <p className="text-lg font-medium">{emptyTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {emptyDescription}
                      </p>
                      {emptyAction && <div className="pt-2">{emptyAction}</div>}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => (
                  <tr
                    key={String(row[keyField])}
                    className={cn(
                      "border-b border-border/50 transition-colors",
                      striped && index % 2 === 1 && "bg-muted/30",
                      isRowSelected(row) && "bg-primary/5",
                      onRowClick && "cursor-pointer hover:bg-muted/50"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isRowSelected(row)}
                          onCheckedChange={(checked) =>
                            handleSelectRow(row, checked as boolean)
                          }
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.id}
                        className={cn(
                          "px-4",
                          compact ? "py-2" : "py-3",
                          column.className
                        )}
                      >
                        {renderCell(row, column)}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="px-4" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalItems !== undefined && totalItems > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              Showing {startItem} to {endItem} of {totalItems} results
            </span>
            {onPageSizeChange && (
              <>
                <span className="mx-2">|</span>
                <span>Rows per page:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => onPageSizeChange(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((size) => (
                      <SelectItem key={size} value={String(size)}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(totalPages)}
              disabled={page === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Row Actions Dropdown Helper
// ============================================================================

interface RowActionsProps {
  children: React.ReactNode;
}

export function RowActions({ children }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">{children}</DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DropdownMenuItem as RowActionItem,
  DropdownMenuSeparator as RowActionSeparator,
};

// ============================================================================
// Status Badge Helper
// ============================================================================

interface StatusBadgeProps {
  status: "active" | "inactive" | "pending" | "success" | "warning" | "error";
  label?: string;
  className?: string;
}

const statusStyles = {
  active: "bg-green-500/10 text-green-600 border-green-500/20",
  inactive: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  error: "bg-red-500/10 text-red-600 border-red-500/20",
};

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  pending: "Pending",
  success: "Success",
  warning: "Warning",
  error: "Error",
};

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        statusStyles[status],
        className
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", `bg-current`)} />
      {label || statusLabels[status]}
    </span>
  );
}

// ============================================================================
// Date Cell Helper
// ============================================================================

interface DateCellProps {
  date: string | Date;
  format?: "date" | "datetime" | "relative";
}

export function DateCell({ date, format = "date" }: DateCellProps) {
  const d = new Date(date);

  if (format === "relative") {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return <span className="text-muted-foreground">Today</span>;
    if (days === 1)
      return <span className="text-muted-foreground">Yesterday</span>;
    if (days < 7)
      return <span className="text-muted-foreground">{days} days ago</span>;
  }

  const options: Intl.DateTimeFormatOptions =
    format === "datetime"
      ? {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : { year: "numeric", month: "short", day: "numeric" };

  return (
    <span className="text-muted-foreground">
      {d.toLocaleDateString("en-US", options)}
    </span>
  );
}

// ============================================================================
// User Cell Helper
// ============================================================================

interface UserCellProps {
  name: string;
  email?: string;
  avatar?: string;
  fallback?: string;
}

export function UserCell({ name, email, avatar, fallback }: UserCellProps) {
  return (
    <div className="flex items-center gap-3">
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
          {fallback || name.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <div className="font-medium">{name}</div>
        {email && <div className="text-sm text-muted-foreground">{email}</div>}
      </div>
    </div>
  );
}
