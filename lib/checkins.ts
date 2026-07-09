import type { SupabaseClient } from "@supabase/supabase-js";
import type { Checkin, Database } from "@/types/database";

export const RECORD_LIST_LIMIT = 20;
export const DASHBOARD_ACTIVITY_LIMIT = 500;

const OPTIONAL_CHECKIN_COLUMNS = ["training_types", "exercise_names", "exercise_details"];

export const RECORD_SUMMARY_COLUMNS =
  "id,user_id,checkin_date,session_title,training_type,training_types,exercise_names,exercise_details,duration_minutes,weight,image_url,locked,created_at,updated_at";

export const LEGACY_RECORD_SUMMARY_COLUMNS =
  "id,user_id,checkin_date,session_title,training_type,duration_minutes,weight,image_url,locked,created_at,updated_at";

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

type LegacyCheckinSummary = Omit<CheckinSummary, "training_types" | "exercise_names" | "exercise_details">;

type RecentCheckinsResult = {
  data: CheckinSummary[] | null;
  error: unknown;
  compatibilityError?: unknown;
};

function readErrorText(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const errorRecord = error as Record<string, unknown>;
  const fields = ["code", "message", "details", "hint"] as const;

  return fields
    .map((field) => typeof errorRecord[field] === "string" ? errorRecord[field] : "")
    .filter(Boolean)
    .join(" ");
}

export function isMissingOptionalCheckinColumnError(error: unknown) {
  const text = readErrorText(error);

  return OPTIONAL_CHECKIN_COLUMNS.some((column) => text.includes(column))
    && (/does not exist|could not find|schema cache|42703|PGRST204/i).test(text);
}

function normalizeLegacyCheckinSummary(record: LegacyCheckinSummary): CheckinSummary {
  return {
    ...record,
    training_types: null,
    exercise_names: null,
    exercise_details: null
  };
}

function createRecentCheckinsQuery(
  supabase: AppSupabaseClient,
  userId: string,
  columns: string,
  limit: number,
  dateQuery: CheckinDateQuery
) {
  let query = supabase
    .from("checkins")
    .select(columns)
    .eq("user_id", userId);

  if (dateQuery.startDate) {
    query = query.gte("checkin_date", dateQuery.startDate);
  }

  if (dateQuery.endDate) {
    query = query.lte("checkin_date", dateQuery.endDate);
  }

  return query.order("created_at", { ascending: false }).range(0, limit - 1);
}

export async function fetchRecentCheckins(
  supabase: AppSupabaseClient,
  userId: string,
  limit = RECORD_LIST_LIMIT,
  dateQuery: CheckinDateQuery = {}
): Promise<RecentCheckinsResult> {
  const result = await createRecentCheckinsQuery(supabase, userId, RECORD_SUMMARY_COLUMNS, limit, dateQuery);

  if (!isMissingOptionalCheckinColumnError(result.error)) {
    return {
      data: (result.data || null) as CheckinSummary[] | null,
      error: result.error
    };
  }

  const legacyResult = await createRecentCheckinsQuery(supabase, userId, LEGACY_RECORD_SUMMARY_COLUMNS, limit, dateQuery);

  return {
    data: legacyResult.data ? (legacyResult.data as unknown as LegacyCheckinSummary[]).map(normalizeLegacyCheckinSummary) : null,
    error: legacyResult.error,
    compatibilityError: result.error
  };
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
