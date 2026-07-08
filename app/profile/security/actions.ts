"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "请输入当前密码"),
    new_password: z.string().min(6, "新密码至少需要 6 个字符").max(72, "新密码不能超过 72 个字符"),
    confirm_password: z.string().min(1, "请再次输入新密码")
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "两次输入的新密码不一致",
    path: ["confirm_password"]
  })
  .refine((data) => data.current_password !== data.new_password, {
    message: "新密码不能和当前密码相同",
    path: ["new_password"]
  });

function securityPathWithError(message: string) {
  return `/profile/security?error=${encodeURIComponent(message)}`;
}

export async function updatePassword(formData: FormData) {
  const { profile, supabase } = await requireUser();
  const parsed = passwordSchema.safeParse({
    current_password: String(formData.get("current_password") || ""),
    new_password: String(formData.get("new_password") || ""),
    confirm_password: String(formData.get("confirm_password") || "")
  });

  if (!parsed.success) {
    redirect(securityPathWithError(parsed.error.issues[0]?.message || "密码格式不正确"));
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password: parsed.data.current_password
  });

  if (verifyError) {
    redirect(securityPathWithError("当前密码不正确"));
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.new_password
  });

  if (updateError) {
    redirect(securityPathWithError(updateError.message || "密码修改失败"));
  }

  revalidatePath("/profile");
  revalidatePath("/profile/security");
  redirect("/profile/security?updated=1");
}
