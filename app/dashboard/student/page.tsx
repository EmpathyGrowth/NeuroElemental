'use client';

import { useAuth } from '@/components/auth/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Award, BookOpen, Calendar, ExternalLink, Loader2, PlayCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { ElementalIcons } from '@/components/icons/elemental-icons';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/utils';

/** User enrollment data */
interface Enrollment {
  id: string;
  course_id: string;
  course?: { title: string };
  last_accessed_at?: string;
  progress_percentage?: number;
}

/** Certificate data */
interface Certificate {
  id: string;
  title: string;
  certificate_number: string;
}

export default function StudentDashboardPage() {
  const { profile, user } = useAuth();

  interface DashboardData {
    enrollments: Enrollment[];
    certificates: Certificate[];
    events: unknown[];
    stats: {
      courses_enrolled: number;
      certificates_earned: number;
      upcoming_events: number;
      learning_progress: number;
    };
    assessment: unknown;
  }

  const { data, loading, execute } = useAsync<DashboardData>();

  const enrollments = data?.enrollments || [];
  const certificates = data?.certificates || [];
  const _events = data?.events || [];
  const stats = data?.stats || {
    courses_enrolled: 0,
    certificates_earned: 0,
    upcoming_events: 0,
    learning_progress: 0,
  };
  const _assessment = data?.assessment || null;

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = () => execute(async () => {
    const res = await fetch('/api/dashboard/student');
    if (!res.ok) throw new Error('Failed to fetch dashboard');
    const result = await res.json();

    if (result.error) {
      throw new Error(result.error);
    }

    return {
      enrollments: result.enrollments || [],
      certificates: result.certificates || [],
      events: result.events || [],
      stats: result.stats || {
        courses_enrolled: 0,
        certificates_earned: 0,
        upcoming_events: 0,
        learning_progress: 0,
      },
      assessment: result.assessment,
    };
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Calm Background for Student Dashboard */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        <div className="mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="gradient-text">{profile?.full_name || 'Student'}</span>!
            </h1>
            <p className="text-xl text-muted-foreground font-light">
              Ready to explore your energy today?
            </p>
          </motion.div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-4 mb-10">
          {[
            {
              title: "Courses Enrolled",
              icon: BookOpen,
              value: stats.courses_enrolled.toString(),
              desc: stats.courses_enrolled > 0 ? "Active courses" : "Start your first course",
              color: "text-blue-500"
            },
            {
              title: "Certificates",
              icon: Award,
              value: stats.certificates_earned.toString(),
              desc: stats.certificates_earned > 0 ? "Earned achievements" : "Complete courses to earn",
              color: "text-amber-500"
            },
            {
              title: "Upcoming Events",
              icon: Calendar,
              value: stats.upcoming_events.toString(),
              desc: stats.upcoming_events > 0 ? "Events registered" : "No events registered",
              color: "text-purple-500"
            },
            {
              title: "Learning Progress",
              icon: TrendingUp,
              value: `${stats.learning_progress}%`,
              desc: stats.learning_progress > 0 ? "Overall progress" : "Start learning to track",
              color: "text-green-500"
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

        {/* Main Content Sections */}
        <div className="grid gap-8 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="glass-card border-border/50 h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-primary" /> Continue Learning
                </CardTitle>
                <CardDescription>
                  Pick up where you left off
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </div>
                ) : enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.slice(0, 2).map((enrollment: Enrollment) => (
                      <div key={enrollment.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors bg-background/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold">{enrollment.course?.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Last accessed {enrollment.last_accessed_at ? formatDate(enrollment.last_accessed_at) : 'Never'}
                            </p>
                          </div>
                          <Button size="sm" asChild>
                            <Link href={`/dashboard/student/courses/${enrollment.course_id}`}>
                              Continue
                            </Link>
                          </Button>
                        </div>
                        <Progress value={enrollment.progress_percentage || 0} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-2">
                          {enrollment.progress_percentage || 0}% complete
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-muted rounded-xl">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground mb-6">
                      You haven't started any courses yet
                    </p>
                    <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                      <Link href="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Card className="glass-premium border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" /> Your Element Mix
                  </CardTitle>
                  <CardDescription>
                    Understanding your energy profile
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                      <ElementalIcons.electric size="3rem" />
                    </div>
                    <p className="text-muted-foreground mb-6">
                      View your assessment results and insights
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/results">View Results</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <Card className="glass-card border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" /> My Certificates
                  </CardTitle>
                  <CardDescription>
                    Your earned achievements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {certificates.length > 0 ? (
                    <div className="space-y-3">
                      {certificates.slice(0, 3).map((cert: Certificate) => (
                        <div key={cert.id} className="flex items-center justify-between p-3 border rounded-lg bg-background/50">
                          <div className="flex items-center gap-3">
                            <Award className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{cert.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {cert.certificate_number}
                              </p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/dashboard/student/certificates/${cert.id}`}>
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground mb-4 text-sm">
                        Complete courses to earn certificates
                      </p>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href="/courses">Start Learning</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
