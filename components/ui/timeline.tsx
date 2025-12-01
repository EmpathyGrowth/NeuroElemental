'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Clock, Lock, PlayCircle } from 'lucide-react';
import * as React from 'react';

interface TimelineProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

interface TimelineItemProps {
  children: React.ReactNode;
  className?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'locked';
  isLast?: boolean;
}

interface TimelineIconProps {
  status?: 'completed' | 'current' | 'upcoming' | 'locked';
  className?: string;
  icon?: React.ReactNode;
}

interface TimelineContentProps {
  children: React.ReactNode;
  className?: string;
}

interface TimelineConnectorProps {
  className?: string;
  status?: 'completed' | 'current' | 'upcoming' | 'locked';
}

const Timeline = React.forwardRef<HTMLDivElement, TimelineProps>(
  ({ children, className, orientation = 'vertical' }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative',
          orientation === 'vertical' ? 'flex flex-col' : 'flex flex-row',
          className
        )}
      >
        {children}
      </div>
    );
  }
);
Timeline.displayName = 'Timeline';

const TimelineItem = React.forwardRef<HTMLDivElement, TimelineItemProps>(
  ({ children, className, status = 'upcoming', isLast = false }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative flex gap-4',
          !isLast && 'pb-8',
          className
        )}
        data-status={status}
      >
        {children}
      </div>
    );
  }
);
TimelineItem.displayName = 'TimelineItem';

const TimelineIcon = React.forwardRef<HTMLDivElement, TimelineIconProps>(
  ({ status = 'upcoming', className, icon }, ref) => {
    const statusStyles = {
      completed: 'bg-green-500 text-white border-green-500',
      current: 'bg-primary text-primary-foreground border-primary animate-pulse',
      upcoming: 'bg-muted text-muted-foreground border-muted-foreground/30',
      locked: 'bg-muted/50 text-muted-foreground/50 border-muted-foreground/20',
    };

    const defaultIcons = {
      completed: <CheckCircle2 className="h-4 w-4" />,
      current: <PlayCircle className="h-4 w-4" />,
      upcoming: <Circle className="h-4 w-4" />,
      locked: <Lock className="h-4 w-4" />,
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all',
          statusStyles[status],
          className
        )}
      >
        {icon || defaultIcons[status]}
      </div>
    );
  }
);
TimelineIcon.displayName = 'TimelineIcon';

const TimelineConnector = React.forwardRef<HTMLDivElement, TimelineConnectorProps>(
  ({ className, status = 'upcoming' }, ref) => {
    const statusStyles = {
      completed: 'bg-green-500',
      current: 'bg-gradient-to-b from-primary to-muted-foreground/30',
      upcoming: 'bg-muted-foreground/30',
      locked: 'bg-muted-foreground/20',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute left-4 top-8 -ml-px h-full w-0.5 -translate-x-1/2',
          statusStyles[status],
          className
        )}
      />
    );
  }
);
TimelineConnector.displayName = 'TimelineConnector';

const TimelineContent = React.forwardRef<HTMLDivElement, TimelineContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn('flex-1 pt-1', className)}>
        {children}
      </div>
    );
  }
);
TimelineContent.displayName = 'TimelineContent';

const TimelineTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
TimelineTitle.displayName = 'TimelineTitle';

const TimelineDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground mt-1', className)}
    {...props}
  />
));
TimelineDescription.displayName = 'TimelineDescription';

const TimelineTime = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn('flex items-center gap-1 text-xs text-muted-foreground mt-1', className)}
    {...props}
  >
    <Clock className="h-3 w-3" />
    {props.children}
  </span>
));
TimelineTime.displayName = 'TimelineTime';

export {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineIcon,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
};
