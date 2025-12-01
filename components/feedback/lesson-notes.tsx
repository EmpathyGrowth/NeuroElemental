"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { logger } from "@/lib/logging";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Plus, Save, StickyNote, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface Note {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface NotesResponse {
  notes: Note[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface LessonNotesProps {
  lessonId: string;
  className?: string;
}

export function LessonNotes({ lessonId, className = "" }: LessonNotesProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const response = await fetch(`/api/users/me/notes?lesson_id=${lessonId}`);
      if (response.ok) {
        const data: NotesResponse = await response.json();
        setNotes(data.notes);
      }
    } catch (error) {
      logger.error(
        "Failed to fetch notes",
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreate = async () => {
    if (!newContent.trim()) return;

    setSaving(true);
    try {
      const response = await fetch("/api/users/me/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId,
          content: newContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => [data.note, ...prev]);
        setNewContent("");
        setShowForm(false);
        toast.success("Note saved");
      } else {
        toast.error("Failed to save note");
      }
    } catch (error) {
      logger.error(
        "Failed to create note",
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (noteId: string) => {
    if (!editContent.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users/me/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) => prev.map((n) => (n.id === noteId ? data.note : n)));
        setEditingId(null);
        toast.success("Note updated");
      } else {
        toast.error("Failed to update note");
      }
    } catch (error) {
      logger.error(
        "Failed to update note",
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      const response = await fetch(`/api/users/me/notes/${noteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success("Note deleted");
      } else {
        toast.error("Failed to delete note");
      }
    } catch (error) {
      logger.error(
        "Failed to delete note",
        error instanceof Error ? error : new Error(String(error))
      );
      toast.error("Something went wrong");
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditContent("");
  };

  if (loading) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-500" />
              Notes
            </CardTitle>
            <CardDescription>
              {notes.length > 0
                ? `${notes.length} note${notes.length !== 1 ? "s" : ""}`
                : "Take notes as you learn"}
            </CardDescription>
          </div>
          {!showForm && (
            <Button size="sm" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* New Note Form */}
        {showForm && (
          <div className="mb-4 p-4 rounded-lg bg-card/50 border border-primary/50">
            <Textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="Write your note..."
              rows={3}
              className="mb-3 resize-none"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={saving || !newContent.trim()}
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Notes List */}
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="p-3 rounded-lg bg-card/50 border border-border"
              >
                {editingId === note.id ? (
                  <div>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="mb-2 resize-none"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdate(note.id)}
                        disabled={saving || !editContent.trim()}
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm whitespace-pre-wrap">
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.updated_at), {
                          addSuffix: true,
                        })}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => startEditing(note)}
                        >
                          <StickyNote className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(note.id)}
                          disabled={deletingId === note.id}
                        >
                          {deletingId === note.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No notes yet. Click &quot;Add Note&quot; to get started.
            </p>
          )
        )}
      </CardContent>
    </Card>
  );
}
