import Link from "next/link";
import { LoginForm } from "@/app/login/LoginForm";

type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = typeof params.error === "string" ? params.error : null;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">Fitness Partner</p>
        <h1>登录</h1>
        <p className="muted">登录后会根据账号角色进入用户首页或管理后台。</p>
        {error ? <p className="alert error">登录状态异常：{error}</p> : null}
        <LoginForm />
        <p className="auth-switch">
          还没有账号？<Link href="/register">注册普通用户</Link>
        </p>
      </section>
    </main>
  );
}
