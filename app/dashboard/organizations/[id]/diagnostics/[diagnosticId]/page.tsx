'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Users,
  BarChart3,
  Trash2,
  Send,
  Eye,
  Loader2,
  AlertTriangle,
  Briefcase,
  MessageSquare,
  Shield,
  Target,
  TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { useAsync } from '@/hooks/use-async';
import { formatDate } from '@/lib/utils';
import { logger } from '@/lib/logging';
import type { DiagnosticWithTemplate, DiagnosticResponse, DiagnosticType } from '@/lib/db';

interface DiagnosticData {
  diagnostic: DiagnosticWithTemplate;
  responses: DiagnosticResponse[];
  userCanRespond: boolean;
}

const diagnosticIcons: Record<DiagnosticType, typeof Briefcase> = {
  leadership: Briefcase,
  communication: MessageSquare,
  conflict_resolution: Shield,
  motivation_engagement: Target,
  sales_optimization: TrendingUp,
  team_composition: Users,
  custom: BarChart3,
};

const diagnosticColors: Record<DiagnosticType, string> = {
  leadership: 'text-blue-500',
  communication: 'text-green-500',
  conflict_resolution: 'text-red-500',
  motivation_engagement: 'text-amber-500',
  sales_optimization: 'text-purple-500',
  team_composition: 'text-cyan-500',
  custom: 'text-gray-500',
};

const statusConfig = {
  draft: { label: 'Draft', color: 'bg-gray-500/10 text-gray-500', icon: Clock },
  active: { label: 'Active', color: 'bg-blue-500/10 text-blue-500', icon: Play },
  in_progress: { label: 'In Progress', color: 'bg-amber-500/10 text-amber-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500/10 text-green-500', icon: CheckCircle },
  archived: { label: 'Archived', color: 'bg-gray-500/10 text-gray-500', icon: Pause },
};

export default function DiagnosticViewPage() {
  const params = useParams();
  const router = useRouter();
  const organizationId = params.id as string;
  const diagnosticId = params.diagnosticId as string;

  const { data, loading, execute: fetchDiagnostic } = useAsync<DiagnosticData>();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (organizationId && diagnosticId) {
      fetchDiagnostic(async () => {
        const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`);
        if (!res.ok) throw new Error('Failed to fetch diagnostic');
        return res.json();
      });
    }
  }, [organizationId, diagnosticId]);

  const handleStartDiagnostic = async () => {
    setActionLoading('start');
    try {
      const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.ok) {
        fetchDiagnostic(async () => {
          const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`);
          if (!res.ok) throw new Error('Failed to fetch diagnostic');
          return res.json();
        });
      }
    } catch (error) {
      logger.error('Failed to start diagnostic:', error as Error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteDiagnostic = async () => {
    setActionLoading('complete');
    try {
      const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        fetchDiagnostic(async () => {
          const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`);
          if (!res.ok) throw new Error('Failed to fetch diagnostic');
          return res.json();
        });
      }
    } catch (error) {
      logger.error('Failed to complete diagnostic:', error as Error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteDiagnostic = async () => {
    setActionLoading('delete');
    try {
      const res = await fetch(`/api/organizations/${organizationId}/diagnostics/${diagnosticId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        router.push('/dashboard/business');
      }
    } catch (error) {
      logger.error('Failed to delete diagnostic:', error as Error);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-10 w-64 mb-2" />
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

  if (!data?.diagnostic) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Diagnostic Not Found</h2>
          <p className="text-muted-foreground mb-6">
            The diagnostic you're looking for doesn't exist or you don't have access.
          </p>
          <Button asChild>
            <Link href="/dashboard/business">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { diagnostic, responses } = data;
  const template = diagnostic.template;
  const Icon = diagnosticIcons[template?.type || 'custom'];
  const colorClass = diagnosticColors[template?.type || 'custom'];
  const status = statusConfig[diagnostic.status];
  const StatusIcon = status.icon;
  const completionRate = diagnostic.total_participants > 0
    ? Math.round((diagnostic.completed_participants / diagnostic.total_participants) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/business">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-lg bg-primary/10`}>
              <Icon className={`h-8 w-8 ${colorClass}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold">{diagnostic.name}</h1>
                <Badge className={status.color}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {template?.name || 'Custom Diagnostic'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {diagnostic.status === 'draft' && (
              <Button
                onClick={handleStartDiagnostic}
                disabled={actionLoading === 'start'}
              >
                {actionLoading === 'start' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Start Diagnostic
              </Button>
            )}
            {diagnostic.status === 'active' && (
              <Button
                variant="outline"
                onClick={handleCompleteDiagnostic}
                disabled={actionLoading === 'complete'}
              >
                {actionLoading === 'complete' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Complete
              </Button>
            )}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="icon" disabled={actionLoading === 'delete'} aria-label="Delete diagnostic">
                  {actionLoading === 'delete' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Diagnostic</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this diagnostic? This will also delete all
                    responses and cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteDiagnostic}
                    className="bg-destructive text-destructive-foreground"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostic.total_participants}</div>
            <p className="text-xs text-muted-foreground">
              {diagnostic.include_all_members ? 'All members included' : 'Selected members'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostic.completed_participants}</div>
            <p className="text-xs text-muted-foreground">
              {completionRate}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimated Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{template?.estimated_time_minutes || '-'}</div>
            <p className="text-xs text-muted-foreground">minutes per participant</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Questions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{template?.questions?.length || 0}</div>
            <p className="text-xs text-muted-foreground">in assessment</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Completion Progress</CardTitle>
          <CardDescription>
            {diagnostic.completed_participants} of {diagnostic.total_participants} participants have
            completed the assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <Progress value={completionRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Responses Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Responses</CardTitle>
              <CardDescription>
                Individual participant responses {diagnostic.anonymous_results && '(anonymized)'}
              </CardDescription>
            </div>
            {diagnostic.status === 'active' && (
              <Button variant="outline" size="sm">
                <Send className="h-4 w-4 mr-2" />
                Send Reminder
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {responses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Participant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Time Spent</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      {diagnostic.anonymous_results ? (
                        <span className="text-muted-foreground">Anonymous</span>
                      ) : (
                        <span className="font-medium">
                          {response.user_id.substring(0, 8)}...
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {response.is_complete ? (
                        <Badge className="bg-green-500/10 text-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          In Progress
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {response.started_at ? formatDate(response.started_at) : '-'}
                    </TableCell>
                    <TableCell>
                      {response.completed_at ? formatDate(response.completed_at) : '-'}
                    </TableCell>
                    <TableCell>
                      {response.time_spent_seconds
                        ? `${Math.round(response.time_spent_seconds / 60)} min`
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label="View response details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No responses yet</p>
              <p className="text-sm mt-2">
                {diagnostic.status === 'draft'
                  ? 'Start the diagnostic to begin collecting responses'
                  : 'Participants will appear here once they begin the assessment'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Section (when completed) */}
      {diagnostic.status === 'completed' && diagnostic.results && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Results & Insights
            </CardTitle>
            <CardDescription>
              Aggregated results from completed assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(diagnostic.results).length > 0 ? (
              <div className="space-y-4">
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(diagnostic.results, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Results will be generated once the analysis is complete</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights Section */}
      {diagnostic.insights && diagnostic.insights.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>AI-Generated Insights</CardTitle>
            <CardDescription>
              Key findings and recommendations based on the assessment data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {diagnostic.insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                    {index + 1}
                  </div>
                  <p className="text-sm">{String(insight)}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
