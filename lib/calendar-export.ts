/**
 * Calendar Export Utilities
 * Generate iCal files and Google Calendar URLs for events
 */

import { format } from 'date-fns';

interface CalendarEvent {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  url?: string;
  timezone?: string;
}

/**
 * Format a date for iCal (YYYYMMDDTHHMMSS format)
 */
function formatICalDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

/**
 * Format a date for Google Calendar URL (YYYYMMDDTHHMMSSZ format)
 */
function formatGoogleCalendarDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

/**
 * Escape special characters for iCal format
 */
function escapeICalText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate an iCal (.ics) file content
 */
export function generateICalEvent(event: CalendarEvent): string {
  const uid = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}@neuroelemental.com`;
  const now = formatICalDate(new Date());

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NeuroElemental//Event Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${formatICalDate(event.startDate)}`,
    `DTEND:${formatICalDate(event.endDate)}`,
    `SUMMARY:${escapeICalText(event.title)}`,
    `DESCRIPTION:${escapeICalText(event.description)}`,
  ];

  if (event.location) {
    lines.push(`LOCATION:${escapeICalText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Generate a Google Calendar add event URL
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${formatGoogleCalendarDate(event.startDate)}/${formatGoogleCalendarDate(event.endDate)}`,
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generate an Outlook.com calendar URL
 */
export function generateOutlookUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: event.startDate.toISOString(),
    enddt: event.endDate.toISOString(),
  });

  if (event.location) {
    params.set('location', event.location);
  }

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generate a Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    v: '60',
    title: event.title,
    desc: event.description,
    st: formatICalDate(event.startDate),
    et: formatICalDate(event.endDate),
  });

  if (event.location) {
    params.set('in_loc', event.location);
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Download an iCal file for the event
 */
export function downloadICalFile(event: CalendarEvent, filename?: string): void {
  const icalContent = generateICalEvent(event);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = filename || `${event.title.toLowerCase().replace(/\s+/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get all calendar export options for an event
 */
export function getCalendarExportOptions(event: CalendarEvent) {
  return {
    google: generateGoogleCalendarUrl(event),
    outlook: generateOutlookUrl(event),
    yahoo: generateYahooCalendarUrl(event),
    ical: () => downloadICalFile(event),
  };
}
