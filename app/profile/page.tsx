import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarDays,
  ChevronRight,
  Flame,
  Info,
  Palette,
  ShieldCheck,
  Smartphone,
  Target,
  UserPen
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { calculateStreak, getMonthRange, getTodayDate } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { fetchProfileById } from "@/lib/profiles";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { SignOutButton } from "@/components/SignOutButton";
import { UserShell } from "@/components/UserShell";
import type { Profile } from "@/types/database";

const settingsItems: { label: string; href?: string; icon: LucideIcon }[] = [
  { label: "编辑个人资料", href: "/profile/edit", icon: UserPen },
  { label: "健身目标", href: "/goals", icon: Target },
  { label: "数据统计", href: "/stats", icon: BarChart3 },
  { label: "外观设置", href: "/profile/theme", icon: Palette },
  { label: "添加到手机桌面", href: "/pwa", icon: Smartphone },
  { label: "账号安全", href: "/profile/security", icon: ShieldCheck },
  { label: "关于 App", href: "/profile/about", icon: Info }
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
    redirect("/admin");
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
      {params.profile_updated ? <p className="alert success">个人资料已更新。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}
      {errorMessage ? <p className="alert error">{errorMessage}</p> : null}

      <section className="profile-hero-card">
        <div className="profile-hero-top">
          <ProfileAvatar profile={profile} size="xl" />
          <div className="profile-main">
            <p className="eyebrow">个人中心</p>
            <h2>{profile.username}</h2>
            <p>{profile.email}</p>
            <div className="profile-badges">
              <span className={roleBadgeClass}>{roleLabel}</span>
              <span className="code-chip">绑定码 {profile.bind_code}</span>
            </div>
          </div>
        </div>
        <Link className="profile-edit-shortcut" href="/profile/edit">
          <UserPen size={16} aria-hidden="true" />
          编辑资料
        </Link>
      </section>

      <section className="profile-section-card">
        <div className="profile-section-heading">
          <div>
            <p className="eyebrow">我的数据</p>
            <h2>运动概览</h2>
          </div>
          <Activity size={22} aria-hidden="true" />
        </div>
        <div className="profile-metric-grid">
          <article>
            <Activity size={18} aria-hidden="true" />
            <span>累计运动次数</span>
            <strong>{totalCount} 次</strong>
          </article>
          <article>
            <BarChart3 size={18} aria-hidden="true" />
            <span>累计运动分钟</span>
            <strong>{totalMinutes} 分钟</strong>
          </article>
          <article>
            <Flame size={18} aria-hidden="true" />
            <span>连续运动天数</span>
            <strong>{streak} 天</strong>
          </article>
          <article>
            <CalendarDays size={18} aria-hidden="true" />
            <span>本月运动次数</span>
            <strong>{monthCount} 次</strong>
          </article>
        </div>
      </section>

      <section className="profile-section-card">
        <div className="profile-section-heading">
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
          </div>
        </div>
        <p className="muted">{partnerProfile?.email || "绑定后可以互相查看运动记录。"}</p>
      </section>

      <section className="profile-section-card settings-section" aria-label="设置列表">
        <div className="profile-section-heading">
          <div>
            <p className="eyebrow">功能设置</p>
            <h2>管理你的 App</h2>
          </div>
          <ChevronRight size={22} aria-hidden="true" />
        </div>
        <div className="settings-menu">
          {settingsItems.map((item) => {
            const Icon = item.icon;

            return item.href ? (
              <Link className="settings-item" href={item.href} key={item.label}>
                <span className="settings-item-label"><Icon size={18} aria-hidden="true" /> {item.label}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </Link>
            ) : (
              <button className="settings-item" type="button" key={item.label}>
                <span className="settings-item-label"><Icon size={18} aria-hidden="true" /> {item.label}</span>
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </section>

      <section className="logout-panel">
        <SignOutButton className="danger-button full-width" label="退出登录" />
      </section>
    </UserShell>
  );
}
