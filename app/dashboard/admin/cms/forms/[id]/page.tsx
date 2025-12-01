"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/lib/logging";
import { ArrowLeft, Check, Eye, Loader2, Mail, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  status: "new" | "read" | "replied" | "archived";
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface ContactForm {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
}

export default function FormSubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;

  const [form, setForm] = useState<ContactForm | null>(null);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] =
    useState<FormSubmission | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [formId]);

  const fetchData = async () => {
    try {
      // Fetch form details
      const formRes = await fetch(`/api/admin/forms/${formId}`);
      const formData = await formRes.json();
      setForm(formData.form);

      // Fetch submissions
      const subsRes = await fetch(`/api/admin/forms/${formId}/submissions`);
      const subsData = await subsRes.json();
      setSubmissions(subsData.submissions || []);
    } catch (error) {
      logger.error(
        "Error fetching data",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (submissionId: string, status: string) => {
    try {
      await fetch(`/api/admin/forms/${formId}/submissions/${submissionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      toast({ title: "Status updated" });
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const deleteSubmission = async (submissionId: string) => {
    if (!confirm("Delete this submission?")) return;
    try {
      await fetch(`/api/admin/forms/${formId}/submissions/${submissionId}`, {
        method: "DELETE",
      });
      toast({ title: "Submission deleted" });
      setSelectedSubmission(null);
      fetchData();
    } catch {
      toast({ title: "Error", variant: "destructive" });
    }
  };

  const filteredSubmissions =
    statusFilter === "all"
      ? submissions
      : submissions.filter((s) => s.status === statusFilter);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      new: "default",
      read: "secondary",
      replied: "outline",
      archived: "outline",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Form not found</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/admin/cms/forms">Back to Forms</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/cms/forms">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{form.name}</h1>
          <p className="text-muted-foreground">
            {submissions.length} submissions • {form.slug}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Submissions</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No submissions yet</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell>
                      {new Date(submission.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {Object.entries(submission.data)
                        .slice(0, 2)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </TableCell>
                    <TableCell>{getStatusBadge(submission.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedSubmission(submission);
                            if (submission.status === "new") {
                              updateStatus(submission.id, "read");
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSubmission(submission.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Submission Detail Dialog */}
      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {new Date(selectedSubmission.created_at).toLocaleString()}
                </span>
                <Select
                  value={selectedSubmission.status}
                  onValueChange={(v) => updateStatus(selectedSubmission.id, v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key} className="border rounded-lg p-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {key}
                    </p>
                    <p className="whitespace-pre-wrap">{String(value)}</p>
                  </div>
                ))}
              </div>

              {selectedSubmission.ip_address && (
                <div className="text-xs text-muted-foreground border-t pt-3">
                  <p>IP: {selectedSubmission.ip_address}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    updateStatus(selectedSubmission.id, "archived")
                  }
                >
                  <X className="h-4 w-4 mr-2" />
                  Archive
                </Button>
                <Button
                  onClick={() => updateStatus(selectedSubmission.id, "replied")}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Mark Replied
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
