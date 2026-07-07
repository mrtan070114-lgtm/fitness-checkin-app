import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export const PROFILE_SELECT = "id,username,email,role,bind_code,bound_user_id,theme_color,avatar_url,created_at,updated_at";

type AppSupabaseClient = SupabaseClient<Database>;

export function fetchProfileById(supabase: AppSupabaseClient, id: string) {
  return supabase.from("profiles").select(PROFILE_SELECT).eq("id", id).maybeSingle();
}
