// Supabase-generated types for the core MVP tables.
// Regenerate with: npx supabase gen types typescript --local > lib/types.ts

export type ObservationType =
  | "calm_moment"
  | "sensory_overwhelm"
  | "meltdown"
  | "shutdown"
  | "anxiety"
  | "transition_difficulty"
  | "demand_avoidance"
  | "sleep"
  | "food"
  | "school"
  | "medical"
  | "toileting"
  | "social"
  | "strategy_used"
  | "story_used"
  | "custom_note";

export type EventOutcome = "improved" | "no_change" | "worsened" | "unknown";

export type InsightStatus = "pending" | "confirmed" | "rejected" | "archived";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          name: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
      };
      children: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          date_of_birth: string | null;
          photo_url: string | null;
          about_me: string;
          strengths_interests: string;
          communication_notes: string;
          sensory_needs: string;
          signs_of_distress: string;
          what_helps: string;
          what_to_avoid: string;
          school_care_notes: string;
          emergency_regulation: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          date_of_birth?: string | null;
          about_me?: string;
          strengths_interests?: string;
          communication_notes?: string;
          sensory_needs?: string;
          signs_of_distress?: string;
          what_helps?: string;
          what_to_avoid?: string;
          school_care_notes?: string;
          emergency_regulation?: string;
        };
        Update: Partial<Database["public"]["Tables"]["children"]["Insert"]>;
      };
      observation_events: {
        Row: {
          id: string;
          child_id: string;
          created_by_id: string;
          type: ObservationType;
          occurred_at: string;
          duration_minutes: number | null;
          location: string | null;
          intensity: number | null;
          regulation_before: number | null;
          regulation_after: number | null;
          triggers: string[];
          sensory_factors: string[];
          strategies_tried: string[];
          quick_tags: string[];
          outcome: EventOutcome;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          created_by_id: string;
          type: ObservationType;
          occurred_at: string;
          duration_minutes?: number | null;
          location?: string | null;
          intensity?: number | null;
          regulation_before?: number | null;
          regulation_after?: number | null;
          triggers?: string[];
          sensory_factors?: string[];
          strategies_tried?: string[];
          outcome?: EventOutcome;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["observation_events"]["Insert"]>;
      };
      daily_check_ins: {
        Row: {
          id: string;
          child_id: string;
          created_by_id: string;
          date: string;
          regulation: number | null;
          sleep: number | null;
          mood: number | null;
          notes: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          created_by_id: string;
          date: string;
          regulation?: number | null;
          sleep?: number | null;
          mood?: number | null;
          notes?: string;
        };
        Update: Partial<Database["public"]["Tables"]["daily_check_ins"]["Insert"]>;
      };
      insights: {
        Row: {
          id: string;
          child_id: string;
          claim: string;
          confidence: number;
          data_limitations: string;
          suggested_action: string;
          safety_caveat: string;
          status: InsightStatus;
          reviewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          child_id: string;
          claim: string;
          confidence: number;
          data_limitations: string;
          suggested_action: string;
          safety_caveat?: string;
          status?: InsightStatus;
        };
        Update: Partial<Database["public"]["Tables"]["insights"]["Insert"]>;
      };
    };
  };
}

// Convenience row types
export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"];
export type Child = Database["public"]["Tables"]["children"]["Row"];
export type ObservationEvent = Database["public"]["Tables"]["observation_events"]["Row"];
export type DailyCheckIn = Database["public"]["Tables"]["daily_check_ins"]["Row"];
export type Insight = Database["public"]["Tables"]["insights"]["Row"];

export interface EmotionCheckIn {
  id: string;
  child_id: string;
  created_by_id: string;
  emotion: string;
  date: string;
  created_at: string;
}
