'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizPlayer, type Quiz, type QuizResult } from '@/components/quiz';
import { VideoPlayer } from '@/components/video';
import { BookmarkButton } from '@/components/feedback/bookmark-button';
import { LessonNotes } from '@/components/feedback/lesson-notes';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  CheckCircle2,
  PlayCircle,
  Lock,
  ChevronRight,
  ChevronLeft,
  Clock,
  FileText,
  Video,
  ClipboardCheck,
  Trophy,
  Menu,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logging';
import { toast } from 'sonner';
import { useLessonTimeTracker } from '@/hooks/use-lesson-time-tracker';

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
  has_quiz?: boolean;
}

interface QuizProgress {
  attempts_count: number;
  best_score: number | null;
  has_passed: boolean;
  last_attempt: string | null;
}

type ViewMode = 'lesson' | 'quiz';

interface LessonListProps {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  onSelectLesson: (lesson: Lesson) => void;
}

function LessonList({ lessons, currentLesson, onSelectLesson }: LessonListProps) {
  return (
    <div className="space-y-2">
      {lessons.map((lesson, index) => (
        <button
          key={lesson.id}
          onClick={() => onSelectLesson(lesson)}
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
  );
}

export default function CourseLearnPage({ params }: { params: { slug: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [course, setCourse] = useState<any>(null);

  // Quiz state
  const [viewMode, setViewMode] = useState<ViewMode>('lesson');
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [quizProgress, setQuizProgress] = useState<QuizProgress | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Mobile navigation state
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Track time spent on current lesson
  useLessonTimeTracker(
    currentLesson?.id || null,
    viewMode === 'lesson' && !loading
  );

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
          // Celebrate course completion with confetti
          const { celebrateCourseCompletion, celebrateWithMotionCheck } = await import('@/lib/utils/celebrations');
          celebrateWithMotionCheck(celebrateCourseCompletion);

          toast.success(`Congratulations! You've completed the course. Certificate: ${data.certificateNumber}`);

          // Small delay before navigation to show confetti
          setTimeout(() => {
            router.push('/dashboard/student/certificates');
          }, 1000);
        } else {
          // Celebrate lesson completion with quick success animation
          const { celebrateSuccess, celebrateWithMotionCheck } = await import('@/lib/utils/celebrations');
          celebrateWithMotionCheck(celebrateSuccess);

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

  // Fetch quiz for the current lesson
  const fetchLessonQuiz = useCallback(async (lessonId: string) => {
    setLoadingQuiz(true);
    setCurrentQuiz(null);
    setQuizProgress(null);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/quiz`);
      if (res.ok) {
        const data = await res.json();
        setCurrentQuiz(data.quiz);
        setQuizProgress(data.user_progress);
      }
    } catch (error) {
      logger.error('Error fetching quiz:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoadingQuiz(false);
    }
  }, []);

  // Handle quiz submission
  const handleQuizSubmit = useCallback(async (answers: Record<string, string | boolean>): Promise<QuizResult> => {
    if (!currentQuiz) throw new Error('No quiz loaded');

    const res = await fetch(`/api/quizzes/${currentQuiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Failed to submit quiz');
    }

    return res.json();
  }, [currentQuiz]);

  // Handle quiz completion
  const handleQuizComplete = useCallback((result: QuizResult) => {
    if (result.passed) {
      toast.success('Quiz passed! Great job!');
      // Update quiz progress state
      setQuizProgress(prev => prev ? {
        ...prev,
        has_passed: true,
        best_score: Math.max(result.score, prev.best_score || 0),
        attempts_count: prev.attempts_count + 1,
      } : null);
    } else {
      toast.error(`Quiz not passed. You need ${result.passing_score}% to pass.`);
    }
  }, []);

  // Switch to quiz view
  const startQuiz = useCallback(() => {
    if (currentLesson) {
      fetchLessonQuiz(currentLesson.id);
      setViewMode('quiz');
    }
  }, [currentLesson, fetchLessonQuiz]);

  // Switch back to lesson view
  const backToLesson = useCallback(() => {
    setViewMode('lesson');
    setCurrentQuiz(null);
  }, []);

  // Handle lesson selection (also closes mobile nav)
  const handleSelectLesson = useCallback((lesson: Lesson) => {
    if (lesson.hasAccess) {
      setCurrentLesson(lesson);
      setViewMode('lesson');
      setMobileNavOpen(false);
    }
  }, []);

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
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile Navigation Trigger */}
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden flex-shrink-0">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Open course navigation</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                      <ListOrdered className="h-5 w-5" />
                      Course Content
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-4 p-3 bg-muted rounded-lg">
                      <Progress value={progress} className="flex-1" />
                      <span className="text-sm font-medium whitespace-nowrap">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <LessonList
                      lessons={lessons}
                      currentLesson={currentLesson}
                      onSelectLesson={handleSelectLesson}
                    />
                  </div>
                </SheetContent>
              </Sheet>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">{course?.title}</h1>
                <div className="hidden sm:flex items-center gap-4 mt-2">
                  <Progress value={progress} className="w-48" />
                  <span className="text-sm text-muted-foreground">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                {/* Mobile progress indicator */}
                <div className="sm:hidden flex items-center gap-2 mt-1">
                  <Progress value={progress} className="w-24" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push(`/courses/${params.slug}`)} className="flex-shrink-0">
              <span className="hidden sm:inline">Exit Course</span>
              <span className="sm:hidden">Exit</span>
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Lesson List (hidden on mobile, shown via Sheet) */}
          <div className="hidden lg:block lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <h2 className="font-semibold mb-4">Course Content</h2>
              <LessonList
                lessons={lessons}
                currentLesson={currentLesson}
                onSelectLesson={handleSelectLesson}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {viewMode === 'quiz' && currentQuiz ? (
              /* Quiz View */
              <div className="space-y-4">
                <Button variant="outline" onClick={backToLesson} className="mb-4">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back to Lesson
                </Button>
                {loadingQuiz ? (
                  <Card className="p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                      <p className="mt-4 text-muted-foreground">Loading quiz...</p>
                    </div>
                  </Card>
                ) : (
                  <QuizPlayer
                    quiz={currentQuiz}
                    onSubmit={handleQuizSubmit}
                    onComplete={handleQuizComplete}
                    onRetry={() => {
                      setCurrentQuiz(null);
                      if (currentLesson) fetchLessonQuiz(currentLesson.id);
                    }}
                    allowRetry={true}
                  />
                )}
              </div>
            ) : currentLesson ? (
              <Card className="p-8">
                {/* Lesson Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{currentLesson.title}</h1>
                      <p className="text-muted-foreground">{currentLesson.description}</p>
                    </div>
                    {/* Bookmark Button */}
                    {user && (
                      <BookmarkButton
                        lessonId={currentLesson.id}
                        variant="outline"
                        className="flex-shrink-0"
                      />
                    )}
                  </div>
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
                  <div className="mb-8">
                    <VideoPlayer
                      url={currentLesson.video_url}
                      title={currentLesson.title}
                    />
                  </div>
                )}

                {/* Lesson Content */}
                <div className="prose dark:prose-invert max-w-none mb-8">
                  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }} />
                </div>

                {/* Quiz Section */}
                {currentLesson.has_quiz && (
                  <div className="mb-8 p-6 bg-muted/50 rounded-lg border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <ClipboardCheck className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Lesson Quiz</h3>
                          <p className="text-sm text-muted-foreground">
                            Test your knowledge of this lesson
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {quizProgress?.has_passed && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <Trophy className="w-4 h-4" />
                            Passed ({quizProgress.best_score}%)
                          </span>
                        )}
                        <Button onClick={startQuiz} disabled={loadingQuiz}>
                          {loadingQuiz ? 'Loading...' : quizProgress?.has_passed ? 'Retake Quiz' : 'Take Quiz'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes Section */}
                {user && (
                  <div className="mb-8">
                    <LessonNotes lessonId={currentLesson.id} />
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                      if (currentIndex > 0) {
                        setCurrentLesson(lessons[currentIndex - 1]);
                        setViewMode('lesson');
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
                        setViewMode('lesson');
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