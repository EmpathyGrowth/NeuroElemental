import { Database } from './supabase';

// Table type helpers for Supabase
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];

// Common composite types used across API routes
// Use these instead of defining inline types in routes

/** Basic user profile info for member lists */
export interface ProfileInfo {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

/** User profile for lookup operations */
export interface UserProfile {
  id: string;
  email?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string;
}

/** Organization member with profile info */
export interface MemberWithProfile {
  user_id: string;
  role: string;
  role_id: string | null;
  joined_at: string;
  profiles: ProfileInfo | null;
}

/** Organization lookup result with subscription */
export interface OrgSubscriptionLookup {
  organization_id: string;
}

/** Basic organization info */
export interface OrganizationInfo {
  id?: string;
  name: string;
  slug: string;
}

/** Subscription update data for webhook handlers */
export interface SubscriptionUpdateData {
  status: string;
  canceled_at?: string;
  updated_at: string;
}

/** Invoice with subscription reference (for Stripe API compatibility) */
export interface InvoiceWithSubscription {
  id: string;
  customer: string | { id: string };
  subscription?: string | { id: string } | null;
  amount_due: number;
  amount_paid: number;
  currency: string;
  status: string | null;
  paid?: boolean;
  number: string | null;
  created: number;
  due_date: number | null;
  status_transitions: { paid_at: number | null };
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
  description: string | null;
  attempt_count?: number;
}
