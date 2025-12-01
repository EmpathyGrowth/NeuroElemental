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
import { Textarea } from "@/components/ui/textarea";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  Download,
  Edit,
  FileText,
  FolderOpen,
  HardDrive,
  Loader2,
  Presentation,
  Trash2,
  Upload,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: string;
  category: string;
  fileUrl: string;
  fileSize: string;
  downloads: number;
  uploadedAt: string | null;
  certificationLevel: string | null;
}

interface Stats {
  totalResources: number;
  totalDownloads: number;
  categories: number;
  storageUsed: string;
}

interface ResourcesData {
  resources: Resource[];
  stats: Stats;
  categories: string[];
}

const defaultData: ResourcesData = {
  resources: [],
  stats: {
    totalResources: 0,
    totalDownloads: 0,
    categories: 0,
    storageUsed: "N/A",
  },
  categories: [],
};

const typeConfig: Record<string, { icon: typeof FileText; className: string }> =
  {
    pdf: {
      icon: FileText,
      className: "bg-red-500/10 text-red-600 border-red-500/20",
    },
    video: {
      icon: Video,
      className: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    },
    presentation: {
      icon: Presentation,
      className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    },
  };

// Category color mapping for visual distinction
const categoryStyles: Record<string, string> = {
  Guides: "bg-green-500/10 text-green-600 border-green-500/20",
  Templates: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Worksheets: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  Training: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  Marketing: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  Documentation: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const getCategoryStyle = (category: string): string => {
  return (
    categoryStyles[category] || "bg-primary/10 text-primary border-primary/20"
  );
};

export default function AdminResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedResources, setSelectedResources] = useState<Resource[]>([]);
  const { data: resourcesData, loading, execute } = useAsync<ResourcesData>();
  const { confirm, dialogProps } = useConfirmDialog();
  const [saving, setSaving] = useState(false);

  // Dialog states
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    resource: Resource | null;
  }>({
    open: false,
    resource: null,
  });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "pdf",
    category: "",
    certificationLevel: "",
  });

  const data = resourcesData || defaultData;
  const resources = data.resources;
  const stats = data.stats;
  const categories = data.categories;

  // Filter resources
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const matchesSearch =
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description?.toLowerCase() || "").includes(
          searchQuery.toLowerCase()
        );
      const matchesType = !typeFilter || resource.type === typeFilter;
      const matchesCategory =
        !categoryFilter || resource.category === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [resources, searchQuery, typeFilter, categoryFilter]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedResources([]);
  }, [searchQuery, typeFilter, categoryFilter]);

  // Fetch resources
  const fetchResources = useCallback(() => {
    execute(async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (typeFilter) params.set("type", typeFilter);
      if (categoryFilter) params.set("category", categoryFilter);

      const res = await fetch(
        `/api/dashboard/admin/resources?${params.toString()}`
      );
      if (!res.ok) {
        logger.error(
          "Failed to fetch resources:",
          new Error(`Status: ${res.status}`)
        );
        return defaultData;
      }
      const result = await res.json();
      if (result.error) {
        logger.error("Error fetching resources:", new Error(result.error));
        return defaultData;
      }
      return result;
    });
  }, [execute, searchQuery, typeFilter, categoryFilter]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  // Actions
  const handleDownload = (resource: Resource) => {
    if (resource.fileUrl) {
      window.open(resource.fileUrl, "_blank");
      toast.success("Download started", {
        description: `Downloading ${resource.title}`,
      });
    } else {
      toast.error("Download unavailable", {
        description: "This resource does not have a file attached.",
      });
    }
  };

  const handleOpenEdit = (resource: Resource) => {
    setFormData({
      title: resource.title,
      description: resource.description || "",
      type: resource.type,
      category: resource.category,
      certificationLevel: resource.certificationLevel || "",
    });
    setEditDialog({ open: true, resource });
  };

  const handleOpenUpload = () => {
    setFormData({
      title: "",
      description: "",
      type: "pdf",
      category: "",
      certificationLevel: "",
    });
    setUploadDialog(true);
  };

  const handleSaveResource = async () => {
    if (!formData.title || !formData.category) {
      toast.error("Title and category are required.");
      return;
    }

    setSaving(true);
    try {
      const isNew = !editDialog.resource;
      const url = isNew
        ? "/api/dashboard/admin/resources"
        : `/api/dashboard/admin/resources/${editDialog.resource?.id}`;

      const response = await fetch(url, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save resource");
      }

      toast.success(isNew ? "Resource Created" : "Resource Updated", {
        description: `${formData.title} has been ${isNew ? "created" : "updated"} successfully.`,
      });

      setUploadDialog(false);
      setEditDialog({ open: false, resource: null });
      fetchResources();
    } catch (error) {
      logger.error("Error saving resource:", error as Error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save resource. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (resource: Resource) => {
    confirm({
      title: "Delete Resource",
      description: `Are you sure you want to delete "${resource.title}"? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await fetch(
            `/api/dashboard/admin/resources/${resource.id}`,
            {
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to delete resource");
          }

          toast.success("Resource Deleted", {
            description: `${resource.title} has been removed.`,
          });

          fetchResources();
        } catch (error) {
          logger.error("Error deleting resource:", error as Error);
          toast.error("Failed to delete resource. Please try again.");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleBulkDelete = async (resources: Resource[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        resources.map((resource) =>
          fetch(`/api/dashboard/admin/resources/${resource.id}`, {
            method: "DELETE",
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deleted ${successful} resources, ${failed} failed`);
      } else {
        toast.success(`Deleted ${successful} resources`);
      }

      setSelectedResources([]);
      fetchResources();
    } catch (error) {
      logger.error("Error bulk deleting resources:", error as Error);
      toast.error("Failed to delete resources");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData =
        selectedResources.length > 0 ? selectedResources : resources;

      if (format === "csv") {
        const headers = [
          "Title",
          "Type",
          "Category",
          "Size",
          "Downloads",
          "Uploaded",
        ];
        const rows = exportData.map((resource) => [
          resource.title,
          resource.type,
          resource.category,
          resource.fileSize,
          resource.downloads.toString(),
          resource.uploadedAt ? formatDate(resource.uploadedAt) : "N/A",
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
        link.download = `resources_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `resources_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} resources to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting resources:", error as Error);
      toast.error("Failed to export resources. Please try again.");
    }
  };

  // Table columns
  const columns: Column<Resource>[] = [
    {
      id: "title",
      header: "Resource",
      cell: (resource) => {
        const config = typeConfig[resource.type] || {
          icon: FileText,
          className: "bg-gray-500/10 text-gray-600",
        };
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${config.className.split(" ")[0]}`}>
              <Icon className={`w-5 h-5 ${config.className.split(" ")[1]}`} />
            </div>
            <div>
              <div className="font-medium">{resource.title}</div>
              {resource.description && (
                <div className="text-sm text-muted-foreground line-clamp-1">
                  {resource.description}
                </div>
              )}
            </div>
          </div>
        );
      },
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      cell: (resource) => (
        <Badge className={getCategoryStyle(resource.category)}>
          {resource.category}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "size",
      header: "Size",
      accessorKey: "fileSize",
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "downloads",
      header: "Downloads",
      cell: (resource) => (
        <div className="flex items-center justify-center gap-1">
          <Download className="h-3 w-3 text-muted-foreground" />
          {resource.downloads}
        </div>
      ),
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "uploaded",
      header: "Uploaded",
      cell: (resource) =>
        resource.uploadedAt ? (
          <DateCell date={resource.uploadedAt} format="relative" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Resource>[] = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkDelete,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to delete the selected resources? This action cannot be undone.",
    },
  ];

  // Filters
  const filters: FilterConfig[] = [
    {
      id: "type",
      label: "Type",
      type: "select",
      placeholder: "All types",
      options: [
        { label: "PDF", value: "pdf" },
        { label: "Video", value: "video" },
        { label: "Presentation", value: "presentation" },
      ],
    },
    {
      id: "category",
      label: "Category",
      type: "select",
      placeholder: "All categories",
      options: categories.map((cat) => ({ label: cat, value: cat })),
    },
  ];

  // Row actions
  const renderRowActions = (resource: Resource) => (
    <RowActions>
      <RowActionItem onClick={() => handleDownload(resource)}>
        <Download className="mr-2 h-4 w-4" />
        Download
      </RowActionItem>
      <RowActionItem onClick={() => handleOpenEdit(resource)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Details
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(resource)}
        disabled={saving}
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
          <h1 className="text-3xl font-bold mb-2">Instructor Resources</h1>
          <p className="text-muted-foreground">
            Upload and manage teaching materials for instructors
          </p>
        </div>
        <Button
          className="bg-gradient-to-r from-primary to-[#764BA2]"
          onClick={handleOpenUpload}
        >
          <Upload className="w-4 h-4 mr-2" />
          Upload Resource
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Total Resources"
          value={stats.totalResources}
          description="Available for download"
          icon={<FileText className="h-5 w-5" />}
          accent="indigo"
          loading={loading && !resourcesData}
        />
        <StatsCard
          title="Total Downloads"
          value={stats.totalDownloads}
          description="All time"
          icon={<Download className="h-5 w-5" />}
          accent="green"
          loading={loading && !resourcesData}
        />
        <StatsCard
          title="Categories"
          value={stats.categories}
          description="Different types"
          icon={<FolderOpen className="h-5 w-5" />}
          accent="amber"
          loading={loading && !resourcesData}
        />
        <StatsCard
          title="Storage Used"
          value={stats.storageUsed}
          description="Total file size"
          icon={<HardDrive className="h-5 w-5" />}
          accent="cyan"
          loading={loading && !resourcesData}
        />
      </StatsCardGrid>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Resources</CardTitle>
          <CardDescription>
            {filteredResources.length} resources found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedResources}
            columns={columns}
            keyField="id"
            selectable
            selectedRows={selectedResources}
            onSelectionChange={setSelectedResources}
            bulkActions={bulkActions}
            searchable
            searchPlaceholder="Search resources..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            filterValues={{ type: typeFilter, category: categoryFilter }}
            onFilterChange={(id, value) => {
              if (id === "type") setTypeFilter((value as string) || "");
              if (id === "category") setCategoryFilter((value as string) || "");
            }}
            onClearFilters={() => {
              setTypeFilter("");
              setCategoryFilter("");
            }}
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredResources.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            rowActions={renderRowActions}
            exportable
            onExport={handleExport}
            loading={loading && !resourcesData}
            emptyTitle="No resources found"
            emptyDescription={
              resources.length === 0
                ? "Upload your first resource to get started"
                : "Try adjusting your search or filters"
            }
            emptyAction={
              resources.length === 0 ? (
                <Button onClick={handleOpenUpload}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resource
                </Button>
              ) : undefined
            }
            striped
          />
        </CardContent>
      </Card>

      {/* Upload/Create Dialog */}
      <Dialog open={uploadDialog} onOpenChange={setUploadDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>
              Add a new teaching resource for instructors
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter resource description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category *</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Training Materials"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="certificationLevel">Certification Level</Label>
              <Select
                value={formData.certificationLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, certificationLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No requirement</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Note: File upload functionality requires storage integration. For
              now, resources will be created without file attachments.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUploadDialog(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveResource} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, resource: open ? editDialog.resource : null })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
            <DialogDescription>Update resource information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Title *</Label>
              <Input
                id="editTitle"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter resource title"
              />
            </div>
            <div>
              <Label htmlFor="editDescription">Description</Label>
              <Textarea
                id="editDescription"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter resource description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editType">Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="editCategory">Category *</Label>
                <Input
                  id="editCategory"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  placeholder="e.g., Training Materials"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="editCertificationLevel">
                Certification Level
              </Label>
              <Select
                value={formData.certificationLevel}
                onValueChange={(value) =>
                  setFormData({ ...formData, certificationLevel: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No requirement</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="master">Master</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, resource: null })}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveResource} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
