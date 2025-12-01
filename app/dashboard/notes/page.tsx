'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, StickyNote, BookOpen, Trash2, Edit2, ExternalLink, FolderOpen, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { logger } from '@/lib/logging';

interface NoteLesson {
  id: string;
  title: string;
  slug: string;
  module?: {
    id: string;
    title: string;
    course?: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface Note {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  lesson?: NoteLesson;
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

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Edit dialog state
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes(true);
  }, []);

  const fetchNotes = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/users/me/notes?limit=20&offset=${currentOffset}`);
      if (response.ok) {
        const data: NotesResponse = await response.json();
        if (reset) {
          setNotes(data.notes);
        } else {
          setNotes((prev) => [...prev, ...data.notes]);
        }
        setHasMore(data.pagination.hasMore);
        setOffset(currentOffset + data.notes.length);
      }
    } catch (error) {
      logger.error('Failed to fetch notes', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    setDeletingId(noteId);
    try {
      const response = await fetch(`/api/users/me/notes/${noteId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        toast.success('Note deleted');
      } else {
        toast.error('Failed to delete note');
      }
    } catch (error) {
      logger.error('Failed to delete note', error instanceof Error ? error : new Error(String(error)));
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleSave = async () => {
    if (!editingNote) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users/me/notes/${editingNote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });

      if (response.ok) {
        const data = await response.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === editingNote.id ? data.note : n))
        );
        setEditingNote(null);
        toast.success('Note updated');
      } else {
        toast.error('Failed to update note');
      }
    } catch (error) {
      logger.error('Failed to update note', error instanceof Error ? error : new Error(String(error)));
      toast.error('Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  // Group notes by course
  const groupedNotes = notes.reduce<Record<string, Note[]>>((acc, note) => {
    const courseId = note.lesson?.module?.course?.id || 'uncategorized';
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(note);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <StickyNote className="h-8 w-8 text-primary" />
          My Notes
        </h1>
        <p className="text-muted-foreground">
          Personal notes from your lessons
        </p>
      </div>

      {notes.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No notes yet</h2>
            <p className="text-muted-foreground mb-6">
              Take notes while learning to capture key insights
            </p>
            <Link href="/dashboard/student/courses">
              <Button>
                <BookOpen className="h-4 w-4 mr-2" />
                Browse Courses
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).map(([courseId, courseNotes]) => {
            const courseName = courseNotes[0]?.lesson?.module?.course?.title || 'Uncategorized';
            const courseSlug = courseNotes[0]?.lesson?.module?.course?.slug;

            return (
              <Card key={courseId} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{courseName}</CardTitle>
                      <CardDescription>
                        {courseNotes.length} note{courseNotes.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </div>
                    {courseSlug && (
                      <Link href={`/courses/${courseSlug}`}>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Course
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courseNotes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <StickyNote className="h-4 w-4 text-amber-500" />
                            <h3 className="font-medium">
                              {note.lesson?.title || 'Unknown Lesson'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(note)}
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(note.id)}
                              disabled={deletingId === note.id}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            >
                              {deletingId === note.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        {note.lesson?.module && (
                          <Badge variant="outline" className="text-xs mb-2">
                            {note.lesson.module.title}
                          </Badge>
                        )}
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-2">
                          {note.content}
                        </p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Last updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {hasMore && (
            <div className="text-center">
              <Button
                variant="outline"
                onClick={() => fetchNotes(false)}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Load More
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && setEditingNote(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
            <DialogDescription>
              {editingNote?.lesson?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Your note..."
              rows={6}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !editContent.trim()}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
