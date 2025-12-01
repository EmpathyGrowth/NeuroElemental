"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCard, StatsCardGrid } from "@/components/ui/stats-card";
import { useAsync } from "@/hooks/use-async";
import type { DiagnosticTemplate, DiagnosticWithTemplate } from "@/lib/db";
import { logger } from "@/lib/logging";
import {
  BarChart3,
  Briefcase,
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  Play,
  Shield,
  Target,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const diagnosticIcons: Record<string, typeof Briefcase> = {
  leadership: Briefcase,
  communication: MessageSquare,
  conflict_resolution: Shield,
  motivation_engagement: Target,
  sales_optimization: TrendingUp,
  team_composition: Users,
  custom: BarChart3,
};

const diagnosticColors: Record<string, string> = {
  leadership: "text-blue-500",
  communication: "text-green-500",
  conflict_resolution: "text-red-500",
  motivation_engagement: "text-amber-500",
  sales_optimization: "text-purple-500",
  team_composition: "text-cyan-500",
  custom: "text-gray-500",
};

interface DiagnosticsData {
  diagnostics: DiagnosticWithTemplate[];
  templates: DiagnosticTemplate[];
  stats: {
    totalDiagnostics: number;
    activeDiagnostics: number;
    completedDiagnostics: number;
    totalResponses: number;
  };
  memberCount: number;
}

export default function BusinessDashboardPage() {
  const { user } = useAuth();
  const [selectedOrg, setSelectedOrg] = useState<string | null>(null);

  // Fetch user's organizations
  const { data: orgsData, execute: fetchOrgs } = useAsync<{
    organizations: Array<{ id: string; name: string }>;
  }>();

  // Fetch diagnostics for selected organization
  const {
    data: diagnosticsData,
    loading: loadingDiagnostics,
    execute: fetchDiagnostics,
  } = useAsync<DiagnosticsData>();

  useEffect(() => {
    if (user) {
      fetchOrgs(async () => {
        const res = await fetch("/api/organizations");
        if (!res.ok) throw new Error("Failed to fetch organizations");
        return res.json();
      });
    }
  }, [user]);

  useEffect(() => {
    // Auto-select first organization
    if (orgsData?.organizations?.length && !selectedOrg) {
      setSelectedOrg(orgsData.organizations[0].id);
    }
  }, [orgsData, selectedOrg]);

  useEffect(() => {
    if (selectedOrg) {
      fetchDiagnostics(async () => {
        const res = await fetch(
          `/api/organizations/${selectedOrg}/diagnostics`
        );
        if (!res.ok) throw new Error("Failed to fetch diagnostics");
        return res.json();
      });
    }
  }, [selectedOrg]);

  const stats = diagnosticsData?.stats || {
    totalDiagnostics: 0,
    activeDiagnostics: 0,
    completedDiagnostics: 0,
    totalResponses: 0,
  };

  const templates = diagnosticsData?.templates || [];
  const diagnostics = diagnosticsData?.diagnostics || [];
  const memberCount = diagnosticsData?.memberCount || 0;

  const handleLaunchDiagnostic = async (template: DiagnosticTemplate) => {
    if (!selectedOrg) return;

    try {
      const res = await fetch(`/api/organizations/${selectedOrg}/diagnostics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: template.id,
          name: `${template.name} - ${new Date().toLocaleDateString()}`,
          include_all_members: true,
        }),
      });

      if (res.ok) {
        // Refresh diagnostics list
        fetchDiagnostics(async () => {
          const res = await fetch(
            `/api/organizations/${selectedOrg}/diagnostics`
          );
          if (!res.ok) throw new Error("Failed to fetch diagnostics");
          return res.json();
        });
      }
    } catch (error) {
      logger.error("Failed to launch diagnostic:", error as Error);
    }
  };

  if (!orgsData?.organizations?.length) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="text-center py-12">
          <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">No Organizations</h2>
          <p className="text-muted-foreground mb-6">
            Create or join an organization to access business diagnostic tools.
          </p>
          <Button asChild>
            <Link href="/dashboard/organizations/new">Create Organization</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Organization Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your team and access diagnostic tools
        </p>
      </div>

      {/* Quick Stats */}
      <StatsCardGrid columns={4} className="mb-8">
        <StatsCard
          title="Team Members"
          value={memberCount}
          description={
            memberCount === 0 ? "Invite your team" : "Active members"
          }
          icon={<Users className="h-5 w-5" />}
          accent="blue"
        />
        <StatsCard
          title="Assessments Completed"
          value={stats.totalResponses}
          description={`${stats.completedDiagnostics} diagnostics completed`}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="green"
        />
        <StatsCard
          title="Active Diagnostics"
          value={stats.activeDiagnostics}
          description="In progress"
          icon={<Target className="h-5 w-5" />}
          accent="purple"
        />
        <StatsCard
          title="Diagnostics Run"
          value={stats.totalDiagnostics}
          description="Total all time"
          icon={<BarChart3 className="h-5 w-5" />}
          accent="amber"
        />
      </StatsCardGrid>

      {/* Diagnostic Tools */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Diagnostic Tools</h2>
        {loadingDiagnostics ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {templates.map((template) => {
              const Icon = diagnosticIcons[template.type] || BarChart3;
              const colorClass =
                diagnosticColors[template.type] || "text-primary";

              return (
                <Card
                  key={template.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Icon className={`h-8 w-8 ${colorClass}`} />
                      {template.estimated_time_minutes && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {template.estimated_time_minutes} min
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-4">{template.name}</CardTitle>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      onClick={() => handleLaunchDiagnostic(template)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Launch Diagnostic
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Diagnostics */}
      {diagnostics.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Diagnostics</h2>
          <div className="space-y-4">
            {diagnostics.slice(0, 5).map((diagnostic) => {
              const Icon =
                diagnosticIcons[diagnostic.template?.type || "custom"] ||
                BarChart3;
              const colorClass =
                diagnosticColors[diagnostic.template?.type || "custom"] ||
                "text-primary";

              return (
                <Card key={diagnostic.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg bg-primary/10`}>
                          <Icon className={`h-6 w-6 ${colorClass}`} />
                        </div>
                        <div>
                          <h4 className="font-semibold">{diagnostic.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {diagnostic.completed_participants} /{" "}
                            {diagnostic.total_participants} responses
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {diagnostic.status === "completed" ? (
                          <span className="flex items-center gap-1 text-green-500 text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Completed
                          </span>
                        ) : diagnostic.status === "active" ? (
                          <span className="flex items-center gap-1 text-blue-500 text-sm">
                            <Play className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm capitalize">
                            {diagnostic.status}
                          </span>
                        )}
                        <Button variant="outline" size="sm" asChild>
                          <Link
                            href={`/dashboard/organizations/${selectedOrg}/diagnostics/${diagnostic.id}`}
                          >
                            View
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Team Management */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>Invite and manage team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Invite your team to run diagnostics together.
              </p>
              <Button asChild>
                <Link href={`/dashboard/organizations/${selectedOrg}/invite`}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Team Members
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Analytics</CardTitle>
            <CardDescription>
              Element distribution and energy patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Analytics will appear once team members complete their
                assessments
              </p>
              <Button variant="outline" asChild>
                <Link
                  href={`/dashboard/organizations/${selectedOrg}/analytics`}
                >
                  View Analytics
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
