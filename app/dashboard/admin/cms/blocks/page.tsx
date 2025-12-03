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
  DialogDescription,
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
import {
  BlockContentEditor,
  BlockType,
} from "@/components/cms/block-content-editor";
import { logger } from "@/lib/logging";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ContentBlock {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  block_type: string;
  content: Record<string, unknown>;
  is_global: boolean;
  is_active: boolean;
  usage_count: number;
}

const blockTypes = [
  "text",
  "html",
  "cta",
  "feature",
  "testimonial",
  "stats",
  "gallery",
  "video",
  "code",
  "custom",
];

export default function ContentBlocksPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [filteredData, setFilteredData] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    block_type: "text" as BlockType,
    content: {} as Record<string, unknown>,
    is_global: false,
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    let result = blocks;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.slug.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q)
      );
    }

    if (typeFilter) {
      result = result.filter((b) => b.block_type === typeFilter);
    }

    setFilteredData(result);
  }, [blocks, search, typeFilter]);

  const fetchBlocks = async () => {
    try {
      const res = await fetch("/api/admin/blocks");
      const data = await res.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      logger.error(
        "Error fetching blocks",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBlock) {
        await fetch(`/api/admin/blocks/${editingBlock.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({ title: "Block updated" });
      } else {
        await fetch("/api/admin/blocks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({ title: "Block created" });
      }
      setDialogOpen(false);
      setEditingBlock(null);
      setFormData({
        name: "",
        slug: "",
        description: "",
        block_type: "text",
        content: {},
        is_global: false,
        is_active: true,
      });
      fetchBlocks();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save block",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this block?")) return;
    try {
      await fetch(`/api/admin/blocks/${id}`, { method: "DELETE" });
      toast({ title: "Block deleted" });
      fetchBlocks();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const openEdit = (block: ContentBlock) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      slug: block.slug,
      description: block.description || "",
      block_type: block.block_type as BlockType,
      content: block.content,
      is_global: block.is_global,
      is_active: block.is_active,
    });
    setDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const columns: Column<ContentBlock>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <code className="text-xs text-muted-foreground bg-muted px-1 rounded">
            {row.slug}
          </code>
        </div>
      ),
      sortable: true,
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "block_type",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.block_type}
        </Badge>
      ),
      sortable: true,
    },
    {
      id: "scope",
      header: "Scope",
      accessorFn: (row) => (
        <Badge variant={row.is_global ? "secondary" : "outline"}>
          {row.is_global ? "Global" : "Page"}
        </Badge>
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
      id: "usage",
      header: "Usage",
      accessorKey: "usage_count",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.usage_count} uses
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Content Blocks"
        description="Reusable content widgets and components"
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditingBlock(null);
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Block
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBlock ? "Edit Block" : "Create Content Block"}
                </DialogTitle>
                <DialogDescription>
                  {editingBlock
                    ? "Update the block settings and content below."
                    : "Create a new reusable content block for your pages."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    pattern="^[a-z0-9\-]+$"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Block Type</Label>
                  <Select
                    value={formData.block_type}
                    onValueChange={(v) =>
                      setFormData({ ...formData, block_type: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {blockTypes.map((type) => (
                        <SelectItem
                          key={type}
                          value={type}
                          className="capitalize"
                        >
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content</Label>
                  <BlockContentEditor
                    blockType={formData.block_type}
                    content={formData.content}
                    onChange={(content) =>
                      setFormData({ ...formData, content })
                    }
                  />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.is_global}
                      onCheckedChange={(v) =>
                        setFormData({ ...formData, is_global: v })
                      }
                    />
                    <Label>Global</Label>
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
                </div>
                <Button type="submit" className="w-full">
                  {editingBlock ? "Update Block" : "Create Block"}
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
        searchPlaceholder="Search blocks..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: "type",
            label: "Type",
            type: "select",
            options: blockTypes.map((t) => ({
              label: t.charAt(0).toUpperCase() + t.slice(1),
              value: t,
            })),
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
        emptyTitle="No content blocks found"
        emptyDescription="Create reusable blocks for your pages."
        emptyAction={
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Block
          </Button>
        }
      />
    </AdminPageShell>
  );
}
