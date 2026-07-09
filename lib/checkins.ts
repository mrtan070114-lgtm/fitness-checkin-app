import type { SupabaseClient } from "@supabase/supabase-js";
import type { Checkin, Database } from "@/types/database";

export const RECORD_LIST_LIMIT = 20;
export const DASHBOARD_ACTIVITY_LIMIT = 500;

export const RECORD_SUMMARY_COLUMNS =
  "id,user_id,checkin_date,session_title,training_type,training_types,exercise_names,exercise_details,duration_minutes,weight,image_url,locked,created_at,updated_at";

export const CHECKIN_ACTIVITY_COLUMNS =
  "id,checkin_date,session_title,training_type,training_types,exercise_names,exercise_details,duration_minutes,weight,created_at";

export type CheckinSummary = Pick<
  Checkin,
  | "id"
  | "user_id"
  | "checkin_date"
  | "session_title"
  | "training_type"
  | "training_types"
  | "exercise_names"
  | "exercise_details"
  | "duration_minutes"
  | "weight"
  | "image_url"
  | "locked"
  | "created_at"
  | "updated_at"
> & {
  likeCount?: number;
  commentCount?: number;
};

export type CheckinActivity = Pick<
  Checkin,
  "id" | "checkin_date" | "session_title" | "training_type" | "training_types" | "exercise_names" | "exercise_details" | "duration_minutes" | "weight" | "created_at"
>;

type AppSupabaseClient = SupabaseClient<Database>;

type CheckinDateQuery = {
  startDate?: string;
  endDate?: string;
};

export function fetchRecentCheckins(
  supabase: AppSupabaseClient,
  userId: string,
  limit = RECORD_LIST_LIMIT,
  dateQuery: CheckinDateQuery = {}
) {
  let query = supabase
    .from("checkins")
    .select(RECORD_SUMMARY_COLUMNS)
    .eq("user_id", userId);

  if (dateQuery.startDate) {
    query = query.gte("checkin_date", dateQuery.startDate);
  }

  if (dateQuery.endDate) {
    query = query.lte("checkin_date", dateQuery.endDate);
  }

  return query.order("created_at", { ascending: false }).range(0, limit - 1);
}

export function fetchDashboardActivity(supabase: AppSupabaseClient, userId: string, startDate: string, endDate: string) {
  return supabase
    .from("checkins")
    .select(CHECKIN_ACTIVITY_COLUMNS)
    .eq("user_id", userId)
    .gte("checkin_date", startDate)
    .lte("checkin_date", endDate)
    .order("created_at", { ascending: false })
    .range(0, DASHBOARD_ACTIVITY_LIMIT - 1);
}
