import { redirect } from "next/navigation";
import { saveGoal } from "@/app/goals/actions";
import { requireUser } from "@/lib/auth";
import { getTodayDate, getWeekRange } from "@/lib/dates";
import { getCompletionPercent, getWeightGap, formatGoalNumber } from "@/lib/goals";
import { SubmitButton } from "@/components/SubmitButton";
import { UserShell } from "@/components/UserShell";
import type { Goal } from "@/types/database";

type GoalsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GoalsPage({ searchParams }: GoalsPageProps) {
  const { user, profile, supabase } = await requireUser();
  const params = searchParams ? await searchParams : {};

  if (profile.role === "admin") {
    redirect("/admin");
  }

  const today = getTodayDate();
  const weekRange = getWeekRange(today);
  const [{ data: goal }, { data: weekRecords }, { data: todayRecords }] = await Promise.all([
    supabase.from("goals").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("checkins").select("id").eq("user_id", user.id).gte("checkin_date", weekRange.start).lte("checkin_date", weekRange.end),
    supabase.from("checkins").select("duration_minutes").eq("user_id", user.id).eq("checkin_date", today)
  ]);

  const currentGoal = goal as Goal | null;
  const weekDone = weekRecords?.length || 0;
  const todayMinutes = (todayRecords || []).reduce((total, record) => total + (record.duration_minutes || 0), 0);
  const weightGap = getWeightGap(currentGoal);
  const weekPercent = getCompletionPercent(weekDone, currentGoal?.weekly_workout_target);
  const dayPercent = getCompletionPercent(todayMinutes, currentGoal?.daily_minutes_target);

  return (
    <UserShell profile={profile} title="健身目标" subtitle="设置你的阶段目标" showBackButton>
      {params.saved ? <p className="alert success">健身目标已保存。</p> : null}
      {typeof params.error === "string" ? <p className="alert error">{params.error}</p> : null}

      <section className="info-card rich-card">
        <p className="eyebrow">目标概览</p>
        <h2>{currentGoal ? "当前健身目标" : "还没有设置健身目标"}</h2>
        {currentGoal ? (
          <>
            <div className="metric-grid">
              <article className="mini-stat">
                <span>当前体重</span>
                <strong>{formatGoalNumber(currentGoal.current_weight, " kg")}</strong>
              </article>
              <article className="mini-stat">
                <span>目标体重</span>
                <strong>{formatGoalNumber(currentGoal.target_weight, " kg")}</strong>
              </article>
              <article className="mini-stat">
                <span>距离目标</span>
                <strong>{weightGap === null ? "未设置" : `${Math.abs(weightGap)} kg`}</strong>
              </article>
              <article className="mini-stat">
                <span>截止日期</span>
                <strong>{currentGoal.target_date || "未设置"}</strong>
              </article>
            </div>
            <div className="progress-list">
              <div>
                <span>每周运动目标完成度：已完成 {weekDone} / {currentGoal.weekly_workout_target || 0} 次</span>
                <div className="progress-track"><span style={{ width: `${weekPercent}%` }} /></div>
              </div>
              <div>
                <span>每日运动分钟目标完成度：已完成 {todayMinutes} / {currentGoal.daily_minutes_target || 0} 分钟</span>
                <div className="progress-track"><span style={{ width: `${dayPercent}%` }} /></div>
              </div>
            </div>
            {currentGoal.goal_note ? <p className="muted">{currentGoal.goal_note}</p> : null}
          </>
        ) : (
          <p className="muted">设置后，首页会显示本周目标、今日目标和目标体重进度。</p>
        )}
      </section>

      <form action={saveGoal} className="checkin-form-stack">
        <section className="form-card form-section">
          <div className="section-heading">
            <p className="eyebrow">{currentGoal ? "编辑目标" : "设置目标"}</p>
            <h2>目标信息</h2>
          </div>
          <div className="form-grid two">
            <label>当前体重（kg）<input defaultValue={currentGoal?.current_weight ?? ""} inputMode="decimal" name="current_weight" step="0.1" type="number" /></label>
            <label>目标体重（kg）<input defaultValue={currentGoal?.target_weight ?? ""} inputMode="decimal" name="target_weight" step="0.1" type="number" /></label>
            <label>每周运动次数目标<input defaultValue={currentGoal?.weekly_workout_target ?? ""} inputMode="numeric" name="weekly_workout_target" type="number" /></label>
            <label>每日运动分钟目标<input defaultValue={currentGoal?.daily_minutes_target ?? ""} inputMode="numeric" name="daily_minutes_target" type="number" /></label>
            <label>目标截止日期<input defaultValue={currentGoal?.target_date ?? ""} name="target_date" type="date" /></label>
          </div>
          <label>目标备注<textarea defaultValue={currentGoal?.goal_note ?? ""} name="goal_note" placeholder="写下目标原因或阶段计划" rows={4} /></label>
        </section>
        <section className="submit-panel">
          <SubmitButton pendingText="保存中...">{currentGoal ? "保存目标" : "设置目标"}</SubmitButton>
        </section>
      </form>
    </UserShell>
  );
}
