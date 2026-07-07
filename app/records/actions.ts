"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

function readReturnPath(formData: FormData) {
  const value = String(formData.get("return_path") || "/records");
  if (value.startsWith("/records/") || value.startsWith("/admin/checkins/") || value === "/records" || value === "/partner") return value;
  return "/records";
}

function revalidateRecordViews(checkinId: string, returnPath: string) {
  revalidatePath("/records");
  revalidatePath("/partner");
  revalidatePath(`/records/${checkinId}`);
  revalidatePath(returnPath);
}

export async function toggleCheckinLike(formData: FormData) {
  const { supabase } = await requireUser();
  const checkinId = String(formData.get("checkin_id") || "");
  const returnPath = readReturnPath(formData);

  if (!checkinId) {
    redirect(`${returnPath}?error=${encodeURIComponent("缺少记录ID")}`);
  }

  const { error } = await supabase.rpc("toggle_checkin_like", {
    target_checkin_id: checkinId
  });

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateRecordViews(checkinId, returnPath);
  redirect(returnPath);
}

const commentSchema = z.object({
  checkin_id: z.string().uuid("缺少记录ID"),
  content: z.preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string().min(1, "留言不能为空").max(200, "留言不能超过 200 字"))
});

export async function addCheckinComment(formData: FormData) {
  const { user, supabase } = await requireUser();
  const returnPath = readReturnPath(formData);
  const parsed = commentSchema.safeParse({
    checkin_id: formData.get("checkin_id"),
    content: formData.get("content")
  });

  if (!parsed.success) {
    redirect(`${returnPath}?error=${encodeURIComponent(parsed.error.issues[0]?.message || "留言格式不正确")}`);
  }

  const { error } = await supabase.from("checkin_comments").insert({
    checkin_id: parsed.data.checkin_id,
    user_id: user.id,
    content: parsed.data.content
  });

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateRecordViews(parsed.data.checkin_id, returnPath);
  redirect(returnPath);
}

export async function deleteCheckinComment(formData: FormData) {
  const { supabase } = await requireUser();
  const checkinId = String(formData.get("checkin_id") || "");
  const commentId = String(formData.get("comment_id") || "");
  const returnPath = readReturnPath(formData);

  if (!commentId || !checkinId) {
    redirect(`${returnPath}?error=${encodeURIComponent("缺少留言ID")}`);
  }

  const { error } = await supabase.from("checkin_comments").delete().eq("id", commentId);

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  revalidateRecordViews(checkinId, returnPath);
  redirect(returnPath);
}
