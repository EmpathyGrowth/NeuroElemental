"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageUpload } from "@/components/forms/image-upload";
import { Button } from "@/components/ui/button";
import {
  Column,
  DataTable,
  DateCell,
  RowActionItem,
  RowActions,
  StatusBadge,
} from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import DOMPurify from "dompurify";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  featured_image?: string;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [filteredData, setFilteredData] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info",
    featured_image: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    let result = announcements;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.content.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter((a) => a.type === typeFilter);
    }

    setFilteredData(result);
  }, [announcements, search, typeFilter]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      logger.error(
        "Error fetching announcements",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId
        ? `/api/admin/announcements/${editingId}`
        : "/api/admin/announcements";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast({
        title: editingId ? "Announcement updated" : "Announcement created",
      });
      setDialogOpen(false);
      setEditingId(null);
      setFormData({
        title: "",
        content: "",
        type: "info",
        featured_image: "",
        is_active: true,
      });
      fetchAnnouncements();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save announcement",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    try {
      await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
      toast({ title: "Announcement deleted" });
      fetchAnnouncements();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const openEdit = (item: Announcement) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      content: item.content,
      type: item.type,
      featured_image: item.featured_image || "",
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const columns: Column<Announcement>[] = [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.title}</div>
          <div
            className="text-xs text-muted-foreground truncate max-w-[300px]"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(row.content),
            }}
          />
        </div>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      cell: (row) => {
        const map: Record<string, any> = {
          info: "active", // blue
          success: "success", // green
          warning: "warning", // yellow
          error: "error", // red
        };
        return (
          <StatusBadge
            status={map[row.type] || "active"}
            label={row.type.toUpperCase()}
          />
        );
      },
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <StatusBadge
          status={row.is_active ? "active" : "inactive"}
          label={row.is_active ? "Active" : "Inactive"}
        />
      ),
      sortable: true,
    },
    {
      id: "created_at",
      header: "Created",
      accessorKey: "created_at",
      cell: (row) => <DateCell date={row.created_at || new Date()} />,
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Announcements"
        description="Manage site-wide announcements and banners"
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingId(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Add Announcement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Add"} Announcement
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Content</Label>
                  <RichTextEditor
                    content={formData.content}
                    onChange={(html) =>
                      setFormData({ ...formData, content: html })
                    }
                    placeholder="Write announcement content..."
                    className="min-h-[150px]"
                  />
                </div>
                <div>
                  <Label>Featured Image</Label>
                  <ImageUpload
                    value={formData.featured_image}
                    onChange={(url) =>
                      setFormData({ ...formData, featured_image: url || "" })
                    }
                    category="general"
                    aspectRatio="banner"
                    placeholder="Upload banner image"
                  />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_active: v })
                    }
                  />
                  <Label>Active</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingId ? "Update" : "Create"} Announcement
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        loading={loading}
        searchable
        searchPlaceholder="Search announcements..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: "type",
            label: "Type",
            type: "select",
            options: [
              { label: "Info", value: "info" },
              { label: "Warning", value: "warning" },
              { label: "Success", value: "success" },
              { label: "Error", value: "error" },
            ],
          },
        ]}
        filterValues={{ type: typeFilter || "" }}
        onFilterChange={(_, val) => setTypeFilter(val as string)}
        onClearFilters={() => setTypeFilter(null)}
        rowActions={(row) => (
          <RowActions>
            <RowActionItem onClick={() => openEdit(row)}>
              <Edit className="mr-2 h-4 w-4" /> Edit
            </RowActionItem>
            <RowActionItem
              onClick={() => handleDelete(row.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </RowActionItem>
          </RowActions>
        )}
        emptyTitle="No announcements found"
        emptyDescription="Create a new announcement to get started."
      />
    </AdminPageShell>
  );
}
