/**
 * Waitlist Repository
 * Manages course/event pre-launch signups and notifications
 */

import { logger } from '@/lib/logging';
import { BaseRepository } from './base-repository';
import type { Database } from '@/lib/types/supabase';
// Direct import to avoid circular dependency with @/lib/api barrel
import { internalError } from '@/lib/api/error-handler';
import type { SupabaseClient } from '@supabase/supabase-js';

type WaitlistInsert = Database['public']['Tables']['waitlist']['Insert'];
type WaitlistRow = Database['public']['Tables']['waitlist']['Row'];
// Alias for backward compatibility
type WaitlistEntry = WaitlistRow;

/** PostgreSQL error with code property */
interface PostgresError extends Error {
  code?: string;
}

export class WaitlistRepository extends BaseRepository<'waitlist'> {
  constructor(supabase?: SupabaseClient<Database>) {
    super('waitlist', supabase);
  }

  async addToWaitlist(data: {
    email: string;
    name?: string;
    referral_code?: string;
    source?: string;
  }): Promise<WaitlistEntry> {
    try {
      const entryData: WaitlistInsert = {
        email: data.email,
        name: data.name || null,
        referral_code: data.referral_code || null,
        source: data.source || null,
      };

      return this.create(entryData) as Promise<WaitlistEntry>;
    } catch (error: unknown) {
      const pgError = error as PostgresError;
      if (pgError?.code === '23505') {
        throw new Error('Email already on waitlist');
      }
      logger.error('Error adding to waitlist', pgError);
      throw error;
    }
  }

  async getAllWaitlistEntries(options?: {
    status?: 'pending' | 'approved' | 'rejected';
    limit?: number;
    offset?: number;
  }): Promise<WaitlistEntry[]> {
    const filters: Partial<WaitlistRow> | undefined = options?.status ? { status: options.status } : undefined;
    return this.findAll(filters, {
      orderBy: { column: 'created_at', ascending: false },
      limit: options?.limit,
      offset: options?.offset
    }) as Promise<WaitlistEntry[]>;
  }

  async getPendingWaitlist(): Promise<WaitlistEntry[]> {
    return this.getAllWaitlistEntries({ status: 'pending' });
  }

  async getWaitlistCount(status?: 'pending' | 'approved' | 'rejected'): Promise<number> {
    const filters: Partial<WaitlistRow> | undefined = status ? { status } : undefined;
    return this.count(filters);
  }

  async isEmailOnWaitlist(email: string): Promise<boolean> {
    const filters: Partial<WaitlistRow> = { email };
    const count = await this.count(filters);
    return count > 0;
  }

  async removeFromWaitlist(email: string): Promise<void> {
    const filters: Partial<WaitlistRow> = { email };
    await this.deleteMany(filters);
  }

  async getWaitlistEmails(status?: 'pending' | 'approved' | 'rejected'): Promise<string[]> {
    try {
      let query = this.table().select('email');

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching waitlist emails', error as Error);
        return [];
      }

      return (data as Array<{ email: string }>).map((entry) => entry.email);
    } catch (err) {
      logger.error('Exception in getWaitlistEmails', err as Error);
      return [];
    }
  }

  async getRecentWaitlistSignups(days: number = 7): Promise<WaitlistEntry[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await this.table()
        .select('*')
        .gte('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error fetching recent signups', error as Error);
        throw internalError('Failed to fetch recent signups');
      }

      return (data as WaitlistEntry[]) || [];
    } catch (err) {
      logger.error('Exception in getRecentWaitlistSignups', err as Error);
      throw err;
    }
  }

  async exportWaitlistCSV(status?: 'pending' | 'approved' | 'rejected'): Promise<string> {
    try {
      const entries = await this.getAllWaitlistEntries({ status });

      // CSV header
      let csv = 'Email,Name,Status,Referral Code,Joined Date\n';

      // CSV rows
      entries.forEach((entry: WaitlistEntry) => {
        csv += `${entry.email},${entry.name || ''},${entry.status || ''},${entry.referral_code || ''},${entry.created_at}\n`;
      });

      return csv;
    } catch (err) {
      logger.error('Exception in exportWaitlistCSV', err as Error);
      return '';
    }
  }
}

export const waitlistRepository = new WaitlistRepository();

// Backward compatibility exports
/**
 * Add an entry to the waitlist (backward compatibility wrapper)
 * @param data - Waitlist entry data including email, name
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await addToWaitlist({ email: 'user@example.com', name: 'John Doe' });
 */
export async function addToWaitlist(data: {
  email: string;
  name?: string;
  referral_code?: string;
  source?: string;
}) {
  try {
    const entry = await waitlistRepository.addToWaitlist(data);
    return { data: entry, error: null };
  } catch (err: unknown) {
    const error = err as Error;
    return { data: null, error: error.message || err };
  }
}

/**
 * Get all waitlist entries with optional filters (backward compatibility wrapper)
 * @param options - Optional filters for status and limit
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getAllWaitlistEntries({ status: 'pending', limit: 100 });
 */
export async function getAllWaitlistEntries(options?: {
  status?: 'pending' | 'approved' | 'rejected';
  limit?: number;
  offset?: number;
}) {
  try {
    const data = await waitlistRepository.getAllWaitlistEntries(options);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get pending waitlist entries (backward compatibility wrapper)
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getPendingWaitlist();
 */
export async function getPendingWaitlist() {
  return getAllWaitlistEntries({ status: 'pending' });
}

/**
 * Get count of waitlist entries (backward compatibility wrapper)
 * @param status - Optional status to filter by
 * @returns Number of waitlist entries
 * @example
 * const count = await getWaitlistCount('pending');
 */
export async function getWaitlistCount(status?: 'pending' | 'approved' | 'rejected'): Promise<number> {
  return waitlistRepository.getWaitlistCount(status);
}

/**
 * Check if an email is on the waitlist (backward compatibility wrapper)
 * @param email - Email address to check
 * @returns Boolean indicating if email is on waitlist
 * @example
 * const isOnWaitlist = await isEmailOnWaitlist('user@example.com');
 */
export async function isEmailOnWaitlist(email: string): Promise<boolean> {
  return waitlistRepository.isEmailOnWaitlist(email);
}

/**
 * Remove an email from the waitlist (backward compatibility wrapper)
 * @param email - Email address to remove
 * @returns Object with error property
 * @example
 * const { error } = await removeFromWaitlist('user@example.com');
 */
export async function removeFromWaitlist(email: string) {
  try {
    await waitlistRepository.removeFromWaitlist(email);
    return { error: null };
  } catch (err) {
    return { error: err };
  }
}

/**
 * Get all email addresses from the waitlist (backward compatibility wrapper)
 * @param status - Optional status to filter by
 * @returns Array of email addresses
 * @example
 * const emails = await getWaitlistEmails('pending');
 */
export async function getWaitlistEmails(status?: 'pending' | 'approved' | 'rejected'): Promise<string[]> {
  return waitlistRepository.getWaitlistEmails(status);
}

/**
 * Get recent waitlist signups within specified days (backward compatibility wrapper)
 * @param days - Number of days to look back (defaults to 7)
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getRecentWaitlistSignups(30);
 */
export async function getRecentWaitlistSignups(days: number = 7) {
  try {
    const data = await waitlistRepository.getRecentWaitlistSignups(days);
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Export waitlist entries as CSV (backward compatibility wrapper)
 * @param status - Optional status to filter by
 * @returns CSV string of waitlist entries
 * @example
 * const csv = await exportWaitlistCSV('pending');
 */
export async function exportWaitlistCSV(status?: 'pending' | 'approved' | 'rejected'): Promise<string> {
  return waitlistRepository.exportWaitlistCSV(status);
}
