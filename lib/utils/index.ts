/**
 * Centralized utility exports
 * Import utilities from '@/lib/utils' instead of individual files
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS support
 * Combines clsx and tailwind-merge for optimal class merging
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Error handling utilities
export * from './error-helpers';

// Date formatting utilities
export * from './date-formatting';

// Timestamp utilities
export * from './timestamps';

// CSV export utilities
export * from './csv-export';

// Existing utilities
export * from './formatting';

// Environment utilities
export * from './env';
