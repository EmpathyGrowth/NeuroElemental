'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';

interface PaginationProps extends React.ComponentProps<'nav'> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

interface PaginationButtonProps
  extends React.ComponentProps<typeof Button>,
    VariantProps<typeof buttonVariants> {
  isActive?: boolean;
}

/**
 * Generate array of page numbers to display
 */
function generatePagination(
  currentPage: number,
  totalPages: number,
  siblingCount: number = 1
): (number | 'ellipsis')[] {
  // Always show first page, last page, and siblings around current
  const firstPage = 1;
  const lastPage = totalPages;

  // Calculate range of pages to show
  const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);

  // Should we show dots?
  const shouldShowLeftDots = leftSiblingIndex > firstPage + 1;
  const shouldShowRightDots = rightSiblingIndex < lastPage - 1;

  // Always include first and last page
  const pages: (number | 'ellipsis')[] = [];

  // Add first page
  pages.push(firstPage);

  // Add left ellipsis
  if (shouldShowLeftDots) {
    pages.push('ellipsis');
  }

  // Add pages between first and last
  for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
    if (i !== firstPage && i !== lastPage) {
      pages.push(i);
    }
  }

  // Add right ellipsis
  if (shouldShowRightDots) {
    pages.push('ellipsis');
  }

  // Add last page if more than 1 page
  if (lastPage > firstPage) {
    pages.push(lastPage);
  }

  return pages;
}

function PaginationButton({
  className,
  isActive,
  size = 'icon',
  ...props
}: PaginationButtonProps) {
  return (
    <Button
      aria-current={isActive ? 'page' : undefined}
      variant={isActive ? 'default' : 'outline'}
      size={size}
      className={cn('h-9 w-9', className)}
      {...props}
    />
  );
}

/**
 * Pagination component for navigating through pages of content
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  className,
  ...props
}: PaginationProps) {
  const pages = generatePagination(currentPage, totalPages, siblingCount);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      role="navigation"
      aria-label="pagination"
      className={cn('mx-auto flex w-full justify-center', className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        {/* Previous button */}
        <li>
          <PaginationButton
            aria-label="Go to previous page"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </PaginationButton>
        </li>

        {/* Page numbers */}
        {pages.map((page, index) =>
          page === 'ellipsis' ? (
            <li key={`ellipsis-${index}`}>
              <span className="flex h-9 w-9 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More pages</span>
              </span>
            </li>
          ) : (
            <li key={page}>
              <PaginationButton
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
                aria-label={`Go to page ${page}`}
              >
                {page}
              </PaginationButton>
            </li>
          )
        )}

        {/* Next button */}
        <li>
          <PaginationButton
            aria-label="Go to next page"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </PaginationButton>
        </li>
      </ul>
    </nav>
  );
}

/**
 * Pagination info text showing current range and total
 */
export function PaginationInfo({
  currentPage,
  pageSize,
  totalItems,
  className,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  className?: string;
}) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      Showing <span className="font-medium">{start}</span> to{' '}
      <span className="font-medium">{end}</span> of{' '}
      <span className="font-medium">{totalItems}</span> results
    </p>
  );
}

/**
 * Page size selector dropdown
 */
export function PageSizeSelect({
  pageSize,
  onPageSizeChange,
  options = [10, 20, 50, 100],
  className,
}: {
  pageSize: number;
  onPageSizeChange: (size: number) => void;
  options?: number[];
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground">Show</span>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        className="h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-muted-foreground">per page</span>
    </div>
  );
}
