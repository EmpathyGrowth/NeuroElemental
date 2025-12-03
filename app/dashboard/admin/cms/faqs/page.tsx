"use client";

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
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
import DOMPurify from "dompurify";
import { Edit, GripVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { DragDropList, DragHandle, updateDisplayOrder } from "@/components/ui/drag-drop-list";
import { Card, CardContent } from "@/components/ui/card";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  display_order: number;
  is_published: boolean;
}

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [filteredData, setFilteredData] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    is_published: true,
  });
  const [reorderMode, setReorderMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFaqs();
  }, []);

  useEffect(() => {
    let result = faqs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q)
      );
    }

    if (categoryFilter) {
      result = result.filter((f) => f.category === categoryFilter);
    }

    setFilteredData(result);
  }, [faqs, search, categoryFilter]);

  const fetchFaqs = async () => {
    try {
      const res = await fetch("/api/admin/faqs");
      const data = await res.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      logger.error(
        "Error fetching FAQs",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFaq) {
        await fetch(`/api/admin/faqs/${editingFaq.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({ title: "FAQ updated" });
      } else {
        await fetch("/api/admin/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        toast({ title: "FAQ created" });
      }
      setDialogOpen(false);
      setEditingFaq(null);
      setFormData({
        question: "",
        answer: "",
        category: "general",
        is_published: true,
      });
      fetchFaqs();
    } catch {
      toast({
        title: "Error",
        description: "Failed to save FAQ",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      toast({ title: "FAQ deleted" });
      fetchFaqs();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete FAQ",
        variant: "destructive",
      });
    }
  };

  const openEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_published: faq.is_published,
    });
    setDialogOpen(true);
  };

  const handleReorder = async (reorderedFaqs: FAQ[]) => {
    // Update local state immediately
    const updated = updateDisplayOrder(reorderedFaqs);
    setFaqs(updated);
    setFilteredData(updated);

    // Persist to API
    try {
      await fetch("/api/admin/faqs/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updated.map((faq) => ({
            id: faq.id,
            display_order: faq.display_order,
          })),
        }),
      });
      toast({ title: "Order updated" });
    } catch {
      toast({
        title: "Error",
        description: "Failed to save order",
        variant: "destructive",
      });
      fetchFaqs(); // Revert on error
    }
  };

  const columns: Column<FAQ>[] = [
    {
      id: "question",
      header: "Question",
      accessorKey: "question",
      cell: (row) => (
        <div>
          <div className="font-medium">{row.question}</div>
          <div
            className="text-xs text-muted-foreground truncate max-w-[300px]"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(row.answer) }}
          />
        </div>
      ),
      sortable: true,
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: (row) => (
        <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium capitalize">
          {row.category}
        </span>
      ),
      sortable: true,
    },
    {
      id: "status",
      header: "Status",
      accessorFn: (row) => (
        <StatusBadge
          status={row.is_published ? "active" : "inactive"}
          label={row.is_published ? "Published" : "Draft"}
        />
      ),
      sortable: true,
    },
  ];

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="FAQs"
        description="Manage frequently asked questions"
        actions={
          <div className="flex gap-2">
            <Button
              variant={reorderMode ? "default" : "outline"}
              onClick={() => setReorderMode(!reorderMode)}
            >
              <GripVertical className="h-4 w-4 mr-2" />
              {reorderMode ? "Done Reordering" : "Reorder"}
            </Button>
            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) setEditingFaq(null);
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" /> Add FAQ
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingFaq ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Question</Label>
                  <Input
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Answer</Label>
                  <RichTextEditor
                    content={formData.answer}
                    onChange={(html) =>
                      setFormData({ ...formData, answer: html })
                    }
                    placeholder="Write the answer with rich formatting..."
                    className="min-h-[200px]"
                  />
                </div>
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
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="courses">Courses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(v) =>
                      setFormData({ ...formData, is_published: v })
                    }
                  />
                  <Label>Published</Label>
                </div>
                <Button type="submit" className="w-full">
                  {editingFaq ? "Update" : "Create"} FAQ
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        }
      />

      {reorderMode ? (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-4">
              Drag items to reorder. Click "Done Reordering" when finished.
            </p>
            <DragDropList
              items={faqs.sort((a, b) => a.display_order - b.display_order)}
              keyField="id"
              onReorder={handleReorder}
              renderItem={({ item, dragHandleProps }) => (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
                  <DragHandle {...dragHandleProps} />
                  <div className="flex-1">
                    <div className="font-medium">{item.question}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {item.category} • {item.is_published ? "Published" : "Draft"}
                    </div>
                  </div>
                </div>
              )}
            />
          </CardContent>
        </Card>
      ) : (
        <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        loading={loading}
        searchable
        searchPlaceholder="Search FAQs..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            id: "category",
            label: "Category",
            type: "select",
            options: [
              { label: "General", value: "general" },
              { label: "Account", value: "account" },
              { label: "Billing", value: "billing" },
              { label: "Assessment", value: "assessment" },
              { label: "Courses", value: "courses" },
            ],
          },
        ]}
        filterValues={{ category: categoryFilter || "" }}
        onFilterChange={(_, val) => setCategoryFilter(val as string)}
        onClearFilters={() => setCategoryFilter(null)}
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
        emptyTitle="No FAQs found"
        emptyDescription="Add your first FAQ to get started."
        emptyAction={
          <Button variant="outline" onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add FAQ
          </Button>
        }
      />
      )}
    </AdminPageShell>
  );
}
