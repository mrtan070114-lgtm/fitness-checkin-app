import { redirect } from "next/navigation";
import { BadgeCheck, CalendarDays, Code2, HeartPulse, Info, Smartphone, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { UserShell } from "@/components/UserShell";

const appInfoItems = [
  { label: "开发日期", value: "2026/07/07", icon: CalendarDays },
  { label: "开发人", value: "mr.tan", icon: UserRound },
  { label: "应用类型", value: "双人监督健身记录", icon: HeartPulse },
  { label: "运行方式", value: "Web App / PWA", icon: Smartphone }
];

export default async function AboutPage() {
  const { profile } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin");
  }

  return (
    <UserShell profile={profile} title="关于 App" subtitle="应用信息" showBackButton>
      <section className="about-hero-card">
        <img src="/icons/icon-192.png" alt="TnT健身日记 App 图标" />
        <div>
          <p className="eyebrow">TnT健身日记</p>
          <h2>一起记录，也互相监督</h2>
          <p>为双人健身监督场景设计的运动记录工具，支持多次运动记录、图片上传、目标统计、留言互动和主题切换。</p>
        </div>
      </section>

      <section className="about-info-grid" aria-label="App 信息">
        {appInfoItems.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.label}>
              <Icon size={18} aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          );
        })}
      </section>

      <section className="about-story-card">
        <div className="profile-section-heading">
          <div>
            <p className="eyebrow">设计目标</p>
            <h2>让打卡更轻、更容易坚持</h2>
          </div>
          <Info size={22} aria-hidden="true" />
        </div>
        <div className="about-feature-list">
          <p><BadgeCheck size={16} aria-hidden="true" /> 每天可以添加多次运动记录，适合分段训练。</p>
          <p><BadgeCheck size={16} aria-hidden="true" /> 绑定对象后，可以查看对方记录并留言互动。</p>
          <p><BadgeCheck size={16} aria-hidden="true" /> 支持手机端添加到桌面，使用体验更接近 App。</p>
        </div>
      </section>

      <section className="about-version-card">
        <Code2 size={20} aria-hidden="true" />
        <div>
          <p className="eyebrow">当前版本</p>
          <h2>v1.0.0</h2>
          <p>持续围绕健身记录、监督互动和移动端体验优化。</p>
        </div>
      </section>
    </UserShell>
  );
}
