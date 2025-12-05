/**
 * Credit Repository
 * Manages flexible consumption tracking for courses, assessments, events, etc.
 */

// Direct import to avoid circular dependency with @/lib/api barrel
import { internalError } from '@/lib/api/error-handler';
import { logger } from '@/lib/logging';
import type {
    CreditTransaction,
    CreditType,
    Database,
    Json,
} from '@/lib/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BaseRepository } from './base-repository';
import { createAdminClient } from '@/lib/supabase/admin';

type CreditTransactionInsert = Database['public']['Tables']['credit_transactions']['Insert'];

/** Transaction type for credits */
type TransactionType = 'credit' | 'debit' | 'expired' | 'refund' | 'adjustment';

/** Record of credit balances by type */
type CreditRecord = Record<CreditType, number>;

/** Credit amount result for sum calculations */
interface CreditAmountResult {
    amount: number;
}

/** Add credits input data */
interface AddCreditsInput {
    organization_id: string;
    credit_type: CreditType;
    amount: number;
    user_id?: string;
    payment_id?: string;
    expiration_days?: number;
    metadata?: Json;
}

/** Deduct credits input data */
interface DeductCreditsInput {
    organization_id: string;
    credit_type: CreditType;
    amount: number;
    user_id?: string;
    metadata?: Json;
}

/** Get credit transactions options */
interface GetTransactionsOptions {
    credit_type?: CreditType;
    transaction_type?: TransactionType;
    limit?: number;
    offset?: number;
}

export class CreditRepository extends BaseRepository<'credit_transactions'> {
    constructor(supabase?: SupabaseClient<Database>) {
        super('credit_transactions', supabase);
    }

    async addCredits(data: AddCreditsInput): Promise<CreditTransaction> {
        const expiration_date = data.expiration_days
            ? new Date(Date.now() + data.expiration_days * 24 * 60 * 60 * 1000).toISOString()
            : null;

        // Get current balance to calculate balance_after
        const currentBalance = await this.getOrganizationCreditBalance(data.organization_id, data.credit_type);
        const newBalance = currentBalance + data.amount;

        const transactionData: CreditTransactionInsert = {
            organization_id: data.organization_id,
            user_id: data.user_id || null,
            transaction_type: 'credit',
            type: 'purchase', // or could be 'grant', 'adjustment', etc.
            credit_type: data.credit_type,
            amount: data.amount,
            balance_after: newBalance,
            payment_id: data.payment_id || null,
            expiration_date,
            metadata: data.metadata || {},
        };

        const transaction = await this.create(transactionData);
        await this.updateCreditBalance(data.organization_id, data.credit_type, newBalance);
        return transaction as CreditTransaction;
    }

    async deductCredits(data: DeductCreditsInput): Promise<CreditTransaction> {
        const balance = await this.getOrganizationCreditBalance(data.organization_id, data.credit_type);
        if (balance < data.amount) {
            throw new Error('Insufficient credits');
        }

        const newBalance = balance - data.amount;

        const transactionData: CreditTransactionInsert = {
            organization_id: data.organization_id,
            user_id: data.user_id || null,
            transaction_type: 'debit',
            type: 'usage',
            credit_type: data.credit_type,
            amount: data.amount,
            balance_after: newBalance,
            metadata: data.metadata || {},
        };

        const transaction = await this.create(transactionData);
        await this.updateCreditBalance(data.organization_id, data.credit_type, newBalance);
        return transaction as CreditTransaction;
    }

    async getOrganizationCreditBalance(organization_id: string, credit_type: CreditType): Promise<number> {
        try {
            // Use fresh admin client for cross-table operations
            const adminClient = createAdminClient();
            const { data, error } = await adminClient
                .from('credit_balances')
                .select('balance')
                .eq('organization_id', organization_id)
                .eq('credit_type', credit_type)
                .maybeSingle() as { data: { balance: number } | null; error: { message: string } | null };

            if (error) {
                logger.error('Error fetching credits', new Error(error.message));
                return 0;
            }

            return data?.balance || 0;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('Exception in getOrganizationCreditBalance', error);
            return 0;
        }
    }

    async getOrganizationAllCredits(organization_id: string): Promise<CreditRecord> {
        try {
            // Use fresh admin client for cross-table operations
            const adminClient = createAdminClient();
            const { data, error } = await adminClient
                .from('credit_balances')
                .select('credit_type, balance')
                .eq('organization_id', organization_id) as { data: Array<{ credit_type: string; balance: number }> | null; error: { message: string } | null };

            if (error) {
                logger.error('Error fetching all credits', new Error(error.message));
                return {} as CreditRecord;
            }

            // Convert array to record
            const creditRecord: CreditRecord = {} as CreditRecord;
            if (data) {
                for (const row of data) {
                    creditRecord[row.credit_type as CreditType] = row.balance;
                }
            }
            return creditRecord;
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            logger.error('Exception in getOrganizationAllCredits', error);
            return {} as CreditRecord;
        }
    }

    private async updateCreditBalance(
        organization_id: string,
        credit_type: CreditType,
        new_balance: number
    ): Promise<void> {
        // Use fresh admin client for cross-table operations
        const adminClient = createAdminClient();

        // Upsert the credit balance
        const { error } = await (adminClient as any)
            .from('credit_balances')
            .upsert({
                organization_id,
                credit_type,
                balance: new_balance,
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'organization_id,credit_type',
            }) as { error: { message: string } | null };

        if (error) {
            logger.error('Error updating credits balance', new Error(error.message));
            throw internalError('Failed to update credits balance');
        }
    }

    async getCreditTransactions(
        organization_id: string,
        options?: GetTransactionsOptions
    ): Promise<CreditTransaction[]> {
        let query = this.supabase
            .from('credit_transactions')
            .select('*')
            .eq('organization_id', organization_id)
            .order('created_at', { ascending: false });

        if (options?.credit_type) {
            query = query.eq('credit_type', options.credit_type);
        }

        if (options?.transaction_type) {
            query = query.eq('transaction_type', options.transaction_type);
        }

        if (options?.limit) {
            query = query.limit(options.limit);
        }

        if (options?.offset) {
            query = query.range(options.offset, options.offset + (options.limit || 20) - 1);
        }

        const { data, error } = await query as { data: CreditTransaction[] | null; error: { message: string } | null };

        if (error) {
            logger.error('Error fetching credit transactions', new Error(error.message));
            throw internalError('Failed to fetch credit transactions');
        }

        return data || [];
    }

    async getUserCreditUsage(
        user_id: string,
        organization_id: string,
        credit_type?: CreditType
    ): Promise<CreditTransaction[]> {
        let query = this.supabase
            .from('credit_transactions')
            .select('*')
            .eq('user_id', user_id)
            .eq('organization_id', organization_id)
            .eq('transaction_type', 'debit')
            .order('created_at', { ascending: false });

        if (credit_type) {
            query = query.eq('credit_type', credit_type);
        }

        const { data, error } = await query as { data: CreditTransaction[] | null; error: { message: string } | null };

        if (error) {
            logger.error('Error fetching user usage', new Error(error.message));
            throw internalError('Failed to fetch user credit usage');
        }

        return data || [];
    }

    async getTotalCreditsUsed(
        organization_id: string,
        credit_type: CreditType,
        start_date?: Date,
        end_date?: Date
    ): Promise<number> {
        let query = this.supabase
            .from('credit_transactions')
            .select('amount')
            .eq('organization_id', organization_id)
            .eq('credit_type', credit_type)
            .eq('transaction_type', 'debit');

        if (start_date) {
            query = query.gte('created_at', start_date.toISOString());
        }

        if (end_date) {
            query = query.lte('created_at', end_date.toISOString());
        }

        const { data, error } = await query as { data: CreditAmountResult[] | null; error: { message: string } | null };

        if (error) {
            logger.error('Error calculating total credits used', new Error(error.message));
            return 0;
        }

        return data?.reduce((sum, item) => sum + item.amount, 0) || 0;
    }

    async hasSufficientCredits(
        organization_id: string,
        credit_type: CreditType,
        required_amount: number
    ): Promise<boolean> {
        const balance = await this.getOrganizationCreditBalance(organization_id, credit_type);
        return balance >= required_amount;
    }

    async getCreditStatistics(organization_id: string): Promise<{
        total_credits: number;
        credits_by_type: Record<CreditType, number>;
        total_transactions: number;
        credits_added: number;
        credits_used: number;
        credits_expired: number;
    }> {
        const allCredits = await this.getOrganizationAllCredits(organization_id);
        const transactions = await this.getCreditTransactions(organization_id);

        return {
            total_credits: Object.values(allCredits).reduce((sum: number, val: number) => sum + val, 0),
            credits_by_type: allCredits,
            total_transactions: transactions.length,
            credits_added: transactions.filter(t => t.transaction_type === 'credit').length,
            credits_used: transactions.filter(t => t.transaction_type === 'debit').length,
            credits_expired: transactions.filter(t => t.transaction_type === 'expired').length,
        };
    }
}

export const creditRepository = new CreditRepository();

// Backward compatibility exports
/**
 * Add credits to an organization (backward compatibility wrapper)
 * @deprecated Use creditRepository.addCredits() instead
 * @param data - Credit data including organization_id, credit_type, amount, and optional fields
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await addCredits({ organization_id: 'org-123', credit_type: 'course', amount: 100 });
 */
export async function addCredits(data: AddCreditsInput) {
    try {
        const transaction = await creditRepository.addCredits(data);
        return { data: transaction, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Deduct credits from an organization (backward compatibility wrapper)
 * @deprecated Use creditRepository.deductCredits() instead
 * @param data - Deduction data including organization_id, credit_type, and amount
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await deductCredits({ organization_id: 'org-123', credit_type: 'course', amount: 10 });
 */
export async function deductCredits(data: DeductCreditsInput) {
    try {
        const transaction = await creditRepository.deductCredits(data);
        return { data: transaction, error: null };
    } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        return { data: null, error: error.message };
    }
}

/**
 * Get organization credit balance for a specific credit type (backward compatibility wrapper)
 * @deprecated Use creditRepository.getOrganizationCreditBalance() instead
 * @param organization_id - Organization ID
 * @param credit_type - Type of credit to check
 * @returns Credit balance as a number
 * @example
 * const balance = await getOrganizationCreditBalance('org-123', 'course');
 */
export async function getOrganizationCreditBalance(organization_id: string, credit_type: CreditType): Promise<number> {
    return creditRepository.getOrganizationCreditBalance(organization_id, credit_type);
}

/**
 * Get all credit balances for an organization (backward compatibility wrapper)
 * @deprecated Use creditRepository.getOrganizationAllCredits() instead
 * @param organization_id - Organization ID
 * @returns Credit record with all credit types and balances
 * @example
 * const credits = await getOrganizationAllCredits('org-123');
 */
export async function getOrganizationAllCredits(organization_id: string): Promise<CreditRecord> {
    return creditRepository.getOrganizationAllCredits(organization_id);
}

/**
 * Get credit transactions for an organization (backward compatibility wrapper)
 * @deprecated Use creditRepository.getCreditTransactions() instead
 * @param organization_id - Organization ID
 * @param options - Optional filters for credit_type, transaction_type, limit, and offset
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getCreditTransactions('org-123', { credit_type: 'course', limit: 50 });
 */
export async function getCreditTransactions(organization_id: string, options?: GetTransactionsOptions) {
    try {
        const data = await creditRepository.getCreditTransactions(organization_id, options);
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Get credit usage for a specific user (backward compatibility wrapper)
 * @deprecated Use creditRepository.getUserCreditUsage() instead
 * @param user_id - User ID
 * @param organization_id - Organization ID
 * @param credit_type - Optional credit type filter
 * @returns Object with data and error properties
 * @example
 * const { data, error } = await getUserCreditUsage('user-456', 'org-123', 'course');
 */
export async function getUserCreditUsage(user_id: string, organization_id: string, credit_type?: CreditType) {
    try {
        const data = await creditRepository.getUserCreditUsage(user_id, organization_id, credit_type);
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Get total credits used within a date range (backward compatibility wrapper)
 * @deprecated Use creditRepository.getTotalCreditsUsed() instead
 * @param organization_id - Organization ID
 * @param credit_type - Type of credit
 * @param start_date - Optional start date
 * @param end_date - Optional end date
 * @returns Total credits used as a number
 * @example
 * const total = await getTotalCreditsUsed('org-123', 'course', new Date('2024-01-01'), new Date('2024-12-31'));
 */
export async function getTotalCreditsUsed(
    organization_id: string,
    credit_type: CreditType,
    start_date?: Date,
    end_date?: Date
): Promise<number> {
    return creditRepository.getTotalCreditsUsed(organization_id, credit_type, start_date, end_date);
}

/**
 * Expire old credits (backward compatibility wrapper - not yet implemented)
 * @deprecated Use creditRepository method instead (when implemented)
 * @returns Object with count and error properties
 * @example
 * const { count, error } = await expireOldCredits();
 */
export async function expireOldCredits() {
    return { count: 0, error: 'Not implemented' };
}

/**
 * Check if organization has sufficient credits (backward compatibility wrapper)
 * @deprecated Use creditRepository.hasSufficientCredits() instead
 * @param organization_id - Organization ID
 * @param credit_type - Type of credit
 * @param required_amount - Required amount of credits
 * @returns Boolean indicating if sufficient credits are available
 * @example
 * const hasSufficient = await hasSufficientCredits('org-123', 'course', 10);
 */
export async function hasSufficientCredits(
    organization_id: string,
    credit_type: CreditType,
    required_amount: number
): Promise<boolean> {
    return creditRepository.hasSufficientCredits(organization_id, credit_type, required_amount);
}

/**
 * Get credit statistics for an organization (backward compatibility wrapper)
 * @deprecated Use creditRepository.getCreditStatistics() instead
 * @param organization_id - Organization ID
 * @returns Object with data and error properties containing credit statistics
 * @example
 * const { data, error } = await getCreditStatistics('org-123');
 */
export async function getCreditStatistics(organization_id: string) {
    try {
        const data = await creditRepository.getCreditStatistics(organization_id);
        return { data, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}

/**
 * Add credits to an organization (simplified interface)
 * @param organization_id - Organization ID
 * @param amount - Amount of credits to add
 * @param credit_type - Type of credit to add
 * @returns Object with data and error properties
 */
export async function addOrganizationCredits(
    organization_id: string,
    amount: number,
    credit_type: CreditType
) {
    try {
        const transaction = await creditRepository.addCredits({
            organization_id,
            credit_type,
            amount
        });
        return { data: transaction, error: null };
    } catch (err) {
        return { data: null, error: err };
    }
}
