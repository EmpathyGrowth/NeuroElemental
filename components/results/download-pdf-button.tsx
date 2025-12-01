'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { generateAssessmentPDF } from '@/lib/pdf/assessment-report';
import { logger } from '@/lib/logging';
import type { ElementType } from '@/lib/content/assessment-questions';

interface DownloadPDFButtonProps {
  userName?: string;
  topElements: Array<{ element: ElementType; score: number; name: string }>;
  blendType?: string;
  energyStyle?: string;
  className?: string;
}

/**
 * Button to download assessment results as PDF
 */
export function DownloadPDFButton({
  userName,
  topElements,
  blendType,
  energyStyle,
  className,
}: DownloadPDFButtonProps) {
  const [generating, setGenerating] = useState(false);

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await generateAssessmentPDF({
        userName,
        topElements,
        blendType,
        energyStyle,
        completedDate: new Date(),
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `NeuroElemental-Profile-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      logger.error('Failed to generate PDF:', error as Error);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={generating}
      variant="outline"
      className={className}
    >
      {generating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download PDF Report
        </>
      )}
    </Button>
  );
}
