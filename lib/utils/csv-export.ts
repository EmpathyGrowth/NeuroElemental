/**
 * Centralized CSV export utilities
 * Eliminates duplicate CSV export logic across the codebase
 */

import { getCurrentTimestamp } from './timestamps';

export interface CSVColumn<T = any> {
  key: keyof T | string;
  label: string;
  format?: (value: any, row?: T) => string;
}

/**
 * Convert data to CSV string
 * @param data - Array of objects to convert
 * @param columns - Column definitions (key and label)
 * @returns CSV string
 *
 * @example
 * const csv = dataToCSV(users, [
 *   { key: 'name', label: 'Name' },
 *   { key: 'email', label: 'Email' },
 * ])
 */
export function dataToCSV<T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn<T>[]
): string {
  if (data.length === 0) return '';

  // Create header row
  const headers = columns.map(col => escapeCSVValue(col.label));
  const headerRow = headers.join(',');

  // Create data rows
  const dataRows = data.map(item => {
    const values = columns.map(col => {
      const value = getNestedValue(item, col.key as string);
      const formattedValue = col.format ? col.format(value, item) : value;
      return escapeCSVValue(String(formattedValue ?? ''));
    });
    return values.join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 * @param value - Value to escape
 * @returns Escaped value
 */
function escapeCSVValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes and escape existing quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Get nested object value by path (e.g., 'user.name')
 * @param obj - Object to get value from
 * @param path - Dot-notation path
 * @returns Value at path
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current: any, key: any) => current?.[key], obj);
}

/**
 * Download data as CSV file
 * @param data - Array of objects to export
 * @param filename - Filename (without extension)
 * @param columns - Column definitions
 *
 * @example
 * exportToCSV(users, 'users-export', [
 *   { key: 'name', label: 'Name' },
 *   { key: 'email', label: 'Email' },
 * ])
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: CSVColumn<T>[]
): void {
  const csv = dataToCSV(data, columns);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
}

/**
 * Download data as CSV with timestamp in filename
 * @param data - Array of objects to export
 * @param filename - Base filename (without extension)
 * @param columns - Column definitions
 *
 * @example
 * exportToCSVWithTimestamp(users, 'users', columns)
 * // Downloads as: users-2024-03-15.csv
 */
export function exportToCSVWithTimestamp<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns: CSVColumn<T>[]
): void {
  const timestamp = getCurrentTimestamp().split('T')[0]; // YYYY-MM-DD
  exportToCSV(data, `${filename}-${timestamp}`, columns);
}

/**
 * Download a blob as a file
 * @param blob - Blob to download
 * @param filename - Filename with extension
 *
 * @example
 * const blob = new Blob(['content'], { type: 'text/plain' })
 * downloadBlob(blob, 'file.txt')
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download string content as a file
 * @param content - String content
 * @param filename - Filename with extension
 * @param mimeType - MIME type (defaults to text/plain)
 *
 * @example
 * downloadFile('Hello World', 'hello.txt')
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = new Blob([content], { type: mimeType });
  downloadBlob(blob, filename);
}

/**
 * Convert array of objects to CSV and return as string
 * Uses object keys as headers
 * @param data - Array of objects
 * @returns CSV string
 *
 * @example
 * const csv = arrayToCSV([{ name: 'John', age: 30 }])
 * // "name,age\nJohn,30"
 */
export function arrayToCSV(data: Record<string, any>[]): string {
  if (data.length === 0) return '';

  // Use keys from first object as headers
  const keys = Object.keys(data[0]);
  const columns: CSVColumn[] = keys.map(key => ({ key, label: key }));

  return dataToCSV(data, columns);
}

/**
 * Parse CSV string to array of objects
 * @param csv - CSV string
 * @param hasHeader - Whether first row is header (default: true)
 * @returns Array of objects
 *
 * @example
 * const data = parseCSV('name,age\nJohn,30')
 * // [{ name: 'John', age: '30' }]
 */
export function parseCSV(csv: string, hasHeader: boolean = true): Record<string, string>[] {
  const lines = csv.trim().split('\n');
  if (lines.length === 0) return [];

  const headers = hasHeader ? lines[0].split(',').map(h => h.trim()) : [];
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines.map((line, _index) => {
    const values = line.split(',').map(v => v.trim());
    const obj: Record<string, string> = {};

    values.forEach((value, i) => {
      const key = hasHeader ? headers[i] : `column${i}`;
      obj[key] = value;
    });

    return obj;
  });
}

/**
 * Export multiple sheets as separate CSV files in a zip
 * Requires a zip library (not included)
 * @param sheets - Object with sheet names as keys and data arrays as values
 * @param filename - Base filename for the zip
 */
export function exportMultipleSheetsToCSV(
  sheets: Record<string, { data: any[]; columns: CSVColumn[] }>,
  filename: string
): void {
  // For multiple sheets, export each as a separate CSV with the sheet name
  Object.entries(sheets).forEach(([sheetName, { data, columns }]) => {
    exportToCSV(data, `${filename}-${sheetName}`, columns);
  });
}
