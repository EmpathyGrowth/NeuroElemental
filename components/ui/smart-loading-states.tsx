'use client';

import { ReactNode } from 'react';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface SmartLoadingStatesProps {
  /**
   * Whether data is currently loading
   */
  isLoading: boolean;
  /**
   * Error object if loading failed
   */
  error?: Error | null;
  /**
   * Whether the loaded data is empty
   */
  isEmpty?: boolean;
  /**
   * Custom loading message
   */
  loadingText?: string;
  /**
   * Custom empty state message
   */
  emptyText?: string;
  /**
   * Custom empty state description
   */
  emptyDescription?: string;
  /**
   * Retry function for error states
   */
  retryAction?: () => void;
  /**
   * Content to display when loaded successfully
   */
  children: ReactNode;
  /**
   * Custom loading component
   */
  loadingComponent?: ReactNode;
  /**
   * Custom empty component
   */
  emptyComponent?: ReactNode;
}

/**
 * Smart loading states wrapper
 * Handles loading, error, and empty states consistently
 *
 * Inspired by drivingschoolSaaS pattern for consistent UX
 *
 * @example
 * ```tsx
 * <SmartLoadingStates
 *   isLoading={isLoading}
 *   error={error}
 *   isEmpty={courses.length === 0}
 *   loadingText="Loading courses..."
 *   emptyText="No courses found"
 *   emptyDescription="Browse available courses to get started"
 *   retryAction={() => refetch()}
 * >
 *   <CourseList courses={courses} />
 * </SmartLoadingStates>
 * ```
 */
export function SmartLoadingStates({
  isLoading,
  error,
  isEmpty = false,
  loadingText = 'Loading...',
  emptyText = 'No data found',
  emptyDescription,
  retryAction,
  children,
  loadingComponent,
  emptyComponent,
}: SmartLoadingStatesProps) {
  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{loadingText}</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading data</AlertTitle>
        <AlertDescription>
          <p className="mb-3">{error.message || 'An unexpected error occurred'}</p>
          {retryAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={retryAction}
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (isEmpty) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }

    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-2">
        <div className="rounded-full bg-muted p-3 mb-2">
          <AlertTriangle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">{emptyText}</h3>
        {emptyDescription && (
          <p className="text-sm text-muted-foreground max-w-md">
            {emptyDescription}
          </p>
        )}
      </div>
    );
  }

  // Success state - render children
  return <>{children}</>;
}
