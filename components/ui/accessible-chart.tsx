'use client';

import { cn } from '@/lib/utils';
import { generateChartSummary } from '@/lib/utils/accessibility';
import { ReactNode } from 'react';

interface AccessibleChartProps {
  children: ReactNode;
  chartType: 'energy-trend' | 'mode-distribution' | 'element-scores';
  data: Record<string, number>;
  title: string;
  className?: string;
}

/**
 * Accessible Chart Wrapper
 * Requirements: 21.3 - Text summaries for screen readers
 *
 * Wraps chart components with proper ARIA attributes and
 * provides text summaries for screen reader users
 */
export function AccessibleChart({
  children,
  chartType,
  data,
  title,
  className,
}: AccessibleChartProps) {
  const summary = generateChartSummary(chartType, data);

  return (
    <figure
      role="img"
      aria-label={title}
      className={cn('relative', className)}
    >
      {/* Screen reader summary */}
      <figcaption className="sr-only">{summary}</figcaption>

      {/* Visual chart */}
      <div aria-hidden="true">{children}</div>

      {/* Visible summary for users who prefer text */}
      <details className="mt-2 text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          View chart data as text
        </summary>
        <p className="mt-1 p-2 bg-muted/50 rounded">{summary}</p>
      </details>
    </figure>
  );
}

/**
 * Simple data table alternative to charts
 * For users who prefer tabular data
 */
interface DataTableAlternativeProps {
  data: Array<{ label: string; value: number | string }>;
  title: string;
  className?: string;
}

export function DataTableAlternative({
  data,
  title,
  className,
}: DataTableAlternativeProps) {
  return (
    <table
      className={cn('w-full text-sm', className)}
      aria-label={title}
    >
      <caption className="sr-only">{title}</caption>
      <thead>
        <tr className="border-b">
          <th scope="col" className="text-left py-2 font-medium">
            Item
          </th>
          <th scope="col" className="text-right py-2 font-medium">
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index} className="border-b border-muted">
            <td className="py-2">{row.label}</td>
            <td className="py-2 text-right">{row.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
