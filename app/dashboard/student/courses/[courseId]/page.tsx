'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  ChevronLeft,
  CheckCircle2,
  PlayCircle,
  FileText,
  Clock,
  Award,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/logging';
import { cn } from '@/lib/utils';
import VideoPlayer from '@/components/video/video-player';
import { QuizPlayer } from '@/components/quiz/quiz-player';
import type { Quiz, QuizResult } from '@/components/quiz/quiz-player';

interface Module {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  content_type: string;
  content_text: string | null;
  content_url: string | null;
  duration_minutes: number | null;
  order_index: number;
  is_preview: boolean | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  instructor_name: string | null;
  duration_hours: number | null;
  thumbnail_url: string | null;
}

interface Enrollment {
  id: string;
  progress_percentage: number;
  completed_at: string | null;
}

interface LessonCompletion {
  lesson_id: string;
  completed_at: string;
}

export default function StudentCoursePage({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [completions, setCompletions] = useState<LessonCompletion[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [params.courseId]);

  const fetchCourseData = async () => {
    try {
      // Fetch course details
      const courseRes = await fetch(`/api/courses/${params.courseId}`);
      if (!courseRes.ok) {
        toast.error('Course not found');
        router.push('/dashboard/student/courses');
        return;
      }
      const courseData = await courseRes.json();
      setCourse(courseData.course || courseData);

      // Fetch modules and lessons
      const modulesRes = await fetch(`/api/courses/${params.courseId}/modules`);
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.modules || []);
      }

      // Fetch enrollment data
      const enrollmentRes = await fetch(`/api/courses/${params.courseId}/enrollment`);
      if (enrollmentRes.ok) {
        const enrollmentData = await enrollmentRes.json();
        setEnrollment(enrollmentData.enrollment);
        setCompletions(enrollmentData.completions || []);
      } else if (enrollmentRes.status === 404) {
        toast.error('You are not enrolled in this course');
        router.push('/courses');
        return;
      }
    } catch (error) {
      logger.error('Error fetching course data:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: string) => {
    return completions.some(c => c.lesson_id === lessonId);
  };

  const handleSelectLesson = async (module: Module, lesson: Lesson) => {
    setSelectedModule(module);
    setSelectedLesson(lesson);
    setQuiz(null);

    // If it's a quiz lesson, fetch the quiz
    if (lesson.content_type === 'quiz') {
      setLoadingQuiz(true);
      try {
        const res = await fetch(`/api/lessons/${lesson.id}/quiz`);
        if (res.ok) {
          const data = await res.json();
          setQuiz(data.quiz);
        }
      } catch (error) {
        logger.error('Error fetching quiz:', error instanceof Error ? error : new Error(String(error)));
        toast.error('Failed to load quiz');
      } finally {
        setLoadingQuiz(false);
      }
    }
  };

  const handleMarkComplete = async () => {
    if (!selectedLesson || isLessonCompleted(selectedLesson.id)) return;

    setMarkingComplete(true);
    try {
      const res = await fetch(`/api/lessons/${selectedLesson.id}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();

        // Update local state
        setCompletions(prev => [...prev, {
          lesson_id: selectedLesson.id,
          completed_at: new Date().toISOString(),
        }]);

        // Update enrollment progress
        const newCompletedCount = completions.length + 1;
        const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
        const newProgress = Math.round((newCompletedCount / totalLessons) * 100);
        setEnrollment(prev => prev ? { ...prev, progress_percentage: newProgress } : null);

        if (data.courseCompleted) {
          toast.success('Congratulations! You completed the course!', {
            description: `Certificate #${data.certificateNumber}`,
          });
        } else {
          toast.success('Lesson completed!');
        }

        // Auto-advance to next lesson
        const nextLesson = findNextLesson();
        if (nextLesson) {
          handleSelectLesson(nextLesson.module, nextLesson.lesson);
        }
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to mark lesson complete');
      }
    } catch (error) {
      logger.error('Error marking lesson complete:', error instanceof Error ? error : new Error(String(error)));
      toast.error('Failed to mark lesson complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleQuizSubmit = async (answers: Record<string, string | boolean>): Promise<QuizResult> => {
    if (!quiz) throw new Error('No quiz loaded');

    const res = await fetch(`/api/quizzes/${quiz.id}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to submit quiz');
    }

    const result = await res.json();

    // If passed and lesson not completed, mark it complete
    if (result.passed && selectedLesson && !isLessonCompleted(selectedLesson.id)) {
      await handleMarkComplete();
    }

    return result;
  };

  const findNextLesson = () => {
    if (!selectedModule || !selectedLesson) return null;

    // Find current position
    const currentModuleIndex = modules.findIndex(m => m.id === selectedModule.id);
    const currentLessonIndex = selectedModule.lessons.findIndex(l => l.id === selectedLesson.id);

    // Check next lesson in same module
    if (currentLessonIndex < selectedModule.lessons.length - 1) {
      return {
        module: selectedModule,
        lesson: selectedModule.lessons[currentLessonIndex + 1],
      };
    }

    // Check first lesson of next module
    if (currentModuleIndex < modules.length - 1) {
      const nextModule = modules[currentModuleIndex + 1];
      if (nextModule.lessons.length > 0) {
        return {
          module: nextModule,
          lesson: nextModule.lessons[0],
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
          <p className="text-muted-foreground">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course || !enrollment) {
    return null;
  }

  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const completedLessons = completions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/student/courses">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Link>
              </Button>
              <div>
                <h1 className="font-semibold">{course.title}</h1>
                <p className="text-sm text-muted-foreground">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <Progress value={enrollment.progress_percentage} className="w-32 h-2" />
                <span>{enrollment.progress_percentage}%</span>
              </div>
              {enrollment.completed_at && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar - Course Curriculum */}
        <div className="w-80 border-r overflow-y-auto hidden lg:block">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Course Content</h2>
            <Accordion type="multiple" defaultValue={modules.map(m => m.id)}>
              {modules.map((module) => (
                <AccordionItem key={module.id} value={module.id} className="border-none">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="text-left">
                      <div className="font-medium text-sm">{module.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {module.lessons?.filter(l => isLessonCompleted(l.id)).length || 0} / {module.lessons?.length || 0} lessons
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-0">
                    <div className="space-y-1">
                      {module.lessons?.map((lesson) => {
                        const completed = isLessonCompleted(lesson.id);
                        const isActive = selectedLesson?.id === lesson.id;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleSelectLesson(module, lesson)}
                            className={cn(
                              'w-full flex items-center gap-3 p-2 rounded-md text-left text-sm transition-colors',
                              isActive
                                ? 'bg-primary/10 text-primary'
                                : 'hover:bg-muted',
                              completed && !isActive && 'text-muted-foreground'
                            )}
                          >
                            <div className="flex-shrink-0">
                              {completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                              ) : lesson.content_type === 'video' ? (
                                <PlayCircle className="w-4 h-4" />
                              ) : (
                                <FileText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate">{lesson.title}</div>
                              {lesson.duration_minutes && (
                                <div className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.duration_minutes} min
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedLesson ? (
            <div className="max-w-4xl mx-auto p-6">
              {/* Lesson Header */}
              <div className="mb-6">
                <Badge variant="outline" className="mb-2">
                  {selectedModule?.title}
                </Badge>
                <h2 className="text-2xl font-bold mb-2">{selectedLesson.title}</h2>
                {selectedLesson.duration_minutes && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {selectedLesson.duration_minutes} minutes
                  </p>
                )}
              </div>

              {/* Lesson Content */}
              {selectedLesson.content_type === 'video' && selectedLesson.content_url && (
                <div className="mb-6">
                  <VideoPlayer
                    url={selectedLesson.content_url}
                    title={selectedLesson.title}
                    onComplete={handleMarkComplete}
                  />
                </div>
              )}

              {selectedLesson.content_type === 'text' && selectedLesson.content_text && (
                <Card className="mb-6">
                  <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedLesson.content_text || '') }} />
                  </CardContent>
                </Card>
              )}

              {selectedLesson.content_type === 'quiz' && (
                <div className="mb-6">
                  {loadingQuiz ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                        <p className="text-muted-foreground">Loading quiz...</p>
                      </CardContent>
                    </Card>
                  ) : quiz ? (
                    <QuizPlayer
                      quiz={quiz}
                      onSubmit={handleQuizSubmit}
                      onComplete={() => {}}
                      allowRetry
                    />
                  ) : (
                    <Card>
                      <CardContent className="py-12 text-center text-muted-foreground">
                        No quiz found for this lesson.
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Mark Complete Button */}
              {selectedLesson.content_type !== 'quiz' && (
                <div className="flex items-center justify-between pt-6 border-t">
                  <div>
                    {isLessonCompleted(selectedLesson.id) ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </Badge>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Mark this lesson as complete when you're done
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isLessonCompleted(selectedLesson.id) || markingComplete}
                    className={cn(
                      isLessonCompleted(selectedLesson.id) && 'bg-green-600 hover:bg-green-600'
                    )}
                  >
                    {markingComplete ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : isLessonCompleted(selectedLesson.id) ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      'Mark Complete'
                    )}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <Card className="max-w-md">
                <CardHeader className="text-center">
                  <CardTitle>Select a Lesson</CardTitle>
                  <CardDescription>
                    Choose a lesson from the sidebar to begin learning
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <PlayCircle className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {totalLessons} lessons in {modules.length} modules
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
