export type UserRole = "user" | "admin";

export type TrainingType = "胸" | "背" | "腿" | "肩" | "手臂" | "有氧" | "休息";

export type Mood = "很好" | "不错" | "一般" | "疲惫" | "低落";

export type Profile = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  bind_code: string;
  bound_user_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Checkin = {
  id: string;
  user_id: string;
  checkin_date: string;
  session_title: string | null;
  training_type: TrainingType;
  duration_minutes: number | null;
  weight: number | null;
  diet: string | null;
  mood: Mood | null;
  note: string | null;
  image_url: string | null;
  locked: boolean;
  created_at: string;
  updated_at: string;
};

export type CheckinInsert = {
  user_id: string;
  checkin_date: string;
  session_title?: string | null;
  training_type: TrainingType;
  duration_minutes?: number | null;
  weight?: number | null;
  diet?: string | null;
  mood?: Mood | null;
  note?: string | null;
  image_url?: string | null;
  locked?: boolean;
};

export type CheckinUpdate = Partial<
  Pick<
    Checkin,
    | "training_type"
    | "session_title"
    | "duration_minutes"
    | "weight"
    | "diet"
    | "mood"
    | "note"
    | "image_url"
    | "updated_at"
  >
>;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id" | "created_at">>;
        Relationships: [];
      };
      checkins: {
        Row: Checkin;
        Insert: CheckinInsert;
        Update: CheckinUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      bind_partner: {
        Args: {
          target_bind_code: string;
        };
        Returns: Profile;
      };
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
