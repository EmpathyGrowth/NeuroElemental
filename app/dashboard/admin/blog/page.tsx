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
  StatusBadge,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  Archive,
  Calendar,
  CheckCircle,
  Copy,
  Edit,
  Eye,
  FileText,
  Plus,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 10;

// Category color mapping for visual distinction
const categoryStyles: Record<string, string> = {
  News: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Updates: "bg-green-500/10 text-green-600 border-green-500/20",
  Tutorials: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  Tips: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Research: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  "Case Studies": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  Interviews: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  Announcements: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  Uncategorized: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const getCategoryStyle = (category: string | null): string => {
  if (!category) return categoryStyles["Uncategorized"];
  return (
    categoryStyles[category] || "bg-primary/10 text-primary border-primary/20"
  );
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  author?: { id: string; full_name: string | null; avatar_url: string | null } | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export default function AdminBlogPage() {
  const { data: posts, loading, execute } = useAsync<BlogPost[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedPosts, setSelectedPosts] = useState<BlogPost[]>([]);
  const { confirm, dialogProps } = useConfirmDialog();

  const fetchPosts = useCallback(() => {
    execute(async () => {
      const response = await fetch("/api/blog");
      if (!response.ok) throw new Error("Failed to fetch posts");
      const result = await response.json();
      return result.posts || [];
    });
  }, [execute]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedPosts([]);
  }, [searchQuery, categoryFilter, statusFilter]);

  const handleDelete = (post: BlogPost) => {
    confirm({
      title: "Delete Post",
      description: `Are you sure you want to delete "${post.title}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/blog/${post.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            toast.success("Post deleted successfully");
            fetchPosts();
          } else {
            throw new Error("Failed to delete post");
          }
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          logger.error("Error deleting post:", err);
          toast.error("Failed to delete post. Please try again.");
        }
      },
    });
  };

  const handleDuplicate = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("Post duplicated successfully", {
          description: `Created "${result.data?.title || "copy"}" as draft`,
        });
        fetchPosts();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to duplicate post");
      }
    } catch (error) {
      logger.error("Error duplicating post:", error as Error);
      toast.error("Failed to duplicate post. Please try again.");
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      const response = await fetch(`/api/blog/${post.id}/publish`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_published: !post.is_published }),
      });

      if (response.ok) {
        toast.success(
          post.is_published ? "Post unpublished" : "Post published"
        );
        fetchPosts();
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      logger.error("Error toggling publish:", error as Error);
      toast.error("Failed to update post status");
    }
  };

  const handleBulkPublish = async (posts: BlogPost[]) => {
    try {
      const results = await Promise.allSettled(
        posts.map((post) =>
          fetch(`/api/blog/${post.id}/publish`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: true }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Published ${successful} posts, ${failed} failed`);
      } else {
        toast.success(`Published ${successful} posts`);
      }

      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      logger.error("Error bulk publishing:", error as Error);
      toast.error("Failed to publish posts");
    }
  };

  const handleBulkUnpublish = async (posts: BlogPost[]) => {
    try {
      const results = await Promise.allSettled(
        posts.map((post) =>
          fetch(`/api/blog/${post.id}/publish`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_published: false }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      toast.success(`Unpublished ${successful} posts`);
      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      logger.error("Error bulk unpublishing:", error as Error);
      toast.error("Failed to unpublish posts");
    }
  };

  const handleBulkDelete = async (posts: BlogPost[]) => {
    try {
      const results = await Promise.allSettled(
        posts.map((post) => fetch(`/api/blog/${post.id}`, { method: "DELETE" }))
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deleted ${successful} posts, ${failed} failed`);
      } else {
        toast.success(`Deleted ${successful} posts`);
      }

      setSelectedPosts([]);
      fetchPosts();
    } catch (error) {
      logger.error("Error bulk deleting:", error as Error);
      toast.error("Failed to delete posts");
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData = selectedPosts.length > 0 ? selectedPosts : posts || [];

      if (format === "csv") {
        const headers = [
          "Title",
          "Category",
          "Author",
          "Status",
          "Created",
          "Updated",
        ];
        const rows = exportData.map((post) => [
          post.title,
          post.category || "Uncategorized",
          post.author?.full_name || "Unknown",
          post.is_published ? "Published" : "Draft",
          formatDate(post.created_at),
          formatDate(post.updated_at),
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
        link.download = `blog_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `blog_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} posts to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting posts:", error as Error);
      toast.error("Failed to export posts");
    }
  };

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = new Set(
      (posts || []).map((p) => p.category || "Uncategorized")
    );
    return Array.from(cats).sort();
  }, [posts]);

  // Filter posts
  const filteredPosts = useMemo(
    () =>
      (posts || []).filter((post) => {
        const matchesSearch =
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (post.category || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesCategory =
          !categoryFilter ||
          (post.category || "Uncategorized") === categoryFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "published" && post.is_published) ||
          (statusFilter === "draft" && !post.is_published);
        return matchesSearch && matchesCategory && matchesStatus;
      }),
    [posts, searchQuery, categoryFilter, statusFilter]
  );

  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPosts.slice(start, start + pageSize);
  }, [filteredPosts, currentPage, pageSize]);

  // Stats calculations
  const stats = useMemo(() => {
    const allPosts = posts || [];
    const publishedPosts = allPosts.filter((p) => p.is_published).length;
    const draftPosts = allPosts.length - publishedPosts;
    const now = new Date();
    const thisMonth = allPosts.filter((p) => {
      const date = new Date(p.created_at);
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
    const totalViews = allPosts.reduce((sum, p) => sum + (p.view_count || 0), 0);

    return {
      totalPosts: allPosts.length,
      publishedPosts,
      draftPosts,
      thisMonth,
      totalViews,
    };
  }, [posts]);

  // Table columns
  const columns: Column<BlogPost>[] = [
    {
      id: "title",
      header: "Title",
      cell: (post) => (
        <div>
          <div className="font-medium">{post.title}</div>
          <div className="text-sm text-muted-foreground">/blog/{post.slug}</div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      cell: (post) => (
        <Badge className={getCategoryStyle(post.category)}>
          {post.category || "Uncategorized"}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "author",
      header: "Author",
      cell: (post) => (
        <span className="text-sm">{post.author?.full_name || "Unknown"}</span>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      cell: (post) =>
        post.is_published ? (
          <StatusBadge status="active" label="Published" />
        ) : (
          <StatusBadge status="inactive" label="Draft" />
        ),
      sortable: true,
    },
    {
      id: "created",
      header: "Created",
      cell: (post) => <DateCell date={post.created_at} format="relative" />,
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<BlogPost>[] = [
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
        "Are you sure you want to delete the selected posts? This action cannot be undone.",
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
  const renderRowActions = (post: BlogPost) => (
    <RowActions>
      <RowActionItem asChild>
        <Link href={`/blog/${post.slug}`} target="_blank">
          <Eye className="mr-2 h-4 w-4" />
          Preview
        </Link>
      </RowActionItem>
      <RowActionItem asChild>
        <Link href={`/dashboard/admin/blog/${post.id}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Post
        </Link>
      </RowActionItem>
      <RowActionItem onClick={() => handleTogglePublish(post)}>
        {post.is_published ? (
          <>
            <XCircle className="mr-2 h-4 w-4" />
            Unpublish
          </>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Publish
          </>
        )}
      </RowActionItem>
      <RowActionItem onClick={() => handleDuplicate(post)}>
        <Copy className="mr-2 h-4 w-4" />
        Duplicate
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(post)}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Blog Management</h1>
          <p className="text-muted-foreground">Create and manage blog posts</p>
        </div>
        <Link href="/dashboard/admin/blog/new">
          <Button className="bg-gradient-to-r from-primary to-[#764BA2]">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Total Posts"
          value={stats.totalPosts}
          description={`${stats.publishedPosts} published`}
          icon={<FileText className="h-5 w-5" />}
          accent="indigo"
          trend={
            stats.publishedPosts > 0
              ? {
                  direction: "up",
                  value: `${Math.round((stats.publishedPosts / stats.totalPosts) * 100)}%`,
                  label: "live",
                }
              : undefined
          }
          loading={loading && !posts}
        />
        <StatsCard
          title="Published"
          value={stats.publishedPosts}
          description="Live on site"
          icon={<CheckCircle className="h-5 w-5" />}
          accent="green"
          loading={loading && !posts}
        />
        <StatsCard
          title="Drafts"
          value={stats.draftPosts}
          description="Not published"
          icon={<XCircle className="h-5 w-5" />}
          accent="amber"
          trend={
            stats.draftPosts > 0
              ? {
                  direction: "neutral",
                  value: `${stats.draftPosts}`,
                  label: "awaiting review",
                }
              : undefined
          }
          loading={loading && !posts}
        />
        <StatsCard
          title="This Month"
          value={stats.thisMonth}
          description="Posts created"
          icon={<Calendar className="h-5 w-5" />}
          accent="cyan"
          trend={
            stats.thisMonth > 0
              ? {
                  direction: "up",
                  value: `+${stats.thisMonth}`,
                  label: "new",
                }
              : undefined
          }
          loading={loading && !posts}
        />
      </StatsCardGrid>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
          <CardDescription>{filteredPosts.length} posts found</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedPosts}
            columns={columns}
            keyField="id"
            selectable
            selectedRows={selectedPosts}
            onSelectionChange={setSelectedPosts}
            bulkActions={bulkActions}
            searchable
            searchPlaceholder="Search posts..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            filterValues={{ category: categoryFilter, status: statusFilter }}
            onFilterChange={(id, value) => {
              if (id === "category") setCategoryFilter((value as string) || "");
              if (id === "status") setStatusFilter((value as string) || "");
            }}
            onClearFilters={() => {
              setCategoryFilter("");
              setStatusFilter("");
            }}
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredPosts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            rowActions={renderRowActions}
            exportable
            onExport={handleExport}
            loading={loading && !posts}
            emptyTitle="No blog posts yet"
            emptyDescription="Create your first post to get started"
            emptyAction={
              <Link href="/dashboard/admin/blog/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Post
                </Button>
              </Link>
            }
            striped
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
