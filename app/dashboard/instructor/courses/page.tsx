"use client";

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
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { formatDate } from "@/lib/utils";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Clock,
  Edit,
  Eye,
  Plus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string | null;
  status: string;
  price_usd: number;
  difficulty_level?: string;
  created_at: string;
  updated_at: string;
  course_enrollments: { count: number }[];
  course_modules: { count: number }[];
  course_lessons: { count: number }[];
}

/**
 * Instructor Courses Page - Manage created courses
 */
export default function InstructorCoursesPage() {
  const { data: courses, loading, execute } = useAsync<Course[]>();

  const fetchCourses = useCallback(() => {
    execute(async () => {
      const res = await fetch("/api/instructor/courses");
      if (!res.ok) {
        // Return empty if API doesn't exist yet
        return [];
      }
      const data = await res.json();
      return data.courses || [];
    });
  }, [execute]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const courseList = courses || [];
  const publishedCount = courseList.filter(
    (c) => c.status === "published"
  ).length;
  const totalStudents = courseList.reduce(
    (sum, c) => sum + (c.course_enrollments?.[0]?.count || 0),
    0
  );
  const isPublished = (course: Course) => course.status === "published";
  const getStudentCount = (course: Course) =>
    course.course_enrollments?.[0]?.count || 0;

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="My Courses"
        subtitle="Courses you've created and manage"
        actions={
          <Button asChild>
            <Link href="/dashboard/instructor/courses/new">
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Link>
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{courseList.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publishedCount}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStudents}</p>
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {courseList.length - publishedCount}
                </p>
                <p className="text-sm text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {courseList.length === 0 ? (
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle>No Courses Yet</CardTitle>
                <CardDescription>
                  Start creating your first course
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Share your knowledge with students by creating comprehensive
              courses. You'll be able to:
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Create structured modules and lessons
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Upload videos, documents, and quizzes
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Track student progress and engagement
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                Earn revenue from course sales
              </li>
            </ul>
            <div className="flex gap-3 pt-4">
              <Button asChild>
                <Link href="/dashboard/instructor/courses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Course
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/instructor/certification">
                  Get Certified First
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {courseList.map((course) => (
            <Card
              key={course.id}
              className="group hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge
                    variant={isPublished(course) ? "default" : "secondary"}
                    className={
                      isPublished(course)
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : ""
                    }
                  >
                    {isPublished(course) ? "Published" : "Draft"}
                  </Badge>
                  {course.price_usd > 0 && (
                    <span className="text-sm font-semibold text-primary">
                      ${course.price_usd}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg line-clamp-2 mt-2">
                  {course.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {course.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {getStudentCount(course)} students
                  </div>
                  {course.difficulty_level && (
                    <Badge variant="outline" className="text-xs">
                      {course.difficulty_level}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/instructor/courses/${course.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/dashboard/instructor/analytics?course=${course.id}`}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Updated {formatDate(course.updated_at)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
