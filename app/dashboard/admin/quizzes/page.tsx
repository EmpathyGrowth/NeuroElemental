"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ConfirmDialog,
  useConfirmDialog,
} from "@/components/ui/confirm-dialog";
import {
  BulkAction,
  Column,
  DataTable,
  DateCell,
  RowActionItem,
  RowActions,
  RowActionSeparator,
} from "@/components/ui/data-table";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import { logger } from "@/lib/logging";
import { formatDate } from "@/lib/utils";
import {
  BarChart3,
  ClipboardCheck,
  Edit,
  HelpCircle,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const PAGE_SIZE = 15;

interface Quiz {
  id: string;
  title: string;
  lesson_id: string;
  passing_score: number | null;
  questions: unknown[];
  created_at: string;
  updated_at: string;
}

interface QuizzesData {
  quizzes: Quiz[];
  pagination: { total: number };
}

const defaultData: QuizzesData = {
  quizzes: [],
  pagination: { total: 0 },
};

export default function AdminQuizzesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [selectedQuizzes, setSelectedQuizzes] = useState<Quiz[]>([]);
  const { data: quizzesData, loading, execute } = useAsync<QuizzesData>();
  const { confirm, dialogProps } = useConfirmDialog();
  const [saving, setSaving] = useState(false);

  const data = quizzesData || defaultData;
  const quizzes = data.quizzes;

  // Filter quizzes
  const filteredQuizzes = useMemo(() => {
    if (!searchQuery.trim()) return quizzes;
    return quizzes.filter((quiz) =>
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [quizzes, searchQuery]);

  const paginatedQuizzes = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuizzes.slice(start, start + pageSize);
  }, [filteredQuizzes, currentPage, pageSize]);

  // Stats
  const stats = useMemo(
    () => ({
      totalQuizzes: quizzes.length,
      avgQuestions:
        quizzes.length > 0
          ? Math.round(
              quizzes.reduce((sum, q) => sum + (q.questions?.length || 0), 0) /
                quizzes.length
            )
          : 0,
      avgPassingScore:
        quizzes.length > 0
          ? Math.round(
              quizzes.reduce((sum, q) => sum + (q.passing_score || 70), 0) /
                quizzes.length
            )
          : 0,
    }),
    [quizzes]
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
    setSelectedQuizzes([]);
  }, [searchQuery]);

  // Fetch quizzes
  const fetchQuizzes = useCallback(() => {
    execute(async () => {
      const response = await fetch("/api/quizzes?limit=100");
      if (!response.ok) {
        logger.error(
          "Failed to fetch quizzes:",
          new Error(`Status: ${response.status}`)
        );
        return defaultData;
      }
      return response.json();
    });
  }, [execute]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  // Actions
  const handleDelete = (quiz: Quiz) => {
    confirm({
      title: "Delete Quiz",
      description: `Are you sure you want to delete "${quiz.title}"? This will also delete all quiz attempts. This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        setSaving(true);
        try {
          const response = await fetch(`/api/quizzes/${quiz.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to delete quiz");
          }

          toast.success("Quiz Deleted", {
            description: `${quiz.title} has been removed.`,
          });
          fetchQuizzes();
        } catch (error) {
          logger.error("Error deleting quiz:", error as Error);
          toast.error(
            error instanceof Error ? error.message : "Failed to delete quiz"
          );
        } finally {
          setSaving(false);
        }
      },
    });
  };

  const handleBulkDelete = async (quizzes: Quiz[]) => {
    setSaving(true);
    try {
      const results = await Promise.allSettled(
        quizzes.map((quiz) =>
          fetch(`/api/quizzes/${quiz.id}`, { method: "DELETE" })
        )
      );

      const successful = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;

      if (failed > 0) {
        toast.warning(`Deleted ${successful} quizzes, ${failed} failed`);
      } else {
        toast.success(`Deleted ${successful} quizzes`);
      }

      setSelectedQuizzes([]);
      fetchQuizzes();
    } catch (error) {
      logger.error("Error bulk deleting quizzes:", error as Error);
      toast.error("Failed to delete quizzes");
    } finally {
      setSaving(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    try {
      const exportData = selectedQuizzes.length > 0 ? selectedQuizzes : quizzes;

      if (format === "csv") {
        const headers = [
          "Title",
          "Questions",
          "Passing Score",
          "Created",
          "Updated",
        ];
        const rows = exportData.map((quiz) => [
          quiz.title,
          (quiz.questions?.length || 0).toString(),
          (quiz.passing_score || 70).toString(),
          formatDate(quiz.created_at),
          formatDate(quiz.updated_at),
        ]);

        const csvContent = [
          headers.join(","),
          ...rows.map((row) =>
            row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `quizzes_export_${new Date().toISOString().split("T")[0]}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `quizzes_export_${new Date().toISOString().split("T")[0]}.json`;
        link.click();
      }

      toast.success("Export Complete", {
        description: `Exported ${exportData.length} quizzes to ${format.toUpperCase()}.`,
      });
    } catch (error) {
      logger.error("Error exporting quizzes:", error as Error);
      toast.error("Failed to export quizzes. Please try again.");
    }
  };

  // Table columns
  const columns: Column<Quiz>[] = [
    {
      id: "title",
      header: "Quiz Title",
      cell: (quiz) => (
        <div>
          <div className="font-medium">{quiz.title}</div>
          <div className="text-sm text-muted-foreground">
            ID: {quiz.id.slice(0, 8)}...
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      id: "questions",
      header: "Questions",
      cell: (quiz) => (
        <Badge variant="outline" className="gap-1">
          <HelpCircle className="h-3 w-3" />
          {quiz.questions?.length || 0} questions
        </Badge>
      ),
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "passing_score",
      header: "Passing Score",
      cell: (quiz) => (
        <Badge variant="secondary" className="gap-1">
          <Target className="h-3 w-3" />
          {quiz.passing_score || 70}%
        </Badge>
      ),
      sortable: true,
      className: "text-center",
      headerClassName: "text-center",
    },
    {
      id: "created",
      header: "Created",
      cell: (quiz) => <DateCell date={quiz.created_at} format="relative" />,
      sortable: true,
    },
  ];

  // Bulk actions
  const bulkActions: BulkAction<Quiz>[] = [
    {
      id: "delete",
      label: "Delete",
      icon: <Trash2 className="h-3 w-3" />,
      variant: "destructive",
      onAction: handleBulkDelete,
      requireConfirm: true,
      confirmMessage:
        "Are you sure you want to delete the selected quizzes? This will also delete all their attempts.",
    },
  ];

  // Row actions
  const renderRowActions = (quiz: Quiz) => (
    <RowActions>
      <RowActionItem asChild>
        <Link href={`/dashboard/admin/quizzes/${quiz.id}/edit`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Quiz
        </Link>
      </RowActionItem>
      <RowActionSeparator />
      <RowActionItem
        className="text-destructive"
        onClick={() => handleDelete(quiz)}
        disabled={saving}
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </RowActionItem>
    </RowActions>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
      <StatsCardGrid columns={3}>
        <StatsCard
          title="Total Quizzes"
          value={stats.totalQuizzes}
          description="Available for lessons"
          icon={<ClipboardCheck className="h-5 w-5" />}
          accent="purple"
          loading={loading && !quizzesData}
        />
        <StatsCard
          title="Avg. Questions"
          value={stats.avgQuestions}
          description="Per quiz"
          icon={<HelpCircle className="h-5 w-5" />}
          accent="blue"
          loading={loading && !quizzesData}
        />
        <StatsCard
          title="Avg. Passing Score"
          value={`${stats.avgPassingScore}%`}
          description="Required to pass"
          icon={<BarChart3 className="h-5 w-5" />}
          accent="green"
          loading={loading && !quizzesData}
        />
      </StatsCardGrid>

      {/* Quizzes Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Quizzes</CardTitle>
          <CardDescription>
            {filteredQuizzes.length} quizzes found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={paginatedQuizzes}
            columns={columns}
            keyField="id"
            selectable
            selectedRows={selectedQuizzes}
            onSelectionChange={setSelectedQuizzes}
            bulkActions={bulkActions}
            searchable
            searchPlaceholder="Search quizzes..."
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            page={currentPage}
            pageSize={pageSize}
            totalItems={filteredQuizzes.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            rowActions={renderRowActions}
            exportable
            onExport={handleExport}
            loading={loading && !quizzesData}
            emptyTitle="No quizzes found"
            emptyDescription={
              quizzes.length === 0
                ? "Create your first quiz to get started"
                : "Try adjusting your search"
            }
            emptyAction={
              quizzes.length === 0 ? (
                <Link href="/dashboard/admin/quizzes/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Quiz
                  </Button>
                </Link>
              ) : undefined
            }
            striped
          />
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog {...dialogProps} />
    </div>
  );
}
