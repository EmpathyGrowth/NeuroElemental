'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/dashboard/stat-card';
import Link from 'next/link';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAsync } from '@/hooks/use-async';
import { Users, BookOpen, Calendar, FileText, Award, TrendingUp, AlertCircle, DollarSign, UserPlus, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  interface RecentUser {
    id: string;
    full_name?: string;
    email?: string;
    role?: string;
    created_at: string;
  }

  interface RecentPayment {
    id: string;
    amount: number;
    status: string;
    user?: {
      full_name?: string;
      email?: string;
    };
  }

  interface DashboardData {
    stats: {
      totalusers: number;
      total_courses: number;
      total_enrollments: number;
      total_revenue: number;
      user_growth_rate: number;
      enrollment_growth_rate: number;
      active_courses: number;
      pending_instructors: number;
      total_events: number;
      upcoming_events: number;
      total_blog_posts: number;
      published_blog_posts: number;
      total_resources: number;
    };
    users_by_role: {
      students: number;
      instructors: number;
      therapists: number;
      business: number;
      admins: number;
    };
    recentusers: RecentUser[];
    recent_payments: RecentPayment[];
  }

  const { data, execute } = useAsync<DashboardData>();

  const stats = data?.stats || {
    totalusers: 0,
    total_courses: 0,
    total_enrollments: 0,
    total_revenue: 0,
    user_growth_rate: 0,
    enrollment_growth_rate: 0,
    active_courses: 0,
    pending_instructors: 0,
    total_events: 0,
    upcoming_events: 0,
    total_blog_posts: 0,
    published_blog_posts: 0,
    total_resources: 0,
  };

  const usersByRole = data?.users_by_role || {
    students: 0,
    instructors: 0,
    therapists: 0,
    business: 0,
    admins: 0,
  };

  const recentUsers = data?.recentusers || [];
  const recentPayments = data?.recent_payments || [];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = () => execute(async () => {
    const res = await fetch('/api/dashboard/admin');

    if (!res.ok) {
      // If API fails, use default values to prevent the UI from breaking
      return {
        stats: {
          totalusers: 0,
          total_courses: 0,
          total_enrollments: 0,
          total_revenue: 0,
          user_growth_rate: 0,
          enrollment_growth_rate: 0,
          active_courses: 0,
          pending_instructors: 0,
          total_events: 0,
          upcoming_events: 0,
          total_blog_posts: 0,
          published_blog_posts: 0,
          total_resources: 0,
        },
        users_by_role: {
          students: 0,
          instructors: 0,
          therapists: 0,
          business: 0,
          admins: 0,
        },
        recentusers: [],
        recent_payments: [],
      };
    }

    const result = await res.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Return data with defaults
    return {
      stats: result.stats || {
        totalusers: 0,
        total_courses: 0,
        total_enrollments: 0,
        total_revenue: 0,
        user_growth_rate: 0,
        enrollment_growth_rate: 0,
        active_courses: 0,
        pending_instructors: 0,
      },
      users_by_role: result.users_by_role || {
        students: 0,
        instructors: 0,
        therapists: 0,
        business: 0,
        admins: 0,
      },
      recentusers: result.recentusers || [],
      recent_payments: result.recent_payments || [],
    };
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Admin Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[1000px] h-[1000px] bg-gradient-to-br from-primary/5 to-purple-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">
              Platform management and analytics
            </p>
          </motion.div>
        </div>

        {/* Platform Overview Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatCard
              title="Total Users"
              value={stats.totalusers.toString()}
              subtitle={`+${stats.user_growth_rate}% growth`}
              icon={Users}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <StatCard
              title="Total Revenue"
              value={formatCurrency(stats.total_revenue)}
              subtitle="All time revenue"
              icon={DollarSign}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <StatCard
              title="Active Courses"
              value={stats.active_courses.toString()}
              subtitle={`${stats.total_courses} total courses`}
              icon={BookOpen}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <StatCard
              title="Course Enrollments"
              value={stats.total_enrollments.toString()}
              subtitle={`+${stats.enrollment_growth_rate}% growth`}
              icon={TrendingUp}
            />
          </motion.div>
        </div>

        {/* Pending Actions */}
        {stats.pending_instructors > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="mb-8 border-orange-500/50 bg-orange-500/5">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <CardTitle>Pending Actions</CardTitle>
                </div>
                <CardDescription>
                  Items requiring your attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Instructor Certifications</p>
                      <p className="text-sm text-muted-foreground">
                        {stats.pending_instructors} applications pending review
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/dashboard/admin/users">Review</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid gap-8 md:grid-cols-3">
          {/* User Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
                <CardDescription>
                  Users by role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(usersByRole).map(([role, count]) => (
                    <div key={role} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{role}</span>
                      <span className="text-sm font-bold">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="w-full" variant="outline" asChild>
                    <Link href="/dashboard/admin/users">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Users
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>
                  New platform registrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.slice(0, 5).map((user) => (
                      <div key={user.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserPlus className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {user.full_name || user.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.role || 'No role'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formatDate(user.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <UserPlus className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent users</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Payments */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Recent Payments</CardTitle>
                <CardDescription>
                  Latest transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentPayments.length > 0 ? (
                  <div className="space-y-3">
                    {recentPayments.slice(0, 5).map((payment) => (
                      <div key={payment.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment.user?.full_name || payment.user?.email}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {payment.status === 'succeeded' ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-amber-500">•</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent payments</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Content Management */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6">Content Management</h2>
          <div className="grid gap-6 md:grid-cols-4">
            {[
              {
                title: "Courses",
                icon: BookOpen,
                count: stats.total_courses,
                subtitle: `${stats.active_courses} published`,
                href: "/dashboard/admin/courses",
                color: "text-blue-500"
              },
              {
                title: "Events",
                icon: Calendar,
                count: stats.total_events,
                subtitle: `${stats.upcoming_events} upcoming`,
                href: "/dashboard/admin/events",
                color: "text-purple-500"
              },
              {
                title: "Blog Posts",
                icon: FileText,
                count: stats.total_blog_posts,
                subtitle: `${stats.published_blog_posts} published`,
                href: "/dashboard/admin/blog",
                color: "text-green-500"
              },
              {
                title: "Resources",
                icon: Award,
                count: stats.total_resources,
                subtitle: "Available for instructors",
                href: "/dashboard/admin/resources",
                color: "text-amber-500"
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.9 + i * 0.1 }}
              >
                <Card className="glass-card hover:border-primary/20 transition-all cursor-pointer">
                  <CardHeader>
                    <item.icon className={`h-8 w-8 ${item.color} mb-4`} />
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>
                      {item.subtitle}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold mb-4">{item.count}</div>
                    <Button className="w-full" variant="outline" asChild>
                      <Link href={item.href}>Manage</Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}