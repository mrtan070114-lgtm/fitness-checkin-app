import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarDays, Dumbbell, Target, Timer, TrendingUp, UsersRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { fetchDashboardActivity, type CheckinActivity } from "@/lib/checkins";
import { addDays, calculateStreak, formatDisplayDate, getMonthRange, getTodayDate, getWeekRange } from "@/lib/dates";
import { getFriendlySupabaseError } from "@/lib/errors";
import { formatGoalNumber, formatWeightGoalStatus, getCompletionPercent } from "@/lib/goals";
import { fetchProfileById } from "@/lib/profiles";
import { ProfileAvatar } from "@/components/ProfileAvatar";
import { UserShell } from "@/components/UserShell";
import type { Goal, Profile } from "@/types/database";

function formatWeekday(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);
  const weekday = new Date(year, month - 1, day).getDay();
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][weekday];
}

export default async function DashboardPage() {
  const { user, profile, supabase } = await requireUser();

  if (profile.role === "admin") {
    redirect("/admin");
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
  const todayActionLabel = todayCount ? "再添加一次" : "添加第一条";
  const weekGoalPercent = getCompletionPercent(weekRecords.length, goalRecord?.weekly_workout_target);
  const dayGoalPercent = getCompletionPercent(todayDuration, goalRecord?.daily_minutes_target);
  const todayTargetMinutes = goalRecord?.daily_minutes_target || 0;
  const todayProgressLabel = todayTargetMinutes ? `${Math.min(todayDuration, todayTargetMinutes)} / ${todayTargetMinutes}` : `${todayDuration}`;
  const targetWeightStatus = formatWeightGoalStatus(goalRecord);

  return (
    <UserShell profile={profile} hideHeader>
      {pageErrorMessage ? <p className="alert error">{pageErrorMessage}</p> : null}

      <section className="dashboard-hero">
        <div className="dashboard-hero-top">
          <div>
            <p className="dashboard-date">{formatDisplayDate(today)} · {formatWeekday(today)}</p>
            <h1>你好，{profile.username}</h1>
            <p>今天也要动一动</p>
          </div>
          <ProfileAvatar profile={profile} size="lg" />
        </div>

        <div className="dashboard-hero-status" aria-label="今日运动状态">
          <div>
            <span>今日运动</span>
            <strong>{todayCount} 次</strong>
          </div>
          <div>
            <span>累计时长</span>
            <strong>{todayDuration} 分钟</strong>
          </div>
          <div>
            <span>连续天数</span>
            <strong>{streak} 天</strong>
          </div>
        </div>
      </section>

      <section className="today-focus-card">
        <div className="today-focus-copy">
          <p className="eyebrow">今日计划</p>
          <h2>{todayCount ? "保持节奏，继续记录" : "从一次运动开始"}</h2>
          <p>{todaySummary}</p>
        </div>

        <div className="today-progress-row">
          <div
            className="today-progress-ring"
            style={{
              background: `conic-gradient(var(--color-button-bg) ${dayGoalPercent}%, rgba(255, 255, 255, 0.36) 0)`
            }}
            aria-label={`今日目标完成度 ${dayGoalPercent}%`}
          >
            <div>
              <strong>{dayGoalPercent}%</strong>
              <span>目标</span>
            </div>
          </div>
          <div>
            <span>今日分钟</span>
            <strong>{todayProgressLabel}</strong>
            <small>{todayTargetMinutes ? "分钟目标" : "暂无分钟目标"}</small>
          </div>
        </div>

        <Link className="primary-button dashboard-action-button" href="/checkin">
          <Dumbbell size={18} aria-hidden="true" />
          {todayActionLabel}
        </Link>
      </section>

      <section className="dashboard-metrics" aria-label="运动数据概览">
        <article>
          <CalendarDays size={18} aria-hidden="true" />
          <span>今日次数</span>
          <strong>{todayCount} 次</strong>
        </article>
        <article>
          <Timer size={18} aria-hidden="true" />
          <span>今日时长</span>
          <strong>{todayDuration} 分钟</strong>
        </article>
        <article>
          <TrendingUp size={18} aria-hidden="true" />
          <span>连续运动</span>
          <strong>{streak} 天</strong>
        </article>
        <article>
          <Dumbbell size={18} aria-hidden="true" />
          <span>本月记录</span>
          <strong>{monthCount || 0} 次</strong>
        </article>
      </section>

      <section className="dashboard-panel dashboard-goal-panel">
        <div className="dashboard-panel-heading">
          <div>
            <p className="eyebrow">目标摘要</p>
            <h2>{goalRecord ? "本周正在推进" : "还没有设置健身目标"}</h2>
          </div>
          <Link className="dashboard-text-link" href="/goals">
            {goalRecord ? "编辑目标" : "设置目标"}
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {goalRecord ? (
          <div className="dashboard-goal-grid">
            <div className="goal-progress-item">
              <div>
                <span>本周次数</span>
                <strong>{weekRecords.length} / {goalRecord.weekly_workout_target || 0} 次</strong>
              </div>
              <div className="progress-track"><span style={{ width: `${weekGoalPercent}%` }} /></div>
            </div>
            <div className="goal-progress-item">
              <div>
                <span>今日时长</span>
                <strong>{todayDuration} / {goalRecord.daily_minutes_target || 0} 分钟</strong>
              </div>
              <div className="progress-track"><span style={{ width: `${dayGoalPercent}%` }} /></div>
            </div>
            <div className="goal-weight-pill">
              <Target size={18} aria-hidden="true" />
              <div className="goal-weight-copy">
                <span>目标体重</span>
                <strong>{targetWeightStatus}</strong>
                <small>
                  当前体重：{formatGoalNumber(goalRecord.current_weight, " kg")} · 目标体重：{formatGoalNumber(goalRecord.target_weight, " kg")}
                </small>
              </div>
            </div>
          </div>
        ) : (
          <div className="dashboard-empty-row">
            <Target size={24} aria-hidden="true" />
            <p>设置目标后，首页会展示本周、今日和目标体重进度。</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-heading">
          <div>
            <p className="eyebrow">最近一次运动</p>
            <h2>{latestRecord ? latestRecord.session_title || "未命名运动" : "暂无运动记录"}</h2>
          </div>
          <Dumbbell size={22} aria-hidden="true" />
        </div>
        {latestRecord ? (
          <dl className="latest-workout-grid">
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
          <div className="dashboard-empty-row">
            <Dumbbell size={24} aria-hidden="true" />
            <p>添加第一条运动记录后，这里会显示最近一次训练。</p>
          </div>
        )}
      </section>

      <section className="dashboard-panel partner-dashboard-panel">
        <div className="dashboard-panel-heading">
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
            <div className="partner-status-strip">
              <span>对方今日</span>
              <strong>{partnerTodayCount} 次运动</strong>
            </div>
            <Link className="secondary-button dashboard-secondary-action" href="/partner">
              查看对方记录
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </>
        ) : (
          <>
            <p className="muted">绑定后双方可以互相查看运动记录，方便监督。</p>
            <Link className="secondary-button dashboard-secondary-action" href="/bind">
              去绑定
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </>
        )}
      </section>
    </UserShell>
  );
}
