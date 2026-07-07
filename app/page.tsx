import { redirect } from "next/navigation";
import { getCurrentProfile, roleHomePath } from "@/lib/auth";

export default async function HomePage() {
  const { user, profile } = await getCurrentProfile();

  if (!user) {
    redirect("/login");
  }

  redirect(roleHomePath(profile));
}
