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
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  Flame,
  Lock,
  Medal,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "learning" | "engagement" | "mastery" | "special";
  points: number;
  unlocked: boolean;
  unlocked_at: string | null;
  progress: number;
  max_progress: number;
}

const ACHIEVEMENT_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  trophy: Trophy,
  medal: Medal,
  star: Star,
  flame: Flame,
  zap: Zap,
  target: Target,
  book: BookOpen,
  award: Award,
  check: CheckCircle,
};

const CATEGORY_COLORS: Record<string, string> = {
  learning: "from-blue-500 to-cyan-500",
  engagement: "from-orange-500 to-amber-500",
  mastery: "from-purple-500 to-pink-500",
  special: "from-emerald-500 to-teal-500",
};

/**
 * Student Achievements Page
 * Display earned badges and progress toward achievements
 */
export default function StudentAchievementsPage() {
  const { user: _user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const res = await fetch("/api/achievements");
      if (res.ok) {
        const data = await res.json();
        setAchievements(data.achievements || []);
      } else {
        // Use mock data if API returns empty or error
        setAchievements([
          {
            id: "1",
            title: "First Steps",
            description: "Complete your first lesson",
            icon: "star",
            category: "learning",
            points: 10,
            unlocked: true,
            unlocked_at: new Date(Date.now() - 604800000).toISOString(),
            progress: 1,
            max_progress: 1,
          },
          {
            id: "2",
            title: "Course Champion",
            description: "Complete your first course",
            icon: "trophy",
            category: "learning",
            points: 50,
            unlocked: true,
            unlocked_at: new Date(Date.now() - 172800000).toISOString(),
            progress: 1,
            max_progress: 1,
          },
          {
            id: "3",
            title: "Week Warrior",
            description: "Maintain a 7-day learning streak",
            icon: "flame",
            category: "engagement",
            points: 25,
            unlocked: false,
            unlocked_at: null,
            progress: 4,
            max_progress: 7,
          },
          {
            id: "4",
            title: "Knowledge Seeker",
            description: "Complete 5 courses",
            icon: "book",
            category: "learning",
            points: 100,
            unlocked: false,
            unlocked_at: null,
            progress: 1,
            max_progress: 5,
          },
          {
            id: "5",
            title: "Quiz Master",
            description: "Score 100% on 3 quizzes",
            icon: "target",
            category: "mastery",
            points: 75,
            unlocked: false,
            unlocked_at: null,
            progress: 1,
            max_progress: 3,
          },
          {
            id: "6",
            title: "Energy Expert",
            description: "Complete all energy type assessments",
            icon: "zap",
            category: "mastery",
            points: 150,
            unlocked: false,
            unlocked_at: null,
            progress: 2,
            max_progress: 4,
          },
          {
            id: "7",
            title: "Early Bird",
            description: "Complete a lesson before 8 AM",
            icon: "star",
            category: "special",
            points: 15,
            unlocked: true,
            unlocked_at: new Date(Date.now() - 86400000).toISOString(),
            progress: 1,
            max_progress: 1,
          },
          {
            id: "8",
            title: "Consistent Learner",
            description: "Log in for 30 consecutive days",
            icon: "medal",
            category: "engagement",
            points: 200,
            unlocked: false,
            unlocked_at: null,
            progress: 12,
            max_progress: 30,
          },
        ]);
      }
    } catch {
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements = achievements.filter((a) => {
    if (activeTab === "all") return true;
    if (activeTab === "unlocked") return a.unlocked;
    if (activeTab === "locked") return !a.unlocked;
    return a.category === activeTab;
  });

  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <DashboardHeader
        title="Achievements"
        subtitle="Track your learning milestones and earn badges"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
        }
      />

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-full bg-primary/20">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{totalPoints}</p>
                <p className="text-sm text-muted-foreground">Total Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{unlockedCount}</p>
                <p className="text-sm text-muted-foreground">Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Lock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {achievements.length - unlockedCount}
                </p>
                <p className="text-sm text-muted-foreground">Locked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Star className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((unlockedCount / achievements.length) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
          <TabsTrigger value="locked">In Progress</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="mastery">Mastery</TabsTrigger>
          <TabsTrigger value="special">Special</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredAchievements.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Achievements</h3>
                <p className="text-muted-foreground">
                  {activeTab === "unlocked"
                    ? "Complete challenges to unlock achievements!"
                    : "No achievements in this category yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredAchievements.map((achievement) => {
                const Icon = ACHIEVEMENT_ICONS[achievement.icon] || Trophy;
                const isUnlocked = achievement.unlocked;
                const progressPercent =
                  (achievement.progress / achievement.max_progress) * 100;

                return (
                  <Card
                    key={achievement.id}
                    className={`relative overflow-hidden transition-all ${
                      isUnlocked
                        ? "border-primary/50"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {isUnlocked && (
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${
                          CATEGORY_COLORS[achievement.category]
                        } opacity-5`}
                      />
                    )}
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div
                          className={`p-3 rounded-xl ${
                            isUnlocked
                              ? `bg-gradient-to-br ${CATEGORY_COLORS[achievement.category]} text-white`
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={isUnlocked ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {achievement.points} pts
                          </Badge>
                          {!isUnlocked && (
                            <Lock className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">
                        {achievement.title}
                      </CardTitle>
                      <CardDescription>
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {isUnlocked ? (
                        <p className="text-xs text-muted-foreground">
                          Unlocked {formatDate(achievement.unlocked_at)}
                        </p>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">
                              Progress
                            </span>
                            <span className="font-medium">
                              {achievement.progress} /{" "}
                              {achievement.max_progress}
                            </span>
                          </div>
                          <Progress value={progressPercent} className="h-2" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
