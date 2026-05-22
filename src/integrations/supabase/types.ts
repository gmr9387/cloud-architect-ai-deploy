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
      deployment_blueprints: {
        Row: {
          backup_strategy: string | null
          cicd_plan: string | null
          created_at: string
          created_by: string | null
          database_plan: string | null
          environment: Database["public"]["Enums"]["blueprint_env"]
          hosting_target: string | null
          id: string
          is_current: boolean
          monitoring_plan: string | null
          notes: string | null
          rollback_strategy: string | null
          secrets_plan: string | null
          topology_id: string
          updated_at: string
          version: number
        }
        Insert: {
          backup_strategy?: string | null
          cicd_plan?: string | null
          created_at?: string
          created_by?: string | null
          database_plan?: string | null
          environment: Database["public"]["Enums"]["blueprint_env"]
          hosting_target?: string | null
          id?: string
          is_current?: boolean
          monitoring_plan?: string | null
          notes?: string | null
          rollback_strategy?: string | null
          secrets_plan?: string | null
          topology_id: string
          updated_at?: string
          version?: number
        }
        Update: {
          backup_strategy?: string | null
          cicd_plan?: string | null
          created_at?: string
          created_by?: string | null
          database_plan?: string | null
          environment?: Database["public"]["Enums"]["blueprint_env"]
          hosting_target?: string | null
          id?: string
          is_current?: boolean
          monitoring_plan?: string | null
          notes?: string | null
          rollback_strategy?: string | null
          secrets_plan?: string | null
          topology_id?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      deployment_events: {
        Row: {
          created_at: string
          duration_seconds: number | null
          environment: Database["public"]["Enums"]["blueprint_env"]
          failure_reason: string | null
          id: string
          kind: Database["public"]["Enums"]["deployment_event_kind"]
          notes: string | null
          occurred_at: string
          service_id: string | null
          status: Database["public"]["Enums"]["deployment_event_status"]
          topology_id: string
          triggered_by: string | null
          version_tag: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          environment: Database["public"]["Enums"]["blueprint_env"]
          failure_reason?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["deployment_event_kind"]
          notes?: string | null
          occurred_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["deployment_event_status"]
          topology_id: string
          triggered_by?: string | null
          version_tag?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          environment?: Database["public"]["Enums"]["blueprint_env"]
          failure_reason?: string | null
          id?: string
          kind?: Database["public"]["Enums"]["deployment_event_kind"]
          notes?: string | null
          occurred_at?: string
          service_id?: string | null
          status?: Database["public"]["Enums"]["deployment_event_status"]
          topology_id?: string
          triggered_by?: string | null
          version_tag?: string | null
        }
        Relationships: []
      }
      environments: {
        Row: {
          config_status: Database["public"]["Enums"]["readiness_status"]
          created_at: string
          database_status: Database["public"]["Enums"]["readiness_status"]
          environment_kind: Database["public"]["Enums"]["environment_kind"]
          id: string
          monitoring_status: Database["public"]["Enums"]["readiness_status"]
          notes: string | null
          risk_score: number
          secrets_status: Database["public"]["Enums"]["readiness_status"]
          topology_id: string
          updated_at: string
          worker_status: Database["public"]["Enums"]["readiness_status"]
        }
        Insert: {
          config_status?: Database["public"]["Enums"]["readiness_status"]
          created_at?: string
          database_status?: Database["public"]["Enums"]["readiness_status"]
          environment_kind: Database["public"]["Enums"]["environment_kind"]
          id?: string
          monitoring_status?: Database["public"]["Enums"]["readiness_status"]
          notes?: string | null
          risk_score?: number
          secrets_status?: Database["public"]["Enums"]["readiness_status"]
          topology_id: string
          updated_at?: string
          worker_status?: Database["public"]["Enums"]["readiness_status"]
        }
        Update: {
          config_status?: Database["public"]["Enums"]["readiness_status"]
          created_at?: string
          database_status?: Database["public"]["Enums"]["readiness_status"]
          environment_kind?: Database["public"]["Enums"]["environment_kind"]
          id?: string
          monitoring_status?: Database["public"]["Enums"]["readiness_status"]
          notes?: string | null
          risk_score?: number
          secrets_status?: Database["public"]["Enums"]["readiness_status"]
          topology_id?: string
          updated_at?: string
          worker_status?: Database["public"]["Enums"]["readiness_status"]
        }
        Relationships: [
          {
            foreignKeyName: "environments_topology_id_fkey"
            columns: ["topology_id"]
            isOneToOne: false
            referencedRelation: "topologies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          framework: string | null
          id: string
          last_deployed_at: string | null
          name: string
          repository_url: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          last_deployed_at?: string | null
          name: string
          repository_url?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          last_deployed_at?: string | null
          name?: string
          repository_url?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      runbooks: {
        Row: {
          created_at: string
          estimated_duration_minutes: number | null
          id: string
          kind: Database["public"]["Enums"]["runbook_kind"]
          owner: string | null
          rollback_steps: Json
          service_id: string | null
          steps: Json
          summary: string | null
          title: string
          topology_id: string
          updated_at: string
          validation_steps: Json
        }
        Insert: {
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          kind: Database["public"]["Enums"]["runbook_kind"]
          owner?: string | null
          rollback_steps?: Json
          service_id?: string | null
          steps?: Json
          summary?: string | null
          title: string
          topology_id: string
          updated_at?: string
          validation_steps?: Json
        }
        Update: {
          created_at?: string
          estimated_duration_minutes?: number | null
          id?: string
          kind?: Database["public"]["Enums"]["runbook_kind"]
          owner?: string | null
          rollback_steps?: Json
          service_id?: string | null
          steps?: Json
          summary?: string | null
          title?: string
          topology_id?: string
          updated_at?: string
          validation_steps?: Json
        }
        Relationships: []
      }
      secrets_registry: {
        Row: {
          created_at: string
          environment: Database["public"]["Enums"]["blueprint_env"]
          expires_at: string | null
          id: string
          last_rotated_at: string | null
          notes: string | null
          owner: string | null
          rotation_interval_days: number | null
          secret_name: string
          service_id: string | null
          state: Database["public"]["Enums"]["secret_state"]
          topology_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          environment: Database["public"]["Enums"]["blueprint_env"]
          expires_at?: string | null
          id?: string
          last_rotated_at?: string | null
          notes?: string | null
          owner?: string | null
          rotation_interval_days?: number | null
          secret_name: string
          service_id?: string | null
          state?: Database["public"]["Enums"]["secret_state"]
          topology_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          environment?: Database["public"]["Enums"]["blueprint_env"]
          expires_at?: string | null
          id?: string
          last_rotated_at?: string | null
          notes?: string | null
          owner?: string | null
          rotation_interval_days?: number | null
          secret_name?: string
          service_id?: string | null
          state?: Database["public"]["Enums"]["secret_state"]
          topology_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_dependencies: {
        Row: {
          created_at: string
          dependency_type: Database["public"]["Enums"]["dependency_type"]
          from_service_id: string
          id: string
          notes: string | null
          to_service_id: string
          topology_id: string
        }
        Insert: {
          created_at?: string
          dependency_type?: Database["public"]["Enums"]["dependency_type"]
          from_service_id: string
          id?: string
          notes?: string | null
          to_service_id: string
          topology_id: string
        }
        Update: {
          created_at?: string
          dependency_type?: Database["public"]["Enums"]["dependency_type"]
          from_service_id?: string
          id?: string
          notes?: string | null
          to_service_id?: string
          topology_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_dependencies_from_service_id_fkey"
            columns: ["from_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_dependencies_to_service_id_fkey"
            columns: ["to_service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_dependencies_topology_id_fkey"
            columns: ["topology_id"]
            isOneToOne: false
            referencedRelation: "topologies"
            referencedColumns: ["id"]
          },
        ]
      }
      service_environment_state: {
        Row: {
          config_status: Database["public"]["Enums"]["readiness_status"]
          created_at: string
          deployment_status: Database["public"]["Enums"]["readiness_status"]
          environment_id: string
          id: string
          last_deployed_at: string | null
          notes: string | null
          observability_status: Database["public"]["Enums"]["coverage_status"]
          secrets_status: Database["public"]["Enums"]["readiness_status"]
          service_id: string
          topology_id: string
          updated_at: string
        }
        Insert: {
          config_status?: Database["public"]["Enums"]["readiness_status"]
          created_at?: string
          deployment_status?: Database["public"]["Enums"]["readiness_status"]
          environment_id: string
          id?: string
          last_deployed_at?: string | null
          notes?: string | null
          observability_status?: Database["public"]["Enums"]["coverage_status"]
          secrets_status?: Database["public"]["Enums"]["readiness_status"]
          service_id: string
          topology_id: string
          updated_at?: string
        }
        Update: {
          config_status?: Database["public"]["Enums"]["readiness_status"]
          created_at?: string
          deployment_status?: Database["public"]["Enums"]["readiness_status"]
          environment_id?: string
          id?: string
          last_deployed_at?: string | null
          notes?: string | null
          observability_status?: Database["public"]["Enums"]["coverage_status"]
          secrets_status?: Database["public"]["Enums"]["readiness_status"]
          service_id?: string
          topology_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_environment_state_environment_id_fkey"
            columns: ["environment_id"]
            isOneToOne: false
            referencedRelation: "environments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_environment_state_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_environment_state_topology_id_fkey"
            columns: ["topology_id"]
            isOneToOne: false
            referencedRelation: "topologies"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string
          description: string | null
          health_check_path: string | null
          hosting_rationale: string | null
          hosting_target: string | null
          id: string
          name: string
          observability_requirements: string[]
          readiness_status: Database["public"]["Enums"]["readiness_status"]
          region: string | null
          required_secrets: string[]
          runtime: string | null
          scaling_profile: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          topology_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          health_check_path?: string | null
          hosting_rationale?: string | null
          hosting_target?: string | null
          id?: string
          name: string
          observability_requirements?: string[]
          readiness_status?: Database["public"]["Enums"]["readiness_status"]
          region?: string | null
          required_secrets?: string[]
          runtime?: string | null
          scaling_profile?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          topology_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          health_check_path?: string | null
          hosting_rationale?: string | null
          hosting_target?: string | null
          id?: string
          name?: string
          observability_requirements?: string[]
          readiness_status?: Database["public"]["Enums"]["readiness_status"]
          region?: string | null
          required_secrets?: string[]
          runtime?: string | null
          scaling_profile?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          topology_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_topology_id_fkey"
            columns: ["topology_id"]
            isOneToOne: false
            referencedRelation: "topologies"
            referencedColumns: ["id"]
          },
        ]
      }
      topologies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          system_key: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          system_key: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          system_key?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      user_owns_topology: { Args: { _topology_id: string }; Returns: boolean }
    }
    Enums: {
      blueprint_env: "development" | "staging" | "production"
      coverage_status: "covered" | "partial" | "missing" | "not_required"
      dependency_type: "sync" | "async" | "data" | "secret"
      deployment_event_kind: "deploy" | "rollback" | "failure" | "hotfix"
      deployment_event_status: "success" | "failed" | "in_progress" | "reverted"
      environment_kind: "local" | "development" | "staging" | "production"
      readiness_status: "ready" | "partial" | "blocked" | "missing"
      runbook_kind:
        | "deployment"
        | "rollback"
        | "outage"
        | "incident"
        | "secret_rotation"
        | "backup_restore"
      secret_state: "present" | "missing" | "expired" | "rotating"
      service_type:
        | "frontend"
        | "api"
        | "worker"
        | "edge_function"
        | "database"
        | "storage"
        | "queue"
        | "telemetry"
        | "vault"
        | "webhook_ingress"
        | "scheduler"
        | "observability"
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
      blueprint_env: ["development", "staging", "production"],
      coverage_status: ["covered", "partial", "missing", "not_required"],
      dependency_type: ["sync", "async", "data", "secret"],
      deployment_event_kind: ["deploy", "rollback", "failure", "hotfix"],
      deployment_event_status: ["success", "failed", "in_progress", "reverted"],
      environment_kind: ["local", "development", "staging", "production"],
      readiness_status: ["ready", "partial", "blocked", "missing"],
      runbook_kind: [
        "deployment",
        "rollback",
        "outage",
        "incident",
        "secret_rotation",
        "backup_restore",
      ],
      secret_state: ["present", "missing", "expired", "rotating"],
      service_type: [
        "frontend",
        "api",
        "worker",
        "edge_function",
        "database",
        "storage",
        "queue",
        "telemetry",
        "vault",
        "webhook_ingress",
        "scheduler",
        "observability",
      ],
    },
  },
} as const
