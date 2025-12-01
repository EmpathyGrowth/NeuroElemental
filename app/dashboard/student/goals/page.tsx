"use client";

import { useAuth } from "@/components/auth/auth-provider";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  Target,
  Trash2,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface LearningGoal {
  id: string;
  type: "weekly_hours" | "monthly_courses" | "streak_days" | "lessons_per_week";
  target: number;
  current: number;
  period: "weekly" | "monthly";
  created_at: string;
}

const GOAL_TYPES = [
  {
    value: "weekly_hours",
    label: "Study Hours per Week",
    icon: Clock,
    unit: "hours",
  },
  {
    value: "monthly_courses",
    label: "Courses per Month",
    icon: BookOpen,
    unit: "courses",
  },
  { value: "streak_days", label: "Learning Streak", icon: Flame, unit: "days" },
  {
    value: "lessons_per_week",
    label: "Lessons per Week",
    icon: Target,
    unit: "lessons",
  },
];

/**
 * Student Goals Page
 * Set and track learning objectives
 */
export default function StudentGoalsPage() {
  const { user: _user } = useAuth();
  const [goals, setGoals] = useState<LearningGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ type: "weekly_hours", target: 5 });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await fetch("/api/users/me/goals");
      if (res.ok) {
        const data = await res.json();
        setGoals(data.goals || []);
      } else {
        // If API doesn't exist yet, use mock data
        setGoals([
          {
            id: "1",
            type: "weekly_hours",
            target: 5,
            current: 3.5,
            period: "weekly",
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            type: "streak_days",
            target: 7,
            current: 4,
            period: "weekly",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch {
      // Use mock data on error
      setGoals([
        {
          id: "1",
          type: "weekly_hours",
          target: 5,
          current: 3.5,
          period: "weekly",
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          type: "streak_days",
          target: 7,
          current: 4,
          period: "weekly",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    try {
      const res = await fetch("/api/users/me/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newGoal),
      });

      if (res.ok) {
        toast.success("Goal created!");
        fetchGoals();
      } else {
        // Mock success
        const mockGoal: LearningGoal = {
          id: Date.now().toString(),
          type: newGoal.type as LearningGoal["type"],
          target: newGoal.target,
          current: 0,
          period: "weekly",
          created_at: new Date().toISOString(),
        };
        setGoals([...goals, mockGoal]);
        toast.success("Goal created!");
      }
      setDialogOpen(false);
      setNewGoal({ type: "weekly_hours", target: 5 });
    } catch {
      toast.error("Failed to create goal");
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await fetch(`/api/users/me/goals/${goalId}`, { method: "DELETE" });
      setGoals(goals.filter((g) => g.id !== goalId));
      toast.success("Goal removed");
    } catch {
      setGoals(goals.filter((g) => g.id !== goalId));
      toast.success("Goal removed");
    }
  };

  const getGoalConfig = (type: string) => {
    return GOAL_TYPES.find((g) => g.value === type) || GOAL_TYPES[0];
  };

  const getProgressPercentage = (goal: LearningGoal) => {
    return Math.min(100, (goal.current / goal.target) * 100);
  };

  const _getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-500";
    if (percentage >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Learning Goals"
        subtitle="Set targets and track your progress"
        actions={
          <div className="flex gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Learning Goal</DialogTitle>
                  <DialogDescription>
                    Set a new goal to track your learning progress
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select
                      value={newGoal.type}
                      onValueChange={(value) =>
                        setNewGoal({ ...newGoal, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GOAL_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target ({getGoalConfig(newGoal.type).unit})</Label>
                    <Input
                      type="number"
                      min={1}
                      value={newGoal.target}
                      onChange={(e) =>
                        setNewGoal({
                          ...newGoal,
                          target: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal}>Create Goal</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" asChild>
              <Link href="/dashboard/student">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4" />
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : goals.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Set your first learning goal to start tracking your progress
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const config = getGoalConfig(goal.type);
            const Icon = config.icon;
            const percentage = getProgressPercentage(goal);
            const isComplete = percentage >= 100;

            return (
              <Card
                key={goal.id}
                className={
                  isComplete ? "border-green-500/50 bg-green-500/5" : ""
                }
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${isComplete ? "bg-green-500/10" : "bg-primary/10"}`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isComplete ? "text-green-500" : "text-primary"}`}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {config.label}
                        </CardTitle>
                        <CardDescription>
                          {goal.period === "weekly"
                            ? "This Week"
                            : "This Month"}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteGoal(goal.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold">
                        {goal.current}
                        <span className="text-lg text-muted-foreground">
                          /{goal.target}
                        </span>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {config.unit}
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {percentage.toFixed(0)}% complete
                      </span>
                      {isComplete && (
                        <Badge
                          variant="outline"
                          className="bg-green-500/10 text-green-600 border-green-500/30"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Achieved!
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {goals.filter((g) => getProgressPercentage(g) >= 100).length}
                </p>
                <p className="text-sm text-muted-foreground">Goals Achieved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Active Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Calendar className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {goals.length > 0
                    ? Math.round(
                        goals.reduce(
                          (acc, g) => acc + getProgressPercentage(g),
                          0
                        ) / goals.length
                      )
                    : 0}
                  %
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Flame className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {goals.find((g) => g.type === "streak_days")?.current || 0}
                </p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
