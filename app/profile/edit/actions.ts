"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { isUsableImage, uploadAvatarImage } from "@/lib/uploads";

const profileSchema = z.object({
  display_name: z.preprocess((value) => (typeof value === "string" ? value.trim() : ""), z.string().min(1, "昵称不能为空").max(20, "昵称不能超过 20 个字符"))
});

function editPathWithError(message: string) {
  return `/profile/edit?error=${encodeURIComponent(message)}`;
}

function refreshProfilePages() {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/edit");
  revalidatePath("/profile/theme");
  revalidatePath("/partner");
  revalidatePath("/bind");
}

export async function updateProfile(formData: FormData) {
  const { user, profile, supabase } = await requireUser();
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name")
  });

  if (!parsed.success) {
    redirect(editPathWithError(parsed.error.issues[0]?.message || "昵称格式不正确"));
  }

  let avatarUrl = profile.avatar_url;
  const avatar = formData.get("avatar");

  if (isUsableImage(avatar)) {
    try {
      avatarUrl = await uploadAvatarImage(supabase, avatar, user.id);
    } catch (error) {
      redirect(editPathWithError(error instanceof Error ? error.message : "头像上传失败"));
    }
  }

  let errorMessage: string | null = null;
  const { error } = await supabase.rpc("update_my_profile", {
    display_name: parsed.data.display_name,
    avatar_url: avatarUrl
  });

  if (error) {
    errorMessage = error.message;
  }

  if (errorMessage) {
    redirect(`/profile/edit?error=${encodeURIComponent(errorMessage)}`);
  }

  refreshProfilePages();
  const successMessage = "个人资料已更新";
  redirect(`/profile?profile_updated=1&message=${encodeURIComponent(successMessage)}`);
}
