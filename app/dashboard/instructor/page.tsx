'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  UserPlus,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAsync } from '@/hooks/use-async';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';

export default function InstructorDashboardPage() {
  const { profile, user } = useAuth();

  interface Course {
    id: string;
    title: string;
    slug: string;
    student_count: number;
    lesson_count: number;
    revenue: number;
    is_published: boolean;
  }

  interface EnrollmentWithUser {
    id: string;
    enrolled_at: string;
    user?: { full_name?: string };
    course?: { title: string };
  }

  interface DashboardData {
    stats: {
      total_courses: number;
      total_students: number;
      total_revenue: number;
      average_rating: string;
      total_lessons: number;
    };
    courses: Course[];
    recent_enrollments: EnrollmentWithUser[];
  }

  const { data, loading, execute } = useAsync<DashboardData>();

  const stats = data?.stats || {
    total_courses: 0,
    total_students: 0,
    total_revenue: 0,
    average_rating: '0',
    total_lessons: 0,
  };
  const courses = data?.courses || [];
  const recentEnrollments = data?.recent_enrollments || [];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = () => execute(async () => {
    const res = await fetch('/api/dashboard/instructor');
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    const result = await res.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      stats: result.stats || {
        total_courses: 0,
        total_students: 0,
        total_revenue: 0,
        average_rating: '0',
        total_lessons: 0,
      },
      courses: result.courses || [],
      recent_enrollments: result.recent_enrollments || [],
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100); // Convert from cents
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Professional Background for Instructor Dashboard */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Instructor Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {profile?.full_name || 'Instructor'}
            </p>
          </motion.div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-5 mb-10">
          {[
            {
              title: "Total Courses",
              icon: BookOpen,
              value: stats.total_courses.toString(),
              desc: "Active courses",
              color: "text-blue-500"
            },
            {
              title: "Students",
              icon: Users,
              value: stats.total_students.toString(),
              desc: "Total enrolled",
              color: "text-green-500"
            },
            {
              title: "Revenue",
              icon: DollarSign,
              value: formatCurrency(stats.total_revenue),
              desc: "Total earnings",
              color: "text-amber-500"
            },
            {
              title: "Rating",
              icon: Star,
              value: stats.average_rating,
              desc: "Average rating",
              color: "text-purple-500"
            },
            {
              title: "Lessons",
              icon: TrendingUp,
              value: stats.total_lessons.toString(),
              desc: "Total created",
              color: "text-pink-500"
            }
          ].map((stat, i) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="glass-card border-border/50 hover:border-primary/20 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.desc}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-3">
          {/* Courses Section - 2 columns */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Your Courses</CardTitle>
                  <CardDescription>
                    Manage and track your course performance
                  </CardDescription>
                </div>
                <Button size="sm" asChild>
                  <Link href="/dashboard/instructor/courses/new">
                    <Plus className="w-4 h-4 mr-2" />
                    New Course
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : courses.length > 0 ? (
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course: Course) => (
                      <div key={course.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{course.title}</h4>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                {course.student_count} students
                              </span>
                              <span className="flex items-center gap-1">
                                <BookOpen className="w-3 h-3" />
                                {course.lesson_count} lessons
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                {formatCurrency(course.revenue)}
                              </span>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/courses/${course.slug}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/instructor/courses/${course.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {course.is_published ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-500 mt-3">
                            Published
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-500/10 text-amber-500 mt-3">
                            Draft
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-6">
                      No courses created yet
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/instructor/courses/new">
                        Create Your First Course
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Activity - 1 column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Recent Enrollments</CardTitle>
                <CardDescription>
                  New students in your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentEnrollments.length > 0 ? (
                  <div className="space-y-4">
                    {recentEnrollments.slice(0, 5).map((enrollment: EnrollmentWithUser) => (
                      <div key={enrollment.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserPlus className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {enrollment.user?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {enrollment.course?.title}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(enrollment.enrolled_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent enrollments</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-premium border-primary/20 mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/instructor/resources">
                    View Resources
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/instructor/analytics">
                    View Analytics
                  </Link>
                </Button>
                <Button className="w-full" variant="outline" asChild>
                  <Link href="/dashboard/instructor/students">
                    Manage Students
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}