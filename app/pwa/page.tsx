import { redirect } from "next/navigation";
import { Smartphone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { UserShell } from "@/components/UserShell";

export default async function PwaPage() {
  const { profile } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <UserShell profile={profile} title="添加到手机桌面" subtitle="像 App 一样打开 TnT健身日记" showBackButton>
      <section className="info-card rich-card">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">PWA</p>
            <h2>添加到手机桌面</h2>
          </div>
          <Smartphone size={24} aria-hidden="true" />
        </div>
        <p className="muted">添加后可以从桌面直接打开，界面会更接近原生 App。</p>
      </section>

      <section className="info-card rich-card">
        <p className="eyebrow">iPhone</p>
        <h2>Safari 添加方式</h2>
        <p className="muted">点击 Safari 底部分享按钮，然后选择“添加到主屏幕”。</p>
      </section>

      <section className="info-card rich-card">
        <p className="eyebrow">Android</p>
        <h2>Chrome 添加方式</h2>
        <p className="muted">点击浏览器右上角菜单，然后选择“添加到主屏幕”或“安装应用”。</p>
      </section>
    </UserShell>
  );
}
