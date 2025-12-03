import {
  createAuthenticatedRoute,
  forbiddenError,
  notFoundError,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";

/**
 * Team Energy Analytics API
 * Requirements: 16.1, 16.2, 16.3, 16.5
 *
 * GET /api/organizations/[id]/energy-analytics
 * Returns aggregate energy data for an organization
 * Only includes data from users who have opted in
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createAuthenticatedRoute(
  async (_request, context: RouteContext, user) => {
    const supabase = getSupabaseServer();
    const { id: organizationId } = await context.params;

    // Verify user has access to this organization
    const { data: membership } = await supabase
      .from("organization_members")
      .select("role")
      .eq("organization_id", organizationId)
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      throw notFoundError("Organization");
    }

    // Only admins and managers can view team analytics
    if (!["admin", "manager", "owner"].includes(membership.role)) {
      throw forbiddenError("You don't have permission to view team analytics");
    }

    // Get organization members who have opted in to sharing
    // Requirements: 16.5 - Exclude non-opted-in users
    const { data: members } = await supabase
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", organizationId);

    if (!members || members.length === 0) {
      return successResponse({
        totalMembers: 0,
        optedInMembers: 0,
        checkInsThisWeek: 0,
        averageEnergy: 0,
        modeDistribution: {},
        protectionModeAlerts: 0,
      });
    }

    const memberIds = members.map((m) => m.user_id);

    // Get opted-in members (check user_preferences for sharing opt-in)
    const { data: preferences } = await supabase
      .from("user_preferences")
      .select("user_id, preferences")
      .in("user_id", memberIds);

    const optedInUserIds = (preferences || [])
      .filter((p) => {
        const prefs = p.preferences as Record<string, unknown>;
        return prefs?.share_with_organization === true;
      })
      .map((p) => p.user_id);

    if (optedInUserIds.length === 0) {
      return successResponse({
        totalMembers: members.length,
        optedInMembers: 0,
        checkInsThisWeek: 0,
        averageEnergy: 0,
        modeDistribution: {},
        protectionModeAlerts: 0,
      });
    }

    // Get check-ins from the past week for opted-in users only
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: checkIns } = await supabase
      .from("logs")
      .select("user_id, data, created_at")
      .eq("type", "check_in")
      .in("user_id", optedInUserIds)
      .gte("created_at", oneWeekAgo.toISOString());

    // Calculate statistics
    const checkInsThisWeek = checkIns?.length || 0;

    // Calculate average energy
    let totalEnergy = 0;
    let energyCount = 0;
    const modeCounts: Record<string, number> = {};

    for (const checkIn of checkIns || []) {
      const data = checkIn.data as { energy_level?: number; state?: string } | null;
      if (data?.energy_level) {
        totalEnergy += data.energy_level;
        energyCount++;
      }
      if (data?.state) {
        modeCounts[data.state] = (modeCounts[data.state] || 0) + 1;
      }
    }

    const averageEnergy = energyCount > 0 ? totalEnergy / energyCount : 0;

    // Calculate mode distribution percentages
    const totalModes = Object.values(modeCounts).reduce((a, b) => a + b, 0);
    const modeDistribution: Record<string, number> = {};
    for (const [mode, count] of Object.entries(modeCounts)) {
      modeDistribution[mode] = Math.round((count / totalModes) * 100);
    }

    // Count protection mode alerts (3+ consecutive days)
    // Requirements: 16.3
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    let protectionModeAlerts = 0;

    for (const userId of optedInUserIds) {
      const { data: recentCheckIns } = await supabase
        .from("logs")
        .select("data")
        .eq("type", "check_in")
        .eq("user_id", userId)
        .gte("created_at", threeDaysAgo.toISOString())
        .order("created_at", { ascending: false })
        .limit(3);

      if (recentCheckIns && recentCheckIns.length >= 3) {
        const allProtection = recentCheckIns.every((c) => {
          const data = c.data as { state?: string } | null;
          return data?.state === "protection";
        });
        if (allProtection) {
          protectionModeAlerts++;
        }
      }
    }

    return successResponse({
      totalMembers: members.length,
      optedInMembers: optedInUserIds.length,
      checkInsThisWeek,
      averageEnergy,
      modeDistribution,
      protectionModeAlerts,
    });
  }
);
