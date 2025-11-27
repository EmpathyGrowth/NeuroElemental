/**
 * Centralized date formatting utilities
 * Eliminates duplicate date formatting logic across the codebase
 */

export const DATE_FORMATS = {
  SHORT: { year: 'numeric', month: 'short', day: 'numeric' } as const,
  LONG: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' } as const,
  NUMERIC: { year: 'numeric', month: '2-digit', day: '2-digit' } as const,
  TIME: { hour: '2-digit', minute: '2-digit' } as const,
  DATETIME: {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  } as const,
} as const;

export const TIME_FORMATS = DATE_FORMATS.TIME;

/**
 * Format a date string or Date object to a localized string
 * @param dateString - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions (defaults to SHORT format)
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted date string
 *
 * @example
 * formatDate('2024-03-15') // "Mar 15, 2024"
 * formatDate('2024-03-15', DATE_FORMATS.LONG) // "Friday, March 15, 2024"
 */
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = DATE_FORMATS.SHORT,
  locale: string = 'en-US'
): string {
  return new Date(dateString).toLocaleDateString(locale, options);
}

/**
 * Format a date with time
 * @param dateString - Date string or Date object
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted date and time string
 *
 * @example
 * formatDateTime('2024-03-15T14:30:00') // "Mar 15, 2024, 02:30 PM"
 */
export function formatDateTime(
  dateString: string | Date,
  locale: string = 'en-US'
): string {
  return new Date(dateString).toLocaleDateString(locale, DATE_FORMATS.DATETIME);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 * @param dateString - Date string or Date object
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Relative time string
 *
 * @example
 * formatRelativeTime('2024-03-15T12:00:00') // "2 hours ago"
 */
export function formatRelativeTime(
  dateString: string | Date,
  locale: string = 'en-US'
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, 'minute');
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, 'hour');
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return rtf.format(-diffInDays, 'day');
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return rtf.format(-diffInMonths, 'month');
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return rtf.format(-diffInYears, 'year');
}

/**
 * Format a date range
 * @param start - Start date string or Date object
 * @param end - End date string or Date object
 * @param options - Intl.DateTimeFormatOptions (defaults to SHORT format)
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted date range string
 *
 * @example
 * formatDateRange('2024-03-15', '2024-03-20') // "Mar 15, 2024 - Mar 20, 2024"
 */
export function formatDateRange(
  start: string | Date,
  end: string | Date,
  options: Intl.DateTimeFormatOptions = DATE_FORMATS.SHORT,
  locale: string = 'en-US'
): string {
  return `${formatDate(start, options, locale)} - ${formatDate(end, options, locale)}`;
}

/**
 * Format time only (no date)
 * @param dateString - Date string or Date object
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted time string
 *
 * @example
 * formatTime('2024-03-15T14:30:00') // "02:30 PM"
 */
export function formatTime(
  dateString: string | Date,
  locale: string = 'en-US'
): string {
  return new Date(dateString).toLocaleTimeString(locale, DATE_FORMATS.TIME);
}

/**
 * Check if a date is today
 * @param dateString - Date string or Date object
 * @returns True if the date is today
 */
export function isToday(dateString: string | Date): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * Check if a date is in the past
 * @param dateString - Date string or Date object
 * @returns True if the date is in the past
 */
export function isPast(dateString: string | Date): boolean {
  return new Date(dateString).getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * @param dateString - Date string or Date object
 * @returns True if the date is in the future
 */
export function isFuture(dateString: string | Date): boolean {
  return new Date(dateString).getTime() > Date.now();
}

/**
 * Get days until a date
 * @param dateString - Date string or Date object
 * @returns Number of days (negative if in past)
 */
export function daysUntil(dateString: string | Date): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
}

/**
 * Get hours until a date
 * @param dateString - Date string or Date object
 * @returns Number of hours (negative if in past)
 */
export function hoursUntil(dateString: string | Date): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60));
}
