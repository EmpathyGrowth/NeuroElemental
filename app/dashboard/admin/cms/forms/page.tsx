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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { Eye, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ContactForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  submission_count?: number;
  new_submissions?: number;
}

export default function ContactFormsPage() {
  const [forms, setForms] = useState<ContactForm[]>([]);
  const [filteredData, setFilteredData] = useState<ContactForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    success_message: "Thank you for your message!",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (search) {
      const q = search.toLowerCase();
      setFilteredData(
        forms.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.slug.toLowerCase().includes(q) ||
            f.description?.toLowerCase().includes(q)
        )
      );
    } else {
      setFilteredData(forms);
    }
  }, [forms, search]);

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/admin/forms");
      const data = await res.json();
      setForms(data.forms || []);
    } catch (error) {
      logger.error(
        "Error fetching forms",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fields: [
            { name: "name", label: "Name", type: "text", required: true },
            { name: "email", label: "Email", type: "email", required: true },
            {
              name: "message",
              label: "Message",
              type: "textarea",
              required: true,
            },
          ],
        }),
      });
      toast({ title: "Form created" });
      setDialogOpen(false);
      setFormData({
        name: "",
        slug: "",
        description: "",
        success_message: "Thank you for your message!",
        is_active: true,
      });
      fetchForms();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create form",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form and all its submissions?")) return;
    try {
      await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
      toast({ title: "Form deleted" });
      fetchForms();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const columns: Column<ContactForm>[] = [
    {
      id: "name",
      header: "Form Name",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[200px]">
            {row.description || "No description"}
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "slug",
      header: "Slug",
      accessorKey: "slug",
      cell: (row) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">
          /api/forms/{row.slug}
        </code>
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
      id: "submissions",
      header: "Submissions",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {row.submission_count || 0}
          </span>
          {(row.new_submissions ?? 0) > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5">
              {row.new_submissions} new
            </Badge>
          )}
        </div>
      ),
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Contact Forms"
        description="Manage forms and view submissions"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" /> Create Form
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Contact Form</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Form Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                        slug: generateSlug(e.target.value),
                      })
                    }
                    placeholder="Contact Form"
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
                    pattern="[a-z0-9-]+"
                    placeholder="contact-form"
                    required
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Success Message</Label>
                  <Input
                    value={formData.success_message}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        success_message: e.target.value,
                      })
                    }
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
                  Create Form
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
        searchPlaceholder="Search forms..."
        searchValue={search}
        onSearchChange={setSearch}
        rowActions={(row) => (
          <RowActions>
            <RowActionItem asChild>
              <Link href={`/dashboard/admin/cms/forms/${row.id}`}>
                <Eye className="mr-2 h-4 w-4" /> View Submissions
              </Link>
            </RowActionItem>
            <RowActionItem
              onClick={() => handleDelete(row.id)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </RowActionItem>
          </RowActions>
        )}
        emptyTitle="No forms found"
        emptyDescription="Create a contact form to get started."
        emptyAction={
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Form
          </Button>
        }
      />
    </AdminPageShell>
  );
}
