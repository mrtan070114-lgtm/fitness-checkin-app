import { redirect } from "next/navigation";
import { bindPartner } from "@/app/bind/actions";
import { requireUser } from "@/lib/auth";
import { SubmitButton } from "@/components/SubmitButton";
import { UserShell } from "@/components/UserShell";
import type { Profile } from "@/types/database";

type BindPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BindPage({ searchParams }: BindPageProps) {
  const { profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  let partner: Profile | null = null;
  if (profile.bound_user_id) {
    const { data } = await supabase.from("profiles").select("*").eq("id", profile.bound_user_id).maybeSingle();
    partner = data as Profile | null;
  }

  return (
    <UserShell profile={profile} title="绑定对象" subtitle="管理你的监督关系">
      {params.success ? <p className="alert success">绑定成功，双方现在可以互相查看记录。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <section className="code-card">
        <p className="eyebrow">我的绑定码</p>
        <strong>{profile.bind_code}</strong>
        <p>把这个绑定码发给对方，对方输入后即可绑定。</p>
      </section>

      {partner ? (
        <section className="info-card rich-card">
          <p className="eyebrow">当前绑定对象</p>
          <h2>{partner.username}</h2>
          <p>{partner.email}</p>
          <p className="form-note">当前版本暂未开放解除绑定，需要调整绑定关系时请联系管理员处理。</p>
        </section>
      ) : (
        <form action={bindPartner} className="form-card">
          <label>
            输入对方绑定码
            <input autoCapitalize="characters" name="bind_code" placeholder="例如 A1B2C3D4" required />
          </label>
          <SubmitButton pendingText="绑定中...">绑定对象</SubmitButton>
          <p className="form-note">第一版每个用户只允许绑定一个对象，不能绑定自己。</p>
        </form>
      )}
    </UserShell>
  );
}
