import Link from "next/link";
import { redirect } from "next/navigation";
import { Dumbbell, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { fetchDashboardActivity, type CheckinActivity } from "@/lib/checkins";
import { addDays, calculateStreak, formatDisplayDate, getMonthRange, getTodayDate, getWeekRange } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { getCompletionPercent } from "@/lib/goals";
import { fetchProfileById } from "@/lib/profiles";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { UserShell } from "@/components/UserShell";
import type { Goal, Profile } from "@/types/database";

export default async function DashboardPage() {
  const { user, profile, supabase } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin/dashboard");
  }

  const today = getTodayDate();
  const monthRange = getMonthRange(today);
  const weekRange = getWeekRange(today);
  const activityStartDate = addDays(today, -365);

  const [{ data: activityRows, error: activityError }, { data: goal }] = await Promise.all([
    fetchDashboardActivity(supabase, user.id, activityStartDate, today),
    supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle()
  ]);

  let partner: Profile | null = null;
  let partnerTodayCount = 0;
  let partnerErrorMessage: string | null = null;
  if (profile.bound_user_id) {
    const [{ data, error: partnerProfileError }, { count, error: partnerCountError }] = await Promise.all([
      fetchProfileById(supabase, profile.bound_user_id),
      supabase
        .from("checkins")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.bound_user_id)
        .eq("checkin_date", today)
    ]);
    partner = data as Profile | null;
    partnerTodayCount = count || 0;
    partnerErrorMessage = getFriendlySupabaseError(partnerProfileError || partnerCountError);
  }

  const activity = (activityRows || []) as CheckinActivity[];
  const activityErrorMessage = getFriendlySupabaseError(activityError);
  const pageErrorMessage = activityErrorMessage || partnerErrorMessage;
  const todayRecords = activity.filter((record) => record.checkin_date === today);
  const weekRecords = activity.filter((record) => record.checkin_date >= weekRange.start && record.checkin_date <= weekRange.end);
  const monthRecords = activity.filter((record) => record.checkin_date >= monthRange.start && record.checkin_date <= monthRange.end);
  const latestRecord = activity[0] || null;
  const goalRecord = goal as Goal | null;
  const streak = calculateStreak(activity.map((row) => row.checkin_date), today);
  const todayCount = todayRecords?.length || 0;
  const todayDuration = (todayRecords || []).reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const monthCount = monthRecords.length;
  const todaySummary = todayCount
    ? `今日已记录 ${todayCount} 次运动，累计 ${todayDuration} 分钟`
    : "今日还没有运动记录";
  const weekGoalPercent = getCompletionPercent(weekRecords.length, goalRecord?.weekly_workout_target);
  const dayGoalPercent = getCompletionPercent(todayDuration, goalRecord?.daily_minutes_target);
  const latestWeight = activity.find((record) => record.weight !== null)?.weight ?? goalRecord?.current_weight ?? null;
  const targetWeightGap = latestWeight !== null && goalRecord?.target_weight !== null && goalRecord?.target_weight !== undefined
    ? Number((Number(latestWeight) - Number(goalRecord.target_weight)).toFixed(1))
    : null;

  return (
    <UserShell profile={profile} hideHeader>
      {pageErrorMessage ? <p className="alert error">{pageErrorMessage}</p> : null}

      <section className="welcome-card">
        <div>
          <h2>你好，{profile.username}</h2>
          <p>今天也要动一动</p>
        </div>
        <ProfileAvatar profile={profile} size="lg" />
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
            <p className="eyebrow">目标摘要</p>
            <h2>{goalRecord ? "本周目标完成度" : "还没有设置健身目标"}</h2>
          </div>
          <Link className="secondary-button compact" href="/goals">
            {goalRecord ? "编辑目标" : "设置目标"}
          </Link>
        </div>
        {goalRecord ? (
          <div className="progress-list">
            <div>
              <span>本周目标完成度：已完成 {weekRecords.length} / {goalRecord.weekly_workout_target || 0} 次</span>
              <div className="progress-track"><span style={{ width: `${weekGoalPercent}%` }} /></div>
            </div>
            <div>
              <span>今日目标完成度：已完成 {todayDuration} / {goalRecord.daily_minutes_target || 0} 分钟</span>
              <div className="progress-track"><span style={{ width: `${dayGoalPercent}%` }} /></div>
            </div>
            <div>
              <span>目标体重进度：{targetWeightGap === null ? "体重数据不足" : `距离目标 ${Math.abs(targetWeightGap)} kg`}</span>
              <div className="progress-track"><span style={{ width: targetWeightGap === null ? "0%" : "65%" }} /></div>
            </div>
          </div>
        ) : (
          <p className="muted">设置目标后，首页会展示本周、今日和目标体重进度。</p>
        )}
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
              <dd>{new Date(latestRecord.created_at).toLocaleString("zh-CN")}</dd>
            </div>
          </dl>
        ) : (
          <p className="muted">添加第一条运动记录后，这里会显示最近一次训练。</p>
        )}
      </section>

      <section className="info-card rich-card">
        <div className="panel-title-row">
          <div className="inline-profile-heading">
            {partner ? <ProfileAvatar profile={partner} size="sm" /> : null}
            <div>
              <p className="eyebrow">绑定监督</p>
              <h2>{partner ? partner.username : "还没有绑定监督对象"}</h2>
            </div>
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
