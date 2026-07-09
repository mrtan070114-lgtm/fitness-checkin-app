"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { MOODS } from "@/lib/constants";
import { getTodayDate } from "@/lib/dates";
import { hasAnyExerciseCount, parseExerciseDetailsForm } from "@/lib/exerciseDetails";
import { requireUser } from "@/lib/auth";
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

const checkinSchema = z.object({
  session_title: nullableText,
  duration_minutes: nullableInteger,
  weight: nullableWeight,
  diet: nullableText,
  mood: z.enum(MOODS).nullable(),
  note: nullableText
});

function fail(message: string): never {
  redirect(`/checkin?error=${encodeURIComponent(message)}`);
}

export async function createCheckin(formData: FormData) {
  const { user, supabase } = await requireUser();
  const today = getTodayDate();

  const parsed = checkinSchema.safeParse({
    session_title: formData.get("session_title"),
    duration_minutes: formData.get("duration_minutes"),
    weight: formData.get("weight"),
    diet: formData.get("diet"),
    mood: formData.get("mood") || null,
    note: formData.get("note")
  });

  if (!parsed.success) {
    fail("表单内容不完整或格式不正确");
  }

  if (parsed.data.duration_minutes === null) {
    fail("请填写训练时长");
  }

  const exerciseDetails = parseExerciseDetailsForm(formData);

  if (exerciseDetails.error) {
    fail(exerciseDetails.error);
  }

  if (!exerciseDetails.exerciseNames?.length) {
    fail("请选择训练动作");
  }

  if (!exerciseDetails.trainingTypes.length) {
    fail("请选择自定义动作归属部位");
  }

  if (!hasAnyExerciseCount(exerciseDetails.exerciseDetails)) {
    fail("请至少填写一项动作计数");
  }

  let imageUrl: string | null = null;
  const image = formData.get("image");

  if (isUsableImage(image)) {
    try {
      imageUrl = await uploadCheckinImage(supabase, image, user.id);
    } catch (error) {
      fail(error instanceof Error ? error.message : "图片上传失败");
    }
  }

  const { error } = await supabase.from("checkins").insert({
    user_id: user.id,
    checkin_date: today,
    session_title: parsed.data.session_title,
    training_type: exerciseDetails.trainingTypes[0],
    training_types: exerciseDetails.trainingTypes,
    exercise_names: exerciseDetails.exerciseNames,
    exercise_details: exerciseDetails.exerciseDetails,
    duration_minutes: parsed.data.duration_minutes,
    weight: parsed.data.weight,
    diet: parsed.data.diet,
    mood: parsed.data.mood,
    note: parsed.data.note,
    image_url: imageUrl,
    locked: true
  });

  if (error) {
    fail(error.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/records");
  revalidatePath("/checkin");
  redirect("/checkin?created=1");
}
