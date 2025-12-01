export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          category: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon_url: string | null
          id: string
          is_active: boolean | null
          name: string
          points: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points?: number | null
        }
        Relationships: []
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      api_usage_log: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: string | null
          method: string
          organization_id: string | null
          request_size_bytes: number | null
          response_size_bytes: number | null
          response_time_ms: number | null
          status_code: number | null
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          method: string
          organization_id?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          method?: string
          organization_id?: string | null
          request_size_bytes?: number | null
          response_size_bytes?: number | null
          response_time_ms?: number | null
          status_code?: number | null
          user_agent?: string | null
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
      course_announcements: {
        Row: {
          content: string
          course_id: string
          created_at: string | null
          id: string
          instructor_id: string | null
          is_pinned: boolean | null
          title: string
        }
        Insert: {
          content: string
          course_id: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          is_pinned?: boolean | null
          title: string
        }
        Update: {
          content?: string
          course_id?: string
          created_at?: string | null
          id?: string
          instructor_id?: string | null
          is_pinned?: boolean | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          }
        ]
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
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
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
      data_access_log: {
        Row: {
          access_type: string
          accessed_by_user_id: string
          accessed_user_id: string
          created_at: string
          id: string
          ip_address: string | null
          organization_id: string | null
          reason: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          access_type: string
          accessed_by_user_id: string
          accessed_user_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          reason?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          access_type?: string
          accessed_by_user_id?: string
          accessed_user_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          organization_id?: string | null
          reason?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      data_deletion_requests: {
        Row: {
          completed_at: string | null
          confirmation_expires_at: string | null
          confirmation_token: string | null
          confirmed_at: string | null
          created_at: string
          deletion_type: string
          error_message: string | null
          id: string
          ip_address: string | null
          items_to_delete: Json | null
          organization_id: string | null
          requested_reason: string | null
          retention_reason: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confirmation_expires_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          deletion_type: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          items_to_delete?: Json | null
          organization_id?: string | null
          requested_reason?: string | null
          retention_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confirmation_expires_at?: string | null
          confirmation_token?: string | null
          confirmed_at?: string | null
          created_at?: string
          deletion_type?: string
          error_message?: string | null
          id?: string
          ip_address?: string | null
          items_to_delete?: Json | null
          organization_id?: string | null
          requested_reason?: string | null
          retention_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      data_export_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          expires_at: string | null
          export_format: string
          export_type: string
          file_path: string | null
          file_size_bytes: number | null
          file_url: string | null
          id: string
          include_activity: boolean
          include_api_keys: boolean
          include_billing: boolean
          include_content: boolean
          include_memberships: boolean
          include_profile: boolean
          include_webhooks: boolean
          ip_address: string | null
          organization_id: string | null
          requested_reason: string | null
          started_at: string | null
          status: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          export_format?: string
          export_type: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          include_activity?: boolean
          include_api_keys?: boolean
          include_billing?: boolean
          include_content?: boolean
          include_memberships?: boolean
          include_profile?: boolean
          include_webhooks?: boolean
          ip_address?: string | null
          organization_id?: string | null
          requested_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          expires_at?: string | null
          export_format?: string
          export_type?: string
          file_path?: string | null
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          include_activity?: boolean
          include_api_keys?: boolean
          include_billing?: boolean
          include_content?: boolean
          include_memberships?: boolean
          include_profile?: boolean
          include_webhooks?: boolean
          ip_address?: string | null
          organization_id?: string | null
          requested_reason?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
          user_agent?: string | null
          user_id?: string
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
      instructor_applications: {
        Row: {
          background: string
          created_at: string | null
          experience_years: number
          id: string
          linkedin_url: string | null
          motivation: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          specializations: string[]
          status: string
          submitted_at: string | null
          user_id: string
          website_url: string | null
        }
        Insert: {
          background: string
          created_at?: string | null
          experience_years: number
          id?: string
          linkedin_url?: string | null
          motivation: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?: string[]
          status?: string
          submitted_at?: string | null
          user_id: string
          website_url?: string | null
        }
        Update: {
          background?: string
          created_at?: string | null
          experience_years?: number
          id?: string
          linkedin_url?: string | null
          motivation?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          specializations?: string[]
          status?: string
          submitted_at?: string | null
          user_id?: string
          website_url?: string | null
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
      learning_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_pace: string | null
          preferred_format: string[] | null
          preferred_session_length: number | null
          difficulty_preference: string | null
          topic_interests: string[] | null
          enable_subtitles: boolean | null
          enable_transcripts: boolean | null
          playback_speed: number | null
          daily_reminder_enabled: boolean | null
          daily_reminder_time: string | null
          weekly_goal_minutes: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          preferred_pace?: string | null
          preferred_format?: string[] | null
          preferred_session_length?: number | null
          difficulty_preference?: string | null
          topic_interests?: string[] | null
          enable_subtitles?: boolean | null
          enable_transcripts?: boolean | null
          playback_speed?: number | null
          daily_reminder_enabled?: boolean | null
          daily_reminder_time?: string | null
          weekly_goal_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          preferred_pace?: string | null
          preferred_format?: string[] | null
          preferred_session_length?: number | null
          difficulty_preference?: string | null
          topic_interests?: string[] | null
          enable_subtitles?: boolean | null
          enable_transcripts?: boolean | null
          playback_speed?: number | null
          daily_reminder_enabled?: boolean | null
          daily_reminder_time?: string | null
          weekly_goal_minutes?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appearance_preferences: {
        Row: {
          id: string
          user_id: string
          theme: string | null
          accent_color: string | null
          font_size: string | null
          enable_dyslexia_font: boolean | null
          reduce_motion: boolean | null
          high_contrast: boolean | null
          compact_mode: boolean | null
          show_sidebar: boolean | null
          dashboard_layout: string | null
          orb_animation_enabled: boolean | null
          orb_size: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          theme?: string | null
          accent_color?: string | null
          font_size?: string | null
          enable_dyslexia_font?: boolean | null
          reduce_motion?: boolean | null
          high_contrast?: boolean | null
          compact_mode?: boolean | null
          show_sidebar?: boolean | null
          dashboard_layout?: string | null
          orb_animation_enabled?: boolean | null
          orb_size?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          theme?: string | null
          accent_color?: string | null
          font_size?: string | null
          enable_dyslexia_font?: boolean | null
          reduce_motion?: boolean | null
          high_contrast?: boolean | null
          compact_mode?: boolean | null
          show_sidebar?: boolean | null
          dashboard_layout?: string | null
          orb_animation_enabled?: boolean | null
          orb_size?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount_cents: number | null
          amount_paid: number | null
          amount_paid_cents: number | null
          created_at: string | null
          currency: string | null
          description: string | null
          due_date: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          invoice_pdf: string | null
          organization_id: string | null
          paid: boolean | null
          paid_at: string | null
          status: string | null
          stripe_invoice_id: string | null
          stripe_subscription_id: string | null
          subscription_id: string | null
        }
        Insert: {
          amount_cents?: number | null
          amount_paid?: number | null
          amount_paid_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf?: string | null
          organization_id?: string | null
          paid?: boolean | null
          paid_at?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          amount_cents?: number | null
          amount_paid?: number | null
          amount_paid_cents?: number | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          due_date?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          invoice_pdf?: string | null
          organization_id?: string | null
          paid?: boolean | null
          paid_at?: string | null
          status?: string | null
          stripe_invoice_id?: string | null
          stripe_subscription_id?: string | null
          subscription_id?: string | null
        }
        Relationships: []
      }
      learning_streaks: {
        Row: {
          current_streak: number | null
          id: string
          last_activity_date: string | null
          longest_streak: number | null
          streak_history: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_history?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          id?: string
          last_activity_date?: string | null
          longest_streak?: number | null
          streak_history?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      lesson_bookmarks: {
        Row: {
          created_at: string | null
          id: string
          lesson_id: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lesson_id: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lesson_id?: string
          note?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_bookmarks_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          }
        ]
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
      lesson_notes: {
        Row: {
          content: string
          created_at: string | null
          id: string
          lesson_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          lesson_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          lesson_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_notes_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "course_lessons"
            referencedColumns: ["id"]
          }
        ]
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
      organization_activity_log: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          metadata: Json | null
          organization_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
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
      organization_subscriptions: {
        Row: {
          billing_cycle: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          organization_id: string
          plan_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
        }
        Insert: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Update: {
          billing_cycle?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          organization_id?: string
          plan_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      organization_usage_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          organization_id: string
          period_end: string
          period_start: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string
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
      payment_methods: {
        Row: {
          billing_email: string | null
          billing_name: string | null
          brand: string | null
          card_brand: string | null
          card_exp_month: number | null
          card_exp_year: number | null
          card_last4: string | null
          created_at: string
          exp_month: number | null
          exp_year: number | null
          id: string
          is_default: boolean
          last4: string | null
          organization_id: string
          stripe_payment_method_id: string
          type: string
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          billing_name?: string | null
          brand?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          organization_id: string
          stripe_payment_method_id: string
          type: string
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          billing_name?: string | null
          brand?: string | null
          card_brand?: string | null
          card_exp_month?: number | null
          card_exp_year?: number | null
          card_last4?: string | null
          created_at?: string
          exp_month?: number | null
          exp_year?: number | null
          id?: string
          is_default?: boolean
          last4?: string | null
          organization_id?: string
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string
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
          onboarding_completed_at: string | null
          onboarding_current_step: string | null
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
          onboarding_completed_at?: string | null
          onboarding_current_step?: string | null
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
          onboarding_completed_at?: string | null
          onboarding_current_step?: string | null
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
      testimonials: {
        Row: {
          id: string
          name: string
          role: string | null
          quote: string
          element: string | null
          gradient: string | null
          avatar_url: string | null
          is_published: boolean | null
          is_verified: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          role?: string | null
          quote: string
          element?: string | null
          gradient?: string | null
          avatar_url?: string | null
          is_published?: boolean | null
          is_verified?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          role?: string | null
          quote?: string
          element?: string | null
          gradient?: string | null
          avatar_url?: string | null
          is_published?: boolean | null
          is_verified?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
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
      rate_limit_configs: {
        Row: {
          burst_allowance: number
          created_at: string
          enforce_hard_limits: boolean
          id: string
          max_concurrent_requests: number
          organization_id: string
          requests_per_day: number
          requests_per_hour: number
          requests_per_minute: number
          tier: string
          updated_at: string
          webhooks_per_hour: number
          webhooks_per_minute: number
        }
        Insert: {
          burst_allowance?: number
          created_at?: string
          enforce_hard_limits?: boolean
          id?: string
          max_concurrent_requests?: number
          organization_id: string
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          tier?: string
          updated_at?: string
          webhooks_per_hour?: number
          webhooks_per_minute?: number
        }
        Update: {
          burst_allowance?: number
          created_at?: string
          enforce_hard_limits?: boolean
          id?: string
          max_concurrent_requests?: number
          organization_id?: string
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          tier?: string
          updated_at?: string
          webhooks_per_hour?: number
          webhooks_per_minute?: number
        }
        Relationships: []
      }
      rate_limit_counters: {
        Row: {
          api_key_id: string | null
          created_at: string
          id: string
          organization_id: string
          request_count: number
          updated_at: string
          webhook_count: number
          window_start: string
          window_type: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          organization_id: string
          request_count?: number
          updated_at?: string
          webhook_count?: number
          window_start: string
          window_type: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          id?: string
          organization_id?: string
          request_count?: number
          updated_at?: string
          webhook_count?: number
          window_start?: string
          window_type?: string
        }
        Relationships: []
      }
      rate_limit_tiers: {
        Row: {
          burst_allowance: number
          created_at: string
          id: string
          max_concurrent_requests: number
          requests_per_day: number
          requests_per_hour: number
          requests_per_minute: number
          tier_name: string
          updated_at: string
          webhooks_per_hour: number
          webhooks_per_minute: number
        }
        Insert: {
          burst_allowance?: number
          created_at?: string
          id?: string
          max_concurrent_requests?: number
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          tier_name: string
          updated_at?: string
          webhooks_per_hour?: number
          webhooks_per_minute?: number
        }
        Update: {
          burst_allowance?: number
          created_at?: string
          id?: string
          max_concurrent_requests?: number
          requests_per_day?: number
          requests_per_hour?: number
          requests_per_minute?: number
          tier_name?: string
          updated_at?: string
          webhooks_per_hour?: number
          webhooks_per_minute?: number
        }
        Relationships: []
      }
      rate_limit_violations: {
        Row: {
          api_key_id: string | null
          created_at: string
          current_count: number
          endpoint: string
          id: string
          ip_address: string | null
          limit_type: string
          limit_value: number
          method: string
          organization_id: string
          response_status: number | null
          retry_after: number | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          current_count: number
          endpoint: string
          id?: string
          ip_address?: string | null
          limit_type: string
          limit_value: number
          method: string
          organization_id: string
          response_status?: number | null
          retry_after?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          current_count?: number
          endpoint?: string
          id?: string
          ip_address?: string | null
          limit_type?: string
          limit_value?: number
          method?: string
          organization_id?: string
          response_status?: number | null
          retry_after?: number | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          status: string | null
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
          status?: string | null
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
          status?: string | null
          to?: string
          type?: string
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
      sso_auth_attempts: {
        Row: {
          created_at: string
          duration_ms: number | null
          email: string
          error_code: string | null
          error_message: string | null
          id: string
          ip_address: string | null
          oauth_state: string | null
          organization_id: string | null
          provider_id: string
          saml_assertion: string | null
          saml_request_id: string | null
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          email: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          oauth_state?: string | null
          organization_id?: string | null
          provider_id: string
          saml_assertion?: string | null
          saml_request_id?: string | null
          status: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          email?: string
          error_code?: string | null
          error_message?: string | null
          id?: string
          ip_address?: string | null
          oauth_state?: string | null
          organization_id?: string | null
          provider_id?: string
          saml_assertion?: string | null
          saml_request_id?: string | null
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sso_providers: {
        Row: {
          attribute_mapping: Json | null
          auto_provision_users: boolean | null
          created_at: string
          created_by: string | null
          default_role: string | null
          domains: string[]
          enforce_sso: boolean | null
          id: string
          is_active: boolean
          metadata: Json | null
          metadata_url: string | null
          oauth_authorize_url: string | null
          oauth_client_id: string | null
          oauth_client_secret: string | null
          oauth_scopes: string[] | null
          oauth_token_url: string | null
          oauth_userinfo_url: string | null
          oidc_client_id: string | null
          oidc_client_secret: string | null
          oidc_issuer_url: string | null
          organization_id: string
          provider_name: string
          provider_type: string
          saml_certificate: string | null
          saml_entity_id: string | null
          saml_sign_requests: boolean | null
          saml_sso_url: string | null
          updated_at: string
        }
        Insert: {
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          created_at?: string
          created_by?: string | null
          default_role?: string | null
          domains: string[]
          enforce_sso?: boolean | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          metadata_url?: string | null
          oauth_authorize_url?: string | null
          oauth_client_id?: string | null
          oauth_client_secret?: string | null
          oauth_scopes?: string[] | null
          oauth_token_url?: string | null
          oauth_userinfo_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret?: string | null
          oidc_issuer_url?: string | null
          organization_id: string
          provider_name: string
          provider_type: string
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sign_requests?: boolean | null
          saml_sso_url?: string | null
          updated_at?: string
        }
        Update: {
          attribute_mapping?: Json | null
          auto_provision_users?: boolean | null
          created_at?: string
          created_by?: string | null
          default_role?: string | null
          domains?: string[]
          enforce_sso?: boolean | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          metadata_url?: string | null
          oauth_authorize_url?: string | null
          oauth_client_id?: string | null
          oauth_client_secret?: string | null
          oauth_scopes?: string[] | null
          oauth_token_url?: string | null
          oauth_userinfo_url?: string | null
          oidc_client_id?: string | null
          oidc_client_secret?: string | null
          oidc_issuer_url?: string | null
          organization_id?: string
          provider_name?: string
          provider_type?: string
          saml_certificate?: string | null
          saml_entity_id?: string | null
          saml_sign_requests?: boolean | null
          saml_sso_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sso_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          logged_out_at: string | null
          name_id: string
          organization_id: string | null
          provider_id: string
          session_index: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          ip_address?: string | null
          logged_out_at?: string | null
          name_id: string
          organization_id?: string | null
          provider_id: string
          session_index?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          logged_out_at?: string | null
          name_id?: string
          organization_id?: string | null
          provider_id?: string
          session_index?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sso_user_mappings: {
        Row: {
          attributes: Json | null
          created_at: string
          email: string
          external_id: string
          id: string
          last_login_at: string | null
          provider_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attributes?: Json | null
          created_at?: string
          email: string
          external_id: string
          id?: string
          last_login_at?: string | null
          provider_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attributes?: Json | null
          created_at?: string
          email?: string
          external_id?: string
          id?: string
          last_login_at?: string | null
          provider_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          is_public: boolean
          limits: Json
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          limits?: Json
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          is_public?: boolean
          limits?: Json
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          status: string
          stripe_subscription_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      team_assessments: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          organization_id: string | null
          status: string | null
          team_name: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          team_name?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          organization_id?: string | null
          status?: string | null
          team_name?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      team_compositions: {
        Row: {
          element_percentages: Json
          generated_at: string | null
          id: string
          insights: Json | null
          recommendations: Json | null
          team_id: string | null
          total_participants: number
        }
        Insert: {
          element_percentages: Json
          generated_at?: string | null
          id?: string
          insights?: Json | null
          recommendations?: Json | null
          team_id?: string | null
          total_participants: number
        }
        Update: {
          element_percentages?: Json
          generated_at?: string | null
          id?: string
          insights?: Json | null
          recommendations?: Json | null
          team_id?: string | null
          total_participants?: number
        }
        Relationships: []
      }
      team_participants: {
        Row: {
          assessment_id: string | null
          email: string
          element_scores: Json | null
          id: string
          invited_at: string | null
          name: string
          responded_at: string | null
          status: string | null
          team_id: string | null
          top_element: string | null
        }
        Insert: {
          assessment_id?: string | null
          email: string
          element_scores?: Json | null
          id?: string
          invited_at?: string | null
          name: string
          responded_at?: string | null
          status?: string | null
          team_id?: string | null
          top_element?: string | null
        }
        Update: {
          assessment_id?: string | null
          email?: string
          element_scores?: Json | null
          id?: string
          invited_at?: string | null
          name?: string
          responded_at?: string | null
          status?: string | null
          team_id?: string | null
          top_element?: string | null
        }
        Relationships: []
      }
      usage_reports: {
        Row: {
          created_at: string
          created_by: string
          data: Json
          end_date: string
          format: string
          id: string
          organization_id: string
          report_type: string
          start_date: string
        }
        Insert: {
          created_at?: string
          created_by: string
          data: Json
          end_date: string
          format?: string
          id?: string
          organization_id: string
          report_type: string
          start_date: string
        }
        Update: {
          created_at?: string
          created_by?: string
          data?: Json
          end_date?: string
          format?: string
          id?: string
          organization_id?: string
          report_type?: string
          start_date?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          }
        ]
      }
      user_activity_metrics: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          organization_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          organization_id: string
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          organization_id?: string
          period_end?: string
          period_start?: string
          user_id?: string
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
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          name?: string
          referral_code?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
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
          last_triggered_at: string | null
          name: string
          organization_id: string
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          events: string[]
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
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
          last_triggered_at?: string | null
          name?: string
          organization_id?: string
          secret?: string
          updated_at?: string
          url?: string
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
          ip_address: unknown
          user_agent: string | null
          created_at: string | null
          user_name: string | null
          user_email: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_rate_limit: {
        Args: {
          p_organization_id: string
          p_api_key_id?: string | null
          p_window_type: string
        }
        Returns: {
          allowed: boolean
          limit_value: number
          current_count: number
          retry_after: number
        }[]
      }
      generate_deletion_confirmation_token: {
        Args: {
          p_user_id: string
        }
        Returns: string
      }
      get_user_data_summary: {
        Args: {
          p_user_id: string
        }
        Returns: Json
      }
      handle_new_user: {
        Args: Record<string, never>
        Returns: unknown
      }
      increment_event_spots: {
        Args: {
          event_id: string
        }
        Returns: undefined
      }
      increment_rate_limit: {
        Args: {
          p_organization_id: string
          p_api_key_id?: string | null
          p_window_type: string
          p_is_webhook?: boolean
        }
        Returns: void
      }
      increment_usage_metric: {
        Args: {
          p_organization_id: string
          p_metric_name: string
          p_value?: number
        }
        Returns: void
      }
      log_data_access: {
        Args: {
          p_accessed_user_id: string
          p_accessed_by_user_id: string
          p_resource_type: string
          p_access_type: string
          p_resource_id?: string | null
          p_reason?: string | null
          p_organization_id?: string | null
          p_ip_address?: string | null
          p_user_agent?: string | null
        }
        Returns: string
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

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Convenience type aliases
export type Profile = Tables<'profiles'>
export type ProfileInsert = TablesInsert<'profiles'>
export type ProfileUpdate = TablesUpdate<'profiles'>

export type Course = Tables<'courses'>
export type CourseInsert = TablesInsert<'courses'>
export type CourseUpdate = TablesUpdate<'courses'>

export type Enrollment = Tables<'enrollments'>
export type EnrollmentInsert = TablesInsert<'enrollments'>
export type EnrollmentUpdate = TablesUpdate<'enrollments'>

export type Organization = Tables<'organizations'>
export type OrganizationInsert = TablesInsert<'organizations'>
export type OrganizationUpdate = TablesUpdate<'organizations'>

export type OrganizationMember = Tables<'organization_members'>
export type OrganizationMemberInsert = TablesInsert<'organization_members'>
export type OrganizationMemberUpdate = TablesUpdate<'organization_members'>

export type Session = Tables<'sessions'>
export type SessionInsert = TablesInsert<'sessions'>
export type SessionUpdate = TablesUpdate<'sessions'>

export type Webhook = Tables<'webhooks'>
export type WebhookInsert = TablesInsert<'webhooks'>
export type WebhookUpdate = TablesUpdate<'webhooks'>

export type WebhookDelivery = Tables<'webhook_deliveries'>
export type WebhookDeliveryInsert = TablesInsert<'webhook_deliveries'>
export type WebhookDeliveryUpdate = TablesUpdate<'webhook_deliveries'>

export type SSOProvider = Tables<'sso_providers'>
export type SSOProviderInsert = TablesInsert<'sso_providers'>
export type SSOProviderUpdate = TablesUpdate<'sso_providers'>

export type SSOSession = Tables<'sso_sessions'>
export type SSOSessionInsert = TablesInsert<'sso_sessions'>
export type SSOSessionUpdate = TablesUpdate<'sso_sessions'>

export type SSOAuthAttempt = Tables<'sso_auth_attempts'>
export type SSOAuthAttemptInsert = TablesInsert<'sso_auth_attempts'>

export type ActivityLog = Tables<'activity_logs'>
export type ActivityLogInsert = TablesInsert<'activity_logs'>

export type Notification = Tables<'notifications'>
export type NotificationInsert = TablesInsert<'notifications'>
export type NotificationUpdate = TablesUpdate<'notifications'>

export type Invoice = Tables<'invoices'>
export type InvoiceInsert = TablesInsert<'invoices'>
export type InvoiceUpdate = TablesUpdate<'invoices'>

export type Subscription = Tables<'subscriptions'>
export type SubscriptionInsert = TablesInsert<'subscriptions'>
export type SubscriptionUpdate = TablesUpdate<'subscriptions'>

export type Coupon = Tables<'coupons'>
export type CouponInsert = TablesInsert<'coupons'>
export type CouponUpdate = TablesUpdate<'coupons'>

export type UsageReport = Tables<'usage_reports'>
export type UsageReportInsert = TablesInsert<'usage_reports'>

export type AssessmentResult = Tables<'assessment_results'>
export type AssessmentResultInsert = TablesInsert<'assessment_results'>
export type AssessmentResultUpdate = TablesUpdate<'assessment_results'>

export type Event = Tables<'events'>
export type EventInsert = TablesInsert<'events'>
export type EventUpdate = TablesUpdate<'events'>

export type CreditBalance = Tables<'credit_balances'>
export type CreditBalanceInsert = TablesInsert<'credit_balances'>
export type CreditBalanceUpdate = TablesUpdate<'credit_balances'>

export type CreditTransaction = Tables<'credit_transactions'>
export type CreditTransactionInsert = TablesInsert<'credit_transactions'>

export type OrganizationInvitation = Tables<'organization_invitations'>
export type OrganizationInvitationInsert = TablesInsert<'organization_invitations'>
export type OrganizationInvitationUpdate = TablesUpdate<'organization_invitations'>

// OrganizationRole is a simple string type for member role values ('owner' | 'admin' | 'member')
export type OrganizationRole = 'owner' | 'admin' | 'member'

// Full organization_roles table row type (for the roles configuration table)
export type OrganizationRoleRow = Tables<'organization_roles'>
export type OrganizationRoleInsert = TablesInsert<'organization_roles'>
export type OrganizationRoleUpdate = TablesUpdate<'organization_roles'>

export type OrganizationSubscription = Tables<'organization_subscriptions'>
export type OrganizationSubscriptionInsert = TablesInsert<'organization_subscriptions'>
export type OrganizationSubscriptionUpdate = TablesUpdate<'organization_subscriptions'>

export type PaymentMethod = Tables<'payment_methods'>
export type PaymentMethodInsert = TablesInsert<'payment_methods'>
export type PaymentMethodUpdate = TablesUpdate<'payment_methods'>

export type RateLimitConfig = Tables<'rate_limit_configs'>
export type RateLimitConfigInsert = TablesInsert<'rate_limit_configs'>
export type RateLimitConfigUpdate = TablesUpdate<'rate_limit_configs'>

export type RateLimitTier = Tables<'rate_limit_tiers'>
export type RateLimitTierInsert = TablesInsert<'rate_limit_tiers'>
export type RateLimitTierUpdate = TablesUpdate<'rate_limit_tiers'>

export type RateLimitViolation = Tables<'rate_limit_violations'>
export type RateLimitViolationInsert = TablesInsert<'rate_limit_violations'>

export type ApiKey = Tables<'api_keys'>
export type ApiKeyInsert = TablesInsert<'api_keys'>
export type ApiKeyUpdate = TablesUpdate<'api_keys'>

export type SubscriptionPlan = Tables<'subscription_plans'>
export type SubscriptionPlanInsert = TablesInsert<'subscription_plans'>
export type SubscriptionPlanUpdate = TablesUpdate<'subscription_plans'>

export type OrganizationActivityLog = Tables<'organization_activity_log'>
export type OrganizationActivityLogInsert = TablesInsert<'organization_activity_log'>

export type ScheduledEmail = Tables<'scheduled_emails'>
export type ScheduledEmailInsert = TablesInsert<'scheduled_emails'>
export type ScheduledEmailUpdate = TablesUpdate<'scheduled_emails'>

export type Waitlist = Tables<'waitlist'>
export type WaitlistInsert = TablesInsert<'waitlist'>
export type WaitlistUpdate = TablesUpdate<'waitlist'>

export type CourseEnrollment = Tables<'course_enrollments'>
export type CourseEnrollmentInsert = TablesInsert<'course_enrollments'>
export type CourseEnrollmentUpdate = TablesUpdate<'course_enrollments'>

// Aliases for backward compatibility
export type OrganizationMembership = OrganizationMember
export type OrganizationInvite = OrganizationInvitation

// Enum type aliases (these match the database CHECK constraints)
export type DiscountType = 'percentage' | 'fixed'
export type ApplicableTo = 'all' | 'courses' | 'events' | 'coaching'
export type CreditType = 'standard' | 'bonus' | 'promotional'
export type UserRole = 'registered' | 'student' | 'instructor' | 'business' | 'school' | 'admin'
export type InstructorStatus = 'pending' | 'approved' | 'revoked'
export type EnrollmentStatus = 'active' | 'completed' | 'cancelled'
export type SessionStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
export type OrganizationType = 'business' | 'school' | 'nonprofit'
export type WebhookDeliveryStatus = 'pending' | 'success' | 'failed'
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

// Typed Supabase client helper
export type TypedSupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>
