"use client";

/**
 * Admin Platform Overview Dashboard
 * High-level platform metrics and health monitoring
 */

import { AdminPageHeader } from "@/components/dashboard/admin-page-header";
import { AdminPageShell } from "@/components/dashboard/admin-page-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ComparisonStatsCard,
  MetricCard,
  MetricRow,
  ProgressStatsCard,
  StatsCard,
  StatsCardGrid,
} from "@/components/ui/stats-card";
import { useToast } from "@/components/ui/use-toast";
import { useAsync } from "@/hooks/use-async";
import {
  Activity,
  AlertCircle,
  Building2,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect } from "react";

interface PlatformStats {
  organizations: {
    total: number;
    active: number;
    growth: number;
  };
  users: {
    total: number;
    new_this_month: number;
    growth: number;
  };
  credits: {
    total_purchased: number;
    total_used: number;
    total_remaining: number;
    revenue: number;
  };
  activity: {
    transactions_today: number;
    invitations_pending: number;
    waitlist_signups: number;
    active_coupons: number;
  };
  recentActivity: Array<{
    id: string;
    type: "organization" | "credit" | "invitation" | "coupon";
    message: string;
    timestamp: string;
  }>;
  alerts: Array<{
    id: string;
    severity: "info" | "warning" | "error";
    message: string;
    timestamp: string;
  }>;
}

export default function AdminOverviewPage() {
  const { toast } = useToast();
  const { data: stats, loading, error, execute } = useAsync<PlatformStats>();

  useEffect(() => {
    fetchPlatformStats();
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const fetchPlatformStats = () =>
    execute(async () => {
      const res = await fetch("/api/admin/platform/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");

      const result = await res.json();
      return result.stats;
    });

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-blue-600" />;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "organization":
        return <Building2 className="h-4 w-4 text-blue-600" />;
      case "credit":
        return <Coins className="h-4 w-4 text-green-600" />;
      case "invitation":
        return <UserPlus className="h-4 w-4 text-purple-600" />;
      case "coupon":
        return <DollarSign className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <AdminPageShell>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </AdminPageShell>
    );
  }

  if (!stats) {
    return (
      <AdminPageShell>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6 text-destructive">
              Failed to load platform statistics
            </div>
          </CardContent>
        </Card>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Platform Overview"
        description="Monitor platform health and key metrics"
      />

      <div className="space-y-8">
        {/* Key Metrics */}
        <StatsCardGrid columns={4}>
          <StatsCard
            title="Organizations"
            value={stats.organizations.total}
            description={`${stats.organizations.active} active`}
            trend={{
              direction: stats.organizations.growth >= 0 ? "up" : "down",
              value: `${Math.abs(stats.organizations.growth)}%`,
            }}
            icon={<Building2 className="h-5 w-5" />}
            accent="blue"
          />
          <StatsCard
            title="Total Users"
            value={stats.users.total}
            description={`+${stats.users.new_this_month} this month`}
            trend={{
              direction: stats.users.growth >= 0 ? "up" : "down",
              value: `${Math.abs(stats.users.growth)}%`,
            }}
            icon={<Users className="h-5 w-5" />}
            accent="purple"
          />
          <StatsCard
            title="Total Revenue"
            value={`$${(stats.credits.revenue / 100).toLocaleString()}`}
            description="From credit purchases"
            icon={<DollarSign className="h-5 w-5" />}
            accent="green"
          />
          <StatsCard
            title="Credits Remaining"
            value={stats.credits.total_remaining.toLocaleString()}
            description="Across all organizations"
            icon={<Coins className="h-5 w-5" />}
            accent="amber"
          />
        </StatsCardGrid>

        {/* Credit Metrics */}
        <div className="grid gap-4 md:grid-cols-2">
          <ComparisonStatsCard
            title="Credit Usage Overview"
            current={{
              label: "Total Purchased",
              value: stats.credits.total_purchased.toLocaleString(),
            }}
            previous={{
              label: "Total Used",
              value: stats.credits.total_used.toLocaleString(),
            }}
            change={{
              direction: "neutral",
              value: "Lifetime",
            }}
            icon={<Coins className="h-5 w-5" />}
            accent="cyan"
          />
          <ProgressStatsCard
            title="Usage Rate"
            current={stats.credits.total_used}
            total={Math.max(stats.credits.total_purchased, 1)}
            unit=" credits"
            description="Percentage of purchased credits consumed"
            icon={<Activity className="h-5 w-5" />}
            accent="pink"
          />
        </div>

        {/* Today's Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Activity</CardTitle>
            <CardDescription>Operational metrics for today</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricRow>
              <MetricCard
                label="Transactions"
                value={stats.activity.transactions_today}
                change="Processed"
                accent="blue"
              />
              <MetricCard
                label="Pending Invites"
                value={stats.activity.invitations_pending}
                change="Awaiting"
                accent="purple"
              />
              <MetricCard
                label="Waitlist"
                value={stats.activity.waitlist_signups}
                change="New Signups"
                accent="green"
              />
              <MetricCard
                label="Active Coupons"
                value={stats.activity.active_coupons}
                change="Valid"
                accent="pink"
              />
            </MetricRow>
          </CardContent>
        </Card>

        {/* Recent Activity & Alerts */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest platform events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    No recent activity
                  </div>
                ) : (
                  stats.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="mt-0.5 p-2 rounded-full bg-primary/10 text-primary">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">
                          {activity.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(activity.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>Important notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.alerts.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-20 text-green-500" />
                    <p>All systems operational</p>
                  </div>
                ) : (
                  stats.alerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        alert.severity === "error"
                          ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                          : alert.severity === "warning"
                            ? "bg-orange-500/10 border-orange-500/20 text-orange-700 dark:text-orange-400"
                            : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      <div className="mt-0.5">
                        {getAlertIcon(alert.severity)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        <div className="flex items-center gap-2 text-xs opacity-80">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(alert.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminPageShell>
  );
}
