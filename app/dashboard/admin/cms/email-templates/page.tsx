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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface EmailTemplate {
  id: string;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content: string | null;
  variables: string[];
  category: string;
  is_active: boolean;
  updated_at: string;
}

const DEFAULT_TEMPLATES = [
  { name: "Welcome Email", slug: "welcome", category: "transactional" },
  { name: "Password Reset", slug: "password-reset", category: "system" },
  {
    name: "Course Enrollment",
    slug: "course-enrollment",
    category: "transactional",
  },
  { name: "Event Reminder", slug: "event-reminder", category: "notification" },
  { name: "Newsletter", slug: "newsletter", category: "marketing" },
];

export default function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredData, setFilteredData] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    html_content: "",
    text_content: "",
    variables: "",
    category: "transactional",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    let result = templates;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter((t) => t.category === categoryFilter);
    }

    setFilteredData(result);
  }, [templates, search, categoryFilter]);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/admin/email-templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (error) {
      logger.error(
        "Error fetching templates",
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
        ? `/api/admin/email-templates/${editingId}`
        : "/api/admin/email-templates";

      const payload = {
        ...formData,
        variables: formData.variables
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");

      toast({ title: editingId ? "Template updated" : "Template created" });
      setDialogOpen(false);
      resetForm();
      fetchTemplates();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save template",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await fetch(`/api/admin/email-templates/${id}`, { method: "DELETE" });
      toast({ title: "Template deleted" });
      fetchTemplates();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const handleDuplicate = async (template: EmailTemplate) => {
    try {
      await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${template.name} (Copy)`,
          slug: `${template.slug}-copy-${Date.now()}`,
          subject: template.subject,
          html_content: template.html_content,
          text_content: template.text_content,
          variables: template.variables,
          category: template.category,
          is_active: false,
        }),
      });
      toast({ title: "Template duplicated" });
      fetchTemplates();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const openEdit = (item: EmailTemplate) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      slug: item.slug,
      subject: item.subject,
      html_content: item.html_content,
      text_content: item.text_content || "",
      variables: item.variables?.join(", ") || "",
      category: item.category,
      is_active: item.is_active,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      subject: "",
      html_content: "",
      text_content: "",
      variables: "",
      category: "transactional",
      is_active: true,
    });
  };

  const columns: Column<EmailTemplate>[] = [
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
      id: "subject",
      header: "Subject",
      accessorKey: "subject",
      cell: (row) => (
        <div className="truncate max-w-[200px]" title={row.subject}>
          {row.subject}
        </div>
      ),
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <Badge variant="outline" className="capitalize">
          {row.category}
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
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Email Templates"
        description="Customize email templates for notifications and communications"
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> New Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit" : "Create"} Email Template
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Welcome Email"
                      required
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, "-"),
                        })
                      }
                      placeholder="welcome-email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Subject</Label>
                  <Input
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                    placeholder="Welcome to {{site_name}}!"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use {"{{variable}}"} for dynamic content
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(v) =>
                        setFormData({ ...formData, category: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="transactional">
                          Transactional
                        </SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="notification">
                          Notification
                        </SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Variables (comma-separated)</Label>
                    <Input
                      value={formData.variables}
                      onChange={(e) =>
                        setFormData({ ...formData, variables: e.target.value })
                      }
                      placeholder="name, email, link"
                    />
                  </div>
                </div>
                <div>
                  <Label>HTML Content</Label>
                  <Textarea
                    value={formData.html_content}
                    onChange={(e) =>
                      setFormData({ ...formData, html_content: e.target.value })
                    }
                    rows={10}
                    className="font-mono text-sm"
                    placeholder="<h1>Welcome, {{name}}!</h1>"
                    required
                  />
                </div>
                <div>
                  <Label>Plain Text Content (optional)</Label>
                  <Textarea
                    value={formData.text_content}
                    onChange={(e) =>
                      setFormData({ ...formData, text_content: e.target.value })
                    }
                    rows={4}
                    className="font-mono text-sm"
                    placeholder="Welcome, {{name}}!"
                  />
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
                  {editingId ? "Update" : "Create"} Template
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
        searchPlaceholder="Search templates..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "Transactional", value: "transactional" },
              { label: "Marketing", value: "marketing" },
              { label: "Notification", value: "notification" },
              { label: "System", value: "system" },
            ],
          },
        ]}
        filterValues={{ category: categoryFilter || "" }}
        onFilterChange={(_, val) => setCategoryFilter(val as string)}
        onClearFilters={() => setCategoryFilter(null)}
        rowActions={(row) => (
          <RowActions>
            <RowActionItem onClick={() => handleDuplicate(row)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </RowActionItem>
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
        emptyTitle="No email templates found"
        emptyDescription="Create templates for your email communications."
        emptyAction={
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {DEFAULT_TEMPLATES.map((t) => (
              <Button
                key={t.slug}
                variant="outline"
                size="sm"
                onClick={() => {
                  setFormData({
                    ...formData,
                    name: t.name,
                    slug: t.slug,
                    category: t.category,
                  });
                  setDialogOpen(true);
                }}
              >
                + {t.name}
              </Button>
            ))}
          </div>
        }
      />
    </AdminPageShell>
  );
}
