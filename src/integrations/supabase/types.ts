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
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          answer_timings: Json | null
          answers: Json | null
          assessment_id: string
          candidate_id: string
          completed: boolean
          completed_at: string | null
          created_at: string
          feedback: string | null
          id: string
          reviewed_at: string | null
          reviewed_by: string | null
          score: number
          started_at: string
          updated_at: string
        }
        Insert: {
          answer_timings?: Json | null
          answers?: Json | null
          assessment_id: string
          candidate_id: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score: number
          started_at?: string
          updated_at?: string
        }
        Update: {
          answer_timings?: Json | null
          answers?: Json | null
          assessment_id?: string
          candidate_id?: string
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          feedback?: string | null
          id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          score?: number
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sections: {
        Row: {
          assessment_id: string
          created_at: string
          description: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          assessment_id: string
          created_at?: string
          description?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          assessment_id?: string
          created_at?: string
          description?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string
          description: string | null
          difficulty: string | null
          id: string
          prevent_backtracking: boolean | null
          randomize_questions: boolean | null
          time_limit: number | null
          title: string
          topic: string | null
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          difficulty?: string | null
          id?: string
          prevent_backtracking?: boolean | null
          randomize_questions?: boolean | null
          time_limit?: number | null
          title: string
          topic?: string | null
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          difficulty?: string | null
          id?: string
          prevent_backtracking?: boolean | null
          randomize_questions?: boolean | null
          time_limit?: number | null
          title?: string
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          about_me_video: string | null
          assigned_manager: string | null
          current_step: number
          id: string
          location: string | null
          phone: string | null
          region: string | null
          resume: string | null
          sales_pitch_video: string | null
          status: string
          updated_at: string
        }
        Insert: {
          about_me_video?: string | null
          assigned_manager?: string | null
          current_step?: number
          id: string
          location?: string | null
          phone?: string | null
          region?: string | null
          resume?: string | null
          sales_pitch_video?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          about_me_video?: string | null
          assigned_manager?: string | null
          current_step?: number
          id?: string
          location?: string | null
          phone?: string | null
          region?: string | null
          resume?: string | null
          sales_pitch_video?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidates_assigned_manager_fkey"
            columns: ["assigned_manager"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "candidates_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          invite_code: string | null
          logo: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          invite_code?: string | null
          logo?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          invite_code?: string | null
          logo?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_admins: {
        Row: {
          company_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_admins_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          candidate_id: string
          created_at: string
          decision: string | null
          feedback: string | null
          id: string
          manager_id: string
          notes: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          decision?: string | null
          feedback?: string | null
          id?: string
          manager_id: string
          notes?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          decision?: string | null
          feedback?: string | null
          id?: string
          manager_id?: string
          notes?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          candidate_id: string
          created_at: string | null
          id: string
          job_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          candidate_id: string
          created_at?: string | null
          id?: string
          job_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          candidate_id?: string
          created_at?: string | null
          id?: string
          job_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_assessments: {
        Row: {
          assessment_id: string
          job_id: string
        }
        Insert: {
          assessment_id: string
          job_id: string
        }
        Update: {
          assessment_id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_assessments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_training: {
        Row: {
          job_id: string
          training_module_id: string
        }
        Insert: {
          job_id: string
          training_module_id: string
        }
        Update: {
          job_id?: string
          training_module_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_training_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_training_training_module_id_fkey"
            columns: ["training_module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string
          department: string | null
          description: string
          employment_type: string | null
          id: string
          is_public: boolean
          location: string | null
          salary_range: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by: string
          department?: string | null
          description: string
          employment_type?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          salary_range?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string
          employment_type?: string | null
          id?: string
          is_public?: boolean
          location?: string | null
          salary_range?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      manager_regions: {
        Row: {
          id: string
          manager_id: string
          region: string
        }
        Insert: {
          id?: string
          manager_id: string
          region: string
        }
        Update: {
          id?: string
          manager_id?: string
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_regions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "managers"
            referencedColumns: ["id"]
          },
        ]
      }
      managers: {
        Row: {
          id: string
          updated_at: string
        }
        Insert: {
          id: string
          updated_at?: string
        }
        Update: {
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "managers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      module_assessments: {
        Row: {
          assessment_id: string | null
          created_at: string
          id: string
          module_id: string | null
          order_number: number
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          order_number?: number
        }
        Update: {
          assessment_id?: string | null
          created_at?: string
          id?: string
          module_id?: string | null
          order_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_assessments_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_assessments_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_videos: {
        Row: {
          created_at: string
          id: string
          module_id: string | null
          order_number: number
          video_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          module_id?: string | null
          order_number?: number
          video_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          module_id?: string | null
          order_number?: number
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_videos_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_videos_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          email: string
          id: string
          name?: string | null
          role: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          correct_answer: number
          created_at: string
          id: string
          options: Json
          score: number | null
          scores: Json | null
          section_id: string
          text: string
          time_limit: number | null
          updated_at: string
        }
        Insert: {
          correct_answer: number
          created_at?: string
          id?: string
          options: Json
          score?: number | null
          scores?: Json | null
          section_id: string
          text: string
          time_limit?: number | null
          updated_at?: string
        }
        Update: {
          correct_answer?: number
          created_at?: string
          id?: string
          options?: Json
          score?: number | null
          scores?: Json | null
          section_id?: string
          text?: string
          time_limit?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "questions_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "assessment_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_results: {
        Row: {
          answers: Json | null
          completed_at: string | null
          created_at: string | null
          id: string
          module: string
          passed: boolean | null
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module: string
          passed?: boolean | null
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module?: string
          passed?: boolean | null
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      sales_tasks: {
        Row: {
          candidate_id: string
          created_at: string
          feedback: string | null
          id: string
          pitch_recording: string | null
          status: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          feedback?: string | null
          id?: string
          pitch_recording?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          feedback?: string | null
          id?: string
          pitch_recording?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_tasks_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      shops: {
        Row: {
          address: string
          contact: string | null
          converted: boolean
          created_at: string
          id: string
          name: string
          sales_task_id: string
          updated_at: string
        }
        Insert: {
          address: string
          contact?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          name: string
          sales_task_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          contact?: string | null
          converted?: boolean
          created_at?: string
          id?: string
          name?: string
          sales_task_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shops_sales_task_id_fkey"
            columns: ["sales_task_id"]
            isOneToOne: false
            referencedRelation: "sales_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          archived: boolean
          content: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_quiz: boolean | null
          module: string
          quiz_id: string | null
          title: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          archived?: boolean
          content?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_quiz?: boolean | null
          module: string
          quiz_id?: string | null
          title: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          archived?: boolean
          content?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_quiz?: boolean | null
          module?: string
          quiz_id?: string | null
          title?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      training_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module: string
          updated_at: string | null
          user_id: string
          video_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module: string
          updated_at?: string | null
          user_id: string
          video_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module?: string
          updated_at?: string | null
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_progress_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          archived: boolean
          created_at: string
          created_by: string
          description: string | null
          duration: string
          file_path: string | null
          file_size: number | null
          id: string
          module: string
          thumbnail: string | null
          title: string
          upload_status: string | null
          url: string
        }
        Insert: {
          archived?: boolean
          created_at?: string
          created_by: string
          description?: string | null
          duration: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          module: string
          thumbnail?: string | null
          title: string
          upload_status?: string | null
          url: string
        }
        Update: {
          archived?: boolean
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: string
          file_path?: string | null
          file_size?: number | null
          id?: string
          module?: string
          thumbnail?: string | null
          title?: string
          upload_status?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "videos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_manage_user: {
        Args: { admin_id: string; action: string; user_data: Json }
        Returns: Json
      }
      delete_job_applications: {
        Args: { job_id: string }
        Returns: undefined
      }
      get_my_profile: {
        Args: { user_id: string }
        Returns: {
          id: string
          name: string
          email: string
          role: string
          created_at: string
          updated_at: string
        }[]
      }
      get_user_company: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_candidate: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_company_admin: {
        Args: { company_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      is_director: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_hr: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_manager: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_activity: {
        Args: {
          user_id: string
          action: string
          entity_type: string
          entity_id: string
          details?: Json
        }
        Returns: string
      }
      log_admin_action: {
        Args: {
          admin_id: string
          action: string
          entity_type: string
          entity_id: string
          details?: Json
        }
        Returns: undefined
      }
      sign_up_with_company: {
        Args: {
          email: string
          password: string
          company_invite_code: string
          user_data?: Json
        }
        Returns: Json
      }
      user_is_in_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      user_is_manager_for_candidate: {
        Args: { manager_id: string; candidate_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "candidate" | "manager" | "admin" | "hr" | "director"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["candidate", "manager", "admin", "hr", "director"],
    },
  },
} as const
