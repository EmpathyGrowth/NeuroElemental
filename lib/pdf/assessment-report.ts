import { jsPDF } from 'jspdf';
import type { ElementType } from '@/lib/content/assessment-questions';

interface AssessmentData {
  userName?: string;
  topElements: Array<{ element: ElementType; score: number; name: string }>;
  blendType?: string;
  energyStyle?: string;
  completedDate: Date;
}

/**
 * Generate PDF report for assessment results
 * Creates a professional-looking PDF with branding
 */
export async function generateAssessmentPDF(data: AssessmentData): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Colors
  const primaryColor = '#7c3aed';
  const textColor = '#1f2937';
  const mutedColor = '#6b7280';

  // Add gradient background rectangle
  doc.setFillColor(124, 58, 237); // Primary purple
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Header - Logo/Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NeuroElemental', pageWidth / 2, 20, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Energy Profile Report', pageWidth / 2, 30, { align: 'center' });

  // User name
  if (data.userName) {
    doc.setTextColor(textColor);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(`${data.userName}'s Element Mix`, 20, 55);
  }

  // Date
  doc.setTextColor(mutedColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Completed: ${data.completedDate.toLocaleDateString()}`, 20, 65);

  // Top Elements Section
  let yPos = 80;
  doc.setTextColor(textColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Your Dominant Elements', 20, yPos);

  yPos += 10;

  // Element cards
  data.topElements.slice(0, 3).forEach((element, index) => {
    const elementColors: Record<string, string> = {
      electric: '#A78BFA',
      fiery: '#F472B6',
      aquatic: '#38BDF8',
      earthly: '#34D399',
      airy: '#818CF8',
      metallic: '#94A3B8',
    };

    const color = elementColors[element.element] || primaryColor;
    const rgb = hexToRgb(color);

    // Element box
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.1);
    doc.roundedRect(20, yPos, pageWidth - 40, 25, 3, 3, 'F');

    // Element emoji/icon
    doc.setFontSize(18);
    const emojis: Record<string, string> = {
      electric: '⚡',
      fiery: '🔥',
      aquatic: '🌊',
      earthly: '🌱',
      airy: '💨',
      metallic: '🪙',
    };
    doc.text(emojis[element.element] || '', 25, yPos + 15);

    // Element name
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textColor);
    doc.text(element.name, 40, yPos + 12);

    // Score
    doc.setFontSize(20);
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(`${element.score}%`, pageWidth - 45, yPos + 15);

    // Rank label
    doc.setFontSize(10);
    doc.setTextColor(mutedColor);
    const ranks = ['Primary', 'Secondary', 'Tertiary'];
    doc.text(ranks[index], 40, yPos + 20);

    yPos += 32;
  });

  // Blend Type
  if (data.blendType) {
    yPos += 10;
    doc.setTextColor(textColor);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Blend Type', 20, yPos);

    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textColor);
    doc.text(data.blendType, 20, yPos);
  }

  // Energy Style
  if (data.energyStyle) {
    yPos += 15;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Energy Style', 20, yPos);

    yPos += 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(data.energyStyle, 20, yPos);
  }

  // Next Steps Section
  yPos += 20;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textColor);
  doc.text('Recommended Next Steps', 20, yPos);

  yPos += 10;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textColor);

  const steps = [
    '1. Explore your element deep-dive pages to understand your patterns',
    '2. Use the Energy Budget Calculator to plan your daily activities',
    '3. Try the State Tracker tool to monitor your nervous system',
    '4. Join our community to connect with others like you',
  ];

  steps.forEach((step) => {
    const lines = doc.splitTextToSize(step, pageWidth - 40);
    doc.text(lines, 20, yPos);
    yPos += lines.length * 6;
  });

  // Footer
  doc.setFillColor(240, 240, 240);
  doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');

  doc.setTextColor(mutedColor);
  doc.setFontSize(9);
  doc.text('NeuroElemental™ - Energy Management for Neurodivergent Minds', pageWidth / 2, pageHeight - 20, { align: 'center' });
  doc.text('Visit neuroelemental.com for courses, tools, and community', pageWidth / 2, pageHeight - 14, { align: 'center' });
  doc.text('This is an educational self-awareness tool, not a diagnostic instrument', pageWidth / 2, pageHeight - 8, { align: 'center' });

  // Return as blob
  return doc.output('blob');
}

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
