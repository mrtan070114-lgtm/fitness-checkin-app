import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { unbindPartner } from "@/app/bind/actions";
import { requireUser } from "@/lib/auth";
import { calculateStreak, getMonthRange, getTodayDate } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { fetchProfileById } from "@/lib/profiles";
import { ConfirmSubmitButton } from "@/components/ConfirmSubmitButton";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SignOutButton } from "@/components/SignOutButton";
import { UserShell } from "@/components/UserShell";
import type { Profile } from "@/types/database";

const settingsItems = [
  { label: "编辑个人资料", href: "/profile/edit" },
  { label: "健身目标", href: "/goals" },
  { label: "数据统计", href: "/stats" },
  { label: "外观设置", href: "/profile/theme" },
  { label: "添加到手机桌面", href: "/pwa" },
  { label: "账号安全" },
  { label: "关于 App" }
];

type ProfilePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
  const { user, profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};
  const roleLabel = profile.role === "admin" ? "管理员" : "普通用户";
  const roleBadgeClass = profile.role === "admin" ? "role-badge admin" : "role-badge";

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();
  const monthRange = getMonthRange(today);

  const [{ data: records, error: recordsError }, { data: partner, error: partnerError }] = await Promise.all([
    supabase.from("checkins").select("checkin_date,duration_minutes").eq("user_id", user.id),
    profile.bound_user_id ? fetchProfileById(supabase, profile.bound_user_id) : Promise.resolve({ data: null, error: null })
  ]);

  const allRecords = records || [];
  const partnerProfile = partner as Profile | null;
  const errorMessage = getFriendlySupabaseError(recordsError || partnerError);
  const totalCount = allRecords.length;
  const totalMinutes = allRecords.reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const monthCount = allRecords.filter((record) => record.checkin_date >= monthRange.start && record.checkin_date <= monthRange.end).length;
  const streak = calculateStreak(
    allRecords.map((record) => record.checkin_date),
    today
  );

  return (
    <UserShell profile={profile} title="我的" subtitle="个人中心">
      {params.unbound ? <p className="alert success">已解除绑定。</p> : null}
      {params.profile_updated ? <p className="alert success">个人资料已更新。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}
      {errorMessage ? <p className="alert error">{errorMessage}</p> : null}

      <section className="profile-card">
        <ProfileAvatar profile={profile} size="xl" />
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
          <div className="inline-profile-heading">
            {partnerProfile ? <ProfileAvatar profile={partnerProfile} size="sm" /> : null}
            <div>
              <p className="eyebrow">绑定关系</p>
              <h2>{partnerProfile?.username || "还没有绑定监督对象"}</h2>
            </div>
          </div>
          <div className="button-row">
            <Link className="secondary-button compact" href="/bind">
              管理绑定
            </Link>
            {partnerProfile ? (
              <form action={unbindPartner}>
                <input name="next_path" type="hidden" value="/profile" />
                <ConfirmSubmitButton className="danger-button compact" pendingText="解除中...">
                  解除绑定
                </ConfirmSubmitButton>
              </form>
            ) : null}
          </div>
        </div>
        <p className="muted">{partnerProfile?.email || "绑定后可以互相查看运动记录。"}</p>
      </section>

      <section className="settings-list" aria-label="设置列表">
        {settingsItems.map((item) => (
          item.href ? (
            <Link className="settings-item" href={item.href} key={item.label}>
              <span>{item.label}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>
          ) : (
            <button className="settings-item" type="button" key={item.label}>
              <span>{item.label}</span>
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          )
        ))}
      </section>

      <section className="logout-panel">
        <SignOutButton className="danger-button full-width" label="退出登录" />
      </section>
    </UserShell>
  );
}
