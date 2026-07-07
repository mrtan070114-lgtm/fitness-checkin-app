"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export async function bindPartner(formData: FormData) {
  const { supabase } = await requireUser();
  const bindCode = String(formData.get("bind_code") || "").trim().toUpperCase();

  if (!bindCode) {
    redirect("/bind?error=请输入对方绑定码");
  }

  const { error } = await supabase.rpc("bind_partner", {
    target_bind_code: bindCode
  });

  if (error) {
    redirect(`/bind?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/bind");
  revalidatePath("/partner");
  redirect("/bind?success=1");
}
