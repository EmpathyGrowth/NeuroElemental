'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Trophy, Star, Lock, CheckCircle, Flame, BookOpen, Users, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/lib/logging';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  category: 'learning' | 'social' | 'milestone' | 'course' | 'engagement' | 'tools' | 'streak' | 'mastery';
  points: number;
  criteria: Record<string, unknown>;
  unlocked: boolean;
  unlocked_at: string | null;
}

interface AchievementsResponse {
  achievements: Achievement[];
  stats: {
    total: number;
    unlocked: number;
    totalPoints: number;
    earnedPoints: number;
  };
}

// Icons for each achievement category
// Requirements: 18.5 - Display earned achievements on user profile
const categoryIcons: Record<string, React.ReactNode> = {
  learning: <BookOpen className="h-5 w-5" />,
  social: <Users className="h-5 w-5" />,
  milestone: <Target className="h-5 w-5" />,
  course: <Trophy className="h-5 w-5" />,
  engagement: <Flame className="h-5 w-5" />,
  // New tool-related categories
  tools: <Star className="h-5 w-5" />,
  streak: <Flame className="h-5 w-5" />,
  mastery: <Trophy className="h-5 w-5" />,
};

// Colors for each achievement category
// Requirements: 18.5 - Display earned achievements on user profile
const categoryColors: Record<string, string> = {
  learning: 'text-blue-500 bg-blue-500/10',
  social: 'text-pink-500 bg-pink-500/10',
  milestone: 'text-amber-500 bg-amber-500/10',
  course: 'text-purple-500 bg-purple-500/10',
  engagement: 'text-orange-500 bg-orange-500/10',
  // New tool-related categories
  tools: 'text-teal-500 bg-teal-500/10',
  streak: 'text-orange-500 bg-orange-500/10',
  mastery: 'text-yellow-500 bg-yellow-500/10',
};

// Category display names
const categoryNames: Record<string, string> = {
  learning: 'Learning',
  social: 'Social',
  milestone: 'Milestone',
  course: 'Course',
  engagement: 'Engagement',
  tools: 'Tools',
  streak: 'Streaks',
  mastery: 'Mastery',
};

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      logger.error('Failed to fetch achievements', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const categories = [...new Set(data?.achievements.map((a) => a.category) || [])];
  const filteredAchievements = selectedCategory
    ? data?.achievements.filter((a) => a.category === selectedCategory)
    : data?.achievements;

  const progressPercent = data?.stats
    ? Math.round((data.stats.unlocked / data.stats.total) * 100)
    : 0;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and unlock badges as you learn
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data?.stats.unlocked} / {data?.stats.total}
                </p>
                <p className="text-sm text-muted-foreground">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {data?.stats.earnedPoints}
                </p>
                <p className="text-sm text-muted-foreground">Points Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card md:col-span-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Overall Progress</p>
              <p className="text-sm text-muted-foreground">{progressPercent}%</p>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {data?.stats.totalPoints && data?.stats.earnedPoints
                ? `${data.stats.earnedPoints} of ${data.stats.totalPoints} total points`
                : 'Keep learning to unlock more achievements!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border hover:border-primary/50'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedCategory === category
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border hover:border-primary/50'
            }`}
          >
            {categoryIcons[category]}
            {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Achievements Grid */}
      {/* Requirements: 18.5 - Display earned achievements on user profile */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements?.map((achievement) => {
          const isSpecial = (achievement.criteria as { is_special?: boolean })?.is_special;
          
          return (
            <Card
              key={achievement.id}
              className={`transition-all ${
                achievement.unlocked
                  ? isSpecial
                    ? 'glass-card border-amber-500/30 ring-1 ring-amber-500/20'
                    : 'glass-card border-primary/20'
                  : 'bg-card/50 opacity-75'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      achievement.unlocked
                        ? isSpecial
                          ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 text-amber-500 ring-2 ring-amber-400/30'
                          : categoryColors[achievement.category]
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {achievement.unlocked ? (
                      categoryIcons[achievement.category]
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {achievement.unlocked && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {isSpecial && (
                      <Badge className="text-xs bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
                        Special
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      +{achievement.points} pts
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg mt-3">{achievement.name}</CardTitle>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-xs">
                  <Badge
                    variant="outline"
                    className={achievement.unlocked ? categoryColors[achievement.category] : ''}
                  >
                    {categoryNames[achievement.category] || achievement.category}
                  </Badge>
                  {achievement.unlocked && achievement.unlocked_at && (
                    <span className="text-muted-foreground">
                      Unlocked {formatDistanceToNow(new Date(achievement.unlocked_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredAchievements?.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">No achievements in this category yet</p>
        </div>
      )}
    </div>
  );
}
