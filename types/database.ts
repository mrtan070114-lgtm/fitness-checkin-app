export type UserRole = "user" | "admin";

export type ThemeColor = "green" | "blue" | "purple" | "pink" | "orange" | "black";

export type TrainingType = "腹" | "胸" | "背" | "腿" | "肩" | "手臂" | "有氧";

export type Mood = "很好" | "不错" | "一般" | "疲惫" | "低落";

export type Profile = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  bind_code: string;
  bound_user_id: string | null;
  theme_color: ThemeColor | null;
  avatar_url: string | null;
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

export type Goal = {
  id: string;
  user_id: string;
  current_weight: number | null;
  target_weight: number | null;
  weekly_workout_target: number | null;
  daily_minutes_target: number | null;
  target_date: string | null;
  goal_note: string | null;
  created_at: string;
  updated_at: string;
};

export type GoalInsert = {
  user_id: string;
  current_weight?: number | null;
  target_weight?: number | null;
  weekly_workout_target?: number | null;
  daily_minutes_target?: number | null;
  target_date?: string | null;
  goal_note?: string | null;
};

export type GoalUpdate = Partial<Omit<Goal, "id" | "user_id" | "created_at">>;

export type CheckinLike = {
  id: string;
  checkin_id: string;
  user_id: string;
  created_at: string;
};

export type CheckinComment = {
  id: string;
  checkin_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type CheckinCommentInsert = {
  checkin_id: string;
  user_id: string;
  content: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at" | "theme_color" | "avatar_url"> & {
          theme_color?: ThemeColor | null;
          avatar_url?: string | null;
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
      goals: {
        Row: Goal;
        Insert: GoalInsert;
        Update: GoalUpdate;
        Relationships: [];
      };
      checkin_likes: {
        Row: CheckinLike;
        Insert: Omit<CheckinLike, "id" | "created_at">;
        Update: Partial<Omit<CheckinLike, "id" | "created_at">>;
        Relationships: [];
      };
      checkin_comments: {
        Row: CheckinComment;
        Insert: CheckinCommentInsert;
        Update: Partial<Pick<CheckinComment, "content" | "updated_at">>;
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
      unbind_partner: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      update_my_theme_color: {
        Args: {
          theme_color: string;
        };
        Returns: Profile;
      };
      update_my_profile: {
        Args: {
          display_name: string;
          avatar_url: string | null;
        };
        Returns: Profile;
      };
      toggle_checkin_like: {
        Args: {
          target_checkin_id: string;
        };
        Returns: boolean;
      };
      can_access_checkin: {
        Args: {
          target_checkin_id: string;
        };
        Returns: boolean;
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
