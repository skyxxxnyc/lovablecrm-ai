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
      activities: {
        Row: {
          activity_date: string | null
          activity_type: string
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          subject: string | null
          user_id: string
        }
        Insert: {
          activity_date?: string | null
          activity_type: string
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          subject?: string | null
          user_id: string
        }
        Update: {
          activity_date?: string | null
          activity_type?: string
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          subject?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_timeline: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
          user_id?: string
        }
        Relationships: []
      }
      automation_execution_logs: {
        Row: {
          actions_performed: Json | null
          automation_rule_id: string
          created_at: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          status: string
          trigger_data: Json | null
          user_id: string
        }
        Insert: {
          actions_performed?: Json | null
          automation_rule_id: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status: string
          trigger_data?: Json | null
          user_id: string
        }
        Update: {
          actions_performed?: Json | null
          automation_rule_id?: string
          created_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          trigger_data?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_logs_automation_rule_id_fkey"
            columns: ["automation_rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          action_config: Json
          action_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_config: Json
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_active: boolean | null
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_active?: boolean | null
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_active?: boolean | null
          start_time?: string
          user_id?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string | null
          end_time: string
          google_calendar_id: string | null
          google_event_id: string | null
          id: string
          last_synced_at: string | null
          location: string | null
          meeting_notes: string | null
          start_time: string
          sync_status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_time: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          meeting_notes?: string | null
          start_time: string
          sync_status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_time?: string
          google_calendar_id?: string | null
          google_event_id?: string | null
          id?: string
          last_synced_at?: string | null
          location?: string | null
          meeting_notes?: string | null
          start_time?: string
          sync_status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      chat_suggestions: {
        Row: {
          created_at: string | null
          description: string
          dismissed: boolean | null
          entity_id: string | null
          entity_type: string | null
          id: string
          priority: string | null
          suggestion_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description: string
          dismissed?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string | null
          suggestion_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string
          dismissed?: boolean | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string | null
          suggestion_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          industry: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
          user_id: string
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id: string
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          industry?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      contacts: {
        Row: {
          company_id: string | null
          created_at: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          phone: string | null
          position: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          amount: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          expected_close_date: string | null
          id: string
          notes: string | null
          probability: number | null
          stage: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          expected_close_date?: string | null
          id?: string
          notes?: string | null
          probability?: number | null
          stage?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      email_sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emails: {
        Row: {
          body: string | null
          contact_id: string | null
          created_at: string | null
          from_email: string | null
          gmail_id: string | null
          id: string
          is_outbound: boolean | null
          sent_at: string | null
          subject: string | null
          to_email: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          contact_id?: string | null
          created_at?: string | null
          from_email?: string | null
          gmail_id?: string | null
          id?: string
          is_outbound?: boolean | null
          sent_at?: string | null
          subject?: string | null
          to_email?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          contact_id?: string | null
          created_at?: string | null
          from_email?: string | null
          gmail_id?: string | null
          id?: string
          is_outbound?: boolean | null
          sent_at?: string | null
          subject?: string | null
          to_email?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emails_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_contacts: {
        Row: {
          contact_id: string
          event_id: string
        }
        Insert: {
          contact_id: string
          event_id: string
        }
        Update: {
          contact_id?: string
          event_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_contacts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "calendar_events"
            referencedColumns: ["id"]
          },
        ]
      }
      gmail_tokens: {
        Row: {
          access_token: string | null
          created_at: string | null
          expires_at: string | null
          refresh_token: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          expires_at?: string | null
          refresh_token?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          config: Json
          created_at: string | null
          id: string
          integration_type: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          config: Json
          created_at?: string | null
          id?: string
          integration_type: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          config?: Json
          created_at?: string | null
          id?: string
          integration_type?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      prompts: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scheduled_meetings: {
        Row: {
          attendee_email: string
          attendee_name: string
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          scheduling_link_id: string
          start_time: string
        }
        Insert: {
          attendee_email: string
          attendee_name: string
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          scheduling_link_id: string
          start_time: string
        }
        Update: {
          attendee_email?: string
          attendee_name?: string
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          scheduling_link_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_meetings_scheduling_link_id_fkey"
            columns: ["scheduling_link_id"]
            isOneToOne: false
            referencedRelation: "scheduling_links"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_links: {
        Row: {
          active: boolean | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          slug: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          slug: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          slug?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sequence_enrollments: {
        Row: {
          completed_at: string | null
          contact_id: string
          current_step: number | null
          enrolled_at: string | null
          id: string
          next_send_at: string | null
          paused_at: string | null
          sequence_id: string
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_send_at?: string | null
          paused_at?: string | null
          sequence_id: string
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string
          current_step?: number | null
          enrolled_at?: string | null
          id?: string
          next_send_at?: string | null
          paused_at?: string | null
          sequence_id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      sequence_steps: {
        Row: {
          body: string
          created_at: string | null
          delay_days: number
          delay_hours: number
          id: string
          sequence_id: string
          step_number: number
          subject: string
        }
        Insert: {
          body: string
          created_at?: string | null
          delay_days?: number
          delay_hours?: number
          id?: string
          sequence_id: string
          step_number: number
          subject: string
        }
        Update: {
          body?: string
          created_at?: string | null
          delay_days?: number
          delay_hours?: number
          id?: string
          sequence_id?: string
          step_number?: number
          subject?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string | null
          onboarding_completed: boolean | null
          push_notifications_enabled: boolean | null
          push_subscription: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          onboarding_completed?: boolean | null
          push_notifications_enabled?: boolean | null
          push_subscription?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          onboarding_completed?: boolean | null
          push_notifications_enabled?: boolean | null
          push_subscription?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          error_message: string | null
          executed_at: string | null
          id: string
          status: string
          trigger_data: Json | null
          user_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          trigger_data?: Json | null
          user_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          error_message?: string | null
          executed_at?: string | null
          id?: string
          status?: string
          trigger_data?: Json | null
          user_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          actions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          trigger_conditions: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actions: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          trigger_conditions?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          trigger_conditions?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_smart_suggestions: {
        Args: { p_user_id: string }
        Returns: undefined
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

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
