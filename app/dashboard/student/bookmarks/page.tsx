'use client';

/**
 * Student Bookmarks & Notes Page
 * View and manage saved lessons and notes
 */

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Bookmark,
  BookOpen,
  FileText,
  Trash2,
  ExternalLink,
  Search,
  Calendar,
  FolderOpen,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { toast } from 'sonner';
import { Pagination, PaginationInfo } from '@/components/ui/pagination';

const PAGE_SIZE = 10;

interface BookmarkLesson {
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

interface Bookmark {
  id: string;
  user_id: string;
  lesson_id: string;
  note: string | null;
  created_at: string;
  lesson?: BookmarkLesson;
}

interface Note {
  id: string;
  user_id: string;
  lesson_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  lesson?: BookmarkLesson;
}

export default function StudentBookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentBookmarkPage, setCurrentBookmarkPage] = useState(1);
  const [currentNotePage, setCurrentNotePage] = useState(1);

  useEffect(() => {
    fetchBookmarks();
    fetchNotes();
  }, []);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentBookmarkPage(1);
    setCurrentNotePage(1);
  }, [searchQuery]);

  const fetchBookmarks = async () => {
    try {
      const response = await fetch('/api/users/me/bookmarks?limit=100');
      if (response.ok) {
        const data = await response.json();
        setBookmarks(data.bookmarks || []);
      }
    } catch (error) {
      logger.error('Error fetching bookmarks:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingBookmarks(false);
    }
  };

  const fetchNotes = async () => {
    try {
      const response = await fetch('/api/users/me/notes?limit=100');
      if (response.ok) {
        const data = await response.json();
        setNotes(data.notes || []);
      }
    } catch (error) {
      logger.error('Error fetching notes:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingNotes(false);
    }
  };

  const handleRemoveBookmark = async (lessonId: string) => {
    try {
      const response = await fetch(`/api/users/me/bookmarks?lesson_id=${lessonId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setBookmarks((prev) => prev.filter((b) => b.lesson_id !== lessonId));
        toast.success('Bookmark removed');
      } else {
        toast.error('Failed to remove bookmark');
      }
    } catch (error) {
      logger.error('Error removing bookmark:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to remove bookmark');
    }
  };

  const handleDeleteNote = async (noteId: string) => {
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
      logger.error('Error deleting note:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to delete note');
    }
  };

  // Filter and paginate bookmarks
  const filteredBookmarks = useMemo(() => {
    if (!searchQuery.trim()) return bookmarks;
    const query = searchQuery.toLowerCase();
    return bookmarks.filter(
      (b) =>
        b.lesson?.title.toLowerCase().includes(query) ||
        b.lesson?.module?.title.toLowerCase().includes(query) ||
        b.lesson?.module?.course?.title.toLowerCase().includes(query) ||
        b.note?.toLowerCase().includes(query)
    );
  }, [bookmarks, searchQuery]);

  const totalBookmarkPages = Math.ceil(filteredBookmarks.length / PAGE_SIZE);
  const paginatedBookmarks = useMemo(() => {
    const start = (currentBookmarkPage - 1) * PAGE_SIZE;
    return filteredBookmarks.slice(start, start + PAGE_SIZE);
  }, [filteredBookmarks, currentBookmarkPage]);

  // Filter and paginate notes
  const filteredNotes = useMemo(() => {
    if (!searchQuery.trim()) return notes;
    const query = searchQuery.toLowerCase();
    return notes.filter(
      (n) =>
        n.lesson?.title.toLowerCase().includes(query) ||
        n.lesson?.module?.title.toLowerCase().includes(query) ||
        n.lesson?.module?.course?.title.toLowerCase().includes(query) ||
        n.content.toLowerCase().includes(query)
    );
  }, [notes, searchQuery]);

  const totalNotePages = Math.ceil(filteredNotes.length / PAGE_SIZE);
  const paginatedNotes = useMemo(() => {
    const start = (currentNotePage - 1) * PAGE_SIZE;
    return filteredNotes.slice(start, start + PAGE_SIZE);
  }, [filteredNotes, currentNotePage]);

  const getLessonUrl = (bookmark: Bookmark | Note) => {
    if (bookmark.lesson?.module?.course?.slug) {
      return `/courses/${bookmark.lesson.module.course.slug}/learn?lesson=${bookmark.lesson_id}`;
    }
    return '#';
  };

  const loading = loadingBookmarks || loadingNotes;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-5xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Bookmarks & Notes</h1>
        <p className="text-muted-foreground">
          Your saved lessons and study notes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bookmarked Lessons</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookmarks.length}</div>
            <p className="text-xs text-muted-foreground">Saved for later</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Notes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notes.length}</div>
            <p className="text-xs text-muted-foreground">Personal annotations</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookmarks and notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search bookmarks and notes"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookmarks" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookmarks" className="flex items-center gap-2">
            <Bookmark className="h-4 w-4" />
            Bookmarks ({filteredBookmarks.length})
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Notes ({filteredNotes.length})
          </TabsTrigger>
        </TabsList>

        {/* Bookmarks Tab */}
        <TabsContent value="bookmarks">
          {filteredBookmarks.length > 0 ? (
            <div className="space-y-4">
              {paginatedBookmarks.map((bookmark) => (
                <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Bookmark className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold truncate">
                            {bookmark.lesson?.title || 'Untitled Lesson'}
                          </h3>
                        </div>

                        {bookmark.lesson?.module?.course && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <FolderOpen className="h-3 w-3" />
                            <span className="truncate">
                              {bookmark.lesson.module.course.title}
                              {bookmark.lesson.module?.title && ` / ${bookmark.lesson.module.title}`}
                            </span>
                          </div>
                        )}

                        {bookmark.note && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                            {bookmark.note}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Saved {formatDate(bookmark.created_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={getLessonUrl(bookmark)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveBookmark(bookmark.lesson_id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove bookmark"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {filteredBookmarks.length > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <PaginationInfo
                    currentPage={currentBookmarkPage}
                    pageSize={PAGE_SIZE}
                    totalItems={filteredBookmarks.length}
                  />
                  <Pagination
                    currentPage={currentBookmarkPage}
                    totalPages={totalBookmarkPages}
                    onPageChange={setCurrentBookmarkPage}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <Bookmark className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No bookmarks found' : 'No Bookmarks Yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Bookmark lessons while studying to save them for later'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/dashboard/student/courses">Browse Courses</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes">
          {filteredNotes.length > 0 ? (
            <div className="space-y-4">
              {paginatedNotes.map((note) => (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <h3 className="font-semibold truncate">
                            {note.lesson?.title || 'Untitled Lesson'}
                          </h3>
                        </div>

                        {note.lesson?.module?.course && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <FolderOpen className="h-3 w-3" />
                            <span className="truncate">
                              {note.lesson.module.course.title}
                              {note.lesson.module?.title && ` / ${note.lesson.module.title}`}
                            </span>
                          </div>
                        )}

                        <div className="bg-muted/50 rounded-lg p-4 mt-3">
                          <p className="text-sm whitespace-pre-wrap line-clamp-4">
                            {note.content}
                          </p>
                        </div>

                        <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created {formatDate(note.created_at)}
                          </span>
                          {note.updated_at !== note.created_at && (
                            <span>Updated {formatDate(note.updated_at)}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={getLessonUrl(note)}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteNote(note.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {filteredNotes.length > PAGE_SIZE && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <PaginationInfo
                    currentPage={currentNotePage}
                    pageSize={PAGE_SIZE}
                    totalItems={filteredNotes.length}
                  />
                  <Pagination
                    currentPage={currentNotePage}
                    totalPages={totalNotePages}
                    onPageChange={setCurrentNotePage}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-16 text-center">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">
                  {searchQuery ? 'No notes found' : 'No Notes Yet'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'Take notes while studying to capture key insights'}
                </p>
                {!searchQuery && (
                  <Button asChild>
                    <Link href="/dashboard/student/courses">Start Learning</Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tips Card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Study Tips
          </CardTitle>
          <CardDescription>Make the most of bookmarks and notes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Using Bookmarks</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Save lessons you want to revisit</li>
                <li>• Add optional notes when bookmarking</li>
                <li>• Click the bookmark icon in any lesson</li>
                <li>• Access all bookmarks from this page</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Taking Notes</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Jot down key concepts as you learn</li>
                <li>• Notes are saved per lesson</li>
                <li>• Review notes before assessments</li>
                <li>• Edit notes anytime from the lesson</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
