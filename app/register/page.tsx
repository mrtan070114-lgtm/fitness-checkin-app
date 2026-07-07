import Link from "next/link";
import { RegisterForm } from "@/app/register/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel">
        <p className="eyebrow">普通用户注册</p>
        <h1>创建账号</h1>
        <p className="muted">普通用户注册后默认为 user；管理员账号请在数据库中创建或升级。</p>
        <RegisterForm />
        <p className="auth-switch">
          已有账号？<Link href="/login">去登录</Link>
        </p>
      </section>
    </main>
  );
}
