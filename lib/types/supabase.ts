/**
 * Supabase Database Types
 * Auto-generated types for the NeuroElemental database schema
 *
 * Generated via Supabase MCP on 2025-11-26
 * To regenerate: Use Supabase MCP generate_typescript_types
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          organization_id: string
          rate_limit: number
          scopes: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name: string
          organization_id: string
          rate_limit?: number
          scopes?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          organization_id?: string
          rate_limit?: number
          scopes?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      assessment_history: {
        Row: {
          assessment_id: string | null
          id: string
          taken_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_id?: string | null
          id?: string
          taken_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_id?: string | null
          id?: string
          taken_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      assessment_results: {
        Row: {
          completed_at: string | null
          created_at: string | null
          element_scores: Json
          id: string
          personality_traits: Json | null
          top_element: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          element_scores: Json
          id?: string
          personality_traits?: Json | null
          top_element?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          element_scores?: Json
          id?: string
          personality_traits?: Json | null
          top_element?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      assessments: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          is_organizational: boolean | null
          organization_id: string | null
          scores: Json
          session_id: string | null
          user_id: string | null
          version: string
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          is_organizational?: boolean | null
          organization_id?: string | null
          scores: Json
          session_id?: string | null
          user_id?: string | null
          version?: string
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          is_organizational?: boolean | null
          organization_id?: string | null
          scores?: Json
          session_id?: string | null
          user_id?: string | null
          version?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          content: string | null
          created_at: string | null
          feedback: string | null
          file_url: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          score: number | null
          status: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          content?: string | null
          created_at?: string | null
          feedback?: string | null
          file_url?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          score?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      audit_export_access_log: {
        Row: {
          accessed_by: string
          created_at: string
          export_job_id: string
          id: string
          ip_address: string | null
          organization_id: string
          user_agent: string | null
        }
        Insert: {
          accessed_by: string
          created_at?: string
          export_job_id: string
          id?: string
          ip_address?: string | null
          organization_id: string
          user_agent?: string | null
        }
        Update: {
          accessed_by?: string
          created_at?: string
          export_job_id?: string
          id?: string
          ip_address?: string | null
          organization_id?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_export_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string
          date_from: string
          date_to: string
          entity_types: string[] | null
          error_message: string | null
          event_types: string[] | null
          expires_at: string | null
          export_format: string
          file_path: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          organization_id: string
          started_at: string | null
          status: string
          total_records: number | null
          updated_at: string | null
          user_ids: string[] | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by: string
          date_from: string
          date_to: string
          entity_types?: string[] | null
          error_message?: string | null
          event_types?: string[] | null
          expires_at?: string | null
          export_format?: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id: string
          started_at?: string | null
          status?: string
          total_records?: number | null
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string
          date_from?: string
          date_to?: string
          entity_types?: string[] | null
          error_message?: string | null
          event_types?: string[] | null
          expires_at?: string | null
          export_format?: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          organization_id?: string
          started_at?: string | null
          status?: string
          total_records?: number | null
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Relationships: []
      }
      audit_export_schedules: {
        Row: {
          created_at: string | null
          created_by: string
          day_of_month: number | null
          day_of_week: number | null
          description: string | null
          entity_types: string[] | null
          event_types: string[] | null
          export_format: string
          frequency: string
          id: string
          is_active: boolean | null
          last_run_at: string | null
          lookback_days: number
          name: string
          next_run_at: string | null
          notify_emails: string[] | null
          organization_id: string
          time_of_day: string
          updated_at: string | null
          user_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          entity_types?: string[] | null
          event_types?: string[] | null
          export_format?: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          lookback_days?: number
          name: string
          next_run_at?: string | null
          notify_emails?: string[] | null
          organization_id: string
          time_of_day: string
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          day_of_month?: number | null
          day_of_week?: number | null
          description?: string | null
          entity_types?: string[] | null
          event_types?: string[] | null
          export_format?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_run_at?: string | null
          lookback_days?: number
          name?: string
          next_run_at?: string | null
          notify_emails?: string[] | null
          organization_id?: string
          time_of_day?: string
          updated_at?: string | null
          user_ids?: string[] | null
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image_url: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image_url?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          certificate_url: string | null
          course_id: string | null
          enrollment_id: string | null
          id: string
          issued_at: string | null
          user_id: string | null
          verification_code: string
        }
        Insert: {
          certificate_url?: string | null
          course_id?: string | null
          enrollment_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code: string
        }
        Update: {
          certificate_url?: string | null
          course_id?: string | null
          enrollment_id?: string | null
          id?: string
          issued_at?: string | null
          user_id?: string | null
          verification_code?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          applicable_products: string[] | null
          code: string
          created_at: string
          created_by: string | null
          current_uses: number
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          min_purchase: number | null
          updated_at: string
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          applicable_products?: string[] | null
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          applicable_products?: string[] | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_purchase?: number | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          amount_paid: number | null
          completed_at: string | null
          course_id: string | null
          enrolled_at: string | null
          id: string
          last_accessed_at: string | null
          payment_status: string | null
          progress_percentage: number | null
          stripe_session_id: string | null
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          payment_status?: string | null
          progress_percentage?: number | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          completed_at?: string | null
          course_id?: string | null
          enrolled_at?: string | null
          id?: string
          last_accessed_at?: string | null
          payment_status?: string | null
          progress_percentage?: number | null
          stripe_session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      course_lessons: {
        Row: {
          content_text: string | null
          content_type: string
          content_url: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          is_preview: boolean | null
          module_id: string | null
          order_index: number
          title: string
        }
        Insert: {
          content_text?: string | null
          content_type: string
          content_url?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          order_index: number
          title: string
        }
        Update: {
          content_text?: string | null
          content_type?: string
          content_url?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          is_preview?: boolean | null
          module_id?: string | null
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      course_modules: {
        Row: {
          course_id: string | null
          created_at: string | null
          description: string | null
          id: string
          order_index: number
          title: string
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index: number
          title: string
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: []
      }
      course_progress: {
        Row: {
          course_id: string
          created_at: string
          id: string
          last_activity_at: string
          lesson_id: string | null
          progress_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          last_activity_at?: string
          lesson_id?: string | null
          progress_percentage?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          last_activity_at?: string
          lesson_id?: string | null
          progress_percentage?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      course_reviews: {
        Row: {
          comment: string | null
          course_id: string
          created_at: string
          id: string
          is_approved: boolean
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          course_id: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          course_id?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: string | null
          duration_hours: number | null
          enrollment_count: number | null
          id: string
          instructor_name: string | null
          is_published: boolean | null
          long_description: string | null
          preview_video_url: string | null
          price_usd: number
          slug: string
          subtitle: string | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          long_description?: string | null
          preview_video_url?: string | null
          price_usd?: number
          slug: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: string | null
          duration_hours?: number | null
          enrollment_count?: number | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean | null
          long_description?: string | null
          preview_video_url?: string | null
          price_usd?: number
          slug?: string
          subtitle?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      credit_balances: {
        Row: {
          balance: number
          created_at: string
          credit_type: string
          id: string
          organization_id: string
          reserved: number
          updated_at: string
        }
        Insert: {
          balance?: number
          created_at?: string
          credit_type?: string
          id?: string
          organization_id: string
          reserved?: number
          updated_at?: string
        }
        Update: {
          balance?: number
          created_at?: string
          credit_type?: string
          id?: string
          organization_id?: string
          reserved?: number
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          balance_after: number
          created_at: string
          created_by: string | null
          credit_type: string
          description: string | null
          expiration_date: string | null
          id: string
          metadata: Json | null
          organization_id: string
          payment_id: string | null
          reference_id: string | null
          reference_type: string | null
          transaction_type: string
          type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          balance_after: number
          created_at?: string
          created_by?: string | null
          credit_type?: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type: string
          type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number
          created_at?: string
          created_by?: string | null
          credit_type?: string
          description?: string | null
          expiration_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          payment_id?: string | null
          reference_id?: string | null
          reference_type?: string | null
          transaction_type?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      credit_warnings: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string | null
          current_balance: number
          id: string
          notified_at: string | null
          organization_id: string
          threshold: number
          warning_type: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          current_balance: number
          id?: string
          notified_at?: string | null
          organization_id: string
          threshold: number
          warning_type: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string | null
          current_balance?: number
          id?: string
          notified_at?: string | null
          organization_id?: string
          threshold?: number
          warning_type?: string
        }
        Relationships: []
      }
      diagnostic_results: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          organization_id: string | null
          recommendations: Json | null
          template_id: string | null
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          recommendations?: Json | null
          template_id?: string | null
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          organization_id?: string | null
          recommendations?: Json | null
          template_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      diagnostic_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          focus_area: string | null
          id: string
          is_active: boolean | null
          name: string
          questions: Json
          slug: string
          target_audience: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          questions: Json
          slug: string
          target_audience: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          focus_area?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          questions?: Json
          slug?: string
          target_audience?: string
        }
        Relationships: []
      }
      email_preferences: {
        Row: {
          course_updates: boolean | null
          created_at: string | null
          id: string
          marketing: boolean | null
          payment_receipts: boolean | null
          session_reminders: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          course_updates?: boolean | null
          created_at?: string | null
          id?: string
          marketing?: boolean | null
          payment_receipts?: boolean | null
          session_reminders?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          course_updates?: boolean | null
          created_at?: string | null
          id?: string
          marketing?: boolean | null
          payment_receipts?: boolean | null
          session_reminders?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      energy_budgets: {
        Row: {
          activities: Json
          created_at: string | null
          date: string
          id: string
          remaining_budget: number
          total_budget: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          activities?: Json
          created_at?: string | null
          date: string
          id?: string
          remaining_budget: number
          total_budget?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          activities?: Json
          created_at?: string | null
          date?: string
          id?: string
          remaining_budget?: number
          total_budget?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "energy_budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      enrollments: {
        Row: {
          cancelled_at: string | null
          completed_at: string | null
          course_id: string
          created_at: string | null
          enrolled_at: string | null
          id: string
          progress_percentage: number | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancelled_at?: string | null
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancelled_at?: string | null
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          enrolled_at?: string | null
          id?: string
          progress_percentage?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string | null
          id: string
          registered_at: string | null
          ticket_code: string
          user_id: string | null
        }
        Insert: {
          attended?: boolean | null
          event_id?: string | null
          id?: string
          registered_at?: string | null
          ticket_code: string
          user_id?: string | null
        }
        Update: {
          attended?: boolean | null
          event_id?: string | null
          id?: string
          registered_at?: string | null
          ticket_code?: string
          user_id?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_datetime: string
          event_type: string
          id: string
          instructor_id: string | null
          is_published: boolean | null
          location_address: Json | null
          location_name: string | null
          online_meeting_url: string | null
          price_usd: number
          slug: string
          spots_taken: number | null
          start_datetime: string
          thumbnail_url: string | null
          timezone: string
          title: string
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime: string
          event_type: string
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          location_address?: Json | null
          location_name?: string | null
          online_meeting_url?: string | null
          price_usd?: number
          slug: string
          spots_taken?: number | null
          start_datetime: string
          thumbnail_url?: string | null
          timezone: string
          title: string
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_datetime?: string
          event_type?: string
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          location_address?: Json | null
          location_name?: string | null
          online_meeting_url?: string | null
          price_usd?: number
          slug?: string
          spots_taken?: number | null
          start_datetime?: string
          thumbnail_url?: string | null
          timezone?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      instructor_profiles: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          available_for_hire: boolean | null
          bio: string | null
          certification_date: string | null
          certification_level: string | null
          hourly_rate_usd: number | null
          id: string
          linkedin_url: string | null
          location: string | null
          specializations: string[] | null
          website_url: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          available_for_hire?: boolean | null
          bio?: string | null
          certification_date?: string | null
          certification_level?: string | null
          hourly_rate_usd?: number | null
          id: string
          linkedin_url?: string | null
          location?: string | null
          specializations?: string[] | null
          website_url?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          available_for_hire?: boolean | null
          bio?: string | null
          certification_date?: string | null
          certification_level?: string | null
          hourly_rate_usd?: number | null
          id?: string
          linkedin_url?: string | null
          location?: string | null
          specializations?: string[] | null
          website_url?: string | null
        }
        Relationships: []
      }
      instructor_resources: {
        Row: {
          category: string | null
          certification_level: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          file_url: string
          id: string
          resource_type: string
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          certification_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url: string
          id?: string
          resource_type: string
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          certification_level?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_url?: string
          id?: string
          resource_type?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_paid: number | null
          created_at: string | null
          currency: string | null
          id: string
          paid_at: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          paid_at?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
        }
        Relationships: []
      }
      lesson_completions: {
        Row: {
          completed_at: string | null
          id: string
          lesson_id: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          lesson_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      lesson_progress: {
        Row: {
          completed_at: string | null
          enrollment_id: string | null
          id: string
          lesson_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          completed_at?: string | null
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          completed_at?: string | null
          enrollment_id?: string | null
          id?: string
          lesson_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: []
      }
      logs: {
        Row: {
          browser: string | null
          context: Json | null
          environment: string | null
          error: Json | null
          id: string
          level: string
          message: string
          request_id: string | null
          session_id: string | null
          stack: string | null
          timestamp: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          context?: Json | null
          environment?: string | null
          error?: Json | null
          id?: string
          level: string
          message: string
          request_id?: string | null
          session_id?: string | null
          stack?: string | null
          timestamp?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          context?: Json | null
          environment?: string | null
          error?: Json | null
          id?: string
          level?: string
          message?: string
          request_id?: string | null
          session_id?: string | null
          stack?: string | null
          timestamp?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          metadata: Json | null
          order_id: string | null
          price_usd: number
          product_id: string | null
          product_name: string
          product_type: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          order_id?: string | null
          price_usd: number
          product_id?: string | null
          product_name: string
          product_type: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          order_id?: string | null
          price_usd?: number
          product_id?: string | null
          product_name?: string
          product_type?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          completed_at: string | null
          created_at: string | null
          currency: string | null
          id: string
          status: string
          stripe_customer_id: string | null
          stripe_payment_intent_id: string | null
          total_usd: number
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          status: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_usd: number
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_payment_intent_id?: string | null
          total_usd?: number
          user_id?: string | null
        }
        Relationships: []
      }
      organization_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          organization_id: string
          role: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id: string
          role?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          organization_id?: string
          role?: string
          token?: string
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string | null
          role: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      organization_roles: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          permissions: string[]
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          permissions?: string[]
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          permissions?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      organizations: {
        Row: {
          address: Json | null
          created_at: string | null
          id: string
          industry: string | null
          name: string
          owner_id: string | null
          size_range: string | null
          subscription_status: string | null
          subscription_tier: string | null
          type: string
        }
        Insert: {
          address?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          owner_id?: string | null
          size_range?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          type: string
        }
        Update: {
          address?: Json | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          owner_id?: string | null
          size_range?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          type?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_dangerous: boolean | null
          name: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_dangerous?: boolean | null
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_dangerous?: boolean | null
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          price_usd: number
          slug: string
          stripe_price_id: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          price_usd: number
          slug: string
          stripe_price_id?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          price_usd?: number
          slug?: string
          stripe_price_id?: string | null
          type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          instructor_certified_at: string | null
          instructor_status: string | null
          role: string
          stripe_customer_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          instructor_certified_at?: string | null
          instructor_status?: string | null
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          instructor_certified_at?: string | null
          instructor_status?: string | null
          role?: string
          stripe_customer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          answers: Json
          completed_at: string | null
          id: string
          passed: boolean
          quiz_id: string | null
          score: number
          user_id: string | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          id?: string
          passed: boolean
          quiz_id?: string | null
          score: number
          user_id?: string | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          id?: string
          passed?: boolean
          quiz_id?: string | null
          score?: number
          user_id?: string | null
        }
        Relationships: []
      }
      quizzes: {
        Row: {
          id: string
          lesson_id: string | null
          passing_score: number | null
          questions: Json
          title: string
        }
        Insert: {
          id?: string
          lesson_id?: string | null
          passing_score?: number | null
          questions: Json
          title: string
        }
        Update: {
          id?: string
          lesson_id?: string | null
          passing_score?: number | null
          questions?: Json
          title?: string
        }
        Relationships: []
      }
      quick_quiz_results: {
        Row: {
          created_at: string | null
          id: string
          primary_element: string
          scores: Json
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          primary_element: string
          scores: Json
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          primary_element?: string
          scores?: Json
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quick_quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      resource_downloads: {
        Row: {
          downloaded_at: string | null
          id: string
          resource_id: string | null
          user_id: string | null
        }
        Insert: {
          downloaded_at?: string | null
          id?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Update: {
          downloaded_at?: string | null
          id?: string
          resource_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      resources: {
        Row: {
          access_level: string | null
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          metadata: Json | null
          mime_type: string | null
          resource_type: string | null
          uploaded_by: string | null
        }
        Insert: {
          access_level?: string | null
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          resource_type?: string | null
          uploaded_by?: string | null
        }
        Update: {
          access_level?: string | null
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          metadata?: Json | null
          mime_type?: string | null
          resource_type?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      role_assignment_history: {
        Row: {
          action: string
          changed_by: string
          created_at: string | null
          id: string
          old_role_id: string | null
          organization_id: string
          role_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          changed_by: string
          created_at?: string | null
          id?: string
          old_role_id?: string | null
          organization_id: string
          role_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          changed_by?: string
          created_at?: string | null
          id?: string
          old_role_id?: string | null
          organization_id?: string
          role_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_emails: {
        Row: {
          created_at: string | null
          error: string | null
          id: string
          props: Json
          scheduled_for: string
          sent_at: string | null
          status: string
          to: string
          type: string
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          id?: string
          props?: Json
          scheduled_for: string
          sent_at?: string | null
          status?: string
          to: string
          type: string
        }
        Update: {
          created_at?: string | null
          error?: string | null
          id?: string
          props?: Json
          scheduled_for?: string
          sent_at?: string | null
          status?: string
          to?: string
          type?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          booked_at: string
          cancelled_at: string | null
          created_at: string
          id: string
          session_id: string
          status: string
          user_id: string
        }
        Insert: {
          booked_at?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          session_id: string
          status?: string
          user_id: string
        }
        Update: {
          booked_at?: string
          cancelled_at?: string | null
          created_at?: string
          id?: string
          session_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          created_at: string
          duration_minutes: number
          id: string
          instructor_id: string
          meeting_link: string | null
          notes: string | null
          scheduled_at: string
          status: string
          student_id: string
          type: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at: string
          status?: string
          student_id: string
          type: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number
          id?: string
          instructor_id?: string
          meeting_link?: string | null
          notes?: string | null
          scheduled_at?: string
          status?: string
          student_id?: string
          type?: string
        }
        Relationships: []
      }
      shadow_sessions: {
        Row: {
          completed_at: string | null
          current_step: number
          element: string
          id: string
          reflections: Json
          started_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          element: string
          id?: string
          reflections?: Json
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          element?: string
          id?: string
          reflections?: Json
          started_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shadow_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      sso_auth_attempts: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          id: string
          ip_address: string | null
          provider_id: string
          redirect_url: string | null
          state: string
          status: string
          user_agent: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          provider_id: string
          redirect_url?: string | null
          state: string
          status?: string
          user_agent?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          provider_id?: string
          redirect_url?: string | null
          state?: string
          status?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      sso_providers: {
        Row: {
          created_at: string
          created_by: string | null
          domains: string[]
          id: string
          is_active: boolean
          metadata_url: string | null
          oidc_client_id: string | null
          oidc_client_secret: string | null
          oidc_issuer_url: string | null
          organization_id: string
          provider_name: string
          provider_type: string
          saml_certificate: string | null
          saml_entity_id: string | null
          saml_sso_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          domains?: string[]
          id?: string
          is_active?: boolean
          metadata_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret?: string | null
          oidc_issuer_url?: string | null
          organization_id: string
          provider_name: string
          provider_type: string
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sso_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          domains?: string[]
          id?: string
          is_active?: boolean
          metadata_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret?: string | null
          oidc_issuer_url?: string | null
          organization_id?: string
          provider_name?: string
          provider_type?: string
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sso_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sso_sessions: {
        Row: {
          attributes: Json | null
          created_at: string
          expires_at: string
          id: string
          name_id: string | null
          provider_id: string
          session_index: string | null
          user_id: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          expires_at: string
          id?: string
          name_id?: string | null
          provider_id: string
          session_index?: string | null
          user_id: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          expires_at?: string
          id?: string
          name_id?: string | null
          provider_id?: string
          session_index?: string | null
          user_id?: string
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          subscription_id: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          subscription_id: string
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          subscription_id?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: []
      }
      strategy_ratings: {
        Row: {
          created_at: string | null
          element: string
          id: string
          note: string | null
          rating: number
          strategy_id: string
          strategy_name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          element: string
          id?: string
          note?: string | null
          rating: number
          strategy_id: string
          strategy_name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          element?: string
          id?: string
          note?: string | null
          rating?: number
          strategy_id?: string
          strategy_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "strategy_ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tool_analytics: {
        Row: {
          action: string
          created_at: string | null
          duration_seconds: number | null
          id: string
          metadata: Json | null
          tool_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          tool_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          metadata?: Json | null
          tool_name?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          product_type: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          product_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          product_type?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_activity_log: {
        Row: {
          activity_type: string
          created_at: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          email_notifications: Json | null
          id: string
          language: string | null
          metadata: Json | null
          theme: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          language?: string | null
          metadata?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email_notifications?: Json | null
          id?: string
          language?: string | null
          metadata?: Json | null
          theme?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          name: string | null
          referral_code: string | null
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          name?: string | null
          referral_code?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          name?: string | null
          referral_code?: string | null
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      webhook_deliveries: {
        Row: {
          attempts: number
          completed_at: string | null
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          next_retry_at: string | null
          payload: Json
          response_body: string | null
          response_headers: Json | null
          response_status: number | null
          status: string
          webhook_id: string
        }
        Insert: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          next_retry_at?: string | null
          payload: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          status?: string
          webhook_id: string
        }
        Update: {
          attempts?: number
          completed_at?: string | null
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          next_retry_at?: string | null
          payload?: Json
          response_body?: string | null
          response_headers?: Json | null
          response_status?: number | null
          status?: string
          webhook_id?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string | null
          events: string[]
          id: string
          is_active: boolean
          name: string
          organization_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          events?: string[]
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      api_usage_log: {
        Row: {
          id: string
          organization_id: string | null
          api_key_id: string | null
          endpoint: string
          method: string
          status_code: number | null
          response_time_ms: number | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          api_key_id?: string | null
          endpoint: string
          method: string
          status_code?: number | null
          response_time_ms?: number | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          api_key_id?: string | null
          endpoint?: string
          method?: string
          status_code?: number | null
          response_time_ms?: number | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
      organization_usage_metrics: {
        Row: {
          id: string
          organization_id: string
          metric_name: string
          metric_value: number
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          metric_name: string
          metric_value?: number
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          metric_name?: string
          metric_value?: number
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_activity_metrics: {
        Row: {
          id: string
          user_id: string
          metric_name: string
          metric_value: number
          period_start: string
          period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          metric_name: string
          metric_value?: number
          period_start: string
          period_end: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          metric_name?: string
          metric_value?: number
          period_start?: string
          period_end?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          price_monthly: number
          price_yearly: number
          features: Json
          limits: Json
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          is_active: boolean
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          features?: Json
          limits?: Json
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          price_monthly?: number
          price_yearly?: number
          features?: Json
          limits?: Json
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_subscriptions: {
        Row: {
          id: string
          organization_id: string
          plan_id: string | null
          stripe_subscription_id: string | null
          stripe_customer_id: string | null
          status: string
          billing_cycle: string
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          canceled_at: string | null
          trial_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          plan_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          billing_cycle?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          plan_id?: string | null
          stripe_subscription_id?: string | null
          stripe_customer_id?: string | null
          status?: string
          billing_cycle?: string
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          trial_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          id: string
          organization_id: string
          stripe_payment_method_id: string
          type: string
          brand: string | null
          last4: string | null
          exp_month: number | null
          exp_year: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          stripe_payment_method_id: string
          type: string
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          stripe_payment_method_id?: string
          type?: string
          brand?: string | null
          last4?: string | null
          exp_month?: number | null
          exp_year?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      usage_reports: {
        Row: {
          id: string
          organization_id: string | null
          report_type: string
          start_date: string
          end_date: string
          data: Json
          format: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          report_type: string
          start_date: string
          end_date: string
          data?: Json
          format?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          report_type?: string
          start_date?: string
          end_date?: string
          data?: Json
          format?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      organization_memberships: {
        Row: {
          organization_id: string
          user_id: string
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          organization_id: string
          user_id: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          organization_id?: string
          user_id?: string
          role?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_invites: {
        Row: {
          id: string
          email: string
          organization_id: string
          role: string
          invited_by: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          organization_id: string
          role: string
          invited_by?: string | null
          expires_at: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          organization_id?: string
          role?: string
          invited_by?: string | null
          expires_at?: string
          created_at?: string
        }
        Relationships: []
      }
      rate_limit_tiers: {
        Row: {
          id: string
          tier_name: string
          requests_per_minute: number
          requests_per_hour: number
          requests_per_day: number
          burst_allowance: number
          webhooks_per_minute: number
          webhooks_per_hour: number
          max_concurrent_requests: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tier_name: string
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          burst_allowance?: number
          webhooks_per_minute?: number
          webhooks_per_hour?: number
          max_concurrent_requests?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tier_name?: string
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          burst_allowance?: number
          webhooks_per_minute?: number
          webhooks_per_hour?: number
          max_concurrent_requests?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_configs: {
        Row: {
          id: string
          organization_id: string
          tier: string
          requests_per_minute: number
          requests_per_hour: number
          requests_per_day: number
          burst_allowance: number
          webhooks_per_minute: number
          webhooks_per_hour: number
          max_concurrent_requests: number
          enforce_hard_limits: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          tier?: string
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          burst_allowance?: number
          webhooks_per_minute?: number
          webhooks_per_hour?: number
          max_concurrent_requests?: number
          enforce_hard_limits?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          tier?: string
          requests_per_minute?: number
          requests_per_hour?: number
          requests_per_day?: number
          burst_allowance?: number
          webhooks_per_minute?: number
          webhooks_per_hour?: number
          max_concurrent_requests?: number
          enforce_hard_limits?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          id: string
          organization_id: string
          api_key_id: string | null
          user_id: string | null
          endpoint: string
          method: string
          limit_type: string
          current_count: number
          limit_value: number
          ip_address: string | null
          user_agent: string | null
          response_status: number | null
          retry_after: number | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          api_key_id?: string | null
          user_id?: string | null
          endpoint: string
          method: string
          limit_type: string
          current_count: number
          limit_value: number
          ip_address?: string | null
          user_agent?: string | null
          response_status?: number | null
          retry_after?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          api_key_id?: string | null
          user_id?: string | null
          endpoint?: string
          method?: string
          limit_type?: string
          current_count?: number
          limit_value?: number
          ip_address?: string | null
          user_agent?: string | null
          response_status?: number | null
          retry_after?: number | null
          created_at?: string
        }
        Relationships: []
      }
      rate_limit_counters: {
        Row: {
          id: string
          organization_id: string
          api_key_id: string | null
          window_type: string
          window_start: string
          request_count: number
          webhook_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          api_key_id?: string | null
          window_type: string
          window_start: string
          request_count?: number
          webhook_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          api_key_id?: string | null
          window_type?: string
          window_start?: string
          request_count?: number
          webhook_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sso_user_mappings: {
        Row: {
          id: string
          provider_id: string
          user_id: string
          external_id: string
          email: string
          attributes: Json | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider_id: string
          user_id: string
          external_id: string
          email: string
          attributes?: Json | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          provider_id?: string
          user_id?: string
          external_id?: string
          email?: string
          attributes?: Json | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          export_type: string
          export_format: string
          include_profile: boolean
          include_activity: boolean
          include_memberships: boolean
          include_api_keys: boolean
          include_webhooks: boolean
          include_billing: boolean
          include_content: boolean
          status: string
          file_size_bytes: number | null
          file_url: string | null
          file_path: string | null
          expires_at: string | null
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          requested_reason: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          export_type: string
          export_format?: string
          include_profile?: boolean
          include_activity?: boolean
          include_memberships?: boolean
          include_api_keys?: boolean
          include_webhooks?: boolean
          include_billing?: boolean
          include_content?: boolean
          status?: string
          file_size_bytes?: number | null
          file_url?: string | null
          file_path?: string | null
          expires_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          requested_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          export_type?: string
          export_format?: string
          include_profile?: boolean
          include_activity?: boolean
          include_memberships?: boolean
          include_api_keys?: boolean
          include_webhooks?: boolean
          include_billing?: boolean
          include_content?: boolean
          status?: string
          file_size_bytes?: number | null
          file_url?: string | null
          file_path?: string | null
          expires_at?: string | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          requested_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          id: string
          user_id: string
          organization_id: string | null
          deletion_type: string
          retention_reason: string | null
          confirmed_at: string | null
          confirmation_token: string | null
          confirmation_expires_at: string | null
          status: string
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          items_to_delete: Json | null
          requested_reason: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          organization_id?: string | null
          deletion_type: string
          retention_reason?: string | null
          confirmed_at?: string | null
          confirmation_token?: string | null
          confirmation_expires_at?: string | null
          status?: string
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          items_to_delete?: Json | null
          requested_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          organization_id?: string | null
          deletion_type?: string
          retention_reason?: string | null
          confirmed_at?: string | null
          confirmation_token?: string | null
          confirmation_expires_at?: string | null
          status?: string
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          items_to_delete?: Json | null
          requested_reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_access_log: {
        Row: {
          id: string
          accessed_user_id: string
          accessed_by_user_id: string
          organization_id: string | null
          access_type: string
          resource_type: string
          resource_id: string | null
          reason: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          accessed_user_id: string
          accessed_by_user_id: string
          organization_id?: string | null
          access_type: string
          resource_type: string
          resource_id?: string | null
          reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          accessed_user_id?: string
          accessed_by_user_id?: string
          organization_id?: string | null
          access_type?: string
          resource_type?: string
          resource_id?: string | null
          reason?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      organization_activity_log: {
        Row: {
          id: string | null
          organization_id: string | null
          user_id: string | null
          action: string | null
          entity_type: string | null
          entity_id: string | null
          metadata: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string | null
          user_full_name: string | null
          user_email: string | null
        }
      }
    }
    Functions: {
      increment_event_spots: { Args: { event_id: string }; Returns: undefined }
      increment_usage_metric: { Args: { p_organization_id: string; p_metric_name: string; p_increment?: number }; Returns: undefined }
      check_rate_limit: {
        Args: {
          p_organization_id: string
          p_api_key_id: string | null
          p_window_type: string
        }
        Returns: {
          allowed: boolean
          limit_value: number
          current_count: number
          retry_after: number | null
        }[]
      }
      increment_rate_limit: {
        Args: {
          p_organization_id: string
          p_api_key_id: string | null
          p_window_type: string
          p_is_webhook: boolean
        }
        Returns: undefined
      }
      generate_deletion_confirmation_token: {
        Args: Record<string, never>
        Returns: string
      }
      log_data_access: {
        Args: {
          p_accessed_user_id: string
          p_accessed_by_user_id: string
          p_organization_id: string | null
          p_access_type: string
          p_resource_type: string
          p_resource_id: string | null
          p_reason: string | null
          p_ip_address: string | null
          p_user_agent: string | null
        }
        Returns: string
      }
      get_user_data_summary: {
        Args: { p_user_id: string }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience type exports
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common entity types
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type Organization = Tables<'organizations'>
export type OrganizationInsert = TablesInsert<'organizations'>
export type OrganizationUpdate = TablesUpdate<'organizations'>

export type Course = Tables<'courses'>
export type CourseInsert = TablesInsert<'courses'>
export type CourseUpdate = TablesUpdate<'courses'>

export type Enrollment = Tables<'enrollments'>
export type EnrollmentInsert = TablesInsert<'enrollments'>
export type EnrollmentUpdate = TablesUpdate<'enrollments'>

export type Event = Tables<'events'>
export type EventInsert = TablesInsert<'events'>
export type EventUpdate = TablesUpdate<'events'>

export type Session = Tables<'sessions'>
export type SessionInsert = TablesInsert<'sessions'>
export type SessionUpdate = TablesUpdate<'sessions'>

export type Notification = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export type ActivityLog = Tables<'activity_logs'>
export type ActivityLogInsert = TablesInsert<'activity_logs'>
export type ActivityLogUpdate = TablesUpdate<'activity_logs'>

export type Coupon = Tables<'coupons'>
export type CouponInsert = TablesInsert<'coupons'>
export type CouponUpdate = TablesUpdate<'coupons'>

export type CreditBalance = Tables<'credit_balances'>
export type CreditBalanceInsert = TablesInsert<'credit_balances'>
export type CreditBalanceUpdate = TablesUpdate<'credit_balances'>

export type CreditTransaction = Tables<'credit_transactions'>
export type CreditTransactionInsert = TablesInsert<'credit_transactions'>
export type CreditTransactionUpdate = TablesUpdate<'credit_transactions'>

export type Webhook = Tables<'webhooks'>
export type WebhookInsert = TablesInsert<'webhooks'>
export type WebhookUpdate = TablesUpdate<'webhooks'>

export type ApiKey = Tables<'api_keys'>
export type ApiKeyInsert = TablesInsert<'api_keys'>
export type ApiKeyUpdate = TablesUpdate<'api_keys'>

// Organization membership types
export type OrganizationMembership = Tables<'organization_memberships'>
export type OrganizationMembershipInsert = TablesInsert<'organization_memberships'>
export type OrganizationMembershipUpdate = TablesUpdate<'organization_memberships'>

export type OrganizationInvite = Tables<'organization_invites'>
export type OrganizationInviteInsert = TablesInsert<'organization_invites'>
export type OrganizationInviteUpdate = TablesUpdate<'organization_invites'>

// Role types
export type UserRole = 'registered' | 'student' | 'instructor' | 'business' | 'school' | 'admin'

/** Organization membership roles - matches database constraint */
export type OrganizationRole = 'owner' | 'admin' | 'member'

// Coupon types
/** Discount type for coupons */
export type DiscountType = 'percentage' | 'fixed'

/** What the coupon applies to */
export type ApplicableTo = 'all' | 'courses' | 'events'

/** Credit types available in the system */
export type CreditType = 'course' | 'api' | 'storage' | 'default' | string
