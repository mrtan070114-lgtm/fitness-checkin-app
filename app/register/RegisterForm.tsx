"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError(null);
    setMessage(null);
    setLoading(true);

    const formData = new FormData(form);
    const username = String(formData.get("username") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    try {
      const supabase = createClient();
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username
          },
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      form.reset();
      setMessage("注册成功。若项目开启邮箱验证，请先完成验证；否则可以直接登录。");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "注册失败，请稍后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-card auth-form" onSubmit={handleSubmit}>
      {error ? <p className="alert error">{error}</p> : null}
      {message ? (
        <p className="alert success">
          {message} <Link href="/login">前往登录</Link>
        </p>
      ) : null}
      <label>
        用户名
        <input autoComplete="nickname" maxLength={32} minLength={2} name="username" required />
      </label>
      <label>
        邮箱
        <input autoComplete="email" name="email" required type="email" />
      </label>
      <label>
        密码
        <input autoComplete="new-password" minLength={6} name="password" required type="password" />
      </label>
      <button className="primary-button" disabled={loading} type="submit">
        {loading ? "注册中..." : "注册普通用户"}
      </button>
    </form>
  );
}
