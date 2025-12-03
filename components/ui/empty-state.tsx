'use client';

import { cn } from '@/lib/utils';
import { LucideIcon, FileQuestion, Inbox, Search, AlertCircle, BarChart3, Users, Calendar, FileText, Image, Settings } from 'lucide-react';
import { Button } from './button';
import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline';
}

/**
 * Reusable empty state component for consistent UX across admin pages
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
  variant = 'default',
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: 'py-6',
      icon: 'h-8 w-8',
      iconWrapper: 'p-2',
      title: 'text-base',
      description: 'text-sm',
    },
    md: {
      container: 'py-12',
      icon: 'h-10 w-10',
      iconWrapper: 'p-3',
      title: 'text-lg',
      description: 'text-sm',
    },
    lg: {
      container: 'py-16',
      icon: 'h-12 w-12',
      iconWrapper: 'p-4',
      title: 'text-xl',
      description: 'text-base',
    },
  };

  const variantStyles = {
    default: '',
    card: 'rounded-lg border bg-card p-6',
    inline: 'flex items-center gap-4 text-left',
  };

  const styles = sizeStyles[size];

  const renderIcon = () => {
    if (!Icon) return null;
    
    if (typeof Icon === 'function') {
      const IconComponent = Icon as LucideIcon;
      return (
        <div className={cn('rounded-full bg-muted mb-4', styles.iconWrapper)}>
          <IconComponent className={cn(styles.icon, 'text-muted-foreground')} />
        </div>
      );
    }
    
    return <div className="mb-4">{Icon}</div>;
  };

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-4', className)}>
        {Icon && typeof Icon === 'function' && (
          <div className={cn('rounded-full bg-muted shrink-0', styles.iconWrapper)}>
            {(() => {
              const IconComponent = Icon as LucideIcon;
              return <IconComponent className={cn(styles.icon, 'text-muted-foreground')} />;
            })()}
          </div>
        )}
        <div className="flex-1">
          <p className={cn('font-medium', styles.title)}>{title}</p>
          {description && (
            <p className={cn('text-muted-foreground mt-0.5', styles.description)}>
              {description}
            </p>
          )}
        </div>
        {action && (
          <Button
            variant={action.variant || 'default'}
            size="sm"
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        styles.container,
        variantStyles[variant],
        className
      )}
    >
      {renderIcon()}
      <h3 className={cn('font-semibold', styles.title)}>{title}</h3>
      {description && (
        <p className={cn('text-muted-foreground mt-1 max-w-md', styles.description)}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-4">
          {action && (
            <Button
              variant={action.variant || 'default'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured empty states for common scenarios
export const EmptyStates = {
  NoResults: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Search}
      title="No results found"
      description="Try adjusting your search or filter criteria"
      {...props}
    />
  ),
  
  NoData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Inbox}
      title="No data yet"
      description="Data will appear here once available"
      {...props}
    />
  ),
  
  NoContent: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={FileText}
      title="No content"
      description="Create your first item to get started"
      {...props}
    />
  ),
  
  NoUsers: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Users}
      title="No users found"
      description="Users will appear here once they sign up"
      {...props}
    />
  ),
  
  NoEvents: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Calendar}
      title="No events scheduled"
      description="Create an event to engage your audience"
      {...props}
    />
  ),
  
  NoMedia: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Image}
      title="No media files"
      description="Upload images and files to use in your content"
      {...props}
    />
  ),
  
  NoChartData: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={BarChart3}
      title="No data to display"
      description="Chart data will appear once there's activity"
      size="sm"
      {...props}
    />
  ),
  
  Error: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={AlertCircle}
      title="Something went wrong"
      description="We couldn't load this data. Please try again."
      {...props}
    />
  ),
  
  NotConfigured: (props: Partial<EmptyStateProps>) => (
    <EmptyState
      icon={Settings}
      title="Not configured"
      description="This feature needs to be set up before use"
      {...props}
    />
  ),
};

/**
 * Chart-specific empty state with proper sizing
 */
export function ChartEmptyState({
  height = 300,
  title = 'No data available',
  description,
  className,
}: {
  height?: number;
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center rounded-lg border border-dashed bg-muted/20',
        className
      )}
      style={{ height }}
    >
      <BarChart3 className="h-8 w-8 text-muted-foreground/50 mb-2" />
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      {description && (
        <p className="text-xs text-muted-foreground/70 mt-1">{description}</p>
      )}
    </div>
  );
}
