"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
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
  CheckCircle,
  Edit,
  Eye,
  Loader2,
  Package,
  Plus,
  Power,
  PowerOff,
  Trash2,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

// Product type color mapping
const productTypeStyles: Record<string, string> = {
  physical_product: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  digital_product: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  subscription: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  service: "bg-green-500/10 text-green-600 border-green-500/20",
  bundle: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const getProductTypeStyle = (type: string): string => {
  return (
    productTypeStyles[type] || "bg-gray-500/10 text-gray-500 border-gray-500/20"
  );
};

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: string;
  price_usd: number;
  is_active: boolean | null;
  metadata: Record<string, unknown> | null;
  stripe_price_id: string | null;
  created_at: string | null;
}

interface ProductsResponse {
  products: Product[];
  stats: {
    total: number;
    active: number;
  };
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

const PRODUCT_TYPES = [
  { value: "digital_course", label: "Digital Course" },
  { value: "workbook", label: "Workbook" },
  { value: "coaching_session", label: "Coaching Session" },
  { value: "subscription", label: "Subscription" },
  { value: "assessment", label: "Assessment" },
  { value: "bundle", label: "Bundle" },
];

export default function AdminProductsPage() {
  const { data: productsData, loading, execute } = useAsync<ProductsResponse>();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const { confirm, dialogProps } = useConfirmDialog();
  const [saving, setSaving] = useState(false);

  const [viewDialog, setViewDialog] = useState<{
    open: boolean;
    product: Product | null;
  }>({
    open: false,
    product: null,
  });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    product: Product | null;
    isNew: boolean;
  }>({
    open: false,
    product: null,
    isNew: false,
  });
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    type: "digital_course",
    price_usd: 0,
    is_active: false,
  });

  const products = productsData?.products || [];
  const stats = productsData?.stats || { total: 0, active: 0 };

  // Get unique types for filter
  const types = useMemo(() => {
    const typeSet = new Set(products.map((p) => p.type || "unknown"));
    return Array.from(typeSet).sort();
  }, [products]);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (product.slug || "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        const matchesType =
          !typeFilter || (product.type || "unknown") === typeFilter;
        const matchesStatus =
          !statusFilter ||
          (statusFilter === "active" && product.is_active) ||
          (statusFilter === "inactive" && !product.is_active);
        return matchesSearch && matchesType && matchesStatus;
      }),
    [products, searchQuery, typeFilter, statusFilter]
  );

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedProducts([]);
  }, [searchQuery, typeFilter, statusFilter]);

  const fetchProducts = useCallback(() => {
    execute(async () => {
      const response = await fetch("/api/products");
      if (!response.ok) throw new Error("Failed to fetch products");
      return response.json();
    });
  }, [execute]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenNew = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      type: "digital_course",
      price_usd: 0,
      is_active: false,
    });
    setEditDialog({ open: true, product: null, isNew: true });
  };

  const handleOpenEdit = (product: Product) => {
    setFormData({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      type: product.type,
      price_usd: product.price_usd,
      is_active: product.is_active || false,
    });
    setEditDialog({ open: true, product, isNew: false });
  };

  const handleViewDetails = (product: Product) => {
    setViewDialog({ open: true, product });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSave = async () => {
    if (!formData.name || !formData.type) {
      toast.error("Name and type are required.");
      return;
    }

    setSaving(true);
    try {
      const slug = formData.slug || generateSlug(formData.name);
      const payload = { ...formData, slug };

      const url = editDialog.isNew
        ? "/api/products"
        : `/api/products/${editDialog.product?.id}`;

      const response = await fetch(url, {
        method: editDialog.isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save product");
      }

      toast.success(editDialog.isNew ? "Product Created" : "Product Updated", {
        description: `${formData.name} has been ${editDialog.isNew ? "created" : "updated"} successfully.`,
      });

      setEditDialog({ open: false, product: null, isNew: false });
      fetchProducts();
    } catch (error) {
      logger.error("Error saving product:", error as Error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (product: Product) => {
    confirm({
      title: "Delete Product",
      description: `Are you sure you want to delete "${product.name}"? This will deactivate the product.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await fetch(`/api/products/${product.id}`, {
            method: "DELETE",
          });

          if (!response.ok) throw new Error("Failed to delete product");

          toast.success("Product Deleted", {
            description: `${product.name} has been deactivated.`,
          });

          fetchProducts();
        } catch (error) {
          logger.error("Error deleting product:", error as Error);
          toast.error("Failed to delete product. Please try again.");
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleToggleStatus = async (product: Product) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !product.is_active }),
      });

      if (!response.ok) throw new Error("Failed to update product status");

      toast.success(
        product.is_active ? "Product Deactivated" : "Product Activated",
        {
          description: `${product.name} has been ${product.is_active ? "deactivated" : "activated"}.`,
        }
      );

      fetchProducts();
    } catch (error) {
      logger.error("Error toggling product status:", error as Error);
      toast.error("Failed to update product status");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkActivate = async (products: Product[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        products.map((product) =>
          fetch(`/api/products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: true }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Activated ${successful} products, ${failed} failed`);
      } else {
        toast.success(`Activated ${successful} products`);
      }

      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      logger.error("Error bulk activating products:", error as Error);
      toast.error("Failed to activate products");
    } finally {
      setSaving(false);
    }
  };

  const handleBulkDeactivate = async (products: Product[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        products.map((product) =>
          fetch(`/api/products/${product.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_active: false }),
          })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deactivated ${successful} products, ${failed} failed`);
      } else {
        toast.success(`Deactivated ${successful} products`);
      }

      setSelectedProducts([]);
      fetchProducts();
    } catch (error) {
      logger.error("Error bulk deactivating products:", error as Error);
      toast.error("Failed to deactivate products");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData =
        selectedProducts.length > 0 ? selectedProducts : products;

      if (format === "csv") {
        const headers = ["Name", "Slug", "Type", "Price", "Status", "Created"];
        const rows = exportData.map((product) => [
          product.name,
          product.slug,
          product.type,
          product.price_usd.toString(),
          product.is_active ? "Active" : "Inactive",
          product.created_at ? formatDate(product.created_at) : "",
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
        link.download = `products_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `products_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} products to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting products:", error as Error);
      toast.error("Failed to export products. Please try again.");
    }
  };

  // Table columns
  const columns: Column<Product>[] = [
    {
      id: "name",
      header: "Product",
      cell: (product) => (
        <div>
          <div className="font-medium">{product.name}</div>
          <div className="text-sm text-muted-foreground">{product.slug}</div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      cell: (product) => (
        <Badge className={`capitalize ${getProductTypeStyle(product.type)}`}>
          {product.type.replace("_", " ")}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "price",
      header: "Price",
      cell: (product) => (
        <span className="font-mono">${product.price_usd}</span>
      ),
      sortable: true,
      className: "text-right",
      headerClassName: "text-right",
    },
    {
      id: "status",
      header: "Status",
      cell: (product) =>
        product.is_active ? (
          <Badge variant="default" className="bg-green-500/10 text-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        ),
      sortable: true,
    },
    {
      id: "created",
      header: "Created",
      cell: (product) =>
        product.created_at ? (
          <DateCell date={product.created_at} format="relative" />
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Product>[] = [
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
        "Are you sure you want to deactivate the selected products?",
    },
  ];

  // Filters
  const filters: FilterConfig[] = [
    {
      id: "type",
      label: "Type",
      type: "select",
      placeholder: "All types",
      options: types.map((type) => ({
        label: type.replace("_", " "),
        value: type,
      })),
    },
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
  ];

  // Row actions
  const renderRowActions = (product: Product) => (
    <RowActions>
      <RowActionItem onClick={() => handleViewDetails(product)}>
        <Eye className="mr-2 h-4 w-4" />
        View Details
      </RowActionItem>
      <RowActionItem onClick={() => handleOpenEdit(product)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Product
      </RowActionItem>
      <RowActionItem
        onClick={() => handleToggleStatus(product)}
        disabled={saving}
      >
        {product.is_active ? (
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
        onClick={() => handleDelete(product)}
        disabled={saving}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  const inactiveCount = stats.total - stats.active;

  return (
    <AdminPageShell>
      {/* Header */}
      <AdminPageHeader
        title="Product Management"
        description="Manage your digital products and pricing"
        actions={
          <Button
            className="bg-gradient-to-r from-primary to-[#764BA2]"
            onClick={handleOpenNew}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        }
      />

      {/* Stats Cards */}
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Total Products"
          value={stats.total}
          description={`${stats.active} active`}
          icon={<Package className="h-5 w-5" />}
          accent="blue"
          loading={loading && !productsData}
        />
        <StatsCard
          title="Active Products"
          value={stats.active}
          description="Available for sale"
          icon={<CheckCircle className="h-5 w-5" />}
          accent="green"
          loading={loading && !productsData}
        />
        <StatsCard
          title="Inactive Products"
          value={inactiveCount}
          description="Not available"
          icon={<XCircle className="h-5 w-5" />}
          accent="red"
          loading={loading && !productsData}
        />
        <StatsCard
          title="Product Types"
          value={types.length}
          description="Different categories"
          icon={<Package className="h-5 w-5" />}
          accent="purple"
          loading={loading && !productsData}
        />
      </StatsCardGrid>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Products</CardTitle>
          <CardDescription>
            Configure products for Stripe integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedProducts}
            columns={columns}
            keyField="id"
            selectable
            selectedRows={selectedProducts}
            onSelectionChange={setSelectedProducts}
            bulkActions={bulkActions}
            searchable
            searchPlaceholder="Search products..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            filterValues={{ type: typeFilter, status: statusFilter }}
            onFilterChange={(id, value) => {
              if (id === "type") setTypeFilter((value as string) || "");
              if (id === "status") setStatusFilter((value as string) || "");
            }}
            onClearFilters={() => {
              setTypeFilter("");
              setStatusFilter("");
            }}
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredProducts.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            rowActions={renderRowActions}
            exportable
            onExport={handleExport}
            loading={loading && !productsData}
            emptyTitle="No products found"
            emptyDescription={
              products.length === 0
                ? "Create your first product to get started"
                : "Try adjusting your search or filters"
            }
            emptyAction={
              products.length === 0 ? (
                <Button onClick={handleOpenNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Product
                </Button>
              ) : undefined
            }
            striped
          />
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog
        open={viewDialog.open}
        onOpenChange={(open) =>
          setViewDialog({ open, product: open ? viewDialog.product : null })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View product information</DialogDescription>
          </DialogHeader>
          {viewDialog.product && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{viewDialog.product.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Slug</Label>
                <p className="font-mono text-sm">{viewDialog.product.slug}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{viewDialog.product.description || "No description"}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="capitalize">
                    {viewDialog.product.type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p>${viewDialog.product.price_usd}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <p>{viewDialog.product.is_active ? "Active" : "Inactive"}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">
                    Stripe Price ID
                  </Label>
                  <p className="font-mono text-xs">
                    {viewDialog.product.stripe_price_id || "Not connected"}
                  </p>
                </div>
              </div>
              {viewDialog.product.created_at && (
                <div>
                  <Label className="text-muted-foreground">Created</Label>
                  <p>{formatDate(viewDialog.product.created_at)}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setViewDialog({ open: false, product: null })}
            >
              Close
            </Button>
            {viewDialog.product && (
              <Button
                onClick={() => {
                  setViewDialog({ open: false, product: null });
                  handleOpenEdit(viewDialog.product!);
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({
            open,
            product: open ? editDialog.product : null,
            isNew: open ? editDialog.isNew : false,
          })
        }
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editDialog.isNew ? "Create Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {editDialog.isNew
                ? "Add a new product to your catalog"
                : "Update product information"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="Auto-generated from name if empty"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave empty to auto-generate from name
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter product description"
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
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_usd}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price_usd: parseFloat(e.target.value) || 0,
                    })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Active (available for purchase)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, product: null, isNew: false })
              }
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editDialog.isNew ? "Create Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </AdminPageShell>
  );
}
