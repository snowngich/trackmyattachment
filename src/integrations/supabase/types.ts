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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      attachments: {
        Row: {
          company_id: string
          coordinator_id: string | null
          created_at: string
          department_id: string | null
          end_date: string
          id: string
          lecturer_name: string | null
          start_date: string
          status: Database["public"]["Enums"]["attachment_status"]
          student_id: string
          supervisor_id: string | null
          supervisor_name: string | null
          updated_at: string
        }
        Insert: {
          company_id: string
          coordinator_id?: string | null
          created_at?: string
          department_id?: string | null
          end_date: string
          id?: string
          lecturer_name?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["attachment_status"]
          student_id: string
          supervisor_id?: string | null
          supervisor_name?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string
          coordinator_id?: string | null
          created_at?: string
          department_id?: string | null
          end_date?: string
          id?: string
          lecturer_name?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["attachment_status"]
          student_id?: string
          supervisor_id?: string | null
          supervisor_name?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attachments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback: {
        Row: {
          author_id: string
          comment: string
          created_at: string
          id: string
          log_id: string
        }
        Insert: {
          author_id: string
          comment: string
          created_at?: string
          id?: string
          log_id: string
        }
        Update: {
          author_id?: string
          comment?: string
          created_at?: string
          id?: string
          log_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
        ]
      }
      log_entries: {
        Row: {
          activity: string
          created_at: string
          entry_date: string
          id: string
          lesson_learnt: string | null
          log_id: string
          problem_faced: string | null
          supervisor_remarks: string | null
          time_from: string | null
          time_to: string | null
          updated_at: string
        }
        Insert: {
          activity: string
          created_at?: string
          entry_date: string
          id?: string
          lesson_learnt?: string | null
          log_id: string
          problem_faced?: string | null
          supervisor_remarks?: string | null
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
        }
        Update: {
          activity?: string
          created_at?: string
          entry_date?: string
          id?: string
          lesson_learnt?: string | null
          log_id?: string
          problem_faced?: string | null
          supervisor_remarks?: string | null
          time_from?: string | null
          time_to?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_entries_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
        ]
      }
      log_files: {
        Row: {
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          log_id: string
          uploaded_at: string
        }
        Insert: {
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          log_id: string
          uploaded_at?: string
        }
        Update: {
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          log_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "log_files_log_id_fkey"
            columns: ["log_id"]
            isOneToOne: false
            referencedRelation: "logs"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          attachment_id: string
          content: string
          created_at: string
          id: string
          submitted_at: string | null
          supervisor_approved: boolean
          updated_at: string
          week_number: number
        }
        Insert: {
          attachment_id: string
          content: string
          created_at?: string
          id?: string
          submitted_at?: string | null
          supervisor_approved?: boolean
          updated_at?: string
          week_number: number
        }
        Update: {
          attachment_id?: string
          content?: string
          created_at?: string
          id?: string
          submitted_at?: string | null
          supervisor_approved?: boolean
          updated_at?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "logs_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "attachments"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          name: string
          type: Database["public"]["Enums"]["organization_type"]
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          name: string
          type: Database["public"]["Enums"]["organization_type"]
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["organization_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department_id: string | null
          full_name: string
          id: string
          organization_id: string | null
          phone: string | null
          student_reg_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department_id?: string | null
          full_name: string
          id?: string
          organization_id?: string | null
          phone?: string | null
          student_reg_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department_id?: string | null
          full_name?: string
          id?: string
          organization_id?: string | null
          phone?: string | null
          student_reg_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_profile: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_coordinator: { Args: never; Returns: boolean }
      is_coordinator_of_attachment: {
        Args: { _attachment_id: string }
        Returns: boolean
      }
      is_log_owner: { Args: { _log_id: string }; Returns: boolean }
      is_student: { Args: never; Returns: boolean }
      is_supervisor: { Args: never; Returns: boolean }
      is_supervisor_of_attachment: {
        Args: { _attachment_id: string }
        Returns: boolean
      }
      is_supervisor_of_log: { Args: { _log_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "student" | "supervisor" | "coordinator" | "admin"
      attachment_status: "pending" | "active" | "completed" | "rejected"
      organization_type: "university" | "company"
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
    Enums: {
      app_role: ["student", "supervisor", "coordinator", "admin"],
      attachment_status: ["pending", "active", "completed", "rejected"],
      organization_type: ["university", "company"],
    },
  },
} as const
