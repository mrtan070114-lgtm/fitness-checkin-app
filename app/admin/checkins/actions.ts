"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MOODS, TRAINING_TYPES } from "@/lib/constants";
import { requireAdmin } from "@/lib/auth";
import { isUsableImage, uploadCheckinImage } from "@/lib/uploads";

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
  training_type: z.enum(TRAINING_TYPES),
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
  revalidatePath("/admin/dashboard");
  redirect("/admin/checkins?deleted=1");
}

export async function updateCheckin(formData: FormData) {
  const { supabase } = await requireAdmin();
  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    session_title: formData.get("session_title"),
    training_type: formData.get("training_type"),
    duration_minutes: formData.get("duration_minutes"),
    weight: formData.get("weight"),
    diet: formData.get("diet"),
    mood: formData.get("mood") || null,
    note: formData.get("note")
  });

  if (!parsed.success) {
    redirect("/admin/checkins?error=表单内容不完整或格式不正确");
  }

  const { data: current, error: currentError } = await supabase
    .from("checkins")
    .select("id,user_id,image_url")
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

  const { error } = await supabase
    .from("checkins")
    .update({
      session_title: parsed.data.session_title,
      training_type: parsed.data.training_type,
      duration_minutes: parsed.data.duration_minutes,
      weight: parsed.data.weight,
      diet: parsed.data.diet,
      mood: parsed.data.mood,
      note: parsed.data.note,
      ...(imageUrl ? { image_url: imageUrl } : {}),
      updated_at: new Date().toISOString()
    })
    .eq("id", parsed.data.id);

  if (error) {
    redirect(`/admin/checkins/${parsed.data.id}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/checkins");
  revalidatePath(`/admin/checkins/${parsed.data.id}/edit`);
  redirect("/admin/checkins?updated=1");
}
