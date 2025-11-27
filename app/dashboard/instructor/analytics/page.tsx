'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  TrendingUp,
  Users,
  DollarSign,
  BookOpen,
  Star,
  Award,
  Clock,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/utils';

interface CourseAnalytics {
  id: string;
  title: string;
  student_count: number;
  completion_rate: number;
  revenue: number;
  average_rating: number;
  total_reviews: number;
}

interface AnalyticsData {
  overview: {
    total_students: number;
    total_revenue: number;
    total_courses: number;
    average_rating: number;
    completion_rate: number;
    new_enrollments_30d: number;
  };
  courses: CourseAnalytics[];
  recent_enrollments: {
    id: string;
    user_name: string;
    course_title: string;
    enrolled_at: string;
  }[];
  engagement: {
    lessons_completed_30d: number;
    average_time_per_lesson: number;
    quiz_pass_rate: number;
  };
}

export default function InstructorAnalyticsPage() {
  const { profile: _profile } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const { data, loading, execute } = useAsync<AnalyticsData>();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = () => {
    execute(async () => {
      const res = await fetch(`/api/instructor/analytics?range=${timeRange}`);
      if (!res.ok) {
        // Return default data if API doesn't exist yet
        return {
          overview: {
            total_students: 0,
            total_revenue: 0,
            total_courses: 0,
            average_rating: 0,
            completion_rate: 0,
            new_enrollments_30d: 0,
          },
          courses: [],
          recent_enrollments: [],
          engagement: {
            lessons_completed_30d: 0,
            average_time_per_lesson: 0,
            quiz_pass_rate: 0,
          },
        };
      }
      return res.json();
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  const overview = data?.overview || {
    total_students: 0,
    total_revenue: 0,
    total_courses: 0,
    average_rating: 0,
    completion_rate: 0,
    new_enrollments_30d: 0,
  };

  const courses = data?.courses || [];
  const recentEnrollments = data?.recent_enrollments || [];
  const engagement = data?.engagement || {
    lessons_completed_30d: 0,
    average_time_per_lesson: 0,
    quiz_pass_rate: 0,
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
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/dashboard/instructor">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            Track your course performance and student engagement
          </p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.total_students}</div>
            <p className="text-xs text-muted-foreground">
              +{overview.new_enrollments_30d} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(overview.total_revenue)}</div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.average_rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.completion_rate}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Engagement Metrics
            </CardTitle>
            <CardDescription>Student activity over the selected period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Lessons Completed</span>
                <span className="text-sm text-muted-foreground">{engagement.lessons_completed_30d}</span>
              </div>
              <Progress value={Math.min(engagement.lessons_completed_30d, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Avg. Time per Lesson</span>
                <span className="text-sm text-muted-foreground">{engagement.average_time_per_lesson} min</span>
              </div>
              <Progress value={Math.min((engagement.average_time_per_lesson / 30) * 100, 100)} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Quiz Pass Rate</span>
                <span className="text-sm text-muted-foreground">{engagement.quiz_pass_rate}%</span>
              </div>
              <Progress value={engagement.quiz_pass_rate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Recent Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Recent Enrollments
            </CardTitle>
            <CardDescription>Latest students joining your courses</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEnrollments.length > 0 ? (
              <div className="space-y-4">
                {recentEnrollments.slice(0, 5).map((enrollment) => (
                  <div key={enrollment.id} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{enrollment.user_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{enrollment.course_title}</p>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(enrollment.enrolled_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent enrollments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Performance
          </CardTitle>
          <CardDescription>Detailed metrics for each of your courses</CardDescription>
        </CardHeader>
        <CardContent>
          {courses.length > 0 ? (
            <div className="space-y-4">
              {courses.map((course) => (
                <div key={course.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">{course.title}</h4>
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{course.average_rating.toFixed(1)}</span>
                      <span className="text-xs text-muted-foreground">({course.total_reviews})</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold">{course.student_count}</p>
                      <p className="text-xs text-muted-foreground">Students</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{course.completion_rate}%</p>
                      <p className="text-xs text-muted-foreground">Completion</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatCurrency(course.revenue)}</p>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No courses yet. Create your first course to see analytics.</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/instructor/courses/new">Create Course</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
