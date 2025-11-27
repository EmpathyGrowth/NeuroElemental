'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import { logger } from '@/lib/logging';
import {
  BookOpen,
  PlayCircle,
  CheckCircle,
  TrendingUp,
  Award,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface EnrolledCourse {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  thumbnail_url: string | null;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
  last_lesson: string | null;
  enrolled_at: string;
  last_accessed: string | null;
}

interface CompletedCourse {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  thumbnail_url: string | null;
  completed_at: string;
  certificate_id: string | null;
}

interface CoursesData {
  stats: {
    enrolled_count: number;
    completed_count: number;
    average_progress: number;
    certificates_count: number;
  };
  enrolled_courses: EnrolledCourse[];
  completed_courses: CompletedCourse[];
}

const defaultData: CoursesData = {
  stats: {
    enrolled_count: 0,
    completed_count: 0,
    average_progress: 0,
    certificates_count: 0,
  },
  enrolled_courses: [],
  completed_courses: [],
};

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState('in-progress');
  const { data: coursesData, loading, execute } = useAsync<CoursesData>();

  const data = coursesData || defaultData;
  const enrolledCourses = data.enrolled_courses;
  const completedCourses = data.completed_courses;
  const stats = data.stats;

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    execute(async () => {
      const res = await fetch('/api/dashboard/student/courses');
      if (!res.ok) {
        logger.error('Failed to fetch courses:', new Error(`Status: ${res.status}`));
        return defaultData;
      }
      const result = await res.json();
      if (result.error) {
        logger.error('Error fetching courses:', new Error(result.error));
        return defaultData;
      }
      return result;
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-32 h-32 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Courses</h1>
        <p className="text-muted-foreground">
          Track your learning progress and access course materials
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrolled_count}</div>
            <p className="text-xs text-muted-foreground">Currently learning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed_count}</div>
            <p className="text-xs text-muted-foreground">Courses finished</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.average_progress}%
            </div>
            <p className="text-xs text-muted-foreground">Across all courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.certificates_count}</div>
            <p className="text-xs text-muted-foreground">Earned</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="in-progress">In Progress ({enrolledCourses.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCourses.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4 mt-6">
          {enrolledCourses.map((course) => (
            <Card key={course.id} className="glass-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <PlayCircle className="w-12 h-12 text-primary" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{course.course_title}</h3>
                        {course.last_accessed && (
                          <p className="text-sm text-muted-foreground mb-2">
                            Last accessed: {formatDate(course.last_accessed)}
                          </p>
                        )}
                        {course.last_lesson && (
                          <p className="text-sm text-primary">
                            Next: {course.last_lesson}
                          </p>
                        )}
                      </div>
                      <Button asChild>
                        <Link href={`/dashboard/student/courses/${course.course_slug}`}>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Continue
                        </Link>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.completed_lessons} / {course.total_lessons} lessons</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {course.progress}% complete
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {enrolledCourses.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  You haven't started any courses yet
                </p>
                <Button asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedCourses.map((course) => (
            <Card key={course.id} className="glass-card">
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold mb-2">{course.course_title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">
                          Completed: {formatDate(course.completed_at)}
                        </p>
                        {course.certificate_id && (
                          <Badge className="bg-green-500/10 text-green-500">
                            <Award className="w-3 h-3 mr-1" />
                            Certificate Earned
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/student/courses/${course.course_slug}`}>
                            Review Course
                          </Link>
                        </Button>
                        {course.certificate_id && (
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/student/certificates/${course.certificate_id}`}>
                              <Award className="w-4 h-4 mr-2" />
                              View Certificate
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {completedCourses.length === 0 && (
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Complete your first course to earn a certificate!
                </p>
                <Button variant="outline" asChild>
                  <Link href="/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Browse More Courses */}
      <Card className="glass-card border-primary/50 mt-8">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Ready to learn more?</h3>
          <p className="text-muted-foreground mb-6">
            Explore our full course catalog to continue your journey
          </p>
          <Button asChild className="bg-gradient-to-r from-primary to-[#764BA2]">
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
