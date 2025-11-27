/**
 * Organization Types
 * Multi-tenant organization support for schools, businesses, teams
 */

import { z } from 'zod'

// Organization Roles
export const OrganizationRole = z.enum(['owner', 'admin', 'member'])
export type OrganizationRole = z.infer<typeof OrganizationRole>

// Onboarding Data
export const onboardingDataSchema = z.object({
  orgType: z.enum(['school', 'business', 'nonprofit', 'individual']),
  industry: z.string().optional(),
  teamSize: z.number().min(1).optional(),
  website: z.string().url().optional(),
  howDidYouHear: z.string().optional(),
  useCase: z.string().optional(),
})

export type OnboardingData = z.infer<typeof onboardingDataSchema>

// Credits Record
export type CreditType =
  | 'course_enrollment'
  | 'assessment_attempt'
  | 'event_registration'
  | 'certificate_generation'
  | 'ai_tutoring'

export type CreditRecord = Partial<Record<CreditType, number>>

// Organization
export interface Organization {
  id: string
  name: string
  slug: string
  image: string | null

  onboarding_done: boolean
  onboarding_data: OnboardingData | null

  credits: CreditRecord | null

  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_id: string | null

  created_at: string
  updated_at: string
}

// Organization Membership
export interface OrganizationMembership {
  organization_id: string
  user_id: string
  role: OrganizationRole

  created_at: string
  updated_at: string
}

// Organization Invite
export interface OrganizationInvite {
  id: string
  email: string
  organization_id: string
  role: OrganizationRole
  invited_by: string | null

  expires_at: string
  created_at: string
}

// Credit Transaction
export type TransactionType = 'credit' | 'debit' | 'expired'

export interface CreditTransaction {
  id: string
  user_id: string | null
  organization_id: string

  transaction_type: TransactionType
  credit_type: CreditType
  amount: number

  payment_id: string | null
  expiration_date: string | null
  metadata: Record<string, any> | null

  created_at: string
}

// Waitlist Entry
export interface WaitlistEntry {
  id: string
  name: string | null
  email: string
  course_id: string | null
  metadata: Record<string, any> | null

  created_at: string
}

// Coupon
export type DiscountType = 'percentage' | 'fixed_amount' | 'credits'
export type ApplicableTo = 'all' | 'course' | 'event'

export interface Coupon {
  id: string
  code: string

  discount_type: DiscountType
  discount_value: number
  max_uses: number | null
  uses_count: number

  applicable_to: ApplicableTo | null
  course_id: string | null

  organization_id: string | null
  used_by_user_id: string | null

  active: boolean
  expires_at: string | null
  created_at: string
  used_at: string | null
}

// Extended types with relations
export interface OrganizationWithMembers extends Organization {
  members: (OrganizationMembership & {
    profile: {
      id: string
      full_name: string | null
      email: string
      avatar_url: string | null
    }
  })[]
}

export interface OrganizationWithStats extends Organization {
  member_count: number
  total_credits: number
  courses_enrolled: number
}
