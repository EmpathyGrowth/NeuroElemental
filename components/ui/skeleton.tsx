'use client';

import { cn } from '@/lib/utils';
import * as React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'rectangular';
  animation?: 'pulse' | 'wave' | 'none';
  width?: string | number;
  height?: string | number;
}

/**
 * Base skeleton component with multiple variants and animation styles
 */
function Skeleton({
  className,
  variant = 'default',
  animation = 'pulse',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
    rectangular: 'rounded-none',
  };

  const animationStyles = {
    pulse: 'animate-pulse',
    wave: 'skeleton-wave',
    none: '',
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantStyles[variant],
        animationStyles[animation],
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

/**
 * Course card skeleton for loading states
 */
function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      {/* Image placeholder */}
      <Skeleton className="w-full h-40" variant="rectangular" />

      <div className="p-4 space-y-3">
        {/* Badge */}
        <Skeleton className="h-5 w-16" />

        {/* Title */}
        <Skeleton className="h-6 w-3/4" />

        {/* Description */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-5/6" variant="text" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" variant="circular" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * Event card skeleton for loading states
 */
function EventCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 space-y-3', className)}>
      {/* Date badge */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-14 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circular" />
          <Skeleton className="h-4 w-32" variant="text" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" variant="circular" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
      </div>

      {/* Action button */}
      <Skeleton className="h-9 w-full mt-3" />
    </div>
  );
}

/**
 * Table row skeleton for data tables
 */
function TableRowSkeleton({
  columns = 5,
  className
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <tr className={cn('border-b', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton
            className="h-4"
            style={{ width: `${Math.random() * 40 + 60}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

/**
 * Avatar skeleton with optional text
 */
function AvatarSkeleton({
  size = 'md',
  showText = false,
  className
}: {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}) {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Skeleton className={sizeStyles[size]} variant="circular" />
      {showText && (
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      )}
    </div>
  );
}

/**
 * Stat card skeleton for dashboard metrics
 */
function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" variant="text" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
    </div>
  );
}

/**
 * Blog/Article card skeleton
 */
function BlogCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card overflow-hidden', className)}>
      <Skeleton className="w-full h-48" variant="rectangular" />
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-4 w-24" variant="text" />
        </div>
        <Skeleton className="h-6 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" variant="text" />
          <Skeleton className="h-4 w-4/5" variant="text" />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Skeleton className="h-8 w-8" variant="circular" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    </div>
  );
}

/**
 * Lesson item skeleton for course content
 */
function LessonItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4 p-3 rounded-lg border', className)}>
      <Skeleton className="h-8 w-8 rounded-lg" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" variant="text" />
      </div>
      <Skeleton className="h-5 w-12" />
    </div>
  );
}

/**
 * Text block skeleton for paragraphs
 */
function TextSkeleton({
  lines = 3,
  className
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          variant="text"
          style={{ width: i === lines - 1 ? '75%' : '100%' }}
        />
      ))}
    </div>
  );
}

/**
 * Navigation skeleton for sidebar items
 */
function NavItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-3 px-3 py-2', className)}>
      <Skeleton className="h-5 w-5" variant="circular" />
      <Skeleton className="h-4 w-24" />
    </div>
  );
}

/**
 * Form field skeleton
 */
function FormFieldSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}

/**
 * Comment skeleton for discussion threads
 */
function CommentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3', className)}>
      <Skeleton className="h-10 w-10 shrink-0" variant="circular" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
        <TextSkeleton lines={2} />
      </div>
    </div>
  );
}

/**
 * Table skeleton for data table loading states
 */
function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Card grid skeleton for card-based layouts
 */
function CardGridSkeleton({
  cards = 6,
  columns = 3,
  className,
}: {
  cards?: number;
  columns?: number;
  className?: string;
}) {
  const gridCols: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Grid */}
      <div className={cn('grid gap-6', gridCols[columns] || gridCols[3])}>
        {Array.from({ length: cards }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton for form loading states
 */
function FormSkeleton({
  fields = 4,
  className,
}: {
  fields?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      {/* Form fields */}
      <div className="space-y-4">
        {Array.from({ length: fields }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>
      {/* Submit button */}
      <Skeleton className="h-10 w-32" />
    </div>
  );
}

/**
 * Dashboard skeleton with configurable card count for loading states
 */
function DashboardSkeleton({
  cardCount = 4,
  className,
}: {
  cardCount?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {Array.from({ length: cardCount }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-1" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-48 w-full rounded" />
        </div>
      </div>
    </div>
  );
}

/**
 * Users skeleton for user list loading states
 */
function UsersSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <table className="w-full">
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <TableRowSkeleton key={i} columns={5} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Courses skeleton for course list loading states
 */
function CoursesSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Events skeleton for event list loading states
 */
function EventsSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <EventCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Video player skeleton
 */
function VideoPlayerSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative rounded-lg overflow-hidden bg-muted', className)}>
      <Skeleton className="w-full aspect-video" variant="rectangular" animation="none" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Skeleton className="h-16 w-16 rounded-full" animation="pulse" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
        <Skeleton className="h-1 w-full rounded-full mb-3" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

export {
  AvatarSkeleton,
  BlogCardSkeleton,
  CardGridSkeleton,
  CommentSkeleton,
  CourseCardSkeleton,
  CoursesSkeleton,
  DashboardSkeleton,
  EventCardSkeleton,
  EventsSkeleton,
  FormFieldSkeleton,
  FormSkeleton,
  LessonItemSkeleton,
  NavItemSkeleton,
  Skeleton,
  StatCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  TextSkeleton,
  UsersSkeleton,
  VideoPlayerSkeleton,
};
