'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ValidityBadgeProps {
  hasWarning?: boolean;
  consistency?: number;
}

export function ValidityBadge({
  hasWarning = false,
  consistency,
}: ValidityBadgeProps) {
  if (hasWarning) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 cursor-help"
            >
              <AlertTriangle className="w-3 h-3 mr-1" />
              Review Recommended
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              Some response patterns suggest you might benefit from retaking the
              assessment when you have more time to reflect on each question.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (consistency !== undefined && consistency < 0.5) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 cursor-help"
            >
              <AlertCircle className="w-3 h-3 mr-1" />
              Mixed Signals
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm">
              Your responses show some variability. This could mean you're
              genuinely flexible, or you might benefit from reflecting more
              deeply on each question.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30 cursor-help"
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            High Confidence
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p className="text-sm">
            Your response patterns are consistent, suggesting these results
            accurately reflect your elemental profile.
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
