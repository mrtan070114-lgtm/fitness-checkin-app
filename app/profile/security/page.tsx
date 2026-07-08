import { redirect } from "next/navigation";
import { AlertTriangle, CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from "lucide-react";
import { updatePassword } from "@/app/profile/security/actions";
import { requireUser } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { UserShell } from "@/components/UserShell";

type SecurityPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SecurityPage({ searchParams }: SecurityPageProps) {
  const { profile } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <UserShell profile={profile} title="账号安全" subtitle="修改登录密码" showBackButton>
      {params.updated ? <p className="alert success">密码已修改，下次登录请使用新密码。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <section className="security-hero-card">
        <div className="security-hero-icon">
          <ShieldCheck size={24} aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">安全设置</p>
          <h2>保护你的账号</h2>
          <p>修改密码前需要验证当前密码，避免他人拿到手机后直接更改账号。</p>
        </div>
      </section>

      <form action={updatePassword} className="checkin-form-stack">
        <section className="form-card form-section">
          <div className="section-heading section-heading-with-icon">
            <span className="form-section-icon"><KeyRound size={18} aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">当前密码</p>
              <h2>确认是你本人</h2>
            </div>
          </div>

          <label>
            当前密码
            <input autoComplete="current-password" minLength={6} name="current_password" required type="password" />
          </label>
        </section>

        <section className="form-card form-section">
          <div className="section-heading section-heading-with-icon">
            <span className="form-section-icon"><LockKeyhole size={18} aria-hidden="true" /></span>
            <div>
              <p className="eyebrow">新密码</p>
              <h2>设置新的登录密码</h2>
            </div>
          </div>

          <label>
            新密码
            <input autoComplete="new-password" maxLength={72} minLength={6} name="new_password" required type="password" />
          </label>

          <label>
            确认新密码
            <input autoComplete="new-password" maxLength={72} minLength={6} name="confirm_password" required type="password" />
          </label>
        </section>

        <section className="security-tips-card">
          <p><CheckCircle2 size={16} aria-hidden="true" /> 建议使用至少 6 位，并混合数字、字母或符号。</p>
          <p><AlertTriangle size={16} aria-hidden="true" /> 修改成功后，其他设备可能需要重新登录。</p>
        </section>

        <section className="submit-panel">
          <SubmitButton pendingText="正在修改...">修改密码</SubmitButton>
          <p className="form-note">这里只会修改登录密码，不会影响头像、昵称、绑定关系或打卡记录。</p>
        </section>
      </form>
    </UserShell>
  );
}
