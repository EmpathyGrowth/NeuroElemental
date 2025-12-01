"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Flame,
  LucideIcon,
  MessageSquare,
  Star,
  Trophy,
} from "lucide-react";

interface Activity {
  id: string;
  type:
    | "course_enrolled"
    | "lesson_completed"
    | "achievement_unlocked"
    | "assessment_completed"
    | "streak_milestone"
    | "review_posted"
    | "event_registered";
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  className?: string;
}

const activityConfig: Record<
  Activity["type"],
  {
    icon: LucideIcon;
    color: string;
    bgColor: string;
  }
> = {
  course_enrolled: {
    icon: BookOpen,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  lesson_completed: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
  achievement_unlocked: {
    icon: Trophy,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  assessment_completed: {
    icon: Star,
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
  },
  streak_milestone: {
    icon: Flame,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  review_posted: {
    icon: MessageSquare,
    color: "text-cyan-600",
    bgColor: "bg-cyan-500/10",
  },
  event_registered: {
    icon: Calendar,
    color: "text-indigo-600",
    bgColor: "bg-indigo-500/10",
  },
};

/**
 * Activity Feed Component
 * Shows recent user activities with icons and timestamps
 * Inspired by drivingschoolSaaS activity pattern
 */
export function ActivityFeed({
  activities,
  maxItems = 5,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No recent activity</p>
            <p className="text-xs mt-1">
              Complete a lesson or take an assessment to get started
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity) => {
              const config = activityConfig[activity.type];
              const Icon = config.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div
                    className={cn(
                      "rounded-full p-2 flex-shrink-0",
                      config.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {activity.metadata?.points && (
                    <Badge variant="secondary" className="flex-shrink-0">
                      +{activity.metadata.points} pts
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact activity feed for smaller spaces
 */
export function CompactActivityFeed({
  activities,
  maxItems = 3,
}: {
  activities: Activity[];
  maxItems?: number;
}) {
  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="space-y-3">
      {displayActivities.map((activity) => {
        const config = activityConfig[activity.type];
        const Icon = config.icon;

        return (
          <div key={activity.id} className="flex items-center gap-2">
            <div className={cn("rounded-full p-1.5", config.bgColor)}>
              <Icon className={cn("h-3 w-3", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{activity.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
