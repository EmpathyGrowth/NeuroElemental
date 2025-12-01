"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Brain,
  Calendar,
  Flame,
  LucideIcon,
  Plus,
  Settings,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";

type UserRole = "student" | "instructor" | "business" | "school" | "admin";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  variant?: "primary" | "secondary" | "urgent";
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive";
  };
  shortcut?: string;
}

interface DashboardQuickActionsProps {
  userRole: UserRole;
  className?: string;
}

/**
 * Role-based quick access panel
 * Inspired by drivingschoolSaaS pattern
 *
 * Provides 6-8 contextual actions based on user role
 * Reduces decision fatigue with curated actions
 */
export function DashboardQuickActions({
  userRole,
  className,
}: DashboardQuickActionsProps) {
  const getQuickActions = (): QuickAction[] => {
    const actions: Record<UserRole, QuickAction[]> = {
      student: [
        {
          id: "continue-learning",
          title: "Continue Learning",
          description: "Resume your last course where you left off",
          icon: BookOpen,
          href: "/dashboard/student/courses",
          variant: "primary",
          shortcut: "Ctrl+C",
        },
        {
          id: "take-assessment",
          title: "Take Assessment",
          description: "Discover your element mix and learning style",
          icon: Brain,
          href: "/assessment",
          variant: "urgent",
          badge: { text: "Start Here", variant: "destructive" },
        },
        {
          id: "my-progress",
          title: "View Progress",
          description: "Check your learning stats and achievements",
          icon: Trophy,
          href: "/dashboard/student/progress",
          variant: "secondary",
        },
        {
          id: "browse-courses",
          title: "Browse Courses",
          description: "Explore available courses and content",
          icon: Target,
          href: "/courses",
          variant: "secondary",
        },
        {
          id: "view-streak",
          title: "Learning Streak",
          description: "Maintain your daily learning momentum",
          icon: Flame,
          href: "/dashboard/student/achievements",
          variant: "secondary",
        },
        {
          id: "join-events",
          title: "Upcoming Events",
          description: "Register for workshops and webinars",
          icon: Calendar,
          href: "/events",
          variant: "secondary",
        },
      ],
      instructor: [
        {
          id: "create-course",
          title: "Create Course",
          description: "Build new course content",
          icon: Plus,
          href: "/dashboard/instructor/courses/new",
          variant: "primary",
          shortcut: "Ctrl+N",
        },
        {
          id: "view-students",
          title: "My Students",
          description: "View student progress and analytics",
          icon: Users,
          href: "/dashboard/instructor/students",
          variant: "primary",
        },
        {
          id: "analytics",
          title: "Analytics",
          description: "View course performance metrics",
          icon: Trophy,
          href: "/dashboard/instructor/analytics",
          variant: "secondary",
        },
        {
          id: "certification",
          title: "Get Certified",
          description: "Join the instructor certification program",
          icon: Trophy,
          href: "/dashboard/instructor/certification",
          variant: "urgent",
          badge: { text: "New", variant: "destructive" },
        },
      ],
      business: [
        {
          id: "team-dashboard",
          title: "Team Dashboard",
          description: "View organization metrics and analytics",
          icon: Users,
          href: "/dashboard/business",
          variant: "primary",
        },
        {
          id: "manage-members",
          title: "Manage Team",
          description: "Invite and manage team members",
          icon: Users,
          href: "/dashboard/organizations",
          variant: "primary",
        },
        {
          id: "billing",
          title: "Billing",
          description: "Manage subscription and credits",
          icon: Settings,
          href: "/dashboard/billing/plans",
          variant: "secondary",
        },
      ],
      school: [
        {
          id: "students",
          title: "Students",
          description: "Manage student accounts and progress",
          icon: Users,
          href: "/dashboard/school",
          variant: "primary",
        },
        {
          id: "diagnostics",
          title: "Run Diagnostic",
          description: "Assess student learning needs",
          icon: Brain,
          href: "/dashboard/school",
          variant: "primary",
        },
      ],
      admin: [
        {
          id: "overview",
          title: "Platform Overview",
          description: "View platform-wide metrics",
          icon: Trophy,
          href: "/dashboard/admin/overview",
          variant: "primary",
        },
        {
          id: "manage-users",
          title: "User Management",
          description: "Manage all platform users",
          icon: Users,
          href: "/dashboard/admin/users",
          variant: "primary",
        },
        {
          id: "content",
          title: "Content Management",
          description: "Manage courses, blog, and resources",
          icon: BookOpen,
          href: "/dashboard/admin/courses",
          variant: "secondary",
        },
      ],
    };

    return actions[userRole] || [];
  };

  const actions = getQuickActions();

  const getVariantStyles = (variant?: string) => {
    switch (variant) {
      case "primary":
        return "border-primary/20 hover:border-primary/40 hover:bg-primary/5";
      case "urgent":
        return "border-red-500/20 bg-red-500/5 hover:border-red-500/40";
      case "secondary":
      default:
        return "border-border hover:border-primary/20 hover:bg-accent";
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quick Actions</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;

            return (
              <Link key={action.id} href={action.href}>
                <Card
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md relative",
                    getVariantStyles(action.variant)
                  )}
                >
                  {action.badge && (
                    <Badge
                      variant={action.badge.variant}
                      className="absolute -top-2 -right-2 z-10"
                    >
                      {action.badge.text}
                    </Badge>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "p-2 rounded-lg",
                          action.variant === "urgent"
                            ? "bg-red-500/10"
                            : "bg-primary/10"
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            action.variant === "urgent"
                              ? "text-red-500"
                              : "text-primary"
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">
                          {action.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {action.description}
                        </p>
                        {action.shortcut && (
                          <kbd className="mt-2 inline-block text-[10px] bg-muted px-1.5 py-0.5 rounded border font-mono">
                            {action.shortcut}
                          </kbd>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
