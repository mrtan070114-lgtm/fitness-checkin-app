import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { calculateStreak, formatDisplayDate, getMonthRange, getTodayDate } from "@/lib/dates";
import { UserShell } from "@/components/UserShell";
import type { Checkin, Profile } from "@/types/database";

export default async function DashboardPage() {
  const { user, profile, supabase } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();
  const monthRange = getMonthRange(today);

  const [{ data: todayRecords }, { count: monthCount }, { data: dateRows }, { data: latestRecord }] = await Promise.all([
    supabase
      .from("checkins")
      .select("id,duration_minutes,training_type,created_at")
      .eq("user_id", user.id)
      .eq("checkin_date", today)
      .order("created_at", { ascending: false }),
    supabase
      .from("checkins")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("checkin_date", monthRange.start)
      .lte("checkin_date", monthRange.end),
    supabase.from("checkins").select("checkin_date").eq("user_id", user.id).order("checkin_date", { ascending: false }),
    supabase
      .from("checkins")
      .select("session_title,training_type,duration_minutes,weight,created_at,checkin_date")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
  ]);

  let partner: Profile | null = null;
  let partnerTodayCount = 0;
  if (profile.bound_user_id) {
    const [{ data }, { count }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", profile.bound_user_id).maybeSingle(),
      supabase
        .from("checkins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.bound_user_id)
        .eq("checkin_date", today)
    ]);
    partner = data as Profile | null;
    partnerTodayCount = count || 0;
  }

  const streak = calculateStreak((dateRows || []).map((row) => row.checkin_date), today);
  const todayCount = todayRecords?.length || 0;
  const todayDuration = (todayRecords || []).reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const todaySummary = todayCount
    ? `今日已记录 ${todayCount} 次运动，累计 ${todayDuration} 分钟`
    : "今日还没有运动记录";

  return (
    <UserShell profile={profile} title="首页" subtitle="今日状态">
      <section className="welcome-card">
        <div>
          <h2>你好，{profile.username}</h2>
          <p>今天也要动一动</p>
        </div>
        <div className="avatar-placeholder large" aria-hidden="true">
          {profile.username.slice(0, 1).toUpperCase() || "F"}
        </div>
      </section>

      <section className="overview-card">
        <div className="overview-copy">
          <p className="eyebrow">今日运动概览</p>
          <h2>{formatDisplayDate(today)}</h2>
          <p>{todaySummary}</p>
        </div>
        <div className="overview-numbers">
          <div>
            <span>运动次数</span>
            <strong>{todayCount}</strong>
          </div>
          <div>
            <span>累计时长</span>
            <strong>{todayDuration} 分钟</strong>
          </div>
        </div>
        <Link className="primary-button" href="/checkin">
          添加运动记录
        </Link>
      </section>

      <section className="metric-grid">
        <article className="mini-stat">
          <span>今日运动次数</span>
          <strong>{todayCount} 次</strong>
        </article>
        <article className="mini-stat">
          <span>今日累计运动时长</span>
          <strong>{todayDuration} 分钟</strong>
        </article>
        <article className="mini-stat">
          <span>连续运动天数</span>
          <strong>{streak} 天</strong>
        </article>
        <article className="mini-stat">
          <span>本月运动记录次数</span>
          <strong>{monthCount || 0} 次</strong>
        </article>
      </section>

      <section className="info-card rich-card">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">最近一次运动</p>
            <h2>{latestRecord ? latestRecord.session_title || "未命名运动" : "暂无运动记录"}</h2>
          </div>
          <Dumbbell size={22} aria-hidden="true" />
        </div>
        {latestRecord ? (
          <dl className="compact-detail-grid">
            <div>
              <dt>训练类型</dt>
              <dd>{latestRecord.training_type}</dd>
            </div>
            <div>
              <dt>训练时长</dt>
              <dd>{latestRecord.duration_minutes ?? "未填写"}{latestRecord.duration_minutes === null ? "" : " 分钟"}</dd>
            </div>
            <div>
              <dt>体重</dt>
              <dd>{latestRecord.weight ?? "未填写"}{latestRecord.weight === null ? "" : " kg"}</dd>
            </div>
            <div>
              <dt>提交时间</dt>
              <dd>{new Date((latestRecord as Pick<Checkin, "created_at">).created_at).toLocaleString("zh-CN")}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">添加第一条运动记录后，这里会显示最近一次训练。</p>
        )}
      </section>

      <section className="info-card rich-card">
        <div className="panel-title-row">
          <div>
            <p className="eyebrow">绑定监督</p>
            <h2>{partner ? partner.username : "还没有绑定监督对象"}</h2>
          </div>
          <UsersRound size={22} aria-hidden="true" />
        </div>
        {partner ? (
          <>
            <p className="muted">{partner.email}</p>
            <p className="partner-today">对方今日已记录 {partnerTodayCount} 次运动</p>
            <Link className="secondary-button" href="/partner">
              查看对方记录
            </Link>
          </>
        ) : (
          <>
            <p className="muted">绑定后双方可以互相查看运动记录，方便监督。</p>
            <Link className="secondary-button" href="/bind">
              去绑定
            </Link>
          </>
        )}
      </section>
    </UserShell>
  );
}
