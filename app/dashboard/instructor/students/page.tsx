'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Users,
  GraduationCap,
  BookOpen,
  Mail,
  Clock,
  Award,
} from 'lucide-react';
import Link from 'next/link';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/utils';

interface Student {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  enrolled_courses: number;
  completed_courses: number;
  total_progress: number;
  last_active: string | null;
  enrollments: {
    course_id: string;
    course_title: string;
    progress: number;
    enrolled_at: string;
    completed_at: string | null;
  }[];
}

interface Course {
  id: string;
  title: string;
}

interface StudentsData {
  students: Student[];
  courses: Course[];
  total_students: number;
}

export default function InstructorStudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { data, loading, execute } = useAsync<StudentsData>();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = () => {
    execute(async () => {
      const res = await fetch('/api/instructor/students');
      if (!res.ok) {
        // Return default data if API doesn't exist yet
        return {
          students: [],
          courses: [],
          total_students: 0,
        };
      }
      return res.json();
    });
  };

  const students = data?.students || [];
  const courses = data?.courses || [];
  const totalStudents = data?.total_students || 0;

  // Filter students based on search and course selection
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCourse =
      selectedCourse === 'all' ||
      student.enrollments.some((e) => e.course_id === selectedCourse);

    return matchesSearch && matchesCourse;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <Link href="/dashboard/instructor">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Students</h1>
        <p className="text-muted-foreground">
          Manage and track your students' progress
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Enrolled in your courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.filter((s) => {
                if (!s.last_active) return false;
                const lastActive = new Date(s.last_active);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return lastActive > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Recently active students
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completions</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {students.reduce((sum, s) => sum + s.completed_courses, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total course completions
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Student List */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Students</CardTitle>
                <CardDescription>
                  {filteredStudents.length} students found
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  aria-label="Search students by name or email"
                />
              </div>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filter by course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredStudents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Courses</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedStudent(student)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{student.full_name || 'Anonymous'}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{student.enrolled_courses}</span>
                          {student.completed_courses > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {student.completed_courses} completed
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.total_progress} className="w-16 h-2" />
                          <span className="text-sm">{student.total_progress}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.last_active ? (
                          <span className="text-sm text-muted-foreground">
                            {formatDate(student.last_active)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
                <p className="text-sm mt-2">
                  {searchQuery || selectedCourse !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Students will appear here once they enroll'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Student Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Student Details
            </CardTitle>
            <CardDescription>
              {selectedStudent ? selectedStudent.full_name : 'Select a student to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStudent ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedStudent.full_name || 'Anonymous'}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStudent.enrolled_courses}</p>
                    <p className="text-xs text-muted-foreground">Enrolled</p>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold">{selectedStudent.completed_courses}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Course Progress
                  </h4>
                  <div className="space-y-3">
                    {selectedStudent.enrollments.map((enrollment) => (
                      <div key={enrollment.course_id} className="border rounded-lg p-3">
                        <p className="font-medium text-sm mb-2">{enrollment.course_title}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={enrollment.progress} className="flex-1 h-2" />
                          <span className="text-xs text-muted-foreground">{enrollment.progress}%</span>
                        </div>
                        {enrollment.completed_at && (
                          <Badge variant="secondary" className="mt-2 text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Completed {formatDate(enrollment.completed_at)}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full" asChild>
                  <a href={`mailto:${selectedStudent.email}`}>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Email
                  </a>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Click on a student to view their details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
