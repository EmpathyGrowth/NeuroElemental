'use client';

import { useAuth } from '@/components/auth/auth-provider';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  FileText,
  Lock,
  Menu,
  MessageSquare,
  PlayCircle,
  Users,
  Video
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { logger } from '@/lib/logging';

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
  total_duration: number;
  completion_percentage: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content?: string;
  video_url?: string;
  duration_minutes: number;
  order_index: number;
  is_free: boolean;
  resources?: Resource[];
  quiz?: Quiz;
  completed: boolean;
  locked: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'download';
  url: string;
  size?: string;
}

interface Quiz {
  id: string;
  questions: Question[];
  passing_score: number;
  attempts: number;
  best_score?: number;
}

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
}

export default function CourseModulesPage({ params }: { params: { slug: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [_videoProgress, _setVideoProgress] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<{ [key: string]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [_discussionOpen, _setDiscussionOpen] = useState(false);

  useEffect(() => {
    fetchCourseData();
  }, [params.slug]);

  const fetchCourseData = async () => {
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

      // Fetch modules and lessons
      const modulesRes = await fetch(`/api/courses/${course.id}/modules`);
      const modulesData = await modulesRes.json();

      const enrichedModules = modulesData.modules || [];
      setModules(enrichedModules);

      // Set first module as current
      if (enrichedModules.length > 0) {
        setCurrentModule(enrichedModules[0]);
        if (enrichedModules[0].lessons?.length > 0) {
          setCurrentLesson(enrichedModules[0].lessons[0]);
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      logger.error('Error fetching course:', err as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!currentLesson || !user) return;

    try {
      const res = await fetch(`/api/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        // Update lesson state
        setCurrentLesson({ ...currentLesson, completed: true });

        // Move to next lesson
        const currentModuleIndex = modules.findIndex(m => m.id === currentModule?.id);
        const currentLessonIndex = currentModule?.lessons.findIndex(l => l.id === currentLesson.id) || 0;

        if (currentModule && currentLessonIndex < currentModule.lessons.length - 1) {
          // Next lesson in same module
          setCurrentLesson(currentModule.lessons[currentLessonIndex + 1]);
        } else if (currentModuleIndex < modules.length - 1) {
          // First lesson of next module
          const nextModule = modules[currentModuleIndex + 1];
          setCurrentModule(nextModule);
          setCurrentLesson(nextModule.lessons[0]);
        } else {
          // Course completed
          alert('Congratulations! You have completed the course!');
        }
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error completing lesson:', err as Error);
    }
  };

  const handleQuizSubmit = () => {
    if (!currentLesson?.quiz) return;

    let correct = 0;
    currentLesson.quiz.questions.forEach(q => {
      if (quizAnswers[q.id] === q.correct_answer) {
        correct++;
      }
    });

    const score = Math.round((correct / currentLesson.quiz.questions.length) * 100);
    setQuizScore(score);
    setQuizSubmitted(true);

    if (score >= currentLesson.quiz.passing_score) {
      handleLessonComplete();
    }
  };

  const calculateOverallProgress = () => {
    const totalLessons = modules.reduce((acc: any, m: any) => acc + m.lessons.length, 0);
    const completedLessons = modules.reduce((acc: any, m: any) =>
      acc + m.lessons.filter((l: any) => l.completed).length, 0
    );
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  const ModuleSidebar = () => (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-2">{course?.title}</h3>
        <Progress value={calculateOverallProgress()} className="h-2" />
        <p className="text-xs text-muted-foreground mt-2">
          {calculateOverallProgress()}% Complete
        </p>
      </div>

      <div className="p-4">
        <Accordion type="single" collapsible defaultValue={currentModule?.id}>
          {modules.map((module, moduleIndex) => (
            <AccordionItem key={module.id} value={module.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Module {moduleIndex + 1}: {module.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {module.completion_percentage === 100 && (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    )}
                    <span className="text-xs text-muted-foreground">
                      {module.completion_percentage}%
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-1 pl-4">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <button
                      key={lesson.id}
                      onClick={() => {
                        if (!lesson.locked) {
                          setCurrentModule(module);
                          setCurrentLesson(lesson);
                          setSidebarOpen(false);
                        }
                      }}
                      disabled={lesson.locked}
                      className={cn(
                        "w-full text-left p-2 rounded-lg transition-colors text-sm",
                        "flex items-center justify-between",
                        currentLesson?.id === lesson.id
                          ? "bg-primary text-primary-foreground"
                          : lesson.locked
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {lesson.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : lesson.locked ? (
                            <Lock className="w-4 h-4" />
                          ) : lesson.video_url ? (
                            <PlayCircle className="w-4 h-4" />
                          ) : (
                            <FileText className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          <p className="text-xs opacity-75">
                            {lesson.duration_minutes} min
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading course content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-80 border-r bg-card">
          <ModuleSidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-80">
            <ModuleSidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-card px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <div>
                  <h1 className="text-xl font-semibold">{currentLesson?.title}</h1>
                  <p className="text-sm text-muted-foreground">
                    {currentModule?.title} • Lesson {(currentModule?.lessons?.findIndex(l => l.id === currentLesson?.id) ?? -1) + 1} of {currentModule?.lessons?.length}
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => router.push(`/courses/${params.slug}`)}>
                Exit Course
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {currentLesson && (
              <div className="container max-w-4xl mx-auto p-6">
                <Tabs defaultValue="lesson" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="lesson">Lesson</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="quiz" disabled={!currentLesson.quiz}>
                      Quiz {currentLesson.quiz && <Badge className="ml-2" variant="secondary">Required</Badge>}
                    </TabsTrigger>
                    <TabsTrigger value="discussion">Discussion</TabsTrigger>
                  </TabsList>

                  <TabsContent value="lesson" className="mt-6">
                    {currentLesson.video_url ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
                        <iframe
                          src={currentLesson.video_url}
                          className="w-full h-full"
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    {currentLesson.content && (
                      <Card>
                        <CardContent className="prose dark:prose-invert max-w-none p-6">
                          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(currentLesson.content) }} />
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex items-center justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const lessons = currentModule?.lessons || [];
                          const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                          if (currentIndex > 0) {
                            setCurrentLesson(lessons[currentIndex - 1]);
                          }
                        }}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Previous
                      </Button>

                      {!currentLesson.completed ? (
                        <Button onClick={handleLessonComplete}>
                          Mark as Complete
                        </Button>
                      ) : (
                        <Badge className="text-green-600">
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Completed
                        </Badge>
                      )}

                      <Button
                        variant="outline"
                        onClick={() => {
                          const lessons = currentModule?.lessons || [];
                          const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
                          if (currentIndex < lessons.length - 1) {
                            setCurrentLesson(lessons[currentIndex + 1]);
                          }
                        }}
                      >
                        Next
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="resources" className="mt-6">
                    <div className="grid gap-4">
                      {currentLesson.resources?.map((resource: any) => (
                        <Card key={resource.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {resource.type === 'pdf' && <FileText className="w-5 h-5 text-red-500" />}
                                {resource.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                                {resource.type === 'download' && <Download className="w-5 h-5 text-green-500" />}
                                <div>
                                  <p className="font-medium">{resource.title}</p>
                                  {resource.size && (
                                    <p className="text-sm text-muted-foreground">{resource.size}</p>
                                  )}
                                </div>
                              </div>
                              <Button variant="outline" size="sm" asChild>
                                <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download
                                </a>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      {(!currentLesson.resources || currentLesson.resources.length === 0) && (
                        <Card>
                          <CardContent className="p-8 text-center text-muted-foreground">
                            No resources available for this lesson
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="quiz" className="mt-6">
                    {currentLesson.quiz ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Lesson Quiz</CardTitle>
                          <CardDescription>
                            Pass with {currentLesson.quiz.passing_score}% or higher to complete the lesson
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {!quizSubmitted ? (
                            <div className="space-y-6">
                              {currentLesson.quiz.questions.map((question, index) => (
                                <div key={question.id} className="space-y-3">
                                  <p className="font-medium">
                                    {index + 1}. {question.question}
                                  </p>
                                  <div className="space-y-2">
                                    {question.options.map((option, optionIndex) => (
                                      <label
                                        key={optionIndex}
                                        className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-muted"
                                      >
                                        <input
                                          type="radio"
                                          name={question.id}
                                          value={optionIndex}
                                          onChange={() => setQuizAnswers({
                                            ...quizAnswers,
                                            [question.id]: optionIndex
                                          })}
                                        />
                                        <span>{option}</span>
                                      </label>
                                    ))}
                                  </div>
                                </div>
                              ))}

                              <Button
                                onClick={handleQuizSubmit}
                                className="w-full"
                                disabled={Object.keys(quizAnswers).length !== currentLesson.quiz.questions.length}
                              >
                                Submit Quiz
                              </Button>
                            </div>
                          ) : (
                            <div className="text-center py-8">
                              <div className={cn(
                                "text-4xl font-bold mb-4",
                                quizScore >= currentLesson.quiz.passing_score
                                  ? "text-green-500"
                                  : "text-red-500"
                              )}>
                                {quizScore}%
                              </div>
                              <p className="text-lg mb-6">
                                {quizScore >= currentLesson.quiz.passing_score
                                  ? "Congratulations! You passed the quiz!"
                                  : "You didn't pass. Please review the lesson and try again."}
                              </p>
                              <Button
                                onClick={() => {
                                  setQuizSubmitted(false);
                                  setQuizAnswers({});
                                  setQuizScore(0);
                                }}
                              >
                                Retake Quiz
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ) : (
                      <Card>
                        <CardContent className="p-8 text-center text-muted-foreground">
                          No quiz for this lesson
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="discussion" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lesson Discussion</CardTitle>
                        <CardDescription>
                          Ask questions and discuss with other students
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="p-4 border rounded-lg">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">John Doe</p>
                                <p className="text-sm text-muted-foreground mb-2">2 hours ago</p>
                                <p>Great lesson! The examples really helped clarify the concepts.</p>
                              </div>
                            </div>
                          </div>

                          <div className="p-4 border rounded-lg">
                            <textarea
                              className="w-full p-3 border rounded-lg resize-none"
                              rows={3}
                              placeholder="Add a comment..."
                            />
                            <Button className="mt-3">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
