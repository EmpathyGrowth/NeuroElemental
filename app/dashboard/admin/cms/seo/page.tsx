"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SeoSettings {
  id: string;
  page_path: string;
  title: string | null;
  description: string | null;
  og_title: string | null;
  og_description: string | null;
  is_noindex: boolean;
}

export default function SeoSettingsPage() {
  const [settings, setSettings] = useState<SeoSettings[]>([]);
  const [filteredData, setFilteredData] = useState<SeoSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    page_path: "",
    title: "",
    description: "",
    og_title: "",
    og_description: "",
    is_noindex: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (search) {
      const q = search.toLowerCase();
      setFilteredData(
        settings.filter(
          (s) =>
            s.page_path.toLowerCase().includes(q) ||
            s.title?.toLowerCase().includes(q) ||
            s.description?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredData(settings);
    }
  }, [settings, search]);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/seo");
      const data = await res.json();
      setSettings(data.settings || []);
    } catch (error) {
      logger.error(
        "Error fetching SEO settings",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast({ title: "SEO settings saved" });
      setDialogOpen(false);
      setEditingId(null);
      setFormData({
        page_path: "",
        title: "",
        description: "",
        og_title: "",
        og_description: "",
        is_noindex: false,
      });
      fetchSettings();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save SEO settings",
        variant: "destructive",
      });
    }
  };

  const openEdit = (item: SeoSettings) => {
    setEditingId(item.id);
    setFormData({
      page_path: item.page_path,
      title: item.title || "",
      description: item.description || "",
      og_title: item.og_title || "",
      og_description: item.og_description || "",
      is_noindex: item.is_noindex,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this SEO setting?")) return;
    try {
      await fetch(`/api/admin/seo/${id}`, { method: "DELETE" });
      toast({ title: "SEO setting deleted" });
      fetchSettings();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const columns: Column<SeoSettings>[] = [
    {
      id: "path",
      header: "Path",
      accessorKey: "page_path",
      cell: (row) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          {row.page_path}
        </code>
      ),
      sortable: true,
    },
    {
      id: "metadata",
      header: "Metadata",
      cell: (row) => (
        <div className="max-w-md">
          <div className="font-medium truncate">{row.title || "-"}</div>
          <div className="text-xs text-muted-foreground truncate">
            {row.description || "-"}
          </div>
        </div>
      ),
    },
    {
      id: "indexing",
      header: "Indexing",
      accessorFn: (row) => (
        <StatusBadge
          status={row.is_noindex ? "warning" : "success"}
          label={row.is_noindex ? "No Index" : "Indexed"}
        />
      ),
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="SEO Settings"
        description="Configure page-level SEO metadata"
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
                <Plus className="h-4 w-4 mr-2" /> Add Page SEO
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Add"} SEO Settings
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Page Path</Label>
                  <Input
                    value={formData.page_path}
                    onChange={(e) =>
                      setFormData({ ...formData, page_path: e.target.value })
                    }
                    placeholder="/about"
                    required
                  />
                </div>
                <div>
                  <Label>Title (max 70 chars)</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    maxLength={70}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.title.length}/70
                  </p>
                </div>
                <div>
                  <Label>Description (max 160 chars)</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    maxLength={160}
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.description.length}/160
                  </p>
                </div>
                <div>
                  <Label>OG Title</Label>
                  <Input
                    value={formData.og_title}
                    onChange={(e) =>
                      setFormData({ ...formData, og_title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>OG Description</Label>
                  <Textarea
                    value={formData.og_description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        og_description: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_noindex}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_noindex: v })
                    }
                  />
                  <Label>No Index (hide from search engines)</Label>
                </div>
                <Button type="submit" className="w-full">
                  Save SEO Settings
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
        searchPlaceholder="Search paths or titles..."
        searchValue={search}
        onSearchChange={setSearch}
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
        emptyTitle="No SEO settings found"
        emptyDescription="Add SEO settings for your pages."
        emptyAction={
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Page SEO
          </Button>
        }
      />
    </AdminPageShell>
  );
}
