"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

function getReturnPath(formData: FormData) {
  const path = String(formData.get("next_path") || "/bind");
  return path === "/profile" ? "/profile" : "/bind";
}

function refreshBindingPages() {
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/bind");
  revalidatePath("/partner");
}

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

  refreshBindingPages();
  redirect("/bind?success=1");
}

export async function unbindPartner(formData: FormData) {
  const { supabase } = await requireUser();
  const returnPath = getReturnPath(formData);

  const { error } = await supabase.rpc("unbind_partner");

  if (error) {
    redirect(`${returnPath}?error=${encodeURIComponent(error.message)}`);
  }

  refreshBindingPages();
  redirect(`${returnPath}?unbound=1`);
}
