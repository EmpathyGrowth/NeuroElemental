'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAsync } from '@/hooks/use-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ClipboardCheck,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { logger } from '@/lib/logging';
import { toast } from 'sonner';

interface Quiz {
  id: string;
  title: string;
  lesson_id: string;
  passing_score: number | null;
  questions: unknown[];
  created_at: string;
  updated_at: string;
}

interface QuizStats {
  total_attempts: number;
  pass_rate: number;
  average_score: number;
}

export default function AdminQuizzesPage() {
  const { data: quizzesData, loading, execute } = useAsync<{ quizzes: Quiz[]; pagination: { total: number } }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [quizStats, _setQuizStats] = useState<Record<string, QuizStats>>({});

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = () => execute(async () => {
    const response = await fetch('/api/quizzes?limit=100');
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  });

  const fetchQuizStats = async (quizId: string) => {
    if (quizStats[quizId]) return;
    try {
      // This would call a stats endpoint - for now we'll skip
      // const response = await fetch(`/api/quizzes/${quizId}/stats`);
      // if (response.ok) {
      //   const stats = await response.json();
      //   setQuizStats(prev => ({ ...prev, [quizId]: stats }));
      // }
    } catch (error) {
      logger.error('Error fetching quiz stats:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this quiz? This will also delete all quiz attempts.')) {
      return;
    }

    try {
      const response = await fetch(`/api/quizzes/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Quiz deleted successfully');
        fetchQuizzes();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to delete quiz');
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error deleting quiz:', err);
      toast.error('Failed to delete quiz');
    }
  };

  const quizzes = quizzesData?.quizzes || [];

  const filteredQuizzes = useMemo(
    () => quizzes.filter(quiz =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [quizzes, searchQuery]
  );

  const stats = useMemo(() => ({
    totalQuizzes: quizzes.length,
    avgQuestions: quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0) / quizzes.length)
      : 0,
    avgPassingScore: quizzes.length > 0
      ? Math.round(quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) / quizzes.length)
      : 0,
  }), [quizzes]);

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quiz Management</h1>
          <p className="text-muted-foreground">
            Create and manage lesson quizzes
          </p>
        </div>
        <Link href="/dashboard/admin/quizzes/new">
          <Button className="bg-gradient-to-r from-primary to-[#764BA2]">
            <Plus className="w-4 h-4 mr-2" />
            Create Quiz
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            <p className="text-xs text-muted-foreground">
              Available for lessons
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgQuestions}</div>
            <p className="text-xs text-muted-foreground">
              Per quiz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Passing Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgPassingScore}%</div>
            <p className="text-xs text-muted-foreground">
              Required to pass
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search quizzes"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>
            Manage your quiz library
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Loading quizzes...</p>
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {quizzes.length === 0 ? (
                <>
                  <p className="mb-4">No quizzes yet. Create your first quiz!</p>
                  <Link href="/dashboard/admin/quizzes/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create First Quiz
                    </Button>
                  </Link>
                </>
              ) : (
                'No quizzes found matching your search.'
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quiz Title</TableHead>
                  <TableHead>Questions</TableHead>
                  <TableHead>Passing Score</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuizzes.map((quiz) => (
                  <TableRow key={quiz.id} onMouseEnter={() => fetchQuizStats(quiz.id)}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{quiz.title}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {quiz.id.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {quiz.questions?.length || 0} questions
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {quiz.passing_score || 70}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(quiz.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label="Open quiz actions menu">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admin/quizzes/${quiz.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Quiz
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(quiz.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
