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
  StatusBadge,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  Archive,
  BookOpen,
  Copy,
  DollarSign,
  Edit,
  Eye,
  Plus,
  Send,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

// Category color mapping for visual distinction
const categoryStyles: Record<string, string> = {
  "Energy Management": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Relationships: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  "Professional Development": "bg-blue-500/10 text-blue-600 border-blue-500/20",
  "Family & Relationships": "bg-rose-500/10 text-rose-600 border-rose-500/20",
  "Health & Wellness": "bg-green-500/10 text-green-600 border-green-500/20",
  Communication: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Leadership: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  Mindfulness: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  Productivity: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  "Self-Development": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  Uncategorized: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const getCategoryStyle = (category: string | null): string => {
  if (!category) return categoryStyles["Uncategorized"];
  return (
    categoryStyles[category] || "bg-primary/10 text-primary border-primary/20"
  );
};

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  difficulty_level: string;
  price_usd: number;
  is_published: boolean;
  students: number;
  created_at: string;
}

export default function AdminCoursesPage() {
  const router = useRouter();
  const { data: courses, loading, execute } = useAsync<Course[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const { confirm, dialogProps } = useConfirmDialog();

  const fetchCourses = useCallback(() => {
    execute(async () => {
      const response = await fetch("/api/courses");
      if (!response.ok) throw new Error("Failed to fetch courses");
      const result = await response.json();
      return result.courses || [];
    });
  }, [execute]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedCourses([]);
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleDelete = (course: Course) => {
    confirm({
      title: "Delete Course",
      description: `Are you sure you want to delete "${course.title}"? This will also delete all enrollments. This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/courses/${course.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Course deleted successfully");
            fetchCourses();
          } else {
            throw new Error("Failed to delete course");
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("Error deleting course:", err);
          toast.error("Failed to delete course. Please try again.");
        }
      },
    });
  };

  const handleDuplicate = async (course: Course) => {
    try {
      const response = await fetch(`/api/courses/${course.id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Course duplicated", {
          description: `Created "${result.data?.course?.title || "copy"}" with ${result.data?.modulesCount || 0} modules and ${result.data?.lessonsCount || 0} lessons`,
        });
        if (result.data?.course?.id) {
          router.push(`/dashboard/admin/courses/${result.data.course.id}/edit`);
        } else {
          fetchCourses();
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate course");
      }
    } catch (error) {
      logger.error("Error duplicating course:", error as Error);
      toast.error("Failed to duplicate course. Please try again.");
    }
  };

  const handleBulkPublish = async (courses: Course[]) => {
    try {
      const results = await Promise.allSettled(
        courses.map((course) =>
          fetch(`/api/courses/${course.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: true }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Published ${successful} courses, ${failed} failed`);
      } else {
        toast.success(`Published ${successful} courses`);
      }

      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      logger.error("Error bulk publishing:", error as Error);
      toast.error("Failed to publish courses");
    }
  };

  const handleBulkUnpublish = async (courses: Course[]) => {
    try {
      const results = await Promise.allSettled(
        courses.map((course) =>
          fetch(`/api/courses/${course.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: false }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`Unpublished ${successful} courses`);
      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      logger.error("Error bulk unpublishing:", error as Error);
      toast.error("Failed to unpublish courses");
    }
  };

  const handleBulkDelete = async (courses: Course[]) => {
    try {
      const results = await Promise.allSettled(
        courses.map((course) =>
          fetch(`/api/courses/${course.id}`, { method: "DELETE" })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deleted ${successful} courses, ${failed} failed`);
      } else {
        toast.success(`Deleted ${successful} courses`);
      }

      setSelectedCourses([]);
      fetchCourses();
    } catch (error) {
      logger.error("Error bulk deleting:", error as Error);
      toast.error("Failed to delete courses");
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData =
        selectedCourses.length > 0 ? selectedCourses : courses || [];

      if (format === "csv") {
        const headers = [
          "Title",
          "Category",
          "Price",
          "Students",
          "Status",
          "Created",
        ];
        const rows = exportData.map((course) => [
          course.title,
          course.category || "Uncategorized",
          `$${course.price_usd || 0}`,
          (course.students || 0).toString(),
          course.is_published ? "Published" : "Draft",
          formatDate(course.created_at),
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
        link.download = `courses_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `courses_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} courses to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting courses:", error as Error);
      toast.error("Failed to export courses");
    }
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(
      (courses || []).map((c) => c.category || "Uncategorized")
    );
    return Array.from(cats).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(
    () =>
      (courses || []).filter((course) => {
        const matchesSearch =
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (course.category || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
          !categoryFilter ||
          (course.category || "Uncategorized") === categoryFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "published" && course.is_published) ||
          (statusFilter === "draft" && !course.is_published);
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [courses, searchQuery, categoryFilter, statusFilter]
  );

  const paginatedCourses = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, currentPage, pageSize]);

  // Stats calculations
  const stats = useMemo(
    () => ({
      totalCourses: courses?.length || 0,
      publishedCourses: (courses || []).filter((c) => c.is_published).length,
      totalStudents: (courses || []).reduce(
        (sum, course) => sum + (course.students || 0),
        0
      ),
      totalRevenue: (courses || []).reduce(
        (sum, course) => sum + (course.price_usd || 0) * (course.students || 0),
        0
      ),
      avgPrice:
        (courses || []).length > 0
          ? (courses || []).reduce((sum, c) => sum + (c.price_usd || 0), 0) /
            (courses?.length || 1)
          : 0,
    }),
    [courses]
  );

  // Table columns
  const columns: Column<Course>[] = [
    {
      id: "course",
      header: "Course",
      cell: (course) => (
        <div>
          <div className="font-medium">{course.title}</div>
          <div className="text-sm text-muted-foreground">
            /courses/{course.slug}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      cell: (course) => (
        <Badge className={getCategoryStyle(course.category)}>
          {course.category || "Uncategorized"}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      cell: (course) => (
        <span className="font-medium">${course.price_usd || 0}</span>
      ),
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      id: "students",
      header: "Students",
      cell: (course) => (course.students || 0).toLocaleString(),
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "status",
      header: "Status",
      cell: (course) =>
        course.is_published ? (
          <StatusBadge status="active" label="Published" />
        ) : (
          <StatusBadge status="inactive" label="Draft" />
        ),
      sortable: true,
    },
    {
      id: "created",
      header: "Created",
      cell: (course) => <DateCell date={course.created_at} />,
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Course>[] = [
    {
      id: "publish",
      label: "Publish",
      icon: <Send className="h-3 w-3" />,
      onAction: handleBulkPublish,
    },
    {
      id: "unpublish",
      label: "Unpublish",
      icon: <Archive className="h-3 w-3" />,
      onAction: handleBulkUnpublish,
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkDelete,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to delete the selected courses? This will also delete all enrollments.",
    },
  ];

  // Filters
  const filters: FilterConfig[] = [
    {
      id: "category",
      label: "Category",
      type: "select",
      placeholder: "All categories",
      options: categories.map((cat) => ({ label: cat, value: cat })),
    },
    {
      id: "status",
      label: "Status",
      type: "select",
      placeholder: "All status",
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ],
    },
  ];

  // Row actions renderer
  const renderRowActions = (course: Course) => (
    <RowActions>
      <RowActionItem asChild>
        <Link href={`/courses/${course.slug}`} target="_blank">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Link>
      </RowActionItem>
      <RowActionItem asChild>
        <Link href={`/dashboard/admin/courses/${course.id}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Course
        </Link>
      </RowActionItem>
      <RowActionItem onClick={() => handleDuplicate(course)}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(course)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  return (
    <AdminPageShell>
      <div className="space-y-8">
        {/* Header with Breadcrumbs */}
        <AdminPageHeader
          title="Course Management"
          description="Create and manage your course catalog"
          actions={
            <Link href="/dashboard/admin/courses/new">
              <Button className="bg-gradient-to-r from-primary to-[#764BA2]">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </Link>
          }
        />

        {/* Stats Cards */}
        <StatsCardGrid columns={4}>
          <StatsCard
            title="Total Courses"
            value={stats.totalCourses}
            description={`${stats.publishedCourses} published`}
            icon={<BookOpen className="h-5 w-5" />}
            accent="blue"
            trend={
              stats.publishedCourses > 0
                ? {
                    direction: "up",
                    value: `${Math.round((stats.publishedCourses / stats.totalCourses) * 100)}%`,
                    label: "live",
                  }
                : undefined
            }
            loading={loading && !courses}
          />
          <StatsCard
            title="Total Students"
            value={stats.totalStudents.toLocaleString()}
            description="Across all courses"
            icon={<Users className="h-5 w-5" />}
            accent="purple"
            loading={loading && !courses}
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats.totalRevenue / 1000).toFixed(1)}k`}
            description="Lifetime course sales"
            icon={<DollarSign className="h-5 w-5" />}
            accent="green"
            trend={
              stats.totalRevenue > 0
                ? {
                    direction: "up",
                    value: "+12%",
                    label: "this month",
                  }
                : undefined
            }
            loading={loading && !courses}
          />
          <StatsCard
            title="Avg. Course Price"
            value={`$${Math.round(stats.avgPrice)}`}
            description={`Across ${stats.totalCourses} courses`}
            icon={<TrendingUp className="h-5 w-5" />}
            accent="amber"
            loading={loading && !courses}
          />
        </StatsCardGrid>

        {/* Courses Table */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border">
            <h2 className="text-lg font-semibold">All Courses</h2>
            <p className="text-sm text-muted-foreground">
              {filteredCourses.length} courses found
            </p>
          </div>
          <div className="p-6">
            <DataTable
              data={paginatedCourses}
              columns={columns}
              keyField="id"
              selectable
              selectedRows={selectedCourses}
              onSelectionChange={setSelectedCourses}
              bulkActions={bulkActions}
              searchable
              searchPlaceholder="Search courses..."
              searchValue={searchQuery}
              onSearchChange={setSearchQuery}
              filters={filters}
              filterValues={{ category: categoryFilter, status: statusFilter }}
              onFilterChange={(id, value) => {
                if (id === "category")
                  setCategoryFilter((value as string) || "");
                if (id === "status") setStatusFilter((value as string) || "");
              }}
              onClearFilters={() => {
                setCategoryFilter("");
                setStatusFilter("");
              }}
              page={currentPage}
              pageSize={pageSize}
              totalItems={filteredCourses.length}
              onPageChange={setCurrentPage}
              onPageSizeChange={setPageSize}
              rowActions={renderRowActions}
              exportable
              onExport={handleExport}
              loading={loading && !courses}
              emptyTitle="No courses yet"
              emptyDescription="Create your first course to get started"
              emptyAction={
                <Link href="/dashboard/admin/courses/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Course
                  </Button>
                </Link>
              }
              striped
            />
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog {...dialogProps} />
      </div>
    </AdminPageShell>
  );
}
