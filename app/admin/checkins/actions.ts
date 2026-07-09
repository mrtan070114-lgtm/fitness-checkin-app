"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MOODS } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { parseExerciseDetailsForm } from "@/lib/exerciseDetails";
import { isUsableImage, uploadCheckinImage } from "@/lib/uploads";
import type { CheckinUpdate } from "@/types/database";

const nullableText = z.preprocess((value) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}, z.string().nullable());

const nullableInteger = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}, z.number().int().min(0).max(1440).nullable());

const nullableWeight = z.preprocess((value) => {
  if (value === null || value === undefined || value === "") return null;
  return Number(value);
}, z.number().min(0).max(500).nullable());

const updateSchema = z.object({
  id: z.string().min(1),
  session_title: nullableText,
  duration_minutes: nullableInteger,
  weight: nullableWeight,
  diet: nullableText,
  mood: z.enum(MOODS).nullable(),
  note: nullableText
});

export async function deleteCheckin(formData: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(formData.get("id") || "");

  if (!id) {
    redirect("/admin/checkins?error=缺少记录ID");
  }

  const { error } = await supabase.from("checkins").delete().eq("id", id);

  if (error) {
    redirect(`/admin/checkins?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/checkins");
  revalidatePath("/admin");
  redirect("/admin/checkins?deleted=1");
}

export async function updateCheckin(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    session_title: formData.get("session_title"),
    duration_minutes: formData.get("duration_minutes"),
    weight: formData.get("weight"),
    diet: formData.get("diet"),
    mood: formData.get("mood") || null,
    note: formData.get("note")
  });

  if (!parsed.success) {
    redirect("/admin/checkins?error=表单内容不完整或格式不正确");
  }

  const exerciseDetails = parseExerciseDetailsForm(formData);

  if (exerciseDetails.error) {
    redirect(`/admin/checkins/${parsed.data.id}/edit?error=${encodeURIComponent(exerciseDetails.error)}`);
  }

  const { data: current, error: currentError } = await supabase
    .from("checkins")
    .select("id,user_id,image_url,training_type,training_types")
    .eq("id", parsed.data.id)
    .single();

  if (currentError || !current) {
    redirect("/admin/checkins?error=记录不存在");
  }

  let imageUrl: string | null | undefined;
  const image = formData.get("image");

  if (isUsableImage(image)) {
    try {
      imageUrl = await uploadCheckinImage(supabase, image, current.user_id);
    } catch (error) {
      redirect(`/admin/checkins/${parsed.data.id}/edit?error=${encodeURIComponent(error instanceof Error ? error.message : "图片上传失败")}`);
    }
  }

  const updateValues: CheckinUpdate = {
    session_title: parsed.data.session_title,
    training_type: exerciseDetails.trainingTypes[0] || current.training_type,
    training_types: exerciseDetails.trainingTypes,
    exercise_names: exerciseDetails.exerciseNames,
    exercise_details: exerciseDetails.exerciseDetails,
    duration_minutes: parsed.data.duration_minutes,
    weight: parsed.data.weight,
    diet: parsed.data.diet,
    mood: parsed.data.mood,
    note: parsed.data.note,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    updated_at: new Date().toISOString()
  };

  if (!exerciseDetails.exerciseNames?.length) {
    updateValues.training_types = current.training_types;
  }

  const { error } = await supabase
    .from("checkins")
    .update(updateValues)
    .eq("id", parsed.data.id);

  if (error) {
    redirect(`/admin/checkins/${parsed.data.id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/checkins");
  revalidatePath("/admin");
  revalidatePath(`/admin/checkins/${parsed.data.id}/edit`);
  redirect("/admin/checkins?updated=1");
}
