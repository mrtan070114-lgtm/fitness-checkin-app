import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { calculateStreak, getMonthRange, getTodayDate } from "@/lib/dates";
import { SignOutButton } from "@/components/SignOutButton";
import { UserShell } from "@/components/UserShell";
import type { Profile } from "@/types/database";

const settingsItems = ["个人资料", "修改头像", "修改昵称", "账号安全", "关于 App"];

export default async function ProfilePage() {
  const { user, profile, supabase } = await requireUser();
  const roleLabel = profile.role === "admin" ? "管理员" : "普通用户";
  const roleBadgeClass = profile.role === "admin" ? "role-badge admin" : "role-badge";

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();
  const monthRange = getMonthRange(today);

  const [{ data: records }, { data: partner }] = await Promise.all([
    supabase.from("checkins").select("checkin_date,duration_minutes").eq("user_id", user.id),
    profile.bound_user_id ? supabase.from("profiles").select("*").eq("id", profile.bound_user_id).maybeSingle() : Promise.resolve({ data: null })
  ]);

  const allRecords = records || [];
  const partnerProfile = partner as Profile | null;
  const totalCount = allRecords.length;
  const totalMinutes = allRecords.reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const monthCount = allRecords.filter((record) => record.checkin_date >= monthRange.start && record.checkin_date <= monthRange.end).length;
  const streak = calculateStreak(
    allRecords.map((record) => record.checkin_date),
    today
  );

  return (
    <UserShell profile={profile} title="我的" subtitle="个人中心">
      <section className="profile-card">
        <div className="avatar-placeholder xl" aria-hidden="true">
          {profile.username.slice(0, 1).toUpperCase() || "F"}
        </div>
        <div className="profile-main">
          <h2>{profile.username}</h2>
          <p>{profile.email}</p>
          <div className="profile-badges">
            <span className={roleBadgeClass}>{roleLabel}</span>
            <span className="code-chip">绑定码 {profile.bind_code}</span>
          </div>
        </div>
      </section>

      <section className="info-card rich-card">
        <p className="eyebrow">我的数据</p>
        <div className="metric-grid">
          <article className="mini-stat">
            <span>累计运动次数</span>
            <strong>{totalCount} 次</strong>
          </article>
          <article className="mini-stat">
            <span>累计运动分钟</span>
            <strong>{totalMinutes} 分钟</strong>
          </article>
          <article className="mini-stat">
            <span>连续运动天数</span>
            <strong>{streak} 天</strong>
          </article>
          <article className="mini-stat">
            <span>本月运动次数</span>
            <strong>{monthCount} 次</strong>
          </article>
        </div>
      </section>

      <section className="info-card rich-card">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">绑定关系</p>
            <h2>{partnerProfile?.username || "还没有绑定监督对象"}</h2>
          </div>
          <Link className="secondary-button compact" href="/bind">
            管理绑定
          </Link>
        </div>
        <p className="muted">{partnerProfile?.email || "绑定后可以互相查看运动记录。"}</p>
      </section>

      <section className="settings-list" aria-label="设置列表">
        {settingsItems.map((item) => (
          <button className="settings-item" type="button" key={item}>
            <span>{item}</span>
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        ))}
      </section>

      <section className="logout-panel">
        <SignOutButton className="danger-button full-width" label="退出登录" />
      </section>
    </UserShell>
  );
}
