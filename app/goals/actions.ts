"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const nullableNumber = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}, z.number().min(0).max(500).nullable());

const nullableInteger = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}, z.number().int().min(0).max(1440).nullable());

const nullableDate = z.preprocess((value) => {
  if (typeof value !== "string" || !value) return null;
  return value;
}, z.string().nullable());

const nullableText = z.preprocess((value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}, z.string().max(500).nullable());

const goalSchema = z.object({
  current_weight: nullableNumber,
  target_weight: nullableNumber,
  weekly_workout_target: nullableInteger,
  daily_minutes_target: nullableInteger,
  target_date: nullableDate,
  goal_note: nullableText
});

export async function saveGoal(formData: FormData) {
  const { user, supabase } = await requireUser();
  const parsed = goalSchema.safeParse({
    current_weight: formData.get("current_weight"),
    target_weight: formData.get("target_weight"),
    weekly_workout_target: formData.get("weekly_workout_target"),
    daily_minutes_target: formData.get("daily_minutes_target"),
    target_date: formData.get("target_date"),
    goal_note: formData.get("goal_note")
  });

  if (!parsed.success) {
    redirect(`/goals?error=${encodeURIComponent("目标内容格式不正确")}`);
  }

  const { error } = await supabase.from("goals").upsert(
    {
      user_id: user.id,
      ...parsed.data
    },
    { onConflict: "user_id" }
  );

  if (error) {
    redirect(`/goals?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/goals");
  revalidatePath("/dashboard");
  redirect("/goals?saved=1");
}
