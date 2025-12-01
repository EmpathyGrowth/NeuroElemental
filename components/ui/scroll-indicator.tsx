'use client';

/**
 * Scroll Indicator Component
 * Animated bouncing chevron to indicate scrollable content
 */

import { cn } from '@/lib/utils';

interface ScrollIndicatorProps {
  className?: string;
}

export function ScrollIndicator({ className }: ScrollIndicatorProps) {
  return (
    <div
      className={cn(
        'absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce duration-2000 text-muted-foreground/50',
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-8 h-8"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
}
