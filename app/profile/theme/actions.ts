"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isThemeColor } from "@/lib/themes";

function refreshThemePages() {
  revalidatePath("/dashboard");
  revalidatePath("/checkin");
  revalidatePath("/records");
  revalidatePath("/partner");
  revalidatePath("/profile");
  revalidatePath("/profile/theme");
  revalidatePath("/bind");
}

export async function updateThemeColor(formData: FormData) {
  const themeColor = String(formData.get("theme_color") || "");

  if (!isThemeColor(themeColor)) {
    redirect("/profile/theme?error=不支持的主题颜色");
  }

  const { supabase } = await requireUser();
  let errorMessage: string | null = null;

  try {
    const { error } = await supabase.rpc("update_my_theme_color", {
      theme_color: themeColor
    });

    if (error) {
      errorMessage = error.message;
    } else {
      refreshThemePages();
    }
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "主题更新失败";
  }

  if (errorMessage) {
    redirect(`/profile/theme?error=${encodeURIComponent(errorMessage)}`);
  }

  redirect("/profile/theme?success=1");
}
