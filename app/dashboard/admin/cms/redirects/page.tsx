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
import { ArrowRight, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface Redirect {
  id: string;
  source_path: string;
  destination_url: string;
  redirect_type: number;
  is_active: boolean;
  hit_count: number;
}

export default function RedirectsPage() {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [filteredData, setFilteredData] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    source_path: "",
    destination_url: "",
    redirect_type: "301",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchRedirects();
  }, []);

  useEffect(() => {
    let result = redirects;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.source_path.toLowerCase().includes(q) ||
          r.destination_url.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter((r) => r.redirect_type.toString() === typeFilter);
    }

    setFilteredData(result);
  }, [redirects, search, typeFilter]);

  const fetchRedirects = async () => {
    try {
      const res = await fetch("/api/admin/redirects");
      const data = await res.json();
      setRedirects(data.redirects || []);
    } catch (error) {
      logger.error(
        "Error fetching redirects",
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
        ? `/api/admin/redirects/${editingId}`
        : "/api/admin/redirects";

      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          redirect_type: parseInt(formData.redirect_type),
        }),
      });
      toast({ title: editingId ? "Redirect updated" : "Redirect created" });
      setDialogOpen(false);
      setEditingId(null);
      setFormData({
        source_path: "",
        destination_url: "",
        redirect_type: "301",
        is_active: true,
      });
      fetchRedirects();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save redirect",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    try {
      await fetch(`/api/admin/redirects/${id}`, { method: "DELETE" });
      toast({ title: "Redirect deleted" });
      fetchRedirects();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const openEdit = (item: Redirect) => {
    setEditingId(item.id);
    setFormData({
      source_path: item.source_path,
      destination_url: item.destination_url,
      redirect_type: item.redirect_type.toString(),
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const columns: Column<Redirect>[] = [
    {
      id: "path",
      header: "Path",
      accessorKey: "source_path",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
            {row.source_path}
          </code>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-[200px]">
            {row.destination_url}
          </code>
        </div>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "redirect_type",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium">
          {row.redirect_type}
        </span>
      ),
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
      id: "hits",
      header: "Hits",
      accessorKey: "hit_count",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.hit_count}</span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="URL Redirects"
        description="Manage URL redirects for SEO"
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
                <Plus className="h-4 w-4 mr-2" /> Add Redirect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit" : "Add"} Redirect</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Source Path</Label>
                  <Input
                    value={formData.source_path}
                    onChange={(e) =>
                      setFormData({ ...formData, source_path: e.target.value })
                    }
                    placeholder="/old-page"
                    required
                  />
                </div>
                <div>
                  <Label>Destination URL</Label>
                  <Input
                    value={formData.destination_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        destination_url: e.target.value,
                      })
                    }
                    placeholder="/new-page or https://..."
                    required
                  />
                </div>
                <div>
                  <Label>Redirect Type</Label>
                  <Select
                    value={formData.redirect_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, redirect_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301 - Permanent</SelectItem>
                      <SelectItem value="302">302 - Temporary</SelectItem>
                      <SelectItem value="307">
                        307 - Temporary (preserve method)
                      </SelectItem>
                      <SelectItem value="308">
                        308 - Permanent (preserve method)
                      </SelectItem>
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
                  {editingId ? "Update" : "Create"} Redirect
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
        searchPlaceholder="Search paths..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: "type",
            label: "Type",
            type: "select",
            options: [
              { label: "301", value: "301" },
              { label: "302", value: "302" },
              { label: "307", value: "307" },
              { label: "308", value: "308" },
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
        emptyTitle="No redirects found"
        emptyDescription="Create a redirect to manage traffic flow."
        emptyAction={
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Redirect
          </Button>
        }
      />
    </AdminPageShell>
  );
}
