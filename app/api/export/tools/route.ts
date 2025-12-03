import {
  createAuthenticatedRoute,
  getQueryParam,
  successResponse,
} from "@/lib/api";
import { getSupabaseServer } from "@/lib/db";
import { NextResponse } from "next/server";
import Papa from "papaparse";

/**
 * Tool Data Export API
 * Requirements: 13.1, 13.2, 13.3, 13.4
 *
 * GET /api/export/tools
 * Query params:
 * - format: 'json' | 'csv' (default: json)
 * - type: 'all' | 'checkins' | 'budgets' | 'states' | 'shadow' | 'ratings' | 'quizzes'
 */

interface CheckInRecord {
  id: string;
  created_at: string;
  type: string;
  data: {
    element?: string;
    energy_level?: number;
    state?: string;
    reflection?: string;
    gratitude?: string;
    intention?: string;
  } | null;
}

interface EnergyBudgetRecord {
  id: string;
  date: string;
  total_budget: number;
  activities: Array<{
    id: string;
    name: string;
    cost: number;
    category: string;
  }>;
  remaining_budget: number;
  created_at: string;
}

interface ShadowSessionRecord {
  id: string;
  element: string;
  current_step: number;
  reflections: Record<string, string>;
  started_at: string;
  completed_at: string | null;
  status: string;
}

interface StrategyRatingRecord {
  id: string;
  element: string;
  strategy_id: string;
  strategy_name: string;
  rating: number;
  note: string | null;
  created_at: string;
}

interface QuickQuizRecord {
  id: string;
  scores: Record<string, number>;
  primary_element: string;
  created_at: string;
}

interface ToolExportData {
  exportDate: string;
  userId: string;
  checkIns?: CheckInRecord[];
  energyBudgets?: EnergyBudgetRecord[];
  stateLogs?: CheckInRecord[];
  shadowSessions?: ShadowSessionRecord[];
  strategyRatings?: StrategyRatingRecord[];
  quickQuizResults?: QuickQuizRecord[];
}

/**
 * Format check-in data for CSV export
 * Requirements: 13.2
 */
function formatCheckInsForCsv(checkIns: CheckInRecord[]): string {
  const rows = checkIns.map((c) => ({
    id: c.id,
    date: c.created_at,
    element: c.data?.element || "",
    energy_level: c.data?.energy_level || "",
    operating_mode: c.data?.state || "",
    reflection: c.data?.reflection || "",
    gratitude: c.data?.gratitude || "",
    intention: c.data?.intention || "",
  }));
  return Papa.unparse(rows);
}

/**
 * Format energy budgets for CSV export
 * Requirements: 13.3
 */
function formatBudgetsForCsv(budgets: EnergyBudgetRecord[]): string {
  const rows = budgets.map((b) => ({
    id: b.id,
    date: b.date,
    total_budget: b.total_budget,
    remaining_budget: b.remaining_budget,
    activities_count: b.activities?.length || 0,
    activities: JSON.stringify(b.activities || []),
    created_at: b.created_at,
  }));
  return Papa.unparse(rows);
}

/**
 * Format shadow sessions for CSV export
 */
function formatShadowSessionsForCsv(sessions: ShadowSessionRecord[]): string {
  const rows = sessions.map((s) => ({
    id: s.id,
    element: s.element,
    current_step: s.current_step,
    status: s.status,
    started_at: s.started_at,
    completed_at: s.completed_at || "",
    reflections: JSON.stringify(s.reflections || {}),
  }));
  return Papa.unparse(rows);
}

/**
 * Format strategy ratings for CSV export
 */
function formatRatingsForCsv(ratings: StrategyRatingRecord[]): string {
  const rows = ratings.map((r) => ({
    id: r.id,
    element: r.element,
    strategy_id: r.strategy_id,
    strategy_name: r.strategy_name,
    rating: r.rating,
    note: r.note || "",
    created_at: r.created_at,
  }));
  return Papa.unparse(rows);
}

/**
 * Format quick quiz results for CSV export
 */
function formatQuizResultsForCsv(results: QuickQuizRecord[]): string {
  const rows = results.map((r) => ({
    id: r.id,
    primary_element: r.primary_element,
    electric_score: r.scores?.electric || 0,
    fiery_score: r.scores?.fiery || 0,
    aquatic_score: r.scores?.aquatic || 0,
    earthly_score: r.scores?.earthly || 0,
    airy_score: r.scores?.airy || 0,
    metallic_score: r.scores?.metallic || 0,
    created_at: r.created_at,
  }));
  return Papa.unparse(rows);
}

export const GET = createAuthenticatedRoute(async (request, _context, user) => {
  const supabase = getSupabaseServer();

  const format = getQueryParam(request, "format") || "json";
  const dataType = getQueryParam(request, "type") || "all";

  const exportData: ToolExportData = {
    exportDate: new Date().toISOString(),
    userId: user.id,
  };

  // Fetch check-ins
  // Requirements: 13.2
  if (dataType === "all" || dataType === "checkins") {
    const { data: checkIns } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "check_in")
      .order("created_at", { ascending: false });

    exportData.checkIns = (checkIns as CheckInRecord[]) || [];
  }

  // Fetch energy budgets
  // Requirements: 13.3
  if (dataType === "all" || dataType === "budgets") {
    const { data: budgets } = await supabase
      .from("energy_budgets")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    exportData.energyBudgets = (budgets as EnergyBudgetRecord[]) || [];
  }

  // Fetch state logs
  if (dataType === "all" || dataType === "states") {
    const { data: stateLogs } = await supabase
      .from("logs")
      .select("*")
      .eq("user_id", user.id)
      .eq("type", "state_log")
      .order("created_at", { ascending: false });

    exportData.stateLogs = (stateLogs as CheckInRecord[]) || [];
  }

  // Fetch shadow sessions
  if (dataType === "all" || dataType === "shadow") {
    const { data: sessions } = await supabase
      .from("shadow_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    exportData.shadowSessions = (sessions as ShadowSessionRecord[]) || [];
  }

  // Fetch strategy ratings
  if (dataType === "all" || dataType === "ratings") {
    const { data: ratings } = await supabase
      .from("strategy_ratings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    exportData.strategyRatings = (ratings as StrategyRatingRecord[]) || [];
  }

  // Fetch quick quiz results
  if (dataType === "all" || dataType === "quizzes") {
    const { data: quizzes } = await supabase
      .from("quick_quiz_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    exportData.quickQuizResults = (quizzes as QuickQuizRecord[]) || [];
  }

  // Format response based on requested format
  // Requirements: 13.4, 13.5
  if (format === "pdf") {
    // Import PDF generator dynamically to avoid SSR issues
    const { generateToolsExportPDF } = await import("@/lib/pdf/tools-export");

    const pdfBlob = await generateToolsExportPDF({
      exportDate: new Date(),
      checkIns: (exportData.checkIns || []).map((c) => ({
        date: c.created_at,
        element: c.data?.element || "",
        energy_level: c.data?.energy_level || 0,
        state: c.data?.state || "",
        reflection: c.data?.reflection,
      })),
      energyBudgets: (exportData.energyBudgets || []).map((b) => ({
        date: b.date,
        total_budget: b.total_budget,
        remaining_budget: b.remaining_budget,
        activities: b.activities || [],
      })),
    });

    const arrayBuffer = await pdfBlob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="neuroelemental-tools-export-${Date.now()}.pdf"`,
      },
    });
  }

  if (format === "csv") {
    // Create a combined CSV with sections
    const sections: string[] = [];

    if (exportData.checkIns?.length) {
      sections.push("=== CHECK-INS ===");
      sections.push(formatCheckInsForCsv(exportData.checkIns));
    }

    if (exportData.energyBudgets?.length) {
      sections.push("\n=== ENERGY BUDGETS ===");
      sections.push(formatBudgetsForCsv(exportData.energyBudgets));
    }

    if (exportData.stateLogs?.length) {
      sections.push("\n=== STATE LOGS ===");
      sections.push(formatCheckInsForCsv(exportData.stateLogs));
    }

    if (exportData.shadowSessions?.length) {
      sections.push("\n=== SHADOW WORK SESSIONS ===");
      sections.push(formatShadowSessionsForCsv(exportData.shadowSessions));
    }

    if (exportData.strategyRatings?.length) {
      sections.push("\n=== STRATEGY RATINGS ===");
      sections.push(formatRatingsForCsv(exportData.strategyRatings));
    }

    if (exportData.quickQuizResults?.length) {
      sections.push("\n=== QUICK QUIZ RESULTS ===");
      sections.push(formatQuizResultsForCsv(exportData.quickQuizResults));
    }

    const csvContent = sections.join("\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="neuroelemental-tools-export-${Date.now()}.csv"`,
      },
    });
  }

  // Return as JSON
  const response = successResponse(exportData);
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="neuroelemental-tools-export-${Date.now()}.json"`
  );
  return response;
});
