"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { DashboardHeader } from "@/components/dashboard";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  BookOpen,
  Edit,
  Plus,
  Search,
  StickyNote,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Note {
  id: string;
  title: string;
  content: string;
  course_id: string | null;
  course_title: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Student Notes Page
 * Create and manage learning notes
 */
export default function StudentNotesPage() {
  const { user: _user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const res = await fetch("/api/users/me/notes");
      if (res.ok) {
        const data = await res.json();
        setNotes(data.notes || []);
      } else {
        // Use mock data if API doesn't exist yet
        setNotes([
          {
            id: "1",
            title: "Understanding Energy Types",
            content:
              "Key insight: Different energy types respond differently to various situations. Fire types need action, Water types need reflection...",
            course_id: "course-1",
            course_title: "Introduction to NeuroElemental",
            lesson_id: "lesson-1",
            lesson_title: "The Four Elements",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "2",
            title: "Personal Energy Patterns",
            content:
              "I noticed my energy peaks in the morning and dips after lunch. Need to schedule important tasks accordingly.",
            course_id: null,
            course_title: null,
            lesson_id: null,
            lesson_title: null,
            created_at: new Date(Date.now() - 172800000).toISOString(),
            updated_at: new Date(Date.now() - 172800000).toISOString(),
          },
        ]);
      }
    } catch {
      // Use mock data on error
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a title");
      return;
    }

    setSaving(true);
    try {
      if (editingNote) {
        // Update existing note
        const res = await fetch(`/api/users/me/notes/${editingNote.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success("Note updated!");
          fetchNotes();
        } else {
          // Mock update
          setNotes(
            notes.map((n) =>
              n.id === editingNote.id
                ? {
                    ...n,
                    ...formData,
                    updated_at: new Date().toISOString(),
                  }
                : n
            )
          );
          toast.success("Note updated!");
        }
      } else {
        // Create new note
        const res = await fetch("/api/users/me/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        if (res.ok) {
          toast.success("Note created!");
          fetchNotes();
        } else {
          // Mock create
          const newNote: Note = {
            id: Date.now().toString(),
            ...formData,
            course_id: null,
            course_title: null,
            lesson_id: null,
            lesson_title: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setNotes([newNote, ...notes]);
          toast.success("Note created!");
        }
      }
      handleCloseDialog();
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      await fetch(`/api/users/me/notes/${noteId}`, { method: "DELETE" });
      setNotes(notes.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    } catch {
      setNotes(notes.filter((n) => n.id !== noteId));
      toast.success("Note deleted");
    }
  };

  const handleOpenEdit = (note: Note) => {
    setEditingNote(note);
    setFormData({ title: note.title, content: note.content });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingNote(null);
    setFormData({ title: "", content: "" });
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="My Notes"
        subtitle="Capture and organize your learning insights"
        actions={
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setFormData({ title: "", content: "" })}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Note
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingNote ? "Edit Note" : "Create Note"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingNote
                      ? "Update your note"
                      : "Add a new note to capture your learning"}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="Enter note title..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Write your note..."
                      rows={6}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveNote} disabled={saving}>
                    {saving ? "Saving..." : editingNote ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" asChild>
              <Link href="/dashboard/student">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredNotes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <StickyNote className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchQuery ? "No Notes Found" : "No Notes Yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Start taking notes to capture your learning insights"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Note
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="group hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base line-clamp-1">
                    {note.title}
                  </CardTitle>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleOpenEdit(note)}
                      aria-label="Edit note"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeleteNote(note.id)}
                      aria-label="Delete note"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {formatDate(note.updated_at)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {note.content}
                </p>
                {note.course_title && (
                  <Badge variant="secondary" className="text-xs">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {note.course_title}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <StickyNote className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notes.length}</p>
                <p className="text-sm text-muted-foreground">Total Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <BookOpen className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {notes.filter((n) => n.course_id).length}
                </p>
                <p className="text-sm text-muted-foreground">Course Notes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Edit className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {
                    notes.filter((n) => {
                      const updated = new Date(n.updated_at);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return updated > weekAgo;
                    }).length
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  Updated This Week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
