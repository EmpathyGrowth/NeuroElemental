"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Column,
  DataTable,
  RowActionItem,
  RowActions,
  StatusBadge,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  DragDropList,
  DragHandle,
  updateDisplayOrder,
} from "@/components/ui/drag-drop-list";
import {
  TestimonialForm,
  TestimonialFormData,
} from "@/components/cms/testimonial-form";
import { formatDate } from "@/lib/utils";
import { Edit, Eye, EyeOff, GripVertical, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  element: string | null;
  avatar_url: string | null;
  is_published: boolean | null;
  is_verified: boolean | null;
  display_order: number | null;
  created_at: string | null;
}

// Elemental colors matching the brand's neurodivergent energy types
const elementStyles: Record<string, string> = {
  Electric: "bg-violet-500/10 text-violet-500 border-violet-500/20",
  Fire: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  Water: "bg-sky-500/10 text-sky-500 border-sky-500/20",
  Earth: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  Air: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
  Metal: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

const getElementStyle = (element: string | null): string => {
  if (!element) return "";
  return elementStyles[element] || "bg-primary/10 text-primary border-primary/20";
};

type ViewMode = "table" | "reorder";

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredData, setFilteredData] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [search, setSearch] = useState("");
  const [elementFilter, setElementFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [verifiedFilter, setVerifiedFilter] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    let result = testimonials;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.role?.toLowerCase().includes(q) ||
          t.quote.toLowerCase().includes(q)
      );
    }

    if (elementFilter) {
      result = result.filter((t) => t.element === elementFilter);
    }

    if (statusFilter) {
      const isPublished = statusFilter === "published";
      result = result.filter((t) => t.is_published === isPublished);
    }

    if (verifiedFilter) {
      const isVerified = verifiedFilter === "verified";
      result = result.filter((t) => t.is_verified === isVerified);
    }

    setFilteredData(result);
  }, [testimonials, search, elementFilter, statusFilter, verifiedFilter]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/testimonials");
      if (!response.ok) throw new Error("Failed to fetch testimonials");
      const result = await response.json();
      setTestimonials(result.testimonials || []);
    } catch {
      toast({ title: "Error", description: "Failed to load testimonials", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: TestimonialFormData) => {
    const url = editingTestimonial
      ? `/api/admin/testimonials/${editingTestimonial.id}`
      : "/api/admin/testimonials";
    const method = editingTestimonial ? "PATCH" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to save testimonial");
    }

    toast({ title: editingTestimonial ? "Testimonial updated" : "Testimonial created" });
    setDialogOpen(false);
    setEditingTestimonial(null);
    fetchTestimonials();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;

    try {
      const response = await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete");
      toast({ title: "Testimonial deleted" });
      fetchTestimonials();
    } catch {
      toast({ title: "Error", description: "Failed to delete testimonial", variant: "destructive" });
    }
  };

  const handleReorder = async (reorderedItems: Testimonial[]) => {
    // Convert null display_order to undefined for updateDisplayOrder compatibility
    const itemsForUpdate = reorderedItems.map(item => ({
      ...item,
      display_order: item.display_order ?? undefined
    }));
    const updated = updateDisplayOrder(itemsForUpdate) as Testimonial[];
    setTestimonials(updated);

    try {
      const response = await fetch("/api/admin/testimonials/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((t) => ({ id: t.id, display_order: t.display_order })),
        }),
      });

      if (!response.ok) throw new Error("Failed to save order");
      toast({ title: "Order saved" });
    } catch {
      toast({ title: "Error", description: "Failed to save order", variant: "destructive" });
      fetchTestimonials(); // Rollback
    }
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingTestimonial(null);
    setDialogOpen(true);
  };

  const columns: Column<Testimonial>[] = [
    {
      id: "name",
      header: "Author",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          {row.role && <div className="text-sm text-muted-foreground">{row.role}</div>}
        </div>
      ),
      sortable: true,
    },
    {
      id: "quote",
      header: "Quote",
      cell: (row) => (
        <p className="text-sm line-clamp-2 max-w-md" dangerouslySetInnerHTML={{ __html: row.quote }} />
      ),
    },
    {
      id: "element",
      header: "Element",
      accessorKey: "element",
      cell: (row) =>
        row.element ? (
          <Badge className={getElementStyle(row.element)}>{row.element}</Badge>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <div className="flex gap-2">
          <StatusBadge
            status={row.is_published ? "active" : "inactive"}
            label={row.is_published ? "Published" : "Draft"}
          />
          {row.is_verified && (
            <Badge variant="default" className="bg-green-600">
              <Star className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "created",
      header: "Created",
      accessorKey: "created_at",
      cell: (row) => (row.created_at ? formatDate(row.created_at) : "-"),
      sortable: true,
    },
  ];

  const clearFilters = () => {
    setElementFilter(null);
    setStatusFilter(null);
    setVerifiedFilter(null);
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Testimonials"
        description="Manage user testimonials and success stories"
        actions={
          <div className="flex gap-2">
            <Button
              variant={viewMode === "reorder" ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === "table" ? "reorder" : "table")}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {viewMode === "reorder" ? "Exit Reorder" : "Reorder"}
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Testimonial
            </Button>
          </div>
        }
      />

      {viewMode === "reorder" ? (
        <div className="border rounded-lg p-4 bg-muted/20">
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop to reorder testimonials. Changes are saved automatically.
          </p>
          <DragDropList
            items={testimonials}
            keyField="id"
            onReorder={handleReorder}
            renderItem={({ item, dragHandleProps }) => (
              <div className="flex items-center gap-3 p-3 bg-background border rounded-lg">
                <DragHandle {...dragHandleProps} />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-muted-foreground">{item.role}</div>
                </div>
                {item.element && (
                  <Badge className={getElementStyle(item.element)}>{item.element}</Badge>
                )}
                {item.is_published ? (
                  <Eye className="h-4 w-4 text-green-500" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )}
          />
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          keyField="id"
          loading={loading}
          searchable
          searchPlaceholder="Search testimonials..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={[
            {
              id: "element",
              label: "Element",
              type: "select",
              options: [
                { label: "Electric", value: "Electric" },
                { label: "Fire", value: "Fire" },
                { label: "Water", value: "Water" },
                { label: "Earth", value: "Earth" },
                { label: "Air", value: "Air" },
                { label: "Metal", value: "Metal" },
              ],
            },
            {
              id: "status",
              label: "Status",
              type: "select",
              options: [
                { label: "Published", value: "published" },
                { label: "Draft", value: "draft" },
              ],
            },
            {
              id: "verified",
              label: "Verified",
              type: "select",
              options: [
                { label: "Verified", value: "verified" },
                { label: "Not Verified", value: "not_verified" },
              ],
            },
          ]}
          filterValues={{
            element: elementFilter || "",
            status: statusFilter || "",
            verified: verifiedFilter || "",
          }}
          onFilterChange={(id, value) => {
            if (id === "element") setElementFilter(value as string || null);
            if (id === "status") setStatusFilter(value as string || null);
            if (id === "verified") setVerifiedFilter(value as string || null);
          }}
          onClearFilters={clearFilters}
          rowActions={(row) => (
            <RowActions>
              <RowActionItem onClick={() => openEdit(row)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </RowActionItem>
              <RowActionItem onClick={() => handleDelete(row.id)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </RowActionItem>
            </RowActions>
          )}
          emptyTitle="No testimonials found"
          emptyDescription="Add your first testimonial to showcase user success stories"
          emptyAction={
            <Button variant="outline" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add Testimonial
            </Button>
          }
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={(open) => {
        setDialogOpen(open);
        if (!open) setEditingTestimonial(null);
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTestimonial ? "Edit Testimonial" : "Create Testimonial"}
            </DialogTitle>
          </DialogHeader>
          <TestimonialForm
            initialData={editingTestimonial ? {
              name: editingTestimonial.name,
              role: editingTestimonial.role,
              quote: editingTestimonial.quote,
              element: editingTestimonial.element as TestimonialFormData["element"],
              avatar_url: editingTestimonial.avatar_url,
              is_published: editingTestimonial.is_published ?? false,
              is_verified: editingTestimonial.is_verified ?? false,
              display_order: editingTestimonial.display_order ?? 0,
            } : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setDialogOpen(false);
              setEditingTestimonial(null);
            }}
            isEditing={!!editingTestimonial}
          />
        </DialogContent>
      </Dialog>
    </AdminPageShell>
  );
}
