import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { PROFILE_SELECT } from "@/lib/profiles";
import type { Profile } from "@/types/database";

export const getCurrentProfile = cache(async function getCurrentProfile() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null, supabase };
  }

  const { data: profile } = await supabase.from("profiles").select(PROFILE_SELECT).eq("id", user.id).maybeSingle();

  return { user, profile: profile as Profile | null, supabase };
});

export const requireUser = cache(async function requireUser() {
  const { user, profile, supabase } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  if (!profile) {
    redirect("/login?error=profile_missing");
  }

  return { user, profile, supabase };
});

export async function requireAdmin() {
  const context = await requireUser();

  if (context.profile.role !== "admin") {
    redirect("/dashboard");
  }

  return context;
}

export function roleHomePath(profile: Pick<Profile, "role"> | null) {
  return profile?.role === "admin" ? "/admin" : "/dashboard";
}
