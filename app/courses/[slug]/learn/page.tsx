'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  Video
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logging';

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  hasAccess: boolean;
  isCompleted: boolean;
}

export default function CourseLearnPage({ params }: { params: { slug: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    fetchCourseAndLessons();
  }, [params.slug]);

  const fetchCourseAndLessons = async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses?slug=${params.slug}`);
      const courseData = await courseRes.json();

      if (!courseData.courses || courseData.courses.length === 0) {
        router.push('/courses');
        return;
      }

      const course = courseData.courses[0];
      setCourse(course);

      // Fetch lessons
      const lessonsRes = await fetch(`/api/courses/${course.id}/lessons`);
      const lessonsData = await lessonsRes.json();

      setLessons(lessonsData.lessons || []);

      // Set first accessible lesson as current
      const firstAccessible = lessonsData.lessons?.find((l: Lesson) =>
        l.hasAccess && !l.isCompleted
      ) || lessonsData.lessons?.[0];

      setCurrentLesson(firstAccessible);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error fetching course:', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson || !user) return;

    setCompleting(true);
    try {
      const res = await fetch(`/api/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
      });

      const data = await res.json();

      if (data.completed) {
        // Update lesson state
        setLessons(prev => prev.map(l =>
          l.id === currentLesson.id ? { ...l, isCompleted: true } : l
        ));

        // Move to next lesson or show completion
        if (data.courseCompleted) {
          alert(`Congratulations! You've completed the course. Certificate: ${data.certificateNumber}`);
          router.push('/dashboard/student/certificates');
        } else {
          const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
          if (currentIndex < lessons.length - 1) {
            setCurrentLesson(lessons[currentIndex + 1]);
          }
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error completing lesson:', err as Error);
    } finally {
      setCompleting(false);
    }
  };

  const progress = lessons.length > 0
    ? (lessons.filter(l => l.isCompleted).length / lessons.length) * 100
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{course?.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <Progress value={progress} className="w-48" />
                <span className="text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push(`/courses/${params.slug}`)}>
              Exit Course
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson List */}
          <div className="lg:col-span-1">
            <Card className="p-4">
              <h2 className="font-semibold mb-4">Course Content</h2>
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => lesson.hasAccess && setCurrentLesson(lesson)}
                    disabled={!lesson.hasAccess}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      "flex items-center justify-between",
                      currentLesson?.id === lesson.id
                        ? "bg-primary text-primary-foreground"
                        : lesson.hasAccess
                        ? "hover:bg-muted"
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {lesson.isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : lesson.hasAccess ? (
                          <PlayCircle className="w-5 h-5" />
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {index + 1}. {lesson.title}
                        </p>
                        <p className="text-xs opacity-75">
                          {lesson.duration_minutes} min
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {currentLesson ? (
              <Card className="p-8">
                {/* Lesson Header */}
                <div className="mb-6">
                  <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                  <p className="text-muted-foreground">{currentLesson.description}</p>
                  <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {currentLesson.duration_minutes} minutes
                    </span>
                    <span className="flex items-center gap-1">
                      {currentLesson.video_url ? (
                        <>
                          <Video className="w-4 h-4" />
                          Video Lesson
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          Text Lesson
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Video Player */}
                {currentLesson.video_url && (
                  <div className="mb-8 aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={currentLesson.video_url}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {/* Lesson Content */}
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }} />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                      if (currentIndex > 0) {
                        setCurrentLesson(lessons[currentIndex - 1]);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === currentLesson.id) === 0}
                  >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>

                  {!currentLesson.isCompleted && user ? (
                    <Button
                      onClick={handleCompleteLesson}
                      disabled={completing}
                    >
                      {completing ? 'Marking Complete...' : 'Mark as Complete'}
                    </Button>
                  ) : (
                    <span className="text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      Completed
                    </span>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                      if (currentIndex < lessons.length - 1) {
                        setCurrentLesson(lessons[currentIndex + 1]);
                      }
                    }}
                    disabled={lessons.findIndex(l => l.id === currentLesson.id) === lessons.length - 1}
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Select a lesson to begin</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}