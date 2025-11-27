/**
 * Centralized timestamp utilities
 * Eliminates 40+ instances of new Date().toISOString()
 */

/**
 * Get current timestamp in ISO format
 * @returns ISO 8601 timestamp string
 *
 * @example
 * getCurrentTimestamp() // "2024-03-15T14:30:00.000Z"
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Get timestamp fields for database records (created_at, updated_at)
 * @returns Object with created_at and updated_at timestamps
 *
 * @example
 * const timestamps = getTimestampFields()
 * // { created_at: "2024-03-15T14:30:00.000Z", updated_at: "2024-03-15T14:30:00.000Z" }
 */
export function getTimestampFields() {
  const now = getCurrentTimestamp();
  return {
    created_at: now,
    updated_at: now,
  };
}

/**
 * Get update timestamp field
 * @returns Object with updated_at timestamp
 *
 * @example
 * const update = getUpdateTimestamp()
 * // { updated_at: "2024-03-15T14:30:00.000Z" }
 */
export function getUpdateTimestamp() {
  return {
    updated_at: getCurrentTimestamp(),
  };
}

/**
 * Get a timestamp for a specific date
 * @param date - Date object or date string
 * @returns ISO 8601 timestamp string
 *
 * @example
 * getTimestampFor(new Date('2024-03-15')) // "2024-03-15T00:00:00.000Z"
 */
export function getTimestampFor(date: Date | string): string {
  return new Date(date).toISOString();
}

/**
 * Get timestamp for X days from now
 * @param days - Number of days (positive for future, negative for past)
 * @returns ISO 8601 timestamp string
 *
 * @example
 * getTimestampDaysFromNow(7) // Timestamp for 7 days from now
 * getTimestampDaysFromNow(-7) // Timestamp for 7 days ago
 */
export function getTimestampDaysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

/**
 * Get timestamp for X hours from now
 * @param hours - Number of hours (positive for future, negative for past)
 * @returns ISO 8601 timestamp string
 *
 * @example
 * getTimestampHoursFromNow(24) // Timestamp for 24 hours from now
 */
export function getTimestampHoursFromNow(hours: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

/**
 * Get timestamp for start of day
 * @param date - Date object or date string (defaults to today)
 * @returns ISO 8601 timestamp string for start of day
 *
 * @example
 * getStartOfDay() // "2024-03-15T00:00:00.000Z"
 */
export function getStartOfDay(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get timestamp for end of day
 * @param date - Date object or date string (defaults to today)
 * @returns ISO 8601 timestamp string for end of day
 *
 * @example
 * getEndOfDay() // "2024-03-15T23:59:59.999Z"
 */
export function getEndOfDay(date?: Date | string): string {
  const d = date ? new Date(date) : new Date();
  d.setHours(23, 59, 59, 999);
  return d.toISOString();
}

/**
 * Get deletion timestamp (for soft deletes)
 * @returns Object with deleted_at timestamp
 *
 * @example
 * const deletion = getDeletionTimestamp()
 * // { deleted_at: "2024-03-15T14:30:00.000Z" }
 */
export function getDeletionTimestamp() {
  return {
    deleted_at: getCurrentTimestamp(),
  };
}

/**
 * Get completion timestamp
 * @returns Object with completed_at timestamp
 *
 * @example
 * const completion = getCompletionTimestamp()
 * // { completed_at: "2024-03-15T14:30:00.000Z" }
 */
export function getCompletionTimestamp() {
  return {
    completed_at: getCurrentTimestamp(),
  };
}

/**
 * Get expiry timestamp (expires_at)
 * @param days - Number of days until expiry
 * @returns Object with expires_at timestamp
 *
 * @example
 * const expiry = getExpiryTimestamp(30) // Expires in 30 days
 * // { expires_at: "2024-04-14T14:30:00.000Z" }
 */
export function getExpiryTimestamp(days: number) {
  return {
    expires_at: getTimestampDaysFromNow(days),
  };
}

/**
 * Check if a timestamp is expired
 * @param timestamp - ISO 8601 timestamp string
 * @returns True if timestamp is in the past
 */
export function isExpired(timestamp: string): boolean {
  return new Date(timestamp).getTime() < Date.now();
}
