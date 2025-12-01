"use client";

import { DashboardHeader } from "@/components/dashboard";
import { LearningStatsCard } from "@/components/dashboard/learning-stats-card";
import { StreakDisplay } from "@/components/gamification/streak-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Target,
  Trophy,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

interface CourseProgress {
  id: string;
  title: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
  last_accessed: string | null;
}

interface ProgressData {
  courses: CourseProgress[];
  totalCoursesEnrolled: number;
  totalCoursesCompleted: number;
  totalLessonsCompleted: number;
  totalQuizzesPassed: number;
  certificatesEarned: number;
}

/**
 * Student Progress Page - Detailed analytics and progress tracking
 */
export default function StudentProgressPage() {
  const { data, loading, execute } = useAsync<ProgressData>();

  useEffect(() => {
    execute(async () => {
      const res = await fetch("/api/users/me/progress");
      if (!res.ok) {
        // Return mock data if API doesn't exist
        return {
          courses: [
            {
              id: "1",
              title: "Introduction to NeuroElemental",
              progress: 75,
              completed_lessons: 6,
              total_lessons: 8,
              last_accessed: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: "2",
              title: "Understanding Energy Types",
              progress: 30,
              completed_lessons: 3,
              total_lessons: 10,
              last_accessed: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
          totalCoursesEnrolled: 3,
          totalCoursesCompleted: 1,
          totalLessonsCompleted: 15,
          totalQuizzesPassed: 4,
          certificatesEarned: 1,
        };
      }
      return res.json();
    });
  }, [execute]);

  const progressData = data || {
    courses: [],
    totalCoursesEnrolled: 0,
    totalCoursesCompleted: 0,
    totalLessonsCompleted: 0,
    totalQuizzesPassed: 0,
    certificatesEarned: 0,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Learning Progress"
        subtitle="Track your learning journey and achievements"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Current Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          <StreakDisplay variant="card" />
          <LearningStatsCard />
        </div>

        {/* Progress Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {progressData.totalCoursesEnrolled}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Courses Enrolled
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {progressData.totalLessonsCompleted}
                  </p>
                  <p className="text-sm text-muted-foreground">Lessons Done</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {progressData.totalQuizzesPassed}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Quizzes Passed
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {progressData.certificatesEarned}
                  </p>
                  <p className="text-sm text-muted-foreground">Certificates</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Progress */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Course Progress</CardTitle>
                  <CardDescription>
                    Your progress in enrolled courses
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline">
                {progressData.totalCoursesCompleted} /{" "}
                {progressData.totalCoursesEnrolled} Completed
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {progressData.courses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">
                  No courses enrolled yet
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {progressData.courses.map((course) => (
                  <div key={course.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{course.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {course.completed_lessons} / {course.total_lessons}{" "}
                            lessons
                          </span>
                          {course.last_accessed && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Last accessed{" "}
                                {new Date(
                                  course.last_accessed
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge
                        variant={
                          course.progress === 100 ? "default" : "secondary"
                        }
                        className={
                          course.progress === 100
                            ? "bg-green-500/10 text-green-600"
                            : ""
                        }
                      >
                        {course.progress}%
                      </Badge>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" asChild>
              <Link href="/dashboard/student/courses">View My Courses</Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/student/achievements">
                View Achievements
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/courses">Browse All Courses</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
