"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");
    const supabase = createClient();

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      setError("登录成功，但无法读取当前用户。");
      return;
    }

    const { data: profile, error: profileError } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profileError || !profile) {
      setLoading(false);
      setError("登录成功，但没有找到用户资料。请确认数据库触发器已执行。");
      return;
    }

    router.replace(profile.role === "admin" ? "/admin" : "/dashboard");
    router.refresh();
  }

  return (
    <form className="form-card auth-form" onSubmit={handleSubmit}>
      {error ? <p className="alert error">{error}</p> : null}
      <label>
        邮箱
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        密码
        <input autoComplete="current-password" minLength={6} name="password" required type="password" />
      </label>
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "登录中..." : "登录"}
      </button>
    </form>
  );
}
