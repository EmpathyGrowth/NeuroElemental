'use client';

import { useRouter } from 'next/navigation';
import { ResponsiveBreadcrumbs, type BreadcrumbItem } from '@/components/ui/breadcrumbs';
import { useDashboardBreadcrumbs, usePageTitle } from '@/hooks/use-dashboard-breadcrumbs';
import { cn } from '@/lib/utils';

export interface DashboardHeaderProps {
  /**
   * Custom page title. If not provided, derived from breadcrumbs.
   */
  title?: string;
  /**
   * Optional subtitle displayed below the title
   */
  subtitle?: string;
  /**
   * Custom labels for specific path segments
   */
  customLabels?: Record<string, string>;
  /**
   * Action buttons or elements to display on the right
   */
  actions?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show the breadcrumbs (default: true)
   */
  showBreadcrumbs?: boolean;
  /**
   * Override breadcrumb items instead of auto-generating
   */
  breadcrumbItems?: BreadcrumbItem[];
}

/**
 * Dashboard page header with automatic breadcrumbs, title, and actions area
 *
 * @example
 * // Basic usage - auto-generates from URL
 * <DashboardHeader />
 *
 * @example
 * // With custom title and actions
 * <DashboardHeader
 *   title="Course Management"
 *   subtitle="Create and manage your courses"
 *   actions={<Button>New Course</Button>}
 * />
 *
 * @example
 * // With custom path labels
 * <DashboardHeader
 *   customLabels={{ '123e4567-e89b-12d3-a456-426614174000': 'Introduction to React' }}
 * />
 */
export function DashboardHeader({
  title,
  subtitle,
  customLabels,
  actions,
  className,
  showBreadcrumbs = true,
  breadcrumbItems,
}: DashboardHeaderProps) {
  const router = useRouter();
  const autoBreadcrumbs = useDashboardBreadcrumbs(customLabels);
  const autoTitle = usePageTitle(title);

  const breadcrumbs = breadcrumbItems || autoBreadcrumbs;

  // Remove current page from breadcrumbs (show in title instead)
  const parentBreadcrumbs = breadcrumbs.slice(0, -1);

  const handleNavigate = (item: BreadcrumbItem) => {
    if (item.href) {
      router.push(item.href);
    }
  };

  return (
    <div className={cn('space-y-2 mb-6', className)}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && parentBreadcrumbs.length > 0 && (
        <ResponsiveBreadcrumbs
          items={parentBreadcrumbs}
          onNavigate={handleNavigate}
          maxItems={5}
          mobileMaxItems={2}
        />
      )}

      {/* Title and Actions Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">
            {title || autoTitle}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact header variant for nested pages or sections
 */
export function DashboardSectionHeader({
  title,
  subtitle,
  actions,
  className,
}: Omit<DashboardHeaderProps, 'showBreadcrumbs' | 'customLabels' | 'breadcrumbItems'>) {
  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4', className)}>
      <div className="min-w-0">
        <h2 className="text-xl font-semibold tracking-tight truncate">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
