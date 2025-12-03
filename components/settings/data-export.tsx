'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { Download, FileJson, FileSpreadsheet, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

type ExportFormat = 'json' | 'csv' | 'pdf';
type ExportType = 'all' | 'checkins' | 'budgets' | 'states' | 'shadow' | 'ratings' | 'quizzes';

interface DataExportProps {
  className?: string;
}

/**
 * Data Export Settings Component
 * Requirements: 13.4 - Format selection and download button
 */
export function DataExport({ className }: DataExportProps) {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [dataType, setDataType] = useState<ExportType>('all');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/export/tools?format=${format}&type=${dataType}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get the blob from response
      const blob = await response.blob();

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // Set filename based on format
      const timestamp = Date.now();
      const extensions: Record<ExportFormat, string> = {
        json: 'json',
        csv: 'csv',
        pdf: 'pdf',
      };
      a.download = `neuroelemental-tools-export-${timestamp}.${extensions[format]}`;

      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Export downloaded successfully!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatOptions = [
    {
      value: 'json' as const,
      label: 'JSON',
      description: 'Machine-readable format for backups',
      icon: FileJson,
    },
    {
      value: 'csv' as const,
      label: 'CSV',
      description: 'Spreadsheet format for analysis',
      icon: FileSpreadsheet,
    },
    {
      value: 'pdf' as const,
      label: 'PDF',
      description: 'Human-readable report with charts',
      icon: FileText,
    },
  ];

  const dataTypeOptions = [
    { value: 'all' as const, label: 'All Tool Data' },
    { value: 'checkins' as const, label: 'Daily Check-ins' },
    { value: 'budgets' as const, label: 'Energy Budgets' },
    { value: 'states' as const, label: 'State Logs' },
    { value: 'shadow' as const, label: 'Shadow Work Sessions' },
    { value: 'ratings' as const, label: 'Strategy Ratings' },
    { value: 'quizzes' as const, label: 'Quick Quiz Results' },
  ];

  return (
    <Card className={cn('glass-card', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Your Data
        </CardTitle>
        <CardDescription>
          Download your tool data for personal records or to share with your therapist/coach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Format Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Export Format</Label>
          <div className="grid grid-cols-3 gap-3">
            {formatOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFormat(option.value)}
                className={cn(
                  'flex flex-col items-center gap-2 p-4 rounded-lg border transition-all',
                  format === option.value
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <option.icon
                  className={cn(
                    'w-6 h-6',
                    format === option.value ? 'text-primary' : 'text-muted-foreground'
                  )}
                />
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground text-center">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Data Type Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Data to Export</Label>
          <RadioGroup
            value={dataType}
            onValueChange={(value) => setDataType(value as ExportType)}
            className="grid grid-cols-2 gap-2"
          >
            {dataTypeOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value} className="text-sm cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Export Button */}
        <Button
          onClick={handleExport}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Preparing Export...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download {format.toUpperCase()} Export
            </>
          )}
        </Button>

        {/* Info text */}
        <p className="text-xs text-muted-foreground text-center">
          Your data is exported directly to your device. We don't store copies of exports.
        </p>
      </CardContent>
    </Card>
  );
}
