// Database Type Definitions for Supabase Tables

/** Energy profile for elemental personality framework */
export interface EnergyProfile {
  electric?: number;
  fire?: number;
  water?: number;
  earth?: number;
  air?: number;
  metal?: number;
  dominantElement?: string;
  secondaryElement?: string;
  [key: string]: unknown;
}

/** Invoice line item */
export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

/** Billing details for invoices */
export interface BillingDetails {
  name?: string;
  email?: string;
  company?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  tax_id?: string;
}

/** Assessment element scores */
export interface ElementScores {
  electric: number;
  fire: number;
  water: number;
  earth: number;
  air: number;
  metal: number;
}

/** Personality traits from assessment */
export interface PersonalityTraits {
  strengths?: string[];
  challenges?: string[];
  recommendations?: string[];
  [key: string]: unknown;
}

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  phone?: string;
  role:
    | "registered"
    | "student"
    | "instructor"
    | "business"
    | "school"
    | "admin";
  energy_profile?: EnergyProfile;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  expertise?: string[];
  hourly_rate?: number;
  total_reviews?: number;
  average_rating?: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  instructor_id: string;
  price: number;
  duration_hours: number;
  level: "beginner" | "intermediate" | "advanced";
  thumbnail_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  progress: number;
  completed_at?: string;
  status: "active" | "completed" | "paused";
  course?: Course;
  user?: Profile;
}

export interface Session {
  id: string;
  student_id: string;
  instructor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  type: string;
  meeting_link?: string;
  notes?: string;
  created_at: string;
  student?: Profile;
  instructor?: Profile;
}

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  payment_type: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  course_id?: string;
  session_id?: string;
  subscription_id?: string;
  resource_id?: string;
  tax_amount?: number;
  user?: Profile;
  course?: Course;
  session?: Session;
  subscription?: Subscription;
  resource?: Resource;
}

export interface Invoice {
  id: string;
  payment_id: string;
  user_id: string;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: "draft" | "pending" | "paid" | "overdue" | "cancelled";
  issued_at: string;
  due_date: string;
  paid_at?: string;
  items: InvoiceItem[];
  billing_details: BillingDetails;
  pdf_url?: string;
  payment?: Payment;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: string;
  price: number;
  status: "active" | "paused" | "cancelled" | "expired";
  stripe_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  file_url?: string;
  thumbnail_url?: string;
  is_premium: boolean;
  price?: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Certification {
  id: string;
  user_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  expires_at?: string;
  grade?: number;
  skills_acquired?: string[];
  user?: Profile;
  course?: Course;
}

export interface Review {
  id: string;
  user_id: string;
  course_id?: string;
  instructor_id?: string;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  course?: Course;
  instructor?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

export interface EmailPreferences {
  id: string;
  user_id: string;
  marketing: boolean;
  courseUpdates: boolean;
  sessionReminders: boolean;
  paymentReceipts: boolean;
  updated_at: string;
}

export interface ScheduledEmail {
  id: string;
  to: string;
  type: string;
  props: Record<string, unknown>;
  scheduled_for: string;
  status: "pending" | "sent" | "failed";
  sent_at?: string;
  error?: string;
  created_at: string;
}

export interface LogEntry {
  id?: string;
  level: "debug" | "info" | "warn" | "error" | "fatal";
  message: string;
  timestamp: string;
  userId?: string;
  metadata?: Record<string, unknown>;
  category?: string;
  error?: Error | Record<string, unknown>;
}

export interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: "owner" | "admin" | "member";
  joined_at: string;
  user?: Profile;
}

export interface AssessmentResult {
  id: string;
  user_id: string;
  completed_at: string;
  element_scores: ElementScores;
  top_element: string;
  personality_traits: PersonalityTraits;
  created_at: string;
}

export interface CourseProgress {
  id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  progress_percentage: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
  user?: Profile;
  course?: Course;
}

// Type guards
export function isProfile(obj: unknown): obj is Profile {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Profile).id === "string" &&
    "email" in obj &&
    typeof (obj as Profile).email === "string"
  );
}

export function isCourse(obj: unknown): obj is Course {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Course).id === "string" &&
    "title" in obj &&
    typeof (obj as Course).title === "string"
  );
}

export function isPayment(obj: unknown): obj is Payment {
  return (
    typeof obj === "object" &&
    obj !== null &&
    "id" in obj &&
    typeof (obj as Payment).id === "string" &&
    "amount" in obj &&
    typeof (obj as Payment).amount === "number"
  );
}
