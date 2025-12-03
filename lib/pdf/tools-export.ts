import { jsPDF } from "jspdf";

/**
 * Tool Export PDF Generator
 * Requirements: 13.4, 13.5
 *
 * Generates a PDF report with tool data visualizations
 */

interface CheckInData {
  date: string;
  element: string;
  energy_level: number;
  state: string;
  reflection?: string;
}

interface EnergyBudgetData {
  date: string;
  total_budget: number;
  remaining_budget: number;
  activities: Array<{ name: string; cost: number }>;
}

interface ToolExportPDFData {
  userName?: string;
  exportDate: Date;
  checkIns: CheckInData[];
  energyBudgets: EnergyBudgetData[];
  modeDistribution?: Record<string, number>;
  averageEnergy?: number;
}

// Element colors
const elementColors: Record<string, string> = {
  electric: "#A78BFA",
  fiery: "#F472B6",
  aquatic: "#38BDF8",
  earthly: "#34D399",
  airy: "#818CF8",
  metallic: "#94A3B8",
};

// Mode colors
const modeColors: Record<string, string> = {
  biological: "#34D399",
  societal: "#38BDF8",
  passion: "#F472B6",
  protection: "#EF4444",
};

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 124, g: 58, b: 237 };
}

/**
 * Calculate mode distribution from check-ins
 */
function calculateModeDistribution(
  checkIns: CheckInData[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  let total = 0;

  for (const checkIn of checkIns) {
    if (checkIn.state) {
      counts[checkIn.state] = (counts[checkIn.state] || 0) + 1;
      total++;
    }
  }

  const distribution: Record<string, number> = {};
  for (const [mode, count] of Object.entries(counts)) {
    distribution[mode] = Math.round((count / total) * 100);
  }

  return distribution;
}

/**
 * Calculate average energy level
 */
function calculateAverageEnergy(checkIns: CheckInData[]): number {
  if (checkIns.length === 0) return 0;
  const sum = checkIns.reduce((acc, c) => acc + (c.energy_level || 0), 0);
  return Math.round((sum / checkIns.length) * 10) / 10;
}

/**
 * Generate PDF export for tool data
 * Requirements: 13.4, 13.5
 */
export async function generateToolsExportPDF(
  data: ToolExportPDFData
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = "#7c3aed";
  const textColor = "#1f2937";
  const mutedColor = "#6b7280";

  // Header
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("NeuroElemental", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Tool Data Export Report", pageWidth / 2, 30, { align: "center" });

  // User info
  let yPos = 55;
  if (data.userName) {
    doc.setTextColor(textColor);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${data.userName}'s Energy Data`, 20, yPos);
    yPos += 10;
  }

  doc.setTextColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Exported: ${data.exportDate.toLocaleDateString()}`, 20, yPos);
  yPos += 15;

  // Summary Stats
  doc.setTextColor(textColor);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Summary", 20, yPos);
  yPos += 10;

  // Stats boxes
  const stats = [
    { label: "Total Check-ins", value: data.checkIns.length.toString() },
    {
      label: "Average Energy",
      value: `${data.averageEnergy || calculateAverageEnergy(data.checkIns)}/5`,
    },
    { label: "Energy Budgets", value: data.energyBudgets.length.toString() },
  ];

  const boxWidth = (pageWidth - 50) / 3;
  stats.forEach((stat, index) => {
    const x = 20 + index * (boxWidth + 5);

    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, boxWidth, 25, 3, 3, "F");

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(textColor);
    doc.text(stat.value, x + boxWidth / 2, yPos + 12, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(mutedColor);
    doc.text(stat.label, x + boxWidth / 2, yPos + 20, { align: "center" });
  });

  yPos += 35;

  // Mode Distribution
  const modeDistribution =
    data.modeDistribution || calculateModeDistribution(data.checkIns);
  if (Object.keys(modeDistribution).length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Operating Mode Distribution", 20, yPos);
    yPos += 10;

    // Simple bar chart
    const modes = Object.entries(modeDistribution).sort((a, b) => b[1] - a[1]);
    const maxBarWidth = pageWidth - 80;

    modes.forEach(([mode, percentage]) => {
      const color = modeColors[mode] || "#94A3B8";
      const rgb = hexToRgb(color);

      // Mode label
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textColor);
      doc.text(mode.charAt(0).toUpperCase() + mode.slice(1), 20, yPos + 5);

      // Bar
      const barWidth = (percentage / 100) * maxBarWidth;
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.roundedRect(60, yPos, barWidth, 8, 2, 2, "F");

      // Percentage
      doc.setTextColor(mutedColor);
      doc.text(`${percentage}%`, 65 + barWidth, yPos + 5);

      yPos += 12;
    });

    yPos += 10;
  }

  // Recent Check-ins
  if (data.checkIns.length > 0) {
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Recent Check-ins", 20, yPos);
    yPos += 10;

    // Table header
    doc.setFillColor(248, 250, 252);
    doc.rect(20, yPos, pageWidth - 40, 8, "F");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(mutedColor);
    doc.text("Date", 25, yPos + 5);
    doc.text("Element", 60, yPos + 5);
    doc.text("Energy", 100, yPos + 5);
    doc.text("Mode", 130, yPos + 5);

    yPos += 10;

    // Table rows (last 10)
    const recentCheckIns = data.checkIns.slice(0, 10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(textColor);

    recentCheckIns.forEach((checkIn) => {
      if (yPos > pageHeight - 50) {
        doc.addPage();
        yPos = 20;
      }

      const date = new Date(checkIn.date).toLocaleDateString();
      doc.text(date, 25, yPos + 5);
      doc.text(checkIn.element || "-", 60, yPos + 5);
      doc.text(`${checkIn.energy_level}/5`, 100, yPos + 5);
      doc.text(checkIn.state || "-", 130, yPos + 5);

      yPos += 8;
    });

    if (data.checkIns.length > 10) {
      doc.setTextColor(mutedColor);
      doc.setFontSize(8);
      doc.text(
        `... and ${data.checkIns.length - 10} more check-ins`,
        25,
        yPos + 5
      );
      yPos += 10;
    }
  }

  // Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 25, pageWidth, 25, "F");

  doc.setTextColor(mutedColor);
  doc.setFontSize(9);
  doc.text(
    "NeuroElemental™ - Energy Management for Neurodivergent Minds",
    pageWidth / 2,
    pageHeight - 15,
    { align: "center" }
  );
  doc.text(
    "This data is for personal use and self-reflection",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  return doc.output("blob");
}
