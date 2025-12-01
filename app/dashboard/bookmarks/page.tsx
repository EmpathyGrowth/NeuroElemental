'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Bookmark, BookOpen, Trash2, ExternalLink, FolderOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { logger } from '@/lib/logging';

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

interface BookmarksResponse {
  bookmarks: Bookmark[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchBookmarks(true);
  }, []);

  const fetchBookmarks = async (reset = false) => {
    const currentOffset = reset ? 0 : offset;
    if (reset) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await fetch(`/api/users/me/bookmarks?limit=20&offset=${currentOffset}`);
      if (response.ok) {
        const data: BookmarksResponse = await response.json();
        if (reset) {
          setBookmarks(data.bookmarks);
        } else {
          setBookmarks((prev) => [...prev, ...data.bookmarks]);
        }
        setHasMore(data.pagination.hasMore);
        setOffset(currentOffset + data.bookmarks.length);
      }
    } catch (error) {
      logger.error('Failed to fetch bookmarks', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleDelete = async (lessonId: string) => {
    setDeletingId(lessonId);
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
      logger.error('Failed to delete bookmark', error instanceof Error ? error : new Error(String(error)));
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  // Group bookmarks by course
  const groupedBookmarks = bookmarks.reduce<Record<string, Bookmark[]>>((acc, bookmark) => {
    const courseId = bookmark.lesson?.module?.course?.id || 'uncategorized';
    if (!acc[courseId]) {
      acc[courseId] = [];
    }
    acc[courseId].push(bookmark);
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
          <Bookmark className="h-8 w-8 text-primary" />
          My Bookmarks
        </h1>
        <p className="text-muted-foreground">
          Save lessons for quick access later
        </p>
      </div>

      {bookmarks.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-16 text-center">
            <FolderOpen className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No bookmarks yet</h2>
            <p className="text-muted-foreground mb-6">
              Bookmark lessons while learning to save them for quick access
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
          {Object.entries(groupedBookmarks).map(([courseId, courseBookmarks]) => {
            const courseName = courseBookmarks[0]?.lesson?.module?.course?.title || 'Uncategorized';
            const courseSlug = courseBookmarks[0]?.lesson?.module?.course?.slug;

            return (
              <Card key={courseId} className="glass-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{courseName}</CardTitle>
                      <CardDescription>
                        {courseBookmarks.length} bookmarked lesson{courseBookmarks.length !== 1 ? 's' : ''}
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
                  <div className="space-y-3">
                    {courseBookmarks.map((bookmark) => (
                      <div
                        key={bookmark.id}
                        className="flex items-start justify-between p-4 rounded-lg bg-card/50 border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Bookmark className="h-4 w-4 text-primary fill-primary" />
                            <h3 className="font-medium">
                              {bookmark.lesson?.title || 'Unknown Lesson'}
                            </h3>
                          </div>
                          {bookmark.lesson?.module && (
                            <Badge variant="outline" className="text-xs mb-2">
                              {bookmark.lesson.module.title}
                            </Badge>
                          )}
                          {bookmark.note && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {bookmark.note}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2">
                            Bookmarked {formatDistanceToNow(new Date(bookmark.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(bookmark.lesson_id)}
                            disabled={deletingId === bookmark.lesson_id}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            {deletingId === bookmark.lesson_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
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
                onClick={() => fetchBookmarks(false)}
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
    </div>
  );
}
